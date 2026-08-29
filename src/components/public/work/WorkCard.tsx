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
    <article className="group relative border-t border-b border-terminal-border py-8 transition-colors hover:bg-terminal-surface/30">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left Column: Index & Project Details */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs text-terminal-primary">
              [{indexStr}/]
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 border border-terminal-border text-terminal-text-muted">
              {project.status}
            </span>
            {project.featured && (
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 bg-terminal-primary/10 text-terminal-primary border border-terminal-primary/30">
                FEATURED
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-terminal-text-primary group-hover:text-terminal-primary transition-colors">
            <Link href={`/work/${project.slug}`} className="flex items-center gap-2">
              <span>{project.title}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-terminal-primary shrink-0" />
            </Link>
          </h2>

          {project.shortDescription && (
            <p className="mt-3 text-sm md:text-base text-terminal-text-secondary leading-relaxed max-w-3xl">
              {project.shortDescription}
            </p>
          )}

          {/* Taxonomies */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {project.domains.map((d) => (
              <TaxonomyChip key={d.slug} label={d.name} variant="domain" color={d.color} />
            ))}
            {project.technologies.map((t) => (
              <TaxonomyChip key={t.slug} label={t.name} variant="tech" color={t.color} />
            ))}
          </div>
        </div>

        {/* Right Column: Case Study Action */}
        <div className="shrink-0 flex items-center md:items-end flex-col justify-between self-stretch pt-1">
          {project.hasCaseStudy ? (
            <Link
              href={`/work/${project.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-primary hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>READ CASE STUDY &rarr;</span>
            </Link>
          ) : (
            <Link
              href={`/work/${project.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-text-muted hover:text-terminal-text-primary"
            >
              <span>VIEW DETAILS &rarr;</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
