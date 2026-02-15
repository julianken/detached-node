export default function PostsLoading() {
  return (
    <div
      className="flex flex-col gap-16 animate-pulse"
      role="status"
      aria-label="Loading posts"
    >
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-32 rounded-sm bg-border/40" />
        <div className="h-5 w-96 max-w-full rounded-sm bg-border/25" />
      </div>

      {/* Post cards */}
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-sm border border-border/50 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-5 w-3/5 rounded-sm bg-border/30" />
              <div className="h-3 w-24 rounded-sm bg-border/20" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded-sm bg-border/15" />
              <div className="h-4 w-4/5 rounded-sm bg-border/15" />
            </div>
            <div className="mt-3 h-3 w-20 rounded-sm bg-border/20" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading posts, please wait</span>
    </div>
  );
}
