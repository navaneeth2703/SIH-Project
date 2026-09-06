export default function SectionHeader({
  title,
  description,
  badge = null,
  action = null,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center';

  return (
    <div
      className={`mb-6 flex flex-col gap-4 ${
        isCentered
          ? 'items-center text-center max-w-2xl mx-auto'
          : 'sm:flex-row sm:items-end sm:justify-between'
      } ${className}`}
    >
      <div className={isCentered ? 'space-y-2' : 'space-y-1.5'}>
        {badge && <div className="mb-2">{badge}</div>}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
