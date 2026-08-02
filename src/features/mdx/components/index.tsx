import React from 'react';
import { H1, H2, H3, H4 } from './Heading';
import { SmartLink } from './SmartLink';
import { ResponsiveImage } from './ResponsiveImage';
import { Callout, InfoCallout, WarningCallout, SuccessCallout, TipCallout, AlertCallout } from './Callout';
import { CodeBlock } from './CodeBlock';
import {
  FileTree,
  Steps,
  Tabs,
  Mermaid,
  Architecture,
  Skills,
  Progress,
  Quote,
} from './CustomPrimitives';

function MdxPre({ children }: { children?: React.ReactNode }) {
  if (React.isValidElement(children) && children.type === 'code') {
    const codeProps = children.props as { className?: string; children?: React.ReactNode };
    return <CodeBlock className={codeProps.className}>{codeProps.children}</CodeBlock>;
  }
  return <pre className="my-6 p-4 border border-terminal-border bg-terminal-surface rounded overflow-x-auto font-mono text-xs">{children}</pre>;
}

function MdxCode({ className, children }: { className?: string; children?: React.ReactNode }) {
  if (className?.includes('language-')) {
    return <CodeBlock className={className}>{children}</CodeBlock>;
  }
  return <code className="font-mono text-xs text-terminal-secondary bg-terminal-bg border border-terminal-border px-1.5 py-0.5 rounded">{children}</code>;
}

function MdxTable({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm border border-terminal-border">{children}</table>
    </div>
  );
}

function MdxThead({ children }: { children?: React.ReactNode }) {
  return <thead className="bg-terminal-bg border-b border-terminal-border">{children}</thead>;
}

function MdxTh({ children }: { children?: React.ReactNode }) {
  return <th className="py-2.5 px-4 text-left font-mono text-xs uppercase tracking-wider text-terminal-text-muted">{children}</th>;
}

function MdxTbody({ children }: { children?: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

function MdxTr({ children }: { children?: React.ReactNode }) {
  return <tr className="border-b border-terminal-border/50 even:bg-terminal-bg odd:bg-terminal-surface">{children}</tr>;
}

function MdxTd({ children }: { children?: React.ReactNode }) {
  return <td className="py-2.5 px-4 font-mono text-sm text-terminal-text-secondary">{children}</td>;
}

function MdxUl({ children }: { children?: React.ReactNode }) {
  return <ul className="my-4 space-y-2 list-none">{children}</ul>;
}

function MdxOl({ children }: { children?: React.ReactNode }) {
  return <ol className="my-4 space-y-2 list-decimal ml-6 font-mono text-sm text-terminal-text-secondary">{children}</ol>;
}

function MdxLi({ children }: { children?: React.ReactNode }) {
  return (
    <li className="font-mono text-sm text-terminal-text-secondary flex items-start gap-2">
      <span className="text-terminal-primary select-none mt-0.5">&gt;</span>
      <span className="flex-1">{children}</span>
    </li>
  );
}

function MdxHr() {
  return <hr className="border-terminal-border my-8" />;
}

/**
 * Enterprise MDX Component Registry Map
 * Maps standard HTML primitives and custom domain components to React components.
 */
export const defaultMdxComponents = {
  // Headings
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,

  // Links & Media
  a: SmartLink,
  img: ResponsiveImage,

  // Callouts & Admonitions
  Callout,
  Warning: WarningCallout,
  Info: InfoCallout,
  Success: SuccessCallout,
  Tip: TipCallout,
  Alert: AlertCallout,

  // Custom CodeBlock Component
  CodeBlock,

  // Code & Formatting
  pre: MdxPre,
  code: MdxCode,

  // Blockquotes
  blockquote: Quote,

  // Tables
  table: MdxTable,
  thead: MdxThead,
  th: MdxTh,
  tbody: MdxTbody,
  tr: MdxTr,
  td: MdxTd,

  // Lists
  ul: MdxUl,
  ol: MdxOl,
  li: MdxLi,
  hr: MdxHr,

  // Domain Framework Registration Primitives
  FileTree,
  Steps,
  Tabs,
  Mermaid,
  Architecture,
  Skills,
  Progress,
  Quote,
};

export type MdxComponentsMap = typeof defaultMdxComponents;
