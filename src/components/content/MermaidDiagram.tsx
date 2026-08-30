'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * MermaidDiagram — Client-only Mermaid renderer.
 *
 * Architecture (Amendment 4): This is a 'use client' boundary.
 * The parent TechnicalContentRenderer remains server-compatible for ordinary Markdown.
 * Only mermaid fenced blocks hydrate this client component.
 *
 * Amendment 5: Idempotent initialization with securityLevel: 'strict', startOnLoad: false.
 * Amendment 6: Debounced rendering via parent; this component handles its own render races.
 * Amendment 7: Render race protection via generation counter.
 * Amendment 8: Malformed mermaid shows safe error UI, never exposes stack traces.
 * Amendment 10: Mermaid is dynamically imported (lazy loaded).
 * Amendment 22: Before mermaid loads, shows source as no-JS fallback.
 */

let mermaidInitialized = false;
let mermaidModule: typeof import('mermaid') | null = null;

async function ensureMermaid() {
  if (!mermaidModule) {
    mermaidModule = await import('mermaid');
    if (!mermaidInitialized) {
      mermaidModule.default.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        suppressErrorRendering: true,
        theme: 'neutral',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        sequence: { useMaxWidth: true },
        er: { useMaxWidth: true },
        themeVariables: {
          primaryColor: '#E8E4DD',
          primaryTextColor: '#1A1A1A',
          primaryBorderColor: '#C8C4BD',
          lineColor: '#1A1A1A',
          secondaryColor: '#F0EDE8',
          tertiaryColor: '#F9F7F2',
          fontSize: '14px',
        },
      });
      mermaidInitialized = true;
    }
  }
  return mermaidModule.default;
}

interface MermaidDiagramProps {
  chart: string;
  /** If true, show slightly more diagnostic info (admin preview context) */
  isAdminPreview?: boolean;
}

export function MermaidDiagram({ chart, isAdminPreview = false }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(0);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

  const renderDiagram = useCallback(async () => {
    const currentGeneration = ++generationRef.current;
    const trimmedChart = chart.trim();

    if (!trimmedChart) {
      setSvgContent(null);
      setError(null);
      return;
    }

    const uniqueId = `mermaid-${Date.now()}-${currentGeneration}`;

    try {
      const mermaid = await ensureMermaid();
      // Amendment 7: Check generation before applying — latest source wins
      if (currentGeneration !== generationRef.current) return;

      const { svg } = await mermaid.render(uniqueId, trimmedChart);

      // Amendment 7: Re-check generation after async render completes
      if (currentGeneration !== generationRef.current) return;

      setSvgContent(svg);
      setError(null);
    } catch (err: unknown) {
      // Clean up any stray DOM elements Mermaid may have injected into document.body
      if (typeof document !== 'undefined') {
        const stray = document.getElementById(`d${uniqueId}`) || document.getElementById(uniqueId);
        if (stray) stray.remove();
        document.querySelectorAll('[id^="dmermaid-"]').forEach((el) => el.remove());
      }

      // Amendment 7: Don't overwrite if stale
      if (currentGeneration !== generationRef.current) return;

      setSvgContent(null);
      // Amendment 8: Never expose stack traces or internals
      const msg = err instanceof Error ? err.message : 'Unknown rendering error';
      // Strip filesystem paths, environment values from error messages
      const safeMsg = msg
        .replace(/[A-Z]:\\[^\s]+/g, '[path]')
        .replace(/\/[^\s]+\.[a-z]+/g, '[path]')
        .slice(0, 200);
      setError(safeMsg);
    }
  }, [chart]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  // Amendment 22: Before mermaid loads, show source as fallback
  if (error) {
    return (
      <div className="my-6 border border-border-subtle bg-surface-container overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-high border-b border-border-subtle">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
            DIAGRAM COULD NOT BE RENDERED
          </span>
          <button
            type="button"
            onClick={() => setShowSource(!showSource)}
            className="font-mono text-[10px] uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors border border-border-subtle px-2 py-0.5"
          >
            {showSource ? 'Hide Source' : 'Show Source'}
          </button>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-xs text-text-secondary">
            Check Mermaid syntax.
            {isAdminPreview && error && (
              <span className="block mt-1 text-[10px] text-terminal-text-muted opacity-75">
                {error}
              </span>
            )}
          </p>
        </div>
        {showSource && (
          <div className="border-t border-border-subtle">
            <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
              {chart}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (!svgContent) {
    // Amendment 22: Loading / no-JS fallback — show source skeleton
    return (
      <div className="my-6 border border-border-subtle bg-surface-container overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border-subtle">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
            Loading diagram…
          </span>
        </div>
        <pre className="p-4 text-xs font-mono text-text-secondary opacity-50 whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 border border-border-subtle bg-surface-container overflow-hidden">
      <div
        ref={containerRef}
        className="p-4 md:p-6 overflow-x-auto [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
