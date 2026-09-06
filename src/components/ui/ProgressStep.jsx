const LIFECYCLE_STEPS = [
  'Proposal',
  'Pilot',
  'Field Testing',
  'Scale',
  'Adopted',
  'Impact',
];

export default function ProgressStep({
  currentStatus = 'Proposal',
  steps = LIFECYCLE_STEPS,
  className = '',
}) {
  const currentIndex = typeof currentStatus === 'number'
    ? currentStatus
    : Math.max(0, steps.indexOf(currentStatus));

  return (
    <div className={`w-full overflow-x-auto py-2 ${className}`}>
      <ol className="flex items-center min-w-[600px] sm:min-w-full justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <li
              key={step}
              className={`relative flex flex-1 flex-col items-center text-center ${
                idx !== steps.length - 1 ? 'after:content-[""] after:w-full after:h-0.5 after:top-3.5 after:left-1/2 after:absolute after:-z-10 ' : ''
              } ${
                idx !== steps.length - 1
                  ? isCompleted
                    ? 'after:bg-emerald-500'
                    : 'after:bg-slate-200'
                  : ''
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-indigo-900 text-white ring-4 ring-indigo-100 shadow-xs'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent
                    ? 'text-indigo-950 font-semibold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
