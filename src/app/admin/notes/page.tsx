import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { TechNoteService } from '@/services/notes.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ArchiveNoteButton } from './ArchiveNoteButton';
import { Plus, Edit, ExternalLink, StickyNote, ShieldCheck } from 'lucide-react';

export default async function AdminNotesPage() {
  const session = await requireOwnerSession();
  const result = await TechNoteService.getAdminTechNotes(session.userId, { page: 1, pageSize: 50 });
  const notesList = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <StickyNote className="w-5 h-5 text-terminal-secondary" />
            <span>Tech Notes & References</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Verified engineering recipes, implementation notes, and technical cheat-sheets.
          </p>
        </div>

        <Link
          href="/admin/notes/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Tech Note</span>
        </Link>
      </div>

      {/* Notes Table */}
      {notesList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No tech notes recorded in the system.</p>
          <Link
            href="/admin/notes/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Create your first technical reference</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Publication</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notesList.map((note) => (
              <TableRow key={note.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary flex items-center space-x-2">
                      <span>{note.title}</span>
                      {note.isFeatured && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-terminal-secondary/15 text-terminal-secondary border border-terminal-secondary/30">
                          featured
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted truncate max-w-xs">
                      {note.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
                      note.verificationStatus === 'verified'
                        ? 'bg-terminal-primary/10 text-terminal-primary border-terminal-primary/30'
                        : note.verificationStatus === 'outdated'
                        ? 'bg-terminal-accent/10 text-terminal-accent border-terminal-accent/30'
                        : 'bg-terminal-surface text-terminal-text-muted border-terminal-border'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span className="capitalize">{note.verificationStatus || 'unverified'}</span>
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      note.publicationStatus === 'published'
                        ? 'primary'
                        : note.publicationStatus === 'review'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {note.publicationStatus}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-[11px] text-terminal-text-muted font-mono capitalize">
                    {note.difficulty || 'standard'}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(note.tags || []).slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted"
                      >
                        #{t.name}
                      </span>
                    ))}
                    {(note.tags || []).length > 3 && (
                      <span className="text-[10px] text-terminal-text-muted">
                        +{(note.tags || []).length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {note.publishedAt && (
                      <Link
                        href={`/notes/${note.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
                        title="View Public Tech Note"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/notes/${note.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Note"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <ArchiveNoteButton
                      noteId={note.id}
                      noteTitle={note.title}
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
