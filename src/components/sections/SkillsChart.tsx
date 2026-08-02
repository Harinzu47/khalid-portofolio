'use client';

interface SkillRow {
  category: string;
  tools: string;
  level: string;
  levelColor: string;
}

const skillsMatrix: SkillRow[] = [
  {
    category:   'Infrastructure',
    tools:      'Linux, Docker, Nginx, GitHub Actions, SSH/VPS',
    level:      'Proficient',
    levelColor: 'text-terminal-primary border-terminal-primary/40',
  },
  {
    category:   'Networking',
    tools:      'MikroTik RouterOS, Cisco, GNS3, VLAN, OSPF, BGP',
    level:      'MTCNA',
    levelColor: 'text-terminal-secondary border-terminal-secondary/40',
  },
  {
    category:   'Web Dev',
    tools:      'Laravel, Next.js, React, PHP, TypeScript, Livewire',
    level:      'Proficient',
    levelColor: 'text-terminal-primary border-terminal-primary/40',
  },
  {
    category:   'AI / ML',
    tools:      'Python, FastAPI, Gemini AI, Hugging Face, BERT',
    level:      'Learning',
    levelColor: 'text-terminal-text-muted border-terminal-border',
  },
  {
    category:   'Database',
    tools:      'MySQL, PostgreSQL, Redis, Supabase, SQLite',
    level:      'Proficient',
    levelColor: 'text-terminal-primary border-terminal-primary/40',
  },
  {
    category:   'DevOps',
    tools:      'Docker Compose, CI/CD, Certbot, Cloudflare, Let\'s Encrypt',
    level:      'Proficient',
    levelColor: 'text-terminal-primary border-terminal-primary/40',
  },
];

/**
 * Skills matrix — flat terminal table replacing the Nivo radar chart
 */
export function SkillsChart() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr className="border-b border-terminal-border">
            <th className="text-left py-3 pr-6 text-terminal-text-muted font-normal tracking-wider text-xs uppercase">
              Category
            </th>
            <th className="text-left py-3 pr-6 text-terminal-text-muted font-normal tracking-wider text-xs uppercase">
              Tools &amp; Technologies
            </th>
            <th className="text-left py-3 text-terminal-text-muted font-normal tracking-wider text-xs uppercase">
              Level
            </th>
          </tr>
        </thead>
        <tbody>
          {skillsMatrix.map((row, idx) => (
            <tr
              key={row.category}
              className={`border-b border-terminal-border/50 ${
                idx % 2 === 0 ? 'bg-terminal-bg/50' : 'bg-terminal-surface/50'
              }`}
            >
              <td className="py-3 pr-6 text-terminal-text-primary whitespace-nowrap">
                {row.category}
              </td>
              <td className="py-3 pr-6 text-terminal-text-secondary leading-relaxed">
                {row.tools}
              </td>
              <td className="py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${row.levelColor}`}
                >
                  {row.level}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
