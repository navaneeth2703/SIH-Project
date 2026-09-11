/**
 * Samadhan Setu — Groq AI Problem Analysis Service
 * Uses Groq REST API with strict Structured Outputs JSON Schema.
 */

const getEnvVar = (name) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[name];
    }
  } catch {
    // fallback
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name];
    }
  } catch {
    // fallback
  }
  return undefined;
};

export function getGroqApiKey() {
  return getEnvVar('VITE_GROQ_API_KEY');
}

export function isGroqConfigured() {
  const key = getGroqApiKey();
  return Boolean(key && key.trim().length > 0);
}

export const GROQ_MODEL = 'openai/gpt-oss-20b';

/**
 * Sanitize error messages and strings so no API keys or Bearer tokens are leaked
 */
export function sanitizeErrorMessage(message, apiKey) {
  if (!message || typeof message !== 'string') return '';
  let sanitized = message;
  if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
    sanitized = sanitized.replaceAll(apiKey.trim(), '[REDACTED_API_KEY]');
  }
  // Sanitize Authorization Bearer headers
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9_\-.]+/gi, 'Bearer [REDACTED_API_KEY]');
  // Sanitize standard Groq API key pattern (gsk_...)
  sanitized = sanitized.replace(/gsk_[0-9A-Za-z_-]{20,}/g, '[REDACTED_API_KEY]');
  return sanitized;
}

// ─── Allowed domain classifications ──────────────────────────────────────────
const ALLOWED_CLASSIFICATIONS = [
  'Water & Environment',
  'Traffic & Transport',
  'Public Health & Sanitation',
  'Agriculture & Irrigation',
  'Civic Infrastructure',
  'Education & Skill Development',
  'Energy & Power',
  'Waste Management',
  'Disaster Management',
  'Digital Inclusion',
];

const ALLOWED_SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'];

/**
 * Normalize primaryClassification to a canonical domain label.
 * Handles common LLM variations (e.g. "Traffic and Transportation" → "Traffic & Transport").
 */
function normalizeClassification(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const val = raw.trim();

  // Exact match first
  for (const allowed of ALLOWED_CLASSIFICATIONS) {
    if (val.toLowerCase() === allowed.toLowerCase()) return allowed;
  }

  // Traffic & Transport variants
  if (/^traffic\s*(?:&|and)\s*transport(?:ation)?$/i.test(val)) return 'Traffic & Transport';
  if (/transport(?:ation)?\s*(?:&|and)\s*traffic/i.test(val)) return 'Traffic & Transport';
  if (/road\s*(?:&|and)\s*transport/i.test(val)) return 'Traffic & Transport';

  // Water & Environment variants
  if (/water\s*(?:&|and)\s*env/i.test(val)) return 'Water & Environment';
  if (/env\w*\s*(?:&|and)\s*water/i.test(val)) return 'Water & Environment';
  if (/groundwater/i.test(val) || /water\s*quality/i.test(val)) return 'Water & Environment';

  // Public Health & Sanitation variants
  if (/public\s*health/i.test(val)) return 'Public Health & Sanitation';
  if (/health\s*(?:&|and)\s*sanit/i.test(val)) return 'Public Health & Sanitation';
  if (/sanit\w*\s*(?:&|and)\s*health/i.test(val)) return 'Public Health & Sanitation';

  // Agriculture & Irrigation variants
  if (/agri\w*\s*(?:&|and)\s*irrig/i.test(val)) return 'Agriculture & Irrigation';
  if (/irrig\w*\s*(?:&|and)\s*agri/i.test(val)) return 'Agriculture & Irrigation';
  if (/farming/i.test(val) && /irrig/i.test(val)) return 'Agriculture & Irrigation';

  // Civic Infrastructure variants
  if (/civic\s*infra/i.test(val)) return 'Civic Infrastructure';
  if (/infrastructure/i.test(val) && /civic|urban|municipal/i.test(val)) return 'Civic Infrastructure';

  // Waste Management variants
  if (/waste\s*(?:management|disposal|handling)/i.test(val)) return 'Waste Management';

  // Energy & Power
  if (/energy\s*(?:&|and)\s*power/i.test(val) || /power\s*(?:&|and)\s*energy/i.test(val)) return 'Energy & Power';

  // Closest partial match (starts-with)
  for (const allowed of ALLOWED_CLASSIFICATIONS) {
    if (allowed.toLowerCase().startsWith(val.toLowerCase().substring(0, 6))) return allowed;
  }

  // Return original trimmed value if no match — will be preserved as-is
  return val;
}

