import Card from './Card';

export default function StatCard({
  label,
  value,
  description = null,
  change = null,
  changeType = 'positive',
  icon = null,
  variant = 'standard',
  className = '',
}) {
  const changeStyles = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    negative: 'text-rose-700 bg-rose-50 border-rose-200/80',
    neutral: 'text-slate-700 bg-slate-100 border-slate-200',
  };

  return (
    <Card variant={variant} className={`p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100/80">
            {icon}
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {change && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                changeStyles[changeType] || changeStyles.positive
              }`}
            >
              {change}
            </span>
          )}
          {description && (
            <span className="truncate text-slate-400 ml-auto">{description}</span>
          )}
        </div>
      )}
    </Card>
  );
}
