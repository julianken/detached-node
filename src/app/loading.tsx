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
          className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent"
          aria-hidden="true"
        />
        <p className="text-sm text-text-tertiary">
          Loading...
        </p>
        <span className="sr-only">Loading content, please wait</span>
      </div>
    </div>
  );
}
