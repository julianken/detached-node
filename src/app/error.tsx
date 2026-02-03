"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
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
        </div>
        <button
          onClick={() => reset()}
          className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
