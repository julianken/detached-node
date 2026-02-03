import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">404</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Page not found
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The page you are looking for does not exist, or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-zinc-600 dark:text-zinc-400 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
