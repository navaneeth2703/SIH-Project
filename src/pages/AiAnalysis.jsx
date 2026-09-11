import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
} from '../components/ui';
import { analyzeChallenge } from '../services/ai';
import { matchPartnersWithExplanation } from '../services/matching';
import { persistProblemAnalysis } from '../services/supabase';
import { getActiveRole } from '../services/roleState';
import { saveCitizenChallenge, getCitizenChallengeById } from '../services/challengeStore';

// ─── Seeded Challenges Pre-computed Analysis Knowledge-Base ──────────────────
const SEEDED_CHALLENGES_ANALYSIS = {
  'bistupur-traffic': {
    challenge: {
      id: 'bistupur-traffic',
      title: 'Severe Traffic Congestion and Lack of Public Bus Connectivity',
      category: 'Traffic & Transport',
      description:
        'Residents report severe traffic congestion and inadequate public bus connectivity causing long commute times and reduced productivity.',
      location: 'Bistupur, Jamshedpur, Jharkhand',
      submittedAt: '2026-03-01T10:00:00Z',
    },
    analysis: {
      primaryClassification: 'Traffic & Transport',
      severity: 'MEDIUM',
      severityRationale:
        'Peak-hour transit congestion affects key commercial arteries and community mobility, requiring route optimization and public bus scheduling.',
      confidence: 91,
      requiredExpertise: ['Intelligent Transportation Systems', 'Urban Traffic Flow Modeling', 'Fleet Telematics'],
      extractedKeywords: ['Traffic', 'Congestion', 'Public Bus', 'Urban Mobility', 'Transit Corridor'],
      rootCauses: [
        'Insufficient high-capacity public transit vehicles serving peak corridors',
        'Lack of synchronized traffic signaling along commercial junctions',
        'Bottlenecks near market crossings without dedicated turning lanes',
      ],
      reasoning:
        'Analyzed commuter travel patterns, junction volumes, and transit connectivity gaps across Bistupur corridor.',
      usedProvider: 'Groq',
      usedModel: 'openai/gpt-oss-20b',
    },
  },
  'baghmara-groundwater': {
    challenge: {
      id: 'baghmara-groundwater',
      title: 'Severe groundwater discoloration & odor near Baghmara tube-wells',
      category: 'Water & Environment',
      description:
        'Residents in several villages near the Baghmara mining belt report discolored groundwater and unusual odor from local tube-wells. The issue may be affecting drinking water and agriculture.',
      location: 'Baghmara, Dhanbad, Jharkhand',
      submittedAt: '2026-02-15T14:30:00Z',
    },
    analysis: {
      primaryClassification: 'Water & Environment',
      severity: 'HIGH',
      severityRationale:
        'Potential acid mine drainage leaching into potable aquifer creates an urgent public health and environmental hazard for surrounding communities.',
      confidence: 94,
      requiredExpertise: ['Groundwater Contaminant Analysis', 'Acid Mine Drainage Remediation', 'Spectral Sensor Testing'],
      extractedKeywords: ['Groundwater', 'Mine Drainage', 'Tube-wells', 'Contamination', 'Water Quality'],
      rootCauses: [
        'Unlined sub-surface mine seepage into local aquifer fissures',
        'High heavy-metal and sulfate concentration exceeding safe potable thresholds',
        'Lack of localized community-level water filtration infrastructure',
      ],
      reasoning:
        'Evaluated hydrogeological reports, chemical discoloration markers, and nearby mining proximity.',
      usedProvider: 'Groq',
      usedModel: 'openai/gpt-oss-20b',
    },
  },
  'hazaribagh-diagnostic': {
    challenge: {
      id: 'hazaribagh-diagnostic',
      title: 'Diagnostic Lab Access and Vaccine Cold-Chain Uptime in Remote Clusters',
      category: 'Public Health & Sanitation',
      description:
        'Remote clusters in Sadar Block report inadequate diagnostic lab access and frequent cold-chain failures affecting vaccine availability.',
      location: 'Sadar Block, Hazaribagh, Jharkhand',
      submittedAt: '2026-01-20T09:15:00Z',
    },
    analysis: {
      primaryClassification: 'Public Health & Sanitation',
      severity: 'HIGH',
      severityRationale:
        'Unreliable cold-chain refrigeration risks vaccine spoilage, and distant diagnostic facilities delay clinical intervention in vulnerable clusters.',
      confidence: 92,
      requiredExpertise: ['Public Health Logistics', 'Cold-Chain Monitoring', 'Diagnostic Technology'],
      extractedKeywords: ['Healthcare', 'Cold Chain', 'Vaccine', 'Diagnostic Lab', 'Rural Health'],
      rootCauses: [
        'Intermittent grid power affecting primary health center refrigeration',
        'Absence of automated temperature telemetry alerts for cold-chain breaks',
        'Geographic isolation from tertiary clinical testing laboratories',
      ],
      reasoning:
        'Evaluated PHC power continuity logs, diagnostic sample transit times, and vaccine stability parameters.',
      usedProvider: 'Groq',
      usedModel: 'openai/gpt-oss-20b',
    },
  },
  'bokaro-irrigation': {
    challenge: {
      id: 'bokaro-irrigation',
      title: 'Crop Irrigation Water Scarcity during Non-Monsoon Cycles',
      category: 'Agriculture & Irrigation',
      description:
        'Smallholder farmers in the Petarwar cluster report severe water scarcity for crop irrigation during non-monsoon periods.',
      location: 'Petarwar Cluster, Bokaro, Jharkhand',
      submittedAt: '2025-11-10T11:00:00Z',
    },
    analysis: {
      primaryClassification: 'Agriculture & Irrigation',
      severity: 'MEDIUM',
      severityRationale:
        'Seasonal moisture deficit constrains non-monsoon crop yields, requiring micro-irrigation systems and check dam water harvesting.',
      confidence: 89,
      requiredExpertise: ['Micro-Irrigation Engineering', 'Soil Moisture Retention', 'Drought-Resilient Agronomy'],
      extractedKeywords: ['Agriculture', 'Irrigation', 'Water Scarcity', 'Smallholders', 'Crop Yield'],
      rootCauses: [
        'Lack of non-monsoon rainwater capture and micro-check dam storage',
        'Flood irrigation practices causing high evaporation and runoff losses',
        'Seasonal drawdown of local shallow water table',
      ],
      reasoning:
        'Assessed rainfall cycle distribution, soil moisture profiles, and smallholder cropping patterns.',
      usedProvider: 'Groq',
      usedModel: 'openai/gpt-oss-20b',
    },
  },
};

