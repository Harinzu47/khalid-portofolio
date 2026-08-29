import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { SectionHeader } from '@/components/public/SectionHeader';
import { AboutView } from '@/components/public/about/AboutView';

export const metadata: Metadata = {
  title: 'About | HZCODE',
  description:
    'About Khalid Jundullah: Systems engineer, network architect, and Developer OS builder. Principles, working philosophy, and engineering thesis.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | HZCODE — Engineering Identity & System Thesis',
    description:
      'Systems engineer, network architect, and Developer OS builder. Principles, working philosophy, and engineering thesis.',
    url: '/about',
    type: 'profile',
  },
};

export default async function AboutPage() {
  const about = await PublicReadModelsService.getAboutPublic();

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-24 pb-24">
      <PublicContainer>
        <SectionHeader
          category="SYSTEM ARCHITECT"
          title="Identity, Principles & Engineering Thesis"
          subtitle="Engineering philosophy, operating principles, and system background behind HZCODE and Khalid Jundullah."
        />

        <AboutView about={about} />
      </PublicContainer>
    </main>
  );
}
