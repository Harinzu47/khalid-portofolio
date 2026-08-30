import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, BookOpen, Shield } from 'lucide-react';
import { TaxonomyChip } from '../TaxonomyChip';
import type { ProjectDetailDTO } from '@/types/dtos/public-read-models.dto';

interface ProjectDetailViewProps {
  project: ProjectDetailDTO;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const cs = project.caseStudy;

  return (
    <div className="space-y-16 md:space-y-20">
      {/* 1. Navigation & Breadcrumb */}
      <div>
        <Link
          href="/work"
          className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors uppercase tracking-wider mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO WORK ARCHIVE</span>
        </Link>

        {project.isUnlisted && (
          <div className="mb-8 p-4 border border-border-subtle bg-surface-container text-text-primary font-mono text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0 text-text-secondary" />
            <span>
              [ UNLISTED ARTIFACT ] This record is accessible via direct URL only and is excluded from public search indexes.
            </span>
          </div>
        )}

        {/* Project Hero Header */}
        <div className="border-b border-border-subtle pb-12 space-y-6">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary">
            <span className="px-2.5 py-0.5 border border-border-subtle bg-surface-container uppercase text-[10px] font-semibold text-text-primary">
              {project.projectType || 'ENGINEERING SYSTEM'}
            </span>
            <span className="uppercase text-[10px] font-medium tracking-wider">
              STATUS: {project.status}
            </span>
            {project.featured && (
              <span className="px-2 py-0.5 border border-border-subtle bg-surface-container-high text-text-primary text-[10px] font-bold uppercase">
                FEATURED
              </span>
            )}
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary uppercase leading-[1.05]">
            {project.title}
          </h1>

          {cs?.subtitle || project.shortDescription ? (
            <p className="font-sans text-lg sm:text-xl text-text-secondary max-w-4xl leading-relaxed">
              {cs?.subtitle || project.shortDescription}
            </p>
          ) : null}

          {/* Metadata Grid */}
          <div className="mt-8 pt-8 border-t border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div>
              <span className="text-text-secondary uppercase tracking-widest block mb-1 text-[10px]">
                ROLE / RESPONSIBILITY
              </span>
              <span className="text-text-primary font-semibold">
                {project.role || 'Lead Architect & Engineer'}
              </span>
            </div>

            <div>
              <span className="text-text-secondary uppercase tracking-widest block mb-1 text-[10px]">
                TIMELINE
              </span>
              <span className="text-text-primary font-semibold">
                {project.startDate ? new Date(project.startDate).getFullYear() : 'Present'}
                {project.endDate ? ` — ${new Date(project.endDate).getFullYear()}` : ' — Ongoing'}
              </span>
            </div>

            <div>
              <span className="text-text-secondary uppercase tracking-widest block mb-1 text-[10px]">
                SOURCE REPOSITORY
              </span>
              {project.repositoryUrl ? (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>REPOSITORY &nearr;</span>
                </a>
              ) : (
                <span className="text-text-secondary">Proprietary / Internal</span>
              )}
            </div>

            <div>
              <span className="text-text-secondary uppercase tracking-widest block mb-1 text-[10px]">
                LIVE SYSTEM
              </span>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>LIVE DEPLOYMENT &nearr;</span>
                </a>
              ) : (
                <span className="text-text-secondary">Private Infrastructure</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Taxonomies & Capabilities */}
      <div className="border-b border-border-subtle pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest block mb-3">
              DOMAIN PILLARS
            </span>
            <div className="flex flex-wrap gap-2">
              {project.domains.map((d) => (
                <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest block mb-3">
              TECHNOLOGIES
            </span>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tech" color={t.color} />
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest block mb-3">
              COMPETENCIES
            </span>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((s) => (
                <TaxonomyChip key={s.slug} label={s.name} variant="skill" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Case Study Narrative */}
      <div className="space-y-12 max-w-4xl">
        {cs ? (
          <>
            {/* Executive Summary */}
            {cs.executiveSummary && (
              <section className="bg-surface-container border border-border-subtle p-6 md:p-8 space-y-3">
                <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block">
                  // EXECUTIVE SUMMARY
                </span>
                <p className="font-sans text-base md:text-lg text-text-primary leading-relaxed">
                  {cs.executiveSummary}
                </p>
              </section>
            )}

            {/* Context & Problem */}
            {(cs.context || cs.problem) && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                  <span>01.</span>
                  <span>CONTEXT &amp; PROBLEM STATEMENT</span>
                </h2>
                {cs.context && (
                  <p className="text-base text-text-secondary leading-relaxed">
                    {cs.context}
                  </p>
                )}
                {cs.problem && (
                  <div className="p-5 border-l-2 border-text-primary bg-surface-container text-text-primary text-sm md:text-base leading-relaxed">
                    {cs.problem}
                  </div>
                )}
              </section>
            )}

            {/* Constraints & Approach */}
            {(cs.constraints || cs.approach) && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                  <span>02.</span>
                  <span>CONSTRAINTS &amp; ENGINEERING APPROACH</span>
                </h2>
                {cs.constraints && (
                  <p className="text-base text-text-secondary leading-relaxed">
                    <strong className="text-text-primary font-semibold">Constraints: </strong>
                    {cs.constraints}
                  </p>
                )}
                {cs.approach && (
                  <p className="text-base text-text-secondary leading-relaxed">
                    {cs.approach}
                  </p>
                )}
              </section>
            )}

            {/* Architecture & Implementation */}
            {(cs.architecture || cs.implementation) && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                  <span>03.</span>
                  <span>SYSTEM ARCHITECTURE &amp; IMPLEMENTATION</span>
                </h2>
                {cs.architecture && (
                  <div className="editorial-code-block p-6 text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                    {cs.architecture}
                  </div>
                )}
                {cs.implementation && (
                  <p className="text-base text-text-secondary leading-relaxed">
                    {cs.implementation}
                  </p>
                )}
              </section>
            )}

            {/* Quantitative Outcomes & Impact */}
            {cs.quantitativeOutcomes && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                  <span>04.</span>
                  <span>VERIFIED OUTCOMES &amp; IMPACT</span>
                </h2>
                <div className="border border-border-subtle bg-surface-container p-6 text-text-primary text-sm md:text-base leading-relaxed">
                  {cs.quantitativeOutcomes}
                </div>
              </section>
            )}

            {/* Learnings */}
            {cs.learnings && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
                  <span>05.</span>
                  <span>ENGINEERING REFLECTIONS &amp; LESSONS</span>
                </h2>
                <p className="text-base text-text-secondary leading-relaxed">
                  {cs.learnings}
                </p>
              </section>
            )}
          </>
        ) : (
          <>
            {/* Fallback Canonical Project Narrative */}
            {project.description && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  OVERVIEW
                </h2>
                <p className="text-base text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </section>
            )}

