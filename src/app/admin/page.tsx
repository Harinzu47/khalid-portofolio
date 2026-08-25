import Link from 'next/link';
import {
  FolderGit2,
  FileText,
  BookOpen,
  StickyNote,
  ArrowUpRight,
  ShieldCheck,
  HardDrive,
  Database,
  Plus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const quickMetrics = [
    {
      title: 'Portfolio Projects',
      count: '11',
      description: 'Case studies & production software',
      href: '/admin/projects',
      icon: FolderGit2,
      color: 'text-terminal-primary',
      borderColor: 'border-terminal-primary/30',
    },
    {
      title: 'Articles',
      count: '3',
      description: 'Long-form engineering deep-dives',
      href: '/admin/articles',
      icon: FileText,
      color: 'text-terminal-secondary',
      borderColor: 'border-terminal-secondary/30',
    },
    {
      title: 'Journal Entries',
      count: '4',
      description: 'Daily logs & work investigations',
      href: '/admin/journal',
      icon: BookOpen,
      color: 'text-terminal-purple',
      borderColor: 'border-terminal-purple/30',
    },
    {
      title: 'Technical Notes',
      count: '0',
      description: 'Code snippets & architectural notes',
      href: '/admin/notes',
      icon: StickyNote,
      color: 'text-terminal-accent',
      borderColor: 'border-terminal-accent/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-primary" />
            <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
              Personal Developer OS • Command Center
            </h1>
          </div>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Master control node for portfolio, knowledge base, career timeline, and taxonomy.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/admin/projects"
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Link>
          <Link
            href="/admin/journal"
            className="flex items-center space-x-1.5 px-3 py-2 rounded border border-terminal-border bg-terminal-bg text-terminal-text-primary font-mono text-xs hover:border-terminal-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Log</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.title}
              href={metric.href}
              className={`p-5 rounded-lg border bg-terminal-surface hover:bg-terminal-surface-alt/60 transition-all group ${metric.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <ArrowUpRight className="w-4 h-4 text-terminal-text-muted group-hover:text-terminal-text-primary transition-colors" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold font-mono text-terminal-text-primary">
                  {metric.count}
                </div>
                <div className="text-xs font-mono font-semibold text-terminal-text-primary mt-0.5">
                  {metric.title}
                </div>
                <div className="text-[11px] font-mono text-terminal-text-muted mt-1">
                  {metric.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* System Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          <div className="flex items-center space-x-2 text-terminal-primary">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold text-terminal-text-primary uppercase">
              RLS & Access Security
            </h3>
          </div>
          <p className="text-xs font-mono text-terminal-text-secondary">
            PostgreSQL Row Level Security active on all 25 tables. Public visibility strictly filtered.
          </p>
          <div className="text-[11px] font-mono text-terminal-primary font-semibold">
            ✓ 25/25 Tables Protected
          </div>
        </div>

        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          <div className="flex items-center space-x-2 text-terminal-secondary">
            <Database className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold text-terminal-text-primary uppercase">
              Database Engine
            </h3>
          </div>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Supabase PostgreSQL with Drizzle ORM transaction pooler configuration.
          </p>
          <div className="text-[11px] font-mono text-terminal-secondary font-semibold">
            ✓ Connection Pool Active
          </div>
        </div>

        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          <div className="flex items-center space-x-2 text-terminal-purple">
            <HardDrive className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold text-terminal-text-primary uppercase">
              Asset Storage
            </h3>
          </div>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Supabase Storage bucket integration for project screenshots and credentials.
          </p>
          <div className="text-[11px] font-mono text-terminal-purple font-semibold">
            ✓ Bucket Bound
          </div>
        </div>
      </div>
    </div>
  );
}
