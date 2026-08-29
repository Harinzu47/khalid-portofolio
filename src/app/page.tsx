import type { Metadata } from 'next';
import { PublicReadModelsService } from '@/services/public-read-models.service';
import { PublicContainer } from '@/components/public/PublicContainer';
import { HomeView } from '@/components/public/home/HomeView';

export const metadata: Metadata = {
  title: 'HZCODE — Systems Engineer & Developer OS Architect',
  description:
    'Personal Developer OS and public knowledge system of Khalid Jundullah. Production engineering systems, distributed architectures, and technical synthesis.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HZCODE — Systems Engineer & Developer OS Architect',
    description:
      'Personal Developer OS and public knowledge system of Khalid Jundullah. Production engineering systems, distributed architectures, and technical synthesis.',
    url: '/',
    type: 'website',
  },
};

export default async function HomePage() {
  const homeData = await PublicReadModelsService.getHomePublic();

  return (
    <main className="min-h-screen bg-terminal-bg text-terminal-text-primary pt-20 pb-24">
      <PublicContainer>
        <HomeView data={homeData} />
      </PublicContainer>
    </main>
  );
}
