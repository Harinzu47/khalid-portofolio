import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { WorkClient } from '@/components/public/work/WorkClient';

export const metadata: Metadata = {
  title: 'Work | HZCODE',
  description:
    'Production systems, cloud infrastructure architectures, distributed services, and engineering case studies delivered by Khalid Jundullah.',
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: 'Work | HZCODE — Engineering Systems & Architectures',
    description:
      'Production systems, cloud infrastructure architectures, distributed services, and engineering case studies.',
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
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-20">
      <PublicContainer>
        <SectionHeader
          category="WORK ARCHIVE"
          title="Engineered Systems & Delivered Work"
          subtitle="Production systems, cloud infrastructure architectures, distributed services, and technical case studies."
          badge={`TOTAL: ${projects.length}`}
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
