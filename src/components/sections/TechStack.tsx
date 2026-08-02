'use client';

import {
  SiLinux,
  SiDocker,
  SiNginx,
  SiGithubactions,
  SiLaravel,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiPython,
  SiFastapi,
  SiKubernetes,
} from 'react-icons/si';
import { Network, Server, Wifi, Router, Cpu } from 'lucide-react';
import { FC, SVGProps } from 'react';

type AnyIcon = FC<SVGProps<SVGSVGElement> & { className?: string }>;

interface TechItem {
  name: string;
  icon: AnyIcon;
  color?: string;
}

const infraTech: TechItem[] = [
  { name: 'Linux',          icon: SiLinux as AnyIcon,          color: '#FCC624' },
  { name: 'Docker',         icon: SiDocker as AnyIcon,         color: '#2496ED' },
  { name: 'Nginx',          icon: SiNginx as AnyIcon,          color: '#009900' },
  { name: 'GitHub Actions', icon: SiGithubactions as AnyIcon,  color: '#2088FF' },
  { name: 'SSH / VPS',      icon: Server as AnyIcon },
];

const networkingTech: TechItem[] = [
  { name: 'MikroTik',       icon: Router as AnyIcon },
  { name: 'Cisco',          icon: Network as AnyIcon },
  { name: 'GNS3',           icon: Cpu as AnyIcon },
  { name: 'Wireshark',      icon: Wifi as AnyIcon },
];

const webDevTech: TechItem[] = [
  { name: 'Laravel',        icon: SiLaravel as AnyIcon,        color: '#FF2D20' },
  { name: 'Next.js',        icon: SiNextdotjs as AnyIcon,      color: '#ffffff' },
  { name: 'React',          icon: SiReact as AnyIcon,          color: '#61DAFB' },
  { name: 'TypeScript',     icon: SiTypescript as AnyIcon,     color: '#3178C6' },
];

const aiTech: TechItem[] = [
  { name: 'Python',         icon: SiPython as AnyIcon,         color: '#3776AB' },
  { name: 'FastAPI',        icon: SiFastapi as AnyIcon,        color: '#009688' },
  { name: 'Gemini AI',      icon: Cpu as AnyIcon },
  { name: 'HuggingFace',    icon: SiKubernetes as AnyIcon,     color: '#326CE5' },
];

interface PillarRowProps {
  label: string;
  color: string;
  items: TechItem[];
  reverse?: boolean;
}

function PillarRow({ label, color, items, reverse }: PillarRowProps) {
  const doubled = [...items, ...items];
  return (
    <div>
      <p className={`font-mono text-xs ${color} mb-3 tracking-widest uppercase`}>
        // {label}
      </p>
      <div className="relative overflow-hidden">
        <div
          className="flex gap-4 animate-marquee"
          style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {doubled.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div
                key={`${tech.name}-${idx}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border border-terminal-border bg-terminal-surface rounded hover:border-terminal-text-muted transition-colors"
              >
                <Icon
                  className="w-5 h-5 text-terminal-text-secondary flex-shrink-0"
                  style={tech.color ? { color: tech.color } : undefined}
                />
                <span className="font-mono text-xs text-terminal-text-secondary whitespace-nowrap">
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * TechStack section — four pillars with marquee rows
 */
export function TechStack() {
  return (
    <section className="py-20 border-y border-terminal-border bg-terminal-surface/30">
      <div className="max-w-7xl mx-auto px-6">
        <p className="font-mono text-terminal-primary text-sm mb-2">
          $ lsmod --tech-stack
        </p>
        <h2 className="font-mono text-2xl md:text-3xl text-terminal-text-primary mb-12">
          Technology Stack
        </h2>

        <div className="space-y-10">
          <PillarRow label="Infrastructure"  color="text-terminal-accent"     items={infraTech} />
          <PillarRow label="Networking"      color="text-terminal-secondary"  items={networkingTech} reverse />
          <PillarRow label="Web Development" color="text-terminal-primary"    items={webDevTech} />
          <PillarRow label="AI / ML"         color="text-terminal-purple"     items={aiTech} reverse />
        </div>
      </div>
    </section>
  );
}
