// ---------------------------------------------------------------------------
// PatternCard
// ---------------------------------------------------------------------------
// Hub grid card for a single agentic pattern. Server component (no client JS).
//
// Visual parity with PostCard:
// - Uses card-trace + card-scanline utilities (animated chrome on hover)
// - Heading className matches PostCard verbatim — including font-mono, the
//   text-wrap and tracking tokens. Without font-mono the title falls back to
//   the body serif and breaks visual parity with PostCard.
// - Layer/refs corner uses the frame-label utility (NOT inline span styling).
//
// Heading level is configurable: <h3> when the card sits under a flat layer
// section (parent <h2>), <h4> when under a topology sub-tier (parent <h3>).
//
// v1: chip styling duplicated across components (frame-label, framework chips,
// related chips, reference type badges). Acceptable as v1 — future refactor
// extracts a <Chip> primitive.

import { Link } from "next-view-transitions";
import type { Pattern } from "@/data/agentic-design-patterns/types";

interface PatternCardProps {
  /** Pattern object — passed whole, not destructured at the boundary. */
  pattern: Pattern;
  /** Heading level — 3 under flat layer sections, 4 under topology sub-tiers. */
  headingLevel: 3 | 4;
}

export function PatternCard({ pattern, headingLevel }: PatternCardProps) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  const href = `/agentic-design-patterns/${pattern.slug}`;
  const refsCount = pattern.references.length;
  // Corner label: "REFS · N" tells the reader at a glance how grounded the
  // pattern is. Empty references render the pattern name itself as fallback
  // (avoids rendering "REFS · 0" which reads as a defect).
  const cornerLabel = refsCount > 0 ? `REFS · ${refsCount}` : pattern.name.toUpperCase();

  return (
    <Link
      href={href}
      className="group card-trace card-scanline relative block rounded-sm border border-border bg-surface p-6 transition-colors hover:border-border-hover hover:bg-hover-bg hover:shadow-sm focus-ring"
    >
      <span className="frame-label" aria-hidden="true">
        {cornerLabel}
      </span>
      <Heading className="font-mono text-lg font-semibold tracking-tight text-text-primary [text-wrap:balance]">
        {pattern.name}
      </Heading>
      {pattern.oneLineSummary && (
        <p className="mt-2 max-w-prose text-base leading-6 text-text-secondary [text-wrap:pretty]">
          {pattern.oneLineSummary}
        </p>
      )}
      <p className="mt-3 text-sm font-medium text-accent group-hover:text-accent-muted transition-colors">
        Open pattern →
      </p>
    </Link>
  );
}
