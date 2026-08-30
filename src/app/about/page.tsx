import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { AboutView } from '@/components/public/about/AboutView';

export const metadata: Metadata = {
  title: 'About | HZCODE — Behind HZCODE',
  description:
    'About Khalid Jundullah: Systems engineer, network architect, and Developer OS builder. Principles, working philosophy, and engineering thesis.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | HZCODE — Behind HZCODE',
    description:
      'Systems engineer, network architect, and Developer OS builder. Principles, working philosophy, and engineering thesis.',
    url: '/about',
    type: 'profile',
  },
};

export default async function AboutPage() {
  const about = await PublicReadModelsService.getAboutPublic();

  return (
    <main className="min-h-screen bg-surface-main text-text-primary pt-24 pb-32">
      <PublicContainer>
        <SectionHeader
          category="01 / OVERVIEW"
          title="Behind HZCODE."
          subtitle="I work at the intersection of technology, learning, project delivery and software — building systems, documenting what I learn, and continuously expanding how those pieces connect."
        />

        <AboutView about={about} />
      </PublicContainer>
    </main>
  );
}
