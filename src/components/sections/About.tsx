'use client';

import { SkillsChart } from './SkillsChart';

/**
 * About section with bio and skills visualization
 */
export function About() {
  return (
    <section className="py-20" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            About Me
          </span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Bio Text */}
          <div className="space-y-6">
            <p className="text-slate-300 text-lg leading-relaxed">
              I'm a <span className="text-blue-400 font-semibold">Fullstack Developer</span> and{' '}
              <span className="text-purple-400 font-semibold">Data Scientist</span> with a passion
              for building scalable web applications and extracting actionable insights from data.
            </p>
            <p className="text-slate-400 leading-relaxed">
              On the software side, I specialize in creating modern web applications using{' '}
              <strong className="text-white">React, Next.js, and Laravel</strong>. I focus on
              building intuitive user interfaces and robust backend systems that scale.
            </p>
            <p className="text-slate-400 leading-relaxed">
              In data science, I leverage <strong className="text-white">Python, TensorFlow, and
              machine learning algorithms</strong> to solve complex problems. From predictive
              modeling to data visualization, I turn raw data into strategic advantages.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">5+</p>
                <p className="text-sm text-slate-400">Years Experience</p>
              </div>
              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">20+</p>
                <p className="text-sm text-slate-400">Projects Completed</p>
              </div>
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-2xl font-bold text-green-400">10+</p>
                <p className="text-sm text-slate-400">Technologies</p>
              </div>
            </div>
          </div>

          {/* Skills Chart */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Skills Distribution
            </h3>
            <SkillsChart />
          </div>
        </div>
      </div>
    </section>
  );
}
