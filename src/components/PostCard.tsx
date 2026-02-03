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
      className="rounded-xl border border-zinc-200 p-6 transition hover:border-zinc-400"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {date && <span className="text-xs text-zinc-500">{date}</span>}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{summary}</p>
    </Link>
  );
}
