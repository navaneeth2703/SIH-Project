import { useState, useEffect } from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../components/ui";
import { getActiveRole } from '../services/roleState';

// ─── 6 Main Workflow Steps Data ──────────────────────────────────────────────
const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Report a Problem",
    subtitle: "Community-driven issue intake",
    description:
      "A citizen, local group, or civic representative submits a societal challenge with location, detailed description, affected population context, and supporting media.",
    badge: "Intake",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    visual: (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {["Geotagged Location", "Issue Narrative", "Category Context", "Community Need"].map((t) => (
          <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    num: "02",
    title: "AI Understands",
    subtitle: "Automated requirement scoping",
    description:
      "Samadhan Setu's AI intake engine analyzes the unstructured submission to extract structural signals before any matching begins:",
    badge: "Analysis",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    visual: (
      <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
        {[
          "Problem category & domain mapping",
          "Severity rating (High / Medium)",
          "Core required technical expertise",
          "Key contextual concepts & signals",
          "Duplicate / related challenge clustering",
        ].map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    num: "03",
    title: "Explainable Match",
    subtitle: "5-factor capability ranking",
    description:
      "The matching engine evaluates challenge requirements against verified institutional capability profiles using transparent criteria:",
    badge: "Scoring",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    visual: (
      <div className="space-y-2 pt-1">
        {[
          { label: "Technical Expertise", weight: "40%", width: "w-2/5", bg: "bg-indigo-600" },
          { label: "Research / Domain Relevance", weight: "25%", width: "w-1/4", bg: "bg-indigo-500" },
          { label: "Specialized Facilities & Labs", weight: "15%", width: "w-[15%]", bg: "bg-indigo-400" },
          { label: "Geographic Proximity", weight: "10%", width: "w-[10%]", bg: "bg-indigo-300" },
          { label: "Evidence & Public Track Record", weight: "10%", width: "w-[10%]", bg: "bg-indigo-300" },
        ].map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-slate-600 font-medium">{c.label}</span>
              <span className="text-slate-800 font-bold">{c.weight}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${c.bg} rounded-full`} style={{ width: c.weight }} />
            </div>
          </div>
        ))}
        <p className="text-[11px] text-slate-400 italic pt-1">
          Matches are based on capability evidence, not arbitrary AI scores.
        </p>
      </div>
    ),
  },
  {
    num: "04",
    title: "Collaborate",
    subtitle: "Multilateral problem-solving",
    description:
      "Connects the challenge with qualified university/research institutions and industry capability profiles to formulate collaborative action.",
    badge: "Coordination",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    visual: (
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 text-center">
            <span className="font-semibold text-indigo-900 block">Research & Academia</span>
            <span className="text-[11px] text-indigo-700">R&D, lab validation & testing</span>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 text-center">
            <span className="font-semibold text-teal-900 block">Industry Organisations</span>
            <span className="text-[11px] text-teal-700">Execution, scale & field deployment</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2 leading-relaxed">
          Potential collaborators are identified from publicly documented capabilities. A match is not the same as a confirmed partnership.
        </p>
      </div>
    ),
  },
  {
    num: "05",
    title: "Project Lifecycle",
    subtitle: "Structured progression tracking",
    description:
      "Progress can be tracked through defined stages instead of stopping at a recommendation:",
    badge: "Lifecycle",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    visual: (
      <div className="space-y-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { name: "Proposal", color: "bg-slate-100 text-slate-700 border-slate-200" },
            { name: "Pilot", color: "bg-blue-50 text-blue-700 border-blue-200" },
            { name: "Field Testing", color: "bg-violet-50 text-violet-700 border-violet-200" },
            { name: "Scale", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
            { name: "Adopted", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          ].map((st, i) => (
            <div key={st.name} className="flex items-center gap-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${st.color}`}>
                {st.name}
              </span>
              {i < 4 && <span className="text-slate-300 text-xs">→</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Each stage can capture milestones, validation activities, and progress evidence before moving forward.
        </p>
      </div>
    ),
  },
  {
    num: "06",
    title: "Measure Impact",
    subtitle: "Outcome validation & review",
    description:
      "Closed-loop tracking helps teams monitor outcomes and prepare evidence for real-world validation:",
    badge: "Impact",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    visual: (
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
          {[
            { label: "Challenge", sub: "Intake baseline" },
            { label: "Solution", sub: "Tech validation" },
            { label: "Outcome", sub: "Measurable shift" },
            { label: "Gov Review", sub: "Civic adoption" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-lg p-1.5">
              <span className="text-xs font-semibold text-slate-800 block">{item.label}</span>
              <span className="text-[10px] text-slate-400">{item.sub}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Impact indicators can be monitored and later replaced with verified field data when deployed.
        </p>
      </div>
    ),
  },
];

// ─── Differentiator Cards ────────────────────────────────────────────────────
const DIFFERENTIATORS = [
  {
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Understands the Problem",
    description: "AI converts unstructured citizen reports into actionable problem intelligence.",
    detail: "Extracts technical requirements, estimates severity, identifies location and contextual signals, and helps group duplicate or related complaints.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-1.41-6.177l-1.59 1.59a1.5 1.5 0 01-1.06.44H8.25a1.5 1.5 0 00-1.5 1.5v2.69a1.5 1.5 0 01-.44 1.06l-1.59 1.59a1.5 1.5 0 000 2.12l1.59 1.59a1.5 1.5 0 01.44 1.06v2.69a1.5 1.5 0 001.5 1.5h2.69a1.5 1.5 0 011.06.44l1.59 1.59a1.5 1.5 0 002.12 0l1.59-1.59a1.5 1.5 0 011.06-.44h2.69a1.5 1.5 0 001.5-1.5v-2.69a1.5 1.5 0 01.44-1.06l1.59-1.59a1.5 1.5 0 000-2.12l-1.59-1.59a1.5 1.5 0 01-.44-1.06V8.25a1.5 1.5 0 00-1.5-1.5h-2.69a1.5 1.5 0 01-1.06-.44l-1.59-1.59a1.5 1.5 0 00-2.12 0z" />
      </svg>
    ),
    title: "Matches with Evidence",
    description: "Partners are ranked using institutional capabilities, facilities, relevance, location, and public evidence.",
    detail: "Eliminates opaque black-box recommendations; every qualified match displays documented capabilities, facilities, and domain evidence.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Tracks Beyond the Match",
    description: "Projects move through a lifecycle so promising ideas can progress toward field validation and adoption.",
    detail: "Moves beyond simple matchmaking by supporting the handover from laboratory or technical validation to pilot field testing, government review, and potential adoption.",
  },
];

// ─── Trust / Safety Principles ───────────────────────────────────────────────
const TRUST_POINTS = [
  {
    title: "Verified Capability Profiles",
    desc: "Only institutions with documented, verifiable public capabilities are qualified. Synthetic or unverified entities are excluded from live recommendations.",
  },
  {
    title: "Prototype Records Clearly Labelled as Illustrative",
    desc: "All seeded challenge records and test scenarios are transparently tagged as demonstration data to maintain integrity and prevent confusion.",
  },
  {
    title: "No sufficiently supported match → flag for capability-profile expansion",
    desc: "The platform never fabricates a partner when the registry lacks sufficient capability evidence. Instead, the gap is surfaced as an open priority for institutional intake.",
  },
];

export default function HowItWorks() {
  const [activeRole, setActiveRole] = useState(() => getActiveRole());

  useEffect(() => {
    const sync = () => setActiveRole(getActiveRole());
    window.addEventListener('samadhan_active_role_change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('samadhan_active_role_change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* ── 1. Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="How It Works"
        description="From a citizen-reported problem to an evidence-backed path toward real-world impact."
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Problem → Match → Collaborate → Solve → Impact
          </span>
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "How It Works" },
        ]}
      />

      {/* ── 2. Main Workflow (6 Numbered Stages) ─────────────────────────── */}
      <div>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            The Complete Workflow
          </h2>
          <p className="text-sm text-slate-500">
            A 6-step lifecycle translating community pain points into evidence-backed civic solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKFLOW_STEPS.map((step) => (
            <Card
              key={step.num}
              variant="elevated"
              className="flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black tracking-tight text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5">
                    {step.num}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>
                <CardTitle as="h3" className="text-base text-slate-900">
                  {step.title}
                </CardTitle>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  {step.subtitle}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  {step.description}
                </p>
              </CardHeader>

              <CardContent className="pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                {step.visual}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 3. Explainable Match Visual ───────────────────────────────────── */}
      <div>
        <Card variant="standard" className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 shadow-xs">
          <CardHeader className="text-center pb-2">
            <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md mx-auto mb-2">
              Transparent Matching Architecture
            </span>
            <CardTitle as="h3" className="text-lg text-slate-900">
              Explainable Problem-to-Partner Matching
            </CardTitle>
            <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1">
              How Samadhan Setu moves from raw citizen complaints to verified research and industrial capabilities.
            </p>
          </CardHeader>

          <CardContent className="pt-4 pb-6">
            {/* Visual Step Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center max-w-4xl mx-auto">
              {[
                { title: "Citizen Problem", desc: "Location & context intake" },
                { title: "AI-derived Requirements", desc: "Domain, severity & needs" },
                { title: "Verified Profiles", desc: "Public capabilities database" },
                { title: "Weighted Matching", desc: "5-factor evidence score" },
                { title: "Potential Collaborators", desc: "Research + Industry pairs" },
              ].map((item, idx) => (
                <div key={item.title} className="flex flex-col items-center text-center relative">
                  <div className="w-full bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
                    <span className="text-[10px] font-bold text-indigo-600 block mb-0.5">
                      STEP 0{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1 leading-tight">
                      {item.desc}
                    </span>
                  </div>
                  {idx < 4 && (
                    <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">
                      →
                    </div>
                  )}
                  {idx < 4 && (
                    <div className="sm:hidden text-slate-400 font-bold my-1">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-slate-500 italic mt-6 max-w-lg mx-auto">
              "Every recommendation should be explainable through the capabilities and evidence used to produce it."
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Why Samadhan Setu Is Different ─────────────────────────────── */}
      <div>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Why Samadhan Setu?
          </h2>
          <p className="text-sm text-slate-500">
            A purpose-built governance architecture designed for accountability and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DIFFERENTIATORS.map((item) => (
            <Card key={item.title} variant="standard" className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <CardTitle as="h3" className="text-base text-slate-900">
                  {item.title}
                </CardTitle>
                <p className="text-xs font-medium text-slate-700 mt-1 leading-relaxed">
                  "{item.description}"
                </p>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 5. Safety & Trust Section ─────────────────────────────────────── */}
      <div>
        <Card variant="subtle" className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Governance & Integrity
            </span>
            <CardTitle as="h3" className="text-base text-slate-900">
              Built for Responsible Scaling
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRUST_POINTS.map((tp) => (
                <div key={tp.title} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-800">
                      {tp.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tp.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 6. Final Call to Action ───────────────────────────────────────── */}
      <div className="pt-2 pb-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 text-white shadow-md">
          <div className="py-8 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Have a problem worth solving?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                Submit a community or civic issue to trigger AI-driven requirement scoping and find potential institutional problem-solvers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Report a Problem: Citizen-only action */}
              {(!activeRole || activeRole === 'citizen') && (
                <Button
                  to="/report"
                  variant="secondary"
                  size="md"
                  className="!bg-white !text-slate-900 hover:!bg-slate-100 !border-white font-semibold"
                >
                  Report a Problem →
                </Button>
              )}
              <Button
                to="/challenges"
                variant="ghost"
                size="md"
                className="!text-slate-200 hover:!text-white hover:!bg-slate-800 border !border-slate-700"
              >
                Explore Challenges →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
