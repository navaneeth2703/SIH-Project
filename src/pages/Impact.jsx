import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../components/ui";

// ─── 1. Impact Journey Pipeline Steps ────────────────────────────────────────
const JOURNEY_STEPS = [
  { step: "01", title: "Citizen Reports", desc: "Local problems submitted with location & context" },
  { step: "02", title: "Better Problem Understanding", desc: "AI-assisted triage, scoping & requirement analysis" },
  { step: "03", title: "Evidence-backed Matching", desc: "Transparent 5-factor scoring against verified profiles" },
  { step: "04", title: "Collaborative Solutions", desc: "University research & industry capability alignment" },
  { step: "05", title: "Field Validation", desc: "Pilots tested under controlled real-world conditions" },
  { step: "06", title: "Measurable Impact", desc: "Validated indicator improvements & government review" },
];

// ─── 2. Stakeholder Cards Data ───────────────────────────────────────────────
const STAKEHOLDERS = [
  {
    role: "Citizens & Communities",
    badge: "Community Intake",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    benefits: [
      "A structured channel to report local problems",
      "Greater visibility into problem progress",
      "Potential access to relevant institutional capabilities",
      "Less dependence on fragmented complaint channels",
    ],
    measurableImpact:
      "Problems reported → problems triaged → problems progressing to solution stages",
  },
  {
    role: "Universities & Research",
    badge: "R&D & Validation",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    benefits: [
      "Discover real-world problems relevant to institutional expertise",
      "Apply research, laboratories, and technical capabilities",
      "Build field-validation opportunities",
      "Strengthen university-community collaboration",
    ],
    measurableImpact:
      "Relevant challenges matched → pilots supported → solutions validated",
  },
  {
    role: "Industry & Implementation",
    badge: "Scale & Deployment",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    icon: (
      <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    benefits: [
      "Identify problems aligned with industry capabilities",
      "Contribute engineering, technology, implementation, and deployment expertise",
      "Support pilot execution and scaling",
      "Create measurable social-impact opportunities",
    ],
    measurableImpact:
      "Potential matches → implementation support → pilots progressing toward scale",
  },
  {
    role: "Government & Administrators",
    badge: "Civic Governance",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: (
      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5H4.5V21" />
      </svg>
    ),
    benefits: [
      "Structured visibility into reported challenges",
      "Priority and severity-based triage",
      "Evidence-backed potential collaborator discovery",
      "Lifecycle and outcome monitoring",
    ],
    measurableImpact:
      "Challenges tracked → projects progressing → outcomes reviewed",
  },
];

// ─── 3. Measurement Metric Categories ────────────────────────────────────────
const METRIC_CATEGORIES = [
  {
    num: "01",
    label: "Reach",
    definition: "Citizens, communities, and geographic areas represented in the platform.",
    sub: "Geographic footprint & community coverage",
  },
  {
    num: "02",
    label: "Response",
    definition: "Time from challenge submission to triage, matching, and project initiation.",
    sub: "Triage velocity & initial response duration",
  },
  {
    num: "03",
    label: "Collaboration",
    definition: "Number of evidence-backed potential matches, pilots initiated, and institutions participating.",
    sub: "Academic & industrial ecosystem engagement",
  },
  {
    num: "04",
    label: "Outcomes",
    definition: "Validated improvements in the problem-specific indicators selected for each project.",
    sub: "Domain-specific field performance improvements",
  },
];

// ─── 4. Problem-Specific Indicator Examples ──────────────────────────────────
const PROBLEM_INDICATORS = [
  {
    category: "Traffic & Transport",
    domain: "Urban Mobility",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    indicators: [
      "Travel time",
      "Traffic flow",
      "Public transport availability",
      "Vehicle congestion",
    ],
  },
  {
    category: "Water & Environment",
    domain: "Environmental Health",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    indicators: [
      "Water quality",
      "Safe-water access",
      "Treatment performance",
      "Environmental indicators",
    ],
  },
  {
    category: "Agriculture & Irrigation",
    domain: "Rural Livelihoods",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indicators: [
      "Irrigation reliability",
      "Crop productivity",
      "Water-use efficiency",
      "Farmer coverage",
    ],
  },
];

// ─── 5. Long-term System Impact Points ───────────────────────────────────────
const LONG_TERM_POINTS = [
  {
    title: "Faster Connections",
    desc: "Reduce the gap between societal problems and relevant problem-solving capabilities.",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Reusable Capability Network",
    desc: "Build a growing, evidence-backed directory of institutional expertise, facilities, and implementation capabilities.",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-6A1.125 1.125 0 012.25 9.375v-2.25zM13.5 7.125c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-2.25zM2.25 14.625c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-2.25zM13.5 14.625c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-2.25z" />
      </svg>
    ),
  },
  {
    title: "Learning from Outcomes",
    desc: "Use validated project outcomes to improve future prioritisation, collaboration, and solution pathways.",
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

// ─── 6. Responsible Trust Points ─────────────────────────────────────────────
const TRUST_POINTS = [
  {
    title: "Illustrative Prototype Scenarios",
    desc: "Prototype records are clearly labelled as illustrative demonstration data created for the SIH 2026 prototype.",
  },
  {
    title: "Evidence-Backed Capability Matching",
    desc: "Institutional matches are based on publicly documented capabilities, labs, and published domain track records.",
  },
  {
    title: "Verified Field Data Requirement",
    desc: "Real-world impact claims require verified field data and objective criteria before being recorded.",
  },
  {
    title: "Expansion over Fabrication",
    desc: "No sufficiently supported match → expand the capability registry rather than fabricate a recommendation.",
  },
];

export default function Impact() {
  return (
    <div className="space-y-12">
      {/* ── 1. Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Impact & Benefits"
        description="Turning community-reported problems into coordinated action, measurable outcomes, and stronger local problem-solving capacity."
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Citizen Impact • Institutional Collaboration • Government Visibility
          </span>
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Impact" },
        ]}
      />

      {/* ── 2. Impact Journey / Outcome Flow ─────────────────────────────── */}
      <div>
        <Card variant="standard" className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 shadow-xs">
          <CardHeader className="text-center pb-2">
            <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md mx-auto mb-2">
              End-to-End Value Realisation
            </span>
            <CardTitle as="h2" className="text-xl font-bold text-slate-900">
              The Impact Journey
            </CardTitle>
            <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1">
              How civic challenges can transition systematically from intake to validated, real-world outcomes.
            </p>
          </CardHeader>

          <CardContent className="pt-4 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-center max-w-5xl mx-auto">
              {JOURNEY_STEPS.map((item, idx) => (
                <div key={item.title} className="flex flex-col items-center text-center relative">
                  <div className="w-full bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
                    <span className="text-[10px] font-bold text-indigo-600 block mb-0.5">
                      STAGE {item.step}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1 leading-tight">
                      {item.desc}
                    </span>
                  </div>
                  {idx < 5 && (
                    <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10 text-xs">
                      →
                    </div>
                  )}
                  {idx < 5 && (
                    <div className="sm:hidden text-slate-400 font-bold my-1 text-xs">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center max-w-2xl mx-auto">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                "Samadhan Setu is designed to shorten the path between identifying a societal problem and finding the capabilities needed to test and solve it."
              </p>
              <p className="text-[11px] text-slate-400 italic mt-1">
                The platform facilitates discovery, coordination, and progress tracking; real-world success depends on collaborative execution and field testing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Four Stakeholder Impact Cards ─────────────────────────────── */}
      <div>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Value Across Stakeholders
          </h2>
          <p className="text-sm text-slate-500">
            How Samadhan Setu can deliver targeted value across the civic problem-solving spectrum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STAKEHOLDERS.map((st) => (
            <Card key={st.role} variant="elevated" className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                      {st.icon}
                    </div>
                    <CardTitle as="h3" className="text-base text-slate-900">
                      {st.role}
                    </CardTitle>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${st.badgeColor}`}>
                    {st.badge}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Key Potential Benefits
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {st.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardHeader>

              <CardContent className="pt-3 border-t border-slate-100 bg-slate-50/60 rounded-b-xl">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Impact that can eventually be measured:
                </p>
                <div className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700">
                  {st.measurableImpact}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 4. Measuring Impact (4 Categories) ────────────────────────────── */}
      <div>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            How Impact Can Be Measured
          </h2>
          <p className="text-sm text-slate-500">
            Structured measurement categories designed for evaluation after real-world deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRIC_CATEGORIES.map((m) => (
            <Card key={m.num} variant="standard" className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5">
                    CATEGORY {m.num}
                  </span>
                </div>
                <CardTitle as="h3" className="text-base text-slate-900">
                  {m.label}
                </CardTitle>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  "{m.definition}"
                </p>
              </CardHeader>
              <CardContent className="pt-2 border-t border-slate-100 bg-slate-50/40 rounded-b-xl">
                <span className="text-[11px] text-slate-400 block">{m.sub}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500">
            <strong className="font-semibold text-slate-700">Note on prototype measurement:</strong>{" "}
            Prototype metrics shown here are measurement categories, not claimed field results. Actual values would come from verified deployment data.
          </p>
        </div>
      </div>

      {/* ── 5. Problem-Specific Impact Examples ───────────────────────────── */}
      <div>
        <div className="mb-6 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Impact Depends on the Problem
              </h2>
              <p className="text-sm text-slate-500">
                Outcome indicators are chosen specifically based on the nature of the challenge.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              Illustrative outcome indicators — selected and validated per project.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEM_INDICATORS.map((prob) => (
            <Card key={prob.category} variant="standard" className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border w-fit block mb-2 ${prob.badgeColor}`}>
                  {prob.domain}
                </span>
                <CardTitle as="h3" className="text-base text-slate-900">
                  {prob.category}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Possible measurement indicators:
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5">
                  {prob.indicators.map((ind) => (
                    <div key={ind} className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 6. Government Value / Decision Support ────────────────────────── */}
      <div>
        <Card variant="standard" className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md w-fit block mb-1">
              Administrative Decision Support
            </span>
            <CardTitle as="h2" className="text-lg text-slate-900">
              From Complaints to Decision Support
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-2 pb-6 space-y-5">
            {/* Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
              {[
                { step: "01", label: "Reported Challenge" },
                { step: "02", label: "AI Triage" },
                { step: "03", label: "Capability Matches" },
                { step: "04", label: "Project Lifecycle" },
                { step: "05", label: "Evidence Review" },
                { step: "06", label: "Government Decision" },
              ].map((item, idx) => (
                <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-purple-700 block mb-0.5">
                    STEP {item.step}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {item.label}
                  </span>
                  {idx < 5 && (
                    <span className="hidden sm:inline-block text-[10px] text-slate-300 mt-1">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Government teams can use the platform to identify priority challenges, review potential institutional capabilities, monitor project progress, and examine evidence before considering scale-up.
              </p>
              <p className="text-[11px] text-slate-400 italic mt-1.5">
                The platform provides structured intelligence and workflow management; administrative decisions, approvals, and budget allocations remain fully under government authority.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 7. Long-Term Potential ────────────────────────────────────────── */}
      <div>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Long-Term Potential
          </h2>
          <p className="text-sm text-slate-500">
            Systemic benefits of establishing an evidence-backed civic innovation exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LONG_TERM_POINTS.map((lt) => (
            <Card key={lt.title} variant="standard" className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-3">
                  {lt.icon}
                </div>
                <CardTitle as="h3" className="text-base text-slate-900 uppercase tracking-wide">
                  {lt.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lt.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 8. Responsible Impact ─────────────────────────────────────────── */}
      <div>
        <Card variant="subtle" className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Integrity & Governance
            </span>
            <CardTitle as="h3" className="text-base text-slate-900">
              Impact With Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {TRUST_POINTS.map((tp) => (
                <div key={tp.title} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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

      {/* ── 9. Final Call to Action ───────────────────────────────────────── */}
      <div className="pt-2 pb-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 text-white shadow-md">
          <div className="py-8 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Have a problem worth solving?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                Start with a community problem and let Samadhan Setu structure the path toward potential institutional collaboration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                to="/report"
                variant="secondary"
                size="md"
                className="!bg-white !text-slate-900 hover:!bg-slate-100 !border-white font-semibold"
              >
                Report a Problem →
              </Button>
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