/**
 * Normalize severity to exactly HIGH | MEDIUM | LOW.
 */
function normalizeSeverity(raw) {
  if (!raw || typeof raw !== 'string') return 'MEDIUM';
  const upper = raw.trim().toUpperCase();
  if (ALLOWED_SEVERITIES.includes(upper)) return upper;
  // Handle variants like "High Risk", "Medium Priority", etc.
  if (/^HIGH/i.test(upper)) return 'HIGH';
  if (/^LOW/i.test(upper)) return 'LOW';
  return 'MEDIUM'; // safe fallback
}

/**
 * Shared post-AI result validation and normalization.
 * Applied after every AI provider call to guarantee clean output.
 */
export function validateAndNormalizeAiResult(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned non-object result; cannot normalize.');
  }

  // Normalize classification
  const rawClass = parsed.primaryClassification;
  parsed.primaryClassification = normalizeClassification(rawClass) || rawClass || 'Civic Infrastructure';

  // Normalize severity
  parsed.severity = normalizeSeverity(parsed.severity);

  // Normalize confidence to 1 decimal place, clamped to 70–99.9
  if (typeof parsed.confidence === 'number') {
    if (parsed.confidence <= 1) {
      parsed.confidence = parseFloat((parsed.confidence * 100).toFixed(1));
    } else {
      parsed.confidence = parseFloat(parsed.confidence.toFixed(1));
    }
    parsed.confidence = Math.min(99.9, Math.max(70.0, parsed.confidence));
  } else {
    parsed.confidence = 80.0;
  }

  // Ensure arrays
  parsed.requiredExpertise = Array.isArray(parsed.requiredExpertise) ? parsed.requiredExpertise : [];
  parsed.extractedKeywords = Array.isArray(parsed.extractedKeywords) ? parsed.extractedKeywords : [];
  parsed.rootCauses = Array.isArray(parsed.rootCauses) ? parsed.rootCauses : [];

  // Ensure reasoning string
  if (!parsed.reasoning || typeof parsed.reasoning !== 'string') {
    parsed.reasoning = 'AI classification based on the submitted problem description and contextual signals.';
  }

  // Ensure severityRationale string (new field)
  if (!parsed.severityRationale || typeof parsed.severityRationale !== 'string' || parsed.severityRationale.trim() === '') {
    // Generate a minimal fallback from reasoning or severity
    const sev = parsed.severity;
    parsed.severityRationale = `Assigned ${sev} severity based on the population impact, health/safety signals, and contextual factors described in the problem.`;
  }

  return parsed;
}

