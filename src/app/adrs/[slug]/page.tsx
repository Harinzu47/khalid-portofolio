import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { TaxonomyChip } from '@/components/public/TaxonomyChip';
import { ArrowLeft, Calendar, BookOpen, Shield, FileCheck2 } from 'lucide-react';

interface AdrPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AdrPageProps): Promise<Metadata> {
  const { slug } = await params;
  const adr = await PublicReadModelsService.getAdrBySlug(slug);

  if (!adr) {
    return {
      title: 'ADR Not Found | HZCODE',
    };
  }

  return {
    title: `${adr.title} | HZCODE Architecture Decision Record`,
    description: adr.adrDecision || `Architecture Decision Record for ${adr.title}.`,
    alternates: {
      canonical: `/adrs/${adr.slug}`,
    },
    robots: adr.isUnlisted ? { index: false, follow: false } : undefined,
    openGraph: {
      title: adr.title,
      description: adr.adrDecision || undefined,
      type: 'article',
      publishedTime: adr.publishedAt || undefined,
    },
  };
}

export default async function AdrDetailPage({ params }: AdrPageProps) {
  const { slug } = await params;
  const adr = await PublicReadModelsService.getAdrBySlug(slug);

  if (!adr) {
    notFound();
  }

  const formattedDate = adr.publishedAt
    ? new Date(adr.publishedAt).toLocaleDateString(undefined, {
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
              href="/system?type=ADR"
              className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors uppercase tracking-wider mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO KNOWLEDGE HUB</span>
            </Link>

            {adr.isUnlisted && (
              <div className="mb-8 p-4 border border-border-subtle bg-surface-container text-text-primary font-mono text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-text-secondary" />
                <span>
                  [ UNLISTED ADR ] Accessible via direct link only and excluded from public search indexes.
                </span>
              </div>
            )}

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary mb-4">
              <span className="px-2.5 py-0.5 border border-border-subtle bg-surface-container text-text-primary font-semibold uppercase text-[10px]">
                ARCHITECTURE DECISION RECORD
              </span>
              {adr.adrNumber && <span className="font-semibold text-text-primary">ADR-{String(adr.adrNumber).padStart(3, '0')}</span>}
              {adr.adrStatus && (
                <span className="px-2 py-0.5 border border-border-subtle bg-surface-container-high text-text-primary font-semibold uppercase text-[10px]">
                  STATUS: {adr.adrStatus}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary uppercase leading-[1.08]">
              {adr.title}
            </h1>

            {/* Taxonomies */}
            <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-border-subtle">
              {adr.domains.map((d) => (
                <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
              ))}
              {adr.technologies.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tech" />
              ))}
              {adr.skills.map((s) => (
                <TaxonomyChip key={s.slug} label={s.name} variant="skill" />
              ))}
              {adr.tags.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tag" />
              ))}
            </div>
          </div>

          {/* Structured ADR Sections */}
          <div className="space-y-8 max-w-none text-text-primary leading-relaxed">
            {/* 1. Context */}
            {adr.adrContext && (
              <section className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  01 / CONTEXT &amp; DRIVERS
                </h2>
                <div className="p-6 border border-border-subtle bg-surface-container/50 text-text-primary whitespace-pre-wrap text-base leading-relaxed">
                  {adr.adrContext}
                </div>
              </section>
            )}

            {/* 2. Decision */}
            {adr.adrDecision && (
              <section className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-text-primary" />
                  <span>02 / DECISION RATIONALE</span>
                </h2>
                <div className="p-6 md:p-8 border-l-2 border-text-primary bg-surface-container text-text-primary whitespace-pre-wrap text-base md:text-lg font-medium leading-relaxed">
                  {adr.adrDecision}
                </div>
              </section>
            )}

            {/* 3. Consequences */}
            {adr.adrConsequences && (
              <section className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  03 / CONSEQUENCES &amp; TRADE-OFFS
                </h2>
                <div className="p-6 border border-border-subtle bg-surface-container/50 text-text-primary whitespace-pre-wrap text-base leading-relaxed">
                  {adr.adrConsequences}
                </div>
              </section>
            )}
          </div>

          {/* Connected Knowledge */}
          {adr.relatedKnowledge.length > 0 && (
            <div className="border-t border-border-subtle pt-12 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>RELATED KNOWLEDGE &amp; PRODUCTION SYSTEMS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adr.relatedKnowledge.map((k) => (
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
