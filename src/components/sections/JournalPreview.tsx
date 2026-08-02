import Link from 'next/link';
import { getAllJournalPosts } from '@/data/journal';
import { ArrowRight } from 'lucide-react';

/**
 * Journal preview — commit-log style rows on the homepage
 */
export function JournalPreview() {
  const posts = getAllJournalPosts().slice(0, 3);

  return (
    <section className="py-20 border-t border-terminal-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="font-mono text-terminal-primary text-sm mb-2">
          $ tail -3 journal.log
        </p>
        <h2 className="font-mono text-2xl md:text-3xl text-terminal-text-primary mb-10">
          Latest Logs
        </h2>

        {/* Commit-log table */}
        <div className="border border-terminal-border rounded overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-5 py-3 bg-terminal-surface border-b border-terminal-border">
            <span className="font-mono text-xs text-terminal-text-muted w-28 flex-shrink-0 uppercase tracking-wider">
              date
            </span>
            <span className="font-mono text-xs text-terminal-text-muted flex-1 uppercase tracking-wider">
              title
            </span>
            <span className="font-mono text-xs text-terminal-text-muted hidden sm:block uppercase tracking-wider">
              read
            </span>
          </div>

          {/* Rows */}
          {posts.map((post, idx) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className={`flex items-start sm:items-center gap-4 px-5 py-4 border-b border-terminal-border/50 hover:bg-terminal-surface/50 transition-colors group ${
                idx === posts.length - 1 ? 'border-b-0' : ''
              }`}
            >
              {/* Date */}
              <span className="font-mono text-xs text-terminal-text-muted w-28 flex-shrink-0 whitespace-nowrap">
                [{post.date}]
              </span>

              {/* Title + tags */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-terminal-text-primary group-hover:text-terminal-secondary transition-colors mb-1.5">
                  {post.title}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-1.5 py-0.5 border border-terminal-secondary/30 text-terminal-secondary rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Read time */}
              <span className="font-mono text-xs text-terminal-text-muted hidden sm:block whitespace-nowrap">
                {post.readTime}
              </span>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-6 flex">
          <Link
            href="/journal"
            className="flex items-center gap-2 font-mono text-sm text-terminal-secondary hover:text-terminal-secondary/80 transition-colors"
          >
            <span>&gt; view all logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
