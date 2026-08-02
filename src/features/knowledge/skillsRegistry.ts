import { SkillNode } from './types';

/**
 * Enterprise Skill Registry Definition
 */
export const skillsRegistry: SkillNode[] = [
  // Infrastructure
  { id: 'skill-linux',          name: 'Linux Administration', category: 'infrastructure', level: 'advanced' },
  { id: 'skill-docker',         name: 'Docker & Containerization', category: 'infrastructure', level: 'advanced' },
  { id: 'skill-cicd',           name: 'CI/CD Pipelines (GitHub Actions)', category: 'infrastructure', level: 'intermediate' },
  { id: 'skill-nginx',          name: 'Nginx & Web Servers',  category: 'infrastructure', level: 'intermediate' },

  // Networking
  { id: 'skill-mikrotik',       name: 'MikroTik RouterOS (MTCNA)', category: 'networking', level: 'advanced' },
  { id: 'skill-vlan',           name: 'VLAN & 802.1Q Segmentation', category: 'networking', level: 'advanced' },
  { id: 'skill-ospf',           name: 'OSPF & Dynamic Routing', category: 'networking', level: 'intermediate' },
  { id: 'skill-wireshark',      name: 'Packet Analysis (Wireshark)', category: 'networking', level: 'intermediate' },

  // Languages & Web Frameworks
  { id: 'skill-laravel',        name: 'Laravel & TALL Stack', category: 'frameworks', level: 'advanced' },
  { id: 'skill-nextjs',         name: 'Next.js App Router',   category: 'frameworks', level: 'advanced' },
  { id: 'skill-react',          name: 'React 19 & Components', category: 'frameworks', level: 'advanced' },
  { id: 'skill-typescript',     name: 'TypeScript & Type Systems', category: 'languages', level: 'advanced' },
  { id: 'skill-python',         name: 'Python',                category: 'languages', level: 'intermediate' },
  { id: 'skill-fastapi',        name: 'FastAPI Microservices',category: 'frameworks', level: 'intermediate' },

  // Databases & Storage
  { id: 'skill-mysql',          name: 'MySQL Database',       category: 'databases', level: 'intermediate' },
  { id: 'skill-redis',          name: 'Redis In-Memory Caching', category: 'databases', level: 'intermediate' },

  // AI & Security
  { id: 'skill-gemini-ai',      name: 'Google Gemini API & AI',category: 'ai',        level: 'intermediate' },
  { id: 'skill-web-security',   name: 'Web Application Security', category: 'infrastructure', level: 'intermediate' },
];

export function getSkillById(id: string): SkillNode | undefined {
  return skillsRegistry.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
}

export function getSkillsByCategory(category: SkillNode['category']): SkillNode[] {
  return skillsRegistry.filter((s) => s.category === category);
}
