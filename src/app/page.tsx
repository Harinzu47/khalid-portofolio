import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { TechStack } from '@/components/sections/TechStack';
import { ProjectsGrid } from '@/components/sections/ProjectsGrid';
import { Contact } from '@/components/sections/Contact';

/**
 * Main landing page
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Hero />
      <About />
      <TechStack />
      <ProjectsGrid />
      <Contact />
    </main>
  );
}
