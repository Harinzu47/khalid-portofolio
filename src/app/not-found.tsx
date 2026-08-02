import Link from 'next/link';

/**
 * 404 page — terminal style
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="border border-terminal-border bg-terminal-surface rounded p-8">
          {/* Window chrome */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-terminal-border">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-accent opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-600 opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-primary opacity-70" />
            <span className="font-mono text-xs text-terminal-text-muted ml-2">bash — 404</span>
          </div>

          <div className="font-mono text-sm space-y-2">
            <p>
              <span className="text-terminal-primary">$ </span>
              <span className="text-terminal-text-primary">navigate /current-path</span>
            </p>
            <p className="text-terminal-accent">
              bash: /current-path: No such file or directory
            </p>
            <p className="text-terminal-text-muted">exit code: 1</p>
          </div>

          <div className="mt-8 pt-6 border-t border-terminal-border">
            <p className="font-mono text-2xl font-bold text-terminal-primary mb-2">404</p>
            <p className="text-terminal-text-secondary mb-6">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex flex-wrap gap-3 font-mono text-sm">
              <Link
                href="/"
                className="px-4 py-2 border border-terminal-primary text-terminal-primary hover:bg-terminal-primary/10 rounded transition-colors"
              >
                $ cd ~/hzcode
              </Link>
              <Link
                href="/projects"
                className="px-4 py-2 border border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted rounded transition-colors"
              >
                ls projects/
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
