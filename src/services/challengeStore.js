/**
 * Samadhan Setu — Citizen Challenge Prototype Store
 * Manages persistent client-side storage for citizen-reported challenges.
 */

export const CITIZEN_CHALLENGES_KEY = 'samadhan_citizen_challenges';
export const CHALLENGES_UPDATED_EVENT = 'samadhan_challenges_updated';

const SEEDED_IDS = new Set([
  'bistupur-traffic',
  'baghmara-groundwater',
  'hazaribagh-diagnostic',
  'bokaro-irrigation',
]);

/**
 * Check if a challenge ID belongs to the immutable seeded demonstration records.
 */
export function isSeededChallenge(id) {
  if (!id) return false;
  return SEEDED_IDS.has(id);
}

/**
 * Map a canonical or AI category string to a domain key for filtering.
 */
export function mapCategoryToDomain(category) {
  if (!category || typeof category !== 'string') return 'other';
  const c = category.toLowerCase();
  if (c.includes('water') || c.includes('env')) return 'water';
  if (c.includes('traffic') || c.includes('transport') || c.includes('mobility') || c.includes('road')) return 'traffic';
  if (c.includes('health') || c.includes('sanit') || c.includes('medic') || c.includes('clinic')) return 'health';
  if (c.includes('agri') || c.includes('irrig') || c.includes('crop') || c.includes('farm')) return 'agriculture';
  if (c.includes('power') || c.includes('energy') || c.includes('electr')) return 'energy';
  if (c.includes('waste') || c.includes('recycl')) return 'waste';
  return 'other';
}

/**
 * Retrieve all citizen-submitted challenges from localStorage.
 * Defensive against JSON corruption or storage unavailability.
 *
 * @param {Object} [options]
 * @param {boolean} [options.includeWithdrawn=false]
 * @returns {Array<Object>}
 */
export function getCitizenChallenges({ includeWithdrawn = false } = {}) {
  try {
    const raw = localStorage.getItem(CITIZEN_CHALLENGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    if (includeWithdrawn) {
      return parsed;
    }
    return parsed.filter((item) => item && item.status !== 'withdrawn');
  } catch (err) {
    console.warn('[challengeStore] Failed to read citizen challenges:', err);
    return [];
  }
}

/**
 * Save a newly submitted citizen challenge.
 *
 * @param {Object} params
 * @param {Object} params.problem - The user-submitted problem (title, description, location, category)
 * @param {Object} params.analysis - The AI analysis result (severity, severityRationale, keywords, expertise, partners, etc.)
 * @returns {Object} The saved challenge record
 */
export function saveCitizenChallenge({ problem, analysis }) {
  if (!problem || !problem.title) {
    throw new Error('Invalid problem submission: title is required.');
  }

  const timestamp = new Date().toISOString();
  const id = `citizen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const category = analysis?.primaryClassification || problem.category || 'Other Societal Challenge';
  const domain = mapCategoryToDomain(category);
  const severity = analysis?.severity || 'MEDIUM';

  // Map AI partner matches into collaborator chips if available
  const collaborators = [];
  if (analysis?.partners && Array.isArray(analysis.partners)) {
    for (const p of analysis.partners.slice(0, 3)) {
      collaborators.push({
        name: p.name,
        type: p.type?.includes('UNIVERSITY') ? 'Research' : 'Industry',
      });
    }
  }

  // Tags from AI extracted keywords or fallback
  const tags = Array.isArray(analysis?.extractedKeywords) && analysis.extractedKeywords.length > 0
    ? analysis.extractedKeywords.slice(0, 5)
    : [category, problem.location?.split(',')[0]?.trim() || 'Local Area'];

  const record = {
    id,
    title: problem.title.trim(),
    description: problem.description?.trim() || '',
    location: problem.location?.trim() || 'Community Area, Jharkhand',
    category,
    domain,
    severity,
    severityRationale: analysis?.severityRationale || '',
    confidence: analysis?.confidence || 85,
    stage: 'Proposal',
    submittedBy: 'Citizen Contributor (Community Submission)',
    submittedAt: timestamp,
    source: 'citizen_submission',
    status: 'active',
    isCitizenSubmission: true,
    collaborators: collaborators.length > 0 ? collaborators : [
      { name: 'Potential Academic Partner', type: 'Research' },
      { name: 'Potential Industry Partner', type: 'Industry' },
    ],
    impact: 'Community-reported challenge — potential impact to be validated with field data',
    tags,
    requiredExpertise: Array.isArray(analysis?.requiredExpertise) ? analysis.requiredExpertise : [],
    rootCauses: Array.isArray(analysis?.rootCauses) ? analysis.rootCauses : [],
    reasoning: analysis?.reasoning || '',
    usedProvider: analysis?.usedProvider || 'AI',
    usedModel: analysis?.usedModel || '',
  };

  try {
    const existing = getCitizenChallenges({ includeWithdrawn: true });
    // Check if duplicate ID already exists (defensive)
    const filtered = existing.filter((item) => item.id !== id);
    filtered.unshift(record);
    localStorage.setItem(CITIZEN_CHALLENGES_KEY, JSON.stringify(filtered));

    // Dispatch update event for open tabs and components
    window.dispatchEvent(new CustomEvent(CHALLENGES_UPDATED_EVENT, { detail: record }));
  } catch (err) {
    console.error('[challengeStore] Failed to save citizen challenge:', err);
  }

  return record;
}

/**
 * Retrieve a challenge by ID.
 *
 * @param {string} id
 * @returns {Object|null}
 */
export function getCitizenChallengeById(id) {
  if (!id) return null;
  const list = getCitizenChallenges({ includeWithdrawn: true });
  return list.find((item) => item.id === id) || null;
}

/**
 * Soft-delete / withdraw a citizen-submitted challenge.
 *
 * @param {string} id
 * @returns {boolean} True if successfully withdrawn, false if not found or cannot be withdrawn
 */
export function withdrawCitizenChallenge(id) {
  if (!id || isSeededChallenge(id)) {
    return false;
  }

  try {
    const list = getCitizenChallenges({ includeWithdrawn: true });
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    list[idx] = {
      ...list[idx],
      status: 'withdrawn',
      withdrawnAt: new Date().toISOString(),
    };

    localStorage.setItem(CITIZEN_CHALLENGES_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent(CHALLENGES_UPDATED_EVENT, { detail: { id, status: 'withdrawn' } })
    );
    return true;
  } catch (err) {
    console.error('[challengeStore] Failed to withdraw challenge:', err);
    return false;
  }
}
