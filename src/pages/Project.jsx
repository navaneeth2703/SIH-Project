import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getActiveRole } from '../services/roleState';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
} from '../components/ui';
import {
  getGovernmentDecision,
  setGovernmentDecision,
  GOV_DECISION_META,
  PENDING_REVIEW_META,
} from '../services/governmentDecisions';

// --- Seeded project knowledge-base (mirrors AiAnalysis category system) -
const DEFAULT_CHALLENGE = {
  title: 'Severe Traffic Congestion and Lack of Public Bus Connectivity',
  category: 'Traffic & Transport',
  description:
    'Residents report severe traffic congestion and inadequate public bus connectivity causing long commute times and reduced productivity.',
  location: 'Bistupur, Jamshedpur, Jharkhand',
};

const CATEGORIES_DB = [
  {
    id: 'traffic',
    label: 'Traffic & Transport',
    keywords: ['traffic', 'road', 'roads', 'roadblock', 'road blocks', 'road block', 'congestion', 'vehicles', 'transport', 'highway', 'pothole', 'signal', 'commute', 'jam', 'bus', 'connectivity'],
    severity: 'MEDIUM',
    university: 'NIT Jamshedpur',
    industry: 'Tata Motors',
    metrics: [
      { value: '3', label: 'Road segments monitored' },
      { value: '42%', label: 'Traffic flow improvement target' },
      { value: '68%', label: 'Field testing progress' },
      { value: '1', label: 'Community pilot zone' },
    ],
  },
  {
    id: 'water',
    label: 'Water & Environment',
    keywords: ['groundwater', 'water', 'pollution', 'contamination', 'mining', 'drainage', 'sewage', 'flooding', 'river', 'lake', 'borewell', 'tube-well'],
    severity: 'HIGH',
    university: 'IIT (ISM) Dhanbad',
    industry: 'MECON Limited',
    metrics: [
      { value: '6', label: 'Water monitoring stations' },
      { value: '45%', label: 'Turbidity reduction target' },
      { value: '68%', label: 'Field testing progress' },
      { value: '1,240', label: 'Residents in pilot reach' },
    ],
  },
  {
    id: 'healthcare',
    label: 'Public Health & Sanitation',
    keywords: ['hospital', 'healthcare', 'health', 'doctor', 'medicine', 'ambulance', 'clinic', 'disease', 'sanitation', 'hygiene', 'vaccination', 'diagnostic', 'lab', 'vaccine', 'cold-chain'],
    severity: 'HIGH',
    university: 'RIMS Ranchi',
    industry: 'Apollo Hospitals Enterprise Limited',
    metrics: [
      { value: '8', label: 'Primary health centres covered' },
      { value: '3,400', label: 'Patients in pilot reach' },
      { value: '68%', label: 'Field testing progress' },
      { value: '22', label: 'Health workers engaged' },
    ],
  },
  {
    id: 'agriculture',
    label: 'Agriculture & Irrigation',
    keywords: ['crop', 'farming', 'irrigation', 'agriculture', 'drought', 'farmer', 'soil', 'harvest', 'pesticide', 'fertilizer', 'rain', 'field'],
    severity: 'HIGH',
    university: 'Birsa Agricultural University',
    industry: 'National Seeds Corporation Limited',
    metrics: [
      { value: '640 ha', label: 'Farmland under monitoring' },
      { value: '180', label: 'Smallholders in pilot' },
      { value: '68%', label: 'Field testing progress' },
      { value: '6', label: 'Villages covered' },
    ],
  },
];

const OTHER_CATEGORY = {
  id: 'other',
  label: 'Civic & Community Challenge',
  severity: 'MEDIUM',
  university: 'Potential collaborators will be identified from verified capability profiles.',
  industry: null,
  metrics: [
    { value: '5', label: 'Community sites monitored' },
    { value: '580', label: 'Residents in pilot reach' },
    { value: '68%', label: 'Field testing progress' },
    { value: '3', label: 'Civic bodies engaged' },
  ],
};

