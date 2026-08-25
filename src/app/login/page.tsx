import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Operator Login — Personal Developer OS',
  description: 'Administrative command center authentication for Personal Developer OS.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-lg border border-terminal-border bg-terminal-surface animate-pulse" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
