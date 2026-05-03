// ---------------------------------------------------------------------------
// pattern-search
// ---------------------------------------------------------------------------
// Pure search function over the Pattern catalog. Used by HubFilterableContent
// (#157) to filter the visible cards and compute the result count.
//
// Search rules:
//   - Empty / whitespace-only query → returns ALL patterns (acts as identity)
//   - Match against name, alternativeNames, oneLineSummary, AND layer label
//   - Case-insensitive
//   - Prefix matches OR substring matches (both qualify)
//
// Layer-label matching means typing "topology" or even "control flow" pulls
// up every pattern in that layer — readers don't need to know each pattern
// name to discover relevant ones.
//
// Determinism: the function preserves input order. Callers control sorting.

import type { LayerId, Pattern } from "@/data/agentic-design-patterns/types";

/**
 * Map of layer id → human-readable label (e.g. "Layer 1 — Topology / Control Flow").
 * Passed in from the caller so this lib stays free of UI-shaped strings.
 */
export type LayerLabelMap = Partial<Record<LayerId, string>>;

function matchesQuery(haystack: string, needleLower: string): boolean {
  const hay = haystack.toLowerCase();
  // Prefix match short-circuit (cheaper than substring scan when query is
  // a common prefix); falls back to substring on miss.
  return hay.startsWith(needleLower) || hay.includes(needleLower);
}

/**
 * Return the subset of `patterns` matching `query`.
 *
 * @param patterns - the full catalog (or any pre-filtered subset)
 * @param query - user-supplied query; empty/whitespace returns all
 * @param layerLabels - optional map id → label so layer text is searchable
 */
export function searchPatterns(
  patterns: Pattern[],
  query: string,
  layerLabels: LayerLabelMap = {},
): Pattern[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return patterns;
  }
  const needle = trimmed.toLowerCase();

  return patterns.filter((p) => {
    if (matchesQuery(p.name, needle)) return true;

    if (p.alternativeNames) {
      for (const alt of p.alternativeNames) {
        if (matchesQuery(alt, needle)) return true;
      }
    }

    if (p.oneLineSummary && matchesQuery(p.oneLineSummary, needle)) return true;

    const layerLabel = layerLabels[p.layerId];
    if (layerLabel && matchesQuery(layerLabel, needle)) return true;

    return false;
  });
}
