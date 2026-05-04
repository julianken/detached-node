"use client";

// ---------------------------------------------------------------------------
// HubFilterableContent
// ---------------------------------------------------------------------------
// Client wrapper that owns the search-query state and renders a filtered
// view of the catalog. The ONE 'use client' island added by issue #157.
//
// Architecture choice (Option A — duplicate the input/keyboard logic):
// HubSearchBar (T2-C, #156) ships intentionally callback-free; it is a
// drop-in self-contained search input that announces match counts via a
// live region. To avoid coupling the two issues prematurely (#156 explicitly
// forbade callback props), HubFilterableContent re-implements the same
// debounce + `/`-shortcut behavior directly here so it can OWN the
// debouncedQuery and pass a filtered Pattern[] down to a hub-grid view.
//
// The trade-off vs. wrapping HubSearchBar via a DOM-event listener
// (Option B): cleaner React data flow, simpler React tree, but the input
// markup must stay visually in sync with HubSearchBar. If the search bar's
// shape changes, this file must mirror that.
//
// Hydration: initial query state is '' on first render (server === client).
// `?q=` URL hydration runs inside useEffect.
//
// Filtering: searchPatterns is pure and operates on the FULL catalog. The
// filtered view is grouped by layer, mirroring the static HubGrid grouping
// so the layered hierarchy is preserved while filtering. When debouncedQuery
// is empty AND no `?layer=` URL param is set, we render the original HubGrid
// (no churn for the common path).
//
// `?layer=` SSR filter (per spec § 337) is applied by the parent server
// component before this client island; the layer prop here narrows what
// patterns this island sees on the server. Client-side we read `?layer=` from
// the URL to know whether to stay in the filtered-grid path (instead of
// falling back to HubGrid which re-reads the full catalog).

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { searchPatterns } from "@/lib/pattern-search";
import { LAYERS } from "@/data/agentic-design-patterns/layers";
import type { Layer, Pattern } from "@/data/agentic-design-patterns/types";
import { PatternCard } from "./PatternCard";
import { HubGrid } from "./HubGrid";

const DEBOUNCE_MS = 150;

/**
 * The `/` shortcut should focus the search input — UNLESS the user is already
 * typing in another input/textarea/contenteditable element.
 */
function shouldHandleSlashShortcut(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return false;
  return true;
}

interface HubFilterableContentProps {
  /**
   * Patterns to expose to the client. The parent server component is
   * responsible for any `?layer=` SSR filtering before passing this in.
   */
  patterns: Pattern[];
  /**
   * Whether a `?layer=` SSR filter was applied. When true, the component stays
   * in the filtered-grid path even when debouncedQuery is empty — prevents
   * HubGrid from re-reading the full catalog on hydration and overriding the
   * SSR layer filter. Must be known at render time (not via useEffect) to avoid
   * a flash of all layers before hydration completes.
   */
  layerFiltered?: boolean;
}

export function HubFilterableContent({ patterns, layerFiltered = false }: HubFilterableContentProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate from `?q=` if present — runs after first paint to keep SSR happy.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q !== query) {
      setQuery(q);
      setDebouncedQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce query → debouncedQuery
  useEffect(() => {
    const handle = window.setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(query);
      });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  // Global `/` shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!shouldHandleSlashShortcut(e.target)) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Memoized layer-label map (used both for searching and for grouping
  // headings in the filtered view).
  const layerLabels = useMemo(() => {
    const out: Record<string, string> = {};
    for (const l of LAYERS) {
      out[l.id] = `Layer ${l.number} — ${l.title}`;
    }
    return out;
  }, []);

  const filtered = useMemo(() => {
    if (debouncedQuery.trim().length === 0) return patterns;
    return searchPatterns(patterns, debouncedQuery, layerLabels);
  }, [patterns, debouncedQuery, layerLabels]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    [],
  );

  const matchCount = filtered.length;
  const announcement = `${matchCount} ${matchCount === 1 ? "pattern" : "patterns"} found`;
  // Use filtered-grid path when actively searching OR when the server applied a
  // `?layer=` filter (layerFiltered prop). Without the layerFiltered check,
  // HubGrid re-reads the full catalog on hydration and overrides the SSR layer
  // filter, causing a flash of all 5 layers.
  const isFiltering = debouncedQuery.trim().length > 0 || layerFiltered;

  // Group filtered patterns by layer for rendering. Preserves catalog order
  // within each layer (searchPatterns is order-preserving).
  const groupedByLayer = useMemo(() => {
    if (!isFiltering) return null;
    const groups: Array<{ layer: Layer; patterns: Pattern[] }> = [];
    for (const layer of LAYERS) {
      const inLayer = filtered.filter((p) => p.layerId === layer.id);
      if (inLayer.length > 0) {
        groups.push({ layer, patterns: inLayer });
      }
    }
    return groups;
  }, [filtered, isFiltering]);

  return (
    <div className="flex flex-col gap-12">
      {/* Search input — markup mirrors HubSearchBar (T2-C). */}
      <div className="flex flex-col gap-2">
        <label htmlFor="hub-search" className="sr-only">
          Search agentic design patterns
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="hub-search"
            type="search"
            value={query}
            onChange={handleChange}
            aria-label="Search agentic design patterns"
            aria-describedby="hub-search-hint"
            placeholder="Search patterns…"
            className="w-full rounded-sm border border-border bg-surface px-4 py-2.5 pr-16 font-mono text-base text-text-primary placeholder:text-text-tertiary focus-ring"
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-text-tertiary"
          >
            /
          </kbd>
        </div>
        <p id="hub-search-hint" className="text-xs text-text-tertiary">
          Press <kbd className="rounded-sm border border-border bg-surface px-1 font-mono text-[0.65rem]">/</kbd>{" "}
          to focus. Searches name, alternative names, summary, and layer.
        </p>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </p>
      </div>

      {/* When not filtering, defer to the canonical layered HubGrid (which
          handles topology sub-tiers, dynamic counts, and the single-h1
          hierarchy). When filtering, render a flat layer-grouped view. */}
      {!isFiltering ? (
        <HubGrid />
      ) : groupedByLayer && groupedByLayer.length > 0 ? (
        <div className="flex flex-col gap-16">
          {groupedByLayer.map(({ layer, patterns: layerPatterns }) => (
            <section
              key={layer.id}
              className="flex flex-col gap-6"
              aria-labelledby={`filtered-layer-heading-${layer.id}`}
            >
              <header className="flex flex-col gap-1">
                <h2
                  id={`filtered-layer-heading-${layer.id}`}
                  className="font-mono text-2xl font-semibold tracking-tight text-text-primary"
                >
                  Layer {layer.number} — {layer.title}
                </h2>
                <p className="text-sm text-text-tertiary italic">{layer.question}</p>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {layerPatterns.map((p) => (
                  <PatternCard key={p.slug} pattern={p} headingLevel={3} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-base text-text-secondary">
          No patterns match <span className="font-mono text-text-primary">{debouncedQuery}</span>.
        </p>
      )}
    </div>
  );
}
