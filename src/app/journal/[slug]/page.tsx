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
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer size="md">
        <article className="space-y-12">
          {/* Breadcrumb Navigation */}
          <div>
            <Link
              href="/system?type=JOURNAL_ENTRY"
              className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors uppercase tracking-wider mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO KNOWLEDGE HUB</span>
            </Link>

            {journal.isUnlisted && (
              <div className="mb-8 p-4 border border-border-subtle bg-surface-container text-text-primary font-mono text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-text-secondary" />
                <span>
                  [ UNLISTED LOG ] Accessible via direct link only and excluded from public search indexes.
                </span>
              </div>
            )}

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary mb-4">
              <span className="px-2.5 py-0.5 border border-border-subtle bg-surface-container text-text-primary font-semibold uppercase text-[10px]">
                DEV JOURNAL / BUILD LOG
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary uppercase leading-[1.08]">
              {journal.title}
            </h1>

            {/* Taxonomies */}
            <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-border-subtle">
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
          <div className="prose-editorial max-w-none text-text-primary leading-relaxed space-y-6 text-base md:text-lg whitespace-pre-wrap">
            {journal.content}
          </div>

          {/* Connected Knowledge */}
          {journal.relatedKnowledge.length > 0 && (
            <div className="border-t border-border-subtle pt-12 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>RELATED KNOWLEDGE &amp; PRODUCTION SYSTEMS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {journal.relatedKnowledge.map((k) => (
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
