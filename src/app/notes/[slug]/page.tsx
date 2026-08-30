import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { TaxonomyChip } from '@/components/public/TaxonomyChip';
import { ArrowLeft, Clock, Calendar, Shield, BookOpen } from 'lucide-react';

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
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer size="md">
        <article className="space-y-12">
          {/* Breadcrumb Navigation */}
          <div>
            <Link
              href="/system?type=TECH_NOTE"
              className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors uppercase tracking-wider mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO KNOWLEDGE HUB</span>
            </Link>

            {note.isUnlisted && (
              <div className="mb-8 p-4 border border-border-subtle bg-surface-container text-text-primary font-mono text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-text-secondary" />
                <span>
                  [ UNLISTED TECH NOTE ] Accessible via direct link only and excluded from public search indexes.
                </span>
              </div>
            )}

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary mb-4">
              <span className="px-2.5 py-0.5 border border-border-subtle bg-surface-container text-text-primary font-semibold uppercase text-[10px]">
                TECH NOTE
              </span>
              {note.noteNumber && <span className="font-semibold text-text-primary">#{String(note.noteNumber).padStart(3, '0')}</span>}
              {note.verificationStatus && (
                <span className="uppercase text-[10px] px-2 py-0.5 border border-border-subtle bg-surface-container-high text-text-primary font-semibold">
                  STATUS: {note.verificationStatus}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>{formattedDate}</span>
              </span>
              {note.readingTimeMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-text-secondary" />
                  <span>{note.readingTimeMinutes} min read</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary uppercase leading-[1.08]">
              {note.title}
            </h1>

            {/* Taxonomies */}
            <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-border-subtle">
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

          {/* Note Excerpt */}
          {note.excerpt && (
            <div className="p-6 md:p-8 border-l-2 border-text-primary bg-surface-container text-text-primary text-base leading-relaxed">
              {note.excerpt}
            </div>
          )}

          {/* Note Code & Technical Content */}
          <div className="editorial-code-block p-6 md:p-8 text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
            {note.content}
          </div>

          {/* Connected Knowledge */}
          {note.relatedKnowledge.length > 0 && (
            <div className="border-t border-border-subtle pt-12 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>RELATED KNOWLEDGE &amp; ARCHITECTURAL DECISIONS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {note.relatedKnowledge.map((k) => (
                  <Link
                    key={k.slug}
                    href={k.href}
                    className="border border-border-subtle bg-surface-container/40 p-6 hover:border-text-primary transition-colors block space-y-2"
                  >
                    <span className="font-mono text-[10px] text-text-secondary uppercase block">
                      {k.entityType}
                    </span>
                    <h3 className="font-headline font-bold text-text-primary text-base hover:underline">
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
