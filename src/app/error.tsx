"use client";

import { useEffect } from "react";
import { logError } from "@/lib/logging";
import { ErrorIds } from "@/lib/error-ids";
import { Button } from "@/components/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
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
  }, [error]);

  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-text-primary">
            Something went wrong
          </h1>
          <p className="text-sm text-text-secondary">
            An unexpected error occurred. The system may be experiencing issues.
          </p>
          {error.digest && (
            <p className="text-xs text-text-tertiary font-mono mt-2">
              Error ID: {error.digest}
            </p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-text-tertiary hover:text-text-secondary">
                Technical details (dev only)
              </summary>
              <pre className="mt-2 text-xs bg-surface p-3 rounded overflow-auto max-w-lg border border-border">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <Button onClick={() => reset()} aria-label="Retry loading the page">
          Try again
        </Button>
      </div>
    </div>
  );
}