// ─── Severity Rubric for System Prompt ───────────────────────────────────────
const SEVERITY_RUBRIC = `
SEVERITY DECISION CRITERIA — Read carefully and apply based on the COMPLETE context, not individual keywords:

HIGH — Assign when the problem involves ANY of the following:
  • Immediate or substantial threat to human health, drinking water safety, or physical safety
  • Chemical, biological, or industrial contamination with public or environmental exposure (e.g. discoloration, odor, chemical runoff, heavy metals, mining effluent in groundwater or waterways)
  • Critical infrastructure or essential service failure (drinking water supply, sanitation, drainage)
  • Large number of people affected (village-scale or above), especially vulnerable populations (children, elderly, agricultural communities dependent on water)
  • Environmental emergency or risk of irreversible environmental damage
  • Mining, industrial, or agricultural contamination entering the food chain, water supply, or soil

MEDIUM — Assign when the problem involves:
  • Meaningful community-wide impact but no clear immediate severe health or safety risk
  • Recurring civic infrastructure or service problem (traffic congestion, intermittent power, drainage issues, road deterioration)
  • Substantial economic or livelihood impact without acute hazard
  • Transport, access, or mobility disruption affecting a significant number of people
  • Agricultural yield or irrigation reliability issues without confirmed contamination

LOW — Assign when the problem involves:
  • Minor local inconvenience with a small or limited affected population
  • Non-urgent cosmetic, maintenance, or minor amenity issue
  • Improvement or enhancement request with no immediate risk to health, safety, or essential services
  • Isolated, localized issue with no scaling risk

CRITICAL INSTRUCTION:
Do NOT classify severity based on a single keyword alone.
Consider the COMPLETE description: location, affected population, described symptoms, implied severity signals (odor, discoloration, illness indicators, contamination signals, service failure severity, urgency language), and the broader context.
Example: A "water" problem involving contamination from a mining belt near a populated area and affecting drinking water → HIGH.
Example: A "water" problem involving a leaking tap at a park → LOW.
Example: A traffic congestion problem affecting thousands of daily commuters → MEDIUM.`;

const GROQ_STRUCTURED_RESPONSE_SCHEMA = {
  name: 'civic_challenge_analysis',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      primaryClassification: {
        type: 'string',
        description:
          'The standardized civic problem domain label. Use exactly one of: "Water & Environment", "Traffic & Transport", "Public Health & Sanitation", "Agriculture & Irrigation", "Civic Infrastructure", "Energy & Power", "Waste Management", "Disaster Management", "Education & Skill Development", "Digital Inclusion". For traffic congestion, road safety, public transportation, pedestrian mobility, parking, intersections, buses, return exactly "Traffic & Transport".',
      },
      severity: {
        type: 'string',
        enum: ['HIGH', 'MEDIUM', 'LOW'],
        description:
          'Severity level determined by applying the SEVERITY DECISION CRITERIA from the system prompt. Must be one of HIGH, MEDIUM, or LOW. Consider the complete context — not individual keywords.',
      },
      severityRationale: {
        type: 'string',
        description:
          'A single concise sentence (max 30 words) explaining the key reason why this specific severity was assigned. This is shown directly to users. Example: "Potential exposure to contaminated groundwater near a mining area creates an immediate public-health risk for multiple villages."',
      },
      confidence: {
        type: 'number',
        description:
          'Confidence percentage of the classification between 70.0 and 99.9 based on text signals.',
      },
      requiredExpertise: {
        type: 'array',
        items: { type: 'string' },
        description:
          '3 to 5 academic, scientific, or technical disciplines required to solve this problem.',
      },
      extractedKeywords: {
        type: 'array',
        items: { type: 'string' },
        description:
          '4 to 6 critical search and indexing keywords extracted directly from the problem context.',
      },
      rootCauses: {
        type: 'array',
        items: { type: 'string' },
        description:
          '3 to 4 identified or suspected root cause operational or physical failure signals.',
      },
      reasoning: {
        type: 'string',
        description:
          'A clear, transparent explanation (2-3 sentences) detailing why this problem was categorized this way, which specific signals drove the classification, and what evidence in the citizen description justifies the severity assessment.',
      },
    },
    required: [
      'primaryClassification',
      'severity',
      'severityRationale',
      'confidence',
      'requiredExpertise',
      'extractedKeywords',
      'rootCauses',
      'reasoning',
    ],
    additionalProperties: false,
  },
};

/**
 * Analyze a submitted citizen challenge using Groq REST API with strict Structured Outputs schema
 * @param {Object} problem
 * @param {string} problem.title
 * @param {string} problem.description
 * @param {string} problem.location
 * @param {string} [problem.category]
 * @returns {Promise<Object>} Structured analysis result
 */
