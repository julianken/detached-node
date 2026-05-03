// ---------------------------------------------------------------------------
// PrevNextNav
// ---------------------------------------------------------------------------
// Layer-scoped (and topology-tier-scoped) prev/next navigation at the bottom
// of a satellite page. Server component.
//
// Uses getAdjacentPatterns from the data layer — that helper handles the
// scope rules (same layer; for topology, same sub-tier). When a pattern is
// at an edge (or alone in its scope, e.g. 12-factor-agent in methodology),
// the missing side renders as a disabled placeholder so the visual rhythm
// stays balanced.

import { Link } from "next-view-transitions";
import type { Pattern } from "@/data/agentic-design-patterns/types";
import { getAdjacentPatterns } from "@/data/agentic-design-patterns/index";

interface PrevNextNavProps {
  pattern: Pattern;
}

interface NavLinkProps {
  pattern: Pattern;
  direction: "prev" | "next";
}

function NavLink({ pattern, direction }: NavLinkProps) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={`/agentic-design-patterns/${pattern.slug}`}
      className={`group flex flex-col gap-1 rounded-sm border border-border bg-surface p-4 transition-colors hover:border-border-hover hover:bg-hover-bg focus-ring ${
        isPrev ? "items-start text-left" : "items-end text-right"
      }`}
    >
      <span className="font-mono text-xs uppercase tracking-[0.1em] text-text-tertiary">
        {isPrev ? "← Previous" : "Next →"}
      </span>
      <span className="font-mono text-base font-semibold text-text-primary group-hover:text-accent">
        {pattern.name}
      </span>
    </Link>
  );
}

function NavPlaceholder({ direction }: { direction: "prev" | "next" }) {
  // Aria-hidden so screen-reader users don't get confusing empty slots.
  // Visual-only spacer to keep layout balanced when one side has no peer.
  const isPrev = direction === "prev";
  return (
    <div
      aria-hidden="true"
      className={`hidden flex-col gap-1 rounded-sm border border-dashed border-border-subtle bg-transparent p-4 sm:flex ${
        isPrev ? "items-start" : "items-end"
      }`}
    >
      <span className="font-mono text-xs uppercase tracking-[0.1em] text-text-tertiary opacity-40">
        {isPrev ? "← Previous" : "Next →"}
      </span>
      <span className="font-mono text-base text-text-tertiary opacity-40">—</span>
    </div>
  );
}

export function PrevNextNav({ pattern }: PrevNextNavProps) {
  const { prev, next } = getAdjacentPatterns(pattern.slug);

  // If both sides are null (only happens for sole-occupant tiers like
  // 12-factor-agent in methodology), don't render the nav at all.
  if (prev === null && next === null) {
    return null;
  }

  return (
    <nav
      aria-label="Adjacent patterns"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {prev ? <NavLink pattern={prev} direction="prev" /> : <NavPlaceholder direction="prev" />}
      {next ? <NavLink pattern={next} direction="next" /> : <NavPlaceholder direction="next" />}
    </nav>
  );
}
