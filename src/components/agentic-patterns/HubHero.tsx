// ---------------------------------------------------------------------------
// HubHero
// ---------------------------------------------------------------------------
// Hub-page title band. Server component. Emits the hub's single <h1>.
//
// Pattern count is derived dynamically from getCatalogPatternCount() — never
// hardcoded. When patterns are added/retired, the eyebrow line updates with
// the next deploy.
//
// Composes LivingCatalogBadge for the "Updated [month YYYY]" pill so the
// reader gets an immediate signal that this is a maintained reference.

import { getCatalogDateModified, getCatalogPatternCount } from "@/data/agentic-design-patterns/index";
import { LivingCatalogBadge } from "./LivingCatalogBadge";

export function HubHero() {
  const count = getCatalogPatternCount();
  const lastUpdated = getCatalogDateModified();

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <LivingCatalogBadge isoDate={lastUpdated} />
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-text-tertiary">
          Reference
        </span>
      </div>
      <h1 className="font-mono text-page-h1 font-semibold tracking-tight text-text-primary [text-wrap:balance]">
        Agentic Design Patterns
      </h1>
      <p className="max-w-prose text-body leading-relaxed text-text-secondary [text-wrap:pretty]">
        A field-aware reference covering {count} patterns for building agentic systems —
        organized by the question each pattern answers, not by the year it was named.
      </p>
    </header>
  );
}
