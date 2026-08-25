import { NotesService } from '@/services/notes.service';
import { NoteForm } from '../../NoteForm';
import { notFound } from 'next/navigation';

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let note;
  try {
    note = await NotesService.getAdminNoteById(id);
  } catch {
    notFound();
  }

  const initialData = {
    title: note.title,
    slug: note.slug,
    content: note.content,
    status: note.status as 'draft' | 'review' | 'published' | 'archived',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Tech Note
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update snippet content and publication status.
        </p>
      </div>

      <NoteForm mode="edit" noteId={id} initialData={initialData} />
    </div>
  );
}
