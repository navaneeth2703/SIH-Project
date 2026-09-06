const variantStyles = {
  success: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  warning: {
    container: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  critical: {
    container: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
  AI: {
    container: 'bg-violet-50 text-violet-700 border-violet-200/80',
    dot: 'bg-violet-500',
  },
  neutral: {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  showDot = false,
  className = '',
  ...props
}) {
  const style = variantStyles[variant] || variantStyles.neutral;
  const sizeClass = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${style.container} ${sizeClass} ${className}`}
      {...props}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
