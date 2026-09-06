const statusConfig = {
  Proposal: {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Proposal',
  },
  Pilot: {
    container: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'Pilot',
  },
  'Field Testing': {
    container: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Field Testing',
  },
  Scale: {
    container: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    label: 'Scale',
  },
  Adopted: {
    container: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    label: 'Adopted',
  },
  Impact: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    dot: 'bg-emerald-600',
    label: 'Impact',
  },
};

export default function StatusBadge({
  status = 'Proposal',
  size = 'sm',
  className = '',
}) {
  const config = statusConfig[status] || {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status,
  };

  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.container} ${sizeClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
