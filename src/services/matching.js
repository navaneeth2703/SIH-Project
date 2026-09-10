/**
 * Samadhan Setu — Explainable Institutional Partner Matching Service
 *
 * Scoring Pipeline:
 *   1. Domain Compatibility Gate   — prerequisite; no primary match = excluded
 *   2. Expertise Alignment         40%
 *   3. Research Relevance          25%
 *   4. Facilities & Equipment      15%
 *   5. Location / Proximity        10%
 *   6. Evidence & Track Record     10%
 *
 * Rules:
 *   - primaryDomains: strong alignment — institution is eligible for full scoring
 *   - secondaryDomains: weaker overlap — institution is eligible at a reduced ceiling (max 78)
 *   - No primary OR secondary match: institution is excluded entirely
 *   - No artificial score floor; scores under 60 are suppressed
 *   - If no institution passes the gate, return [] (empty) — never fake a match
 *   - Expertise token matching requires word length ≥ 5 to prevent noise (e.g. "ing", "tion")
 *   - All displayed reasons reference the institution's own seeded capabilities only
 */

// ── Institution data ────────────────────────────────────────────────────────
// Imported from the single source of truth: src/data/institutionsRegistry.js
// Re-exported here so that any existing direct imports of INSTITUTIONS_REGISTRY
// from this module continue to work without changes.
import { INSTITUTIONS_REGISTRY as _REGISTRY } from '../data/institutionsRegistry.js';
export { _REGISTRY as INSTITUTIONS_REGISTRY };
const INSTITUTIONS_REGISTRY = _REGISTRY;

// ── dummy anchor so grep below stays valid ─
// (remove this comment freely — the registry is in src/data/institutionsRegistry.js)

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Tokenise a phrase into words of length ≥ 5 to avoid noise tokens
 * like "ing", "tion", "and", etc.
 */
function significantTokens(phrase) {
  return phrase
    .toLowerCase()
    .split(/[\s&,/-]+/)
    .filter((w) => w.length >= 5);
}

/**
 * Check whether a candidate phrase matches any of the required expertise phrases.
 * Uses full-phrase substring first, then significant-token overlap as fallback.
 * Returns true only for genuine domain-specific alignment.
 */
function expertiseMatches(candidatePhrase, requiredPhrases) {
  const candLower = candidatePhrase.toLowerCase().trim();
  const candTokens = significantTokens(candidatePhrase);

  for (const req of requiredPhrases) {
    const reqLower = req.toLowerCase().trim();

    // Full-phrase containment (strongest signal)
    if (candLower.includes(reqLower) || reqLower.includes(candLower)) {
      return true;
    }

    // Token overlap — both sides must have at least one significant-word match
    const reqTokens = significantTokens(req);
    const sharedTokens = candTokens.filter((ct) =>
      reqTokens.some((rt) => ct.includes(rt) || rt.includes(ct))
    );
    if (sharedTokens.length >= 1 && reqTokens.length >= 1 && candTokens.length >= 1) {
      // Guard: reject trivially generic single-token matches on the word "engineering"
      // unless the domain context also aligns (handled by domain gate upstream)
      if (sharedTokens.includes('engineering') && reqTokens.length === 1) {
        continue;
      }
      return true;
    }
  }
  return false;
}

/**
 * Determine the domain gate result for a given institution.
 * Returns 'primary', 'secondary', or 'none'.
 */
