import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { ExpertiseView } from '@/components/public/expertise/ExpertiseView';

export const metadata: Metadata = {
  title: 'Expertise | HZCODE — Demonstrable Capabilities',
  description:
    'Demonstrable engineering capabilities across cloud infrastructure, distributed systems, network architecture, and developer operating systems backed by verified production evidence.',
  alternates: {
    canonical: '/expertise',
  },
  openGraph: {
    title: 'Expertise | HZCODE — Demonstrable Capabilities',
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
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer>
        <SectionHeader
          category="01 / DEMONSTRABLE CAPABILITIES"
          title="Engineering Expertise & Systems Surface."
          subtitle="Concrete capabilities substantiated by production systems, organizational responsibility, architectural decision records, and technical essays."
          badge={`${totalCapabilities} CAPABILITIES`}
        />

        <ExpertiseView expertise={expertise} />
      </PublicContainer>
    </main>
  );
}
