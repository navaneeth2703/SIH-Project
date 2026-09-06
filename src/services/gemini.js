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
async function callGeminiEndpoint(modelName, apiKey, requestBody) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

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
    const error = new Error(`Network error while contacting Gemini API (${modelName}): ${netErr.message}`);
    error.code = 'NETWORK_ERROR';
    error.model = modelName;
    throw error;
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    const error = new Error(`Gemini API error from ${modelName} (${response.status}): ${errorDetail}`);
    error.code = `HTTP_${response.status}`;
    error.status = response.status;
    error.model = modelName;
    error.detail = errorDetail;
    throw error;
  }

  const responseData = await response.json();

  // Extract JSON payload from candidate
  const candidateText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    const error = new Error(`Gemini API (${modelName}) returned an empty or invalid response structure.`);
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
    const error = new Error(`Failed to parse Gemini JSON output from ${modelName}: ${parseErr.message}`);
    error.code = 'PARSE_ERROR';
    error.model = modelName;
    throw error;
  }
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

  // Attempt 1: Call Primary Model (gemini-3.6-flash)
  try {
    return await callGeminiEndpoint(PRIMARY_GEMINI_MODEL, apiKey, requestBody);
  } catch (primaryErr) {
    // Check if error is transient demand spike (503) or rate limit (429)
    const isTransientError = primaryErr.status === 503 || primaryErr.status === 429;
    if (isTransientError) {
      console.warn(
        `Primary model (${PRIMARY_GEMINI_MODEL}) returned HTTP ${primaryErr.status} (${primaryErr.detail || primaryErr.message}). Gracefully failing over to ${FALLBACK_GEMINI_MODEL}...`
      );

      // Attempt 2: Failover to Fallback Model (gemini-3.5-flash)
      try {
        return await callGeminiEndpoint(FALLBACK_GEMINI_MODEL, apiKey, requestBody);
      } catch (fallbackErr) {
        console.error(`Fallback model (${FALLBACK_GEMINI_MODEL}) also failed:`, fallbackErr);
        const combinedError = new Error(
          `AI Analysis temporarily unavailable: Primary model (${PRIMARY_GEMINI_MODEL}) encountered HTTP ${primaryErr.status} and fallback model (${FALLBACK_GEMINI_MODEL}) encountered HTTP ${fallbackErr.status || fallbackErr.message}. Please try again shortly.`
        );
        combinedError.code = 'ALL_MODELS_FAILED';
        combinedError.primaryError = primaryErr;
        combinedError.fallbackError = fallbackErr;
        throw combinedError;
      }
    }

    // Non-transient errors (e.g. 400 Bad Request, 401 Unauthorized, 403 Forbidden) fail immediately
    throw primaryErr;
  }
}
