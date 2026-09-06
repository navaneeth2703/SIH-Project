import { Link } from 'react-router-dom';

const variantClasses = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-xs border border-transparent focus-visible:ring-indigo-500',
  secondary:
    'bg-white text-slate-800 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs border border-transparent focus-visible:ring-rose-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base font-medium rounded-lg gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = null,
  iconPosition = 'left',
  to = null,
  disabled = false,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {content}
    </button>
  );
}