function domainGate(institution, classificationRaw) {
  const cls = classificationRaw.toLowerCase().trim();

  const isPrimary = institution.primaryDomains.some((d) => {
    const dLower = d.toLowerCase();
    return (
      dLower === cls ||
      dLower.includes(cls) ||
      cls.includes(dLower) ||
      // word-level overlap on significant tokens
      significantTokens(d).some((dt) =>
        significantTokens(classificationRaw).some(
          (ct) => dt.includes(ct) || ct.includes(dt)
        )
      )
    );
  });

  if (isPrimary) return 'primary';

  const isSecondary = institution.secondaryDomains.some((d) => {
    const dLower = d.toLowerCase();
    return (
      dLower === cls ||
      dLower.includes(cls) ||
      cls.includes(dLower) ||
      significantTokens(d).some((dt) =>
        significantTokens(classificationRaw).some(
          (ct) => dt.includes(ct) || ct.includes(dt)
        )
      )
    );
  });

  return isSecondary ? 'secondary' : 'none';
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Match problem analysis with verified institutions using an explainable
 * multi-factor weighted scoring pipeline with domain compatibility gating.
 *
 * @param {Object} aiAnalysis  Structured output from Gemini (primaryClassification,
 *                             requiredExpertise, extractedKeywords, etc.)
 * @param {Object} problem     Citizen submission (location, title, etc.)
 * @returns {Array<Object>}    Top university + top industry partner, or [] if none qualify.
 */
export function matchPartnersWithExplanation(aiAnalysis, problem) {
  const reqExpertise = (aiAnalysis.requiredExpertise || []);
  const classification = aiAnalysis.primaryClassification || '';
  const locationStr = (problem.location || '').toLowerCase();

  const scored = [];

  for (const inst of INSTITUTIONS_REGISTRY) {
    // ── Pre-Filter: Exclude unverified demo/synthetic institutions ───────────
    if (inst.matchStatus !== 'VERIFIED_PUBLIC_CAPABILITY') {
      continue;
    }

    // ── STAGE 1: Domain Compatibility Gate ──────────────────────────────────
    const gateResult = domainGate(inst, classification);
    if (gateResult === 'none') {
      // Institution is excluded — completely unrelated domain
      continue;
    }
    const isSecondaryMatch = gateResult === 'secondary';

    // ── STAGE 2: Expertise Alignment (40%) ──────────────────────────────────
    const matchedCapabilities = [];
    for (const cap of inst.expertise) {
      if (expertiseMatches(cap, reqExpertise)) {
        matchedCapabilities.push(cap);
      }
    }

    // Score: proportion of institution's expertise that matches required fields
    const expertiseRatio = matchedCapabilities.length / Math.max(1, inst.expertise.length);
    // Also reward breadth: how many of the required expertise fields are covered
    const coverageRatio = reqExpertise.length > 0
      ? reqExpertise.filter((re) => inst.expertise.some((cap) => expertiseMatches(cap, [re]))).length / reqExpertise.length
      : 0;

    // Blend: 60% institution hit-rate, 40% required-field coverage
    const expertiseScore = Math.round((expertiseRatio * 0.6 + coverageRatio * 0.4) * 100);

    // ── STAGE 3: Research / Domain Relevance (25%) ──────────────────────────
    const domainScore = gateResult === 'primary' ? 95 : 60;

    // ── STAGE 4: Facilities & Equipment (15%) ───────────────────────────────
    const facilitiesScore = inst.facilities.length >= 2 ? 90 : inst.facilities.length === 1 ? 75 : 60;

    // ── STAGE 5: Location Proximity (10%) ───────────────────────────────────
    const districtMatch = locationStr.includes(inst.district.toLowerCase());
    const stateMatch = locationStr.includes(inst.state.toLowerCase());
    const locationScore = districtMatch ? 100 : stateMatch ? 82 : 60;

    // ── STAGE 6: Evidence & Track Record (10%) ──────────────────────────────
    // Score depends strictly on verified public capability and documented evidence sources.
    // DEMO_UNVERIFIED institutions receive 0 points — synthetic baseScore is removed.
    let evidenceScore = 0;
    if (inst.matchStatus === 'VERIFIED_PUBLIC_CAPABILITY') {
      const sourceCount = (inst.evidenceSources || []).length;
      if (sourceCount >= 3) {
        evidenceScore = 95;
      } else if (sourceCount === 2) {
        evidenceScore = 88;
      } else if (sourceCount >= 1) {
        evidenceScore = 85;
      }
    }

    // ── Weighted Final Score ─────────────────────────────────────────────────
    let finalScore = Math.round(
      expertiseScore * 0.40 +
      domainScore    * 0.25 +
      facilitiesScore * 0.15 +
      locationScore  * 0.10 +
      evidenceScore  * 0.10
    );

    // Secondary-domain matches are capped at 78 to prevent them outranking primary-domain winners
    if (isSecondaryMatch) {
      finalScore = Math.min(78, finalScore);
    }

    // Hard minimum: suppress scores under 60 — no fake matches
    if (finalScore < 60) continue;

    // ── Explainable Reasons (only seeded capabilities) ───────────────────────
    const reasons = [];

    // Reason 1: Expertise alignment
    if (matchedCapabilities.length > 0) {
      reasons.push(
        `${matchedCapabilities.slice(0, 2).join(' & ')} capability matches problem requirements`
      );
    } else {
      // Secondary domain with no expertise match — generic but honest
      reasons.push(
        `${inst.primaryDomains[0]} domain provides adjacent research support`
      );
    }

    // Reason 2: Domain alignment
    if (gateResult === 'primary') {
      reasons.push(
        `Primary domain alignment with ${classification} — direct institutional mandate`
      );
    } else {
      reasons.push(
        `Secondary research overlap with ${classification} through ${inst.secondaryDomains[0]}`
      );
    }

    // Reason 3: Location
    if (districtMatch) {
      reasons.push(`Same district (${inst.district}) enables rapid on-site deployment`);
    } else if (stateMatch) {
      reasons.push(`State-level presence in ${inst.state} supports field coordination`);
    } else {
      reasons.push(`Regional research network provides national partnership coverage`);
    }

    // Reason 4: Facilities — cite the first seeded facility
    if (inst.facilities.length > 0) {
      reasons.push(`Access to ${inst.facilities[0]}`);
    }

    scored.push({
      ...inst,
      score: finalScore,
      reasons,
      _expertiseHits: matchedCapabilities.length,
      _gateResult: gateResult,
    });
  }

  // Sort each type by score descending, pick top of each
  const topUniversity = scored
    .filter((i) => i.type === 'UNIVERSITY MATCH')
    .sort((a, b) => b.score - a.score)[0] ?? null;

  const topIndustry = scored
    .filter((i) => i.type === 'INDUSTRY MATCH')
    .sort((a, b) => b.score - a.score)[0] ?? null;

  return [topUniversity, topIndustry].filter(Boolean);
}
