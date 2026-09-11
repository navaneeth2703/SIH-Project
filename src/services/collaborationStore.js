/**
 * Samadhan Setu — Collaboration Interest Store (Prototype)
 *
 * Stores lightweight "research interest" records expressed by universities
 * toward specific challenges, using the browser's localStorage.
 *
 * Design principles:
 * - Defensive parsing — malformed data never crashes the UI.
 * - Idempotent — same (challengeId + institutionId) cannot produce a duplicate record.
 * - Role-scoped — only university research interest is stored here (Step 2A).
 *   Industry interest will be added in Step 2B using the same structure.
 * - Government-readable — record shape is intentionally flat and structured so
 *   the Government Dashboard can read it in a later step without schema changes.
 *
 * Interest record shape:
 * {
 *   challengeId:     string  — stable challenge ID (seeded slug or citizen UUID)
 *   institutionId:   string  — stable institution ID from institutionsRegistry.js
 *   institutionName: string  — human-readable institution name
 *   role:            "university"
 *   interestType:    "research_validation"
 *   status:          "interested"
 *   timestamp:       ISO 8601 string
 * }
 */

export const COLLAB_INTEREST_KEY = 'samadhan_collab_interests';
export const COLLAB_INTEREST_UPDATED_EVENT = 'samadhan_collab_interest_updated';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Read all stored interest records from localStorage.
 * Returns an empty array if storage is unavailable or data is malformed.
 *
 * @returns {Array<Object>}
 */
