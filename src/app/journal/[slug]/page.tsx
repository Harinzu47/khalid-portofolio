import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { TaxonomyChip } from '@/components/public/TaxonomyChip';
import { ArrowLeft, Calendar, BookOpen, Shield } from 'lucide-react';

interface JournalPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JournalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journal = await PublicReadModelsService.getJournalBySlug(slug);

  if (!journal) {
    return {
      title: 'Journal Entry Not Found | HZCODE',
    };
  }

  return {
    title: `${journal.title} | HZCODE Engineering Journal`,
    description: journal.excerpt || `Engineering journal entry for ${journal.title}.`,
    alternates: {
      canonical: `/journal/${journal.slug}`,
    },
    robots: journal.isUnlisted ? { index: false, follow: false } : undefined,
    openGraph: {
      title: journal.title,
      description: journal.excerpt || undefined,
      type: 'article',
      publishedTime: journal.publishedAt || undefined,
    },
  };
}

export default async function JournalDetailPage({ params }: JournalPageProps) {
  const { slug } = await params;
  const journal = await PublicReadModelsService.getJournalBySlug(slug);

  if (!journal) {
    notFound();
  }

  const formattedDate = journal.journalDate
    ? new Date(journal.journalDate).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recorded';

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer size="md">
        <article className="space-y-10">
          {/* Breadcrumbs */}
          <div>
            <Link
              href="/system?type=JOURNAL_ENTRY"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-text-muted hover:text-terminal-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>&larr; BACK TO KNOWLEDGE HUB</span>
            </Link>

            {journal.isUnlisted && (
              <div className="mb-6 p-3 border border-terminal-warning/30 bg-terminal-warning/5 text-terminal-warning font-mono text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>
                  [ UNLISTED LOG ] Accessible via direct link only and excluded from public search.
                </span>
              </div>
            )}

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-terminal-text-muted mb-4">
              <span className="px-2 py-0.5 border border-terminal-border text-terminal-primary bg-terminal-primary/5 uppercase text-[10px]">
                DEVELOPMENT LOG
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-terminal-text-primary leading-tight">
              {journal.title}
            </h1>

            {/* Taxonomies */}
            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-terminal-border">
              {journal.domains.map((d) => (
                <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
              ))}
              {journal.technologies.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tech" />
              ))}
              {journal.skills.map((s) => (
                <TaxonomyChip key={s.slug} label={s.name} variant="skill" />
              ))}
              {journal.tags.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tag" />
              ))}
            </div>
          </div>

          {/* Content Body */}
          <div className="prose prose-invert max-w-none text-terminal-text-secondary leading-relaxed space-y-6 text-base md:text-lg whitespace-pre-wrap">
            {journal.content}
          </div>

          {/* Connected Knowledge (Amendment 34) */}
          {journal.relatedKnowledge.length > 0 && (
            <div className="border-t border-terminal-border pt-10 space-y-6">
              <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>RELATED KNOWLEDGE & PRODUCTION SYSTEMS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {journal.relatedKnowledge.map((k) => (
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