// ─── Default problem fallback for direct URL access ──────────────────────────
const DEFAULT_CHALLENGE = {
  title: 'Severe groundwater discoloration & odor near Baghmara tube-wells',
  category: 'Water & Environment',
  description:
    'Residents in several villages near the Baghmara mining belt report discolored groundwater and unusual odor from local tube-wells. The issue may be affecting drinking water and agriculture.',
  location: 'Baghmara, Dhanbad, Jharkhand',
  submittedAt: null,
};

const SCORING_FACTORS = [
  { label: 'Expertise', weight: 40, desc: 'Domain knowledge & technical alignment' },
  { label: 'Research relevance', weight: 25, desc: 'Published work & ongoing research initiatives' },
  { label: 'Facilities', weight: 15, desc: 'Laboratory testing & equipment readiness' },
  { label: 'Location', weight: 10, desc: 'Proximity to community & field site' },
  { label: 'Evidence & Track Record', weight: 10, desc: 'Public capability evidence and verified implementation history' },
];

function getInitialAiAnalysisData(location) {
  const searchParams = new URLSearchParams(location.search);
  const targetId =
    location.state?.challengeId ||
    searchParams.get('challengeId') ||
    searchParams.get('id');

  // 1. Explicit seeded challenge
  if (targetId && SEEDED_CHALLENGES_ANALYSIS[targetId]) {
    const seeded = SEEDED_CHALLENGES_ANALYSIS[targetId];
    const matchedPartners = matchPartnersWithExplanation(seeded.analysis, seeded.challenge);
    return {
      challenge: seeded.challenge,
      analysis: {
        ...seeded.analysis,
        partners: matchedPartners,
      },
      isFromSession: false,
      loading: false,
    };
  }

  // 2. Citizen challenge
  if (targetId) {
    const citizen = getCitizenChallengeById(targetId);
    if (citizen) {
      const cur = {
        id: citizen.id,
        title: citizen.title,
        category: citizen.category,
        description: citizen.description,
        location: citizen.location,
        submittedAt: citizen.submittedAt,
        isCitizenSubmission: true,
      };
      const aiRes = {
        primaryClassification: citizen.category,
        severity: citizen.severity || 'MEDIUM',
        severityRationale: citizen.severityRationale || 'Evaluated based on community impact, vulnerability, and infrastructure constraints.',
        confidence: citizen.confidence || 88,
        requiredExpertise: Array.isArray(citizen.requiredExpertise) && citizen.requiredExpertise.length > 0
          ? citizen.requiredExpertise
          : ['Civil Engineering', 'Community Infrastructure', 'Field Validation'],
        extractedKeywords: Array.isArray(citizen.tags) && citizen.tags.length > 0
          ? citizen.tags
          : [citizen.category, 'Community'],
        rootCauses: Array.isArray(citizen.rootCauses) && citizen.rootCauses.length > 0
          ? citizen.rootCauses
          : ['Infrastructure deficit identified through community report'],
        reasoning: citizen.reasoning || 'Automated multi-factor evaluation of citizen challenge report.',
        usedProvider: citizen.usedProvider || 'Groq',
        usedModel: citizen.usedModel || 'openai/gpt-oss-20b',
      };
      const matchedPartners = matchPartnersWithExplanation(aiRes, cur);
      return {
        challenge: cur,
        analysis: {
          ...aiRes,
          partners: matchedPartners,
        },
        isFromSession: false,
        loading: false,
      };
    }
  }

  // 3. Session problem
  try {
    const stored = sessionStorage.getItem('samadhan_current_problem');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.title) {
        const cur = {
          id: parsed.id || null,
          title: parsed.title,
          category: parsed.category || 'Water & Environment',
          description: parsed.description || DEFAULT_CHALLENGE.description,
          location: parsed.location || DEFAULT_CHALLENGE.location,
          submittedAt: parsed.submittedAt || null,
        };
        const storedAnalysis = sessionStorage.getItem('samadhan_current_analysis');
        if (storedAnalysis) {
          try {
            const parsedAnalysis = JSON.parse(storedAnalysis);
            if (parsedAnalysis && parsedAnalysis.primaryClassification) {
              return {
                challenge: cur,
                analysis: parsedAnalysis,
                isFromSession: true,
                loading: false,
              };
            }
          } catch {}
        }
        return {
          challenge: cur,
          analysis: null,
          isFromSession: true,
          loading: true,
        };
      }
    }
  } catch {}

  // 4. Default fallback
  return {
    challenge: DEFAULT_CHALLENGE,
    analysis: null,
    isFromSession: false,
    loading: false,
  };
}

