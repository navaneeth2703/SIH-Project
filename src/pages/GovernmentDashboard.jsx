import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  StatusBadge,
} from '../components/ui';
import {
  getAllGovernmentDecisions,
  GOV_DECISION_META,
  PENDING_REVIEW_META,
  GOV_DECISION_CHANGE_EVENT,
} from '../services/governmentDecisions';
import {
  getCollaborationInterestsForChallenge,
  formatCollaborationSummary,
  COLLAB_INTEREST_UPDATED_EVENT,
} from '../services/collaborationStore';
import { getCitizenChallenges } from '../services/challengeStore';
import {
  getAllLifecycleStages,
  LIFECYCLE_STAGE_UPDATED_EVENT,
} from '../services/lifecycleStore';

// ─── Seeded illustrative challenges ──────────────────────────────────────────
const SEEDED_CHALLENGES = [
  {
    id: 'bistupur-traffic',
    title: 'Severe Traffic Congestion and Lack of Public Bus Connectivity',
    location: 'Bistupur, Jamshedpur, Jharkhand',
    category: 'Traffic & Transport',
    severity: 'MEDIUM',
    severityBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    stage: 'Field Testing',
    source: 'seeded',
  },
  {
    id: 'baghmara-groundwater',
    title: 'Severe groundwater discoloration & odor near Baghmara tube-wells',
    location: 'Baghmara, Dhanbad, Jharkhand',
    category: 'Water & Environment',
    severity: 'HIGH',
    severityBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    stage: 'Pilot',
    source: 'seeded',
  },
  {
    id: 'hazaribagh-diagnostic',
    title: 'Diagnostic Lab Access and Vaccine Cold-Chain Uptime in Remote Clusters',
    location: 'Sadar Block, Hazaribagh, Jharkhand',
    category: 'Public Health & Sanitation',
    severity: 'HIGH',
    severityBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    stage: 'Proposal',
    source: 'seeded',
  },
  {
    id: 'bokaro-irrigation',
    title: 'Crop Irrigation Water Scarcity during Non-Monsoon Cycles',
    location: 'Petarwar Cluster, Bokaro, Jharkhand',
    category: 'Agriculture & Irrigation',
    severity: 'MEDIUM',
    severityBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    stage: 'Adopted',
    source: 'seeded',
  },
];

// ─── Potential Collaborators (Documented Capabilities) ───────────────────────
const POTENTIAL_COLLABORATORS = [
  {
    id: 'u-nitjsr',
    name: 'NIT Jamshedpur',
    fullName: 'National Institute of Technology Jamshedpur',
    type: 'Research Institution',
    domain: 'Traffic & Transport • Civic Infrastructure',
    capabilities: ['Intelligent Transportation Systems', 'Urban Traffic Flow Modeling', 'Sustainable Roadway Engineering'],
    challengeId: 'bistupur-traffic',
    institutionRole: 'university',
  },
  {
    id: 'i-tata-motors-jamshedpur',
    name: 'Tata Motors Limited',
    fullName: 'Tata Motors Limited (Jamshedpur Facility)',
    type: 'Industry Organisation',
    domain: 'Commercial Mobility • Transit Platforms',
    capabilities: ['Commercial Mass Transit Solutions', 'Electric Bus Deployment Platforms', 'Connected Fleet Telematics'],
    challengeId: 'bistupur-traffic',
    institutionRole: 'industry',
  },
  {
    id: 'u-env-dhanbad',
    name: 'IIT (ISM) Dhanbad',
    fullName: 'Indian Institute of Technology (ISM) Dhanbad',
    type: 'Research Institution',
    domain: 'Water & Environment • Mining Technology',
    capabilities: ['Groundwater Contaminant Analysis', 'Acid Mine Drainage Remediation', 'Spectral Sensor Testing'],
    challengeId: 'baghmara-groundwater',
    institutionRole: 'university',
  },
  {
    id: 'i-mecon-ranchi',
    name: 'MECON Limited',
    fullName: 'MECON Limited, Ranchi (Govt. of India Enterprise)',
    type: 'Industry Organisation',
    domain: 'Industrial Infrastructure • Water Systems',
    capabilities: ['Modular Water Treatment Engineering', 'Municipal Pumping & Pipeline Design', 'Environmental Impact Assessment'],
    challengeId: 'baghmara-groundwater',
    institutionRole: 'industry',
  },
];

