import React from 'react';
import GithubSlugger from 'github-slugger';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4;
  children?: React.ReactNode;
}

const slugger = new GithubSlugger();

/**
 * Custom Heading component for H1, H2, H3, H4 with auto ID slugification and anchor links
 */
export function Heading({ level, children, id, className, ...props }: HeadingProps) {
  slugger.reset();
  const text = typeof children === 'string' ? children : String(children || '');
  const headingId = id || slugger.slug(text || 'heading');

  const baseStyles = 'font-mono text-terminal-text-primary group flex items-center gap-2 scroll-mt-24';
  const sizeStyles = {
    1: 'text-2xl md:text-3xl font-bold mt-10 mb-6 pb-3 border-b border-terminal-border',
    2: 'text-xl md:text-2xl font-bold mt-8 mb-4 border-b border-terminal-border/40 pb-2',
    3: 'text-lg md:text-xl font-semibold mt-6 mb-3',
    4: 'text-base font-semibold mt-4 mb-2 text-terminal-text-secondary',
  };

  const innerContent = (
    <>
      {level === 2 && <span className="text-terminal-primary text-sm select-none">##</span>}
      {level === 3 && <span className="text-terminal-text-muted text-xs select-none">###</span>}
      <span className="flex-1">{children}</span>
      <a
        href={`#${headingId}`}
        className="opacity-0 group-hover:opacity-100 text-terminal-text-muted hover:text-terminal-secondary text-xs transition-opacity ml-2"
        aria-label={`Link to ${text}`}
      >
        #
      </a>
    </>
  );

  const combinedClass = `${baseStyles} ${sizeStyles[level]} ${className || ''}`;

  if (level === 1) return <h1 id={headingId} className={combinedClass} {...props}>{innerContent}</h1>;
  if (level === 2) return <h2 id={headingId} className={combinedClass} {...props}>{innerContent}</h2>;
  if (level === 3) return <h3 id={headingId} className={combinedClass} {...props}>{innerContent}</h3>;
  return <h4 id={headingId} className={combinedClass} {...props}>{innerContent}</h4>;
}

export const H1 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading level={1} {...props} />;
export const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading level={2} {...props} />;
export const H3 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading level={3} {...props} />;
export const H4 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading level={4} {...props} />;
