// ---------------------------------------------------------------------------
// RelatedPosts
// ---------------------------------------------------------------------------
// Bottom-of-post block listing 2-4 related posts. Renders at the end of every
// post detail page so internal cross-linking is always present, both for
// human "what else?" navigation and for AI-crawler topical-graph signal.
//
// Selection is delegated to `getRelatedPosts` (see
// `src/lib/queries/related-posts.ts`) which guarantees ≥ 2 and ≤ 4 results
// via a tag-overlap primary + most-recent fallback chain. If the query
// returns < 2 (only possible at corpus size < 3 total published posts),
// this component returns null so an empty section never renders.
//
// Server component. Visual conventions match `PatternCard` and the post
// detail page header — same `card-trace` chrome, same font-mono title, same
// text hierarchy. Heading uses <h2> because it sits under the post's <h1>
// inside an <article>.
//
// Issue: julianken/detached-node#420

import { Link } from "next-view-transitions";
import { formatDate } from "@/lib/formatting";
import { getRelatedPosts } from "@/lib/queries/related-posts";
import type { Post } from "@/payload-types";

interface RelatedPostsProps {
  post: Post;
}

export async function RelatedPosts({ post }: RelatedPostsProps) {
  const related = await getRelatedPosts(post);

  // Defensive: the query enforces a floor of 2, but if the entire corpus is
  // < 3 published posts (which is the only case where the floor cannot be
  // met) render nothing rather than a single-item "related" list. At the
  // current corpus of 4 posts this branch is theoretical.
  if (related.length < 2) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="scroll-mt-24"
    >
      <h2
        id="related-posts-heading"
        className="text-2xl font-semibold tracking-tight text-text-primary"
      >
        Related Posts
      </h2>
      <ul className="mt-4 flex flex-col gap-4 list-none p-0">
        {related.map((p) => (
          <li key={p.id}>
            <Link
              href={`/posts/${p.slug}`}
              className="group card-trace card-scanline relative block rounded-sm border border-border bg-surface p-6 transition-colors hover:border-border-hover hover:bg-hover-bg hover:shadow-sm focus-ring"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-mono text-card-title font-semibold tracking-tight text-text-primary [text-wrap:balance]">
                  {p.title}
                </h3>
                {p.publishedAt && (
                  <span className="text-meta tracking-[0.03em] text-text-tertiary sm:whitespace-nowrap">
                    {formatDate(p.publishedAt)}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-prose text-card-summary leading-relaxed text-text-secondary [text-wrap:pretty]">
                {p.summary}
              </p>
              <p className="mt-3 text-meta font-medium text-accent group-hover:text-accent-muted transition-colors">
                Read more →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
