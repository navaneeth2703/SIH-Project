const HOW_STEPS = [
  {
    number: '01',
    label: 'Report',
    title: 'Citizens describe the problem',
    desc: 'Anyone can submit a societal challenge — from contaminated water sources to road safety failures — along with location, category, severity, and supporting evidence.',
    accent: 'indigo',
  },
  {
    number: '02',
    label: 'Understand',
    title: 'AI classifies the challenge',
    desc: 'The platform automatically categorises the problem, estimates its severity, and identifies the domain expertise required to address it. Every inference is explained, not hidden.',
    accent: 'violet',
    tag: 'AI',
  },
  {
    number: '03',
    label: 'Match',
    title: 'Capable partners are identified',
    desc: 'The matching engine searches for universities and industry partners with relevant research expertise and implementation capability — and shows exactly why each partner was selected.',
    accent: 'indigo',
  },
  {
    number: '04',
    label: 'Solve & Measure',
    title: 'Collaborative project with tracked outcomes',
    desc: 'Selected partners form a structured project team. Progress moves from Proposal through Pilot, Field Testing and Scale — tracked until adoption and measurable impact.',
    accent: 'emerald',
  },
];

const accentMap = {
  indigo: {
    numBg: 'bg-indigo-900',
    labelBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    border: 'border-indigo-100',
  },
  violet: {
    numBg: 'bg-violet-700',
    labelBg: 'bg-violet-50 text-violet-700 border-violet-200',
    border: 'border-violet-100',
  },
  emerald: {
    numBg: 'bg-emerald-700',
    labelBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-emerald-100',
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-indigo-800 tracking-wide uppercase">
              The Process
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            How Samadhan Setu Works
          </h2>
          <p className="mt-3 text-base text-slate-500 leading-relaxed">
            From a citizen&apos;s description to a measured outcome — a structured, transparent four-stage process.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {HOW_STEPS.map((step) => {
            const a = accentMap[step.accent] || accentMap.indigo;
            return (
              <div
                key={step.number}
                className={`flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-xs ring-4 ${a.border}`}
              >
                {/* Number + label row */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.numBg} text-white text-xs font-bold`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${a.labelBg}`}
                  >
                    {step.label}
                  </span>
                  {step.tag && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200 ml-auto">
                      AI
                    </span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