            {project.problemStatement && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  PROBLEM STATEMENT
                </h2>
                <div className="p-5 border-l-2 border-text-primary bg-surface-container text-text-primary text-sm md:text-base leading-relaxed">
                  {project.problemStatement}
                </div>
              </section>
            )}

            {project.solution && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  SOLUTION &amp; DELIVERY
                </h2>
                <p className="text-base text-text-secondary leading-relaxed">
                  {project.solution}
                </p>
              </section>
            )}

            {project.architecture && (
              <section className="space-y-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                  SYSTEM ARCHITECTURE
                </h2>
                <div className="editorial-code-block p-6 text-xs md:text-sm whitespace-pre-wrap">
                  {project.architecture}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* 4. Media & Evidence Gallery */}
      {project.media.length > 0 && (
        <div className="border-t border-border-subtle pt-12 space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
            SYSTEM MEDIA &amp; ARTIFACTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.media.map((m, idx) => (
              <div key={idx} className="border border-border-subtle bg-surface-container overflow-hidden">
                <img
                  src={m.url}
                  alt={m.altText || 'System artifact'}
                  className="w-full h-auto object-cover max-h-[400px]"
                  loading="lazy"
                />
                {m.altText && (
                  <div className="p-3 border-t border-border-subtle font-mono text-[11px] text-text-secondary bg-surface-main">
                    {m.altText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Related Knowledge */}
      {project.relatedKnowledge.length > 0 && (
        <div className="border-t border-border-subtle pt-12 space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>CONNECTED KNOWLEDGE &amp; ARCHITECTURAL DECISIONS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.relatedKnowledge.map((k) => (
              <Link
                key={k.slug}
                href={k.href}
                className="group border border-border-subtle bg-surface-container/40 p-6 hover:border-text-primary transition-colors block space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-text-secondary uppercase tracking-wider">
                    {k.entityType}
                  </span>
                  {k.publishedAt && (
                    <span className="font-mono text-[10px] text-text-secondary">
                      {new Date(k.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="font-headline font-bold text-text-primary group-hover:underline transition-all text-base">
                  {k.title}
                </h3>
                {k.summary && (
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {k.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
