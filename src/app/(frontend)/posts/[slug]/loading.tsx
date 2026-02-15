export default function PostLoading() {
  return (
    <div
      className="mx-auto flex max-w-3xl flex-col gap-16 animate-pulse"
      role="status"
      aria-label="Loading article"
    >
      {/* Back link */}
      <div className="h-4 w-24 rounded-sm bg-border/30" />

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="h-3 w-20 rounded-sm bg-border/20" />
        <div className="h-8 w-4/5 rounded-sm bg-border/40" />
        <div className="h-8 w-2/5 rounded-sm bg-border/40" />
        <div className="h-3 w-32 rounded-sm bg-border/20" />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="h-5 w-full rounded-sm bg-border/25" />
        <div className="h-5 w-3/4 rounded-sm bg-border/25" />
      </div>

      {/* Body lines */}
      <div className="space-y-3">
        <div className="h-4 w-full rounded-sm bg-border/15" />
        <div className="h-4 w-full rounded-sm bg-border/15" />
        <div className="h-4 w-5/6 rounded-sm bg-border/15" />
        <div className="h-4 w-full rounded-sm bg-border/15" />
        <div className="h-4 w-4/6 rounded-sm bg-border/15" />
        <div className="h-4 w-0 rounded-sm" />
        <div className="h-4 w-full rounded-sm bg-border/15" />
        <div className="h-4 w-full rounded-sm bg-border/15" />
        <div className="h-4 w-3/5 rounded-sm bg-border/15" />
      </div>

      <span className="sr-only">Loading article, please wait</span>
    </div>
  );
}
