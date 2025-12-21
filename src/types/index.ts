/**
 * Project category types
 */
export type ProjectCategory = 'Web Dev' | 'Data Science';

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
