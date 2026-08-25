import React from 'react';
import { CareerService } from '@/services/career.service';
import { Briefcase, Building2, MapPin, Calendar } from 'lucide-react';

type CareerExperienceWithOrg = Awaited<ReturnType<typeof CareerService.getPublicCareerTimeline>>[number];

export async function CareerTimeline() {
  let experiences: CareerExperienceWithOrg[] = [];
  try {
    experiences = await CareerService.getPublicCareerTimeline();
  } catch (err) {
    console.error('Failed to load career timeline:', err);
  }

  if (experiences.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center space-x-2 text-terminal-primary font-mono text-xs">
        <Briefcase className="w-4 h-4" />
        <span>career.timeline</span>
      </div>

      <div className="relative border-l-2 border-terminal-border ml-3 sm:ml-4 pl-6 sm:pl-8 space-y-8">
        {experiences.map((exp) => (
          <div key={exp.id} className="relative group">
            {/* Timeline Node */}
            <div
              className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-terminal-bg ${
                exp.isCurrent ? 'bg-terminal-primary animate-pulse' : 'bg-terminal-border'
              }`}
            />

            <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface hover:border-terminal-primary/40 transition-colors space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-base font-bold font-mono text-terminal-text-primary">
                  {exp.position}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted">
                  <Calendar className="w-3 h-3 text-terminal-secondary" />
                  <span>
                    {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-terminal-text-secondary">
                <span className="flex items-center space-x-1 text-terminal-secondary font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{exp.organization.name}</span>
                </span>
                {exp.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-terminal-text-muted">
                      <MapPin className="w-3 h-3" />
                      <span>{exp.location}</span>
                    </span>
                  </>
                )}
                {exp.employmentType && (
                  <>
                    <span>•</span>
                    <span className="text-terminal-text-muted">{exp.employmentType}</span>
                  </>
                )}
              </div>

              {exp.description && (
                <div className="text-xs font-mono text-terminal-text-secondary leading-relaxed pt-2 border-t border-terminal-border/60 whitespace-pre-wrap">
                  {exp.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
