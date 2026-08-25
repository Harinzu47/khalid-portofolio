import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticlesService } from '@/services/articles.service';
import { calculateReadingTime } from '@/lib/reading-time';
import { FileText, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Technical Articles & Deep-Dives | Khalid',
  description:
    'In-depth engineering essays, system architecture breakdowns, database optimization notes, and network design patterns.',
};

export const dynamic = 'force-dynamic';

type ArticleWithRelations = Awaited<ReturnType<typeof ArticlesService.getPublicArticles>>['data'][number];

export default async function ArticlesPage() {
  let articlesList: ArticleWithRelations[] = [];
  try {
    const result = await ArticlesService.getPublicArticles({ page: 1, pageSize: 20 });
    articlesList = result.data;
  } catch (err) {
    console.error('Failed to load public articles:', err);
  }

  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-terminal-secondary font-mono text-xs">
            <FileText className="w-4 h-4" />
            <span>knowledge.publications</span>
          </div>
          <h1 className="text-3xl font-bold font-mono text-terminal-text-primary tracking-tight">
            Technical Articles
          </h1>
          <p className="text-sm font-mono text-terminal-text-secondary leading-relaxed max-w-2xl">
            Deep technical investigations, architectural decision records, and production post-mortems.
          </p>
        </div>

        {/* Articles List */}
        {articlesList.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-terminal-border bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-2">
            <p>No technical articles published yet.</p>
            <p className="text-[11px]">Check back soon for new systems engineering writeups.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articlesList.map((article) => {
              const readingTime = calculateReadingTime(article.content);
              return (
                <article
                  key={article.id}
                  className="p-6 rounded-lg border border-terminal-border bg-terminal-surface hover:border-terminal-secondary/60 hover:bg-terminal-surface-alt/40 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-terminal-text-muted">
                      <div className="flex items-center space-x-3">
                        <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft'}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{readingTime} min read</span>
                        </span>
                      </div>
                      {article.featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-terminal-secondary/15 text-terminal-secondary border border-terminal-secondary/30">
                          featured
                        </span>
                      )}
                    </div>

                    <Link href={`/articles/${article.slug}`}>
                      <h2 className="text-lg font-bold font-mono text-terminal-text-primary group-hover:text-terminal-secondary transition-colors">
                        {article.title}
                      </h2>
                    </Link>

                    {article.excerpt && (
                      <p className="text-xs font-mono text-terminal-text-secondary leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.map((at) => (
                          <span
                            key={at.tag.id}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted"
                          >
                            #{at.tag.name}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/articles/${article.slug}`}
                        className="inline-flex items-center space-x-1 text-xs font-mono text-terminal-primary hover:underline"
                      >
                        <span>Read article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
