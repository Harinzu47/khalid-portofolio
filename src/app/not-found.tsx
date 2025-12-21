import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

/**
 * 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
      <div className="text-center">
        <AlertTriangle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/30"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
