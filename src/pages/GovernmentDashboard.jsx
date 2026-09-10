import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  StatCard,
  StatusBadge,
} from '../components/ui';
import {
  getAllGovernmentDecisions,
  GOV_DECISION_META,
  PENDING_REVIEW_META,
} from '../services/governmentDecisions';

// ─── Summary KPI Indicators (Illustrative Demo Figures) ──────────────────────
const SUMMARY_CARDS = [
  {
    label: 'Reported Challenges',
    value: '24',
    description: 'Citizen & community submissions',
    change: 'Demo intake',
    changeType: 'neutral',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: 'High Priority',
    value: '9',
    description: 'Require immediate institutional triage',
    change: 'Urgent attention',
    changeType: 'negative',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: 'Active Projects',
    value: '5',
    description: 'Progressing across lifecycle stages',
    change: 'Field testing focus',
    changeType: 'positive',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    label: 'Verified Capability Profiles',
    value: '10',
    description: '5 Research • 5 Industry',
    change: 'Capability-matched',
    changeType: 'neutral',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
];

// ─── Demonstration Challenges (surfaced based on severity & category) ────────
const DEMO_CHALLENGES = [
  {
    id: 'ch-traffic-bistupur',
    challengeId: 'bistupur-traffic',
    title: 'Severe Traffic Congestion and Lack of Public Bus Connectivity',
    location: 'Bistupur, Jamshedpur, Jharkhand',
    category: 'Traffic & Transport',
    severity: 'MEDIUM',
    severityBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    stage: 'Field Testing',
    actionText: 'View Lifecycle →',
    actionHref: '/project-lifecycle',
    actionVariant: 'primary',
    collaborators: 'NIT Jamshedpur & Tata Motors',
  },
  {
    id: 'ch-water-baghmara',
    challengeId: 'baghmara-groundwater',
    title: 'Severe groundwater discoloration & odor near Baghmara tube-wells',
    location: 'Baghmara, Dhanbad, Jharkhand',
    category: 'Water & Environment',
    severity: 'HIGH',
    severityBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    stage: 'Pilot',
    actionText: 'View Lifecycle →',
    actionHref: '/project-lifecycle',
    actionVariant: 'primary',
    collaborators: 'IIT (ISM) Dhanbad & MECON Limited',
  },
  {
    id: 'ch-health-hazaribagh',
    challengeId: 'hazaribagh-diagnostic',
    title: 'Diagnostic Lab Access and Vaccine Cold-Chain Uptime in Remote Clusters',
    location: 'Sadar Block, Hazaribagh, Jharkhand',
    category: 'Public Health & Sanitation',
    severity: 'HIGH',
    severityBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    stage: 'Proposal',
    actionText: 'View Lifecycle →',
    actionHref: '/project-lifecycle',
    actionVariant: 'primary',
    collaborators: 'RIMS Ranchi & Apollo Hospitals Enterprise Limited',
  },
  {
    id: 'ch-agri-bokaro',
    challengeId: 'bokaro-irrigation',
    title: 'Crop Irrigation Water Scarcity during Non-Monsoon Cycles',
    location: 'Petarwar Cluster, Bokaro, Jharkhand',
    category: 'Agriculture & Irrigation',
    severity: 'MEDIUM',
    severityBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    stage: 'Adopted',
    actionText: 'View Lifecycle →',
    actionHref: '/project-lifecycle',
    actionVariant: 'primary',
    collaborators: 'Birsa Agricultural University & National Seeds Corporation Limited',
  },
];

// ─── Lifecycle Pipeline Distribution ─────────────────────────────────────────
const LIFECYCLE_STAGES = [
  {
    num: '01',
    name: 'Proposal',
    status: 'Proposal',
    desc: 'Problem boundary scoped; capability matches identified',
    activeCount: '1 Demo Project',
    isFocus: false,
  },
  {
    num: '02',
    name: 'Pilot',
    status: 'Pilot',
    desc: 'Controlled prototype validation under simulation',
    activeCount: '1 Demo Project',
    isFocus: false,
  },
  {
    num: '03',
    name: 'Field Testing',
    status: 'Field Testing',
    desc: 'Community validation against baseline criteria',
    activeCount: '2 Demo Projects',
    isFocus: true,
  },
  {
    num: '04',
    name: 'Scale',
    status: 'Scale',
    desc: 'Corridor expansion & procurement review',
    activeCount: '0 Pending',
    isFocus: false,
  },
  {
    num: '05',
    name: 'Adopted',
    status: 'Adopted',
    desc: 'Operational transfer to civic authority',
    activeCount: '1 Demo Project',
    isFocus: false,
  },
];

// ─── Potential Collaborators (Documented Institutional Capabilities) ──────────
const POTENTIAL_COLLABORATORS = [
  {
    name: 'NIT Jamshedpur',
    fullName: 'National Institute of Technology Jamshedpur',
    type: 'Research Institution',
    domain: 'Traffic & Transport • Civic Infrastructure',
    capabilities: [
      'Intelligent Transportation Systems',
      'Urban Traffic Flow Modeling',
      'Sustainable Roadway Engineering',
    ],
    demoChallenge: 'Bistupur Traffic Congestion',
  },
  {
    name: 'Tata Motors',
    fullName: 'Tata Motors Limited (Jamshedpur Facility)',
    type: 'Industry Organisation',
    domain: 'Commercial Mobility • Transit Platforms',
    capabilities: [
      'Commercial Mass Transit Solutions',
      'Electric Bus Deployment Platforms',
      'Connected Fleet Telematics (Fleet Edge)',
    ],
    demoChallenge: 'Bistupur Public Bus Connectivity',
  },
  {
    name: 'IIT (ISM) Dhanbad',
    fullName: 'Indian Institute of Technology (ISM) Dhanbad',
    type: 'Research Institution',
    domain: 'Water & Environment • Mining Technology',
    capabilities: [
      'Groundwater Contaminant Analysis',
      'Acid Mine Drainage Remediation',
      'Spectral Sensor Testing',
    ],
    demoChallenge: 'Baghmara Groundwater Remediation',
  },
  {
    name: 'MECON Limited',
    fullName: 'MECON Limited, Ranchi (Govt. of India Enterprise)',
    type: 'Industry Organisation',
    domain: 'Industrial Infrastructure • Water Systems',
    capabilities: [
      'Modular Water Treatment Engineering',
      'Municipal Pumping & Pipeline Design',
      'Environmental Impact Assessment',
    ],
    demoChallenge: 'Baghmara Mine Drainage Filtration',
  },
];

// ─── Government Role (What Government Can Do) ─────────────────────────────────
const GOV_ACTIONS = [
  {
    num: '01',
    title: 'Prioritize high-severity challenges',
    desc: 'Triage incoming citizen submissions based on civic urgency, severity classification, and population impact.',
  },
  {
    num: '02',
    title: 'Review potential collaborator matches',
    desc: 'Evaluate explainable AI recommendations matching research institutions and industry capabilities to problem boundaries.',
  },
  {
    num: '03',
    title: 'Monitor project progress',
    desc: 'Oversee milestone verification through the transparent 5-stage lifecycle from proposal through field testing.',
  },
  {
    num: '04',
    title: 'Review evidence before scale-up',
    desc: 'Inspect field testing data and community feedback against defined baseline parameters before sanctioning wider deployment.',
  },
];

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  // Session problem initialized lazily to prevent synchronous setState within useEffect
  const [currentProblem] = useState(() => {
    try {
      const stored = sessionStorage.getItem('samadhan_current_problem');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.title) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [currentAnalysis] = useState(() => {
    try {
      const stored = sessionStorage.getItem('samadhan_current_analysis');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });

  const [projectStage] = useState(() => {
    try {
      const stored = sessionStorage.getItem('samadhan_project_stage');
      if (stored) return stored;
    } catch {
      // ignore
    }
    return 'Field Testing';
  });

  const [govDecisions, setGovDecisions] = useState(() => getAllGovernmentDecisions());

  useEffect(() => {
    const handleSync = () => setGovDecisions(getAllGovernmentDecisions());
    window.addEventListener('samadhan_gov_decision_change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('samadhan_gov_decision_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const activeTopChallengeKey = currentProblem
    ? (currentProblem.id || 'custom-session-problem')
    : 'bistupur-traffic';
  const activeTopDecision = govDecisions[activeTopChallengeKey];
  const activeTopDecisionMeta = activeTopDecision
    ? GOV_DECISION_META[activeTopDecision.decision]
    : PENDING_REVIEW_META;

  return (
    <div className="space-y-8">

      {/* ─── 1. HEADER ────────────────────────────────────────────────────── */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Government Dashboard' },
        ]}
        badge={<Badge variant="neutral">PROTOTYPE DASHBOARD</Badge>}
        title="Government Dashboard"
        description="Prioritize societal challenges, monitor solution progress, and coordinate potential collaborators."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>Demonstration Environment</span>
            </div>
            <Button
              onClick={() => navigate('/project-lifecycle', { state: { challengeId: 'bistupur-traffic' } })}
              variant="secondary"
              size="sm"
            >
              View Project Lifecycle →
            </Button>
          </div>
        }
      />

      {/* Role Context Indicator: Government Review Workspace */}
      <div className="rounded-xl border border-purple-200/90 bg-purple-50/70 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-900 text-white font-bold text-xs shadow-2xs">
            GOV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                Government Review Workspace
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                REVIEW &amp; GOVERN
              </span>
            </div>
            <p className="text-xs text-purple-800 mt-0.5">
              Prioritize challenges, review evidence, and guide progression.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-purple-200/80 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Operational Principle</span>
            <span className="font-bold text-slate-900">AI recommends. Government decides.</span>
          </div>
          <div className="h-6 w-px bg-purple-200/70" />
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Role</span>
            <span className="text-slate-700 font-medium">Government Administrator</span>
          </div>
        </div>
      </div>

      {/* ─── 7. PROTOTYPE DISCLAIMER ──────────────────────────────────────── */}
      <div className="rounded-xl bg-amber-50/90 border border-amber-200/90 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900 font-bold text-sm" aria-hidden="true">
            <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm font-medium text-amber-950">
            <span className="font-bold">Prototype dashboard</span> — figures, statuses and challenge records are illustrative and would be replaced by verified platform data in deployment.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded border border-amber-200 shrink-0">
          Illustrative Demonstration
        </span>
      </div>

      {/* ─── ACTIVE DEMO FOCUS — always shown, consistent with Project Lifecycle ── */}
      <Card variant="standard" className="border-indigo-300 bg-indigo-50/40 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-900 text-white shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                {currentProblem ? 'Active Citizen Submission (Current Session)' : 'Active Demo Focus'}
              </span>
              <span className="text-xs font-semibold text-indigo-900 bg-white border border-indigo-200 px-2 py-0.5 rounded">
                {currentProblem
                  ? (currentAnalysis?.primaryClassification || currentProblem.category)
                  : 'Traffic & Transport'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                •{' '}
                {currentProblem ? currentProblem.location : 'Bistupur, Jamshedpur, Jharkhand'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {currentProblem
                ? currentProblem.title
                : 'Severe Traffic Congestion and Lack of Public Bus Connectivity'}
            </h3>
            {currentProblem ? (
              currentAnalysis?.partners && currentAnalysis.partners.length > 0 ? (
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-800">Identified Potential Collaborators:</strong>{' '}
                  {currentAnalysis.partners.map((p) => p.name).join(' & ')}
                </p>
              ) : (
                <p className="text-xs text-slate-600">
                  {currentProblem.description?.slice(0, 140)}...
                </p>
              )
            ) : (
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Potential Collaborators:</strong>{' '}
                NIT Jamshedpur &amp; Tata Motors — capability-matched for transport engineering and commercial transit solutions.
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-indigo-100 flex-wrap sm:flex-nowrap">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Stage
              </span>
              <StatusBadge status={currentProblem ? projectStage : 'Field Testing'} size="sm" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Government Review
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${activeTopDecisionMeta.badgeColor}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${activeTopDecisionMeta.badgeDot}`} />
                {activeTopDecisionMeta.shortLabel}
              </span>
            </div>
            <Button
              onClick={() => {
                if (currentProblem) {
                  // Flow A: user came via Report → AI Analysis; let Project read from session.
                  navigate('/project-lifecycle');
                } else {
                  // Flow B: no session — open Bistupur demo challenge explicitly.
                  navigate('/project-lifecycle', { state: { challengeId: 'bistupur-traffic' } });
                }
              }}
              variant="primary"
              size="sm"
              className="bg-indigo-900 hover:bg-indigo-800 shrink-0"
            >
              Inspect Lifecycle →
            </Button>
          </div>
        </div>
      </Card>

      {/* ─── 2. SUMMARY ROW ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
          <span>Demonstration Intake &amp; Resolution Overview</span>
          <span className="text-[11px] text-slate-400">
            Illustrative prototype figures
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_CARDS.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              description={card.description}
              change={card.change}
              changeType={card.changeType}
              icon={card.icon}
            />
          ))}
        </div>
      </div>

      {/* ─── 3. PRIORITY CHALLENGES (MAIN SECTION) ────────────────────────── */}
      <Card variant="standard">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 mb-1">
                Triage &amp; Intake
              </div>
              <CardTitle as="h2" className="text-lg">Priority Challenges</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Challenges surfaced for review based on severity, category and reported impact.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium shrink-0">
              Demonstration records • Not real government cases
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Challenge &amp; Location</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Potential Collaborators</th>
                  <th className="py-3.5 px-6 text-right">Potential Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {DEMO_CHALLENGES.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <p className="font-bold text-slate-900 leading-snug">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {item.location}
                      </p>
                      <div className="mt-1.5">
                        {(() => {
                          const itemDec = govDecisions[item.challengeId];
                          const itemMeta = itemDec ? GOV_DECISION_META[itemDec.decision] : PENDING_REVIEW_META;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${itemMeta.badgeColor}`}>
                              <span className={`h-1 w-1 rounded-full ${itemMeta.badgeDot}`} />
                              {itemMeta.statusLabel}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${item.severityBadge}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={item.stage} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs leading-snug">
                      <p className="text-xs font-medium text-slate-800">{item.collaborators}</p>
                      <p className="text-[10px] text-slate-400">Capability-matched</p>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Button
                        onClick={() => {
                          if (item.actionHref === '/project-lifecycle') {
                            navigate('/project-lifecycle', { state: { challengeId: item.challengeId } });
                          } else {
                            navigate(item.actionHref);
                          }
                        }}
                        variant="primary"
                        size="sm"
                        className="bg-indigo-900 hover:bg-indigo-800"
                      >
                        {item.actionText}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── 4. SOLUTION PROGRESS ─────────────────────────────────────────── */}
      <Card variant="standard">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                Solution Pipeline
              </div>
              <CardTitle as="h2" className="text-lg">Solution Progress</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized progression through five transparent verification stages.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium shrink-0">
              Proposal → Pilot → Field Testing → Scale → Adopted
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Horizontal 5-stage pipeline representation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {LIFECYCLE_STAGES.map((st) => (
              <div
                key={st.num}
                className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all ${
                  st.isFocus
                    ? 'border-indigo-300 bg-indigo-50/70 ring-2 ring-indigo-400/20 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded text-xs font-extrabold bg-white border border-slate-300 text-slate-800">
                      {st.num}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded">
                      {st.activeCount}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{st.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{st.desc}</p>
                </div>
                <div>
                  <StatusBadge status={st.status} size="sm" />
                </div>
              </div>
            ))}
          </div>

          {/* Traffic demonstration active card */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-white">
                  Active Demo Focus
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Severe Traffic Congestion and Lack of Public Bus Connectivity (Bistupur, Jamshedpur)
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Current Stage: <strong className="text-indigo-950">Field Testing</strong> • Status: <span className="text-slate-600">Prototype workflow in progress</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Potential Collaborators: NIT Jamshedpur (Transport Engineering) + Tata Motors (Commercial Transit Fleets)
              </p>
            </div>
            <Button
              onClick={() => navigate('/project-lifecycle', { state: { challengeId: 'bistupur-traffic' } })}
              variant="primary"
              size="sm"
              className="bg-indigo-900 hover:bg-indigo-800 shrink-0"
            >
              Explore Full Lifecycle →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── 5. POTENTIAL COLLABORATORS ───────────────────────────────────── */}
      <Card variant="standard">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-800 border border-violet-200 mb-1">
                Capability Matching
              </div>
              <CardTitle as="h2" className="text-lg">Potential Collaborators</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Potential matches identified from documented institutional capabilities — not confirmed partnerships.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-medium shrink-0">
              Verified Capability Registry
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {POTENTIAL_COLLABORATORS.map((inst) => (
              <div
                key={inst.name}
                className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {inst.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{inst.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{inst.fullName}</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-2">
                    Domain: <span className="text-indigo-950 font-normal">{inst.domain}</span>
                  </p>
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Seeded Capabilities:
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-0.5">
                      {inst.capabilities.map((cap) => (
                        <li key={cap} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">Demo Challenge Match:</p>
                  <p className="text-[11px] font-semibold text-slate-800 leading-tight mt-0.5">{inst.demoChallenge}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── 6. GOVERNMENT ROLE (WHAT GOVERNMENT CAN DO) ─────────────────── */}
      <Card variant="standard">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-1">
            Administrative Purpose
          </div>
          <CardTitle as="h2" className="text-lg">What Government Can Do</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Core administrative oversight touchpoints facilitated by the Samadhan Setu platform.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GOV_ACTIONS.map((action) => (
              <div
                key={action.num}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-900 text-white text-xs font-extrabold mb-2.5">
                    {action.num}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{action.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{action.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-indigo-700 font-semibold uppercase tracking-wider">
                  Administrative Action
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── 8. BOTTOM NAVIGATION CTA ─────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Explore the End-to-End Problem Resolution Journey
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Inspect how citizen problems are classified with explainable AI, matched to verified institutions, and tracked through structured field validation stages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto flex-wrap">
          <Button variant="secondary" size="md" to="/ai-analysis">
            View AI Analysis
          </Button>
          <Button
            onClick={() => navigate('/project-lifecycle', { state: { challengeId: 'bistupur-traffic' } })}
            variant="primary"
            size="md"
            className="bg-indigo-900 hover:bg-indigo-800"
          >
            Inspect Project Lifecycle →
          </Button>
        </div>
      </div>

    </div>
  );
}
