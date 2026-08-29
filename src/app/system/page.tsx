import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { KnowledgeHubClient } from '@/components/public/system/KnowledgeHubClient';

export const metadata: Metadata = {
  title: 'System | HZCODE Knowledge Hub',
  description:
    'Learning in public: Technical essays, verified engineering notes, architecture decision records, and development investigations by Khalid Jundullah.',
  alternates: {
    canonical: '/system',
  },
  openGraph: {
    title: 'System | HZCODE — Engineering Knowledge Hub',
    description:
      'Technical essays, verified engineering notes, architecture decision records, and development logs.',
    url: '/system',
    type: 'website',
  },
};

interface SystemPageProps {
  searchParams: Promise<{
    type?: string;
    domain?: string;
    technology?: string;
    tag?: string;
    q?: string;
  }>;
}

export default async function SystemPage({ searchParams }: SystemPageProps) {
  const { type, domain, technology, tag, q } = await searchParams;
  const items = await PublicReadModelsService.getKnowledgeHub({
    type,
    domain,
    technology,
    tag,
    q,
  });

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer>
        <SectionHeader
          category="KNOWLEDGE SYSTEM"
          title="Learning in Public & Technical Synthesis"
          subtitle="Long-form architectural essays, concise operational tech notes, architectural decision records (ADRs), and daily engineering logs."
          badge={`ARTIFACTS: ${items.length}`}
        />

        <KnowledgeHubClient
          initialItems={items}
          currentType={type}
          currentSearch={q}
        />
      </PublicContainer>
    </main>
  );
}
