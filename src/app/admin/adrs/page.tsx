import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { ADRService } from '@/services/adrs.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ArchiveADRButton } from './ArchiveADRButton';
import { Plus, Edit, Scale, ExternalLink } from 'lucide-react';

export default async function AdminADRsPage() {
  const session = await requireOwnerSession();
  const result = await ADRService.getAdminADRs(session.userId, { page: 1, pageSize: 50 });
  const adrsList = result.data;

  return (
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-terminal-text-primary flex items-center space-x-2">
            <Scale className="w-5 h-5 text-terminal-secondary" />
            <span>Architectural Decision Records (ADRs)</span>
          </h1>
          <p className="text-xs text-terminal-text-secondary">
            System architectural choices, trade-offs, consequences, and supersession chains.
          </p>
        </div>

        <Link
          href="/admin/adrs/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New ADR</span>
        </Link>
      </div>

      {/* ADR Table */}
      {adrsList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface text-xs text-terminal-text-muted space-y-3">
          <p>No architectural decision records logged.</p>
          <Link
            href="/admin/adrs/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Document your first architectural decision</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ADR # / Title</TableHead>
              <TableHead>Domain Status</TableHead>
              <TableHead>Publication</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adrsList.map((adr) => (
              <TableRow key={adr.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary flex items-center space-x-2">
                      <span className="text-terminal-secondary font-bold">
                        ADR-{String(adr.number || 0).padStart(3, '0')}:
                      </span>
                      <span>{adr.title}</span>
                    </div>
                    <div className="text-[11px] text-terminal-text-muted truncate max-w-xs">
                      {adr.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded border capitalize ${
                      adr.status === 'accepted'
                        ? 'bg-terminal-primary/10 text-terminal-primary border-terminal-primary/30'
                        : adr.status === 'superseded'
                        ? 'bg-terminal-accent/10 text-terminal-accent border-terminal-accent/30'
                        : adr.status === 'proposed'
                        ? 'bg-terminal-secondary/10 text-terminal-secondary border-terminal-secondary/30'
                        : 'bg-terminal-surface text-terminal-text-muted border-terminal-border'
                    }`}
                  >
                    {adr.status || 'proposed'}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      adr.publicationStatus === 'published'
                        ? 'primary'
                        : adr.publicationStatus === 'review'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {adr.publicationStatus}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-[11px] text-terminal-text-muted uppercase">
                    {adr.visibility}
                  </span>
                </TableCell>

                <TableCell className="text-terminal-text-muted text-[11px]">
                  {new Date(adr.updatedAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {adr.publishedAt && (
                      <Link
                        href={`/adrs/${adr.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
                        title="View Public ADR"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/adrs/${adr.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit ADR"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <ArchiveADRButton adrId={adr.id} adrTitle={adr.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
