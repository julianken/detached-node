export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading...
        </p>
        <span className="sr-only">Loading content, please wait</span>
      </div>
    </div>
  );
}