export async function analyzeChallengeWithGroq(problem) {
  const apiKey = getGroqApiKey();
  if (!apiKey || apiKey.trim().length === 0) {
    const error = new Error(
      'Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env.local file to enable live AI analysis.'
    );
    error.code = 'CONFIG_MISSING';
    throw error;
  }

  const trimmedKey = apiKey.trim();

  const systemPrompt = `You are the Lead GovTech AI Triage Specialist for "Samadhan Setu" (Smart India Hackathon SIH26043).
Your job is to objectively analyze citizen-reported societal challenges and extract structured technical taxonomy so the system can match the problem with suitable university researchers and industry partners.
${SEVERITY_RUBRIC}

Instructions:
1. Determine the primary domain classification from the allowed list. Use exactly one of: "Water & Environment", "Traffic & Transport", "Public Health & Sanitation", "Agriculture & Irrigation", "Civic Infrastructure", "Energy & Power", "Waste Management", "Disaster Management", "Education & Skill Development", "Digital Inclusion".
2. Apply the SEVERITY DECISION CRITERIA above carefully. Assess severity (HIGH, MEDIUM, LOW) considering the FULL context — location, affected population, health/safety implications, contamination signals, infrastructure failure, urgency. Do NOT rely on single keywords.
3. Write a severityRationale: one concise sentence (max 30 words) explaining the primary reason for this specific severity assignment. This is shown to users — be clear and factual.
4. List 3 to 5 precise scientific/engineering expertise fields needed in requiredExpertise.
5. Extract 4 to 6 key semantic keywords in extractedKeywords.
6. Identify 3 to 4 plausible root causes or operational signals in rootCauses.
7. Provide transparent, explainable reasoning (2-3 sentences) describing why this classification and severity was chosen, referencing the specific evidence in the description.
8. Return strictly valid JSON adhering to the specified schema.`;

  const userPrompt = `Analyze this citizen report:
- Problem Title: "${problem.title || 'Untitled'}"
- Reported Location: "${problem.location || 'Unspecified'}"
- Citizen-selected Category: "${problem.category || 'General'}"
- Problem Description: "${problem.description || ''}"`;

  const requestBody = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: GROQ_STRUCTURED_RESPONSE_SCHEMA,
    },
    temperature: 0.0,
  };

  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (netErr) {
    const sanitizedMsg = sanitizeErrorMessage(netErr?.message, trimmedKey);
    const error = new Error(
      `Network error while contacting Groq API (${GROQ_MODEL}): ${sanitizedMsg}`
    );
    error.code = 'NETWORK_ERROR';
    error.model = GROQ_MODEL;
    throw error;
  }

  if (!response.ok) {
    let errorDetail = '';
    let errJson = null;
    try {
      errJson = await response.json();
      errorDetail = errJson?.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    const sanitizedDetail = sanitizeErrorMessage(errorDetail, trimmedKey);
    const error = new Error(
      `Groq API error from ${GROQ_MODEL} (${response.status}): ${sanitizedDetail}`
    );
    error.code = `HTTP_${response.status}`;
    error.status = response.status;
    error.model = GROQ_MODEL;
    error.detail = sanitizedDetail;
    throw error;
  }

  const responseData = await response.json();
  const rawContent = responseData.choices?.[0]?.message?.content;

  if (!rawContent) {
    const finishReason = responseData.choices?.[0]?.finish_reason;
    const reasonText = finishReason ? ` (Finish reason: ${finishReason})` : '';
    const error = new Error(
      `Groq API (${GROQ_MODEL}) returned an empty or invalid response structure.${reasonText}`
    );
    error.code = 'INVALID_RESPONSE';
    error.model = GROQ_MODEL;
    throw error;
  }

  try {
    const parsed = JSON.parse(rawContent);

    // Apply shared normalization and validation
    const normalized = validateAndNormalizeAiResult(parsed);

    normalized.usedProvider = 'Groq';
    normalized.usedModel = GROQ_MODEL;

    return normalized;
  } catch (parseErr) {
    const sanitizedParse = sanitizeErrorMessage(parseErr?.message, trimmedKey);
    const error = new Error(
      `Failed to parse Groq JSON output from ${GROQ_MODEL}: ${sanitizedParse}`
    );
    error.code = 'PARSE_ERROR';
    error.model = GROQ_MODEL;
    throw error;
  }
}