// --- Seeded challenge lookup: keyed by slug, used when navigating from Dashboard/Challenges
// These override sessionStorage so the explicitly-selected challenge is always shown correctly.
const SEEDED_CHALLENGES = {
  'bistupur-traffic': {
    challenge: {
      title: 'Severe Traffic Congestion and Lack of Public Bus Connectivity',
      category: 'Traffic & Transport',
      description:
        'Residents report severe traffic congestion and inadequate public bus connectivity causing long commute times and reduced productivity.',
      location: 'Bistupur, Jamshedpur, Jharkhand',
    },
    project: {
      id: 'traffic',
      label: 'Traffic & Transport',
      severity: 'MEDIUM',
      university: 'NIT Jamshedpur',
      industry: 'Tata Motors',
      metrics: [
        { value: '3', label: 'Road segments monitored' },
        { value: '42%', label: 'Traffic flow improvement target' },
        { value: '68%', label: 'Field testing progress' },
        { value: '1', label: 'Community pilot zone' },
      ],
    },
  },
  'baghmara-groundwater': {
    challenge: {
      title: 'Severe groundwater discoloration & odor near Baghmara tube-wells',
      category: 'Water & Environment',
      description:
        'Residents report severe discoloration and odor in groundwater from tube-wells near Baghmara, likely linked to mine drainage contamination.',
      location: 'Baghmara, Dhanbad, Jharkhand',
    },
    project: {
      id: 'water',
      label: 'Water & Environment',
      severity: 'HIGH',
      university: 'IIT (ISM) Dhanbad',
      industry: 'MECON Limited',
      metrics: [
        { value: '6', label: 'Water monitoring stations' },
        { value: '45%', label: 'Turbidity reduction target' },
        { value: '68%', label: 'Field testing progress' },
        { value: '1,240', label: 'Residents in pilot reach' },
      ],
    },
  },
  'hazaribagh-diagnostic': {
    challenge: {
      title: 'Diagnostic Lab Access and Vaccine Cold-Chain Uptime in Remote Clusters',
      category: 'Public Health & Sanitation',
      description:
        'Remote clusters in Sadar Block report inadequate diagnostic lab access and frequent cold-chain failures affecting vaccine availability.',
      location: 'Sadar Block, Hazaribagh, Jharkhand',
    },
    project: {
      id: 'healthcare',
      label: 'Public Health & Sanitation',
      severity: 'HIGH',
      university: 'RIMS Ranchi',
      industry: 'Apollo Hospitals Enterprise Limited',
      metrics: [
        { value: '8', label: 'Primary health centres covered' },
        { value: '3,400', label: 'Patients in pilot reach' },
        { value: '68%', label: 'Field testing progress' },
        { value: '22', label: 'Health workers engaged' },
      ],
    },
  },
  'bokaro-irrigation': {
    challenge: {
      title: 'Crop Irrigation Water Scarcity during Non-Monsoon Cycles',
      category: 'Agriculture & Irrigation',
      description:
        'Smallholder farmers in the Petarwar cluster report severe water scarcity for crop irrigation during non-monsoon periods.',
      location: 'Petarwar Cluster, Bokaro, Jharkhand',
    },
    project: {
      id: 'agriculture',
      label: 'Agriculture & Irrigation',
      severity: 'MEDIUM',
      university: 'Birsa Agricultural University',
      industry: 'National Seeds Corporation Limited',
      metrics: [
        { value: '640 ha', label: 'Farmland under monitoring' },
        { value: '180', label: 'Smallholders in pilot' },
        { value: '68%', label: 'Field testing progress' },
        { value: '6', label: 'Villages covered' },
      ],
    },
  },
};

function deriveProject(challenge) {
  const haystack = `${challenge.title} ${challenge.description}`.toLowerCase();
  let matched = null;
  let bestScore = 0;
  for (const cat of CATEGORIES_DB) {
    let hits = 0;
    for (const kw of cat.keywords) {
      if (haystack.includes(kw)) hits++;
    }
    if (hits > bestScore) {
      bestScore = hits;
      matched = cat;
    }
  }
  if (!matched || bestScore === 0) {
    const catLower = (challenge.category || '').toLowerCase();
    matched = CATEGORIES_DB.find(
      (c) => catLower.includes(c.id) || c.label.toLowerCase().includes(catLower)
    ) || null;
  }
  return { ...(matched || OTHER_CATEGORY) };
}

