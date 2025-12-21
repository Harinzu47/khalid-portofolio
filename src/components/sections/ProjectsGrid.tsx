'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/data/projects';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProjectCategory } from '@/types';
import { ArrowRight } from 'lucide-react';

type FilterOption = 'All' | ProjectCategory;

/**
 * Projects grid section with category filtering
 */
export function ProjectsGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const filters: FilterOption[] = ['All', 'Web Dev', 'Data Science'];

  return (
    <section className="py-20" id="projects">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Featured Projects
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          A showcase of my work across software engineering and data science domains
        </p>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              data-category={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group"
            >
              <Card className="h-full flex flex-col overflow-hidden">
                {/* Project Thumbnail */}
                <div className="relative w-full aspect-video -mx-6 -mt-6 mb-4 overflow-hidden">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div 
                      className={`w-full h-full ${
                        project.category === 'Web Dev'
                          ? 'bg-gradient-to-br from-blue-600/30 to-blue-900/50'
                          : 'bg-gradient-to-br from-purple-600/30 to-purple-900/50'
                      }`}
                    />
                  )}
                  {/* Overlay gradient for smooth transition */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant={project.category === 'Web Dev' ? 'primary' : 'secondary'}
                  >
                    {project.category}
                  </Badge>
                  {project.year && (
                    <span className="text-sm text-slate-500">{project.year}</span>
                  )}
                </div>

                {/* Project Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>

                {/* Short Description */}
                <p className="text-slate-400 mb-6 flex-grow">
                  {project.shortDescription}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="default">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 4 && (
                    <Badge variant="default">
                      +{project.technologies.length - 4}
                    </Badge>
                  )}
                </div>

                {/* View Project Link */}
                <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">View Case Study</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No projects found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
