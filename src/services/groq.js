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

const GROQ_STRUCTURED_RESPONSE_SCHEMA = {
  name: 'civic_challenge_analysis',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      primaryClassification: {
        type: 'string',
        description:
          'The standardized civic problem domain label, e.g. Water & Environment, Traffic & Transport, Public Health & Sanitation, Agriculture & Irrigation, Civic Infrastructure. For problems involving traffic congestion, road safety, public transportation, pedestrian mobility, parking, intersections, buses, and transport infrastructure, return exactly "Traffic & Transport".',
      },
      severity: {
        type: 'string',
        enum: ['HIGH', 'MEDIUM', 'LOW'],
        description:
          'Urgency and community risk level based on population impact, immediate danger, and infrastructure disruption.',
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
          'A clear, transparent explanation (2-3 sentences) detailing why this problem was categorized this way and what specific evidence in the citizen description drove the severity assessment.',
      },
    },
    required: [
      'primaryClassification',
      'severity',
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

Instructions:
1. Determine the primary domain classification. Valid classifications include:
   - "Traffic & Transport": defined for problems involving traffic congestion, road safety, public transportation, pedestrian mobility, parking, intersections, buses, and transport infrastructure. Ensure the returned category exactly matches "Traffic & Transport".
   - "Water & Environment"
   - "Public Health & Sanitation"
   - "Agriculture & Irrigation"
   - "Civic Infrastructure"
   (and other standardized civic domains as appropriate).
2. Assess severity (HIGH, MEDIUM, LOW) based on safety, health, economic impact, or community disruption.
3. List 3 to 5 precise scientific/engineering expertise fields needed in requiredExpertise.
4. Extract 4 to 6 key semantic keywords in extractedKeywords.
5. Identify 3 to 4 plausible root causes or operational signals in rootCauses.
6. Provide transparent, explainable reasoning describing why this classification and urgency was chosen. Avoid black-box buzzwords.
7. Return strictly valid JSON adhering to the specified schema.`;

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
    temperature: 0.2,
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

    // Normalize confidence to 1 decimal place
    if (typeof parsed.confidence === 'number') {
      if (parsed.confidence > 1 && parsed.confidence <= 100) {
        parsed.confidence = parseFloat(parsed.confidence.toFixed(1));
      } else if (parsed.confidence <= 1) {
        parsed.confidence = parseFloat((parsed.confidence * 100).toFixed(1));
      }
    }

    // Ensure primaryClassification matches exact matching engine domain for Traffic & Transport
    if (
      typeof parsed.primaryClassification === 'string' &&
      /^\s*traffic\s*(?:&|and)\s*transport(?:ation)?\s*$/i.test(parsed.primaryClassification)
    ) {
      parsed.primaryClassification = 'Traffic & Transport';
    }

    // Ensure array safety
    parsed.requiredExpertise = Array.isArray(parsed.requiredExpertise)
      ? parsed.requiredExpertise
      : [];
    parsed.extractedKeywords = Array.isArray(parsed.extractedKeywords)
      ? parsed.extractedKeywords
      : [];
    parsed.rootCauses = Array.isArray(parsed.rootCauses)
      ? parsed.rootCauses
      : [];

    parsed.usedProvider = 'Groq';
    parsed.usedModel = GROQ_MODEL;

    return parsed;
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
