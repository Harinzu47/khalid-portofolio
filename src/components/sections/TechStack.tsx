'use client';

import { 
  SiNextdotjs, 
  SiReact, 
  SiLaravel, 
  SiPostgresql, 
  SiTypescript, 
  SiTailwindcss,
  SiPython,
  SiPandas,
  SiTensorflow,
  SiScikitlearn,
  SiNumpy
} from 'react-icons/si';
import { Database } from 'lucide-react';
import { IconType } from 'react-icons';

/**
 * Tech Stack section with marquee animation
 */
export function TechStack() {
  const engineeringTech: { name: string; icon: IconType }[] = [
    { name: 'Next.js', icon: SiNextdotjs },
    { name: 'React', icon: SiReact },
    { name: 'Laravel', icon: SiLaravel },
    { name: 'PostgreSQL', icon: SiPostgresql },
    { name: 'TypeScript', icon: SiTypescript },
    { name: 'Tailwind', icon: SiTailwindcss },
  ];

  const dataScienceTech: { name: string; icon: IconType }[] = [
    { name: 'Python', icon: SiPython },
    { name: 'Pandas', icon: SiPandas },
    { name: 'TensorFlow', icon: SiTensorflow },
    { name: 'SQL', icon: Database as IconType },
    { name: 'Scikit-learn', icon: SiScikitlearn },
    { name: 'NumPy', icon: SiNumpy },
  ];

  return (
    <section className="py-20 bg-slate-950/50 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Technology Stack
          </span>
        </h2>

        <div className="space-y-12">
          {/* Engineering Stack */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-4 text-center">
              Software Engineering
            </h3>
            <div className="relative overflow-hidden">
              <div className="flex gap-8 animate-marquee">
                {[...engineeringTech, ...engineeringTech].map((tech, index) => {
                  const Icon = tech.icon;
                  return (
                    <div
                      key={`eng-${index}`}
                      className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                    >
                      <Icon className="text-3xl text-slate-300" />
                      <span className="text-slate-300 font-medium whitespace-nowrap">
                        {tech.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Data Science Stack */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-4 text-center">
              Data Science & ML
            </h3>
            <div className="relative overflow-hidden">
              <div className="flex gap-8 animate-marquee" style={{ animationDirection: 'reverse' }}>
                {[...dataScienceTech, ...dataScienceTech].map((tech, index) => {
                  const Icon = tech.icon;
                  return (
                    <div
                      key={`ds-${index}`}
                      className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                    >
                      <Icon className="text-3xl text-slate-300" />
                      <span className="text-slate-300 font-medium whitespace-nowrap">
                        {tech.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
