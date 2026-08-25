import { AnalyticsService } from '@/services/analytics.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { AuditLogDetailModal } from './AuditLogDetailModal';
import { ExportAuditButton } from './ExportAuditButton';
import { ShieldCheck, History } from 'lucide-react';

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; action?: string; entityType?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;

  const result = await AnalyticsService.getAuditLogs({
    page,
    pageSize: 30,
    action: params?.action,
    entityType: params?.entityType,
  });

  const logs = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-terminal-primary" />
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Continuous operational security log recording all entity creations, updates, state changes, and deletions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <ExportAuditButton />
        </div>
      </div>

      {/* Audit Log Table */}
      {logs.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-2">
          <History className="w-8 h-8 mx-auto text-terminal-text-muted" />
          <p>No audit events recorded yet.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Target ID</TableHead>
              <TableHead className="text-right">Payload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const isDelete = log.action.includes('DELETE');
              const isCreate = log.action.includes('CREATE') || log.action.includes('UPLOAD');

              return (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-mono text-xs text-terminal-text-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={isDelete ? 'warning' : isCreate ? 'primary' : 'secondary'}>
                      {log.action}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-terminal-text-primary uppercase">
                      {log.entityType}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-[11px] text-terminal-text-muted truncate max-w-xs block">
                      {log.entityId}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <AuditLogDetailModal log={log} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