// --- Lifecycle stages configuration -
const STAGES_CONFIG = [
  {
    num: '01',
    label: 'Proposal',
    shortDesc: 'Define the challenge, scope and potential collaborators.',
    whatHappens:
      'The challenge is formally scoped. AI analysis identifies potential collaborators based on capability alignment. A preliminary technical roadmap and objective set is prepared.',
    nextStep: 'Develop and test an initial solution prototype with identified collaborators.',
    protoStatus: 'DONE — Scope defined, potential collaborators identified',
    actions: [
      'Problem boundary definition and stakeholder needs assessment',
      'Potential research collaborator identified through capability matching',
      'Potential industry collaborator identified through capability matching',
      'Civic administration notified; resource scope outlined',
    ],
    phaseState: 'Stage 01 Phase',
    milestoneTarget: 'Scope Baseline',
    progress: 100,
  },
  {
    num: '02',
    label: 'Pilot',
    shortDesc: 'Develop and test an initial solution with identified collaborators.',
    whatHappens:
      'A working prototype is developed and evaluated under controlled, simulated conditions. This stage operates at laboratory or limited-environment scale before field exposure.',
    nextStep: 'Validate the prototype against real community conditions in field testing.',
    protoStatus: 'DONE — Prototype stage completed',
    actions: [
      'Laboratory testing of technical components',
      'Early-stage prototype validation and safety analysis',
      'Simulated performance benchmarking against problem metrics',
      'Field testing protocol preparation and risk assessment',
    ],
    phaseState: 'Stage 02 Phase',
    milestoneTarget: 'Lab Validated',
    progress: 100,
  },
  {
    num: '03',
    label: 'Field Testing',
    shortDesc: 'Validate the solution against defined community conditions and acceptance criteria.',
    whatHappens:
      'The prototype workflow demonstrates how community validation and structured field data collection would occur. Acceptance criteria are defined and tested against baseline community conditions.',
    nextStep: 'Review validation results before considering potential scale-up.',
    protoStatus: 'ACTIVE — Prototype workflow in progress',
    actions: [
      'Validate solution against defined community conditions and acceptance criteria',
      'Collect structured community and field telemetry feedback',
      'Measure outcomes against baseline parameters',
      'Prepare regional scale-up recommendation and audit report',
    ],
    phaseState: 'Stage 03 Phase (Active)',
    milestoneTarget: 'Field Protocol Active',
    progress: 68,
  },
  {
    num: '04',
    label: 'Scale',
    shortDesc: 'Expand a validated solution to additional locations or users.',
    whatHappens:
      'Once field validation is complete, the solution would be prepared for wider deployment across additional corridors or user groups, subject to procurement and administrative approval.',
    nextStep: 'Move toward formal adoption and long-term outcome tracking.',
    protoStatus: 'NEXT — Pending field validation review',
    actions: [
      'Municipal procurement alignment and tender specification drafting',
      'Potential production scale-up with identified industry partner',
      'Standard operating procedure and training guide preparation',
      'District-level multi-cluster rollout planning',
    ],
    phaseState: 'Stage 04 Phase',
    milestoneTarget: 'Scale-Up Review',
    progress: 0,
  },
  {
    num: '05',
    label: 'Adopted',
    shortDesc: 'Move toward real-world adoption and continued outcome tracking.',
    whatHappens:
      'The validated solution would be formally transferred to the relevant municipal or civic body for operational management, with continued impact monitoring via the government dashboard.',
    nextStep: 'Long-term outcome tracking and potential replication in other regions.',
    protoStatus: 'UPCOMING — Target adoption phase',
    actions: [
      'Formal transfer of operations to municipal engineering department',
      'Continuous monitoring data integrated into government dashboard',
      'Long-term community satisfaction and impact auditing',
      'Replication framework for neighbouring state districts',
    ],
    phaseState: 'Stage 05 Phase',
    milestoneTarget: 'Municipal Transition',
    progress: 0,
  },
];

function getStageStatus(idx, activeIdx) {
  if (idx < activeIdx) return 'completed';
  if (idx === activeIdx) return 'active';
  if (idx === activeIdx + 1) return 'next';
  return 'future';
}

const STATUS_LABEL = {
  completed: 'DONE',
  active: 'ACTIVE',
  next: 'NEXT',
  future: 'UPCOMING',
};

const MILESTONE_UPDATES = [
  {
    stageLabel: 'Stage 01 — PROPOSAL',
    title: 'Project initiated',
    detail: 'Potential collaborators identified based on capability alignment. Scope defined.',
    status: 'completed',
  },
  {
    stageLabel: 'Stage 02 — PILOT',
    title: 'Pilot prototype prepared',
    detail: 'Technical prototype prepared and passed initial controlled validation.',
    status: 'completed',
  },
  {
    stageLabel: 'Stage 03 — FIELD TESTING',
    title: 'Field testing stage entered',
    detail: 'Prototype prepared for controlled community validation phase.',
    status: 'active',
  },
  {
    stageLabel: 'Stage 04 — SCALE',
    title: 'Field testing completion (target)',
    detail: 'Validation results would be compiled and reviewed before considering potential scale-up.',
    status: 'upcoming',
  },
];

// --- Stage visual helpers -
function stageStyles(status) {
  switch (status) {
    case 'completed':
      return {
        wrapper: 'border-emerald-200 bg-emerald-50/70',
        circle: 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100',
        label: 'text-emerald-800 font-bold',
        statusPill: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        connector: 'bg-emerald-300',
        arrowColor: 'text-emerald-300',
      };
    case 'active':
      return {
        wrapper: 'border-indigo-300 bg-indigo-50/80 ring-2 ring-indigo-400/25 shadow-sm',
        circle: 'bg-indigo-900 text-white shadow ring-4 ring-indigo-100 animate-pulse',
        label: 'text-indigo-950 font-extrabold',
        statusPill: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
        connector: 'bg-slate-200',
        arrowColor: 'text-slate-300',
      };
    case 'next':
      return {
        wrapper: 'border-slate-200 bg-slate-50/70 border-dashed',
        circle: 'bg-white border-2 border-indigo-300 text-indigo-500',
        label: 'text-slate-600 font-semibold',
        statusPill: 'bg-slate-100 text-slate-500 border border-slate-200',
        connector: 'bg-slate-200',
        arrowColor: 'text-slate-200',
      };
    default:
      return {
        wrapper: 'border-slate-100 bg-white/60',
        circle: 'bg-white border-2 border-slate-200 text-slate-300',
        label: 'text-slate-400',
        statusPill: 'bg-slate-50 text-slate-400 border border-slate-100',
        connector: 'bg-slate-100',
        arrowColor: 'text-slate-100',
      };
  }
}

