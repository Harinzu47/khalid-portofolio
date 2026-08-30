import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { NowView } from '@/components/public/now/NowView';

export const metadata: Metadata = {
  title: 'Now | HZCODE — Live Focus & Attention',
  description:
    'What currently has attention: Active engineering projects, learning tracks, technical research, and current reading by Khalid Jundullah.',
  alternates: {
    canonical: '/now',
  },
  openGraph: {
    title: 'Now | HZCODE — Live Focus & Attention',
    description:
      'What currently has attention: Active engineering, learning, research, and focus streams.',
    url: '/now',
    type: 'website',
  },
};

export default async function NowPage() {
  const nowData = await PublicReadModelsService.getNowPublic();

  return (
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer>
        <SectionHeader
          category="01 / NOW"
          title="What Has My Attention Right Now."
          subtitle="A living snapshot of what I’m building, learning, managing, researching and thinking about across distributed systems and technical education."
          badge={
            nowData.lastUpdated
              ? `UPDATED: ${new Date(nowData.lastUpdated).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}`
              : 'LIVE STATE'
          }
        />

        <NowView nowData={nowData} />
      </PublicContainer>
    </main>
  );
}
