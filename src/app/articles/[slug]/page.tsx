import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticlesService } from '@/services/articles.service';
import { calculateReadingTime } from '@/lib/reading-time';
import { ArrowLeft, Clock, Calendar, Tag, FolderGit2 } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await ArticlesService.getPublicArticleBySlug(slug);
    return {
      title: `${article.seoTitle || article.title} | Khalid`,
      description: article.seoDescription || article.excerpt || `Read ${article.title} on Khalid's Developer OS.`,
      openGraph: {
        title: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt || undefined,
        type: 'article',
        publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      },
    };
  } catch {
    return {
      title: 'Article Not Found | Khalid',
    };
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await ArticlesService.getPublicArticleBySlug(slug);
  } catch {
    notFound();
  }

  const readingTime = calculateReadingTime(article.content);
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto space-y-10">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/articles"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Link>
          <span className="text-xs font-mono text-terminal-text-muted">
            khalid.dev/articles/{article.slug}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-4 pb-8 border-b border-terminal-border">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-terminal-text-muted">
            <span className="flex items-center space-x-1.5 text-terminal-secondary">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : ''}>
                {formattedDate}
              </time>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5 text-terminal-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTime} min read</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-terminal-text-primary tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base font-mono text-terminal-text-secondary leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Tag className="w-3.5 h-3.5 text-terminal-text-muted mr-1" />
              {article.tags.map((at) => (
                <span
                  key={at.tag.id}
                  className="text-xs font-mono px-2.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-secondary"
                >
                  #{at.tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Markdown Body */}
        <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed space-y-6 text-terminal-text-primary whitespace-pre-wrap">
          {article.content}
        </div>

        {/* Linked Projects Section */}
        {article.projects.length > 0 && (
          <aside className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
            <h3 className="text-xs font-mono font-bold text-terminal-text-primary uppercase flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-terminal-primary" />
              <span>Related Project & Case Studies</span>
            </h3>
            <div className="divide-y divide-terminal-border">
              {article.projects.map((ap) => (
                <div key={ap.project.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-terminal-text-primary">
                      {ap.project.title}
                    </h4>
                    {ap.project.shortDescription && (
                      <p className="text-[11px] font-mono text-terminal-text-muted line-clamp-1">
                        {ap.project.shortDescription}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/projects/${ap.project.slug}`}
                    className="text-xs font-mono text-terminal-primary hover:underline ml-4 shrink-0"
                  >
                    View Project →
                  </Link>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Article Footer */}
        <footer className="pt-8 border-t border-terminal-border flex items-center justify-between text-xs font-mono text-terminal-text-muted">
          <Link
            href="/articles"
            className="inline-flex items-center space-x-1.5 text-terminal-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span>Personal Developer OS • Knowledge Base</span>
          </div>
        </footer>
      </article>
    </main>
  );
}
