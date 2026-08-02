import type { Metadata } from 'next';
import { ProjectsGrid } from '@/components/sections/ProjectsGrid';

export const metadata: Metadata = {
  title: 'Projects | hzcode',
  description:
    'Browse hzcode projects across four pillars: Infrastructure, Networking, Web Development, and AI.',
};

/**
 * /projects — standalone project listing page
 */
export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-terminal-bg pt-20">
      <ProjectsGrid />
    </main>
  );
}