// --- Component -
export default function Project() {
  const location = useLocation();
  const [challenge, setChallenge] = useState(DEFAULT_CHALLENGE);
  const [isFromSession, setIsFromSession] = useState(false);
  const [project, setProject] = useState(() => deriveProject(DEFAULT_CHALLENGE));
  const [activeStageIndex, setActiveStageIndex] = useState(() => {
    try {
      const storedIdx = sessionStorage.getItem('samadhan_project_stage_idx');
      if (storedIdx !== null) {
        const parsed = parseInt(storedIdx, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < STAGES_CONFIG.length) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return 2; // Default to Field Testing (Stage 03)
  });

  // Currently selected stage for the detail panel (defaults to active stage)
  const [selectedStageIndex, setSelectedStageIndex] = useState(activeStageIndex);

  // Active platform role (for role-aware UI)
  const [activeRole, setActiveRoleState] = useState(() => getActiveRole());

  useEffect(() => {
    const handleRoleChange = (e) => setActiveRoleState(e.detail || getActiveRole());
    window.addEventListener('samadhan_active_role_change', handleRoleChange);
    return () => window.removeEventListener('samadhan_active_role_change', handleRoleChange);
  }, []);

  // Government simulated decision state
  const [challengeKey, setChallengeKey] = useState(() => {
    return location.state?.challengeId || 'bistupur-traffic';
  });
  const [govDecision, setGovDecision] = useState(() => {
    const initialKey = location.state?.challengeId || 'bistupur-traffic';
    const entry = getGovernmentDecision(initialKey);
    return entry ? entry.decision : null;
  });
  const [isChangingDecision, setIsChangingDecision] = useState(false);

  const handleMakeDecision = (decisionKey) => {
    setGovernmentDecision(challengeKey, decisionKey);
    setGovDecision(decisionKey);
    setIsChangingDecision(false);
  };

  const handleSelectStage = (idx) => {
    setSelectedStageIndex(idx);
  };

  const handleAdvanceStage = (idx) => {
    setActiveStageIndex(idx);
    setSelectedStageIndex(idx);
    try {
      sessionStorage.setItem('samadhan_project_stage_idx', String(idx));
      sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[idx].label);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // PRIORITY 1: Explicit challenge selected from Dashboard/Challenges via router state.
    // Router state (location.state) is in-memory and never stale — always takes priority.
    const explicitId = location.state?.challengeId;
    if (explicitId && SEEDED_CHALLENGES[explicitId]) {
      const seeded = SEEDED_CHALLENGES[explicitId];
      setChallenge(seeded.challenge);
      setIsFromSession(false);
      setProject({ ...seeded.project });
      setChallengeKey(explicitId);
      const entry = getGovernmentDecision(explicitId);
      setGovDecision(entry ? entry.decision : null);
      try {
        sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[activeStageIndex].label);
        sessionStorage.setItem('samadhan_project_stage_idx', String(activeStageIndex));
      } catch {
        // ignore
      }
      return;
    }

    // PRIORITY 2: Active user submission from Report → AI Analysis flow (sessionStorage).
    let active = DEFAULT_CHALLENGE;
    let fromSession = false;
    let sessionAnalysis = null;
    let selectedPartner = null;

    try {
      const stored = sessionStorage.getItem('samadhan_current_problem');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.title) {
          active = {
            title: parsed.title,
            category: parsed.category || DEFAULT_CHALLENGE.category,
            description: parsed.description || DEFAULT_CHALLENGE.description,
            location: parsed.location || DEFAULT_CHALLENGE.location,
          };
          fromSession = true;
        }
      }

      const storedAnalysis = sessionStorage.getItem('samadhan_current_analysis');
      if (storedAnalysis) {
        sessionAnalysis = JSON.parse(storedAnalysis);
      }

      const storedPartner = sessionStorage.getItem('samadhan_selected_partner');
      if (storedPartner) {
        selectedPartner = JSON.parse(storedPartner);
      }
    } catch {
      // ignore
    }

    setChallenge(active);
    setIsFromSession(fromSession);

    const derived = deriveProject(active);

    // If live AI analysis exists in session, use real matched partners instead of synthetic placeholders
    if (fromSession && sessionAnalysis && sessionAnalysis.partners && sessionAnalysis.partners.length > 0) {
      const uniPartner = sessionAnalysis.partners.find((p) => p.type === 'UNIVERSITY MATCH');
      const indPartner = sessionAnalysis.partners.find((p) => p.type === 'INDUSTRY MATCH');

      if (uniPartner) derived.university = uniPartner.name;
      if (indPartner) derived.industry = indPartner.name;

      if (selectedPartner) {
        if (selectedPartner.type === 'UNIVERSITY MATCH') derived.university = selectedPartner.name;
        if (selectedPartner.type === 'INDUSTRY MATCH') derived.industry = selectedPartner.name;
      }

      if (sessionAnalysis.severity) derived.severity = sessionAnalysis.severity;
      if (sessionAnalysis.primaryClassification) derived.label = sessionAnalysis.primaryClassification;
    }

    setProject(derived);
    const resolvedKey = active.id || (fromSession ? 'custom-session-problem' : 'bistupur-traffic');
    setChallengeKey(resolvedKey);
    const entry = getGovernmentDecision(resolvedKey);
    setGovDecision(entry ? entry.decision : null);

    // Ensure session has current stage
    try {
      sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[activeStageIndex].label);
      sessionStorage.setItem('samadhan_project_stage_idx', String(activeStageIndex));
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStageIndex, location.state]);

  // Keep selectedStageIndex in sync if activeStageIndex changes externally
  useEffect(() => {
    setSelectedStageIndex(activeStageIndex);
  }, [activeStageIndex]);

  if (!project) return null;

  const severityColor =
    project.severity === 'HIGH'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const selectedStage = STAGES_CONFIG[selectedStageIndex];

  return (
    <div className="space-y-8">

      {/* --- 1. PAGE HEADER -  */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'AI Analysis', href: '/ai-analysis' },
          { label: 'Project Lifecycle' },
        ]}
        badge={<Badge variant="neutral">PROJECT LIFECYCLE</Badge>}
        title="Project Lifecycle"
        description="Track how an identified challenge moves from proposal to potential real-world adoption."
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span>Field Testing Active</span>
          </div>
        }
      />

      {/* --- 2. CONTEXT BANNER — "Why am I on this page?" -  */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-900 text-white" aria-hidden="true">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-indigo-900">Why this matters</p>
          <p className="text-sm text-indigo-800 leading-relaxed max-w-3xl">
            Samadhan Setu doesn&rsquo;t stop after finding a potential match. The lifecycle helps
            structure, validate and track the journey from a reported challenge toward a
            scalable solution — from AI analysis through field validation and potential adoption.
          </p>
        </div>
      </div>

      {/* --- 3. CHALLENGE CONTEXT CARD -  */}
      <Card variant="standard">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Citizen Report
              </span>
              {isFromSession && (
                <span className="text-[11px] text-slate-400 font-medium">
                  • Transferred from intake submission
                </span>
              )}
            </div>
            <CardTitle as="h2">Challenge Being Tracked</CardTitle>
          </div>
          <Badge variant="neutral">{project.label}</Badge>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: challenge details */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                {challenge.title}
              </h3>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="font-medium text-slate-700">{challenge.location}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${severityColor}`}>
                  {project.severity} SEVERITY
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                  AI CLASSIFIED
                </span>
              </div>
            </div>

            {/* Right: potential collaborators */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Potential Collaborators
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed -mt-1">
                Identified based on capability alignment — not confirmed partners.
              </p>
              {project.university && (
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200/60 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-900 text-white text-[10px] font-bold">
                    UNI
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-indigo-900">{project.university}</p>
                    <p className="text-[11px] text-slate-500">Research institution — potential collaborator</p>
                  </div>
                </div>
              )}
              {project.industry && project.industry !== project.university && (
                <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-200/60 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white text-[10px] font-bold">
                    IND
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-teal-900">{project.industry}</p>
                    <p className="text-[11px] text-slate-500">Industry organisation — potential collaborator</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- GOVERNMENT REVIEW / DECISION SECTION (Government role only) --- */}
      {activeRole === 'government' && (
      <Card variant="standard" className="border-indigo-100 bg-white shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-1">
              Administrative Governance
            </div>
            <h2 className="text-base font-bold text-white">Government Review</h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              <span className="font-semibold text-indigo-200">AI recommends. Government decides.</span> Potential collaborators are identified from capability evidence. Government review determines whether the proposed direction should proceed.
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              Current Determination
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border mt-0.5 ${
                govDecision ? GOV_DECISION_META[govDecision].badgeColor : PENDING_REVIEW_META.badgeColor
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  govDecision ? GOV_DECISION_META[govDecision].badgeDot : PENDING_REVIEW_META.badgeDot
                }`}
              />
              {govDecision ? GOV_DECISION_META[govDecision].shortLabel : PENDING_REVIEW_META.shortLabel}
            </span>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Active decision view */}
          {govDecision && !isChangingDecision ? (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${GOV_DECISION_META[govDecision].badgeColor}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${GOV_DECISION_META[govDecision].badgeDot}`} />
                  <p className="text-sm font-bold">
                    {GOV_DECISION_META[govDecision].statusLabel}
                  </p>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {GOV_DECISION_META[govDecision].lifecycleMessage}
                </p>
                <p className="text-[11px] opacity-75">
                  {GOV_DECISION_META[govDecision].detail}
                </p>
              </div>

              <div className="shrink-0">
                <Button
                  onClick={() => setIsChangingDecision(true)}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-slate-800 border-slate-300 text-xs font-semibold"
                >
                  Change Decision
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-xs font-semibold text-slate-700">
                  Select a simulated administrative determination for this challenge:
                </p>
                {govDecision && (
                  <button
                    type="button"
                    onClick={() => setIsChangingDecision(false)}
                    className="text-xs text-indigo-600 hover:underline cursor-pointer self-start sm:self-auto"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* 1. Support / Proceed to Next Stage */}
                <button
                  type="button"
                  onClick={() => handleMakeDecision('support')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    govDecision === 'support'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white hover:bg-emerald-50/40 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-950">Support / Proceed to Next Stage</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Endorse capability match to progress toward next stage review.
                  </p>
                </button>

                {/* 2. Hold for Review */}
                <button
                  type="button"
                  onClick={() => handleMakeDecision('hold')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    govDecision === 'hold'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-950">Hold for Review</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Hold pending resource allocation and departmental review.
                  </p>
                </button>

                {/* 3. Request More Information */}
                <button
                  type="button"
                  onClick={() => handleMakeDecision('information_requested')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    govDecision === 'information_requested'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-blue-50/40 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-blue-950">Request More Information</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Ask for additional technical baseline and validation details.
                  </p>
                </button>

                {/* 4. Decline */}
                <button
                  type="button"
                  onClick={() => handleMakeDecision('decline')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    govDecision === 'decline'
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
                      : 'bg-white hover:bg-rose-50/40 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-rose-950">Decline</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Reviewed and not accepted for pilot progression at this time.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Principle note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              AI recommendations support decision-making; final administrative decisions remain under government authority.
            </span>
            <span className="italic shrink-0">Simulated frontend decision</span>
          </div>
        </CardContent>
      </Card>
      )}

      {/* --- 4. LIFECYCLE TRACKER -  */}
      <div>
        {/* Government Determination Reflection in Lifecycle (Government role only) */}
        {activeRole === 'government' && (
        <div className="mb-4">
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs ${
            govDecision ? GOV_DECISION_META[govDecision].badgeColor : PENDING_REVIEW_META.badgeColor
          }`}>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${
                govDecision ? GOV_DECISION_META[govDecision].badgeDot : PENDING_REVIEW_META.badgeDot
              }`} />
              <span className="font-semibold">
                {govDecision ? GOV_DECISION_META[govDecision].statusLabel : PENDING_REVIEW_META.statusLabel}
              </span>
            </div>
            <span className="opacity-90 font-medium">
              {govDecision
                ? GOV_DECISION_META[govDecision].lifecycleMessage
                : `Awaiting government review — current stage: ${STAGES_CONFIG[activeStageIndex]?.label || 'Field Testing'}.`}
            </span>
          </div>
        </div>
        )}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-1.5">
              End-to-End Progress
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              01 Proposal → 02 Pilot → 03 Field Testing → 04 Scale → 05 Adopted
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium shrink-0">Click a stage to explore it</p>
        </div>

        {/* Desktop: horizontal tracker */}
        <div className="hidden md:flex items-stretch gap-0">
          {STAGES_CONFIG.map((stage, idx) => {
            const status = getStageStatus(idx, activeStageIndex);
            const s = stageStyles(status);
            const isLast = idx === STAGES_CONFIG.length - 1;
            const isSelected = idx === selectedStageIndex;

            return (
              <div key={stage.num} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleSelectStage(idx)}
                  aria-label={`Select stage ${stage.num}: ${stage.label}. Status: ${STATUS_LABEL[status]}`}
                  aria-pressed={isSelected}
                  className={`flex-1 rounded-xl border p-4 ${s.wrapper} flex flex-col items-center text-center gap-2.5 min-h-[200px] justify-between cursor-pointer transition-all duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isSelected ? 'outline outline-2 outline-offset-2 outline-indigo-400' : ''
                  }`}
                >
                  {/* Stage number circle */}
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${s.circle}`}>
                    {status === 'completed' ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stage.num
                    )}
                  </div>

                  {/* Status pill */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${s.statusPill}`}>
                    {STATUS_LABEL[status]}
                  </span>

                  {/* Label */}
                  <p className={`text-xs leading-tight ${s.label}`}>{stage.label}</p>

                  {/* Short description */}
                  <p className="text-[10px] text-slate-500 leading-snug px-1">{stage.shortDesc}</p>
                </button>

                {/* Arrow connector */}
                {!isLast && (
                  <div className="flex items-center px-1 shrink-0" aria-hidden="true">
                    <div className={`w-4 h-0.5 ${s.connector}`} />
                    <svg className={`h-3.5 w-3.5 -ml-0.5 ${s.arrowColor}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical tracker */}
        <div className="flex md:hidden flex-col gap-2.5">
          {STAGES_CONFIG.map((stage, idx) => {
            const status = getStageStatus(idx, activeStageIndex);
            const s = stageStyles(status);
            const isSelected = idx === selectedStageIndex;

            return (
              <button
                key={stage.num}
                type="button"
                onClick={() => handleSelectStage(idx)}
                aria-label={`Select stage ${stage.num}: ${stage.label}`}
                aria-pressed={isSelected}
                className={`flex items-start gap-4 rounded-xl border p-4 ${s.wrapper} cursor-pointer text-left transition-all ${
                  isSelected ? 'outline outline-2 outline-offset-1 outline-indigo-400' : ''
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.circle}`}>
                  {status === 'completed' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stage.num
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${s.label}`}>{stage.label}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${s.statusPill}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{stage.shortDesc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 5. STAGE DETAIL PANEL + PROJECT UPDATES -  */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Stage Detail */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card variant="standard" className="border-indigo-200">
            <CardHeader className="border-b border-indigo-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 mb-1">
                    STAGE {selectedStage.num}
                  </div>
                  <CardTitle as="h3">{selectedStage.label}</CardTitle>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Prev/Next controls (advances active lifecycle stage) */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      disabled={activeStageIndex === 0}
                      onClick={() => handleAdvanceStage(activeStageIndex - 1)}
                      className="px-2 py-1 font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                      title="Move active stage back"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={activeStageIndex === STAGES_CONFIG.length - 1}
                      onClick={() => handleAdvanceStage(activeStageIndex + 1)}
                      className="px-2 py-1 font-semibold text-indigo-700 hover:text-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                      title="Advance active stage"
                    >
                      Advance →
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">

              {/* CURRENT STAGE / WHAT HAPPENS / DEMO STATUS / NEXT STEP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Stage</p>
                  <p className="text-sm font-bold text-slate-900">{selectedStage.label}</p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demo Status</p>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{selectedStage.protoStatus}</p>
                </div>
              </div>

              {/* Progress bar (only show for active stages with progress) */}
              {selectedStage.progress > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>{selectedStage.label} Progress</span>
                    <span className="font-semibold text-indigo-700">{selectedStage.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedStage.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* What Happens */}
              <div className="rounded-lg bg-indigo-50/60 border border-indigo-100 p-4 space-y-1.5">
                <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">What Happens</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedStage.whatHappens}</p>
              </div>

              {/* Actions at this stage */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Activities at this stage
                </p>
                <ul className="space-y-1.5">
                  {selectedStage.actions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Step */}
              <div className="rounded-lg bg-slate-50 border border-slate-200/70 p-4 flex items-start gap-3">
                <span className="text-indigo-500 text-base shrink-0 mt-0.5">→</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Next Step</p>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{selectedStage.nextStep}</p>
                </div>
              </div>

              {/* Timeline info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Lifecycle Phase</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedStage.phaseState}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Milestone Target</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedStage.milestoneTarget}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citizen: Government Response (read-only). Other roles: Project Update summary. */}
          {activeRole === 'citizen' ? (
            /* --- CITIZEN: GOVERNMENT RESPONSE CARD (read-only) --- */
            <Card variant="standard">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                      Administrative Status
                    </div>
                    <CardTitle as="h3">Government Response</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Status and guidance from the concerned administrative authority.
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap mt-1">
                    View Only
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Current determination label */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Current Determination
                  </p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold ${
                    govDecision
                      ? GOV_DECISION_META[govDecision].badgeColor
                      : PENDING_REVIEW_META.badgeColor
                  }`}>
                    <span className={`h-2 w-2 rounded-full shrink-0 ${
                      govDecision
                        ? GOV_DECISION_META[govDecision].badgeDot
                        : PENDING_REVIEW_META.badgeDot
                    }`} />
                    {govDecision
                      ? GOV_DECISION_META[govDecision].label
                      : 'Pending Review'}
                  </div>
                </div>

                {/* Citizen-friendly explanation */}
                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 space-y-1">
                  <p className="text-xs font-semibold text-slate-700">
                    {govDecision === 'support' && 'Supported for progression to the next appropriate stage.'}
                    {govDecision === 'hold' && 'On hold pending further administrative review.'}
                    {govDecision === 'information_requested' && 'Additional information has been requested before progression.'}
                    {govDecision === 'decline' && 'Not approved for progression at this time.'}
                    {!govDecision && 'Government review has not yet been recorded for this challenge.'}
                  </p>
                  {govDecision && (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {GOV_DECISION_META[govDecision].detail}
                    </p>
                  )}
                </div>

                {/* Tracking guidance */}
                <div className="space-y-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                  <p>Government review is handled by the appropriate administrative authority.</p>
                  <p>You can continue to track the progress of this challenge through the project lifecycle above.</p>
                </div>

                {/* Prototype disclaimer */}
                <p className="text-[10px] text-slate-400 italic">
                  Simulated prototype response — not a real government determination.
                </p>
              </CardContent>
            </Card>
          ) : (
            /* --- OTHER ROLES: Project Update summary (current active stage) --- */
            <Card variant="standard">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 mb-1">
                  Current Stage Update
                </div>
                <CardTitle as="h3">Project Update</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {(() => {
                  const current = MILESTONE_UPDATES.find((u) => u.status === 'active') || MILESTONE_UPDATES[activeStageIndex] || MILESTONE_UPDATES[0];
                  const dotColor = current.status === 'completed' ? 'bg-emerald-600' : current.status === 'active' ? 'bg-indigo-700 ring-4 ring-indigo-100' : 'bg-slate-300';
                  const titleColor = current.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900';
                  return (
                    <ol className="relative border-l-2 border-slate-200 ml-3">
                      <li className="ml-4 relative">
                        <span className={`absolute -left-[22px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ${dotColor}`} />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {current.stageLabel}
                          {current.status === 'active' && (
                            <span className="ml-2 text-indigo-600 font-semibold">• CURRENT</span>
                          )}
                        </p>
                        <p className={`text-sm font-semibold mt-0.5 ${titleColor}`}>{current.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{current.detail}</p>
                      </li>
                    </ol>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">

          {/* Collaborators panel */}
          <Card variant="standard">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-1">
                Collaborative Model
              </div>
              <CardTitle as="h3">Potential Collaborators</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Identified based on capability alignment — not confirmed partners.
              </p>
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {/* Roles explanation */}
              {[
                {
                  abbr: 'CITIZEN',
                  label: 'Citizen / Community',
                  role: 'Problem reported and provides real-world field feedback throughout pilot and testing.',
                  color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                  abbrevColor: 'bg-indigo-900',
                },
                ...(project.university
                  ? [
                      {
                        abbr: 'UNI',
                        label: project.university,
                        role: 'Research leadership, technical validation, laboratory expertise and scientific documentation.',
                        color: 'bg-violet-50 border-violet-200 text-violet-900',
                        abbrevColor: 'bg-violet-700',
                      },
                    ]
                  : []),
                ...(project.industry && project.industry !== project.university
                  ? [
                      {
                        abbr: 'IND',
                        label: project.industry,
                        role: 'Potential implementation, deployment support and field-scale production.',
                        color: 'bg-teal-50 border-teal-200 text-teal-900',
                        abbrevColor: 'bg-teal-700',
                      },
                    ]
                  : []),
              ].map((r) => (
                <div key={r.abbr} className={`flex items-start gap-3 p-3.5 rounded-lg border ${r.color}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${r.abbrevColor} text-white text-[9px] font-bold`}>
                    {r.abbr}
                  </span>
                  <div>
                    <p className="text-xs font-bold">{r.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.role}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Visibility panel */}
          <Card variant="standard">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle as="h3" className="text-base">Project Visibility</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Progress is transparent to all stakeholders.
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  tag: 'CTZ',
                  title: 'Citizen',
                  desc: 'Track the progress and outcomes of the reported problem from submission to potential impact.',
                  accent: 'border-indigo-200 bg-indigo-50/30',
                  titleColor: 'text-indigo-900',
                  tagColor: 'bg-indigo-100 text-indigo-700',
                },
                {
                  tag: 'GOV',
                  title: 'Government',
                  desc: 'Monitor project status, collaborator milestones, and city-level progress metrics.',
                  accent: 'border-emerald-200 bg-emerald-50/30',
                  titleColor: 'text-emerald-900',
                  tagColor: 'bg-emerald-100 text-emerald-700',
                },
                {
                  tag: 'PTR',
                  title: 'Potential Collaborators',
                  desc: 'If engaged, collaborators would manage implementation activities and submit progress updates.',
                  accent: 'border-violet-200 bg-violet-50/30',
                  titleColor: 'text-violet-900',
                  tagColor: 'bg-violet-100 text-violet-700',
                },
              ].map((v) => (
                <div key={v.title} className={`rounded-lg border p-3.5 ${v.accent}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex h-6 px-1.5 items-center justify-center rounded text-[9px] font-extrabold ${v.tagColor}`}>{v.tag}</span>
                    <p className={`text-xs font-bold ${v.titleColor}`}>{v.title}</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- 6. IMPACT PREVIEW -  */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
              Impact Monitoring
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Measuring What Changed</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Demo metrics — replaced by verified field data upon deployment
          </span>
        </div>

        {/* Prototype disclaimer */}
        <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-3 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></svg>
          <p className="text-xs font-medium text-amber-900">
            <span className="font-bold">Prototype impact metrics</span> — figures shown represent illustrative targets for this pilot corridor and would be replaced by verified field telemetry upon deployment.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {project.metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {metric.value}
                </div>
                <p className="text-xs font-medium text-slate-500 leading-snug mt-1">{metric.label}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Prototype impact metric
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- 7. BOTTOM CTA -  */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Ready to measure the outcome?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md leading-relaxed">
            Project progress can be tracked from the first pilot through potential adoption and measurable community impact.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto flex-wrap">
          <Button
            variant="secondary"
            size="lg"
            to="/ai-analysis"
            className="flex-1 sm:flex-initial"
          >
            Back to AI Analysis
          </Button>

          <Button
            variant="primary"
            size="lg"
            to="/impact"
            className="flex-1 sm:flex-initial bg-indigo-900 hover:bg-indigo-800"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            }
            iconPosition="right"
          >
            Explore Impact Framework
          </Button>
        </div>
      </div>
    </div>
  );
}
