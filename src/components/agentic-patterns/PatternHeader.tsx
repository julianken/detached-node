// ---------------------------------------------------------------------------
// PatternHeader
// ---------------------------------------------------------------------------
// Satellite-page header for an individual pattern. Server component.
//
// Emits the satellite page's single <h1> (the pattern name). The layer
// eyebrow is a non-heading styled span — DO NOT promote it to a heading
// (Lighthouse a11y enforces one <h1> per page).
//
// Renders alternative names inline as a comma-separated synonym list, since
// these are how readers find the pattern under names from other sources.

import type { LayerId, Pattern } from "@/data/agentic-design-patterns/types";
import { LAYERS } from "@/data/agentic-design-patterns/layers";

interface PatternHeaderProps {
  pattern: Pattern;
}

function getLayerLabel(layerId: LayerId): string {
  const layer = LAYERS.find((l) => l.id === layerId);
  if (!layer) return layerId;
  return `Layer ${layer.number} — ${layer.title}`;
}

export function PatternHeader({ pattern }: PatternHeaderProps) {
  const layerLabel = getLayerLabel(pattern.layerId);
  const altNames = pattern.alternativeNames ?? [];

  return (
    <header className="flex flex-col gap-3">
      {/* Eyebrow: layer attribution. Styled span (NOT a heading). */}
      <span
        className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary"
      >
        {layerLabel}
      </span>
      <h1 className="font-mono text-3xl font-semibold tracking-tight text-text-primary [text-wrap:balance]">
        {pattern.name}
      </h1>
      {altNames.length > 0 && (
        <p className="text-sm text-text-tertiary">
          <span className="font-mono uppercase tracking-[0.05em]">Also known as:</span>{" "}
          <span className="italic">{altNames.join(", ")}</span>
        </p>
      )}
      {pattern.oneLineSummary && (
        <p className="max-w-prose text-lg leading-7 text-text-secondary [text-wrap:pretty]">
          {pattern.oneLineSummary}
        </p>
      )}
    </header>
  );
}
