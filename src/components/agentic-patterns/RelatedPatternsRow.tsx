// ---------------------------------------------------------------------------
// RelatedPatternsRow
// ---------------------------------------------------------------------------
// Cross-link chip row of 2-4 related patterns. Server component.
//
// Resolves slugs via getPattern at render-time. Unresolved slugs are skipped
// silently rather than rendering broken chips — the data layer's CI guard
// (helpers.test.ts: "any non-empty relatedSlugs entry resolves to an existing
// slug") is the authoritative gate. Returns null when nothing resolves so an
// empty header isn't left behind.
//
// v1: chip styling duplicated with framework chips and reference type badges.
// Future: extract <Chip>.

import { Link } from "next-view-transitions";
import type { Pattern } from "@/data/agentic-design-patterns/types";
import { getPattern } from "@/data/agentic-design-patterns/index";

interface RelatedPatternsRowProps {
  pattern: Pattern;
}

export function RelatedPatternsRow({ pattern }: RelatedPatternsRowProps) {
  const related = pattern.relatedSlugs
    .map((slug) => getPattern(slug))
    .filter((p): p is Pattern => p !== undefined);

  if (related.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-patterns-heading">
      <h2
        id="related-patterns-heading"
        className="font-mono text-xl font-semibold tracking-tight text-text-primary"
      >
        Related patterns
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {related.map((rel) => (
          <li key={rel.slug}>
            <Link
              href={`/agentic-design-patterns/${rel.slug}`}
              className="inline-flex items-center rounded-sm border border-border bg-surface px-3 py-1.5 font-mono text-sm text-text-secondary transition-colors hover:border-border-hover hover:bg-hover-bg hover:text-text-primary focus-ring"
            >
              {rel.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
