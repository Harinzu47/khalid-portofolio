import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { TaxonomyChip } from '@/components/public/TaxonomyChip';
import { ArrowLeft, Clock, Calendar, Shield, CheckCircle2, BookOpen } from 'lucide-react';

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await PublicReadModelsService.getNoteBySlug(slug);

  if (!note) {
    return {
      title: 'Tech Note Not Found | HZCODE',
    };
  }

  return {
    title: `${note.title} | HZCODE Tech Note`,
    description: note.excerpt || `Technical note and operational pattern for ${note.title}.`,
    alternates: {
      canonical: `/notes/${note.slug}`,
    },
    robots: note.isUnlisted ? { index: false, follow: false } : undefined,
    openGraph: {
      title: note.title,
      description: note.excerpt || undefined,
      type: 'article',
      publishedTime: note.publishedAt || undefined,
    },
  };
}

export default async function NoteDetailPage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = await PublicReadModelsService.getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const formattedDate = note.publishedAt
    ? new Date(note.publishedAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Published';

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer size="md">
        <article className="space-y-10">
          {/* Breadcrumbs */}
          <div>
            <Link
              href="/system?type=TECH_NOTE"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-text-muted hover:text-terminal-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>&larr; BACK TO KNOWLEDGE HUB</span>
            </Link>

            {note.isUnlisted && (
              <div className="mb-6 p-3 border border-terminal-warning/30 bg-terminal-warning/5 text-terminal-warning font-mono text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>
                  [ UNLISTED TECH NOTE ] Accessible via direct link only and excluded from public search.
                </span>
              </div>
            )}

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-terminal-text-muted mb-4">
              <span className="px-2 py-0.5 border border-terminal-border text-terminal-secondary bg-terminal-secondary/5 uppercase text-[10px]">
                TECH NOTE
              </span>
              {note.noteNumber && <span>#{String(note.noteNumber).padStart(3, '0')}</span>}
              {note.verificationStatus && (
                <span className="flex items-center gap-1 text-terminal-primary">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="uppercase">{note.verificationStatus}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </span>
              {note.readingTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{note.readingTimeMinutes} min read</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-terminal-text-primary leading-tight">
              {note.title}
            </h1>

            {/* Taxonomies */}
            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-terminal-border">
              {note.domains.map((d) => (
                <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
              ))}
              {note.technologies.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tech" />
              ))}
              {note.skills.map((s) => (
                <TaxonomyChip key={s.slug} label={s.name} variant="skill" />
              ))}
              {note.tags.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tag" />
              ))}
            </div>
          </div>

          {/* Note Summary */}
          {note.excerpt && (
            <div className="p-5 border-l-2 border-terminal-secondary bg-terminal-surface/40 text-terminal-text-secondary text-base leading-relaxed">
              {note.excerpt}
            </div>
          )}

          {/* Note Code & Content */}
          <div className="bg-surface-code border border-terminal-border p-6 md:p-8 font-mono text-xs md:text-sm text-terminal-text-primary whitespace-pre-wrap leading-relaxed">
            {note.content}
          </div>

          {/* Connected Knowledge (Amendment 34) */}
          {note.relatedKnowledge.length > 0 && (
            <div className="border-t border-terminal-border pt-10 space-y-6">
              <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>RELATED KNOWLEDGE & ARCHITECTURAL DECISIONS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {note.relatedKnowledge.map((k) => (
                  <Link
                    key={k.slug}
                    href={k.href}
                    className="border border-terminal-border bg-terminal-surface/30 p-5 hover:border-terminal-primary transition-colors block"
                  >
                    <span className="font-mono text-[10px] text-terminal-primary uppercase block mb-1">
                      {k.entityType}
                    </span>
                    <h3 className="font-semibold text-terminal-text-primary text-sm hover:underline">
                      {k.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </PublicContainer>
    </main>
  );
}
