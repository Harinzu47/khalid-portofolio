import { TerminalHero } from '@/components/sections/TerminalHero';
import { SystemMetrics } from '@/components/sections/SystemMetrics';
import { About } from '@/components/sections/About';
import { TechStack } from '@/components/sections/TechStack';
import { ProjectsGrid } from '@/components/sections/ProjectsGrid';
import { CareerTimeline } from '@/components/sections/CareerTimeline';
import { Contact } from '@/components/sections/Contact';
import { getAllProjects } from '@/lib/content';
import { ArticlesService } from '@/services/articles.service';
import { JournalService } from '@/services/journal.service';
import { calculateReadingTime } from '@/lib/reading-time';
import Link from 'next/link';
import { FileText, BookOpen, ArrowRight, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

type ArticleItem = Awaited<ReturnType<typeof ArticlesService.getPublicArticles>>['data'][number];
type JournalItem = Awaited<ReturnType<typeof JournalService.getPublicJournalEntries>>['data'][number];

export default async function Home() {
  const staticProjects = getAllProjects();

  let latestArticles: ArticleItem[] = [];
  let latestJournal: JournalItem[] = [];

  try {
    const [articlesRes, journalRes] = await Promise.all([
      ArticlesService.getPublicArticles({ page: 1, pageSize: 3 }),
      JournalService.getPublicJournalEntries({ page: 1, pageSize: 3 }),
    ]);
    latestArticles = articlesRes.data;
    latestJournal = journalRes.data;
  } catch (err) {
    console.error('Failed to load live landing page content:', err);
  }

  return (
    <main className="min-h-screen bg-terminal-bg space-y-8">
      {/* 1. Terminal Hero */}
      <TerminalHero />

      {/* 2. System Status & Metrics */}
      <SystemMetrics
        counts={{
          projectsCount: staticProjects.length,
          articlesCount: latestArticles.length,
          journalCount: latestJournal.length,
          skillsCount: 16,
        }}
      />

      {/* 3. About Section */}
      <About />

      {/* 4. Skills & Tech Stack */}
      <TechStack />

      {/* 5. Featured Projects Showcase */}
      <ProjectsGrid projects={staticProjects} />

      {/* 6. Latest Technical Publications */}
      {latestArticles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-terminal-secondary font-mono text-xs">
              <FileText className="w-4 h-4" />
              <span>knowledge.publications</span>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center space-x-1 text-xs font-mono text-terminal-primary hover:underline"
            >
              <span>View all articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestArticles.map((article) => {
              const readingTime = calculateReadingTime(article.content);
              return (
                <article
                  key={article.id}
                  className="p-5 rounded-lg border border-terminal-border bg-terminal-surface hover:border-terminal-secondary/60 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-mono text-terminal-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>{readingTime}</span>
                    </div>
                    <Link href={`/articles/${article.slug}`}>
                      <h3 className="text-sm font-bold font-mono text-terminal-text-primary hover:text-terminal-secondary transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    {article.excerpt && (
                      <p className="text-xs font-mono text-terminal-text-secondary line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-terminal-border flex justify-end">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center space-x-1 text-xs font-mono text-terminal-primary hover:underline"
                    >
                      <span>Read essay</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. Engineering Journal Feed */}
      {latestJournal.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-terminal-purple font-mono text-xs">
              <BookOpen className="w-4 h-4" />
              <span>journal.recent_logs</span>
            </div>
            <Link
              href="/journal"
              className="inline-flex items-center space-x-1 text-xs font-mono text-terminal-primary hover:underline"
            >
              <span>View all logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestJournal.map((entry) => (
              <article
                key={entry.id}
                className="p-5 rounded-lg border border-terminal-border bg-terminal-surface hover:border-terminal-purple/60 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-terminal-text-muted">
                    {entry.entryDate}
                  </span>
                  <Link href={`/journal/${entry.slug}`}>
                    <h3 className="text-sm font-bold font-mono text-terminal-text-primary hover:text-terminal-purple transition-colors">
                      {entry.title}
                    </h3>
                  </Link>
                  {entry.summary && (
                    <p className="text-xs font-mono text-terminal-text-secondary line-clamp-2">
                      {entry.summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-terminal-border flex justify-end">
                  <Link
                    href={`/journal/${entry.slug}`}
                    className="inline-flex items-center space-x-1 text-xs font-mono text-terminal-primary hover:underline"
                  >
                    <span>Read log</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 8. Career Timeline */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CareerTimeline />
      </div>

      {/* 9. Contact Section */}
      <Contact />
    </main>
  );
}
