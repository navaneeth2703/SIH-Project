import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../components/ui";
import {
  getActiveRole,
  PLATFORM_ROLES,
} from "../services/roleState";
import {
  getCitizenChallenges,
  withdrawCitizenChallenge,
  CHALLENGES_UPDATED_EVENT,
} from "../services/challengeStore";
import {
  expressResearchInterest,
  expressImplementationInterest,
  COLLAB_INTEREST_UPDATED_EVENT,
} from "../services/collaborationStore";
import { INSTITUTIONS_REGISTRY } from "../data/institutionsRegistry";

/**
 * Maps seeded challenge IDs to their verified UNIVERSITY MATCH institution IDs.
 * Only VERIFIED_PUBLIC_CAPABILITY institutions are included — no synthetic/demo entries.
 * Multiple universities per challenge are supported (e.g., Bistupur has two).
 *
 * These IDs correspond exactly to the `id` field in institutionsRegistry.js.
 */
const SEEDED_UNIVERSITY_MATCH_IDS = {
  'bistupur-traffic': ['u-nitjsr', 'u-mobility-ranchi'],
  'baghmara-groundwater': ['u-env-dhanbad'],
  'hazaribagh-diagnostic': ['u-rims-ranchi'],
  'bokaro-irrigation': ['u-bau-ranchi'],
};

/**
 * Resolve verified university institution objects for a given challenge.
 * For seeded challenges: uses the deterministic map above.
 * For citizen submissions: uses capability match from collaborators if present.
 * Only returns institutions that are actually in the registry and VERIFIED.
 *
 * @param {Object} challenge
 * @returns {Array<Object>} Array of verified institution registry entries
 */
function resolveVerifiedUniversityMatches(challenge) {
  if (!challenge || !challenge.id) return [];

  // Seeded challenges: use deterministic map
  const seededIds = SEEDED_UNIVERSITY_MATCH_IDS[challenge.id];
  if (seededIds) {
    return seededIds
      .map((id) => INSTITUTIONS_REGISTRY.find((inst) => inst.id === id))
      .filter(
        (inst) =>
          inst &&
          inst.type === 'UNIVERSITY MATCH' &&
          inst.matchStatus === 'VERIFIED_PUBLIC_CAPABILITY'
      );
  }

  // Citizen submissions: derive from collaborator names if available
  if (challenge.isCitizenSubmission && Array.isArray(challenge.collaborators)) {
    const researchCollaborators = challenge.collaborators
      .filter((c) => c.type === 'Research')
      .map((c) =>
        INSTITUTIONS_REGISTRY.find(
          (inst) =>
            inst.type === 'UNIVERSITY MATCH' &&
            inst.matchStatus === 'VERIFIED_PUBLIC_CAPABILITY' &&
            inst.name.toLowerCase().includes(c.name.toLowerCase())
        )
      )
      .filter(Boolean);
    return researchCollaborators;
  }

  return [];
}

/**
 * Maps seeded challenge IDs to their verified INDUSTRY MATCH institution IDs.
 * Only VERIFIED_PUBLIC_CAPABILITY institutions are included — no synthetic/demo entries.
 * Multiple industry partners per challenge are supported.
 *
 * These IDs correspond exactly to the `id` field in institutionsRegistry.js.
 */
const SEEDED_INDUSTRY_MATCH_IDS = {
  'bistupur-traffic': ['i-tata-motors-jamshedpur'],
  'baghmara-groundwater': ['i-mecon-ranchi'],
  'hazaribagh-diagnostic': ['i-apollo-jharkhand'],
  'bokaro-irrigation': ['i-nsc-jharkhand'],
};

/**
 * Resolve verified industry institution objects for a given challenge.
 * For seeded challenges: uses the deterministic map above.
 * For citizen submissions: uses capability match from collaborators if present.
 * Only returns institutions that are actually in the registry and VERIFIED.
 *
 * @param {Object} challenge
 * @returns {Array<Object>} Array of verified institution registry entries
 */
