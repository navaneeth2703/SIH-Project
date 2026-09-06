const PIPELINE = [
  { label: 'Problem', color: 'slate', icon: '⚠', desc: 'Citizen-reported societal challenge' },
  { label: 'AI Analysis', color: 'violet', icon: '◈', desc: 'Classification, severity & expertise extraction' },
  { label: 'University + Industry', color: 'indigo', icon: '◎', desc: 'Explainable partner matching' },
  { label: 'Project', color: 'teal', icon: '◉', desc: 'Structured collaborative execution' },
  { label: 'Impact', color: 'emerald', icon: '✓', desc: 'Measurable, tracked outcomes' },
];

const colorMap = {
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    iconBg: 'bg-slate-200 text-slate-700',
    connector: 'bg-slate-300',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    border: 'border-violet-200',
    iconBg: 'bg-violet-100 text-violet-700',
    connector: 'bg-violet-200',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-700',
    connector: 'bg-indigo-200',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    iconBg: 'bg-teal-100 text-teal-700',
    connector: 'bg-teal-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    connector: 'bg-emerald-200',
  },
};

export default function Differentiator() {
  return (
    <section className="border-b border-slate-200/80 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Heading */}
        <div className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">
              Core Differentiator
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Not just a complaint portal.
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-xl">
            Samadhan Setu follows a challenge beyond submission — from understanding and partner
            selection to project execution and measurable impact.
          </p>
        </div>

        {/* Pipeline — horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {PIPELINE.map((stage, idx) => {
            const c = colorMap[stage.color];
            const isLast = idx === PIPELINE.length - 1;

            return (
              <div key={stage.label} className="flex flex-col md:flex-row items-stretch flex-1">
                {/* Stage card */}
                <div
                  className={`flex flex-col items-center text-center gap-3 rounded-xl p-5 border ${c.border} ${c.bg} flex-1`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${c.iconBg} text-lg font-bold`}
                    aria-hidden="true"
                  >
                    {stage.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${c.text}`}>{stage.label}</p>
                    <p className="mt-1 text-xs text-slate-600 leading-snug">{stage.desc}</p>
                  </div>
                </div>

                {/* Arrow connector */}
                {!isLast && (
                  <div
                    className="flex items-center justify-center py-2 md:py-0 md:px-2"
                    aria-hidden="true"
                  >
                    {/* Down arrow on mobile, right arrow on desktop */}
                    <svg
                      className="h-5 w-5 text-slate-500 md:rotate-0 rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
