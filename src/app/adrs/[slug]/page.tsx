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
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer size="md">
        <article className="space-y-10">
          {/* Breadcrumbs */}
          <div>
            <Link
              href="/system?type=ADR"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-text-muted hover:text-terminal-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>&larr; BACK TO KNOWLEDGE HUB</span>
            </Link>

            {adr.isUnlisted && (
              <div className="mb-6 p-3 border border-terminal-warning/30 bg-terminal-warning/5 text-terminal-warning font-mono text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>
                  [ UNLISTED ADR ] Accessible via direct link only and excluded from public search.
                </span>
              </div>
            )}

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-terminal-text-muted mb-4">
              <span className="px-2 py-0.5 border border-terminal-border text-terminal-primary bg-terminal-primary/5 uppercase text-[10px]">
                ARCHITECTURE DECISION RECORD
              </span>
              {adr.adrNumber && <span>ADR-{String(adr.adrNumber).padStart(3, '0')}</span>}
              {adr.adrStatus && (
                <span className="px-2 py-0.5 border border-terminal-primary/30 text-terminal-primary uppercase text-[10px]">
                  STATUS: {adr.adrStatus}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-terminal-text-primary leading-tight">
              {adr.title}
            </h1>

            {/* Taxonomies */}
            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-terminal-border">
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
          <div className="space-y-8 max-w-none text-terminal-text-secondary leading-relaxed">
            {/* 1. Context */}
            {adr.adrContext && (
              <section className="space-y-2">
                <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-primary">
                  // 1. CONTEXT
                </h2>
                <div className="p-6 border border-terminal-border bg-terminal-surface/30 text-terminal-text-secondary whitespace-pre-wrap text-base">
                  {adr.adrContext}
                </div>
              </section>
            )}

            {/* 2. Decision */}
            {adr.adrDecision && (
              <section className="space-y-2">
                <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-primary flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-terminal-primary" />
                  <span>// 2. DECISION RATIONALE</span>
                </h2>
                <div className="p-6 border-l-2 border-terminal-primary bg-terminal-surface/40 text-terminal-text-primary whitespace-pre-wrap text-base leading-relaxed">
                  {adr.adrDecision}
                </div>
              </section>
            )}

            {/* 3. Consequences */}
            {adr.adrConsequences && (
              <section className="space-y-2">
                <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-primary">
                  // 3. CONSEQUENCES & TRADE-OFFS
                </h2>
                <div className="p-6 border border-terminal-border bg-terminal-surface/30 text-terminal-text-secondary whitespace-pre-wrap text-base">
                  {adr.adrConsequences}
                </div>
              </section>
            )}
          </div>

          {/* Connected Knowledge (Amendment 34) */}
          {adr.relatedKnowledge.length > 0 && (
            <div className="border-t border-terminal-border pt-10 space-y-6">
              <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>RELATED KNOWLEDGE & PRODUCTION SYSTEMS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adr.relatedKnowledge.map((k) => (
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