function resolveVerifiedIndustryMatches(challenge) {
  if (!challenge || !challenge.id) return [];

  // Seeded challenges: use deterministic map
  const seededIds = SEEDED_INDUSTRY_MATCH_IDS[challenge.id];
  if (seededIds) {
    return seededIds
      .map((id) => INSTITUTIONS_REGISTRY.find((inst) => inst.id === id))
      .filter(
        (inst) =>
          inst &&
          inst.type === 'INDUSTRY MATCH' &&
          inst.matchStatus === 'VERIFIED_PUBLIC_CAPABILITY'
      );
  }

  // Citizen submissions: derive from collaborator names if available
  if (challenge.isCitizenSubmission && Array.isArray(challenge.collaborators)) {
    const industryCollaborators = challenge.collaborators
      .filter((c) => c.type === 'Industry')
      .map((c) =>
        INSTITUTIONS_REGISTRY.find(
          (inst) =>
            inst.type === 'INDUSTRY MATCH' &&
            inst.matchStatus === 'VERIFIED_PUBLIC_CAPABILITY' &&
            inst.name.toLowerCase().includes(c.name.toLowerCase())
        )
      )
      .filter(Boolean);
    return industryCollaborators;
  }

  return [];
}

const CHALLENGES = [
  {
    id: "bistupur-traffic",
    title: "Severe Traffic Congestion and Lack of Public Bus Connectivity",
    location: "Bistupur, Jamshedpur, Jharkhand",
    category: "Traffic & Transport",
    domain: "traffic",
    severity: "MEDIUM",
    stage: "Field Testing",
    submittedBy: "Citizen Collective, Bistupur Ward",
    description:
      "Illustrative prototype scenario showing how recurring peak-hour congestion could affect commuters across key transit corridors in Bistupur, where limited public bus connectivity increases private vehicular load.",
    collaborators: [
      { name: "NIT Jamshedpur", type: "Research" },
      { name: "Tata Motors", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Urban Mobility", "Public Transit", "Emissions"],
  },
  {
    id: "baghmara-groundwater",
    title: "Severe Groundwater Discoloration & Odor near Baghmara Tube-wells",
    location: "Baghmara, Dhanbad, Jharkhand",
    category: "Water & Environment",
    domain: "water",
    severity: "HIGH",
    stage: "Pilot",
    submittedBy: "Gram Sabha, Baghmara Block",
    description:
      "Illustrative prototype scenario showing groundwater quality concerns near mining-affected areas in Baghmara, where community tube-wells require testing and accessible safe drinking water alternatives.",
    collaborators: [
      { name: "IIT (ISM) Dhanbad", type: "Research" },
      { name: "MECON Limited", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Drinking Water", "Environmental Health", "Rural Infrastructure"],
  },
  {
    id: "hazaribagh-diagnostic",
    title: "Diagnostic Lab Access and Vaccine Cold-Chain Uptime in Remote Clusters",
    location: "Sadar Block, Hazaribagh, Jharkhand",
    category: "Public Health & Sanitation",
    domain: "health",
    severity: "HIGH",
    stage: "Proposal",
    submittedBy: "ASHA Worker Network, Hazaribagh",
    description:
      "Illustrative prototype scenario showing diagnostic access and cold-chain challenges in remote clusters of Sadar Block, where travel distance and power continuity affect primary healthcare delivery.",
    collaborators: [
      { name: "RIMS Ranchi", type: "Research" },
      { name: "Apollo Hospitals Enterprise Limited", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Healthcare Access", "Cold Chain", "Rural Health"],
  },
  {
    id: "bokaro-irrigation",
    title: "Crop Irrigation Water Scarcity during Non-Monsoon Cycles",
    location: "Petarwar Cluster, Bokaro, Jharkhand",
    category: "Agriculture & Irrigation",
    domain: "agriculture",
    severity: "MEDIUM",
    stage: "Adopted",
    submittedBy: "Farmer Cooperative Society, Petarwar",
    description:
      "Illustrative prototype scenario showing irrigation constraints affecting smallholder farming in Petarwar cluster during non-monsoon cycles, highlighting the need for dependable micro-irrigation.",
    collaborators: [
      { name: "Birsa Agricultural University", type: "Research" },
      { name: "National Seeds Corporation Limited", type: "Industry" },
    ],
    impact: "Illustrative impact area — to be validated through field data",
    tags: ["Smallholder Farming", "Irrigation", "Food Security"],
  },
];

const CATEGORIES = [
  { key: "all", label: "All Challenges" },
  { key: "traffic", label: "Traffic & Transport" },
  { key: "water", label: "Water & Environment" },
  { key: "health", label: "Public Health" },
  { key: "agriculture", label: "Agriculture" },
];

const SEVERITIES = [
  { key: "all", label: "All Severities" },
  { key: "HIGH", label: "High Priority" },
  { key: "MEDIUM", label: "Medium Priority" },
];

const SEVERITY_META = {
  HIGH: {
    label: "High Priority",
    accentBg: "bg-rose-50",
    accentBorder: "border-rose-200",
    accentText: "text-rose-700",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  MEDIUM: {
    label: "Medium Priority",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    accentText: "text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
  },
};

const STAGE_META = {
  Proposal: "bg-slate-100 text-slate-600 border-slate-200",
  Pilot: "bg-blue-50 text-blue-700 border-blue-200",
  "Field Testing": "bg-violet-50 text-violet-700 border-violet-200",
  Scale: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Adopted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const COLLAB_TYPE_STYLE = {
  Research: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Industry: "bg-teal-50 text-teal-700 border-teal-200",
};

function ChallengeCard({
  challenge,
  onViewLifecycle,
  onWithdraw,
  activeRole,
  verifiedUniversityMatches,
  onExpressInterest,
  interestState,
  verifiedIndustryMatches,
  onExpressImplementationInterest,
  industryInterestState,
}) {
  const sev = SEVERITY_META[challenge.severity] || SEVERITY_META.MEDIUM;
  const stageClass = STAGE_META[challenge.stage] || STAGE_META.Proposal;

  const roleMeta = activeRole ? PLATFORM_ROLES[activeRole] : null;
  const perspectiveQuestion = roleMeta?.perspectiveQuestion
    ? roleMeta.perspectiveQuestion(challenge.domain)
    : null;

  return (
    <Card
      variant="elevated"
      className="flex flex-col group transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className={`h-1 w-full rounded-t-xl ${sev.bar}`} />

      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            {challenge.category}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${sev.accentBg} ${sev.accentBorder} ${sev.accentText}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
            {sev.label}
          </span>
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border ${stageClass}`}
          >
            {challenge.stage}
          </span>
          {challenge.isCitizenSubmission && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Community Submission
            </span>
          )}
        </div>

        <CardTitle as="h2" className="text-base leading-snug mb-1 group-hover:text-indigo-700 transition-colors">
          {challenge.title}
        </CardTitle>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>{challenge.location}</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
          {challenge.description}
        </p>

        {/* Role-aware perspective note */}
        {roleMeta && perspectiveQuestion && (
          <div
            className={`px-3 py-2.5 rounded-lg text-xs border font-medium space-y-1 ${
              activeRole === "university"
                ? "bg-violet-50/70 border-violet-200/80 text-violet-950"
                : activeRole === "industry"
                ? "bg-teal-50/70 border-teal-200/80 text-teal-950"
                : activeRole === "government"
                ? "bg-purple-50/70 border-purple-200/80 text-purple-950"
                : activeRole === "citizen"
                ? "bg-teal-50/70 border-teal-200/80 text-teal-950"
                : "bg-blue-50/70 border-blue-200/80 text-blue-950"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold">
                {activeRole === "university"
                  ? "Research & Validation Perspective"
                  : activeRole === "industry"
                  ? "Implementation & Scale Perspective"
                  : activeRole === "government"
                  ? "Government Review Perspective"
                  : "Citizen Tracking"}
              </span>
              {roleMeta.alignmentLabel && (
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                  {roleMeta.alignmentLabel}
                </span>
              )}
            </div>
            <p className="italic text-slate-700">&ldquo;{perspectiveQuestion}&rdquo;</p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Potential Collaborators <span className="ml-1 font-normal normal-case text-slate-400">(illustrative match)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {challenge.collaborators.map((c) => (
              <span
                key={c.name}
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border ${COLLAB_TYPE_STYLE[c.type] || COLLAB_TYPE_STYLE.Research}`}
              >
                {c.name}
                <span className="ml-1 opacity-60">· {c.type}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {challenge.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* University Research Interest Section — only shown for University role */}
        {activeRole === "university" &&
          Array.isArray(verifiedUniversityMatches) &&
          verifiedUniversityMatches.length > 0 && (
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 px-1.5 items-center justify-center rounded text-[9px] font-bold uppercase tracking-wide bg-violet-900 text-white">
                MATCH
              </span>
              <p className="text-[11px] font-bold text-violet-900 uppercase tracking-wider">
                Potential Match — Based on publicly documented capabilities
              </p>
            </div>
            {verifiedUniversityMatches.map((inst) => {
              const alreadyExpressed = interestState?.[`${challenge.id}::${inst.id}`] === true;
              return (
                <div key={inst.id} className="rounded-lg border border-violet-200/80 bg-white p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-violet-900 leading-tight">{inst.name}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{inst.dept}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-700 border border-violet-200 uppercase tracking-wide whitespace-nowrap">
                      Capability Match
                    </span>
                  </div>

                  {/* Facilities snippet */}
                  {inst.facilities && inst.facilities.length > 0 && (
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Facility: </span>
                      {inst.facilities[0]}
                    </p>
                  )}

                  {/* Evidence provenance */}
                  {inst.evidenceSources && inst.evidenceSources.length > 0 && (
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      <span className="font-semibold">Verified via: </span>
                      {inst.evidenceSources[0].title}
                    </p>
                  )}

                  {/* Express Research Interest CTA */}
                  {alreadyExpressed ? (
                    <div
                      id={`interest-expressed-${challenge.id}-${inst.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Research Interest Expressed
                    </div>
                  ) : (
                    <button
                      id={`express-interest-${challenge.id}-${inst.id}`}
                      type="button"
                      onClick={() => onExpressInterest && onExpressInterest(challenge.id, inst)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-900 text-white hover:bg-violet-800 active:bg-violet-950 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 shadow-xs"
                    >
                      Express Research Interest →
                    </button>
                  )}
                </div>
              );
            })}
            <p className="text-[10px] text-violet-600/80 leading-relaxed">
              Expressing interest indicates potential research contribution — not an official partnership or confirmed collaboration.
            </p>
          </div>
        )}

        {/* Industry Implementation Interest Section — only shown for Industry role */}
        {activeRole === "industry" &&
          Array.isArray(verifiedIndustryMatches) &&
          verifiedIndustryMatches.length > 0 && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 px-1.5 items-center justify-center rounded text-[9px] font-bold uppercase tracking-wide bg-teal-900 text-white">
                MATCH
              </span>
              <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wider">
                Potential Match — Based on publicly documented capabilities
              </p>
            </div>
            {verifiedIndustryMatches.map((inst) => {
              const alreadyExpressed = industryInterestState?.[`${challenge.id}::${inst.id}`] === true;
              return (
                <div key={inst.id} className="rounded-lg border border-teal-200/80 bg-white p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-teal-900 leading-tight">{inst.name}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{inst.dept}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-700 border border-teal-200 uppercase tracking-wide whitespace-nowrap">
                      Capability Match
                    </span>
                  </div>

                  {/* Facilities snippet */}
                  {inst.facilities && inst.facilities.length > 0 && (
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Facility: </span>
                      {inst.facilities[0]}
                    </p>
                  )}

                  {/* Evidence provenance */}
                  {inst.evidenceSources && inst.evidenceSources.length > 0 && (
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      <span className="font-semibold">Verified via: </span>
                      {inst.evidenceSources[0].title}
                    </p>
                  )}

                  {/* Express Implementation Interest CTA */}
                  {alreadyExpressed ? (
                    <div
                      id={`implementation-interest-expressed-${challenge.id}-${inst.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      ✓ Implementation Interest Expressed
                    </div>
                  ) : (
                    <button
                      id={`express-implementation-interest-${challenge.id}-${inst.id}`}
                      type="button"
                      onClick={() => onExpressImplementationInterest && onExpressImplementationInterest(challenge.id, inst)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-900 text-white hover:bg-teal-800 active:bg-teal-950 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 shadow-xs"
                    >
                      Express Implementation Interest →
                    </button>
                  )}
                </div>
              );
            })}
            <p className="text-[10px] text-teal-700/80 leading-relaxed">
              Expressing interest indicates potential implementation contribution — not an official partnership or confirmed collaboration.
            </p>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 leading-tight">
            <span className="block font-medium text-slate-700">{challenge.submittedBy}</span>
            <span>
              {challenge.isCitizenSubmission
                ? challenge.submittedAt
                  ? `Submitted ${new Date(challenge.submittedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} • Prototype record`
                  : "Prototype record • Community intake"
                : "Demo challenge • Illustrative record"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {challenge.isCitizenSubmission && onWithdraw && activeRole === "citizen" && (
              <button
                type="button"
                onClick={() => onWithdraw(challenge.id)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Withdraw Report
              </button>
            )}
            <button
              onClick={() => onViewLifecycle(challenge.id)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white border border-transparent hover:bg-slate-800 active:bg-slate-950 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer shrink-0"
            >
              View Challenge →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Challenges() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSeverity, setActiveSeverity] = useState("all");
  const [activeRole, setActiveRoleState] = useState(() => getActiveRole());
  const [citizenChallenges, setCitizenChallenges] = useState(() =>
    getCitizenChallenges({ includeWithdrawn: false })
  );

  /**
   * University interest state — keyed as "challengeId::institutionId" → boolean.
   * Initialised from localStorage on mount so refresh preserves state.
   * Only populated / consulted when activeRole === "university".
   */
  const [interestState, setInterestState] = useState(() => {
    try {
      const raw = localStorage.getItem('samadhan_collab_interests');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return {};
      const map = {};
      for (const r of parsed) {
        if (r && r.challengeId && r.institutionId && r.role === 'university') {
          map[`${r.challengeId}::${r.institutionId}`] = true;
        }
      }
      return map;
    } catch {
      return {};
    }
  });

  /**
   * Industry interest state — keyed as "challengeId::institutionId" → boolean.
   * Initialised from localStorage on mount so refresh preserves state.
   * Only populated / consulted when activeRole === "industry".
   */
  const [industryInterestState, setIndustryInterestState] = useState(() => {
    try {
      const raw = localStorage.getItem('samadhan_collab_interests');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return {};
      const map = {};
      for (const r of parsed) {
        if (r && r.challengeId && r.institutionId && r.role === 'industry') {
          map[`${r.challengeId}::${r.institutionId}`] = true;
        }
      }
      return map;
    } catch {
      return {};
    }
  });

  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const wantsMyReports = Boolean(
    location.state?.tab === "my-reports" ||
    location.state?.viewTab === "my-reports" ||
    new URLSearchParams(location.search).get("tab") === "my-reports" ||
    new URLSearchParams(location.search).get("view") === "my-reports"
  );
  const viewTab = userSelectedTab !== null ? userSelectedTab : (wantsMyReports ? "my-reports" : "all");
  const setViewTab = setUserSelectedTab;
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const refreshCitizenChallenges = useCallback(() => {
    setCitizenChallenges(getCitizenChallenges({ includeWithdrawn: false }));
  }, []);

  /**
   * Sync interest state from localStorage when collaboration store updates
   * (e.g., from another part of the same tab).
   */
  const refreshInterestState = useCallback(() => {
    try {
      const raw = localStorage.getItem('samadhan_collab_interests');
      if (!raw) { setInterestState({}); return; }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { setInterestState({}); return; }
      const map = {};
      for (const r of parsed) {
        if (r && r.challengeId && r.institutionId && r.role === 'university') {
          map[`${r.challengeId}::${r.institutionId}`] = true;
        }
      }
      setInterestState(map);
    } catch {
      setInterestState({});
    }
  }, []);

  /**
   * Sync industry interest state from localStorage when collaboration store updates.
   */
  const refreshIndustryInterestState = useCallback(() => {
    try {
      const raw = localStorage.getItem('samadhan_collab_interests');
      if (!raw) { setIndustryInterestState({}); return; }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { setIndustryInterestState({}); return; }
      const map = {};
      for (const r of parsed) {
        if (r && r.challengeId && r.institutionId && r.role === 'industry') {
          map[`${r.challengeId}::${r.institutionId}`] = true;
        }
      }
      setIndustryInterestState(map);
    } catch {
      setIndustryInterestState({});
    }
  }, []);

  /**
   * Handle a university clicking "Express Research Interest" for a specific institution.
   * Prevents duplicates via collaborationStore; updates local state immediately.
   */
  function handleExpressInterest(challengeId, institution) {
    try {
      expressResearchInterest({
        challengeId,
        institutionId: institution.id,
        institutionName: institution.name,
      });
      // Optimistic local state update — no re-read required
      setInterestState((prev) => ({
        ...prev,
        [`${challengeId}::${institution.id}`]: true,
      }));
      setToastMessage(`✓ Research interest expressed — ${institution.name}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('[Challenges] Failed to express research interest:', err);
    }
  }

  /**
   * Handle an industry partner clicking "Express Implementation Interest" for a specific institution.
   * Prevents duplicates via collaborationStore; updates local state immediately.
   */
  function handleExpressImplementationInterest(challengeId, institution) {
    try {
      expressImplementationInterest({
        challengeId,
        institutionId: institution.id,
        institutionName: institution.name,
      });
      // Optimistic local state update — no re-read required
      setIndustryInterestState((prev) => ({
        ...prev,
        [`${challengeId}::${institution.id}`]: true,
      }));
      setToastMessage(`✓ Implementation interest expressed — ${institution.name}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('[Challenges] Failed to express implementation interest:', err);
    }
  }

  useEffect(() => {
    const handleRoleChange = () => {
      setActiveRoleState(getActiveRole());
    };
    window.addEventListener("samadhan_active_role_change", handleRoleChange);
    window.addEventListener("storage", handleRoleChange);
    window.addEventListener(CHALLENGES_UPDATED_EVENT, refreshCitizenChallenges);
    window.addEventListener(COLLAB_INTEREST_UPDATED_EVENT, refreshInterestState);
    window.addEventListener(COLLAB_INTEREST_UPDATED_EVENT, refreshIndustryInterestState);
    return () => {
      window.removeEventListener("samadhan_active_role_change", handleRoleChange);
      window.removeEventListener("storage", handleRoleChange);
      window.removeEventListener(CHALLENGES_UPDATED_EVENT, refreshCitizenChallenges);
      window.removeEventListener(COLLAB_INTEREST_UPDATED_EVENT, refreshInterestState);
      window.removeEventListener(COLLAB_INTEREST_UPDATED_EVENT, refreshIndustryInterestState);
    };
  }, [refreshCitizenChallenges, refreshInterestState, refreshIndustryInterestState]);

  const baseList = useMemo(() => {
    if (viewTab === "my-reports") {
      return citizenChallenges;
    }
    return [...citizenChallenges, ...CHALLENGES];
  }, [citizenChallenges, viewTab]);

  const filtered = useMemo(() => {
    return baseList.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "all" || c.domain === activeCategory;
      const matchesSeverity = activeSeverity === "all" || c.severity === activeSeverity;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [baseList, search, activeCategory, activeSeverity]);

  function handleViewLifecycle(challengeId) {
    navigate(`/project-lifecycle?challengeId=${encodeURIComponent(challengeId)}`, { state: { challengeId } });
  }

  function handleInitiateWithdraw(id) {
    setWithdrawingId(id);
  }

  function handleConfirmWithdraw() {
    if (!withdrawingId) return;
    const ok = withdrawCitizenChallenge(withdrawingId);
    if (ok) {
      setToastMessage("✓ Community report successfully withdrawn.");
      setTimeout(() => setToastMessage(null), 4000);
      refreshCitizenChallenges();
    }
    setWithdrawingId(null);
  }

  const highCount = baseList.filter((c) => c.severity === "HIGH").length;
  const withdrawingChallenge = withdrawingId
    ? citizenChallenges.find((c) => c.id === withdrawingId)
    : null;

  function clearFilters() {
    setSearch("");
    setActiveCategory("all");
    setActiveSeverity("all");
  }

  const isFiltered = activeCategory !== "all" || activeSeverity !== "all" || search;
  const currentRoleMeta = activeRole ? PLATFORM_ROLES[activeRole] : null;

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Short Explanation */}
      <PageHeader
        title={
          activeRole === "university"
            ? "University / Research Workspace"
            : activeRole === "industry"
            ? "Industry / Implementation Workspace"
            : activeRole === "government"
            ? "Government Review / Challenge Monitoring"
            : activeRole === "citizen"
            ? "Citizen Workspace — Community Problem Tracking"
            : "Explore Challenges"
        }
        description={
          activeRole === "university"
            ? "Research & Validation Perspective — Discover societal challenges aligned with research, laboratory, and technical capabilities."
            : activeRole === "industry"
            ? "Implementation & Scale Perspective — Discover challenges where engineering, technology, implementation, or deployment capabilities may contribute."
            : activeRole === "government"
            ? "Government Review Perspective — Review community challenges, inspect AI-derived capability evidence, and govern progression."
            : activeRole === "citizen"
            ? "Review reported community challenges, track their progress from intake to real-world adoption, and explore collaborative solutions."
            : "Citizen and community submissions aggregated by Samadhan Setu. Each challenge has been categorised, severity-rated, and matched to potential institutional collaborators."
        }
        badge={
          activeRole === "citizen" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-teal-50 text-teal-800 border-teal-200 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
              Community Reports
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {activeRole === "university"
                ? "Research Opportunities"
                : activeRole === "industry"
                ? "Implementation Opportunities"
                : activeRole === "government"
                ? "Governance Review"
                : "Demo Dataset"}
            </span>
          )
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Challenges" },
        ]}
      />

      {/* 2. Role Context (Compact & Quiet) */}
      {currentRoleMeta && (
        <div
          className={`rounded-xl border px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs ${
            activeRole === "university"
              ? "bg-violet-50/70 border-violet-200/80 text-violet-950"
              : activeRole === "industry"
              ? "bg-teal-50/70 border-teal-200/80 text-teal-950"
              : activeRole === "government"
              ? "bg-purple-50/70 border-purple-200/80 text-purple-950"
              : activeRole === "citizen"
              ? "bg-gradient-to-r from-teal-50/90 via-white to-sky-50/40 border-teal-200/90 text-teal-950"
              : "bg-blue-50/70 border-blue-200/80 text-blue-950"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-5 px-1.5 items-center justify-center rounded text-[10px] font-bold tracking-wide uppercase ${
                activeRole === "university"
                  ? "bg-violet-900 text-white"
                  : activeRole === "industry"
                  ? "bg-teal-900 text-white"
                  : activeRole === "government"
                  ? "bg-purple-900 text-white"
                  : activeRole === "citizen"
                  ? "bg-teal-800 text-white shadow-2xs"
                  : "bg-blue-900 text-white"
              }`}
            >
              {currentRoleMeta.name}
            </span>
            <span className="font-bold">{currentRoleMeta.shortPerspective}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-600 hidden sm:inline">{currentRoleMeta.bannerDesc}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            {currentRoleMeta.actionTag}
          </span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs sm:text-sm text-emerald-800 font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 font-bold hover:text-emerald-900 ml-2 cursor-pointer text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* 2.5 Tab Selector: All Challenges vs My Reports */}
      {(activeRole === "citizen" || citizenChallenges.length > 0) && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setViewTab("all")}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewTab === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All Challenges ({citizenChallenges.length + CHALLENGES.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab("my-reports")}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewTab === "my-reports"
                ? "bg-teal-800 text-white shadow-2xs"
                : "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
            }`}
          >
            <span>My Reports</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                viewTab === "my-reports"
                  ? "bg-teal-900 text-white"
                  : "bg-teal-200/80 text-teal-900"
              }`}
            >
              {citizenChallenges.length}
            </span>
          </button>
        </div>
      )}

      {/* 3. Search / Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input
              type="search"
              id="challenge-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, or tag..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center mr-1">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeCategory === cat.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs text-slate-300 self-center mx-1">|</span>
          <span className="text-xs text-slate-400 self-center mr-1">Severity:</span>
          {SEVERITIES.map((sev) => (
            <button
              key={sev.key}
              onClick={() => setActiveSeverity(sev.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeSeverity === sev.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {sev.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results meta */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
        <p>
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{baseList.length}</span> challenges
          <span className="text-slate-400 mx-1.5">•</span>
          <span>{highCount} High Priority</span>
          <span className="text-slate-400 mx-1.5">•</span>
          <span>{citizenChallenges.length} Community Submissions</span>
          {isFiltered && (
            <button onClick={clearFilters} className="ml-3 text-indigo-600 hover:underline cursor-pointer">
              Clear filters
            </button>
          )}
        </p>
        <p className="text-slate-400 italic">
          {viewTab === "my-reports"
            ? "Citizen prototype records • Filtered to your submissions"
            : "Platform catalog • Seeded + Citizen community submissions"}
        </p>
      </div>

      {/* 4. Challenge Cards (One Clear Action: "View Challenge →") */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onViewLifecycle={handleViewLifecycle}
              onWithdraw={handleInitiateWithdraw}
              activeRole={activeRole}
              verifiedUniversityMatches={
                activeRole === "university"
                  ? resolveVerifiedUniversityMatches(challenge)
                  : []
              }
              onExpressInterest={activeRole === "university" ? handleExpressInterest : undefined}
              interestState={activeRole === "university" ? interestState : {}}
              verifiedIndustryMatches={
                activeRole === "industry"
                  ? resolveVerifiedIndustryMatches(challenge)
                  : []
              }
              onExpressImplementationInterest={
                activeRole === "industry" ? handleExpressImplementationInterest : undefined
              }
              industryInterestState={activeRole === "industry" ? industryInterestState : {}}
            />
          ))}
        </div>
      ) : viewTab === "my-reports" ? (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-white border border-slate-200 rounded-xl p-8">
          <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-800 mb-1">No community reports submitted yet</p>
          <p className="text-xs text-slate-500 mb-4 max-w-sm">
            You have not submitted any community problem reports yet. Reports you submit will appear here with live tracking.
          </p>
          <Button variant="primary" to="/report" className="bg-teal-700 hover:bg-teal-800 text-white shadow-xs font-semibold">
            Report a Problem →
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="h-10 w-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <p className="text-base font-semibold text-slate-700 mb-1">No challenges match your filters</p>
          <p className="text-xs text-slate-400 mb-4">Try adjusting your search or clearing the active filters.</p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* 5. Prototype Disclaimer */}
      <div className="border-t border-slate-200 pt-5 pb-2">
        <p className="text-xs text-slate-400 text-center leading-relaxed max-w-2xl mx-auto">
          All challenge records and institutional capability matches shown here are{" "}
          <strong className="font-medium text-slate-500">illustrative demonstration data</strong>{" "}
          created for the Smart India Hackathon 2026 prototype. Collaborator associations are
          potential matches based on publicly documented institutional capabilities &mdash; not confirmed
          partnerships or official endorsements.
        </p>
      </div>

      {/* 6. Withdrawal Confirmation Modal */}
      {withdrawingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center font-bold text-lg text-rose-700">
                !
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Withdraw Community Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will withdraw your prototype submission and remove it from active platform challenges.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 text-xs text-slate-700">
              <p className="font-semibold text-slate-900 mb-0.5">{withdrawingChallenge.title}</p>
              <p className="text-slate-500">{withdrawingChallenge.location}</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setWithdrawingId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmWithdraw}
                className="bg-rose-700 hover:bg-rose-800 text-white"
              >
                Confirm Withdraw
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
