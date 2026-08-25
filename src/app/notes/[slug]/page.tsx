import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NotesService } from '@/services/notes.service';
import { ArrowLeft, Calendar, Code } from 'lucide-react';

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const note = await NotesService.getPublicNoteBySlug(slug);
    return {
      title: `${note.title} — Tech Note | Khalid`,
      description: `Technical snippet and reference note for ${note.title}.`,
    };
  } catch {
    return {
      title: 'Note Not Found | Khalid',
    };
  }
}

export default async function NoteDetailPage({ params }: NotePageProps) {
  const { slug } = await params;

  let note;
  try {
    note = await NotesService.getPublicNoteBySlug(slug);
  } catch {
    notFound();
  }

  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/notes"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notes</span>
          </Link>
          <span className="text-xs font-mono text-terminal-text-muted">
            khalid.dev/notes/{note.slug}
          </span>
        </div>

        {/* Note Header */}
        <header className="space-y-3 pb-6 border-b border-terminal-border">
          <div className="flex items-center space-x-3 text-xs font-mono text-terminal-text-muted">
            <span className="flex items-center space-x-1.5 text-terminal-accent">
              <Code className="w-3.5 h-3.5" />
              <span>Technical Snippet</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-terminal-text-primary tracking-tight">
            {note.title}
          </h1>
        </header>

        {/* Code / Markdown Content Box */}
        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border text-xs font-mono text-terminal-text-muted">
            <span>source.snippet</span>
          </div>
          <pre className="font-mono text-xs sm:text-sm text-terminal-text-primary leading-relaxed whitespace-pre-wrap overflow-x-auto">
            {note.content}
          </pre>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-terminal-border flex items-center justify-between text-xs font-mono text-terminal-text-muted">
          <Link
            href="/notes"
            className="inline-flex items-center space-x-1.5 text-terminal-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tech Notes</span>
          </Link>
          <span>Personal Developer OS • Knowledge Base</span>
        </footer>
      </article>
    </main>
  );
}
