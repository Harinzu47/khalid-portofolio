import { TechnologyNode } from './types';

/**
 * Enterprise Technology Registry Definition
 */
export const technologyRegistry: TechnologyNode[] = [
  { id: 'nextjs',         name: 'Next.js',        category: 'web',        website: 'https://nextjs.org',          iconName: 'SiNextdotjs' },
  { id: 'react',          name: 'React',          category: 'web',        website: 'https://react.dev',           iconName: 'SiReact' },
  { id: 'typescript',     name: 'TypeScript',     category: 'web',        website: 'https://www.typescriptlang.org', iconName: 'SiTypescript' },
  { id: 'tailwind',       name: 'Tailwind CSS',   category: 'web',        website: 'https://tailwindcss.com',     iconName: 'SiTailwindcss' },
  { id: 'laravel',        name: 'Laravel',        category: 'web',        website: 'https://laravel.com',         iconName: 'SiLaravel' },
  { id: 'docker',         name: 'Docker',         category: 'infra',      website: 'https://www.docker.com',      iconName: 'SiDocker' },
  { id: 'nginx',          name: 'Nginx',          category: 'infra',      website: 'https://nginx.org',           iconName: 'SiNginx' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'infra',      website: 'https://github.com/features/actions', iconName: 'SiGithubactions' },
  { id: 'linux',          name: 'Linux',          category: 'infra',      website: 'https://www.kernel.org',      iconName: 'SiLinux' },
  { id: 'mikrotik',       name: 'MikroTik',       category: 'networking', website: 'https://mikrotik.com',        iconName: 'Router' },
  { id: 'cisco',          name: 'Cisco',          category: 'networking', website: 'https://www.cisco.com',      iconName: 'Network' },
  { id: 'gns3',           name: 'GNS3',           category: 'networking', website: 'https://www.gns3.com',       iconName: 'Cpu' },
  { id: 'wireshark',      name: 'Wireshark',      category: 'networking', website: 'https://www.wireshark.org',   iconName: 'Wifi' },
  { id: 'python',         name: 'Python',         category: 'ai',         website: 'https://www.python.org',      iconName: 'SiPython' },
  { id: 'fastapi',        name: 'FastAPI',        category: 'ai',         website: 'https://fastapi.tiangolo.com', iconName: 'SiFastapi' },
  { id: 'mysql',          name: 'MySQL',          category: 'database',   website: 'https://www.mysql.com',       iconName: 'SiMysql' },
  { id: 'postgresql',     name: 'PostgreSQL',     category: 'database',   website: 'https://www.postgresql.org',  iconName: 'SiPostgresql' },
  { id: 'redis',          name: 'Redis',          category: 'database',   website: 'https://redis.io',            iconName: 'SiRedis' },
  { id: 'cloudflare',     name: 'Cloudflare',     category: 'infra',      website: 'https://www.cloudflare.com',  iconName: 'Cloud' },
];

export function getTechnologyById(id: string): TechnologyNode | undefined {
  return technologyRegistry.find((t) => t.id === id || t.name.toLowerCase() === id.toLowerCase());
}

export function getTechnologiesByCategory(category: TechnologyNode['category']): TechnologyNode[] {
  return technologyRegistry.filter((t) => t.category === category);
}
