import Link from "next/link";

interface PostCardProps {
  title: string;
  date?: string;
  summary: string;
  href: string;
}

export function PostCard({ title, date, summary, href }: PostCardProps) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 transition hover:border-zinc-400 dark:hover:border-zinc-500"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        {date && <span className="text-xs text-zinc-500 dark:text-zinc-400">{date}</span>}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{summary}</p>
    </Link>
  );
}
