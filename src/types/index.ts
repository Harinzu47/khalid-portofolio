/**
 * Project pillar categories — four pillars of hzcode
 */
export type ProjectCategory = 'Infra' | 'Networking' | 'Web Dev' | 'AI';

/**
 * Project interface with all required fields
 */
export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  fullContent: string;
  technologies: string[];
  category: ProjectCategory;
  image?: string;
  github?: string;
  demo?: string;
  year?: number;
}

/**
 * Skill data for visualization
 */
export interface SkillData {
  category: string;
  level: number;
}

/**
 * Journal / blog post
 */
export interface JournalPost {
  slug: string;
  title: string;
  date: string;          // ISO date string e.g. "2025-11-15"
  tags: string[];
  readTime: string;      // e.g. "~5 min"
  excerpt: string;
  content: string;       // Markdown body
}
