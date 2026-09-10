/**
 * Samadhan Setu — Gemini AI Problem Analysis Service
 * Uses Google Gemini 1.5 Flash with structured JSON output schema.
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

const STRUCTURED_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    primaryClassification: {
      type: 'STRING',
      description: 'The standardized civic problem domain label, e.g. Water & Environment, Traffic & Transport, Public Health & Sanitation, Agriculture & Irrigation, Civic Infrastructure, etc.',
    },
    severity: {
      type: 'STRING',
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      description: 'Urgency and community risk level based on population impact, immediate danger, and infrastructure disruption.',
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

    // Normalize confidence to 1 decimal place
    if (parsed.confidence > 1 && parsed.confidence <= 100) {
      parsed.confidence = parseFloat(parsed.confidence.toFixed(1));
    } else if (parsed.confidence <= 1) {
      parsed.confidence = parseFloat((parsed.confidence * 100).toFixed(1));
    }

    parsed.usedModel = modelName;
    return parsed;
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

  const prompt = `
You are the Lead GovTech AI Triage Specialist for "Samadhan Setu" (Smart India Hackathon SIH26043).
Your job is to objectively analyze citizen-reported societal challenges and extract structured technical taxonomy so the system can match the problem with suitable university researchers and industry partners.

Analyze this citizen report:
- Problem Title: "${problem.title || 'Untitled'}"
- Reported Location: "${problem.location || 'Unspecified'}"
- Citizen-selected Category: "${problem.category || 'General'}"
- Problem Description: "${problem.description || ''}"

Instructions:
1. Determine the primary domain classification (e.g. Water & Environment, Traffic & Transport, Public Health & Sanitation, Agriculture & Irrigation, etc.).
2. Assess severity (HIGH, MEDIUM, LOW) based on safety, health, economic impact, or community disruption.
3. List 3 to 5 precise scientific/engineering expertise fields needed.
4. Extract 4 to 6 key semantic keywords.
5. Identify 3 to 4 plausible root causes or operational signals.
6. Provide transparent, explainable reasoning describing why this classification and urgency was chosen. Avoid black-box buzzwords.
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
      temperature: 0.2,
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

