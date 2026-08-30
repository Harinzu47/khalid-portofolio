import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { ExperienceTimelineView } from '@/components/public/experience/ExperienceTimelineView';

export const metadata: Metadata = {
  title: 'Experience | HZCODE — Career Trajectory',
  description:
    'Professional career trajectory, organizational scope, distributed infrastructure leadership, and delivered engineering outcomes owned by Khalid Jundullah.',
  alternates: {
    canonical: '/experience',
  },
  openGraph: {
    title: 'Experience | HZCODE — Career Trajectory',
    description:
      'Professional career trajectory, organizational scope, and delivered engineering outcomes.',
    url: '/experience',
    type: 'profile',
  },
};

export default async function ExperiencePage() {
  const { experiences } = await PublicReadModelsService.getExperienceTimeline();

  return (
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer>
        <SectionHeader
          category="01 / CAREER TRAJECTORY"
          title="Career Trajectory."
          subtitle="A chronological record of engineering leadership, systems architecture, and technical execution across production environments."
          badge={`${experiences.length} ROLES`}
        />

        <ExperienceTimelineView experiences={experiences} />
      </PublicContainer>
    </main>
  );
}
