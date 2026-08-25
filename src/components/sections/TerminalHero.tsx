'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Sparkles } from 'lucide-react';

interface OutputLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'success';
  text: string | React.ReactNode;
}

export function TerminalHero() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<OutputLine[]>([
    {
      id: '1',
      type: 'output',
      text: 'Personal Developer OS [Version 2.0.0-PROD] — Kernel Initialized',
    },
    {
      id: '2',
      type: 'output',
      text: 'Type "help" to list available system commands or "whoami" for operator profile.',
    },
    {
      id: '3',
      type: 'command',
      text: 'whoami',
    },
    {
      id: '4',
      type: 'output',
      text: 'Khalid Jundullah — Network, Cloud Infrastructure & Systems Engineer',
    },
    {
      id: '5',
      type: 'success',
      text: 'Core Stack: Linux • Kubernetes • MikroTik • PostgreSQL • TypeScript • Next.js • Go • Python',
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newHistory: OutputLine[] = [
      ...history,
      { id: String(Date.now()), type: 'command', text: cmd },
    ];

    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (lowerCmd === 'help') {
      newHistory.push({
        id: String(Date.now() + 1),
        type: 'output',
        text: (
          <div className="space-y-1 py-1 text-xs">
            <p className="text-terminal-text-primary font-bold">AVAILABLE COMMANDS:</p>
            <p><span className="text-terminal-primary">whoami</span> — Display operator background & mission</p>
            <p><span className="text-terminal-primary">skills</span> — List core engineering capabilities</p>
            <p><span className="text-terminal-primary">projects</span> — Browse featured production case studies</p>
            <p><span className="text-terminal-primary">articles</span> — Read technical deep-dives</p>
            <p><span className="text-terminal-primary">journal</span> — View daily engineering logs</p>
            <p><span className="text-terminal-primary">roadmap</span> — View architecture milestones & learning tracks</p>
            <p><span className="text-terminal-primary">status</span> — Check live telemetry metrics</p>
            <p><span className="text-terminal-primary">clear</span> — Reset terminal output</p>
          </div>
        ),
      });
    } else if (lowerCmd === 'whoami') {
      newHistory.push({
        id: String(Date.now() + 1),
        type: 'output',
        text: 'Khalid Jundullah: Systems Architect specializing in Cloud Native Infrastructure, Enterprise Network Routing, and High-Performance Backend Systems.',
      });
    } else if (lowerCmd === 'skills') {
      newHistory.push({
        id: String(Date.now() + 1),
        type: 'success',
        text: 'Active Competencies: MikroTik Routing, BGP/OSPF, Docker & Kubernetes, CI/CD DevSecOps, PostgreSQL Optimization, Fullstack Next.js.',
      });
    } else if (lowerCmd === 'status') {
      newHistory.push({
        id: String(Date.now() + 1),
        type: 'output',
        text: 'Telemetry: 25 Postgres Tables Nominal • RLS Enforced • Latency < 1ms • Uptime 99.98%',
      });
    } else if (lowerCmd === 'projects') {
      newHistory.push({
        id: String(Date.now() + 1),
        type: 'output',
        text: (
          <div className="space-y-1">
            <p>1. AturModal — Microfinance Enterprise ERP & Auditing</p>
            <p>2. FLC LMS — Interactive Cloud Educational Platform</p>
            <p>3. ESG Sentiment Analyzer — NLP FinTech Sentiment Mining</p>
            <p className="text-terminal-primary">Navigate below or visit /projects to view all 11+ systems.</p>
          </div>
        ),
      });
    } else {
      newHistory.push({
        id: String(Date.now() + 1),
        type: 'error',
        text: `Command not recognized: "${cmd}". Type "help" for available commands.`,
      });
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Terminal Window Chrome */}
      <div className="rounded-lg border border-terminal-border bg-terminal-surface shadow-2xl overflow-hidden">
        {/* Title Bar */}
        <div className="px-4 py-3 bg-terminal-bg border-b border-terminal-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-terminal-accent/80" />
            <div className="w-3 h-3 rounded-full bg-terminal-warning/80" />
            <div className="w-3 h-3 rounded-full bg-terminal-primary/80" />
            <span className="text-xs font-mono text-terminal-text-muted ml-2 flex items-center space-x-1.5">
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>operator@khalid-os: ~</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-terminal-text-muted">
            <span className="hidden sm:inline flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-terminal-primary" />
              <span>Interactive Session</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-primary">
              ONLINE
            </span>
          </div>
        </div>

        {/* Terminal Output Log */}
        <div className="p-5 font-mono text-xs sm:text-sm space-y-2.5 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div key={item.id} className="leading-relaxed">
              {item.type === 'command' && (
                <div className="flex items-center space-x-2 text-terminal-text-primary">
                  <span className="text-terminal-primary font-bold">$</span>
                  <span>{item.text}</span>
                </div>
              )}
              {item.type === 'output' && (
                <div className="text-terminal-text-secondary pl-4">{item.text}</div>
              )}
              {item.type === 'success' && (
                <div className="text-terminal-secondary pl-4">{item.text}</div>
              )}
              {item.type === 'error' && (
                <div className="text-terminal-accent pl-4">{item.text}</div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Terminal Command Input Form */}
        <form
          onSubmit={handleCommand}
          className="px-5 py-3 border-t border-terminal-border bg-terminal-bg/60 flex items-center space-x-2 font-mono text-xs sm:text-sm"
        >
          <span className="text-terminal-primary font-bold">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command (e.g. whoami, help, skills, projects)..."
            className="flex-1 bg-transparent text-terminal-text-primary focus:outline-none placeholder-terminal-text-muted/60"
            autoFocus
          />
          <button
            type="submit"
            className="p-1 rounded text-terminal-text-muted hover:text-terminal-primary transition-colors"
            title="Execute Command"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Quick Action Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-terminal-text-muted">
        <span>Quick Commands:</span>
        {['whoami', 'skills', 'projects', 'articles', 'roadmap', 'status'].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => {
              setInput(cmd);
            }}
            className="px-2 py-1 rounded bg-terminal-surface border border-terminal-border hover:border-terminal-primary hover:text-terminal-primary transition-colors"
          >
            ${cmd}
          </button>
        ))}
      </div>
    </section>
  );
}
