'use client';

/**
 * TechnicalMarkdownEditor — Split-pane Markdown + Mermaid authoring component for the private Developer OS.
 *
 * Amendment 6:  Debounces preview rendering (~300ms).
 * Amendment 11: Works for ordinary notes without Mermaid.
 * Amendment 12: Toolbar operations preserve selection context.
 * Amendment 13: Textarea-based foundation, no Monaco/CodeMirror.
 * Amendment 14: View modes (EDIT/SPLIT/PREVIEW) are UI state only.
 * Amendment 15: Responsive layout via CSS; no hydration mismatch from window.innerWidth branching.
 * Amendment 16: Preview visually reproduces public presentation but remains private.
 * Amendment 17: Does NOT write to database on keystroke.
 * Amendment 23: Admin shell stays dark obsidian; preview pane uses public Stitch tokens.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TechnicalContentRenderer } from '@/components/content/TechnicalContentRenderer';
import {
  Heading1, Heading2, Heading3,
  Bold, Italic, Quote, List, ListOrdered,
  Code, Braces, Link2, Table2,
  GitBranch, ArrowRightLeft, Database, Workflow,
  Eye, Split, PenLine, ChevronDown,
} from 'lucide-react';

// ── Mermaid insertion templates ────────────────────────────────────────

const MERMAID_TEMPLATES: Record<string, string> = {
  'Flowchart (Top-Down)': `\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D
\`\`\``,
  'Flowchart (Left-Right)': `\`\`\`mermaid
flowchart LR
    A[Input] --> B[Process]
    B --> C[Output]
\`\`\``,
  'Sequence Diagram': `\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    Client->>Server: Request
    Server->>Database: Query
    Database-->>Server: Result
    Server-->>Client: Response
\`\`\``,
  'State Diagram': `\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review
    Review --> Published
    Review --> Draft
    Published --> Archived
    Archived --> [*]
\`\`\``,
  'ER Diagram': `\`\`\`mermaid
erDiagram
    PROJECT ||--o{ TECH_NOTE : contains
    PROJECT ||--o{ TECHNOLOGY : uses
    TECH_NOTE }|--|| DOMAIN : belongs_to
\`\`\``,
};

// ── Types ──────────────────────────────────────────────────────────────

type ViewMode = 'edit' | 'split' | 'preview';

interface TechnicalMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

// ── Toolbar insertion logic (Amendment 12) ─────────────────────────────

function insertAtSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  defaultMiddle: string,
  onChange: (val: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.slice(start, end);

  const middle = selected || defaultMiddle;
  const newText = text.slice(0, start) + before + middle + after + text.slice(end);

  onChange(newText);

  // Restore focus and selection after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    const cursorStart = start + before.length;
    const cursorEnd = cursorStart + middle.length;
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}

function insertBlock(
  textarea: HTMLTextAreaElement,
  block: string,
  onChange: (val: string) => void,
) {
  const start = textarea.selectionStart;
  const text = textarea.value;

  // Ensure block starts on a new line
  const prefix = start > 0 && text[start - 1] !== '\n' ? '\n\n' : start > 0 ? '\n' : '';
  const newText = text.slice(0, start) + prefix + block + '\n' + text.slice(start);

  onChange(newText);

  requestAnimationFrame(() => {
    textarea.focus();
    const newPos = start + prefix.length + block.length + 1;
    textarea.setSelectionRange(newPos, newPos);
  });
}

// ── Component ──────────────────────────────────────────────────────────

export function TechnicalMarkdownEditor({
  value,
  onChange,
  label,
  error,
  placeholder,
}: TechnicalMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [showDiagramMenu, setShowDiagramMenu] = useState(false);
  const diagramMenuRef = useRef<HTMLDivElement>(null);

  // Amendment 6: Debounce preview updates (~300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Close diagram dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (diagramMenuRef.current && !diagramMenuRef.current.contains(e.target as Node)) {
        setShowDiagramMenu(false);
      }
    };
    if (showDiagramMenu) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [showDiagramMenu]);

  // ── Toolbar handlers ──

  const getTA = useCallback(() => textareaRef.current, []);

  const handleBold = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '**', '**', 'bold text', onChange);
  };
  const handleItalic = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '*', '*', 'italic text', onChange);
  };
  const handleH1 = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '# ', '', 'Heading 1', onChange);
  };
  const handleH2 = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '## ', '', 'Heading 2', onChange);
  };
  const handleH3 = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '### ', '', 'Heading 3', onChange);
  };
  const handleQuote = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '> ', '', 'quoted text', onChange);
  };
  const handleUL = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '- ', '', 'list item', onChange);
  };
  const handleOL = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '1. ', '', 'list item', onChange);
  };
  const handleInlineCode = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '`', '`', 'code', onChange);
  };
  const handleCodeBlock = () => {
    const ta = getTA();
    if (ta) insertBlock(ta, '```typescript\n// code here\n```', onChange);
  };
  const handleLink = () => {
    const ta = getTA();
    if (ta) insertAtSelection(ta, '[', '](https://)', 'link text', onChange);
  };
  const handleTable = () => {
    const ta = getTA();
    if (ta) insertBlock(ta, '| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |', onChange);
  };

  const handleDiagramInsert = (templateName: string) => {
    const ta = getTA();
    if (ta) {
      insertBlock(ta, MERMAID_TEMPLATES[templateName], onChange);
    }
    setShowDiagramMenu(false);
  };

  // Handle Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const text = ta.value;
      const newText = text.slice(0, start) + '  ' + text.slice(end);
      onChange(newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start + 2, start + 2);
      });
    }
  };

  // ── View mode icons ──
  const modeButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'edit', icon: <PenLine className="w-3.5 h-3.5" />, label: 'Edit' },
    { mode: 'split', icon: <Split className="w-3.5 h-3.5" />, label: 'Split' },
    { mode: 'preview', icon: <Eye className="w-3.5 h-3.5" />, label: 'Preview' },
  ];

  // ── Diagram template icons ──
  const diagramIcons: Record<string, React.ReactNode> = {
    'Flowchart (Top-Down)': <Workflow className="w-3.5 h-3.5" />,
    'Flowchart (Left-Right)': <ArrowRightLeft className="w-3.5 h-3.5" />,
    'Sequence Diagram': <GitBranch className="w-3.5 h-3.5" />,
    'State Diagram': <GitBranch className="w-3.5 h-3.5" />,
    'ER Diagram': <Database className="w-3.5 h-3.5" />,
  };

  const showEditor = viewMode === 'edit' || viewMode === 'split';
  const showPreview = viewMode === 'preview' || viewMode === 'split';

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-mono text-terminal-text-secondary">
          {label}
        </label>
      )}

      <div className="border border-terminal-border rounded-lg overflow-hidden bg-terminal-surface">
        {/* ── Header: Toolbar + Mode switcher ── */}
        <div className="flex items-center justify-between border-b border-terminal-border bg-terminal-bg px-2 py-1.5">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 flex-wrap">
            <ToolbarBtn onClick={handleH1} title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleH2} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleH3} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn onClick={handleBold} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleItalic} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn onClick={handleQuote} title="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleUL} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleOL} title="Ordered List"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn onClick={handleInlineCode} title="Inline Code"><Code className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleCodeBlock} title="Code Block"><Braces className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleLink} title="Link"><Link2 className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={handleTable} title="Table"><Table2 className="w-3.5 h-3.5" /></ToolbarBtn>
            <ToolbarSep />
            {/* Diagram dropdown */}
            <div className="relative" ref={diagramMenuRef}>
              <button
                type="button"
                onClick={() => setShowDiagramMenu(!showDiagramMenu)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-terminal-primary hover:bg-terminal-primary/10 rounded transition-colors"
                title="Insert Diagram"
              >
                <Workflow className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Diagram</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showDiagramMenu && (
                <div className="absolute top-full left-0 mt-1 z-50 w-56 bg-terminal-bg border border-terminal-border rounded-lg shadow-xl py-1">
                  {Object.keys(MERMAID_TEMPLATES).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleDiagramInsert(name)}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-terminal-text-secondary hover:text-terminal-text-primary hover:bg-terminal-surface transition-colors flex items-center gap-2"
                    >
                      {diagramIcons[name]}
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-0.5 border border-terminal-border rounded-md overflow-hidden ml-2 shrink-0">
            {modeButtons.map((btn) => (
              <button
                key={btn.mode}
                type="button"
                onClick={() => setViewMode(btn.mode)}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  viewMode === btn.mode
                    ? 'bg-terminal-primary/20 text-terminal-primary font-semibold'
                    : 'text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface'
                }`}
                title={btn.label}
              >
                {btn.icon}
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Split pane content ── */}
        {/* Amendment 15: CSS-driven responsive layout, no window.innerWidth branching */}
        <div className={`flex ${viewMode === 'split' ? 'flex-col md:flex-row' : ''}`}>
          {/* Editor pane */}
          {showEditor && (
            <div className={`${viewMode === 'split' ? 'w-full md:w-1/2 md:border-r md:border-terminal-border' : 'w-full'}`}>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Write Markdown here...\n\nSupports headings, lists, tables, code blocks, and ```mermaid diagrams.'}
                className="w-full min-h-[420px] max-h-[75vh] p-4 bg-terminal-bg text-terminal-text-primary font-mono text-sm leading-relaxed resize-y focus:outline-none placeholder:text-terminal-text-muted/50"
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview pane */}
          {showPreview && (
            <div className={`${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}`}>
              {/* Amendment 23: Preview uses public Stitch theme scoped via inline bg/text */}
              <div
                className="min-h-[420px] max-h-[75vh] overflow-y-auto p-6 md:p-8"
                style={{
                  backgroundColor: '#F9F7F2',
                  color: '#1A1A1A',
                }}
              >
                <div className="max-w-none">
                  <TechnicalContentRenderer content={debouncedValue} variant="admin" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-terminal-border bg-terminal-bg text-[10px] font-mono text-terminal-text-muted">
          <span>Markdown · Mermaid · GFM</span>
          <span>{value.length} chars</span>
        </div>
      </div>

      {error && <p className="text-[11px] font-mono text-terminal-accent">{error}</p>}
    </div>
  );
}

// ── Toolbar primitives ─────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface rounded transition-colors"
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-4 bg-terminal-border mx-0.5" />;
}
