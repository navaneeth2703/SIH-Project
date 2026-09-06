import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

export default function DemoChallenge() {
  return (
    <section className="bg-slate-50/70 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Section header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-amber-800 tracking-wide uppercase">
                Demo Challenge
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              See a challenge in action
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This is a demonstration case. It does not represent verified live citizen data.
            </p>
          </div>
        </div>

        {/* Challenge card */}
        <div className="max-w-2xl">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {/* Card top accent stripe */}
            <div className="h-1 bg-amber-400" />

            <div className="p-6 sm:p-7">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      Demo Challenge
                    </span>
                    <StatusBadge status="Field Testing" size="md" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">
                    Groundwater contamination near Baghmara
                  </h3>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-sm font-medium text-slate-700">Baghmara, Dhanbad, Jharkhand</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</p>
                  <p className="text-sm font-medium text-slate-700">Water &amp; Environment</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Severity</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <p className="text-sm font-semibold text-rose-700">High</p>
                  </div>
                </div>
              </div>

              {/* Description excerpt */}
              <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-3 mb-6">
                Residents in the Baghmara mining belt report discoloration and elevated iron content in
                groundwater. Local borewells show visible sediment. Requests for municipal testing have
                gone unanswered for six months.
              </p>

              {/* CTA */}
              <Button
                variant="secondary"
                size="md"
                to="/analysis"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                }
                iconPosition="right"
              >
                Explore Challenge
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
