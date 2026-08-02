import { getAllProjects, getProjectBySlug, getProjectsByCategory, getFeaturedProjects } from '@/lib/content';
import { Project } from '@/types';

export const projects: Project[] = getAllProjects();
export { getProjectBySlug, getProjectsByCategory, getFeaturedProjects };
