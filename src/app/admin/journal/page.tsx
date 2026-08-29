import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { JournalService } from '@/services/journal.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ArchiveJournalButton } from './ArchiveJournalButton';
import { QuickCaptureWidget } from './QuickCaptureWidget';
import { Plus, Edit, ExternalLink, BookOpen, Calendar } from 'lucide-react';

export default async function AdminJournalPage() {
  const session = await requireOwnerSession();
  const result = await JournalService.getAdminJournalEntries(session.userId, { page: 1, pageSize: 50 });
  const entries = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-terminal-secondary" />
            <span>Engineering Journal Logs</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Continuous engineering logs, architecture decisions, and daily work reflections.
          </p>
        </div>

        <Link
          href="/admin/journal/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Structured Entry</span>
        </Link>
      </div>

      {/* Quick Capture Widget */}
      <QuickCaptureWidget />

      {/* Journal Table */}
      {entries.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No journal entries logged yet.</p>
          <Link
            href="/admin/journal/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Log your first engineering milestone</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date / Title</TableHead>
              <TableHead>Publication</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-terminal-text-primary">
                        {entry.title}
                      </span>
                      {entry.isFeatured && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-terminal-secondary/15 text-terminal-secondary border border-terminal-secondary/30">
                          featured
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted flex items-center space-x-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{entry.entryDate}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-xs">{entry.slug}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      entry.publicationStatus === 'published'
                        ? 'primary'
                        : entry.publicationStatus === 'review'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {entry.publicationStatus}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-[11px] text-terminal-text-muted font-mono uppercase">
                    {entry.visibility}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(entry.tags || []).slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted"
                      >
                        #{t.name}
                      </span>
                    ))}
                    {(entry.tags || []).length > 3 && (
                      <span className="text-[10px] text-terminal-text-muted">
                        +{(entry.tags || []).length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {entry.publishedAt && (
                      <Link
                        href={`/journal/${entry.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
                        title="View Public Entry"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/journal/${entry.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Entry"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <ArchiveJournalButton
                      journalId={entry.id}
                      journalTitle={entry.title}
                    />
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
