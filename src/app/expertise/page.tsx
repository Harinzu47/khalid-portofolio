import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { ExpertiseView } from '@/components/public/expertise/ExpertiseView';

export const metadata: Metadata = {
  title: 'Expertise | HZCODE',
  description:
    'Demonstrable engineering capabilities across cloud infrastructure, distributed systems, network architecture, and developer operating systems backed by verified production evidence.',
  alternates: {
    canonical: '/expertise',
  },
  openGraph: {
    title: 'Expertise | HZCODE — Evidence-Backed Engineering Capabilities',
    description:
      'Demonstrable engineering capabilities backed by verified production projects, experience, and knowledge records.',
    url: '/expertise',
    type: 'website',
  },
};

export default async function ExpertisePage() {
  const expertise = await PublicReadModelsService.getExpertiseReadModel();
  const totalCapabilities =
    expertise.domains.length + expertise.technologies.length + expertise.skills.length;

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer>
        <SectionHeader
          category="DEMONSTRABLE CAPABILITIES"
          title="Evidence-Backed Engineering Expertise"
          subtitle="Concrete capabilities substantiated by production systems, organizational responsibility, architectural decision records, and technical essays."
          badge={`CAPABILITIES: ${totalCapabilities}`}
        />

        <ExpertiseView expertise={expertise} />
      </PublicContainer>
    </main>
  );
}
