/**
 * Samadhan Setu — Gemini AI Problem Analysis Service
 * Uses Google Gemini with structured JSON output schema.
 */
import { validateAndNormalizeAiResult } from './groq.js';

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

export function getGeminiApiKey() {
  return getEnvVar('VITE_GEMINI_API_KEY');
}

export const PRIMARY_GEMINI_MODEL = 'gemini-3.6-flash';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.5-flash';
export const GEMINI_MODEL = PRIMARY_GEMINI_MODEL;

/**
 * Retry and Backoff Configuration for Hackathon Prototype
 */
export const RETRY_CONFIG = {
  maxRetriesPerModel: 1, // 1 retry per model (2 attempts max per model, 4 total across failover)
  initialDelayMs: 1500,   // Base backoff 1.5s
  maxDelayMs: 10000,      // Maximum wait per retry 10s
  backoffFactor: 2,       // Exponential multiplier
  jitterMs: 400,          // Random jitter to prevent synchronized retries
  interModelCooldownMs: 1500, // Cooldown before failing over from primary to fallback model
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sanitize error messages and strings so no API keys or key query params are leaked
 */
export function sanitizeErrorMessage(message, apiKey) {
  if (!message || typeof message !== 'string') return '';
  let sanitized = message;
  if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
    sanitized = sanitized.replaceAll(apiKey.trim(), '[REDACTED_API_KEY]');
  }
  // Sanitize key= query parameters in URLs
  sanitized = sanitized.replace(/([?&]key=)[^&\s"']+/gi, '$1[REDACTED_API_KEY]');
  // Sanitize standard Google API key pattern (AIza...)
  sanitized = sanitized.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
  return sanitized;
}

/**
 * Extract retry delay duration in milliseconds from Gemini HTTP response headers or error body
 */
export function extractRetryDelayMs(response, errJson) {
  // 1. Check HTTP 'retry-after' header
  try {
    if (response?.headers) {
      const retryAfter = typeof response.headers.get === 'function'
        ? response.headers.get('retry-after')
        : response.headers['retry-after'] || response.headers['Retry-After'];
      if (retryAfter) {
        const seconds = parseFloat(retryAfter);
        if (!isNaN(seconds) && seconds > 0) {
          return Math.round(seconds * 1000);
        }
        const dateMs = Date.parse(retryAfter);
        if (!isNaN(dateMs)) {
          const diff = dateMs - Date.now();
          if (diff > 0) return diff;
        }
      }
    }
  } catch {
    // Ignore header read issues
  }

  // 2. Check Google RPC RetryInfo in error.details
  if (Array.isArray(errJson?.error?.details)) {
    for (const detail of errJson.error.details) {
      if (detail && (detail['@type']?.includes('RetryInfo') || detail.retryDelay !== undefined)) {
        const delay = detail.retryDelay;
        if (typeof delay === 'string') {
          if (delay.endsWith('ms')) {
            const ms = parseFloat(delay);
            if (!isNaN(ms) && ms > 0) return Math.round(ms);
          } else if (delay.endsWith('s')) {
            const s = parseFloat(delay);
            if (!isNaN(s) && s > 0) return Math.round(s * 1000);
          } else {
            const val = parseFloat(delay);
            if (!isNaN(val) && val > 0) return Math.round(val * 1000);
          }
        } else if (typeof delay === 'number' && delay > 0) {
          return Math.round(delay * 1000);
        } else if (typeof delay === 'object' && delay !== null) {
          const seconds = Number(delay.seconds || 0);
          const nanos = Number(delay.nanos || 0);
          const totalMs = seconds * 1000 + Math.round(nanos / 1e6);
          if (totalMs > 0) return totalMs;
        }
      }
    }
  }

  // 3. Check error message regex patterns (e.g. "Please retry after 15s" or "reset in 12s")
  const msg = errJson?.error?.message || '';
  const match = msg.match(/(?:retry\s+(?:after|in)|reset\s+in)\s+([0-9.]+)\s*(s|sec|seconds|ms)?/i);
  if (match) {
    const val = parseFloat(match[1]);
    const unit = (match[2] || 's').toLowerCase();
    if (!isNaN(val) && val > 0) {
      return unit === 'ms' ? Math.round(val) : Math.round(val * 1000);
    }
  }

  return null;
}

// ─── Severity rubric shared with Gemini prompt ───────────────────────────────
const GEMINI_SEVERITY_RUBRIC = `
SEVERITY DECISION CRITERIA — Read carefully and apply based on the COMPLETE context, not individual keywords:

HIGH — Assign when the problem involves ANY of the following:
  • Immediate or substantial threat to human health, drinking water safety, or physical safety
  • Chemical, biological, or industrial contamination with public or environmental exposure (e.g. discoloration, odor, chemical runoff, heavy metals, mining effluent in groundwater or waterways)
  • Critical infrastructure or essential service failure (drinking water supply, sanitation, drainage)
  • Large number of people affected (village-scale or above), especially vulnerable populations
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

CRITICAL: Do NOT classify severity based on a single keyword alone. Consider the COMPLETE description.`;

const STRUCTURED_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    primaryClassification: {
      type: 'STRING',
      description: 'The standardized civic problem domain label. Use exactly one of: "Water & Environment", "Traffic & Transport", "Public Health & Sanitation", "Agriculture & Irrigation", "Civic Infrastructure", "Energy & Power", "Waste Management", "Disaster Management", "Education & Skill Development", "Digital Inclusion".',
    },
    severity: {
      type: 'STRING',
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      description: 'Severity determined by applying the SEVERITY DECISION CRITERIA. Consider the full problem context — health risk, contamination, affected population, urgency signals. Must be HIGH, MEDIUM, or LOW.',
    },
    severityRationale: {
      type: 'STRING',
      description: 'A single concise sentence (max 30 words) explaining the key reason why this specific severity was assigned. Shown directly to users. Example: "Potential exposure to contaminated groundwater near a mining area creates an immediate public-health risk for multiple villages."',
    },
    confidence: {
      type: 'NUMBER',
      description: 'Confidence percentage of the classification between 70.0 and 99.9 based on text signals.',
    },
    requiredExpertise: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '3 to 5 academic, scientific, or technical disciplines required to solve this problem.',
    },
    extractedKeywords: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '4 to 6 critical search and indexing keywords extracted directly from the problem context.',
    },
    rootCauses: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: '3 to 4 identified or suspected root cause operational or physical failure signals.',
    },
    reasoning: {
      type: 'STRING',
      description: 'A clear, transparent explanation (2-3 sentences) detailing why this problem was categorized this way and what specific evidence in the citizen description drove the severity assessment.',
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
};

