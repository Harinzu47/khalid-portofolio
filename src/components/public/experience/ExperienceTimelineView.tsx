import Link from 'next/link';
import { ExternalLink, Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { TaxonomyChip } from '../TaxonomyChip';
import type { ExperiencePublicDTO } from '@/types/dtos/public-read-models.dto';

interface ExperienceTimelineViewProps {
  experiences: ExperiencePublicDTO[];
}

export function ExperienceTimelineView({ experiences }: ExperienceTimelineViewProps) {
  return (
    <div className="relative border-l border-terminal-border ml-3 md:ml-6 pl-6 md:pl-10 space-y-12">
      {experiences.map((exp, idx) => {
        const startYear = new Date(exp.startDate).getFullYear();
        const endYear = exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present';

        return (
          <div key={idx} className="relative group">
            {/* Timeline node */}
            <div
              className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-3.5 h-3.5 border-2 ${
                exp.isCurrent
                  ? 'border-terminal-primary bg-terminal-primary'
                  : 'border-terminal-border bg-terminal-bg group-hover:border-terminal-primary'
              } transition-colors`}
            />

            <article className="border border-terminal-border bg-terminal-surface/40 p-6 md:p-8 hover:border-terminal-primary/60 transition-colors">
              {/* Header: Role & Organization */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                <h2 className="text-xl md:text-2xl font-bold text-terminal-text-primary">
                  {exp.role}
                </h2>
                <div className="font-mono text-xs text-terminal-primary shrink-0 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {startYear} — {endYear}
                  </span>
                  {exp.isCurrent && (
                    <span className="px-1.5 py-0.2 bg-terminal-primary/10 border border-terminal-primary/30 text-[10px] uppercase">
                      CURRENT
                    </span>
                  )}
                </div>
              </div>

              {/* Organization & Location Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-terminal-text-muted mb-6 pb-4 border-b border-terminal-border/50">
                <div className="flex items-center gap-1 text-terminal-secondary">
                  <Briefcase className="w-3.5 h-3.5" />
                  {exp.organizationUrl ? (
                    <a
                      href={exp.organizationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{exp.organizationName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="font-semibold">{exp.organizationName}</span>
                  )}
                </div>

                {exp.employmentType && (
                  <span className="uppercase">[{exp.employmentType}]</span>
                )}

                {exp.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {exp.location} {exp.locationType ? `(${exp.locationType})` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {exp.description && (
                <p className="text-sm md:text-base text-terminal-text-secondary leading-relaxed mb-6">
                  {exp.description}
                </p>
              )}

              {/* Key Achievements */}
              {exp.achievements && exp.achievements.length > 0 && (
                <div className="mb-6 space-y-2">
                  <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider block">
                    KEY OUTCOMES & RESPONSIBILITIES:
                  </span>
                  <ul className="space-y-1.5">
                    {exp.achievements.map((ach, aIdx) => (
                      <li
                        key={aIdx}
                        className="text-xs md:text-sm text-terminal-text-secondary flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-terminal-primary shrink-0 mt-1" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Linked Projects Evidence */}
              {exp.linkedProjects && exp.linkedProjects.length > 0 && (
                <div className="mb-6 p-4 border border-terminal-border/70 bg-terminal-bg/50">
                  <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider block mb-2">
                    DELIVERED IN THIS ROLE:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {exp.linkedProjects.map((lp) => (
                      <Link
                        key={lp.slug}
                        href={`/work/${lp.slug}`}
                        className="font-mono text-xs text-terminal-primary hover:underline flex items-center gap-1"
                      >
                        <span>{lp.title}</span>
                        <span>&rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Taxonomies */}
              <div className="flex flex-wrap gap-2 pt-2">
                {exp.domains.map((d) => (
                  <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
                ))}
                {exp.technologies.map((t) => (
                  <TaxonomyChip key={t.slug} label={t.name} variant="tech" color={t.color} />
                ))}
                {exp.skills.map((s) => (
                  <TaxonomyChip key={s.slug} label={s.name} variant="skill" />
                ))}
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
