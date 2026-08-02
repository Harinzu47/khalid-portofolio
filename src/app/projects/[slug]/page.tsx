import type { Metadata } from 'next';
import { getAllProjects, getProjectBySlug } from '@/lib/content';
import ProjectPageClient from './ProjectPageClient';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | hzcode',
    };
  }

  return {
    title: `${project.title} | hzcode`,
    description: project.shortDescription,
  };
}

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const allProjects = getAllProjects();
  const currentIdx = allProjects.findIndex((p) => p.slug === slug);
  const prevProject = currentIdx > 0 ? allProjects[currentIdx - 1] : null;
  const nextProject = currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] : null;

  return (
    <ProjectPageClient
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}
