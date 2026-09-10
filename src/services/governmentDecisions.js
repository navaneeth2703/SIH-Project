/**
 * Samadhan Setu — Government Decision State Management (Prototype Simulation)
 *
 * Principle: "AI recommends. Government decides."
 *
 * Stores simulated administrative decisions per challenge in sessionStorage.
 * Supported decisions: 'support' | 'hold' | 'information_requested' | 'decline'
 */

export const GOV_DECISION_STORAGE_KEY = "samadhan_gov_decisions";

export const GOV_DECISION_META = {
  support: {
    key: "support",
    label: "Support / Proceed to Next Stage",
    statusLabel: "Government Decision: Supported for Progression",
    shortLabel: "Supported for Progression",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badgeDot: "bg-emerald-500",
    lifecycleMessage: "Supported in prototype — eligible to progress to the next appropriate review stage.",
    detail: "Civic authorities have reviewed the capability-matched proposal and supported advancing to the next appropriate review stage.",
  },
  hold: {
    key: "hold",
    label: "Hold for Review",
    statusLabel: "Government Decision: On Hold",
    shortLabel: "On Hold",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    badgeDot: "bg-amber-500",
    lifecycleMessage: "Under administrative hold in prototype — awaiting further review.",
    detail: "Challenge is kept on administrative hold pending departmental resource and priority alignment.",
  },
  information_requested: {
    key: "information_requested",
    label: "Request More Information",
    statusLabel: "Government Decision: More Information Requested",
    shortLabel: "More Info Requested",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    badgeDot: "bg-blue-500",
    lifecycleMessage: "Additional technical / operational details requested by civic authorities.",
    detail: "Authorities requested further baseline validation data and operational specifications.",
  },
  decline: {
    key: "decline",
    label: "Decline",
    statusLabel: "Government Decision: Declined",
    shortLabel: "Declined",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    badgeDot: "bg-rose-500",
    lifecycleMessage: "Declined in prototype review — direction not currently proceeding.",
    detail: "The proposed intervention was reviewed and not accepted for progression at this time.",
  },
};

export const PENDING_REVIEW_META = {
  key: "pending",
  statusLabel: "Government Decision: Pending Review",
  shortLabel: "Pending Review",
  badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  badgeDot: "bg-slate-400",
  lifecycleMessage: "Pending administrative review — decision not yet recorded.",
  detail: "No simulated government decision has been recorded for this challenge yet.",
};

export function getAllGovernmentDecisions() {
  try {
    const raw = sessionStorage.getItem(GOV_DECISION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getGovernmentDecision(challengeId) {
  if (!challengeId) return null;
  const all = getAllGovernmentDecisions();
  return all[challengeId] || null;
}

export function setGovernmentDecision(challengeId, decisionKey) {
  if (!challengeId) return;
  try {
    const all = getAllGovernmentDecisions();
    if (!decisionKey) {
      delete all[challengeId];
    } else {
      all[challengeId] = {
        decision: decisionKey,
        updatedAt: new Date().toISOString(),
      };
    }
    sessionStorage.setItem(GOV_DECISION_STORAGE_KEY, JSON.stringify(all));
    // Dispatch local storage event for reactive same-tab updates
    window.dispatchEvent(new Event("samadhan_gov_decision_change"));
  } catch {
    // Non-blocking
  }
}
