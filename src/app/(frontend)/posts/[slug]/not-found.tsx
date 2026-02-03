import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">404</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Post not found
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This post does not exist, or may have been removed.
          </p>
        </div>
        <Link
          href="/posts"
          className="text-sm text-zinc-600 dark:text-zinc-400 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Browse all posts
        </Link>
      </div>
    </div>
  );
}
