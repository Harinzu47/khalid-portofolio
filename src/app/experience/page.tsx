import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { ExperienceTimelineView } from '@/components/public/experience/ExperienceTimelineView';

export const metadata: Metadata = {
  title: 'Experience | HZCODE',
  description:
    'Professional career trajectory, organizational scope, distributed infrastructure leadership, and delivered engineering outcomes owned by Khalid Jundullah.',
  alternates: {
    canonical: '/experience',
  },
  openGraph: {
    title: 'Experience | HZCODE — Career Evolution & Engineering Leadership',
    description:
      'Professional career trajectory, organizational scope, and delivered engineering outcomes.',
    url: '/experience',
    type: 'profile',
  },
};

export default async function ExperiencePage() {
  const { experiences } = await PublicReadModelsService.getExperienceTimeline();

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer>
        <SectionHeader
          category="CAREER TRAJECTORY"
          title="Professional Experience & Responsibility"
          subtitle="Evolution of technical responsibility, infrastructure ownership, distributed systems architecture, and engineering leadership."
          badge={`POSITIONS: ${experiences.length}`}
        />

        <ExperienceTimelineView experiences={experiences} />
      </PublicContainer>
    </main>
  );
}
