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
import { getCitizenChallengeById, isSeededChallenge } from '../services/challengeStore';
import {
  getResearchInterestsForChallenge,
  getImplementationInterestsForChallenge,
  COLLAB_INTEREST_UPDATED_EVENT,
} from '../services/collaborationStore';
import {
  createGovernmentDecisionNotifications,
  createOutcomeVerifiedNotifications,
  createProgressUpdateNotification,
} from '../services/notificationStore';
import {
  getLifecycleStage,
  setLifecycleStage,
  LIFECYCLE_STAGE_UPDATED_EVENT,
} from '../services/lifecycleStore';
import { getInstitutionById } from '../data/institutionsRegistry';
import {
  getProjectUpdatesForChallenge,
  submitProjectUpdate,
  PROJECT_UPDATES_UPDATED_EVENT,
} from '../services/projectUpdates';
import {
  getOutcomeForChallenge,
  verifyChallengeOutcome,
  OUTCOMES_UPDATED_EVENT,
} from '../services/outcomeStore';

/**
 * Maps seeded challenge IDs to their verified UNIVERSITY MATCH institution IDs.
 * Used to determine which institutions the logged-in university represents
 * when viewing a challenge in the Project Lifecycle.
 * Mirrors the map in Challenges.jsx.
 */
const SEEDED_UNIVERSITY_MATCH_IDS = {
  'bistupur-traffic': ['u-nitjsr', 'u-mobility-ranchi'],
  'baghmara-groundwater': ['u-env-dhanbad'],
  'hazaribagh-diagnostic': ['u-rims-ranchi'],
  'bokaro-irrigation': ['u-bau-ranchi'],
};

/**
 * Maps seeded challenge IDs to their verified INDUSTRY MATCH institution IDs.
 * Used to determine which institutions the logged-in industry partner represents
 * when viewing a challenge in the Project Lifecycle.
 * Mirrors the map in Challenges.jsx.
 */
const SEEDED_INDUSTRY_MATCH_IDS = {
  'bistupur-traffic': ['i-tata-motors-jamshedpur'],
  'baghmara-groundwater': ['i-mecon-ranchi'],
  'hazaribagh-diagnostic': ['i-apollo-jharkhand'],
  'bokaro-irrigation': ['i-nsc-jharkhand'],
};

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
      'The validated solution has reached the adoption stage. The solution can transition into operational use while outcome monitoring and review continue.',
    nextStep: 'Continue long-term outcome monitoring and evaluate replication based on validated results.',
    protoStatus: 'ACTIVE — Adoption stage reached',
    actions: [
      'Transition the validated solution into operational use',
      'Continue monitoring outcome indicators',
      'Review community and implementation feedback',
      'Evaluate opportunities for responsible replication',
    ],
    phaseState: 'Stage 05 Phase (Active)',
    milestoneTarget: 'Operational Adoption',
    progress: 100,
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

const STAGE_NAME_TO_INDEX = {
  Proposal: 0,
  Pilot: 1,
  'Field Testing': 2,
  Scale: 3,
  Adopted: 4,
};

function getStageIndexForChallenge(challengeKey, challengeStage) {
  // Government-advanced stages persist in lifecycleStore — always check first
  const persisted = getLifecycleStage(challengeKey);
  if (persisted !== null && typeof persisted.stageIndex === 'number') {
    return persisted.stageIndex;
  }
  // Fall back to hardcoded defaults for seeded challenges
  if (challengeKey === 'bokaro-irrigation') return 4;
  if (challengeKey === 'hazaribagh-diagnostic') return 0;
  if (challengeKey === 'baghmara-groundwater') return 1;
  if (challengeKey === 'bistupur-traffic') return 2;
  if (challengeStage && STAGE_NAME_TO_INDEX[challengeStage] !== undefined) {
    return STAGE_NAME_TO_INDEX[challengeStage];
  }
  return 0;
}

