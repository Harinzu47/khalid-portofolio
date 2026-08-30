import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';
import { TaxonomyChip } from '../TaxonomyChip';
import type { WorkIndexItemDTO } from '@/types/dtos/public-read-models.dto';

interface WorkCardProps {
  project: WorkIndexItemDTO;
  index: number;
}

export function WorkCard({ project, index }: WorkCardProps) {
  const indexStr = String(index + 1).padStart(2, '0');

  return (
    <article className="group relative border-t border-border-subtle py-8 md:py-10 transition-colors hover:bg-surface-container/20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left Column: Index & Project Details */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">
              {indexStr} /
            </span>
            <span className="uppercase tracking-wider px-2 py-0.5 border border-border-subtle bg-surface-container text-text-primary text-[10px] font-medium">
              {project.status}
            </span>
            {project.featured && (
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 bg-surface-container-high border border-border-subtle text-text-primary">
                FEATURED
              </span>
            )}
          </div>

          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-text-primary group-hover:underline transition-all">
            <Link href={`/work/${project.slug}`} className="inline-flex items-center gap-2">
              <span>{project.title}</span>
              <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-text-primary shrink-0" />
            </Link>
          </h2>

          {project.shortDescription && (
            <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl">
              {project.shortDescription}
            </p>
          )}

          {/* Taxonomies */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {project.domains.map((d) => (
              <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
            ))}
            {project.technologies.map((t) => (
              <TaxonomyChip key={t.slug} label={t.name} variant="tech" color={t.color} />
            ))}
          </div>
        </div>

        {/* Right Column: Case Study Action */}
        <div className="shrink-0 flex items-start md:items-end flex-col justify-between self-stretch pt-1">
          {project.hasCaseStudy ? (
            <Link
              href={`/work/${project.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-text-primary font-semibold hover:underline uppercase tracking-wider bg-surface-container px-3.5 py-2 border border-border-subtle hover:border-text-primary transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>READ CASE STUDY &rarr;</span>
            </Link>
          ) : (
            <Link
              href={`/work/${project.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-text-primary hover:underline uppercase tracking-wider py-2"
            >
              <span>VIEW DETAILS &rarr;</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
