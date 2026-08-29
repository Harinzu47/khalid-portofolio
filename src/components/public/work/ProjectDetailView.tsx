import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Layers,
  Cpu,
  CheckCircle2,
  BookOpen,
  FileText,
  Shield,
} from 'lucide-react';
import { TaxonomyChip } from '../TaxonomyChip';
import type { ProjectDetailDTO } from '@/types/dtos/public-read-models.dto';

interface ProjectDetailViewProps {
  project: ProjectDetailDTO;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const cs = project.caseStudy;

  return (
    <div className="space-y-16">
      {/* 1. Breadcrumbs & Unlisted Notice */}
      <div>
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-text-muted hover:text-terminal-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; BACK TO WORK ARCHIVE</span>
        </Link>

        {project.isUnlisted && (
          <div className="mb-6 p-3 border border-terminal-warning/30 bg-terminal-warning/5 text-terminal-warning font-mono text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>
              [ UNLISTED ARTIFACT ] This record is accessible via direct URL only and is excluded from public indexes.
            </span>
          </div>
        )}

        {/* Project Header */}
        <div className="border-b border-terminal-border pb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4 font-mono text-xs">
            <span className="px-2 py-0.5 border border-terminal-border text-terminal-primary bg-terminal-primary/5 uppercase">
              {project.projectType || 'ENGINEERING SYSTEM'}
            </span>
            <span className="px-2 py-0.5 border border-terminal-border text-terminal-text-secondary uppercase">
              STATUS: {project.status}
            </span>
            {project.featured && (
              <span className="px-2 py-0.5 border border-terminal-primary/40 text-terminal-primary">
                FEATURED
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-terminal-text-primary">
            {project.title}
          </h1>

          {cs?.subtitle || project.shortDescription ? (
            <p className="mt-4 text-lg md:text-xl text-terminal-text-secondary max-w-4xl leading-relaxed">
              {cs?.subtitle || project.shortDescription}
            </p>
          ) : null}

          {/* Action Links & Meta Grid */}
          <div className="mt-8 pt-6 border-t border-terminal-border/50 grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div>
              <span className="text-terminal-text-muted block mb-1">ROLE / RESPONSIBILITY</span>
              <span className="text-terminal-text-primary font-medium">
                {project.role || 'Lead Architect & Engineer'}
              </span>
            </div>

            <div>
              <span className="text-terminal-text-muted block mb-1">TIMELINE</span>
              <span className="text-terminal-text-primary font-medium">
                {project.startDate ? new Date(project.startDate).getFullYear() : 'Present'}
                {project.endDate ? ` — ${new Date(project.endDate).getFullYear()}` : ' — Ongoing'}
              </span>
            </div>

            <div>
              <span className="text-terminal-text-muted block mb-1">SOURCE / CODE</span>
              {project.repositoryUrl ? (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-secondary hover:underline inline-flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>REPOSITORY &rarr;</span>
                </a>
              ) : (
                <span className="text-terminal-text-muted">Proprietary / Private</span>
              )}
            </div>

            <div>
              <span className="text-terminal-text-muted block mb-1">LIVE DEPLOYMENT</span>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-primary hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>LIVE SYSTEM &rarr;</span>
                </a>
              ) : (
                <span className="text-terminal-text-muted">Internal Infrastructure</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Taxonomies & Capabilities */}
      <div className="border-b border-terminal-border pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider block mb-3">
              DOMAIN PILLARS
            </span>
            <div className="flex flex-wrap gap-2">
              {project.domains.map((d) => (
                <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider block mb-3">
              TECHNOLOGIES
            </span>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <TaxonomyChip key={t.slug} label={t.name} variant="tech" color={t.color} />
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider block mb-3">
              COMPETENCIES / SKILLS
            </span>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((s) => (
                <TaxonomyChip key={s.slug} label={s.name} variant="skill" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Case Study Narrative or Structured Specifications */}
      <div className="space-y-12 max-w-4xl">
        {cs ? (
          <>
            {/* Executive Summary */}
            {cs.executiveSummary && (
              <section className="bg-terminal-surface/40 border border-terminal-border p-6 md:p-8">
                <span className="font-mono text-xs text-terminal-primary uppercase tracking-widest block mb-3">
                  // EXECUTIVE SUMMARY
                </span>
                <p className="text-base md:text-lg text-terminal-text-primary leading-relaxed">
                  {cs.executiveSummary}
                </p>
              </section>
            )}

            {/* Context & Problem */}
            {(cs.context || cs.problem) && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                  <span>01.</span>
                  <span>CONTEXT & PROBLEM STATEMENT</span>
                </h2>
                {cs.context && (
                  <p className="text-base text-terminal-text-secondary leading-relaxed">
                    {cs.context}
                  </p>
                )}
                {cs.problem && (
                  <div className="p-5 border-l-2 border-terminal-warning bg-terminal-surface/20 text-terminal-text-secondary text-sm md:text-base leading-relaxed">
                    {cs.problem}
                  </div>
                )}
              </section>
            )}

            {/* Constraints & Approach */}
            {(cs.constraints || cs.approach) && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                  <span>02.</span>
                  <span>CONSTRAINTS & ENGINEERING APPROACH</span>
                </h2>
                {cs.constraints && (
                  <p className="text-base text-terminal-text-secondary leading-relaxed">
                    <strong className="text-terminal-text-primary">Constraints: </strong>
                    {cs.constraints}
                  </p>
                )}
                {cs.approach && (
                  <p className="text-base text-terminal-text-secondary leading-relaxed">
                    {cs.approach}
                  </p>
                )}
              </section>
            )}

            {/* Architecture & Implementation */}
            {(cs.architecture || cs.implementation) && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                  <span>03.</span>
                  <span>SYSTEM ARCHITECTURE & IMPLEMENTATION</span>
                </h2>
                {cs.architecture && (
                  <div className="bg-surface-code border border-terminal-border p-6 font-mono text-xs md:text-sm text-terminal-text-primary whitespace-pre-wrap leading-relaxed">
                    {cs.architecture}
                  </div>
                )}
                {cs.implementation && (
                  <p className="text-base text-terminal-text-secondary leading-relaxed">
                    {cs.implementation}
                  </p>
                )}
              </section>
            )}

            {/* Quantitative Outcomes & Impact (Stored Evidence Only - Amendments 3, 25) */}
            {cs.quantitativeOutcomes && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                  <span>04.</span>
                  <span>VERIFIED OUTCOMES & IMPACT</span>
                </h2>
                <div className="border border-terminal-primary/30 bg-terminal-primary/5 p-6 text-terminal-text-primary text-sm md:text-base leading-relaxed">
                  {cs.quantitativeOutcomes}
                </div>
              </section>
            )}

            {/* Learnings */}
            {cs.learnings && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
                  <span>05.</span>
                  <span>ENGINEERING REFLECTIONS & LESSONS</span>
                </h2>
                <p className="text-base text-terminal-text-secondary leading-relaxed">
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
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary">
                  OVERVIEW
                </h2>
                <p className="text-base text-terminal-text-secondary leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </section>
            )}

            {project.problemStatement && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary">
                  PROBLEM STATEMENT
                </h2>
                <div className="p-5 border-l-2 border-terminal-border bg-terminal-surface/20 text-terminal-text-secondary text-sm md:text-base leading-relaxed">
                  {project.problemStatement}
                </div>
              </section>
            )}

            {project.solution && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary">
                  SOLUTION & DELIVERY
                </h2>
                <p className="text-base text-terminal-text-secondary leading-relaxed">
                  {project.solution}
                </p>
              </section>
            )}

            {project.architecture && (
              <section className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary">
                  SYSTEM ARCHITECTURE
                </h2>
                <div className="bg-surface-code border border-terminal-border p-6 font-mono text-xs md:text-sm text-terminal-text-primary whitespace-pre-wrap">
                  {project.architecture}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* 4. Media & Evidence Gallery (Amendment 13) */}
      {project.media.length > 0 && (
        <div className="border-t border-terminal-border pt-12 space-y-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary">
            SYSTEM MEDIA & ARTIFACTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.media.map((m, idx) => (
              <div key={idx} className="border border-terminal-border bg-terminal-surface/30 overflow-hidden">
                <img
                  src={m.url}
                  alt={m.altText}
                  className="w-full h-auto object-cover max-h-[400px]"
                  loading="lazy"
                />
                {m.altText && (
                  <div className="p-3 border-t border-terminal-border font-mono text-[11px] text-terminal-text-muted">
                    {m.altText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Related Knowledge (Semantic Relationships - Amendment 34) */}
      {project.relatedKnowledge.length > 0 && (
        <div className="border-t border-terminal-border pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm uppercase tracking-widest text-terminal-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>CONNECTED KNOWLEDGE & ARCHITECTURAL DECISIONS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.relatedKnowledge.map((k) => (
              <Link
                key={k.slug}
                href={k.href}
                className="group border border-terminal-border bg-terminal-surface/40 p-5 hover:border-terminal-primary transition-colors block"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] text-terminal-primary uppercase tracking-wider">
                    {k.entityType}
                  </span>
                  {k.publishedAt && (
                    <span className="font-mono text-[10px] text-terminal-text-muted">
                      {new Date(k.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-terminal-text-primary group-hover:text-terminal-primary transition-colors text-base">
                  {k.title}
                </h3>
                {k.summary && (
                  <p className="mt-2 text-xs text-terminal-text-secondary line-clamp-2 leading-relaxed">
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
