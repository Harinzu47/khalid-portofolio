'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/data/projects';
import { Card } from '@/components/ui/Card';
import { ProjectCategory } from '@/types';
import { ArrowRight } from 'lucide-react';

type FilterOption = 'All' | ProjectCategory;

// Category colors for labels and backgrounds
const categoryStyle: Record<string, { text: string; border: string }> = {
  'Infra':      { text: 'text-terminal-accent',     border: 'border-terminal-accent/40' },
  'Networking': { text: 'text-terminal-secondary',  border: 'border-terminal-secondary/40' },
  'Web Dev':    { text: 'text-terminal-primary',    border: 'border-terminal-primary/40' },
  'AI':         { text: 'text-terminal-purple',     border: 'border-terminal-purple/40' },
};

// Filter pill data
const filters: { option: FilterOption; flag: string }[] = [
  { option: 'All',        flag: '--all' },
  { option: 'Infra',      flag: '--infra' },
  { option: 'Networking', flag: '--networking' },
  { option: 'Web Dev',    flag: '--web' },
  { option: 'AI',         flag: '--ai' },
];

/**
 * Projects grid — CLI flag filters + terminal-styled cards
 */
export function ProjectsGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section className="py-20" id="projects">
      <div className="max-w-7xl mx-auto px-6">
        <p className="font-mono text-terminal-primary text-sm mb-2">
          $ ls projects/ --featured
        </p>
        <h2 className="font-mono text-2xl md:text-3xl text-terminal-text-primary mb-4">
          Projects
        </h2>
        <p className="text-terminal-text-secondary mb-10 max-w-2xl">
          A collection of work across four pillars — Infrastructure, Networking, Web Dev, and AI.
        </p>

        {/* Filter row — CLI flags */}
        <div className="flex flex-wrap gap-2 mb-12 font-mono text-xs">
          {filters.map(({ option, flag }) => (
            <button
              key={option}
              data-category={option}
              onClick={() => setActiveFilter(option)}
              className={`px-3 py-1.5 rounded border transition-colors ${
                activeFilter === option
                  ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/10'
                  : 'border-terminal-border text-terminal-text-muted hover:border-terminal-text-muted hover:text-terminal-text-secondary'
              }`}
            >
              {flag}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const catStyle = categoryStyle[project.category] ?? {
              text: 'text-terminal-text-secondary',
              border: 'border-terminal-border',
            };

            return (
              <Link key={project.slug} href={`/projects/${project.slug}`} className="group">
                <Card className="h-full flex flex-col overflow-hidden p-0">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden border-b border-terminal-border">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale-[20%]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-terminal-bg flex items-center justify-center">
                        <span className={`font-mono text-4xl ${catStyle.text} opacity-30`}>
                          {project.category === 'Infra'      && '[srv]'}
                          {project.category === 'Networking' && '[net]'}
                          {project.category === 'Web Dev'    && '[web]'}
                          {project.category === 'AI'         && '[ai]'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    {/* Category + year */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`font-mono text-xs border px-2 py-0.5 rounded ${catStyle.text} ${catStyle.border}`}
                      >
                        {project.category}
                      </span>
                      {project.year && (
                        <span className="font-mono text-xs text-terminal-text-muted">
                          {project.year}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-mono text-base text-terminal-text-primary mb-2 group-hover:text-terminal-secondary transition-colors">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-terminal-text-secondary text-sm mb-4 flex-grow leading-relaxed">
                      {project.shortDescription}
                    </p>

                    {/* Tech chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-xs px-2 py-0.5 border border-terminal-border text-terminal-text-muted rounded bg-terminal-bg"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="font-mono text-xs px-2 py-0.5 border border-terminal-border text-terminal-text-muted rounded bg-terminal-bg">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Link */}
                    <div className="flex items-center gap-1.5 text-terminal-secondary font-mono text-xs group-hover:gap-2.5 transition-all">
                      <span>&gt; view case study</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="font-mono text-terminal-text-muted text-sm">
              No projects found for this filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
