import Link from "next/link";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between py-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Mind-Controlled
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="hover:text-zinc-900 dark:hover:text-zinc-100" href="/">
            Home
          </Link>
          <Link className="hover:text-zinc-900 dark:hover:text-zinc-100" href="/posts">
            Posts
          </Link>
          <Link className="hover:text-zinc-900 dark:hover:text-zinc-100" href="/about">
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1 pb-16">{children}</main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>Mind-Controlled. All rights reserved.</p>
          <div className="flex gap-4">
            <Link className="hover:text-zinc-900 dark:hover:text-zinc-100" href="/posts">
              Posts
            </Link>
            <Link className="hover:text-zinc-900 dark:hover:text-zinc-100" href="/about">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
