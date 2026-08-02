import React from 'react';
import Link from 'next/link';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Icon } from '../icons';
import { Article } from '@/lib/content/schemas';

export interface ArticleCardProps {
  article: Article;
  className?: string;
}

/**
 * Enterprise Article Card Content Component
 */
export function ArticleCard({ article, className = '' }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className={`group block ${className}`}>
      <Card interactive variant="surface" className="h-full flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3 font-mono text-xs text-terminal-text-muted">
            <span className="flex items-center gap-1">
              <Icon name="calendar" size={12} />
              {article.date}
            </span>
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Icon name="clock" size={12} />
                {article.readingTime}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-mono text-base md:text-lg text-terminal-text-primary mb-2 group-hover:text-terminal-secondary transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Summary */}
          <p className="font-sans text-sm text-terminal-text-secondary line-clamp-3 mb-4 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Footer Tags */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="neutral">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-1 text-terminal-secondary font-mono text-xs group-hover:gap-2 transition-all">
            <span>&gt; read article</span>
            <Icon name="arrowRight" size={12} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
