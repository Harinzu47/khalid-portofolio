import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Terminal,
  Layers,
  BookOpen,
  Briefcase,
  Cpu,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { WorkCard } from '../work/WorkCard';
import { TaxonomyChip } from '../TaxonomyChip';
import type { HomePublicDTO } from '@/types/dtos/public-read-models.dto';

interface HomeViewProps {
  data: HomePublicDTO;
}

export function HomeView({ data }: HomeViewProps) {
  const { hero, featuredProjects, currentExperience, currentNow, selectedKnowledge, topCapabilities } = data;

  return (
    <div className="space-y-24">
      {/* 1. Hero Orientation */}
      <section className="pt-8 md:pt-14 pb-4 border-b border-terminal-border">
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary">
            <span>[ HZCODE_KERNEL // KHALID JUNDULLAH ]</span>
            {hero.availabilityStatus && (
              <span className="text-[10px] px-1.5 py-0.2 border border-terminal-primary/40 bg-terminal-primary/5 uppercase">
                {hero.availabilityStatus}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-terminal-text-primary leading-[1.05]">
            Engineering Systems, Infrastructure &amp; Developer Operating Systems.
          </h1>

          <p className="text-lg md:text-xl text-terminal-text-secondary leading-relaxed max-w-3xl">
            {hero.bio ||
              'Personal Developer OS and public knowledge interface. Engineering multi-tenant backend architectures, high-performance PostgreSQL pipelines, and high-reliability cloud services.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4 font-mono text-xs">
            <Link
              href="/work"
              className="px-5 py-2.5 bg-terminal-text-primary text-terminal-bg font-bold hover:bg-terminal-primary transition-colors inline-flex items-center gap-2"
            >
              <span>EXPLORE WORK ARCHIVE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/system"
              className="px-5 py-2.5 border border-terminal-border text-terminal-text-primary hover:border-terminal-primary transition-colors inline-flex items-center gap-2"
            >
              <span>KNOWLEDGE HUB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Selected / Featured Work */}
      {featuredProjects.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-terminal-border pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-terminal-primary block mb-1">
                // 01. SELECTED WORK
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-terminal-text-primary">
                Featured Engineering Systems
              </h2>
            </div>
            <Link
              href="/work"
              className="font-mono text-xs text-terminal-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>VIEW ALL WORK ({featuredProjects.length}+)</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="divide-y divide-terminal-border/50">
            {featuredProjects.map((p, idx) => (
              <WorkCard key={p.slug} project={p} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Live Focus Snapshot (NOW) */}
      {currentNow.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-terminal-border pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-terminal-primary block mb-1">
                // 02. ACTIVE ATTENTION
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-terminal-text-primary">
                What Has Attention Now
              </h2>
            </div>
            <Link
              href="/now"
              className="font-mono text-xs text-terminal-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>VIEW FULL NOW QUEUE</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentNow.map((item, idx) => (
              <div
                key={idx}
                className="border border-terminal-border bg-terminal-surface/30 p-6 space-y-3 hover:border-terminal-primary/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-1.5 py-0.5 border border-terminal-primary/30 text-terminal-primary bg-terminal-primary/5 uppercase text-[10px]">
                    {item.category}
                  </span>
                  {typeof item.progressPercent === 'number' && (
                    <span className="text-terminal-text-muted">{item.progressPercent}% PROGRESS</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-terminal-text-primary">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs md:text-sm text-terminal-text-secondary leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.linkedProject && (
                  <Link
                    href={`/work/${item.linkedProject.slug}`}
                    className="font-mono text-xs text-terminal-primary hover:underline inline-flex items-center gap-1 pt-2"
                  >
                    <span>{item.linkedProject.title} &rarr;</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Selected Knowledge Preview */}
      {selectedKnowledge.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-terminal-border pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-terminal-primary block mb-1">
                // 03. KNOWLEDGE SYSTEM
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-terminal-text-primary">
                Learning in Public &amp; Architectural Synthesis
              </h2>
            </div>
            <Link
              href="/system"
              className="font-mono text-xs text-terminal-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>EXPLORE KNOWLEDGE HUB</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedKnowledge.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="group border border-terminal-border bg-terminal-surface/30 p-6 hover:border-terminal-primary transition-colors flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-terminal-text-muted mb-2">
                    <span className="text-terminal-primary uppercase text-[10px]">
                      {item.entityType.replace('_', ' ')}
                    </span>
                    {item.publishedAt && (
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-terminal-text-primary group-hover:text-terminal-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-2 text-xs md:text-sm text-terminal-text-secondary line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {item.domains.slice(0, 2).map((d) => (
                    <TaxonomyChip key={d.slug} label={d.name} variant="domain" />
                  ))}
                  {item.technologies.slice(0, 2).map((t) => (
                    <TaxonomyChip key={t.slug} label={t.name} variant="tech" />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Career Snapshot */}
      {currentExperience && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between gap-4 border-b border-terminal-border pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-terminal-primary block mb-1">
                // 04. CURRENT RESPONSIBILITY
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-terminal-text-primary">
                Career Trajectory &amp; Role Snapshot
              </h2>
            </div>
            <Link
              href="/experience"
              className="font-mono text-xs text-terminal-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>FULL EXPERIENCE TIMELINE</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="border border-terminal-border bg-terminal-surface/40 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-terminal-primary">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{currentExperience.organizationName}</span>
                {currentExperience.isCurrent && (
                  <span className="px-1.5 py-0.2 bg-terminal-primary/10 border border-terminal-primary/30 text-[10px] uppercase">
                    CURRENT
                  </span>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-terminal-text-primary">
                {currentExperience.role}
              </h3>
              {currentExperience.description && (
                <p className="text-sm text-terminal-text-secondary max-w-2xl leading-relaxed">
                  {currentExperience.description}
                </p>
              )}
            </div>

            <div className="shrink-0 font-mono text-xs">
              <Link
                href="/experience"
                className="px-4 py-2 border border-terminal-border hover:border-terminal-primary text-terminal-text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <span>VIEW RESPONSIBILITIES &rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. Top Capabilities Snapshot */}
      {topCapabilities.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between gap-4 border-b border-terminal-border pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-terminal-primary block mb-1">
                // 05. EVIDENCE-BACKED CAPABILITIES
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-terminal-text-primary">
                Demonstrable Expertise Snapshot
              </h2>
            </div>
            <Link
              href="/expertise"
              className="font-mono text-xs text-terminal-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>VIEW FULL EVIDENCE MATRIX</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topCapabilities.map((item) => (
              <Link
                key={item.slug}
                href="/expertise"
                className="border border-terminal-border bg-terminal-surface/30 p-5 hover:border-terminal-primary transition-colors space-y-2 block"
              >
                <span className="font-mono text-[10px] text-terminal-primary uppercase block">
                  [{item.evidenceCount.total} ARTIFACTS]
                </span>
                <h3 className="font-bold text-terminal-text-primary text-base">
                  {item.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