/**
 * Helper to call a specific Gemini model endpoint with structured JSON output
 */
export async function callGeminiEndpoint(modelName, apiKey, requestBody) {
  const trimmedKey = (apiKey || '').trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(trimmedKey)}`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (netErr) {
    const sanitizedMsg = sanitizeErrorMessage(netErr?.message, trimmedKey);
    const error = new Error(`Network error while contacting Gemini API (${modelName}): ${sanitizedMsg}`);
    error.code = 'NETWORK_ERROR';
    error.model = modelName;
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
    const retryDelayMs = extractRetryDelayMs(response, errJson);

    const error = new Error(`Gemini API error from ${modelName} (${response.status}): ${sanitizedDetail}`);
    error.code = `HTTP_${response.status}`;
    error.status = response.status;
    error.model = modelName;
    error.detail = sanitizedDetail;
    error.retryDelayMs = retryDelayMs;
    throw error;
  }

  const responseData = await response.json();

  // Extract JSON payload from candidate
  const candidateText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    const finishReason = responseData.candidates?.[0]?.finishReason;
    const reasonText = finishReason ? ` (Finish reason: ${finishReason})` : '';
    const error = new Error(`Gemini API (${modelName}) returned an empty or invalid response structure.${reasonText}`);
    error.code = 'INVALID_RESPONSE';
    error.model = modelName;
    throw error;
  }

  try {
    const parsed = JSON.parse(candidateText);

    // Apply shared normalization and validation (handles confidence, severity, classification, etc.)
    const normalized = validateAndNormalizeAiResult(parsed);

    normalized.usedModel = modelName;
    return normalized;
  } catch (parseErr) {
    const sanitizedParse = sanitizeErrorMessage(parseErr?.message, trimmedKey);
    const error = new Error(`Failed to parse Gemini JSON output from ${modelName}: ${sanitizedParse}`);
    error.code = 'PARSE_ERROR';
    error.model = modelName;
    throw error;
  }
}

/**
 * Execute Gemini model call with exponential backoff and RetryInfo delay handling
 */
export async function callModelWithRetry(modelName, apiKey, requestBody, config = RETRY_CONFIG) {
  const maxRetries = config.maxRetriesPerModel ?? 1;
  const maxAttempts = 1 + maxRetries;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await callGeminiEndpoint(modelName, apiKey, requestBody);
    } catch (err) {
      lastError = err;
      const isTransient = err.status === 429 || err.status === 503;
      const isLastAttempt = attempt >= maxAttempts - 1;

      // Fail immediately on non-transient errors (e.g. 400, 401, 403) or after final attempt
      if (!isTransient || isLastAttempt) {
        throw err;
      }

      const apiDelay = err.retryDelayMs;

      // If the API specified a delay longer than maxDelayMs, do not lock up the client; proceed to failover
      if (apiDelay && apiDelay > config.maxDelayMs) {
        console.warn(
          `[Gemini] ${modelName} returned HTTP ${err.status} with retry-delay ${apiDelay}ms exceeding prototype budget (${config.maxDelayMs}ms). Skipping further retries on ${modelName}.`
        );
        throw err;
      }

      // Calculate exponential backoff or use API-provided delay
      let waitMs;
      if (typeof apiDelay === 'number' && apiDelay > 0) {
        const jitter = Math.floor(Math.random() * (config.jitterMs || 300));
        waitMs = Math.min(apiDelay + jitter, config.maxDelayMs);
      } else {
        const factor = Math.pow(config.backoffFactor || 2, attempt);
        const jitter = Math.floor(Math.random() * (config.jitterMs || 300));
        waitMs = Math.min((config.initialDelayMs || 1500) * factor + jitter, config.maxDelayMs);
      }

      console.warn(
        `[Gemini] ${modelName} returned HTTP ${err.status} (attempt ${attempt + 1}/${maxAttempts}). Backing off for ${waitMs}ms before retry...`
      );

      await sleep(waitMs);
    }
  }

  throw lastError;
}

/**
 * Check if the Gemini API Key is configured
 */
export function isGeminiConfigured() {
  const key = getGeminiApiKey();
  return Boolean(key && key.trim().length > 0);
}

/**
 * Analyze a submitted citizen challenge using Gemini API with automatic graceful failover
 * @param {Object} problem
 * @param {string} problem.title
 * @param {string} problem.description
 * @param {string} problem.location
 * @param {string} [problem.category]
 * @returns {Promise<Object>} Structured analysis result
 */
export async function analyzeChallengeWithGemini(problem) {
  const apiKey = getGeminiApiKey();
  if (!apiKey || apiKey.trim().length === 0) {
    const error = new Error(
      'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file to enable live AI analysis.'
    );
    error.code = 'CONFIG_MISSING';
    throw error;
  }

  const prompt = `You are the Lead GovTech AI Triage Specialist for "Samadhan Setu" (Smart India Hackathon SIH26043).
