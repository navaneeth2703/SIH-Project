import { Link } from 'react-router-dom';

export default function PageHeader({
  title,
  description,
  badge = null,
  breadcrumbs = [],
  actions = null,
  className = '',
}) {
  return (
    <div className={`mb-8 border-b border-slate-200 pb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={item.label || index} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-300">/</span>}
                {item.href && !isLast ? (
                  <Link to={item.href} className="hover:text-slate-800 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-medium text-slate-700' : ''}>{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-sm sm:text-base text-slate-500 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
