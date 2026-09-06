import Button from '../../components/ui/Button';

const METRICS = [
  {
    value: '1,248',
    label: 'Challenges Reported',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
      </svg>
    ),
    iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  {
    value: '312',
    label: 'Active Projects',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    value: '86',
    label: 'Solutions Adopted',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    value: '42,800',
    label: 'Citizens Reached',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
  },
];

export default function ImpactPreview() {
  return (
    <section id="impact" className="bg-white border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              Platform Impact
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            From individual problems to ecosystem-level impact.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A summary of the platform&apos;s reach and outcomes.
          </p>
        </div>

        {/* Demo data disclaimer */}
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/80">
          <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs font-medium text-amber-800">
            Demo / Simulated Data — these figures are illustrative and do not represent real government statistics.
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col gap-3 rounded-xl bg-white border border-slate-200/80 shadow-xs p-5"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${metric.iconBg}`}
              >
                {metric.icon}
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {metric.value}
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {metric.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="secondary"
          size="md"
          to="/government"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          }
          iconPosition="right"
        >
          View Impact Dashboard
        </Button>
      </div>
    </section>
  );
}
