import Button from '../../components/ui/Button';

const FLOW_STEPS = [
  {
    number: '01',
    title: 'Citizen Problem',
    desc: 'A citizen describes a societal challenge with context and evidence.',
    color: 'indigo',
  },
  {
    number: '02',
    title: 'AI Understanding',
    desc: 'The platform classifies the challenge, estimates severity and extracts required expertise.',
    color: 'violet',
  },
  {
    number: '03',
    title: 'Partner Matching',
    desc: 'The engine identifies capable universities and industry partners with transparent reasoning.',
    color: 'indigo',
  },
  {
    number: '04',
    title: 'Collaborative Project',
    desc: 'Partners launch a structured project with milestones, pilots and field testing.',
    color: 'teal',
  },
  {
    number: '05',
    title: 'Measurable Impact',
    desc: 'Outcomes are tracked from pilot adoption to city-scale implementation.',
    color: 'emerald',
  },
];

const colorMap = {
  indigo: {
    ring: 'ring-indigo-100',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    numBg: 'bg-indigo-900',
    connector: 'bg-indigo-200',
  },
  violet: {
    ring: 'ring-violet-100',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    numBg: 'bg-violet-700',
    connector: 'bg-violet-200',
  },
  teal: {
    ring: 'ring-teal-100',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    numBg: 'bg-teal-700',
    connector: 'bg-teal-200',
  },
  emerald: {
    ring: 'ring-emerald-100',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    numBg: 'bg-emerald-700',
    connector: 'bg-emerald-200',
  },
};

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white border-b border-slate-200/80"
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 70% 20%, rgba(99,102,241,0.05) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(20,184,166,0.04) 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" aria-hidden="true" />
              <span className="text-xs font-semibold text-indigo-800 tracking-wide uppercase">
                Smart India Hackathon 2026
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              From Problems{' '}
              <br />
              <span className="text-indigo-900">to Solutions.</span>
            </h1>

            {/* Supporting copy */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
              Samadhan Setu connects citizen-reported societal challenges with universities and
              industry partners — turning problems into collaborative projects and measurable impact.
            </p>

            {/* We don't just collect */}
            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-md border-l-2 border-indigo-200 pl-3">
              We don&apos;t just collect societal problems. We route them to the people capable of
              solving them, and track them until measurable impact.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                to="/report"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
                iconPosition="right"
                className="bg-indigo-900 hover:bg-indigo-800"
              >
                Report a Problem
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-base font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                See How It Works
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — Platform Flow Visual */}
          <div className="relative">
            <div className="flex flex-col gap-3">
              {FLOW_STEPS.map((step, idx) => {
                const c = colorMap[step.color];
                const isLast = idx === FLOW_STEPS.length - 1;

                return (
                  <div key={step.number} className="relative flex flex-col">
                    <div
                      className={`flex items-start gap-4 rounded-xl p-4 border border-slate-200/80 bg-white shadow-xs ring-4 ${c.ring} transition-all`}
                    >
                      {/* Number badge */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.numBg} text-white text-xs font-bold`}
                      >
                        {step.number}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>

                    {/* Connector arrow */}
                    {!isLast && (
                      <div className="flex justify-center py-1.5" aria-hidden="true">
                        <div className={`flex flex-col items-center gap-0.5`}>
                          <div className={`w-0.5 h-3 ${c.connector}`} />
                          <svg className={`h-3 w-3 ${c.text}`} fill="currentColor" viewBox="0 0 10 10">
                            <path d="M5 8 L0 2 L10 2 Z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