// ─── What Government Can Do (compact guidance) ────────────────────────────────
const GOV_GUIDANCE = [
  'Prioritize high-severity challenges for immediate triage.',
  'Review capability evidence and collaboration interest.',
  'Decide whether the proposed direction should progress.',
  'Monitor lifecycle stages and validate outcomes.',
  'Refer challenges to the relevant department when needed.',
];

export default function GovernmentDashboard() {
  const navigate = useNavigate();

  const [govDecisions, setGovDecisions] = useState(() => getAllGovernmentDecisions());
  const [citizenChallenges, setCitizenChallenges] = useState(() => getCitizenChallenges());
  const [lifecycleStages, setLifecycleStages] = useState(() => getAllLifecycleStages());

  // Reactive sync: re-read from localStorage on any relevant update
  const syncAll = useCallback(() => {
    setGovDecisions(getAllGovernmentDecisions());
    setCitizenChallenges(getCitizenChallenges());
    setLifecycleStages(getAllLifecycleStages());
  }, []);

  useEffect(() => {
    window.addEventListener(GOV_DECISION_CHANGE_EVENT, syncAll);
    window.addEventListener('storage', syncAll);
    window.addEventListener(COLLAB_INTEREST_UPDATED_EVENT, syncAll);
    window.addEventListener(LIFECYCLE_STAGE_UPDATED_EVENT, syncAll);
    return () => {
      window.removeEventListener(GOV_DECISION_CHANGE_EVENT, syncAll);
      window.removeEventListener('storage', syncAll);
      window.removeEventListener(COLLAB_INTEREST_UPDATED_EVENT, syncAll);
      window.removeEventListener(LIFECYCLE_STAGE_UPDATED_EVENT, syncAll);
    };
  }, [syncAll]);

  // Merge seeded + citizen challenges into unified inbox using official lifecycle stages
  const seededRows = SEEDED_CHALLENGES.map((s) => ({
    ...s,
    stage: lifecycleStages[s.id]?.stage || s.stage,
  }));

  const citizenRows = citizenChallenges.map((c) => ({
    id: c.id,
    title: c.title,
    location: c.location || 'Community Area, Jharkhand',
    category: c.category,
    severity: c.severity || 'MEDIUM',
    severityBadge:
      c.severity === 'HIGH'
        ? 'bg-rose-50 text-rose-800 border-rose-200'
        : c.severity === 'LOW'
        ? 'bg-slate-50 text-slate-700 border-slate-200'
        : 'bg-amber-50 text-amber-800 border-amber-200',
    stage: lifecycleStages[c.id]?.stage || c.stage || 'Proposal',
    source: 'citizen',
  }));

const SEVERITY_ORDER = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const STAGE_ORDER = {
  'Field Testing': 5,
  'Pilot': 4,
  'Scale': 3,
  'Adopted': 2,
  'Proposal': 1,
};

  const allChallenges = [...seededRows, ...citizenRows].sort((a, b) => {
    const sevA = SEVERITY_ORDER[a.severity?.toUpperCase()] || 0;
    const sevB = SEVERITY_ORDER[b.severity?.toUpperCase()] || 0;
    if (sevB !== sevA) return sevB - sevA;
    const stageA = STAGE_ORDER[a.stage] || 0;
    const stageB = STAGE_ORDER[b.stage] || 0;
    return stageB - stageA;
  });

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8 md:-my-10 px-4 sm:px-6 lg:px-8 py-8 md:py-10 bg-[#fbfaf7] min-h-[calc(100vh-4rem)] space-y-7">

      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Government Dashboard' },
        ]}
        badge={<Badge variant="neutral" className="bg-amber-50 text-amber-900 border-amber-200 font-semibold">GOVERNMENT WORKSPACE</Badge>}
        title="Government Dashboard"
        description="Review reported challenges, collaboration interest, and lifecycle status. Make decisions that close the loop for all stakeholders."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>Demonstration Environment</span>
            </div>
          </div>
        }
      />

      {/* ─── ROLE CONTEXT BANNER / HERO AREA ─────────────────────────────── */}
      <div className="rounded-xl border border-stone-300/80 bg-white shadow-xs overflow-hidden">
        {/* Crisp saffron-to-emerald hairline accent */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-600" aria-hidden="true" />
        
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-black text-sm border border-amber-400/30 shadow-xs ring-1 ring-slate-900/10">
              GOV
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase">
                  CENTRAL ADMINISTRATIVE WORKSPACE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-300/80">
                  REVIEW &amp; GOVERN
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight mt-0.5">
                Government Review &amp; Triage Control Center
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Prioritize reported challenges, evaluate institutional capability evidence, and govern pilot-to-adoption progression.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs border-t lg:border-t-0 lg:border-l border-stone-200 pt-3 lg:pt-0 lg:pl-5 shrink-0">
            <div className="rounded-lg bg-stone-50 border border-stone-200/90 px-3.5 py-2">
              <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase block">
                OPERATIONAL PRINCIPLE
              </span>
              <span className="text-xs font-bold text-slate-950 block mt-0.5">
                AI recommends. Government decides.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROTOTYPE DISCLAIMER ─────────────────────────────────────────── */}
      <div className="rounded-xl bg-amber-50/90 border border-amber-200/90 p-3.5 flex items-start gap-3 shadow-2xs">
        <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
        </svg>
        <p className="text-xs font-medium text-amber-950 leading-relaxed">
          <span className="font-bold">Prototype dashboard</span> — all challenge records, statuses, and decisions are illustrative and would be replaced by verified platform data in deployment.
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Illustrative Demonstration</span>
        </p>
      </div>

      {/* ─── CHALLENGE INBOX (SECTION 01) ───────────────────────────────── */}
      <Card variant="standard" className="border-stone-300/80 bg-white shadow-xs overflow-hidden">
        {/* Saffron-to-emerald administrative rail */}
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-600" aria-hidden="true" />
        <CardHeader className="border-b border-stone-200/80 pb-4 bg-stone-50/40">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/80">
                  01 / CHALLENGE REVIEW
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Administrative Triage Inbox
                </span>
              </div>
              <CardTitle as="h2" className="text-lg font-bold text-slate-950">Challenges for Review</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Review reported societal challenges, collaboration interest, and progression status.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200 bg-amber-50/70 text-amber-900 font-semibold text-[10px]">
                ■ Illustrative Demo
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[10px]">
                ■ Community Submission
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" id="gov-challenge-inbox">
              <thead className="bg-stone-100/90 border-b border-stone-200 text-slate-700 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Challenge &amp; Location</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Collaboration Interest</th>
                  <th className="py-2.5 px-3">Gov Decision</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70 text-slate-700">
                {allChallenges.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4 text-center text-slate-400 text-xs">
                      No challenges in the registry yet. Seeded illustrative demos will appear here.
                    </td>
                  </tr>
                ) : (
                  allChallenges.map((item) => {
                    const dec = govDecisions[item.id];
                    const decMeta = dec ? GOV_DECISION_META[dec.decision] : PENDING_REVIEW_META;
                    const collab = getCollaborationInterestsForChallenge(item.id);
                    const isSeeded = item.source === 'seeded';
                    const severityBorder =
                      item.severity?.toUpperCase() === 'HIGH'
                        ? 'border-l-4 border-l-amber-500'
                        : item.severity?.toUpperCase() === 'LOW'
                        ? 'border-l-4 border-l-slate-300'
                        : 'border-l-4 border-l-amber-300';

                    return (
                      <tr key={item.id} className={`hover:bg-amber-50/25 transition-colors ${severityBorder}`}>
                        {/* Challenge title + location (compact & readable) */}
                        <td className="py-2.5 px-4 min-w-[280px] max-w-sm">
                          <p className="font-semibold text-slate-900 text-xs leading-snug">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {item.location}
                          </p>
                        </td>

                        {/* Source badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isSeeded ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50/80 text-amber-900 border border-amber-200">
                              Illustrative Demo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Community Submission
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        </td>

                        {/* Severity */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${item.severityBadge}`}>
                            {item.severity}
                          </span>
                        </td>

                        {/* Current lifecycle stage */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge status={item.stage} size="sm" />
                        </td>

                        {/* Collaboration interest */}
                        <td className="py-2.5 px-3">
                          {collab.total > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              {formatCollaborationSummary(collab)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">No interest yet</span>
                          )}
                        </td>

                        {/* Government decision */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${decMeta.badgeColor}`}>
                            <span className={`h-1 w-1 rounded-full ${decMeta.badgeDot}`} />
                            {decMeta.shortLabel}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <Button
                            id={`gov-view-lifecycle-${item.id}`}
                            onClick={() => navigate('/project-lifecycle', { state: { challengeId: item.id } })}
                            variant="primary"
                            size="sm"
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs py-1 px-3"
                          >
                            View Lifecycle →
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── POTENTIAL COLLABORATORS (SECTION 02) ───────────────────────── */}
      <Card variant="standard" className="border-stone-300/80 bg-white shadow-xs overflow-hidden">
        <div className="h-[2px] w-full bg-gradient-to-r from-stone-400 via-stone-300 to-slate-400" aria-hidden="true" />
        <CardHeader className="border-b border-stone-200/80 pb-4 bg-stone-50/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                02 / CAPABILITY MATCHING
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Documented Capabilities
              </span>
            </div>
            <CardTitle as="h2" className="text-lg font-bold text-slate-950">Potential Collaborators</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Potential matches from documented institutional capabilities — not confirmed partnerships.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {POTENTIAL_COLLABORATORS.map((inst) => {
              const collab = getCollaborationInterestsForChallenge(inst.challengeId);
              const hasExpressedInterest =
                inst.institutionRole === 'university'
                  ? collab.university.some((r) => r.institutionId === inst.id)
                  : collab.industry.some((r) => r.institutionId === inst.id);

              return (
                <div
                  key={inst.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {inst.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{inst.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{inst.fullName}</p>
                    <p className="text-[11px] font-semibold text-slate-700 mt-2">
                      Domain: <span className="text-slate-900 font-medium">{inst.domain}</span>
                    </p>
                    <ul className="mt-2 space-y-0.5">
                      {inst.capabilities.map((cap) => (
                        <li key={cap} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    {hasExpressedInterest ? (
                      inst.institutionRole === 'university' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          ✓ Research Interest Expressed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                          ✓ Implementation Interest Expressed
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Potential Match
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── WHAT GOVERNMENT CAN DO (SECTION 03) ───────────────────────── */}
      <Card variant="standard" className="border-stone-300/80 bg-white shadow-xs overflow-hidden">
        <div className="h-[2px] w-full bg-gradient-to-r from-amber-500/70 via-stone-300 to-emerald-500/50" aria-hidden="true" />
        <CardHeader className="border-b border-stone-200/80 pb-3 bg-stone-50/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              03 / ADMINISTRATIVE ACTION
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Governance Protocols
            </span>
          </div>
          <CardTitle as="h2" className="text-base font-bold text-slate-950">What Government Can Do</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {GOV_GUIDANCE.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-stone-200/80 bg-stone-50/50 hover:bg-white transition-colors shadow-2xs"
              >
                <span className="flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-400 text-xs font-mono font-bold shadow-2xs border border-amber-400/20">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed pt-0.5">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── BOTTOM CTA ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-stone-300/80 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Explore the Full Problem Resolution Journey</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect how challenges are classified, matched, and tracked through field validation stages.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" size="sm" to="/ai-analysis">
            View AI Analysis
          </Button>
          <Button
            onClick={() => navigate('/project-lifecycle', { state: { challengeId: 'bistupur-traffic' } })}
            variant="primary"
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
          >
            Inspect Project Lifecycle →
          </Button>
        </div>
      </div>

    </div>
  );
}
