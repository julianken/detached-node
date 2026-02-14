"use client";

import { useEffect } from "react";
import { logError } from "@/lib/logging";
import { ErrorIds } from "@/lib/error-ids";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging with full context
    logError(
      'Client-side error boundary caught error',
      error,
      {
        digest: error.digest,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: new Date().toISOString(),
      },
      ErrorIds.RENDER_ERROR
    );

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example Sentry integration:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     tags: { digest: error.digest, errorId: ErrorIds.RENDER_ERROR },
    //     contexts: {
    //       userAgent: window.navigator.userAgent,
    //       url: window.location.href,
    //     },
    //   });
    // }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            An unexpected error occurred. The system may be experiencing issues.
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 font-mono mt-2">
              Error ID: {error.digest}
            </p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                Technical details (dev only)
              </summary>
              <pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 p-3 rounded overflow-auto max-w-lg border border-zinc-200 dark:border-zinc-700">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="rounded-full bg-zinc-900 dark:bg-zinc-100 px-5 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300 focus-ring"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
