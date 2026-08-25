import Link from 'next/link';
import { JournalService } from '@/services/journal.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { DeleteJournalButton } from './DeleteJournalButton';
import { Plus, Edit, ExternalLink, BookOpen, Lock, Globe, EyeOff } from 'lucide-react';

export default async function AdminJournalPage() {
  const result = await JournalService.getAdminJournalEntries({ page: 1, pageSize: 50 });
  const journalList = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-terminal-purple" />
            <span>Engineering Journal Logs</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Document daily technical investigations, command references, and architectural breakthroughs.
          </p>
        </div>

        <Link
          href="/admin/journal/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Journal Log</span>
        </Link>
      </div>

      {/* Journal Data Table */}
      {journalList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No journal entries found in the database.</p>
          <Link
            href="/admin/journal/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Write your first engineering log</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Technologies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journalList.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-xs text-terminal-text-muted whitespace-nowrap">
                  {entry.entryDate}
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary">
                      {entry.title}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted truncate max-w-xs">
                      {entry.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {entry.visibility === 'public' && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-terminal-primary">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </span>
                  )}
                  {entry.visibility === 'unlisted' && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-terminal-secondary">
                      <EyeOff className="w-3 h-3" />
                      <span>Unlisted</span>
                    </span>
                  )}
                  {entry.visibility === 'private' && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-terminal-accent">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {entry.tags.slice(0, 2).map((jt) => (
                      <span
                        key={jt.tag.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted"
                      >
                        #{jt.tag.name}
                      </span>
                    ))}
                    {entry.tags.length > 2 && (
                      <span className="text-[10px] text-terminal-text-muted">
                        +{entry.tags.length - 2}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {entry.technologies.slice(0, 2).map((jtech) => (
                      <span
                        key={jtech.technology.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted"
                      >
                        {jtech.technology.name}
                      </span>
                    ))}
                    {entry.technologies.length > 2 && (
                      <span className="text-[10px] text-terminal-text-muted">
                        +{entry.technologies.length - 2}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {entry.visibility !== 'private' && entry.publishedAt && (
                      <Link
                        href={`/journal/${entry.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
                        title="View Public Log"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/journal/${entry.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Log"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteJournalButton
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
