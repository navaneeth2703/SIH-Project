/**
 * Samadhan Setu — Prototype Notification Store
 *
 * Provides a lightweight, localStorage-backed notification system that
 * closes the Government Decision Loop:
 *
 *   Government makes/changes a decision
 *   → Citizen (if citizen-submitted challenge) receives notification
 *   → Universities that expressed research interest receive notification
 *   → Industries that expressed implementation interest receive notification
 *
 * IMPORTANT:
 * - This is a PROTOTYPE notification store. No email, SMS, or push is sent.
 * - Government does NOT receive self-notifications for its own decisions.
 * - Only institutions with an ACTUAL interest record are notified.
 *   "Potential Match" ≠ "Interested Stakeholder".
 * - Dedup key: challengeId + recipientRole + recipientInstitutionId
 *   Prevents duplicate spam when decision changes — records are upserted.
 * - Malformed localStorage data is silently discarded; never crashes the UI.
 *
 * Notification record shape:
 * {
 *   id:                    string  — stable dedup key (challengeId:role:institutionId)
 *   recipientRole:         'citizen' | 'university' | 'industry'
 *   recipientInstitutionId: string | null  — null for citizen
 *   challengeId:           string
 *   challengeTitle:        string
 *   type:                  'government_decision'
 *   decisionKey:           string  — 'support' | 'hold' | 'information_requested' | 'decline'
 *   title:                 string
 *   message:               string
 *   createdAt:             ISO 8601
 *   updatedAt:             ISO 8601
 *   read:                  boolean
 *   source:                'government_decision'
 * }
 */

export const NOTIFICATIONS_KEY = 'samadhan_notifications';
export const NOTIFICATIONS_UPDATED_EVENT = 'samadhan_notifications_updated';

// ── Human-readable decision labels for notification messages ─────────────────

const DECISION_DISPLAY = {
  support: 'Supported for Progression',
  hold: 'On Hold',
  information_requested: 'More Information Requested',
  decline: 'Declined',
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Read all stored notifications from localStorage.
 * Returns an empty array if storage is unavailable or data is malformed.
 */
function readAll() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n) =>
        n &&
        typeof n.id === 'string' &&
        typeof n.recipientRole === 'string' &&
        n.id.length > 0
    );
  } catch {
    return [];
  }
}

/**
 * Persist notifications array and dispatch reactive event.
 */
function writeAll(records) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: records }));
  } catch {
    // Non-blocking
  }
}

/**
 * Build a stable dedup ID for a notification.
 * Same (challengeId + recipientRole + institutionId) always produces the same ID.
 */
