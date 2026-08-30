import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-surface-main text-text-primary flex items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full">
        <div className="border border-border-subtle bg-surface-container/50 p-8 md:p-12 space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest text-text-secondary">
            [ 404 / NOT FOUND ]
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-text-primary uppercase tracking-tight">
            ARTIFACT NOT FOUND
          </h1>

          <p className="font-sans text-sm md:text-base text-text-secondary leading-relaxed">
            The requested route or system record does not exist in the public knowledge index or has been relocated.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 font-mono text-xs">
            <Link
              href="/"
              className="px-5 py-2.5 bg-text-primary text-surface-main uppercase tracking-wider font-semibold hover:bg-accent-technical transition-colors"
            >
              &larr; Return Home
            </Link>
            <Link
              href="/work"
              className="px-5 py-2.5 border border-border-subtle bg-surface-main text-text-primary uppercase tracking-wider font-semibold hover:border-text-primary transition-colors"
            >
              View Work Archive
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
