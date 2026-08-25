import Link from 'next/link';
import { NotesService } from '@/services/notes.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { DeleteNoteButton } from './DeleteNoteButton';
import { Plus, Edit, ExternalLink, StickyNote } from 'lucide-react';

export default async function AdminNotesPage() {
  const result = await NotesService.getAdminNotes({ page: 1, pageSize: 50 });
  const notesList = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <StickyNote className="w-5 h-5 text-terminal-accent" />
            <span>Tech Notes & Snippets</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Quick reference commands, config templates, and engineering bookmarks.
          </p>
        </div>

        <Link
          href="/admin/notes/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </Link>
      </div>

      {/* Notes Data Table */}
      {notesList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No technical notes found in the database.</p>
          <Link
            href="/admin/notes/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Add your first code snippet or command cheat sheet</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notesList.map((note) => (
              <TableRow key={note.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary">
                      {note.title}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted truncate max-w-xs">
                      {note.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      note.status === 'published'
                        ? 'primary'
                        : note.status === 'review'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {note.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-terminal-text-muted text-[11px] whitespace-nowrap">
                  {note.createdAt.toLocaleDateString()}
                </TableCell>

                <TableCell className="text-terminal-text-muted text-[11px] whitespace-nowrap">
                  {note.updatedAt.toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {note.status === 'published' && (
                      <Link
                        href={`/notes/${note.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
                        title="View Public Note"
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
                    <DeleteNoteButton
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