function readAllInterests() {
  try {
    const raw = localStorage.getItem(COLLAB_INTEREST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive filter: discard any records missing required fields.
    return parsed.filter(
      (r) =>
        r &&
        typeof r.challengeId === 'string' &&
        typeof r.institutionId === 'string' &&
        r.challengeId.length > 0 &&
        r.institutionId.length > 0
    );
  } catch (err) {
    console.warn('[collaborationStore] Failed to read interests from localStorage:', err);
    return [];
  }
}

/**
 * Persist the interest records array to localStorage.
 * Dispatches a CustomEvent so open tabs can react reactively.
 *
 * @param {Array<Object>} records
 */
function writeAllInterests(records) {
  try {
    localStorage.setItem(COLLAB_INTEREST_KEY, JSON.stringify(records));
    window.dispatchEvent(
      new CustomEvent(COLLAB_INTEREST_UPDATED_EVENT, { detail: records })
    );
  } catch (err) {
    console.error('[collaborationStore] Failed to write interests to localStorage:', err);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Check whether a specific institution has already expressed research interest
 * in a specific challenge.
 *
 * @param {string} challengeId
 * @param {string} institutionId
 * @returns {boolean}
 */
export function hasResearchInterest(challengeId, institutionId) {
  if (!challengeId || !institutionId) return false;
  try {
    const records = readAllInterests();
    return records.some(
      (r) =>
        r.challengeId === challengeId &&
        r.institutionId === institutionId &&
        r.role === 'university'
    );
  } catch {
    return false;
  }
}

/**
 * Express research interest from a verified university toward a challenge.
 * If the same (challengeId + institutionId) already exists, returns the
 * existing record without writing a duplicate.
 *
 * @param {Object} params
 * @param {string} params.challengeId
 * @param {string} params.institutionId
 * @param {string} params.institutionName
 * @returns {Object} The interest record (new or existing).
 */
export function expressResearchInterest({ challengeId, institutionId, institutionName }) {
  if (!challengeId || !institutionId || !institutionName) {
    throw new Error('[collaborationStore] expressResearchInterest: all fields required.');
  }

  const records = readAllInterests();

  // Idempotency check — prevent duplicate records
  const existing = records.find(
    (r) =>
      r.challengeId === challengeId &&
      r.institutionId === institutionId &&
      r.role === 'university'
  );
  if (existing) {
    return existing;
  }

  const newRecord = {
    challengeId,
    institutionId,
    institutionName,
    role: 'university',
    interestType: 'research_validation',
    status: 'interested',
    timestamp: new Date().toISOString(),
  };

  records.push(newRecord);
  writeAllInterests(records);
  return newRecord;
}

/**
 * Retrieve all research interest records for a specific challenge.
 * Useful for Government Dashboard (Step 2C+) and Project Lifecycle display.
 *
 * @param {string} challengeId
 * @returns {Array<Object>}
 */
export function getResearchInterestsForChallenge(challengeId) {
  if (!challengeId) return [];
  try {
    return readAllInterests().filter(
      (r) => r.challengeId === challengeId && r.role === 'university'
    );
  } catch {
    return [];
  }
}

/**
 * Check whether a specific industry institution has already expressed implementation interest
 * in a specific challenge.
 *
 * @param {string} challengeId
 * @param {string} institutionId
 * @returns {boolean}
 */
export function hasImplementationInterest(challengeId, institutionId) {
  if (!challengeId || !institutionId) return false;
  try {
    const records = readAllInterests();
    return records.some(
      (r) =>
        r.challengeId === challengeId &&
        r.institutionId === institutionId &&
        r.role === 'industry'
    );
  } catch {
    return false;
  }
}

/**
 * Express implementation interest from a verified industry organization toward a challenge.
 * If the same (challengeId + institutionId) already exists, returns the
 * existing record without writing a duplicate.
 *
 * @param {Object} params
 * @param {string} params.challengeId
 * @param {string} params.institutionId
 * @param {string} params.institutionName
 * @returns {Object} The interest record (new or existing).
 */
export function expressImplementationInterest({ challengeId, institutionId, institutionName }) {
  if (!challengeId || !institutionId || !institutionName) {
    throw new Error('[collaborationStore] expressImplementationInterest: all fields required.');
  }

  const records = readAllInterests();

  // Idempotency check — prevent duplicate records
  const existing = records.find(
    (r) =>
      r.challengeId === challengeId &&
      r.institutionId === institutionId &&
      r.role === 'industry'
  );
  if (existing) {
    return existing;
  }

  const newRecord = {
    challengeId,
    institutionId,
    institutionName,
    role: 'industry',
    interestType: 'implementation_scale',
    status: 'interested',
    timestamp: new Date().toISOString(),
  };

  records.push(newRecord);
  writeAllInterests(records);
  return newRecord;
}

/**
 * Retrieve all implementation interest records for a specific challenge.
 * Useful for Government Dashboard and Project Lifecycle display.
 *
 * @param {string} challengeId
 * @returns {Array<Object>}
 */
export function getImplementationInterestsForChallenge(challengeId) {
  if (!challengeId) return [];
  try {
    return readAllInterests().filter(
      (r) => r.challengeId === challengeId && r.role === 'industry'
    );
  } catch {
    return [];
  }
}

/**
 * Retrieve all stored collaboration interest records (all roles, all challenges).
 * Intended for Government Dashboard and administrative reviews.
 *
 * @returns {Array<Object>}
 */
export function getAllCollaborationInterests() {
  return readAllInterests();
}

/**
 * Retrieve all collaboration interests for a challenge, grouped by role.
 *
 * @param {string} challengeId
 * @returns {{ all: Array<Object>, university: Array<Object>, industry: Array<Object>, total: number }}
 */
export function getCollaborationInterestsForChallenge(challengeId) {
  if (!challengeId) {
    return { all: [], university: [], industry: [], total: 0 };
  }
  try {
    const all = readAllInterests().filter((r) => r.challengeId === challengeId);
    const university = all.filter((r) => r.role === 'university');
    const industry = all.filter((r) => r.role === 'industry');
    return {
      all,
      university,
      industry,
      total: all.length,
    };
  } catch {
    return { all: [], university: [], industry: [], total: 0 };
  }
}

/**
 * Format a human-readable summary string for a challenge's collaboration interest counts.
 * e.g., "1 University • 1 Industry interested", "2 Universities interested", "No interest expressed yet"
 *
 * @param {{ university?: Array<Object>, industry?: Array<Object>, total?: number } | null} data
 * @returns {string}
 */
export function formatCollaborationSummary(data) {
  if (!data) return 'No interest expressed yet';

  const uniCount = Array.isArray(data.university) ? data.university.length : 0;
  const indCount = Array.isArray(data.industry) ? data.industry.length : 0;
  const total = typeof data.total === 'number' ? data.total : uniCount + indCount;

  if (total === 0) {
    return 'No interest expressed yet';
  }

  if (uniCount > 0 && indCount > 0) {
    const uniLabel = uniCount === 1 ? '1 University' : `${uniCount} Universities`;
    const indLabel = indCount === 1 ? '1 Industry' : `${indCount} Industries`;
    return `${uniLabel} • ${indLabel} interested`;
  }

  if (uniCount > 0) {
    return `${uniCount} ${uniCount === 1 ? 'University' : 'Universities'} interested`;
  }

  if (indCount > 0) {
    return `${indCount} ${indCount === 1 ? 'Industry' : 'Industries'} interested`;
  }

  return `${total} ${total === 1 ? 'organization' : 'organizations'} interested`;
}


