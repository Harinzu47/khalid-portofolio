import { Activity, Database, ShieldCheck, Code2 } from 'lucide-react';

interface SystemMetricsProps {
  counts?: {
    projectsCount: number;
    articlesCount: number;
    journalCount: number;
    skillsCount: number;
  };
}

export function SystemMetrics({ counts }: SystemMetricsProps) {
  const metrics = [
    {
      label: 'SYSTEM STATUS',
      value: 'OPERATIONAL',
      sub: 'All telemetry nominal',
      icon: Activity,
      color: 'text-terminal-primary',
    },
    {
      label: 'DATABASE ENGINE',
      value: 'POSTGRESQL 16',
      sub: '25 Domain tables active',
      icon: Database,
      color: 'text-terminal-secondary',
    },
    {
      label: 'RLS SECURITY POLICY',
      value: 'ENFORCED',
      sub: 'Multi-layer authorization',
      icon: ShieldCheck,
      color: 'text-terminal-purple',
    },
    {
      label: 'PORTFOLIO ARTIFACTS',
      value: `${(counts?.projectsCount || 0) + (counts?.articlesCount || 0) + (counts?.journalCount || 0)} NODES`,
      sub: `${counts?.projectsCount || 0} projects, ${counts?.articlesCount || 0} articles`,
      icon: Code2,
      color: 'text-terminal-warning',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg border border-terminal-border bg-terminal-surface/90 hover:border-terminal-primary/40 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-wider text-terminal-text-muted">
                  {m.label}
                </span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className={`text-base font-bold font-mono ${m.color}`}>
                {m.value}
              </div>
              <div className="text-[11px] font-mono text-terminal-text-muted">
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
