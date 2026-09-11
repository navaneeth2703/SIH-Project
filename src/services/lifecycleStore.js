/**
 * Samadhan Setu — Government-Controlled Lifecycle Stage Store
 *
 * Principle: "AI recommends. Government decides."
 *
 * When Government uses "Support / Proceed to Next Stage" or the ← Prev / Advance →
 * controls in the Project Lifecycle, that decision is persisted here — NOT in
 * sessionStorage, which is lost on refresh.
 *
 * This is the SINGLE source of truth for government-advanced lifecycle stages.
 * It is separate from:
 *   - governmentDecisions.js  → records support/hold/info/decline
 *   - collaborationStore.js   → records expressed interest
 *   - projectUpdates.js       → records stakeholder progress evidence
 *
 * Storage: samadhan_lifecycle_stages = {
 *   [challengeId]: {
 *     stageIndex: 0-4,
 *     stage:      "Proposal" | "Pilot" | "Field Testing" | "Scale" | "Adopted",
 *     updatedAt:  ISO 8601
 *   }
 * }
 * Dispatches: samadhan_lifecycle_stage_updated (CustomEvent)
 */

export const LIFECYCLE_STAGES_KEY = 'samadhan_lifecycle_stages';
export const LIFECYCLE_STAGE_UPDATED_EVENT = 'samadhan_lifecycle_stage_updated';

/** Canonical stage label by index */
export const STAGE_LABELS = ['Proposal', 'Pilot', 'Field Testing', 'Scale', 'Adopted'];

/**
 * Read all stored lifecycle stages.
 * @returns {Record<string, { stageIndex: number, stage: string, updatedAt: string }>}
 */
function readAll() {
  try {
    const raw = localStorage.getItem(LIFECYCLE_STAGES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

/**
 * Get the government-advanced lifecycle stage for a challenge.
 * Returns null if no government progression has been recorded for this challenge.
 *
 * @param {string} challengeId
 * @returns {{ stageIndex: number, stage: string, updatedAt: string } | null}
 */
export function getLifecycleStage(challengeId) {
  if (!challengeId) return null;
  const all = readAll();
  return all[challengeId] || null;
}

/**
 * Record a government-advanced lifecycle stage for a challenge.
 *
 * @param {string} challengeId
 * @param {number} stageIndex - 0 (Proposal) ... 4 (Adopted)
 */
export function setLifecycleStage(challengeId, stageIndex) {
  if (!challengeId) return;
  if (stageIndex < 0 || stageIndex > 4) return;

  try {
    const all = readAll();
    const stage = STAGE_LABELS[stageIndex];
    const record = {
      stageIndex,
      stage,
      updatedAt: new Date().toISOString(),
    };
    all[challengeId] = record;
    localStorage.setItem(LIFECYCLE_STAGES_KEY, JSON.stringify(all));
    window.dispatchEvent(
      new CustomEvent(LIFECYCLE_STAGE_UPDATED_EVENT, {
        detail: { challengeId, ...record },
      })
    );
  } catch {
    // Non-blocking
  }
}

/**
 * Get all stored lifecycle stages (for dashboard iteration).
 * @returns {Record<string, { stageIndex: number, stage: string, updatedAt: string }>}
 */
export function getAllLifecycleStages() {
  return readAll();
}
