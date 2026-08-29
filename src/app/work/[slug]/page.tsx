import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { ProjectDetailView } from '@/components/public/work/ProjectDetailView';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await PublicReadModelsService.getProjectDetailBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | HZCODE',
    };
  }

  const title = `${project.title} | HZCODE Work`;
  const description = project.shortDescription || project.description || `Engineering case study for ${project.title}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    robots: project.isUnlisted ? { index: false, follow: false } : undefined, // Amendment 27
    openGraph: {
      title,
      description,
      url: `/work/${project.slug}`,
      type: 'article',
      publishedTime: project.publishedAt || undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await PublicReadModelsService.getProjectDetailBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer>
        <ProjectDetailView project={project} />
      </PublicContainer>
    </main>
  );
}
