import type { Metadata } from 'next';
import { projects } from '@/data/projects';
import ProjectPageClient from './ProjectPageClient';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate metadata for the project page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} | hzcode`,
    description: project.shortDescription,
  };
}

/**
 * Generate static params for all projects
 */
export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

/**
 * Project detail page - Server Component wrapper
 */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return <ProjectPageClient project={project} />;
}
