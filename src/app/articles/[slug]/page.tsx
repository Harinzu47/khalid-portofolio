import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { TaxonomyChip } from '@/components/public/TaxonomyChip';
import { ArrowLeft, Clock, Calendar, BookOpen, Shield } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await PublicReadModelsService.getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | HZCODE',
    };
  }

  return {
    title: `${article.title} | HZCODE System`,
    description: article.excerpt || article.subtitle || `Read ${article.title} on HZCODE.`,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    robots: article.isUnlisted ? { index: false, follow: false } : undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.subtitle || undefined,
      type: 'article',
      publishedTime: article.publishedAt || undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await PublicReadModelsService.getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently Published';

  return (
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer size="md">
        <article className="space-y-12">
          {/* Breadcrumb Navigation */}
          <div>
            <Link
              href="/system?type=ARTICLE"
              className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors uppercase tracking-wider mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO KNOWLEDGE HUB</span>
            </Link>

            {article.isUnlisted && (
              <div className="mb-8 p-4 border border-border-subtle bg-surface-container text-text-primary font-mono text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-text-secondary" />
                <span>
                  [ UNLISTED ESSAY ] This artifact is accessible via direct link only and excluded from public search indexes.
                </span>
              </div>
            )}

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary mb-4">
              <span className="px-2.5 py-0.5 border border-border-subtle bg-surface-container text-text-primary font-semibold uppercase text-[10px]">
                TECHNICAL ESSAY
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>{formattedDate}</span>
              </span>
              {article.readingTimeMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-text-secondary" />
                  <span>{article.readingTimeMinutes} min read</span>
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary uppercase leading-[1.08]">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="mt-4 text-lg md:text-xl text-text-secondary leading-relaxed font-sans">
                {article.subtitle}
              </p>
            )}

            {/* Taxonomies */}
            <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-border-subtle">
              {article.domains.map((d) => (
                <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
              ))}
              {article.technologies.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tech" />
              ))}
              {article.skills.map((s) => (
                <TaxonomyChip key={s.slug} label={s.name} variant="skill" />
              ))}
              {article.tags.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tag" />
              ))}
            </div>
          </div>

          {/* Excerpt Callout */}
          {article.excerpt && (
            <div className="p-6 md:p-8 border-l-2 border-text-primary bg-surface-container text-text-primary text-base md:text-lg italic leading-relaxed">
              &ldquo;{article.excerpt}&rdquo;
            </div>
          )}

          {/* Article Body */}
          <div className="prose-editorial max-w-none text-text-primary leading-relaxed space-y-6 text-base md:text-lg whitespace-pre-wrap">
            {article.content}
          </div>

          {/* Connected Knowledge */}
          {article.relatedKnowledge.length > 0 && (
            <div className="border-t border-border-subtle pt-12 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>RELATED KNOWLEDGE &amp; ARCHITECTURAL DECISIONS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {article.relatedKnowledge.map((k) => (
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