// --- Initial State Helper ---
function getInitialProjectData(location) {
  const searchParams = new URLSearchParams(location.search);
  const explicitId =
    location.state?.challengeId ||
    searchParams.get('challengeId') ||
    searchParams.get('id');

  if (explicitId && SEEDED_CHALLENGES[explicitId]) {
    const seeded = SEEDED_CHALLENGES[explicitId];
    return {
      challenge: seeded.challenge,
      project: { ...seeded.project },
      isFromSession: false,
      challengeKey: explicitId,
    };
  }

  if (explicitId) {
    const citizen = getCitizenChallengeById(explicitId);
    if (citizen) {
      const derived = deriveProject({
        title: citizen.title,
        category: citizen.category,
        description: citizen.description,
        location: citizen.location,
      });
      derived.severity = citizen.severity || 'MEDIUM';
      derived.label = citizen.category || derived.label;
      if (citizen.collaborators && citizen.collaborators.length > 0) {
        const uni = citizen.collaborators.find((c) => c.type === 'Research');
        const ind = citizen.collaborators.find((c) => c.type === 'Industry');
        if (uni) derived.university = uni.name;
        if (ind) derived.industry = ind.name;
      }
      return {
        challenge: {
          ...citizen,
          isCitizenSubmission: true,
        },
        project: derived,
        isFromSession: false,
        challengeKey: explicitId,
      };
    }
  }

  try {
    const stored = sessionStorage.getItem('samadhan_current_problem');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.title) {
        const active = {
          title: parsed.title,
          category: parsed.category || DEFAULT_CHALLENGE.category,
          description: parsed.description || DEFAULT_CHALLENGE.description,
          location: parsed.location || DEFAULT_CHALLENGE.location,
        };
        const derived = deriveProject(active);
        return {
          challenge: active,
          project: derived,
          isFromSession: true,
          challengeKey: active.id || 'custom-session-problem',
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    challenge: DEFAULT_CHALLENGE,
    project: deriveProject(DEFAULT_CHALLENGE),
    isFromSession: false,
    challengeKey: 'bistupur-traffic',
  };
}

// --- Component -
export default function Project() {
  const location = useLocation();
  const [initialData] = useState(() => getInitialProjectData(location));
  const [challenge, setChallenge] = useState(initialData.challenge);
  const [isFromSession, setIsFromSession] = useState(initialData.isFromSession);
  const [project, setProject] = useState(initialData.project);
  const [activeStageIndex, setActiveStageIndex] = useState(() => {
    return getStageIndexForChallenge(initialData.challengeKey, initialData.challenge?.stage);
  });

  // Currently selected stage for the detail panel (defaults to active stage)
  const [selectedStageIndex, setSelectedStageIndex] = useState(activeStageIndex);

  // Active platform role (for role-aware UI)
  const [activeRole, setActiveRoleState] = useState(() => getActiveRole());

  useEffect(() => {
    const handleRoleChange = (e) => setActiveRoleState(e.detail || getActiveRole());
    const handleStorage = () => setActiveRoleState(getActiveRole());
    window.addEventListener('samadhan_active_role_change', handleRoleChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('samadhan_active_role_change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const currentRole = activeRole || getActiveRole();

  // Government simulated decision state
  const [challengeKey, setChallengeKey] = useState(initialData.challengeKey);
  const [govDecision, setGovDecision] = useState(() => {
    const entry = getGovernmentDecision(initialData.challengeKey);
    return entry ? entry.decision : null;
  });
  const [isChangingDecision, setIsChangingDecision] = useState(false);

  // Project Updates state
  const [projectUpdates, setProjectUpdates] = useState(() =>
    getProjectUpdatesForChallenge(initialData.challengeKey)
  );

  // Outcome verification state
  const [outcomeRecord, setOutcomeRecord] = useState(() =>
    getOutcomeForChallenge(initialData.challengeKey)
  );

  // Reactive sync for updates and outcome records
  useEffect(() => {
    const syncUpdates = () => setProjectUpdates(getProjectUpdatesForChallenge(challengeKey));
    const syncOutcome = () => setOutcomeRecord(getOutcomeForChallenge(challengeKey));
    window.addEventListener(PROJECT_UPDATES_UPDATED_EVENT, syncUpdates);
    window.addEventListener(OUTCOMES_UPDATED_EVENT, syncOutcome);
    window.addEventListener('storage', syncUpdates);
    window.addEventListener('storage', syncOutcome);
    return () => {
      window.removeEventListener(PROJECT_UPDATES_UPDATED_EVENT, syncUpdates);
      window.removeEventListener(OUTCOMES_UPDATED_EVENT, syncOutcome);
      window.removeEventListener('storage', syncUpdates);
      window.removeEventListener('storage', syncOutcome);
    };
  }, [challengeKey]);

  // University research interest state
  const [universityInterests, setUniversityInterests] = useState(() =>
    getResearchInterestsForChallenge(initialData.challengeKey)
  );

  useEffect(() => {
    setUniversityInterests(getResearchInterestsForChallenge(challengeKey));
  }, [challengeKey]);

  useEffect(() => {
    const handleInterestUpdate = () => {
      setUniversityInterests(getResearchInterestsForChallenge(challengeKey));
    };
    window.addEventListener(COLLAB_INTEREST_UPDATED_EVENT, handleInterestUpdate);
    return () => {
      window.removeEventListener(COLLAB_INTEREST_UPDATED_EVENT, handleInterestUpdate);
    };
  }, [challengeKey]);

  // Industry implementation interest state
  const [industryInterests, setIndustryInterests] = useState(() =>
    getImplementationInterestsForChallenge(initialData.challengeKey)
  );

  useEffect(() => {
    setIndustryInterests(getImplementationInterestsForChallenge(challengeKey));
  }, [challengeKey]);

  useEffect(() => {
    const handleInterestUpdate = () => {
      setIndustryInterests(getImplementationInterestsForChallenge(challengeKey));
    };
    window.addEventListener(COLLAB_INTEREST_UPDATED_EVENT, handleInterestUpdate);
    return () => {
      window.removeEventListener(COLLAB_INTEREST_UPDATED_EVENT, handleInterestUpdate);
    };
  }, [challengeKey]);

  // Submission modal / form state for University / Industry
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [updateStage, setUpdateStage] = useState(
    STAGES_CONFIG[activeStageIndex]?.label || 'Field Testing'
  );
  const [updateSummary, setUpdateSummary] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!updateSummary.trim()) return;

    let instId = null;
    let instName = null;
    let updateType = 'Progress Update';

    if (currentRole === 'university') {
      const matchIds = SEEDED_UNIVERSITY_MATCH_IDS[challengeKey] || [];
      instId = matchIds[0] || 'u-nitjsr';
      const instObj = getInstitutionById(instId);
      instName = instObj?.name || 'NIT Jamshedpur';
      updateType = 'Research Progress Update';
    } else if (currentRole === 'industry') {
      const matchIds = SEEDED_INDUSTRY_MATCH_IDS[challengeKey] || [];
      instId = matchIds[0] || 'i-tata-motors-jamshedpur';
      const instObj = getInstitutionById(instId);
      instName = instObj?.name || 'Tata Motors Limited';
      updateType = 'Implementation Progress Update';
    }

    const saved = submitProjectUpdate({
      challengeId: challengeKey,
      institutionId: instId,
      institutionName: instName,
      role: currentRole,
      updateType,
      summary: updateSummary.trim(),
      stage: updateStage,
      evidenceNote: evidenceNote.trim(),
    });

    // Notify Government of the submitted stakeholder progress update
    createProgressUpdateNotification({
      challengeId: challengeKey,
      challengeTitle: challenge?.title || initialData.challenge?.title || challengeKey,
      updateId: saved.id,
      institutionId: instId,
      institutionName: instName,
      sourceRole: currentRole,
    });

    setProjectUpdates((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
    setUpdateSummary('');
    setEvidenceNote('');
    setIsSubmittingUpdate(false);
  };

  const handleVerifyOutcome = () => {
    if (currentRole !== 'government' || activeStageIndex !== 4) return;
    const verified = verifyChallengeOutcome({
      challengeId: challengeKey,
      summary: 'Government has verified the reported outcome within this prototype workflow.',
    });
    setOutcomeRecord(verified);
    createOutcomeVerifiedNotifications({
      challengeId: challengeKey,
      challengeTitle: challenge.title,
      universityInterests,
      industryInterests,
      isCitizenSubmission: Boolean(challenge.isCitizenSubmission),
    });
  };

  const handleMakeDecision = (decisionKey) => {
    setGovernmentDecision(challengeKey, decisionKey);
    setGovDecision(decisionKey);
    setIsChangingDecision(false);

    // "Support / Proceed to Next Stage" advances the OFFICIAL lifecycle by exactly ONE stage
    if (decisionKey === 'support') {
      const nextIdx = Math.min(activeStageIndex + 1, 4);
      if (nextIdx !== activeStageIndex) {
        setLifecycleStage(challengeKey, nextIdx);
        setActiveStageIndex(nextIdx);
        setSelectedStageIndex(nextIdx);
        try {
          sessionStorage.setItem('samadhan_project_stage_idx', String(nextIdx));
          sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[nextIdx].label);
        } catch {
          // ignore
        }
      }
    }

    createGovernmentDecisionNotifications({
      challengeId: challengeKey,
      challengeTitle: initialData.challenge?.title || challengeKey,
      decisionKey,
      universityInterests,
      industryInterests,
      isCitizenSubmission: !isSeededChallenge(challengeKey),
    });
  };

  const handleSelectStage = (idx) => {
    setSelectedStageIndex(idx);
  };

  const handleAdvanceStage = (idx) => {
    if (currentRole !== 'government') return;
    if (idx < 0 || idx > 4) return;
    setLifecycleStage(challengeKey, idx);
    setActiveStageIndex(idx);
    setSelectedStageIndex(idx);
    try {
      sessionStorage.setItem('samadhan_project_stage_idx', String(idx));
      sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[idx].label);
    } catch {
      // ignore
    }
  };

  // Reactive listener for government lifecycle stage changes
  useEffect(() => {
    const syncLifecycle = (e) => {
      const detail = e.detail;
      if (!detail || detail.challengeId === challengeKey) {
        const stored = getLifecycleStage(challengeKey);
        if (stored && typeof stored.stageIndex === 'number') {
          setActiveStageIndex(stored.stageIndex);
        }
      }
    };
    window.addEventListener(LIFECYCLE_STAGE_UPDATED_EVENT, syncLifecycle);
    window.addEventListener('storage', syncLifecycle);
    return () => {
      window.removeEventListener(LIFECYCLE_STAGE_UPDATED_EVENT, syncLifecycle);
      window.removeEventListener('storage', syncLifecycle);
    };
  }, [challengeKey]);

  useEffect(() => {
    // PRIORITY 1: Explicit challenge selected from Dashboard/Challenges via router state or search params.
    // Router state (location.state) is in-memory and never stale — always takes priority.
    const searchParams = new URLSearchParams(location.search);
    const explicitId =
      location.state?.challengeId ||
      searchParams.get('challengeId') ||
      searchParams.get('id');

    if (explicitId && SEEDED_CHALLENGES[explicitId]) {
      const seeded = SEEDED_CHALLENGES[explicitId];
      const stageIdx = getStageIndexForChallenge(explicitId, seeded.challenge?.stage);
      setChallenge(seeded.challenge);
      setIsFromSession(false);
      setProject({ ...seeded.project });
      setChallengeKey(explicitId);
      setActiveStageIndex(stageIdx);
      setSelectedStageIndex(stageIdx);
      const entry = getGovernmentDecision(explicitId);
      setGovDecision(entry ? entry.decision : null);
      try {
        sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[stageIdx].label);
        sessionStorage.setItem('samadhan_project_stage_idx', String(stageIdx));
      } catch {
        // ignore
      }
      return;
    } else if (explicitId) {
      const citizen = getCitizenChallengeById(explicitId);
      if (citizen) {
        const stageIdx = getStageIndexForChallenge(explicitId, citizen.stage);
        setChallenge({
          ...citizen,
          isCitizenSubmission: true,
        });
        setIsFromSession(false);
        setActiveStageIndex(stageIdx);
        setSelectedStageIndex(stageIdx);
        const derived = deriveProject({
          title: citizen.title,
          category: citizen.category,
          description: citizen.description,
          location: citizen.location,
        });
        derived.severity = citizen.severity || 'MEDIUM';
        derived.label = citizen.category || derived.label;
        if (citizen.collaborators && citizen.collaborators.length > 0) {
          const uni = citizen.collaborators.find((c) => c.type === 'Research');
          const ind = citizen.collaborators.find((c) => c.type === 'Industry');
          if (uni) derived.university = uni.name;
          if (ind) derived.industry = ind.name;
        }
        setProject(derived);
        setChallengeKey(explicitId);
        const entry = getGovernmentDecision(explicitId);
        setGovDecision(entry ? entry.decision : null);
        try {
          sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[stageIdx].label);
          sessionStorage.setItem('samadhan_project_stage_idx', String(stageIdx));
        } catch {
          // ignore
        }
        return;
      }
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
    const stageIdx = getStageIndexForChallenge(resolvedKey, active.stage);
    setActiveStageIndex(stageIdx);
    setSelectedStageIndex(stageIdx);
    const entry = getGovernmentDecision(resolvedKey);
    setGovDecision(entry ? entry.decision : null);

    // Ensure session has current stage
    try {
      sessionStorage.setItem('samadhan_project_stage', STAGES_CONFIG[stageIdx].label);
      sessionStorage.setItem('samadhan_project_stage_idx', String(stageIdx));
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.search]);

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

      {/* --- 1. PAGE HEADER --- */}
      <PageHeader
        breadcrumbs={
          currentRole === 'government'
            ? [
                { label: 'Home', href: '/' },
                { label: 'Government Dashboard', href: '/government' },
                { label: 'Project Lifecycle' },
              ]
            : [
                { label: 'Home', href: '/' },
                { label: 'Challenges', href: '/challenges' },
                { label: 'Project Lifecycle' },
              ]
        }
        badge={
          currentRole === 'citizen' ? (
            <Badge variant="neutral">CITIZEN WORKSPACE</Badge>
          ) : currentRole === 'university' ? (
            <Badge variant="neutral">UNIVERSITY / RESEARCH WORKSPACE</Badge>
          ) : currentRole === 'industry' ? (
            <Badge variant="neutral">INDUSTRY / IMPLEMENTATION WORKSPACE</Badge>
          ) : currentRole === 'government' ? (
            <Badge variant="neutral">GOVERNMENT REVIEW WORKSPACE</Badge>
          ) : (
            <Badge variant="neutral">PROJECT LIFECYCLE</Badge>
          )
        }
        title="Project Lifecycle"
        description={
          currentRole === 'citizen'
            ? 'Track how your reported community challenge moves from submission through research validation, field testing, and potential adoption.'
            : currentRole === 'university'
            ? 'Research & Validation Perspective — explore scientific validation, laboratory readiness, and pilot milestones.'
            : currentRole === 'industry'
            ? 'Implementation & Scale Perspective — evaluate deployment logistics, field testing, and scalable production.'
            : currentRole === 'government'
            ? 'Governance & Review Perspective — review capability evidence, guide milestone progression, and govern administrative decisions.'
            : 'Track how an identified challenge moves from proposal to potential real-world adoption.'
        }
        actions={
          <div className="flex items-center gap-2.5">
            {currentRole === 'citizen' && (
              <Button
                variant="secondary"
                size="sm"
                to="/challenges"
                state={{ tab: 'my-reports', viewTab: 'my-reports' }}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-300 shadow-2xs"
              >
                ← Back to My Reports
              </Button>
            )}
            {currentRole === 'government' && (
              <Button
                variant="secondary"
                size="sm"
                to="/government"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-300 shadow-2xs"
              >
                ← Back to Government Dashboard
              </Button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>{STAGES_CONFIG[activeStageIndex]?.label || 'Field Testing'} Active</span>
            </div>
          </div>
        }
      />

      {/* --- 2. CONTEXT BANNER — Role-aware perspective banner --- */}
      {currentRole === 'citizen' ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white font-bold text-xs" aria-hidden="true">
              CTZ
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-blue-900">Citizen Workspace — Report &amp; Track</p>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                  Tracking View
                </span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
                Track how your reported challenge is progressing. Universities provide scientific validation, industry evaluates implementation readiness, and government oversees official progression decisions.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            to="/challenges"
            state={{ tab: 'my-reports', viewTab: 'my-reports' }}
            className="text-xs font-semibold text-blue-950 bg-white border-blue-200 hover:bg-blue-50 shrink-0 self-start sm:self-center cursor-pointer shadow-2xs"
          >
            ← Back to My Reports
          </Button>
        </div>
      ) : currentRole === 'university' ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 flex flex-col sm:flex-row sm:items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-700 text-white font-bold text-xs" aria-hidden="true">
            UNI
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-violet-900">University / Research Workspace — Research &amp; Validation Perspective</p>
              <span className="text-[10px] font-semibold text-violet-700 bg-violet-100/80 px-2 py-0.5 rounded border border-violet-200">
                Read-Only
              </span>
            </div>
            <p className="text-xs text-violet-800 leading-relaxed max-w-3xl">
              Explore the technical validation milestones for this challenge. Universities provide research leadership, laboratory testing, and evidence validation before field deployment. Administrative progression decisions are governed by Government review.
            </p>
          </div>
        </div>
      ) : currentRole === 'industry' ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 flex flex-col sm:flex-row sm:items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white font-bold text-xs" aria-hidden="true">
            IND
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-teal-900">Industry / Implementation Workspace — Implementation &amp; Scale Perspective</p>
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded border border-teal-200">
                Read-Only
              </span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed max-w-3xl">
              Review deployment pathways and operational readiness for this challenge. Industry partners contribute engineering capability, deployment infrastructure, and scalable manufacturing once solutions pass research validation.
            </p>
          </div>
        </div>
      ) : currentRole === 'government' ? (
        <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 flex flex-col sm:flex-row sm:items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-700 text-white font-bold text-xs" aria-hidden="true">
            GOV
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-purple-900">Government Review Workspace — Administrative Governance</p>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded border border-purple-200">
                Decision Authority
              </span>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed max-w-3xl">
              AI recommends based on capability evidence; government decides whether challenges progress. Review potential collaborators, advance lifecycle stages, and record administrative determinations below.
            </p>
          </div>
        </div>
      ) : (
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
      )}

      {/* --- 3. CHALLENGE CONTEXT CARD -  */}
      <Card variant="standard">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                challenge.isCitizenSubmission
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                {challenge.isCitizenSubmission ? 'Community Submission' : 'Citizen Report'}
              </span>
              {challenge.isCitizenSubmission ? (
                <span className="text-[11px] text-slate-500 font-medium">
                  • Prototype community record
                </span>
              ) : isFromSession ? (
                <span className="text-[11px] text-slate-400 font-medium">
                  • Transferred from intake submission
                </span>
              ) : null}
            </div>
            <CardTitle as="h2">Challenge Being Tracked</CardTitle>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              id="contextual-view-ai-analysis-btn"
              variant="secondary"
              size="sm"
              to="/ai-analysis"
              state={{ challengeId: challengeKey }}
              className="text-xs font-semibold text-indigo-950 bg-indigo-50/70 border-indigo-200 hover:bg-indigo-100 shadow-2xs"
            >
              View AI Analysis →
            </Button>
            <Badge variant="neutral">{project.label}</Badge>
          </div>
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
                {challenge.submittedBy && (
                  <span className="text-slate-400">• {challenge.submittedBy}</span>
                )}
              </div>
              {challenge.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {challenge.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${severityColor}`}>
                  {project.severity} SEVERITY
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                  AI CLASSIFIED
                </span>
                {challenge.severityRationale && (
                  <span className="text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                    <span className="font-semibold text-slate-700">Rationale:</span> {challenge.severityRationale}
                  </span>
                )}
              </div>
              {challenge.requiredExpertise && challenge.requiredExpertise.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Required Expertise:</span>
                  {challenge.requiredExpertise.slice(0, 4).map((exp) => (
                    <span key={exp} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                      {exp}
                    </span>
                  ))}
                </div>
              )}
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

      {/* --- GOVERNMENT ONLY: COLLABORATION INTEREST REVIEW SECTION --- */}
      {currentRole === 'government' && (
        <Card variant="standard" className="border-indigo-100 bg-white shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 mb-1">
                  Stakeholder Intake Review
                </div>
                <CardTitle as="h2" className="text-base font-bold text-slate-900">
                  Collaboration Interest
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organizations that have actively expressed interest in contributing research or implementation capabilities.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                Capability-Verified Intake
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {universityInterests.length === 0 && industryInterests.length === 0 ? (
              /* Zero interest case */
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 text-center space-y-2">
                <div className="flex items-center justify-center">
                  <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-sm font-semibold">
                    ℹ
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  No collaboration interest has been expressed yet.
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Potential matches may still be available based on documented capabilities. As research institutions and industry partners review this challenge, their expressed interest will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. University / Research Interests */}
                {universityInterests.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-900">
                        🎓 University / Research ({universityInterests.length})
                      </span>
                      <span className="text-[10px] text-violet-600 font-medium">Research &amp; Validation</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {universityInterests.map((r) => {
                        const inst = getInstitutionById(r.institutionId);
                        return (
                          <div
                            key={`${r.institutionId}-${r.timestamp}`}
                            className="rounded-lg border border-violet-200 bg-violet-50/40 p-3.5 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-violet-950 leading-snug">{r.institutionName}</p>
                                {inst?.dept && (
                                  <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{inst.dept}</p>
                                )}
                              </div>
                              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                ✓ Research Interest Expressed
                              </span>
                            </div>

                            {/* Expertise tags */}
                            {inst?.expertise && inst.expertise.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {inst.expertise.slice(0, 3).map((exp) => (
                                  <span
                                    key={exp}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-white text-violet-800 border border-violet-100 font-medium"
                                  >
                                    {exp}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Facility snippet */}
                            {inst?.facilities && inst.facilities.length > 0 && (
                              <p className="text-[11px] text-slate-600 leading-snug">
                                <span className="font-semibold text-slate-700">Facility:</span> {inst.facilities[0]}
                              </p>
                            )}

                            {/* Evidence provenance */}
                            {inst?.evidenceSources && inst.evidenceSources.length > 0 && (
                              <p className="text-[10px] text-slate-400 leading-snug">
                                <span className="font-semibold text-slate-500">Verified via:</span>{' '}
                                {inst.evidenceSources[0].title}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Industry / Implementation Interests */}
                {industryInterests.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                        🏭 Industry / Implementation ({industryInterests.length})
                      </span>
                      <span className="text-[10px] text-teal-600 font-medium">Implementation &amp; Scale</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {industryInterests.map((r) => {
                        const inst = getInstitutionById(r.institutionId);
                        return (
                          <div
                            key={`${r.institutionId}-${r.timestamp}`}
                            className="rounded-lg border border-teal-200 bg-teal-50/40 p-3.5 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-teal-950 leading-snug">{r.institutionName}</p>
                                {inst?.dept && (
                                  <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{inst.dept}</p>
                                )}
                              </div>
                              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                ✓ Implementation Interest Expressed
                              </span>
                            </div>

                            {/* Expertise tags */}
                            {inst?.expertise && inst.expertise.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {inst.expertise.slice(0, 3).map((exp) => (
                                  <span
                                    key={exp}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-white text-teal-800 border border-teal-100 font-medium"
                                  >
                                    {exp}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Facility snippet */}
                            {inst?.facilities && inst.facilities.length > 0 && (
                              <p className="text-[11px] text-slate-600 leading-snug">
                                <span className="font-semibold text-slate-700">Facility:</span> {inst.facilities[0]}
                              </p>
                            )}

                            {/* Evidence provenance */}
                            {inst?.evidenceSources && inst.evidenceSources.length > 0 && (
                              <p className="text-[10px] text-slate-400 leading-snug">
                                <span className="font-semibold text-slate-500">Verified via:</span>{' '}
                                {inst.evidenceSources[0].title}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 leading-relaxed">
              <span className="font-semibold text-slate-700">Notice:</span> Expressed interest indicates an organization&rsquo;s willingness to contribute research or implementation capabilities based on documented institutional strengths. Government decision below determines administrative progression of the challenge, not official contractual partnership.
            </p>
          </CardContent>
        </Card>
      )}

      {/* --- STAKEHOLDER UPDATES & EVIDENCE SECTION --- */}
      <Card variant="standard" id="stakeholder-updates-section">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 mb-1">
                Stakeholder Submissions
              </div>
              <CardTitle as="h2" className="text-lg">Stakeholder Updates &amp; Evidence</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Milestone evidence and progress reports submitted by University and Industry stakeholders.
              </p>
            </div>
            {/* University Progress Update Action */}
            {currentRole === 'university' && (
              <Button
                id="submit-progress-update-btn"
                variant="primary"
                size="sm"
                onClick={() => setIsSubmittingUpdate(true)}
                className="bg-violet-700 hover:bg-violet-800 text-xs shrink-0 self-start sm:self-auto"
              >
                Submit Progress Update
              </Button>
            )}
            {/* Industry Implementation Update Action */}
            {currentRole === 'industry' && (
              <Button
                id="submit-implementation-update-btn"
                variant="primary"
                size="sm"
                onClick={() => setIsSubmittingUpdate(true)}
                className="bg-teal-700 hover:bg-teal-800 text-xs shrink-0 self-start sm:self-auto"
              >
                Submit Implementation Update
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Submission Modal / Inline Form for University or Industry */}
          {isSubmittingUpdate && (currentRole === 'university' || currentRole === 'industry') && (
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                <p className="text-xs font-bold text-slate-900">
                  {currentRole === 'university' ? 'Submit Progress Update' : 'Submit Implementation Update'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmittingUpdate(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <form onSubmit={handleSubmitUpdate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reported Stage</label>
                    <select
                      value={updateStage}
                      onChange={(e) => setUpdateStage(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 focus:border-indigo-400 focus:outline-none"
                    >
                      {STAGES_CONFIG.map((st) => (
                        <option key={st.num} value={st.label}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Update Summary *</label>
                    <input
                      type="text"
                      required
                      placeholder={currentRole === 'university' ? 'e.g. Completed initial sensor calibration and baseline data capture' : 'e.g. Deployed test telemetry units along pilot corridor'}
                      value={updateSummary}
                      onChange={(e) => setUpdateSummary(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Evidence / Milestone Note</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe key findings, testing notes, or milestone observations."
                    value={evidenceNote}
                    onChange={(e) => setEvidenceNote(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsSubmittingUpdate(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className={`text-xs ${currentRole === 'university' ? 'bg-violet-700 hover:bg-violet-800' : 'bg-teal-700 hover:bg-teal-800'}`}
                  >
                    Submit Update
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Stage Distinction Banner: Distinguish stakeholder reported stage from official government current stage */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-600 font-semibold">Official Government-Controlled Stage:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                {STAGES_CONFIG[activeStageIndex]?.label || 'Proposal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug max-w-lg">
              Stakeholder updates report milestone evidence from academic or industrial perspectives. Official lifecycle stages advance solely through Government review and decision.
            </p>
          </div>

          {/* List of Submitted Progress & Evidence Updates */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Submitted Stakeholder Updates ({projectUpdates.length})
            </p>
            {projectUpdates.length === 0 ? (
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-4 text-center">
                <p className="text-xs text-slate-500 italic">
                  No progress updates submitted by stakeholders yet. When universities or industry partners submit research or deployment evidence, it will appear here for government review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectUpdates.map((u) => {
                  const isUni = u.role === 'university';
                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 rounded-lg border space-y-2.5 ${
                        isUni ? 'border-violet-200 bg-violet-50/30' : 'border-teal-200 bg-teal-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isUni ? 'bg-violet-100 text-violet-800 border-violet-200' : 'bg-teal-100 text-teal-800 border-teal-200'
                        }`}>
                          {isUni ? '🎓 University / Research' : '🏭 Industry / Implementation'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">{u.institutionName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-medium text-slate-500">{u.updateType}</span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                            Reported Stage: {u.stage}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{u.summary}</p>
                      {u.evidenceNote && (
                        <div className="rounded bg-white/90 p-2.5 border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
                          <span className="font-semibold text-slate-700">Evidence Note:</span> {u.evidenceNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- GOVERNMENT REVIEW / DECISION SECTION (Government role only) --- */}
      {currentRole === 'government' && (

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
                  <span className={`h-2.5 w-2.5 rounded-full ${GOV_DECISION_META[govDecision].badgeDot}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {GOV_DECISION_META[govDecision].label}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {GOV_DECISION_META[govDecision].detail}
                </p>
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
        {currentRole === 'government' && (
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

                {/* Connector line between steps */}
                {!isLast && (
                  <div
                    className={`hidden md:block h-0.5 w-4 shrink-0 transition-colors ${
                      idx < activeStageIndex ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: stacked tracker */}
        <div className="flex md:hidden flex-col gap-2">
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
                className={`w-full rounded-xl border p-3.5 ${s.wrapper} flex items-center justify-between gap-3 text-left transition-all ${
                  isSelected ? 'outline outline-2 outline-offset-1 outline-indigo-400' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.circle}`}>
                    {status === 'completed' ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stage.num
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${s.label}`}>{stage.label}</p>
                    <p className="text-[10px] text-slate-400">{stage.shortDesc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${s.statusPill}`}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-xs text-slate-400">›</span>
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
                {/* Prev/Next controls — restricted to Government only */}
                {currentRole === 'government' && (
                  <div className="flex items-center gap-3 shrink-0">
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
                )}
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

          {/* Role-specific detail card:
              - Citizen: Government Response (read-only)
              - University: Research & Validation Perspective (read-only)
              - Industry: Implementation & Scale Perspective (read-only)
              - Government / default: Operational Milestone Updates */}
          {currentRole === 'citizen' ? (
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
                  <p>Track how your reported challenge is progressing through the 5-stage lifecycle above.</p>
                </div>

                {/* Prototype disclaimer */}
                <p className="text-[10px] text-slate-400 italic">
                  Simulated prototype response — not a real government determination.
                </p>
              </CardContent>
            </Card>
          ) : currentRole === 'university' ? (
            /* --- UNIVERSITY: RESEARCH & VALIDATION PERSPECTIVE (read-only) --- */
            <Card variant="standard" className="border-violet-200">
              <CardHeader className="border-b border-violet-100 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 mb-1">
                      Research &amp; Validation Perspective
                    </div>
                    <CardTitle as="h3">Technical Validation &amp; Academic Scope</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      How university research capabilities contribute to {selectedStage.label} (Stage {selectedStage.num}).
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 whitespace-nowrap mt-1">
                    Read-Only
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="rounded-lg bg-violet-50/50 border border-violet-200/80 p-4 space-y-1.5">
                  <p className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">
                    Research Role in {selectedStage.label}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedStage.num === '01' && 'Formulate technical problem definition, analyze scientific literature, and establish baseline laboratory evaluation protocols.'}
                    {selectedStage.num === '02' && 'Conduct controlled laboratory experimentation, validate testing equipment, and simulate operational parameters.'}
                    {selectedStage.num === '03' && 'Oversee on-site sensor calibration, collect empirical field samples, and author rigorous technical validation reports.'}
                    {selectedStage.num === '04' && 'Analyze multi-site test data, refine operational specifications, and verify cross-condition reproducibility.'}
                    {selectedStage.num === '05' && 'Publish formal validation studies, establish scientific maintenance standards, and document long-term impact metrics.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Academic Leadership
                    </p>
                    <p className="text-slate-700 text-xs">
                      {project.university ? `${project.university} leads experimental validation and scientific documentation.` : 'Independent research institutions provide methodology verification.'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Next Validation Gate
                    </p>
                    <p className="text-slate-700 text-xs">{selectedStage.nextStep}</p>
                  </div>
                </div>

                {/* University research interest status — informational only, no controls */}
                {(() => {
                  // Determine which institution IDs are verified matches for this challenge
                  const matchIds = SEEDED_UNIVERSITY_MATCH_IDS[challengeKey] || [];
                  // Find interest records that match any of the verified institution IDs
                  const expressedInterests = universityInterests.filter(
                    (r) => matchIds.includes(r.institutionId)
                  );
                  if (expressedInterests.length === 0) return null;
                  return (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                        Research Interest Status
                      </p>
                      {expressedInterests.map((r) => (
                        <div
                          key={`${r.institutionId}-${r.timestamp}`}
                          className="flex items-center gap-2 text-xs text-emerald-900"
                        >
                          <svg className="h-3.5 w-3.5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            <span className="font-semibold">{r.institutionName}</span>
                            {' '}has expressed research interest in this challenge.
                          </span>
                        </div>
                      ))}
                      <p className="text-[10px] text-emerald-700/80 leading-relaxed">
                        Research interest indicates potential technical contribution — not an official partnership or confirmed collaboration.
                      </p>
                    </div>
                  );
                })()}

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>Universities validate scientific soundness; administrative progression is governed by Government review.</span>
                  <span className="italic shrink-0">Read-Only</span>
                </div>
              </CardContent>
            </Card>
          ) : currentRole === 'industry' ? (
            /* --- INDUSTRY: IMPLEMENTATION & SCALE PERSPECTIVE (read-only) --- */
            <Card variant="standard" className="border-teal-200">
              <CardHeader className="border-b border-teal-100 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-1">
                      Implementation &amp; Scale Perspective
                    </div>
                    <CardTitle as="h3">Deployment Readiness &amp; Industrial Scope</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      How industry capabilities support {selectedStage.label} (Stage {selectedStage.num}).
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap mt-1">
                    Read-Only
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="rounded-lg bg-teal-50/50 border border-teal-200/80 p-4 space-y-1.5">
                  <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                    Implementation Role in {selectedStage.label}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedStage.num === '01' && 'Assess fabrication feasibility, estimate deployment supply-chain requirements, and evaluate hardware/software integration.'}
                    {selectedStage.num === '02' && 'Fabricate prototype components, supply specialized sensors or equipment, and verify engineering tolerances.'}
                    {selectedStage.num === '03' && 'Deploy field infrastructure, conduct stress and durability testing, and manage telemetry data streams.'}
                    {selectedStage.num === '04' && 'Establish local assembly operations, optimize manufacturing unit cost, and prepare multi-district distribution.'}
                    {selectedStage.num === '05' && 'Provide ongoing operational support, supply-chain warranty fulfillment, and municipal service-level agreements.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Deployment Partner
                    </p>
                    <p className="text-slate-700 text-xs">
                      {project.industry ? `${project.industry} supports field implementation, hardware, and deployment logistics.` : 'Industry collaborators supply engineering capability.'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Target Milestone
                    </p>
                    <p className="text-slate-700 text-xs">{selectedStage.milestoneTarget}</p>
                  </div>
                </div>

                {/* Industry implementation interest status — informational only, no controls */}
                {(() => {
                  // Determine which institution IDs are verified matches for this challenge
                  const matchIds = SEEDED_INDUSTRY_MATCH_IDS[challengeKey] || [];
                  // Find interest records that match any of the verified institution IDs
                  const expressedInterests = industryInterests.filter(
                    (r) => matchIds.includes(r.institutionId)
                  );
                  if (expressedInterests.length === 0) return null;
                  return (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                        Implementation Interest Status
                      </p>
                      {expressedInterests.map((r) => (
                        <div
                          key={`${r.institutionId}-${r.timestamp}`}
                          className="flex items-center gap-2 text-xs text-emerald-900"
                        >
                          <svg className="h-3.5 w-3.5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            <span className="font-semibold">{r.institutionName}</span>
                            {' '}has expressed implementation interest in this challenge.
                          </span>
                        </div>
                      ))}
                      <p className="text-[10px] text-emerald-700/80 leading-relaxed">
                        Implementation interest indicates potential industrial and scaling contribution — not an official partnership or confirmed collaboration.
                      </p>
                    </div>
                  );
                })()}

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>Industry partners provide engineering and deployment scale; administrative progression is governed by Government review.</span>
                  <span className="italic shrink-0">Read-Only</span>
                </div>
              </CardContent>
            </Card>

          ) : null}
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

      {/* --- OUTCOME & IMPACT (STAGE-AWARE SUMMARY & VERIFICATION) --- */}
      <Card variant="standard" id="outcome-impact-section">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                Outcome &amp; Impact
              </div>
              <CardTitle as="h2" className="text-base">Outcome &amp; Impact</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Impact indicators are aligned with the active project verification stage.
              </p>
            </div>
            <Button
              id="view-impact-framework-btn"
              variant="secondary"
              size="sm"
              to="/impact"
              className="text-xs font-semibold text-emerald-950 bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100 self-start sm:self-auto shrink-0"
            >
              View Impact Framework →
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Outcome Verification Gate */}
          {outcomeRecord?.status === 'verified' ? (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  Outcome Verified
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  • Challenge Closed — Outcome Verified
                </span>
              </div>
              <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                Outcome verified. Administrative review concluded.
              </p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                {outcomeRecord.summary || 'Government has verified the reported outcome within this prototype workflow.'}
              </p>
              <p className="text-[10px] text-emerald-600/80 italic pt-1">
                Prototype demonstration — represents administrative closure in this demonstrative workflow.
              </p>
            </div>
          ) : activeStageIndex === 4 ? (
            /* Challenge is at Adopted stage */
            currentRole === 'government' ? (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                      Final Review Gate
                    </span>
                    <span className="text-xs font-bold text-slate-900">Stage: Adopted</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
                    Challenge has reached the final adoption stage. Outcome verification is pending. As the government authority, you can verify the reported outcome and close the challenge loop.
                  </p>
                </div>
                <Button
                  id="gov-verify-outcome-btn"
                  variant="primary"
                  size="sm"
                  onClick={handleVerifyOutcome}
                  className="bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
                >
                  Verify Outcome &amp; Close Challenge
                </Button>
              </div>
            ) : currentRole === 'citizen' ? (
              <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/60 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Challenge has reached the final adoption stage.</span> Outcome verification is pending administrative review.
              </div>
            ) : (
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed">
                Challenge has reached the final <span className="font-bold text-slate-800">Adopted</span> stage. Outcome verification is pending.
              </div>
            )
          ) : (
            /* Challenge is at early/mid stage (< Adopted) */
            currentRole === 'government' ? (
              <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/80 text-xs text-slate-600 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                </svg>
                <span>
                  Outcome verification becomes available after the solution reaches the final review stage (Adopted). Current official stage: <strong className="text-slate-800">{STAGES_CONFIG[activeStageIndex]?.label || 'Proposal'}</strong>.
                </span>
              </div>
            ) : currentRole === 'citizen' ? (
              <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/80 text-xs text-slate-600">
                Current official stage: <strong className="text-slate-800">{STAGES_CONFIG[activeStageIndex]?.label || 'Proposal'}</strong>. Government response and progress milestones will be updated as validation proceeds.
              </div>
            ) : null
          )}

          {/* Stage-aware status summary block */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Stage {activeStageIndex + 1}: {STAGES_CONFIG[activeStageIndex]?.label || 'Active Stage'}
                </span>
              </div>
              {outcomeRecord?.status === 'verified' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  VERIFIED OUTCOME
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                  IN PROGRESS
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeStageIndex === 0 && (
                'Outcome indicators are defined during initial feasibility assessment. No field indicators recorded yet.'
              )}
              {activeStageIndex === 1 && (
                'Pilot indicators are benchmarked during laboratory and controlled trials. Baseline data collection in progress.'
              )}
              {activeStageIndex === 2 && (
                'Field testing indicators are actively monitored in live test conditions. Real-world validation metrics under observation.'
              )}
              {activeStageIndex === 3 && (
                'Multi-site scale indicators evaluate operational consistency and deployment readiness.'
              )}
              {activeStageIndex === 4 && (
                outcomeRecord?.status === 'verified'
                  ? 'Outcome verified. Administrative review concluded. Government has verified the reported outcome within this prototype workflow.'
                  : 'Challenge has reached the final adoption stage. Outcome verification is pending.'
              )}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 border-t border-slate-200/60">
              <span>Domain: <strong className="text-slate-700">{project.label || challenge.category}</strong></span>
              <span>•</span>
              <span>Target Area: <strong className="text-slate-700">{challenge.location || 'Jharkhand'}</strong></span>
              {outcomeRecord?.verifiedAt && (
                <>
                  <span>•</span>
                  <span>Verified On: <strong className="text-emerald-700">{new Date(outcomeRecord.verifiedAt).toLocaleDateString()}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50/50 border border-emerald-200/60 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-emerald-950">
            <span>
              Explore macro impact metrics, district-level outcome indicators, and adoption analytics.
            </span>
            <Button
              variant="primary"
              size="sm"
              to="/impact"
              className="bg-emerald-800 hover:bg-emerald-700 text-xs py-1 px-3 shrink-0 text-white"
            >
              View Impact Framework →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