function buildId(challengeId, recipientRole, recipientInstitutionId) {
  const instPart = recipientInstitutionId || 'citizen';
  return `${challengeId}:${recipientRole}:${instPart}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Retrieve notifications for a specific role and optional institution.
 *
 * @param {string} role - 'citizen' | 'university' | 'industry'
 * @param {string|null} institutionId - Required for university/industry roles
 * @returns {Array<Object>} Notifications, newest first
 */
export function getNotificationsForRole(role, institutionId = null) {
  if (!role) return [];
  try {
    const all = readAll();
    return all
      .filter((n) => {
        if (n.recipientRole !== role) return false;
        if (role === 'citizen') return true;
        // For university/industry: filter by institution
        return n.recipientInstitutionId === institutionId;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch {
    return [];
  }
}

/**
 * Get unread notification count for a role + institution combination.
 *
 * @param {string} role
 * @param {string|null} institutionId
 * @returns {number}
 */
export function getUnreadCount(role, institutionId = null) {
  const notifications = getNotificationsForRole(role, institutionId);
  return notifications.filter((n) => !n.read).length;
}

/**
 * Mark a notification as read by its ID.
 *
 * @param {string} id
 */
export function markNotificationRead(id) {
  if (!id) return;
  try {
    const all = readAll();
    const idx = all.findIndex((n) => n.id === id);
    if (idx !== -1 && !all[idx].read) {
      all[idx] = { ...all[idx], read: true };
      writeAll(all);
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Mark all notifications for a role + institution as read.
 *
 * @param {string} role
 * @param {string|null} institutionId
 */
export function markAllReadForRole(role, institutionId = null) {
  try {
    const all = readAll();
    let changed = false;
    const updated = all.map((n) => {
      const matches =
        n.recipientRole === role &&
        (role === 'citizen' || n.recipientInstitutionId === institutionId);
      if (matches && !n.read) {
        changed = true;
        return { ...n, read: true };
      }
      return n;
    });
    if (changed) writeAll(updated);
  } catch {
    // Non-blocking
  }
}

/**
 * Build the notification title and message for each stakeholder type.
 * Language is honest: no false partnership claims.
 */
function buildNotification(recipientRole, decisionKey, _challengeTitle) {
  const decisionLabel = DECISION_DISPLAY[decisionKey] || decisionKey;
  const title = 'Government Decision Updated';

  let message;
  switch (recipientRole) {
    case 'citizen':
      switch (decisionKey) {
        case 'support':
          message = `Government Decision: Supported for Progression for your reported challenge.`;
          break;
        case 'hold':
          message = `Government Decision: On Hold for your reported challenge.`;
          break;
        case 'information_requested':
          message = `Government requested more information for your reported challenge.`;
          break;
        case 'decline':
          message = `Government Decision: Declined for your reported challenge.`;
          break;
        default:
          message = `Government Decision: ${decisionLabel} for your reported challenge.`;
      }
      break;

    case 'university':
      switch (decisionKey) {
        case 'support':
          message = `Government Decision: Supported for Progression on a challenge where your institution expressed research interest.`;
          break;
        case 'hold':
          message = `Government Decision: On Hold on a challenge where your institution expressed research interest.`;
          break;
        case 'information_requested':
          message = `Government requested more information on a challenge where your institution expressed research interest.`;
          break;
        case 'decline':
          message = `Government Decision: Declined on a challenge where your institution expressed research interest.`;
          break;
        default:
          message = `Government Decision: ${decisionLabel} on a challenge where your institution expressed research interest.`;
      }
      break;

    case 'industry':
      switch (decisionKey) {
        case 'support':
          message = `Government Decision: Supported for Progression on a challenge where your organization expressed implementation interest.`;
          break;
        case 'hold':
          message = `Government Decision: On Hold on a challenge where your organization expressed implementation interest.`;
          break;
        case 'information_requested':
          message = `Government requested more information on a challenge where your organization expressed implementation interest.`;
          break;
        case 'decline':
          message = `Government Decision: Declined on a challenge where your organization expressed implementation interest.`;
          break;
        default:
          message = `Government Decision: ${decisionLabel} on a challenge where your organization expressed implementation interest.`;
      }
      break;

    default:
      message = `Government Decision: ${decisionLabel}.`;
  }

  return { title, message };
}

/**
 * Create or update stakeholder notifications when a Government decision is made/changed.
 *
 * Recipients:
 * - Citizen: only if `isCitizenSubmission` is true (seeded challenges have no citizen account)
 * - University: only institutions with an actual research interest record
 * - Industry: only institutions with an actual implementation interest record
 *
 * Government does NOT receive self-notifications.
 * Duplicate-safe: same (challengeId + role + institutionId) = upsert, not new record.
 *
 * @param {Object} params
 * @param {string} params.challengeId
 * @param {string} params.challengeTitle
 * @param {string} params.decisionKey - 'support' | 'hold' | 'information_requested' | 'decline'
 * @param {Array<Object>} params.universityInterests - Interest records from collaborationStore
 * @param {Array<Object>} params.industryInterests - Interest records from collaborationStore
 * @param {boolean} params.isCitizenSubmission - Whether this challenge was submitted by a citizen
 */
export function createGovernmentDecisionNotifications({
  challengeId,
  challengeTitle,
  decisionKey,
  universityInterests = [],
  industryInterests = [],
  isCitizenSubmission = false,
}) {
  if (!challengeId || !decisionKey) return;

  try {
    const all = readAll();
    const now = new Date().toISOString();

    // Build the set of notifications we want to upsert
    const upserts = [];

    // 1. Citizen notification (only for citizen-submitted challenges)
    if (isCitizenSubmission) {
      const { title, message } = buildNotification('citizen', decisionKey, challengeTitle);
      upserts.push({
        id: buildId(challengeId, 'citizen', null),
        recipientRole: 'citizen',
        recipientInstitutionId: null,
        challengeId,
        challengeTitle,
        type: 'government_decision',
        decisionKey,
        title,
        message,
        source: 'government_decision',
      });
    }

    // 2. University notifications — only actual interest holders
    for (const interest of universityInterests) {
      if (!interest.institutionId) continue;
      const { title, message } = buildNotification('university', decisionKey, challengeTitle);
      upserts.push({
        id: buildId(challengeId, 'university', interest.institutionId),
        recipientRole: 'university',
        recipientInstitutionId: interest.institutionId,
        challengeId,
        challengeTitle,
        type: 'government_decision',
        decisionKey,
        title,
        message,
        source: 'government_decision',
      });
    }

    // 3. Industry notifications — only actual interest holders
    for (const interest of industryInterests) {
      if (!interest.institutionId) continue;
      const { title, message } = buildNotification('industry', decisionKey, challengeTitle);
      upserts.push({
        id: buildId(challengeId, 'industry', interest.institutionId),
        recipientRole: 'industry',
        recipientInstitutionId: interest.institutionId,
        challengeId,
        challengeTitle,
        type: 'government_decision',
        decisionKey,
        title,
        message,
        source: 'government_decision',
      });
    }

    // Upsert: if record exists → update decision + message + mark unread again
    // if new → add with read=false
    let updated = [...all];
    for (const upsert of upserts) {
      const existingIdx = updated.findIndex((n) => n.id === upsert.id);
      if (existingIdx !== -1) {
        // Update existing: refresh decision, message, timestamp, mark unread
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...upsert,
          updatedAt: now,
          read: false, // New decision = unread again
        };
      } else {
        // New notification
        updated.push({
          ...upsert,
          createdAt: now,
          updatedAt: now,
          read: false,
        });
      }
    }

    writeAll(updated);
  } catch {
    // Non-blocking — notification failure must never crash the decision flow
  }
}

/**
 * Create stakeholder notifications when Government verifies an outcome.
 *
 * Recipients:
 * - Citizen: only if `isCitizenSubmission` is true
 * - University: only institutions with an actual research interest record
 * - Industry: only institutions with an actual implementation interest record
 *
 * @param {Object} params
 * @param {string} params.challengeId
 * @param {string} params.challengeTitle
 * @param {Array<Object>} params.universityInterests
 * @param {Array<Object>} params.industryInterests
 * @param {boolean} params.isCitizenSubmission
 */
export function createOutcomeVerifiedNotifications({
  challengeId,
  challengeTitle,
  universityInterests = [],
  industryInterests = [],
  isCitizenSubmission = false,
}) {
  if (!challengeId) return;

  try {
    const all = readAll();
    const now = new Date().toISOString();
    const title = 'Outcome Verified';
    const upserts = [];

    // 1. Citizen notification — only for real community submissions
    if (isCitizenSubmission) {
      upserts.push({
        id: `${challengeId}:outcome_verified:citizen:citizen`,
        recipientRole: 'citizen',
        recipientInstitutionId: null,
        challengeId,
        challengeTitle: challengeTitle || 'Community Challenge',
        type: 'outcome_verified',
        title,
        message: 'Government has verified the outcome of your reported challenge.',
        source: 'outcome_verification',
      });
    }

    // 2. University notifications — only actual interest holders
    for (const interest of universityInterests) {
      if (!interest.institutionId) continue;
      upserts.push({
        id: `${challengeId}:outcome_verified:university:${interest.institutionId}`,
        recipientRole: 'university',
        recipientInstitutionId: interest.institutionId,
        challengeId,
        challengeTitle: challengeTitle || 'Research Challenge',
        type: 'outcome_verified',
        title,
        message:
          'Government has verified the outcome of a challenge where your institution expressed research interest.',
        source: 'outcome_verification',
      });
    }

    // 3. Industry notifications — only actual interest holders
    for (const interest of industryInterests) {
      if (!interest.institutionId) continue;
      upserts.push({
        id: `${challengeId}:outcome_verified:industry:${interest.institutionId}`,
        recipientRole: 'industry',
        recipientInstitutionId: interest.institutionId,
        challengeId,
        challengeTitle: challengeTitle || 'Implementation Challenge',
        type: 'outcome_verified',
        title,
        message:
          'Government has verified the outcome of a challenge where your organization expressed implementation interest.',
        source: 'outcome_verification',
      });
    }

    let updated = [...all];
    for (const upsert of upserts) {
      const existingIdx = updated.findIndex((n) => n.id === upsert.id);
      if (existingIdx !== -1) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...upsert,
          updatedAt: now,
          read: false,
        };
      } else {
        updated.push({
          ...upsert,
          createdAt: now,
          updatedAt: now,
          read: false,
        });
      }
    }

    writeAll(updated);
  } catch {
    // Non-blocking
  }
}

/**
 * Create a Government-targeted notification when a University or Industry stakeholder
 * submits a progress update for a challenge.
 *
 * Target: Government ONLY (recipientRole: 'government', recipientInstitutionId: 'government').
 * Citizen and other stakeholders do NOT receive this notification.
 *
 * Dedup key: challengeId + progress_update + sourceRole + institutionId + updateId
 * If the exact same updateId has already been notified, no duplicate is created.
 *
 * @param {Object} params
 * @param {string} params.challengeId
 * @param {string} params.challengeTitle
 * @param {string} params.updateId - The update record's unique ID (for deduplication)
 * @param {string} params.institutionId
 * @param {string} params.institutionName
 * @param {'university'|'industry'} params.sourceRole
 */
export function createProgressUpdateNotification({
  challengeId,
  challengeTitle,
  updateId,
  institutionId,
  institutionName,
  sourceRole,
}) {
  if (!challengeId || !updateId || !institutionId || !sourceRole) return;

  try {
    const all = readAll();
    const now = new Date().toISOString();

    // Stable dedup key per updateId — prevents duplicate even if called twice
    const notifId = `${challengeId}:progress_update:${sourceRole}:${institutionId}:${updateId}`;

    // If this exact updateId has already been recorded, skip silently
    if (all.find((n) => n.id === notifId)) return;

    const roleLabel = sourceRole === 'university' ? 'University' : 'Industry';
    const title = `New ${roleLabel} Progress Update`;
    const message =
      sourceRole === 'university'
        ? `${institutionName} submitted research progress for a reviewed challenge. Review evidence in the Project Lifecycle.`
        : `${institutionName} submitted implementation progress for a reviewed challenge. Review evidence in the Project Lifecycle.`;

    const record = {
      id: notifId,
      recipientRole: 'government',
      recipientInstitutionId: 'government',
      challengeId,
      challengeTitle: challengeTitle || 'Community Challenge',
      type: 'progress_update',
      sourceRole,
      institutionId,
      institutionName,
      title,
      message,
      source: 'progress_update',
      createdAt: now,
      updatedAt: now,
      read: false,
    };

    writeAll([...all, record]);
  } catch {
    // Non-blocking — notification failure must never crash the update flow
  }
}
