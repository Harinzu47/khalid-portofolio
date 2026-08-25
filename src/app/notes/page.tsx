import type { Metadata } from 'next';
import Link from 'next/link';
import { NotesService } from '@/services/notes.service';
import { StickyNote, Code, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tech Notes & Code Snippets | Khalid',
  description:
    'Curated library of developer cheat sheets, shell commands, Docker configurations, and quick technical references.',
};

export const dynamic = 'force-dynamic';

type NoteItem = Awaited<ReturnType<typeof NotesService.getPublicNotes>>['data'][number];

export default async function NotesPage() {
  let notesList: NoteItem[] = [];
  try {
    const result = await NotesService.getPublicNotes({ page: 1, pageSize: 30 });
    notesList = result.data;
  } catch (err) {
    console.error('Failed to load public notes:', err);
  }

  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-terminal-accent font-mono text-xs">
            <StickyNote className="w-4 h-4" />
            <span>knowledge.snippets</span>
          </div>
          <h1 className="text-3xl font-bold font-mono text-terminal-text-primary tracking-tight">
            Technical Notes
          </h1>
          <p className="text-sm font-mono text-terminal-text-secondary leading-relaxed max-w-2xl">
            Quick reference commands, cheat sheets, configs, and architectural code snippets.
          </p>
        </div>

        {/* Notes Grid */}
        {notesList.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-terminal-border bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-2">
            <p>No public tech notes published yet.</p>
            <p className="text-[11px]">Check back soon for curated cheat sheets and snippets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesList.map((note) => (
              <article
                key={note.id}
                className="p-5 rounded-lg border border-terminal-border bg-terminal-surface hover:border-terminal-secondary/60 hover:bg-terminal-surface-alt/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-terminal-text-muted">
                    <span className="flex items-center space-x-1">
                      <Code className="w-3.5 h-3.5 text-terminal-accent" />
                      <span>snippet</span>
                    </span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link href={`/notes/${note.slug}`}>
                    <h2 className="text-sm font-bold font-mono text-terminal-text-primary group-hover:text-terminal-secondary transition-colors">
                      {note.title}
                    </h2>
                  </Link>

                  <div className="text-[11px] font-mono text-terminal-text-muted line-clamp-3 bg-terminal-bg p-2.5 rounded border border-terminal-border">
                    {note.content}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-terminal-border flex justify-end">
                  <Link
                    href={`/notes/${note.slug}`}
                    className="inline-flex items-center space-x-1 text-xs font-mono text-terminal-primary hover:underline"
                  >
                    <span>View snippet</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
