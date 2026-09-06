import Button from '../../components/ui/Button';

export default function FinalCta() {
  return (
    <section className="bg-indigo-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-800/60 border border-indigo-700/60 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">
              Get Started
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Have a problem worth solving?
          </h2>

          {/* Supporting text */}
          <p className="mt-4 text-base text-indigo-300 leading-relaxed max-w-lg mx-auto">
            Tell Samadhan Setu what is happening. We&apos;ll help connect the challenge with
            universities and industry partners capable of solving it.
          </p>

          {/* CTA button */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              to="/report"
              className="bg-white text-indigo-950 hover:bg-indigo-50 border-transparent shadow-md"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              }
              iconPosition="right"
            >
              Report a Problem
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
