import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Briefcase } from 'lucide-react';
import { WorkCard } from '../work/WorkCard';
import { TaxonomyChip } from '../TaxonomyChip';
import type { HomePublicDTO } from '@/types/dtos/public-read-models.dto';

interface HomeViewProps {
  data: HomePublicDTO;
}

export function HomeView({ data }: HomeViewProps) {
  const { hero, featuredProjects, currentExperience, currentNow, selectedKnowledge, topCapabilities } = data;

  return (
    <div className="space-y-24 md:space-y-32">
      {/* 00 / Hero Orientation */}
      <section className="pt-6 md:pt-12 pb-12 border-b border-border-subtle">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-12 space-y-6">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary uppercase tracking-widest">
              <span>01 / INTRODUCTION</span>
              {hero.availabilityStatus && (
                <span className="text-[10px] px-2 py-0.5 border border-border-subtle bg-surface-container text-text-primary font-semibold">
                  {hero.availabilityStatus}
                </span>
              )}
            </div>

            <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-text-primary uppercase leading-[0.95] max-w-5xl">
              {hero.fullName || 'KHALID JUNDULLAH'}
            </h1>

            <p className="font-sans text-lg sm:text-xl md:text-2xl text-text-secondary leading-relaxed max-w-3xl font-normal">
              {hero.bio ||
                'I work at the intersection of technology, learning, project delivery and software — building systems, documenting what I learn, and continuously expanding how those pieces connect.'}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4 font-mono text-xs">
              <Link
                href="/work"
                className="px-6 py-3.5 bg-text-primary text-surface-main uppercase tracking-wider font-semibold hover:bg-accent-technical transition-colors inline-flex items-center gap-2"
              >
                <span>EXPLORE WORK ARCHIVE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/system"
                className="px-6 py-3.5 border border-border-subtle hover:border-text-primary text-text-primary uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-2 bg-surface-container/30"
              >
                <span>KNOWLEDGE HUB</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 01 / Selected / Featured Work */}
      {featuredProjects.length > 0 && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block mb-1">
                01 / SELECTED WORK
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary uppercase">
                Systems I&apos;ve Shipped.
              </h2>
            </div>
            <Link
              href="/work"
              className="font-mono text-xs text-text-primary hover:underline uppercase tracking-wider flex items-center gap-1 shrink-0 font-semibold"
            >
              <span>VIEW ALL WORK ({featuredProjects.length}+)</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="divide-y divide-border-subtle">
            {featuredProjects.map((p, idx) => (
              <WorkCard key={p.slug} project={p} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 02 / Career Trajectory Snapshot */}
      {currentExperience && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block mb-1">
                02 / CAREER TRAJECTORY
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary uppercase">
                From Infra to Software.
              </h2>
            </div>
            <Link
              href="/experience"
              className="font-mono text-xs text-text-primary hover:underline uppercase tracking-wider flex items-center gap-1 shrink-0 font-semibold"
            >
              <span>FULL EXPERIENCE TIMELINE</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="border border-border-subtle bg-surface-container/40 p-6 md:p-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 font-mono text-xs text-text-secondary uppercase">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="font-semibold text-text-primary">{currentExperience.organizationName}</span>
                {currentExperience.isCurrent && (
                  <span className="px-2 py-0.5 bg-surface-container-high border border-border-subtle text-[10px] font-bold text-text-primary">
                    ACTIVE ROLE
                  </span>
                )}
              </div>
              <h3 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-text-primary">
                {currentExperience.role}
              </h3>
              {currentExperience.description && (
                <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                  {currentExperience.description}
                </p>
              )}
            </div>

            <div className="shrink-0 font-mono text-xs">
              <Link
                href="/experience"
                className="px-5 py-2.5 border border-border-subtle hover:border-text-primary text-text-primary bg-surface-main transition-colors inline-flex items-center gap-2 font-semibold uppercase tracking-wider"
              >
                <span>VIEW RESPONSIBILITIES &rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 03 / Demonstrable Expertise Snapshot */}
      {topCapabilities.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block mb-1">
                03 / DEMONSTRABLE EXPERTISE
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary uppercase">
                Explore the Underlying System.
              </h2>
            </div>
            <Link
              href="/expertise"
              className="font-mono text-xs text-text-primary hover:underline uppercase tracking-wider flex items-center gap-1 shrink-0 font-semibold"
            >
              <span>VIEW FULL EVIDENCE MATRIX</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {topCapabilities.map((item) => (
              <Link
                key={item.slug}
                href="/expertise"
                className="border border-border-subtle bg-surface-container/30 p-5 hover:border-text-primary transition-colors space-y-2 block"
              >
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-wider block">
                  [{item.evidenceCount.total} ARTIFACTS]
                </span>
                <h3 className="font-headline font-bold text-text-primary text-base">
                  {item.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 04 / Live Focus Snapshot (NOW) */}
      {currentNow.length > 0 && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block mb-1">
                04 / ACTIVE ATTENTION
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary uppercase">
                What Has Attention Right Now.
              </h2>
            </div>
            <Link
              href="/now"
              className="font-mono text-xs text-text-primary hover:underline uppercase tracking-wider flex items-center gap-1 shrink-0 font-semibold"
            >
              <span>VIEW FULL NOW QUEUE</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentNow.map((item, idx) => (
              <div
                key={idx}
                className="border border-border-subtle bg-surface-container/30 p-6 space-y-3 hover:border-text-primary transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 border border-border-subtle text-text-primary bg-surface-container-high uppercase font-semibold text-[10px]">
                    {item.category}
                  </span>
                  {typeof item.progressPercent === 'number' && (
                    <span className="text-text-secondary">{item.progressPercent}% PROGRESS</span>
                  )}
                </div>
                <h3 className="font-headline text-lg font-bold text-text-primary">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.linkedProject && (
                  <Link
                    href={`/work/${item.linkedProject.slug}`}
                    className="font-mono text-xs text-text-primary hover:underline inline-flex items-center gap-1 pt-2 font-medium"
                  >
                    <span>{item.linkedProject.title} &rarr;</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 05 / Selected Knowledge Preview */}
      {selectedKnowledge.length > 0 && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block mb-1">
                05 / KNOWLEDGE SYSTEM
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary uppercase">
                Learning in Public.
              </h2>
            </div>
            <Link
              href="/system"
              className="font-mono text-xs text-text-primary hover:underline uppercase tracking-wider flex items-center gap-1 shrink-0 font-semibold"
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
                className="group border border-border-subtle bg-surface-container/30 p-6 hover:border-text-primary transition-colors flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-text-secondary mb-2">
                    <span className="text-text-primary font-semibold uppercase text-[10px]">
                      {item.entityType.replace('_', ' ')}
                    </span>
                    {item.publishedAt && (
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <h3 className="font-headline text-lg font-bold text-text-primary group-hover:underline transition-all">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-2 text-xs md:text-sm text-text-secondary line-clamp-2 leading-relaxed">
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

      {/* 06 / Direct Contact / Collaboration CTA */}
      <section className="border border-border-subtle bg-surface-container/50 p-8 md:p-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block">
              06 / COLLABORATION
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary uppercase tracking-tight">
              Have a System Worth Building?
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Available for distributed infrastructure consulting, backend architecture, and technical systems engineering.
            </p>
          </div>
          <div className="shrink-0 font-mono text-xs">
            <Link
              href="/about"
              className="px-6 py-3.5 bg-text-primary text-surface-main font-semibold uppercase tracking-wider hover:bg-accent-technical transition-colors inline-flex items-center gap-2"
            >
              <span>GET IN TOUCH</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
