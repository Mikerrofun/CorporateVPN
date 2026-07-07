interface FormCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'indigo';
  children: React.ReactNode;
}

export function FormCard({ 
  title, 
  subtitle, 
  badge, 
  badgeColor = 'blue',
  children 
}: FormCardProps) {
  const badgeColorClass = badgeColor === 'blue' ? 'text-blue-400' : 'text-indigo-400';
  
  return (
    <div className="card w-full max-w-md border border-white/[0.06] bg-panel/40 backdrop-blur-2xl p-8 shadow-2xl">
      <div className="mb-6 text-center">
        {badge && (
          <p className={`text-xs font-bold uppercase tracking-[0.3em] ${badgeColorClass}`}>
            {badge}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
