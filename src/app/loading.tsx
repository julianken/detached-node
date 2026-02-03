export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-600 dark:border-t-zinc-400" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}
