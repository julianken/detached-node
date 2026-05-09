// ---------------------------------------------------------------------------
// HubHero
// ---------------------------------------------------------------------------
// Hub-page title band. Server component. Emits the hub's single <h1>.
//
// Composes LivingCatalogBadge for the "Updated [month YYYY]" pill so the
// reader gets an immediate signal that this is a maintained reference.

import { getCatalogDateModified } from "@/data/agentic-design-patterns/index";
import { LivingCatalogBadge } from "./LivingCatalogBadge";

export function HubHero() {
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
    </header>
  );
}
