'use client';

import { SkillsChart } from './SkillsChart';

const stats = [
  { value: 'MTCNA', label: 'Certified', color: 'text-terminal-secondary' },
  { value: '11+',   label: 'Projects',  color: 'text-terminal-primary' },
  { value: '4',     label: 'Pillars',   color: 'text-terminal-purple' },
];

const timeline = [
  { date: '2025', title: 'MTCNA Certified',              desc: 'MikroTik Certified Network Associate' },
  { date: '2025', title: 'Laravel + Docker Production',  desc: 'FLC LMS — CI/CD pipeline deployed to VPS' },
  { date: '2024', title: 'Fullstack Web Developer',      desc: 'Multiple production deployments (LMS, e-commerce)' },
  { date: '2023', title: 'Started Networking Studies',   desc: 'Universitas Muhammadiyah Jakarta, Teknik Informatika' },
  { date: '2023', title: 'First Web Project',            desc: 'Sugar Control App — HTML/CSS/JS + Spoonacular API' },
];

/**
 * About section — bio, skills matrix, experience timeline
 */
export function About() {
  return (
    <section className="py-20" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <p className="font-mono text-terminal-primary text-sm mb-2">
          $ cat about.md
        </p>
        <h2 className="font-mono text-2xl md:text-3xl text-terminal-text-primary mb-12">
          About Me
        </h2>

        <div className="grid md:grid-cols-2 gap-14 items-start">

          {/* Bio */}
          <div className="space-y-6">
            <p className="text-terminal-text-secondary leading-relaxed">
              I&apos;m a{' '}
              <span className="text-terminal-secondary font-medium">Network &amp; Infrastructure Engineer</span>{' '}
              (MTCNA certified) based in Jakarta, Indonesia, actively expanding into{' '}
              <span className="text-terminal-primary font-medium">fullstack web development</span>{' '}
              and AI-powered applications.
            </p>
            <p className="text-terminal-text-secondary leading-relaxed">
              My work spans four pillars:{' '}
              <span className="text-terminal-accent">Infrastructure</span> (Docker, Nginx, CI/CD),{' '}
              <span className="text-terminal-secondary">Networking</span> (MikroTik RouterOS, OSPF, VLAN),{' '}
              <span className="text-terminal-primary">Web Dev</span> (Laravel, Next.js), and{' '}
              <span className="text-terminal-purple">AI</span> (FastAPI + Gemini AI).
            </p>
            <p className="text-terminal-text-secondary leading-relaxed">
              I document what I learn in my{' '}
              <a href="/journal" className="text-terminal-secondary hover:underline">
                journal
              </a>{' '}
              — fixes, setup guides, exam notes, and ops learnings from real projects.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 pt-2">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="px-4 py-3 border border-terminal-border bg-terminal-surface rounded"
                >
                  <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="font-mono text-xs text-terminal-text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="pt-4">
              <p className="font-mono text-terminal-text-muted text-xs uppercase tracking-widest mb-4">
                // experience &amp; certifications
              </p>
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="font-mono text-xs text-terminal-text-muted pt-0.5 whitespace-nowrap">
                      [{item.date}]
                    </span>
                    <div>
                      <p className="font-mono text-sm text-terminal-text-primary">
                        <span className="text-terminal-primary mr-1">&gt;</span>
                        {item.title}
                      </p>
                      <p className="text-xs text-terminal-text-secondary mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Matrix */}
          <div className="border border-terminal-border bg-terminal-surface rounded p-6">
            <p className="font-mono text-terminal-text-muted text-xs uppercase tracking-widest mb-6">
              // skills matrix
            </p>
            <SkillsChart />
          </div>
        </div>
      </div>
    </section>
  );
}
