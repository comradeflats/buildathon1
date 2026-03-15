'use client';

// This file handles errors at the root level of the app
// https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Application Error
            </h1>

            <p className="text-zinc-400 mb-6">
              A critical error occurred. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-400 mb-2">
                  Error details (dev only)
                </summary>
                <pre className="text-xs bg-zinc-950 p-4 rounded-lg overflow-auto max-h-64 text-red-400 border border-zinc-800">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
