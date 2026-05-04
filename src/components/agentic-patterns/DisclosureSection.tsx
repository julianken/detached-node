// ---------------------------------------------------------------------------
// DisclosureSection
// ---------------------------------------------------------------------------
// Wraps content in a native <details>/<summary> shell with the design-system
// chrome. No client JS — <details> handles open/close natively.
//
// Used by the spec-sheet layout to demote prose surfaces (Overview,
// Background) below the structured reference content while keeping them
// available to depth-readers.
//
// The summary line is a styled label (font-mono uppercase) plus a chevron
// glyph that flips on open via the `details[open]` selector.

import type { ReactNode } from "react";

interface DisclosureSectionProps {
  /** id on the <section> wrapper for jump-link anchoring */
  id?: string;
  /** Summary label text, e.g. "Overview · 1-paragraph mechanism" */
  label: string;
  /** Whether the disclosure is open by default */
  defaultOpen?: boolean;
  children: ReactNode;
}

export function DisclosureSection({
  id,
  label,
  defaultOpen = false,
  children,
}: DisclosureSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <details
        open={defaultOpen}
        className="group rounded-sm border border-border-subtle bg-bg [&[open]_.disclosure-glyph]:rotate-90"
      >
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary transition-colors hover:text-text-secondary">
          <span className="disclosure-glyph inline-block transition-transform" aria-hidden="true">
            ▸
          </span>
          {label}
        </summary>
        <div className="border-t border-border-subtle px-4 py-4">{children}</div>
      </details>
    </section>
  );
}
