/**
 * Samadhan Setu — Outcome Verification Store
 *
 * Lightweight localStorage store enabling Government to verify solution outcomes
 * at the final lifecycle stage (Adopted).
 *
 * Stored under: samadhan_outcomes
 * Dispatches:   samadhan_outcomes_updated
 */

export const OUTCOMES_KEY = 'samadhan_outcomes';
export const OUTCOMES_UPDATED_EVENT = 'samadhan_outcomes_updated';

/**
 * Read all outcomes from localStorage.
 *
 * @returns {Record<string, Object>} Map of challengeId -> outcome record
 */
export function getAllOutcomes() {
  try {
    const raw = localStorage.getItem(OUTCOMES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch (err) {
    console.warn('[outcomeStore] Failed to read outcomes from storage:', err);
    return {};
  }
}

/**
 * Get the outcome record for a specific challenge.
 *
 * @param {string} challengeId
 * @returns {Object|null}
 */
export function getOutcomeForChallenge(challengeId) {
  if (!challengeId) return null;
  const all = getAllOutcomes();
  return all[challengeId] || null;
}

/**
 * Check whether a challenge outcome has been verified by Government.
 *
 * @param {string} challengeId
 * @returns {boolean}
 */
export function isOutcomeVerified(challengeId) {
  const outcome = getOutcomeForChallenge(challengeId);
  return outcome?.status === 'verified';
}

/**
 * Record Government verification for a challenge outcome.
 *
 * @param {Object} params
 * @param {string} params.challengeId
 * @param {string} [params.summary]
 * @returns {Object} The saved outcome record
 */
export function verifyChallengeOutcome({ challengeId, summary }) {
  if (!challengeId) {
    throw new Error('challengeId is required to verify outcome.');
  }

  const all = getAllOutcomes();
  const record = {
    challengeId,
    status: 'verified',
    verifiedByRole: 'government',
    verifiedAt: new Date().toISOString(),
    summary:
      summary ||
      'Government has verified the reported outcome for this prototype challenge.',
  };

  all[challengeId] = record;

  try {
    localStorage.setItem(OUTCOMES_KEY, JSON.stringify(all));
    window.dispatchEvent(
      new CustomEvent(OUTCOMES_UPDATED_EVENT, { detail: record })
    );
  } catch (err) {
    console.error('[outcomeStore] Failed to save verified outcome:', err);
  }

  return record;
}
