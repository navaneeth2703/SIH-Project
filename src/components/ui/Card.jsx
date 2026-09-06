const variantClasses = {
  standard: 'bg-white border border-slate-200/80 shadow-xs',
  elevated: 'bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow',
  glass: 'glass-panel border border-slate-200/70 shadow-xs',
  subtle: 'bg-slate-50/70 border border-slate-200/60',
};

export default function Card({
  children,
  variant = 'standard',
  className = '',
  ...props
}) {
  const chosenVariant = variantClasses[variant] || variantClasses.standard;

  return (
    <div
      className={`rounded-xl ${chosenVariant} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component
      className={`text-lg font-semibold tracking-tight text-slate-900 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`mt-1 text-sm text-slate-500 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`p-6 pt-0 border-t border-slate-100 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
