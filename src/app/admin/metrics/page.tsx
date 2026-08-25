import { AnalyticsService } from '@/services/analytics.service';
import { Activity, Database, Server, HardDrive, ShieldAlert, BarChart3, Layers } from 'lucide-react';

export default async function AdminMetricsPage() {
  const metrics = await AnalyticsService.getSystemMetrics();

  const entityCounters = [
    { label: 'Production Projects', count: metrics.entities.projects, color: 'text-terminal-secondary' },
    { label: 'Technical Articles', count: metrics.entities.articles, color: 'text-terminal-primary' },
    { label: 'Engineering Journal', count: metrics.entities.journalEntries, color: 'text-terminal-purple' },
    { label: 'Technical Notes', count: metrics.entities.notes, color: 'text-terminal-accent' },
    { label: 'Career History', count: metrics.entities.career, color: 'text-terminal-text-primary' },
    { label: 'Skills & Competencies', count: metrics.entities.skills, color: 'text-terminal-secondary' },
    { label: 'Technologies & Stacks', count: metrics.entities.technologies, color: 'text-terminal-primary' },
    { label: 'Certificates & Badges', count: metrics.entities.certificates, color: 'text-terminal-warning' },
    { label: 'Media Library Assets', count: metrics.entities.media, color: 'text-terminal-purple' },
    { label: 'Roadmap Milestones', count: metrics.entities.roadmapItems, color: 'text-terminal-secondary' },
    { label: 'Learning Objectives', count: metrics.entities.learningGoals, color: 'text-terminal-primary' },
    { label: 'Audit Security Events', count: metrics.entities.totalAuditEvents, color: 'text-terminal-warning' },
  ];

  const totalEntities =
    metrics.entities.projects +
    metrics.entities.articles +
    metrics.entities.journalEntries +
    metrics.entities.notes +
    metrics.entities.skills +
    metrics.entities.technologies +
    metrics.entities.certificates +
    metrics.entities.media;

  return (
    <div className="space-y-8 font-mono">
      {/* Header Bar */}
      <div>
        <h1 className="text-lg font-bold text-terminal-text-primary flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-terminal-primary" />
          <span>Operational Intelligence & Telemetry</span>
        </h1>
        <p className="text-xs text-terminal-text-secondary">
          Live engine health, resource telemetry, and distributed database entity metrics.
        </p>
      </div>

      {/* System Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-terminal-border bg-terminal-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-terminal-text-muted">
            <span>SYSTEM HEALTH</span>
            <Activity className="w-4 h-4 text-terminal-primary" />
          </div>
          <div className="text-lg font-bold text-terminal-primary">
            {metrics.telemetry.status}
          </div>
          <div className="text-[11px] text-terminal-text-muted">
            All telemetry channels nominal
          </div>
        </div>

        <div className="p-4 rounded-lg border border-terminal-border bg-terminal-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-terminal-text-muted">
            <span>UPTIME DURATION</span>
            <Server className="w-4 h-4 text-terminal-secondary" />
          </div>
          <div className="text-lg font-bold text-terminal-text-primary">
            {Math.floor(metrics.telemetry.uptimeSeconds / 60)}m {metrics.telemetry.uptimeSeconds % 60}s
          </div>
          <div className="text-[11px] text-terminal-text-muted">
            Process active & healthy
          </div>
        </div>

        <div className="p-4 rounded-lg border border-terminal-border bg-terminal-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-terminal-text-muted">
            <span>MEMORY HEAP</span>
            <HardDrive className="w-4 h-4 text-terminal-purple" />
          </div>
          <div className="text-lg font-bold text-terminal-text-primary">
            {metrics.telemetry.memoryUsageMB} MB
          </div>
          <div className="text-[11px] text-terminal-text-muted">
            Node.js {metrics.telemetry.nodeVersion} runtime
          </div>
        </div>

        <div className="p-4 rounded-lg border border-terminal-border bg-terminal-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-terminal-text-muted">
            <span>TOTAL ARTIFACTS</span>
            <Layers className="w-4 h-4 text-terminal-warning" />
          </div>
          <div className="text-lg font-bold text-terminal-warning">
            {totalEntities}
          </div>
          <div className="text-[11px] text-terminal-text-muted">
            Across 25 database tables
          </div>
        </div>
      </div>

      {/* Database Entity Distribution Matrix */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider flex items-center space-x-2">
          <Database className="w-4 h-4 text-terminal-primary" />
          <span>PostgreSQL 16 Entity Distribution</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {entityCounters.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-terminal-border bg-terminal-surface flex items-center justify-between"
            >
              <span className="text-xs text-terminal-text-secondary truncate mr-2">
                {item.label}
              </span>
              <span className={`text-base font-bold ${item.color}`}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Action Distribution */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-terminal-secondary" />
          <span>Recent Mutation Activity Profile</span>
        </h2>

        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          {Object.keys(metrics.actionDistribution).length === 0 ? (
            <p className="text-xs text-terminal-text-muted">No recent mutations recorded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(metrics.actionDistribution).map(([action, count]) => (
                <div
                  key={action}
                  className="flex items-center justify-between p-2.5 rounded bg-terminal-bg border border-terminal-border text-xs"
                >
                  <span className="text-terminal-text-primary font-semibold truncate mr-2">
                    {action}
                  </span>
                  <span className="text-terminal-primary font-bold px-2 py-0.5 rounded bg-terminal-surface border border-terminal-border">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
