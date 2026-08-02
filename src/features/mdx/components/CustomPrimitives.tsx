import React from 'react';
import { MdxErrorBoundary } from '../errorBoundary';

export interface ComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Higher-Order Component registration helper for future domain-specific MDX components.
 * Wraps component execution inside MdxErrorBoundary to prevent runtime crashes.
 */
export function registerMdxComponent(
  name: string,
  RenderComponent: React.ComponentType<ComponentProps>
) {
  const WrappedComponent = (props: ComponentProps) => (
    <MdxErrorBoundary componentName={name}>
      <RenderComponent {...props} />
    </MdxErrorBoundary>
  );

  WrappedComponent.displayName = `MDXComponent(${name})`;
  return WrappedComponent;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MDX Domain Primitive Placeholders / Framework Registration
 * ───────────────────────────────────────────────────────────────────────────── */

export const FileTree = registerMdxComponent('FileTree', ({ children }) => (
  <div className="my-6 p-4 border border-terminal-border bg-terminal-bg rounded font-mono text-xs text-terminal-text-secondary">
    <p className="text-terminal-text-muted mb-2 uppercase tracking-widest text-[10px]">// file tree</p>
    {children}
  </div>
));

export const Steps = registerMdxComponent('Steps', ({ children }) => (
  <div className="my-6 space-y-4 border-l-2 border-terminal-border pl-4">
    {children}
  </div>
));

export const Tabs = registerMdxComponent('Tabs', ({ children }) => (
  <div className="my-6 border border-terminal-border rounded overflow-hidden">
    {children}
  </div>
));

export const Mermaid = registerMdxComponent('Mermaid', ({ children }) => (
  <div className="my-6 p-4 border border-terminal-border bg-terminal-surface rounded text-center font-mono text-xs">
    <p className="text-terminal-secondary">// [mermaid diagram visualizer]</p>
    <pre className="mt-2 text-left text-terminal-text-muted overflow-x-auto">{String(children)}</pre>
  </div>
));

export const Architecture = registerMdxComponent('Architecture', ({ children }) => (
  <div className="my-6 p-5 border border-terminal-border bg-terminal-surface rounded font-mono text-xs">
    <p className="text-terminal-primary font-bold mb-2">// architecture diagram</p>
    <div>{children}</div>
  </div>
));

export const Skills = registerMdxComponent('Skills', ({ children }) => (
  <div className="my-6 p-4 border border-terminal-border rounded">
    {children}
  </div>
));

export const Progress = registerMdxComponent('Progress', ({ value = 0 }) => (
  <div className="my-4 w-full bg-terminal-bg border border-terminal-border rounded h-3 overflow-hidden">
    <div
      className="bg-terminal-primary h-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }}
    />
  </div>
));

export const Quote = registerMdxComponent('Quote', ({ children, author }) => (
  <blockquote className="my-6 border-l-2 border-terminal-primary bg-terminal-bg p-4 rounded-r font-mono text-sm italic text-terminal-text-secondary">
    <div>{children}</div>
    {author && <cite className="block mt-2 font-normal text-xs text-terminal-text-muted not-italic">— {String(author)}</cite>}
  </blockquote>
));
