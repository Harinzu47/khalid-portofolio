import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { NowView } from '@/components/public/now/NowView';

export const metadata: Metadata = {
  title: 'Now | HZCODE',
  description:
    'What currently has attention: Active engineering projects, learning tracks, technical research, and current reading by Khalid Jundullah.',
  alternates: {
    canonical: '/now',
  },
  openGraph: {
    title: 'Now | HZCODE — Current Attention & Engineering Focus',
    description:
      'What currently has attention: Active engineering, learning, research, and focus streams.',
    url: '/now',
    type: 'website',
  },
};

export default async function NowPage() {
  const nowData = await PublicReadModelsService.getNowPublic();

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer>
        <SectionHeader
          category="CURRENT ATTENTION"
          title="What Has Attention Now"
          subtitle="A live snapshot of active building, technical research, learning tracks, and current engineering investigations."
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
