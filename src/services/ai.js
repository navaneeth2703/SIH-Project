/**
 * Samadhan Setu — Unified AI Problem Analysis Service
 * Primary Provider: Groq (openai/gpt-oss-20b)
 * Fallback Provider: Google Gemini (gemini-3.6-flash / gemini-3.5-flash)
 */

import { analyzeChallengeWithGroq } from './groq.js';
import { analyzeChallengeWithGemini } from './gemini.js';

/**
 * Analyze a citizen-submitted challenge with automatic multi-provider resilience.
 * Attempts Groq first. If Groq encounters rate limiting (429), server errors (5xx),
 * network failures, missing configuration, or parsing errors, it gracefully
 * falls back to Gemini.
 *
 * @param {Object} problem
 * @param {string} problem.title
 * @param {string} problem.description
 * @param {string} problem.location
 * @param {string} [problem.category]
 * @returns {Promise<Object>} Structured analysis result with usedProvider & usedModel
 */
export async function analyzeChallenge(problem) {
  let groqError = null;

  // ─── 1. Primary Provider: Groq ────────────────────────────────────────────
  try {
    const groqResult = await analyzeChallengeWithGroq(problem);
    return {
      primaryClassification: groqResult.primaryClassification,
      severity: groqResult.severity,
      severityRationale: groqResult.severityRationale || '',
      confidence: groqResult.confidence,
      requiredExpertise: Array.isArray(groqResult.requiredExpertise)
        ? groqResult.requiredExpertise
        : [],
      extractedKeywords: Array.isArray(groqResult.extractedKeywords)
        ? groqResult.extractedKeywords
        : [],
      rootCauses: Array.isArray(groqResult.rootCauses)
        ? groqResult.rootCauses
        : [],
      reasoning: groqResult.reasoning,
      usedProvider: 'Groq',
      usedModel: groqResult.usedModel || 'openai/gpt-oss-20b',
    };
  } catch (err) {
    groqError = err;
    console.warn(
      `[AI Service] Primary provider (Groq) failed (${err.code || err.status || err.message}). Falling back to Gemini...`
    );
  }

  // ─── 2. Fallback Provider: Gemini ─────────────────────────────────────────
  try {
    const geminiResult = await analyzeChallengeWithGemini(problem);
    return {
      primaryClassification: geminiResult.primaryClassification,
      severity: geminiResult.severity,
      severityRationale: geminiResult.severityRationale || '',
      confidence: geminiResult.confidence,
      requiredExpertise: Array.isArray(geminiResult.requiredExpertise)
        ? geminiResult.requiredExpertise
        : [],
      extractedKeywords: Array.isArray(geminiResult.extractedKeywords)
        ? geminiResult.extractedKeywords
        : [],
      rootCauses: Array.isArray(geminiResult.rootCauses)
        ? geminiResult.rootCauses
        : [],
      reasoning: geminiResult.reasoning,
      usedProvider: 'Gemini',
      usedModel: geminiResult.usedModel || 'gemini-3.6-flash',
    };
  } catch (geminiError) {
    console.error(
      `[AI Service] Fallback provider (Gemini) also failed (${geminiError.code || geminiError.status || geminiError.message}).`
    );

    const isBothConfigMissing =
      groqError?.code === 'CONFIG_MISSING' && geminiError?.code === 'CONFIG_MISSING';

    const errorMessage = isBothConfigMissing
      ? 'No AI provider is configured. Please add VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY to your .env.local file to enable live AI analysis.'
      : `AI Analysis unavailable: Groq primary failed (${groqError?.message || 'unknown error'}) and Gemini fallback failed (${geminiError?.message || 'unknown error'}).`;

    const combinedError = new Error(errorMessage);
    combinedError.code = isBothConfigMissing ? 'CONFIG_MISSING' : 'ALL_PROVIDERS_FAILED';
    combinedError.groqError = groqError;
    combinedError.geminiError = geminiError;
    combinedError.status = geminiError?.status || groqError?.status || 503;
    throw combinedError;
  }
}
