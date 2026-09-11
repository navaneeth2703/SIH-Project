/**
 * Samadhan Setu — Project Progress Updates Store
 *
 * Lightweight localStorage store enabling University and Industry collaborators
 * to submit progress/evidence updates for challenges:
 *
 *   University: "Submit Progress Update" (Research & Validation)
 *   Industry:   "Submit Implementation Update" (Implementation & Scale)
 *
 * Stored under: samadhan_project_updates
 * Dispatches:   samadhan_project_updates_updated
 */

export const PROJECT_UPDATES_KEY = 'samadhan_project_updates';
export const PROJECT_UPDATES_UPDATED_EVENT = 'samadhan_project_updates_updated';

/**
 * Read all project updates from localStorage.
 * Defensive against corruption or unavailable storage.
 *
 * @returns {Array<Object>}
 */
export function getAllProjectUpdates() {
  try {
    const raw = localStorage.getItem(PROJECT_UPDATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.challengeId === 'string' &&
        typeof item.summary === 'string'
    );
  } catch (err) {
    console.warn('[projectUpdates] Failed to read updates from storage:', err);
    return [];
  }
}

/**
 * Get all progress updates for a specific challenge, newest first.
 *
 * @param {string} challengeId
 * @returns {Array<Object>}
 */
export function getProjectUpdatesForChallenge(challengeId) {
  if (!challengeId) return [];
  const all = getAllProjectUpdates();
  return all
    .filter((u) => u.challengeId === challengeId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Submit a new project update.
 *
 * @param {Object} params
 * @param {string} params.challengeId
 * @param {string} params.institutionId
 * @param {string} params.institutionName
 * @param {'university'|'industry'} params.role
 * @param {string} params.updateType
 * @param {string} params.summary
 * @param {string} params.stage
 * @param {string} params.evidenceNote
 * @returns {Object} The saved update record
 */
export function submitProjectUpdate({
  challengeId,
  institutionId,
  institutionName,
  role,
  updateType,
  summary,
  stage,
  evidenceNote,
}) {
  if (!challengeId || !summary || !summary.trim()) {
    throw new Error('Challenge ID and Summary are required for progress update.');
  }

  const all = getAllProjectUpdates();

  // Prevent duplicate submissions with identical summary for the same institution within 1 minute
  const recentDuplicate = all.find(
    (u) =>
      u.challengeId === challengeId &&
      u.institutionId === institutionId &&
      u.summary.trim().toLowerCase() === summary.trim().toLowerCase() &&
      Date.now() - new Date(u.createdAt).getTime() < 60000
  );

  if (recentDuplicate) {
    return recentDuplicate;
  }

  const newRecord = {
    id: `update-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    challengeId,
    institutionId: institutionId || (role === 'university' ? 'u-nitjsr' : 'i-tata-motors-jamshedpur'),
    institutionName: institutionName || (role === 'university' ? 'NIT Jamshedpur' : 'Tata Motors Limited'),
    role: role || 'university',
    updateType: updateType || (role === 'university' ? 'Research Progress Update' : 'Implementation Progress Update'),
    summary: summary.trim(),
    stage: stage || 'Current Stage',
    evidenceNote: evidenceNote ? evidenceNote.trim() : '',
    createdAt: new Date().toISOString(),
    status: 'submitted',
  };

  const updated = [newRecord, ...all];

  try {
    localStorage.setItem(PROJECT_UPDATES_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(PROJECT_UPDATES_UPDATED_EVENT, { detail: newRecord })
    );
  } catch (err) {
    console.error('[projectUpdates] Failed to save project update:', err);
  }

  return newRecord;
}
