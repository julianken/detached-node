import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-mono text-6xl font-semibold tracking-tight text-text-primary">
            404
          </h1>
          <h2 className="font-mono text-2xl font-semibold tracking-tight text-text-primary">
            Page Not Found
          </h2>
          <p className="text-sm text-text-secondary">
            The page you are looking for does not exist, or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-text-secondary underline underline-offset-4 hover:text-accent focus-ring"
          aria-label="Return to home page"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
