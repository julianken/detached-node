import { Link } from "next-view-transitions";
import { OptimizedImage } from "@/components/OptimizedImage";
import type { Media } from "@/payload-types";

interface PostCardProps {
  title: string;
  date?: string;
  summary: string;
  href: string;
  featuredImage?: Media | null;
  label?: string;
}

export function PostCard({ title, date, summary, href, featuredImage, label }: PostCardProps) {
  return (
    <Link
      href={href}
      className="group card-trace card-scanline relative rounded-sm border border-border bg-surface p-6 transition-colors hover:border-border-hover hover:bg-hover-bg hover:shadow-sm focus-ring"
    >
      {label && (
        <span className="frame-label" aria-hidden="true">
          {label}
        </span>
      )}
      {featuredImage && featuredImage.url && (
        <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-sm">
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
        <h2 className="font-mono text-lg font-semibold tracking-tight text-text-primary [text-wrap:balance]">{title}</h2>
        {date && <span className="text-xs tracking-[0.03em] text-text-tertiary sm:whitespace-nowrap">{date}</span>}
      </div>
      <p className="mt-2 max-w-prose text-base leading-6 text-text-secondary [text-wrap:pretty]">{summary}</p>
      <p className="mt-3 text-sm font-medium text-accent group-hover:text-accent-muted transition-colors">
        Read more →
      </p>
    </Link>
  );
}
