import type { Metadata } from 'next';
import { InteractiveTerminalCLI } from '@/components/terminal/InteractiveTerminalCLI';
import { Terminal as TerminalIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terminal CLI Mode | Khalid Jundullah',
  description:
    'Full-featured interactive terminal shell emulator with virtual filesystem, bash commands, tab autocompletion, and telemetry tools.',
};

export const dynamic = 'force-static';

export default function TerminalPage() {
  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 font-mono">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-terminal-primary text-xs">
            <TerminalIcon className="w-4 h-4" />
            <span>developer.terminal_cli</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-terminal-text-primary tracking-tight">
            Interactive Terminal CLI
          </h1>
          <p className="text-xs sm:text-sm text-terminal-text-secondary">
            Execute native shell commands across the virtual filesystem. Type <code className="text-terminal-primary">help</code> or <code className="text-terminal-primary">ls</code> to explore.
          </p>
        </div>

        {/* Full Terminal Component */}
        <InteractiveTerminalCLI />
      </div>
    </main>
  );
}