Your job is to objectively analyze citizen-reported societal challenges and extract structured technical taxonomy so the system can match the problem with suitable university researchers and industry partners.
${GEMINI_SEVERITY_RUBRIC}

Analyze this citizen report:
- Problem Title: "${problem.title || 'Untitled'}"
- Reported Location: "${problem.location || 'Unspecified'}"
- Citizen-selected Category: "${problem.category || 'General'}"
- Problem Description: "${problem.description || ''}"

Instructions:
1. Determine the primary domain classification. Use exactly one of: "Water & Environment", "Traffic & Transport", "Public Health & Sanitation", "Agriculture & Irrigation", "Civic Infrastructure", "Energy & Power", "Waste Management", "Disaster Management", "Education & Skill Development", "Digital Inclusion".
2. Apply the SEVERITY DECISION CRITERIA above. Assess severity (HIGH, MEDIUM, LOW) based on the FULL context — do NOT rely on single keywords.
3. Write a severityRationale: one concise sentence (max 30 words) explaining the primary reason for this specific severity assignment.
4. List 3 to 5 precise scientific/engineering expertise fields needed.
5. Extract 4 to 6 key semantic keywords.
6. Identify 3 to 4 plausible root causes or operational signals.
7. Provide transparent, explainable reasoning (2-3 sentences) describing why this classification and severity was chosen, referencing specific evidence in the description.
`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.0,
      response_mime_type: 'application/json',
      response_schema: STRUCTURED_RESPONSE_SCHEMA,
    },
  };

  // Attempt 1: Call Primary Model with retry & backoff
  try {
    return await callModelWithRetry(PRIMARY_GEMINI_MODEL, apiKey, requestBody, RETRY_CONFIG);
  } catch (primaryErr) {
    const isTransientError = primaryErr.status === 503 || primaryErr.status === 429;
    if (isTransientError) {
      console.warn(
        `Primary model (${PRIMARY_GEMINI_MODEL}) returned HTTP ${primaryErr.status} (${primaryErr.detail || primaryErr.message}). Waiting ${RETRY_CONFIG.interModelCooldownMs}ms cooldown before failing over to ${FALLBACK_GEMINI_MODEL}...`
      );

      // Requirement 5: Do not immediately fire multiple requests against the same quota window
      await sleep(RETRY_CONFIG.interModelCooldownMs);

      // Attempt 2: Failover to Fallback Model with retry & backoff
      try {
        return await callModelWithRetry(FALLBACK_GEMINI_MODEL, apiKey, requestBody, RETRY_CONFIG);
      } catch (fallbackErr) {
        console.error(
          `Fallback model (${FALLBACK_GEMINI_MODEL}) also failed:`,
          sanitizeErrorMessage(fallbackErr.message, apiKey)
        );
        const combinedError = new Error(
          `AI Analysis temporarily unavailable: Primary model (${PRIMARY_GEMINI_MODEL}) encountered HTTP ${primaryErr.status} and fallback model (${FALLBACK_GEMINI_MODEL}) encountered HTTP ${fallbackErr.status || fallbackErr.message}. Rate limit / quota window active. Please try again shortly.`
        );
        combinedError.code = 'ALL_MODELS_FAILED';
        combinedError.status = primaryErr.status || fallbackErr.status || 429;
        combinedError.primaryError = primaryErr;
        combinedError.fallbackError = fallbackErr;
        throw combinedError;
      }
    }

    // Non-transient errors (e.g. 400 Bad Request, 401 Unauthorized, 403 Forbidden) fail immediately
    throw primaryErr;
  }
}

