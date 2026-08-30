import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { WorkClient } from '@/components/public/work/WorkClient';

export const metadata: Metadata = {
  title: 'Work | HZCODE — Systems I\'ve Built',
  description:
    'A catalog of systems, production environments, and fullstack tools engineered for performance, reliability, and scale by Khalid Jundullah.',
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: 'Work | HZCODE — Systems I\'ve Built',
    description:
      'A catalog of systems, production environments, and fullstack tools engineered for performance, reliability, and scale.',
    url: '/work',
    type: 'website',
  },
};

interface WorkPageProps {
  searchParams: Promise<{
    pillar?: string;
    search?: string;
  }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const { pillar, search } = await searchParams;
  const projects = await PublicReadModelsService.getWorkIndex({ pillar, search });

  return (
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer>
        <SectionHeader
          category="01 / WORK ARCHIVE"
          title="Systems I've Built."
          subtitle="A catalog of systems, production environments, and fullstack tools engineered for performance, reliability, and scale."
          badge={`${projects.length} PROJECTS`}
        />

        <WorkClient
          initialProjects={projects}
          currentPillar={pillar}
          currentSearch={search}
        />
      </PublicContainer>
    </main>
  );
}
