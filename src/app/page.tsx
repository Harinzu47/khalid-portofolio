import { Hero }           from '@/components/sections/Hero';
import { About }          from '@/components/sections/About';
import { TechStack }      from '@/components/sections/TechStack';
import { ProjectsGrid }   from '@/components/sections/ProjectsGrid';
import { JournalPreview } from '@/components/sections/JournalPreview';
import { Contact }        from '@/components/sections/Contact';

/**
 * Main landing page — hzcode.my.id
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-terminal-bg">
      <Hero />
      <About />
      <TechStack />
      <ProjectsGrid />
      <JournalPreview />
      <Contact />
    </main>
  );
}
