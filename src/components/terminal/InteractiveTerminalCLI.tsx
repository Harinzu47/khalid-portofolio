'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  VIRTUAL_FS,
  NEOFETCH_ART,
  VirtualFile,
} from '@/lib/terminal-cli';
import {
  Terminal as TerminalIcon,
  Maximize2,
  Minimize2,
  X,
  CornerDownLeft,
} from 'lucide-react';

interface TerminalEntry {
  id: string;
  type: 'command' | 'output' | 'error' | 'success' | 'system';
  text: string | React.ReactNode;
  cwd?: string;
}

export function InteractiveTerminalCLI({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const [cwd, setCwd] = useState<string>('/');
  const [input, setInput] = useState<string>('');
  const [theme, setTheme] = useState<'default' | 'matrix' | 'amber' | 'dracula'>('default');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const [logs, setLogs] = useState<TerminalEntry[]>([
    {
      id: '0',
      type: 'system',
      text: `hzcode Developer OS Shell [Version 2.0.0]
(c) 2026 Khalid Jundullah. All rights reserved.
Type "help" for a list of commands, or "neofetch" for system telemetry.`,
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Resolve directory node in virtual FS
  const resolveDir = (path: string): { dir: VirtualFile | null; pathStr: string } => {
    const target = path.trim();
    if (!target || target === '.') return { dir: getNodeByPath(cwd), pathStr: cwd };
    if (target === '~' || target === '/') return { dir: VIRTUAL_FS, pathStr: '/' };

    const fullPath = target.startsWith('/') ? target : `${cwd === '/' ? '' : cwd}/${target}`;
    // normalize ../
    const parts = fullPath.split('/').filter(Boolean);
    const resolvedParts: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        resolvedParts.pop();
      } else if (part !== '.') {
        resolvedParts.push(part);
      }
    }

    const resolvedPath = '/' + resolvedParts.join('/');
    const node = getNodeByPath(resolvedPath);
    return { dir: node && node.type === 'dir' ? node : null, pathStr: resolvedPath };
  };

  const getNodeByPath = (path: string): VirtualFile | null => {
    if (path === '/' || path === '') return VIRTUAL_FS;
    const parts = path.split('/').filter(Boolean);
    let current: VirtualFile = VIRTUAL_FS;

    for (const part of parts) {
      if (!current.children || !current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  };

  // Tab autocompletion handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const trimmed = input.trim();
      const parts = trimmed.split(' ');
      const availableCmds = [
        'ls',
        'cd',
        'pwd',
        'cat',
        'clear',
        'help',
        'whoami',
        'neofetch',
        'sysinfo',
        'theme',
        'open',
        'sudo',
        'history',
        'echo',
        'exit',
      ];

      if (parts.length === 1) {
        const matches = availableCmds.filter((c) => c.startsWith(parts[0]));
        if (matches.length === 1) {
          setInput(matches[0] + ' ');
        }
      } else if (parts.length === 2 && ['cd', 'cat', 'open', 'ls'].includes(parts[0])) {
        const currentDir = getNodeByPath(cwd);
        if (currentDir && currentDir.children) {
          const files = Object.keys(currentDir.children);
          const matches = files.filter((f) => f.startsWith(parts[1]));
          if (matches.length === 1) {
            setInput(`${parts[0]} ${matches[0]}`);
          }
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < commandHistory.length) {
        setHistoryIndex(nextIdx);
        setInput(commandHistory[commandHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIndex - 1;
      if (nextIdx >= 0) {
        setHistoryIndex(nextIdx);
        setInput(commandHistory[commandHistory.length - 1 - nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    setCommandHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    const newLogs: TerminalEntry[] = [
      ...logs,
      { id: String(Date.now()), type: 'command', text: raw, cwd },
    ];

    const [cmd, ...args] = raw.split(' ');
    const argStr = args.join(' ').trim();

    switch (cmd.toLowerCase()) {
      case 'clear':
        setLogs([]);
        setInput('');
        return;

      case 'help':
        newLogs.push({
          id: String(Date.now() + 1),
          type: 'output',
          text: (
            <div className="space-y-1 py-1">
              <p className="font-bold text-terminal-text-primary">CORE SYSTEM COMMANDS:</p>
              <p><span className="text-terminal-primary">ls [path]</span> — List files and directories</p>
              <p><span className="text-terminal-primary">cd &lt;dir&gt;</span> — Change current working directory</p>
              <p><span className="text-terminal-primary">pwd</span> — Print working directory</p>
              <p><span className="text-terminal-primary">cat &lt;file&gt;</span> — Concatenate and display file content</p>
              <p><span className="text-terminal-primary">open &lt;file|url&gt;</span> — Open target project, article, or route in UI</p>
              <p><span className="text-terminal-primary">whoami</span> — Display operator background</p>
              <p><span className="text-terminal-primary">neofetch</span> — Display system specifications and ASCII logo</p>
              <p><span className="text-terminal-primary">theme &lt;default|matrix|amber|dracula&gt;</span> — Switch CLI palette</p>
              <p><span className="text-terminal-primary">history</span> — Print command execution history</p>
              <p><span className="text-terminal-primary">clear</span> — Reset terminal buffer</p>
            </div>
          ),
        });
        break;

      case 'pwd':
        newLogs.push({ id: String(Date.now() + 1), type: 'output', text: cwd });
        break;

      case 'whoami':
        newLogs.push({
          id: String(Date.now() + 1),
          type: 'output',
          text: 'Khalid Jundullah — Network, Cloud Infrastructure & Systems Engineer (MTCNA Certified)',
        });
        break;

      case 'neofetch':
      case 'sysinfo':
        newLogs.push({
          id: String(Date.now() + 1),
          type: 'output',
          text: <pre className="text-[11px] leading-tight text-terminal-primary">{NEOFETCH_ART}</pre>,
        });
        break;

      case 'sudo':
        newLogs.push({
          id: String(Date.now() + 1),
          type: 'error',
          text: 'Permission Denied: User is not in the sudoers file. This incident will be reported to Khalid.',
        });
        break;

      case 'history':
        newLogs.push({
          id: String(Date.now() + 1),
          type: 'output',
          text: (
            <div className="space-y-0.5">
              {commandHistory.map((h, i) => (
                <div key={i}>
                  <span className="text-terminal-text-muted mr-3">{i + 1}</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          ),
        });
        break;

      case 'theme':
        if (['default', 'matrix', 'amber', 'dracula'].includes(argStr.toLowerCase())) {
          setTheme(argStr.toLowerCase() as 'default' | 'matrix' | 'amber' | 'dracula');
          newLogs.push({
            id: String(Date.now() + 1),
            type: 'success',
            text: `Terminal palette switched to "${argStr}".`,
          });
        } else {
          newLogs.push({
            id: String(Date.now() + 1),
            type: 'error',
            text: 'Available themes: default, matrix, amber, dracula',
          });
        }
        break;

      case 'ls': {
        const { dir } = resolveDir(argStr || cwd);
        if (!dir || dir.type !== 'dir') {
          newLogs.push({
            id: String(Date.now() + 1),
            type: 'error',
            text: `ls: cannot access '${argStr}': No such directory`,
          });
        } else {
          const children = Object.values(dir.children || {});
          newLogs.push({
            id: String(Date.now() + 1),
            type: 'output',
            text: (
              <div className="flex flex-wrap gap-4 py-1">
                {children.map((child) => (
                  <span
                    key={child.name}
                    className={
                      child.type === 'dir'
                        ? 'text-terminal-secondary font-bold'
                        : 'text-terminal-text-primary'
                    }
                  >
                    {child.name}
                    {child.type === 'dir' ? '/' : ''}
                  </span>
                ))}
              </div>
            ),
          });
        }
        break;
      }

      case 'cd': {
        if (!argStr || argStr === '~' || argStr === '/') {
          setCwd('/');
        } else {
          const { dir, pathStr } = resolveDir(argStr);
          if (!dir || dir.type !== 'dir') {
            newLogs.push({
              id: String(Date.now() + 1),
              type: 'error',
              text: `cd: no such file or directory: ${argStr}`,
            });
          } else {
            setCwd(pathStr);
          }
        }
        break;
      }

      case 'cat': {
        if (!argStr) {
          newLogs.push({
            id: String(Date.now() + 1),
            type: 'error',
            text: 'cat: missing file operand',
          });
        } else {
          const currentDir = getNodeByPath(cwd);
          const file = currentDir?.children?.[argStr];
          if (!file) {
            newLogs.push({
              id: String(Date.now() + 1),
              type: 'error',
              text: `cat: ${argStr}: No such file`,
            });
          } else if (file.type === 'dir') {
            newLogs.push({
              id: String(Date.now() + 1),
              type: 'error',
              text: `cat: ${argStr}: Is a directory`,
            });
          } else {
            newLogs.push({
              id: String(Date.now() + 1),
              type: 'output',
              text: <pre className="whitespace-pre-wrap leading-relaxed">{file.content}</pre>,
            });
          }
        }
        break;
      }

      case 'open': {
        if (!argStr) {
          newLogs.push({
            id: String(Date.now() + 1),
            type: 'error',
            text: 'open: specify a file or path to open',
          });
        } else {
          const currentDir = getNodeByPath(cwd);
          const file = currentDir?.children?.[argStr];
          if (file?.url) {
            newLogs.push({
              id: String(Date.now() + 1),
              type: 'success',
              text: `Navigating to ${file.url}...`,
            });
            setTimeout(() => router.push(file.url!), 300);
          } else if (argStr.startsWith('/')) {
            newLogs.push({
              id: String(Date.now() + 1),
              type: 'success',
              text: `Navigating to ${argStr}...`,
            });
            setTimeout(() => router.push(argStr), 300);
          } else {
            newLogs.push({
              id: String(Date.now() + 1),
              type: 'error',
              text: `open: cannot open '${argStr}'`,
            });
          }
        }
        break;
      }

      case 'exit':
        if (onClose) onClose();
        break;

      default:
        newLogs.push({
          id: String(Date.now() + 1),
          type: 'error',
          text: `Command not found: "${cmd}". Type "help" to view available system commands.`,
        });
        break;
    }

    setLogs(newLogs);
    setInput('');
  };

  // Color Theme Variables
  const themeClasses =
    theme === 'matrix'
      ? 'text-green-500 bg-black border-green-800'
      : theme === 'amber'
      ? 'text-amber-400 bg-black border-amber-800'
      : theme === 'dracula'
      ? 'text-purple-300 bg-[#282a36] border-[#6272a4]'
      : 'text-terminal-text-primary bg-terminal-bg border-terminal-border';

  return (
    <div
      className={`flex flex-col font-mono text-xs sm:text-sm rounded-lg border shadow-2xl overflow-hidden transition-all ${themeClasses} ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen w-screen'
          : isModal
          ? 'relative w-full h-[650px] max-w-4xl'
          : 'w-full h-[600px]'
      }`}
    >
      {/* Title Bar */}
      <div className="px-4 py-3 bg-black/40 border-b border-inherit flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={onClose} />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div
            className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer"
            onClick={() => setIsFullscreen(!isFullscreen)}
          />
          <span className="text-xs text-terminal-text-muted ml-2 flex items-center space-x-1.5">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>khalid@hzcode-os: {cwd}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[11px] text-terminal-text-muted px-2 py-0.5 rounded bg-black/30 border border-inherit hidden sm:inline">
            TAB: Autocomplete • `:~` to Toggle
          </span>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-terminal-text-muted hover:text-terminal-text-primary"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-terminal-text-muted hover:text-terminal-text-primary"
              title="Close Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div
        className="flex-1 p-5 overflow-y-auto space-y-2 select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.map((entry) => (
          <div key={entry.id} className="leading-relaxed">
            {entry.type === 'command' && (
              <div className="flex items-center space-x-2 text-terminal-text-primary">
                <span className="text-terminal-primary font-bold">
                  khalid@hzcode:{entry.cwd || '/'} $
                </span>
                <span>{entry.text}</span>
              </div>
            )}
            {entry.type === 'output' && (
              <div className="text-terminal-text-secondary pl-2">{entry.text}</div>
            )}
            {entry.type === 'system' && (
              <div className="text-terminal-secondary pl-2 whitespace-pre-wrap">{entry.text}</div>
            )}
            {entry.type === 'success' && (
              <div className="text-terminal-primary pl-2">{entry.text}</div>
            )}
            {entry.type === 'error' && (
              <div className="text-terminal-accent pl-2">{entry.text}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Prompt */}
      <form
        onSubmit={handleCommand}
        className="px-5 py-3 border-t border-inherit bg-black/20 flex items-center space-x-2"
      >
        <span className="text-terminal-primary font-bold whitespace-nowrap">
          khalid@hzcode:{cwd} $
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-terminal-text-primary focus:outline-none placeholder-terminal-text-muted/40"
          placeholder="Type a command (try 'ls', 'cat about.txt', 'neofetch', 'help')..."
          autoFocus
        />
        <button type="submit" className="text-terminal-text-muted hover:text-terminal-primary">
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
