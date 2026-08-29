import { requireAuth } from '@/lib/auth';
import { OperationsDiagnosticsService, type DiagnosticStatus } from '@/services/operations-diagnostics.service';
import { Activity, Database, Search, Send, Image, FileCode2, ShieldCheck, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status: DiagnosticStatus }) {
  switch (status) {
    case 'HEALTHY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          HEALTHY
        </span>
      );
    case 'DEGRADED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          DEGRADED
        </span>
      );
    case 'UNHEALTHY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950/60 border border-rose-500/40 text-rose-400">
          <XCircle className="w-3.5 h-3.5" />
          UNHEALTHY
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-400">
          <HelpCircle className="w-3.5 h-3.5" />
          UNKNOWN
        </span>
      );
  }
}

export default async function OwnerSystemHealthPage() {
  const session = await requireAuth('/admin/system/health');
  const report = await OperationsDiagnosticsService.runDiagnostics(session.userId);

  const categoryCards = [
    {
      id: 'DATABASE',
      title: 'PostgreSQL Database Engine',
      icon: Database,
      data: report.categories.database,
    },
    {
      id: 'SEARCH',
      title: 'Search Projections & Index',
      icon: Search,
      data: report.categories.search,
    },
    {
      id: 'PUBLISHING',
      title: 'Publishing & Scheduled Workflows',
      icon: Send,
      data: report.categories.publishing,
    },
    {
      id: 'MEDIA',
      title: 'Media Assets & Storage Integrity',
      icon: Image,
      data: report.categories.media,
    },
    {
      id: 'MIGRATIONS_SCHEMA',
      title: 'Drizzle Migrations & Schema Journal',
      icon: FileCode2,
      data: report.categories.migrationsSchema,
    },
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-terminal-border">
        <div>
          <h1 className="text-lg font-bold text-terminal-text-primary flex items-center space-x-2">
            <Activity className="w-5 h-5 text-terminal-primary" />
            <span>Owner System Operations Diagnostics</span>
          </h1>
          <p className="text-xs text-terminal-text-secondary mt-1">
            Real-time live system health across database, search, publishing, media, and migrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-terminal-text-muted">OVERALL STATUS:</span>
          <StatusBadge status={report.overallStatus} />
        </div>
      </div>

      {/* Timestamp Notice */}
      <div className="text-xs text-terminal-text-muted">
        Diagnostic run checked at: <span className="text-terminal-text-secondary">{report.checkedAt}</span>
      </div>

      {/* Diagnostics Grid */}
      <div className="space-y-4">
        {categoryCards.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-terminal-primary" />
                  <span className="text-sm font-bold text-terminal-text-primary">
                    {cat.title}
                  </span>
                  <span className="text-xs text-terminal-text-muted font-mono">
                    [{cat.data.code}]
                  </span>
                </div>
                <StatusBadge status={cat.data.status} />
              </div>

              <p className="text-xs text-terminal-text-secondary">
                {cat.data.safeMessage}
              </p>

              {cat.data.optionalSafeDetails && (
                <div className="mt-3 pt-3 border-t border-terminal-border/60">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(cat.data.optionalSafeDetails).map(([key, val]) => (
                      <div key={key} className="p-2 rounded bg-terminal-bg border border-terminal-border/40">
                        <span className="text-terminal-text-muted block text-[10px] uppercase truncate">
                          {key}
                        </span>
                        <span className="text-terminal-text-primary font-semibold">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'none')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
