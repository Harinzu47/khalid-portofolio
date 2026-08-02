import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseCodeBlockMeta } from '../codeHighlighter';

export interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  filename?: string;
  language?: string;
}

/**
 * CodeBlock component — handles pre/code blocks with language badges, filename headers, line numbers & syntax highlighting
 */
export function CodeBlock({ children, className, filename: propFilename, language: propLanguage }: CodeBlockProps) {
  const codeString = String(children || '').replace(/\n$/, '');
  const meta = parseCodeBlockMeta(className);

  const language = propLanguage || meta.language || 'text';
  const filename = propFilename || meta.filename;

  return (
    <div className="my-6 border border-terminal-border bg-terminal-surface rounded overflow-hidden">
      {/* Code header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-terminal-bg border-b border-terminal-border font-mono text-xs text-terminal-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-terminal-accent opacity-60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-600 opacity-60" />
          <span className="w-2.5 h-2.5 rounded-full bg-terminal-primary opacity-60" />
          {filename && <span className="ml-2 text-terminal-text-primary font-semibold">{filename}</span>}
        </div>
        <span className="uppercase text-[10px] tracking-widest text-terminal-primary border border-terminal-primary/30 px-1.5 py-0.5 rounded">
          {language}
        </span>
      </div>

      {/* Syntax highlighted code */}
      <div className="p-4 overflow-x-auto text-xs font-mono">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={meta.showLineNumbers}
          customStyle={{
            background: 'transparent',
            margin: 0,
            padding: 0,
            fontSize: '0.85rem',
            lineHeight: 1.6,
          }}
          lineNumberStyle={{
            color: '#484f58',
            paddingRight: '1em',
            minWidth: '2.5em',
            userSelect: 'none',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
