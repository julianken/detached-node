import Link from "next/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import type { Media } from "@/payload-types";

interface PostCardProps {
  title: string;
  date?: string;
  summary: string;
  href: string;
  featuredImage?: Media | null;
}

export function PostCard({ title, date, summary, href, featuredImage }: PostCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:shadow-sm focus-ring"
    >
      {featuredImage && featuredImage.url && (
        <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-xl">
          <OptimizedImage
            src={featuredImage.url}
            alt={featuredImage.alt || title}
            width={featuredImage.width || 800}
            height={featuredImage.height || 450}
            className="w-full transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
        {date && <span className="text-xs text-zinc-500 dark:text-zinc-400 sm:whitespace-nowrap">{date}</span>}
      </div>
      <p className="mt-2 max-w-prose text-base leading-6 text-zinc-600 dark:text-zinc-400">{summary}</p>
      <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
        Read more →
      </p>
    </Link>
  );
}
