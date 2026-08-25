'use client';

import React, { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/actions/auth';
import { Lock, Mail, Terminal, AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await loginAction({ email, password }, redirectTo);
      if (result && !result.success) {
        setErrorMessage(result.error || 'Authentication failed.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <div className="w-full max-w-md border border-terminal-border rounded-lg bg-terminal-surface shadow-2xl overflow-hidden">
      {/* Terminal Window Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-terminal-bg border-b border-terminal-border">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-terminal-accent/80" />
          <span className="w-3 h-3 rounded-full bg-terminal-purple/80" />
          <span className="w-3 h-3 rounded-full bg-terminal-primary/80" />
        </div>
        <div className="flex items-center text-xs font-mono text-terminal-text-muted">
          <Terminal className="w-3.5 h-3.5 mr-1.5 text-terminal-primary" />
          <span>auth.session.init</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Login Form Body */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-xl font-bold font-mono text-terminal-text-primary tracking-tight">
            Developer OS Console
          </h1>
          <p className="text-xs text-terminal-text-secondary font-mono">
            Enter authorized operator credentials to access the CMS command center.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start space-x-2.5 p-3.5 rounded bg-terminal-accent/10 border border-terminal-accent/30 text-terminal-accent text-xs font-mono"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-mono text-terminal-text-secondary"
            >
              Operator Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-terminal-text-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="khalid@domain.com"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-terminal-bg border border-terminal-border rounded focus:outline-none focus:border-terminal-secondary focus:ring-1 focus:ring-terminal-secondary text-terminal-text-primary placeholder:text-terminal-text-muted transition-colors disabled:opacity-50"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] font-mono text-terminal-accent">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-mono text-terminal-text-secondary"
            >
              Master Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-terminal-text-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-terminal-bg border border-terminal-border rounded focus:outline-none focus:border-terminal-secondary focus:ring-1 focus:ring-terminal-secondary text-terminal-text-primary placeholder:text-terminal-text-muted transition-colors disabled:opacity-50"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] font-mono text-terminal-accent">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded font-mono text-sm font-semibold bg-terminal-primary text-terminal-bg hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-terminal-primary focus:ring-offset-2 focus:ring-offset-terminal-bg"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>$ authenticate --session</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-terminal-border text-center">
          <p className="text-[11px] font-mono text-terminal-text-muted">
            Personal Developer OS • Single Operator Security Baseline
          </p>
        </div>
      </div>
    </div>
  );
}
