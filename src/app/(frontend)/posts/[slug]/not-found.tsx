import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium font-mono text-text-tertiary">404</p>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-text-primary">
            Post not found
          </h1>
          <p className="text-sm text-text-secondary">
            This post does not exist, or may have been removed.
          </p>
        </div>
        <Link
          href="/posts"
          className="text-sm text-text-secondary underline underline-offset-4 hover:text-accent focus-ring"
        >
          Browse all posts
        </Link>
      </div>
    </div>
  );
}
