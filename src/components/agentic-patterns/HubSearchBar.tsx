"use client";

// ---------------------------------------------------------------------------
// HubSearchBar
// ---------------------------------------------------------------------------
// The ONLY client component in the agentic-patterns suite.
//
// In this issue (#156) HubSearchBar is intentionally SELF-CONTAINED:
//   - manages its own input state
//   - handles the `/` keyboard shortcut to focus the input
//   - debounces query updates and emits an ARIA live region announcement
//   - DOES NOT have any callback prop (no onResults, onChange, onFilter, ...)
// Filter-state coordination with the grid lives in the wrapper component
// introduced by issue #157 (HubFilterableContent). Adding any callback prop
// here would couple this issue to that one prematurely.
//
// React 19 + hydration:
//   - Initial query state MUST be '' on first render (server === client).
//   - URL/localStorage hydration goes inside useEffect to avoid SSR
//     hydration mismatch.
// useTransition is used for the announcement update — it doesn't require
// Suspense and lets the typing path stay urgent while the live-region
// announcement update is non-urgent.

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { searchPatterns } from "@/lib/pattern-search";
import { PATTERNS } from "@/data/agentic-design-patterns/index";
import { LAYERS } from "@/data/agentic-design-patterns/layers";

const DEBOUNCE_MS = 150;

/**
 * The `/` shortcut should focus the search input — UNLESS the user is already
 * typing in another input/textarea/contenteditable element. Otherwise the `/`
 * keystroke gets swallowed mid-sentence anywhere on the page, which is a
 * universally hated UX.
 */
function shouldHandleSlashShortcut(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return true;
  if (target.isContentEditable) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return false;
  return true;
}

export function HubSearchBar() {
  // Initial state MUST be empty string on first render. Hydrating from URL or
  // localStorage happens inside useEffect (see below) so SSR === first client
  // render and React 19 doesn't warn about a hydration mismatch.
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
    // We intentionally only hydrate once on mount; ignore subsequent renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce the query → debouncedQuery transition. The text input itself
  // updates synchronously (urgent) so typing feels instant; the result count
  // (driven by debouncedQuery) follows along after the user pauses.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(query);
      });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  // Global `/` shortcut — focus the input unless the user is already typing.
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

  // Memoize the LAYERS lookup map so search runs on every keystroke don't
  // rebuild it. Same for the catalog reference itself.
  const layerLabels = useMemo(() => {
    const out: Record<string, string> = {};
    for (const l of LAYERS) {
      out[l.id] = `Layer ${l.number} — ${l.title}`;
    }
    return out;
  }, []);

  const matchCount = useMemo(() => {
    if (debouncedQuery.trim().length === 0) return PATTERNS.length;
    return searchPatterns(PATTERNS, debouncedQuery, layerLabels).length;
  }, [debouncedQuery, layerLabels]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    [],
  );

  const announcement = `${matchCount} ${matchCount === 1 ? "pattern" : "patterns"} found`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="hub-search" className="sr-only">
        Search patterns
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="hub-search"
          type="search"
          value={query}
          onChange={handleChange}
          aria-label="Search patterns"
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
      {/*
        ARIA live region — announces the result count to assistive tech.
        - aria-live="polite" (NOT "assertive") so it doesn't interrupt
        - aria-atomic so the entire message is read on each update
        - role="status" pairs with aria-live for broader AT support
      */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </p>
    </div>
  );
}