export default function AiAnalysis() {
  const location = useLocation();
  const [activeRole, setActiveRoleState] = useState(() => getActiveRole());
  const [publishedRecord, setPublishedRecord] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const handleRoleSync = () => setActiveRoleState(getActiveRole());
    window.addEventListener('samadhan_active_role_change', handleRoleSync);
    window.addEventListener('storage', handleRoleSync);
    return () => {
      window.removeEventListener('samadhan_active_role_change', handleRoleSync);
      window.removeEventListener('storage', handleRoleSync);
    };
  }, []);

  const [initialData] = useState(() => getInitialAiAnalysisData(location));
  const [challenge, setChallenge] = useState(initialData.challenge);
  const [isFromSession, setIsFromSession] = useState(initialData.isFromSession);
  const [analysis, setAnalysis] = useState(initialData.analysis);
  const [loading, setLoading] = useState(initialData.loading);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState(null);

  // Sync when location (state or search params) changes after initial mount
  useEffect(() => {
    const next = getInitialAiAnalysisData(location);
    setChallenge(next.challenge);
    setAnalysis(next.analysis);
    setIsFromSession(next.isFromSession);
    setLoading(next.loading);
  }, [location]);

  // Execute Gemini AI analysis
  const runAiAnalysis = useCallback(async (currentChallenge) => {
    setLoading(true);
    setError(null);
    setLoadingStep(1);

    // Step 1: Ingestion
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 500);

    try {
      // Step 2: Live AI Analysis (Groq primary, Gemini fallback)
      const aiResult = await analyzeChallenge(currentChallenge);
      setLoadingStep(3);

      // Step 3: Explainable Partner Matching
      const matchedPartners = matchPartnersWithExplanation(aiResult, currentChallenge);

      const combinedAnalysis = {
        primaryClassification: aiResult.primaryClassification,
        severity: aiResult.severity,
        severityRationale: aiResult.severityRationale || '',
        confidence: aiResult.confidence,
        requiredExpertise: aiResult.requiredExpertise || [],
        extractedKeywords: aiResult.extractedKeywords || [],
        rootCauses: aiResult.rootCauses || [],
        reasoning: aiResult.reasoning,
        usedProvider: aiResult.usedProvider || 'AI',
        usedModel: aiResult.usedModel || '',
        partners: matchedPartners,
      };

      // Save to Supabase in background if configured
      if (currentChallenge.id) {
        persistProblemAnalysis(currentChallenge.id, combinedAnalysis, matchedPartners).catch(() => {});
      }

      // Save to session storage so downstream views (Project Lifecycle, Government Dashboard) retain full data
      try {
        sessionStorage.setItem('samadhan_current_analysis', JSON.stringify(combinedAnalysis));
      } catch {
        // Non-blocking
      }

      setAnalysis(combinedAnalysis);
      setLoading(false);
    } catch (err) {
      clearTimeout(stepTimer1);
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An error occurred while contacting the AI analysis service.',
        status: err.status || null,
      });
      setLoading(false);
    }
  }, []);

  // Trigger analysis when challenge is ready
  useEffect(() => {
    if (challenge && challenge.title && isFromSession && !analysis) {
      runAiAnalysis(challenge);
    }
  }, [challenge, isFromSession, analysis, runAiAnalysis]);

  const severityColors = {
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const hasExplicitTarget = Boolean(
    location.state?.challengeId ||
    new URLSearchParams(location.search).get('challengeId') ||
    new URLSearchParams(location.search).get('id')
  );

  // University role direct access fallback: guide to Challenges workspace (when no specific challenge is requested)
  if (!hasExplicitTarget && activeRole === 'university') {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Challenges', href: '/challenges' },
            { label: 'University Workspace' },
          ]}
          badge={<Badge variant="neutral">UNIVERSITY / RESEARCH WORKSPACE</Badge>}
          title="AI Analysis is a Platform Service"
          description="Samadhan Setu automatically performs AI analysis and capability alignment on community submissions. As a university researcher, your primary workspace is Challenges."
        />
        <Card variant="standard" className="border-violet-200 bg-violet-50/20 p-8 text-center max-w-2xl mx-auto my-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 mx-auto mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Discover Research &amp; Validation Opportunities
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Universities do not need to run or operate the AI analysis directly. The platform automatically evaluates community needs and highlights relevant research, laboratory, and technical capabilities on the Challenges workspace.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" to="/challenges" className="bg-violet-700 hover:bg-violet-800">
              Explore Research Challenges →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Industry role direct access fallback: guide to Challenges workspace (when no specific challenge is requested)
  if (!hasExplicitTarget && activeRole === 'industry') {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Challenges', href: '/challenges' },
            { label: 'Industry Workspace' },
          ]}
          badge={<Badge variant="neutral">INDUSTRY / IMPLEMENTATION WORKSPACE</Badge>}
          title="AI Analysis is a Platform Service"
          description="Samadhan Setu automatically performs AI analysis and capability alignment on community submissions. As an industry partner, your primary workspace is Challenges."
        />
        <Card variant="standard" className="border-teal-200 bg-teal-50/20 p-8 text-center max-w-2xl mx-auto my-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 mx-auto mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Discover Implementation &amp; Scale Opportunities
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Industry partners do not need to operate the AI engine directly. The platform automatically evaluates community needs and highlights deployment, engineering, and scaling opportunities on the Challenges workspace.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" to="/challenges" className="bg-teal-700 hover:bg-teal-800">
              Explore Implementation Challenges →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Report a Problem', href: '/report' },
          { label: 'AI Analysis' },
        ]}
        badge={<Badge variant="AI">AI MODULE</Badge>}
        title="AI Analysis"
        description="Understand the challenge before matching it with the right people."
        actions={
          loading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" aria-hidden="true" />
              <span>Analyzing challenge with AI...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
              <span>Analysis Error</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>{analysis?.usedProvider ? `${analysis.usedProvider} Analysis Complete` : 'AI Analysis Complete'}</span>
            </div>
          )
        }
      />

      {/* Lifecycle Stepper */}
      <Card variant="standard" className="p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Submission &amp; Resolution Lifecycle
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white text-xs font-bold shadow-xs">
              ✓
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">01 Describe</p>
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Completed</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            activeRole === 'citizen'
              ? 'bg-teal-50/90 border border-teal-300 ring-2 ring-teal-500/20 shadow-2xs'
              : 'bg-indigo-50/80 border border-indigo-200/80 ring-2 ring-indigo-500/20'
          }`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white text-xs font-bold shadow-xs ${
              activeRole === 'citizen' ? 'bg-teal-800' : 'bg-indigo-900'
            }`}>
              02
            </span>
            <div>
              <p className={`text-xs font-bold ${activeRole === 'citizen' ? 'text-teal-950' : 'text-indigo-950'}`}>AI Analysis</p>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${activeRole === 'citizen' ? 'text-teal-700' : 'text-indigo-600'}`}>Active Step</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-300 text-slate-400 text-xs font-bold">
              03
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-700">Find Partners</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Next Step</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-300 text-slate-400 text-xs font-bold">
              04
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-700">Track Impact</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Step 4</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Challenge Under Analysis Card */}
      <Card variant="standard">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                activeRole === 'citizen'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {activeRole === 'citizen' && <span className="h-1.5 w-1.5 rounded-full bg-teal-600 inline-block" />}
                Citizen Report
              </span>
              {isFromSession && (
                <span className="text-[11px] text-slate-400 font-medium">
                  • Transferred from intake submission
                </span>
              )}
            </div>
            <CardTitle as="h2">Challenge Under Analysis</CardTitle>
          </div>
          <Badge variant="neutral">{challenge?.category || 'General'}</Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {challenge?.title || 'Loading challenge...'}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="font-medium text-slate-700">{challenge?.location || '—'}</span>
              </span>
              <span>•</span>
              <span>Citizen category: <strong className="text-slate-700">{challenge?.category || '—'}</strong></span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description Excerpt
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {challenge?.description || 'No description provided.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── LOADING STATE ─────────────────────────────────────────────────── */}
      {loading && (
        <Card variant="standard" className="border-indigo-200 bg-indigo-50/20 p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-40" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-900 text-white shadow-md">
                  <svg className="h-7 w-7 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                AI Triage in Progress
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Analyzing citizen submission using high-speed AI structured reasoning schema.
              </p>
            </div>

            {/* Stepped Progress Indicator */}
            <div className="space-y-2 text-left bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center gap-3 text-xs">
                <span className={`h-2 w-2 rounded-full ${loadingStep >= 1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={loadingStep >= 1 ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  1. Ingesting challenge text &amp; location coordinates
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className={`h-2 w-2 rounded-full ${loadingStep >= 2 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                <span className={loadingStep >= 2 ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  2. Querying AI model for taxonomy, severity &amp; root causes
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className={`h-2 w-2 rounded-full ${loadingStep >= 3 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                <span className={loadingStep >= 3 ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  3. Calculating explainable partner match scores
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── ERROR STATE (No Silent Fake Fallback) ─────────────────────────── */}
      {!loading && error && (
        <Card variant="standard" className="border-rose-200 bg-rose-50/20 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 font-bold text-xl">
              ⚠
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  AI Analysis Request Failed
                </h3>
                <Badge variant="critical">Error</Badge>
              </div>

              <p className="text-xs text-rose-800 font-medium">
                {error.message}
              </p>

              {/* Instructions if missing API Key */}
              {error.code === 'CONFIG_MISSING' && (
                <div className="mt-3 p-4 rounded-lg bg-white border border-rose-200 text-xs space-y-2">
                  <p className="font-bold text-slate-900">How to configure your AI API Keys:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 font-mono text-[11px]">
                    <li>Groq (Primary): Get an API key from <strong className="text-slate-800">console.groq.com</strong> and add <span className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">VITE_GROQ_API_KEY=your_key</span> in <strong className="text-slate-800">.env.local</strong></li>
                    <li>Gemini (Fallback): Get an API key from <strong className="text-slate-800">aistudio.google.com</strong> and add <span className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">VITE_GEMINI_API_KEY=your_key</span> in <strong className="text-slate-800">.env.local</strong></li>
                    <li>Restart the dev server and click "Retry Analysis" below</li>
                  </ol>
                </div>
              )}

              <div className="pt-3 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => challenge && runAiAnalysis(challenge)}
                  className="bg-indigo-900 hover:bg-indigo-800"
                >
                  Retry Analysis
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  to="/report"
                >
                  Edit Problem
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── READY TO ANALYZE (Direct Access fallback) ─────────────────── */}
      {!loading && !error && !analysis && (
        <Card variant="standard" className="border-indigo-200 bg-indigo-50/20 p-8 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Ready for AI Classification &amp; Partner Matching
            </h3>
            <p className="text-xs text-slate-500">
              Run live automated classification, severity assessment, and capability matching for this challenge.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => challenge && runAiAnalysis(challenge)}
                className="bg-indigo-900 hover:bg-indigo-800"
              >
                Run Live AI Analysis
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ─── SUCCESS: REAL AI RESULTS ─────────────────────────────────────── */}
      {!loading && !error && analysis && (
        <>
          {/* 3. AI Understanding + 4. Explainable AI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: AI Understanding */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <Card variant="standard">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 mb-1">
                        {analysis.usedProvider ? `${analysis.usedProvider} Structured Output` : 'AI Structured Output'}
                      </div>
                      <CardTitle as="h3">AI Understanding</CardTitle>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium block">Severity Assessment</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border ${severityColors[analysis.severity] || severityColors.MEDIUM}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {analysis.severity}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Primary Classification & Severity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Primary Classification
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {analysis.primaryClassification}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        AI Confidence: High
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      analysis.severity === 'HIGH'
                        ? 'bg-rose-50/50 border-rose-100'
                        : analysis.severity === 'LOW'
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : 'bg-amber-50/50 border-amber-100'
                    }`}>
                      <span className={`text-xs font-medium uppercase tracking-wider ${
                        analysis.severity === 'HIGH' ? 'text-rose-600' : analysis.severity === 'LOW' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        Urgency &amp; Risk
                      </span>
                      <p className={`text-base font-bold mt-0.5 ${
                        analysis.severity === 'HIGH' ? 'text-rose-900' : analysis.severity === 'LOW' ? 'text-emerald-900' : 'text-amber-900'
                      }`}>
                        {analysis.severity} SEVERITY
                      </p>
                      <p className={`text-xs mt-1 leading-relaxed ${
                        analysis.severity === 'HIGH' ? 'text-rose-700/80' : analysis.severity === 'LOW' ? 'text-emerald-700/80' : 'text-amber-700/80'
                      }`}>
                        {analysis.severityRationale
                          ? analysis.severityRationale
                          : 'Evaluated against population exposure and community disruption.'}
                      </p>
                    </div>
                  </div>

                  {/* Required Expertise */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      Required Disciplines &amp; Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.requiredExpertise.map((exp) => (
                        <span
                          key={exp}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Keywords */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                      Extracted Semantic Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.extractedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Root Cause Signals */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Potential Root Causes &amp; Signals
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {analysis.rootCauses.map((signal) => (
                        <li
                          key={signal}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/40 border border-amber-200/60 text-slate-800"
                        >
                          <span className="text-amber-600 font-bold">⚠</span>
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Explainable AI Reasoning */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <Card variant="standard" className="border-violet-200 bg-violet-50/20">
                <CardHeader className="pb-3 border-b border-violet-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-100 text-violet-800 border border-violet-200">
                      Explainable Reasoning
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      {analysis.usedModel || (analysis.usedProvider ? `${analysis.usedProvider} Model` : 'AI Model')}
                    </span>
                  </div>
                  <CardTitle as="h3" className="text-slate-900">
                    Why AI classified it this way
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="rounded-lg bg-white border border-violet-100 p-4 shadow-2xs">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      &ldquo;{analysis.reasoning}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-200/70">
                    <span className="text-indigo-600 text-base font-bold">ℹ</span>
                    <p className="leading-normal">
                      <strong className="text-slate-700">Auditable Reasoning:</strong> Samadhan Setu makes AI decisions explainable by showing the evidence, classification logic, and partner capabilities used for each recommendation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 5. Recommended Partners */}
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-1">
                Explainable Matching Engine
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Recommended Partners
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Institutions ranked by mathematical multi-factor alignment: expertise overlap (40%), domain research (25%), facility readiness (15%), location proximity (10%), and evidence & track record (10%).
              </p>
            </div>

            {/* Partner Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.partners.map((partner) => (
                <Card
                  key={partner.name}
                  variant="standard"
                  className={`${partner.borderClass} transition-colors flex flex-col`}
                >
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${partner.badgeClass}`}>
                            {partner.type}
                          </span>
                          {partner.matchStatus === 'VERIFIED_PUBLIC_CAPABILITY' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Verified Public Capability ({partner.evidenceSources?.length || 0} sources)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Demo / Unverified
                            </span>
                          )}
                        </div>
                        <CardTitle as="h3" className="text-base text-slate-900">
                          {partner.name}
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {partner.dept} • {partner.district}, {partner.state}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <span className="text-lg font-extrabold">{partner.score}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Match score</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 flex-1">
                    {/* Documented Capabilities */}
                    {partner.expertise && partner.expertise.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Verified Capabilities:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {partner.expertise.slice(0, 4).map((cap) => (
                            <span
                              key={cap}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                            >
                              {cap}
                            </span>
                          ))}
                          {partner.expertise.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{partner.expertise.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Matching Criteria &amp; Reasons:
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {partner.reasons.map((reason) => (
                          <li key={reason} className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 6. Match Score Explanation */}
          <Card variant="standard" className="border-indigo-100 bg-indigo-50/20">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 mb-1">
                    Transparent Scoring Formula
                  </span>
                  <CardTitle as="h3">How the match score works</CardTitle>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Weighted criteria algorithm — no black box.
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {SCORING_FACTORS.map((factor) => (
                  <div
                    key={factor.label}
                    className="rounded-lg bg-white border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{factor.label}</span>
                        <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {factor.weight}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {factor.desc}
                      </p>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-700 h-full rounded-full"
                        style={{ width: `${factor.weight * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 7. Bottom CTA & Submission */}
          {publishedRecord ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs font-bold text-lg">
                  ✓
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-900 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                      Community Submission Published
                    </span>
                    <span className="text-xs font-mono text-slate-500">ID: {publishedRecord.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Your challenge is now live in the Challenges catalog
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Universities, industry partners, and government reviewers can now view this community challenge.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  to={`/project-lifecycle?challengeId=${encodeURIComponent(publishedRecord.id)}`}
                  state={{ challengeId: publishedRecord.id }}
                  className="flex-1 sm:flex-initial bg-teal-700 hover:bg-teal-800 text-white shadow-xs font-semibold"
                >
                  View Project Lifecycle →
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  to="/challenges"
                  state={{ tab: 'my-reports', viewTab: 'my-reports' }}
                  className="flex-1 sm:flex-initial"
                >
                  View My Reports
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  to="/challenges"
                  className="flex-1 sm:flex-initial text-slate-600 hover:text-slate-900"
                >
                  View in Challenges →
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to publish this community challenge?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Publishing saves this record as a prototype community challenge and makes it visible in the Challenges workspace.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  to="/report"
                  className="flex-1 sm:flex-initial"
                >
                  Back to Report
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    if (!challenge || !analysis) return;
                    setIsPublishing(true);
                    try {
                      const saved = saveCitizenChallenge({ problem: challenge, analysis });
                      setPublishedRecord(saved);
                    } catch (err) {
                      console.error('Failed to publish challenge:', err);
                    } finally {
                      setIsPublishing(false);
                    }
                  }}
                  disabled={isPublishing || loading || Boolean(error)}
                  className="flex-1 sm:flex-initial bg-teal-700 hover:bg-teal-800 text-white shadow-xs font-semibold cursor-pointer"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  }
                  iconPosition="right"
                >
                  {isPublishing ? 'Publishing...' : 'Submit & Publish Challenge →'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
