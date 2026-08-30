import Link from 'next/link';
import { ExternalLink, Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { TaxonomyChip } from '../TaxonomyChip';
import type { ExperiencePublicDTO } from '@/types/dtos/public-read-models.dto';

interface ExperienceTimelineViewProps {
  experiences: ExperiencePublicDTO[];
}

export function ExperienceTimelineView({ experiences }: ExperienceTimelineViewProps) {
  return (
    <div className="space-y-12">
      {experiences.map((exp, idx) => {
        const startYear = new Date(exp.startDate).getFullYear();
        const endYear = exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present';
        const roleIndex = String(idx + 1).padStart(2, '0');

        return (
          <article
            key={idx}
            className="border border-border-subtle bg-surface-container/30 p-6 md:p-10 hover:border-text-primary transition-colors space-y-6"
          >
            {/* Header: Role Index, Role Title & Period */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border-subtle pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 font-mono text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">[{roleIndex}/]</span>
                  <div className="flex items-center gap-1.5 text-text-primary font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-text-secondary" />
                    {exp.organizationUrl ? (
                      <a
                        href={exp.organizationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        <span>{exp.organizationName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>{exp.organizationName}</span>
                    )}
                  </div>
                </div>

                <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-text-primary">
                  {exp.role}
                </h2>
              </div>

              <div className="font-mono text-xs text-text-secondary flex items-center gap-2 shrink-0 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium text-text-primary">
                  {startYear} — {endYear}
                </span>
                {exp.isCurrent && (
                  <span className="px-2 py-0.5 bg-surface-container-high border border-border-subtle text-[10px] font-bold text-text-primary uppercase">
                    CURRENT
                  </span>
                )}
              </div>
            </div>

            {/* Organization & Location Meta */}
            {(exp.employmentType || exp.location) && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-secondary">
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
            )}

            {/* Description */}
            {exp.description && (
              <p className="font-sans text-base text-text-secondary leading-relaxed max-w-4xl">
                {exp.description}
              </p>
            )}

            {/* Key Achievements & Responsibilities */}
            {exp.achievements && exp.achievements.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest block">
                  RESPONSIBILITIES &amp; KEY OUTCOMES:
                </span>
                <ul className="space-y-2">
                  {exp.achievements.map((ach, aIdx) => (
                    <li
                      key={aIdx}
                      className="text-sm text-text-secondary flex items-start gap-2.5 leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-text-primary shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Linked Projects Evidence */}
            {exp.linkedProjects && exp.linkedProjects.length > 0 && (
              <div className="p-5 border border-border-subtle bg-surface-main">
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest block mb-2">
                  DELIVERED IN THIS ROLE:
                </span>
                <div className="flex flex-wrap gap-4">
                  {exp.linkedProjects.map((lp) => (
                    <Link
                      key={lp.slug}
                      href={`/work/${lp.slug}`}
                      className="font-mono text-xs text-text-primary font-semibold hover:underline inline-flex items-center gap-1"
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
        );
      })}
    </div>
  );
}
