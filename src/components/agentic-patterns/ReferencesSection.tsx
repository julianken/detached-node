// ---------------------------------------------------------------------------
// ReferencesSection
// ---------------------------------------------------------------------------
// Primary authority signal for a pattern. Type-badged citation list with
// authors, year, and venue. Server component.
//
// Behavior:
// - Returns null when the references array is empty (renders nothing —
//   the surrounding satellite layout has nothing to slot in).
// - Wraps each reference title in <cite> for semantic correctness (cite is
//   the HTML element for the title of a creative work).
// - Type badges (paper / essay / docs / book / spec) use the same chip shape
//   as framework chips and related-pattern chips. v1: duplicated styling.
//   Future: extract <Chip>.

import type { Pattern, Reference, ReferenceType } from "@/data/agentic-design-patterns/types";

interface ReferencesSectionProps {
  pattern: Pattern;
}

const TYPE_LABELS: Record<ReferenceType, string> = {
  paper: "PAPER",
  essay: "ESSAY",
  docs: "DOCS",
  book: "BOOK",
  spec: "SPEC",
};

function ReferenceItem({ reference }: { reference: Reference }) {
  const venueParts: string[] = [];
  if (reference.venue) venueParts.push(reference.venue);
  if (reference.doi) venueParts.push(`DOI: ${reference.doi}`);

  return (
    <li className="flex flex-col gap-1.5 border-b border-border-subtle py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <span
          className="inline-flex items-center rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-text-tertiary"
          aria-label={`Reference type: ${reference.type}`}
        >
          {TYPE_LABELS[reference.type]}
        </span>
        <a
          href={reference.url}
          rel="noopener noreferrer"
          target="_blank"
          className="text-base font-medium text-accent underline underline-offset-4 hover:text-accent-muted"
        >
          <cite className="not-italic">{reference.title}</cite>
        </a>
      </div>
      <div className="text-sm text-text-secondary">
        <span>{reference.authors}</span>
        <span className="mx-1.5 text-text-tertiary">·</span>
        <span>{reference.year}</span>
        {venueParts.length > 0 && (
          <>
            <span className="mx-1.5 text-text-tertiary">·</span>
            <span className="italic">{venueParts.join(" · ")}</span>
          </>
        )}
        {reference.pages && (
          <>
            <span className="mx-1.5 text-text-tertiary">·</span>
            <span>pp. {reference.pages[0]}–{reference.pages[1]}</span>
          </>
        )}
        {reference.accessedAt && (
          <>
            <span className="mx-1.5 text-text-tertiary">·</span>
            <span>accessed <time dateTime={reference.accessedAt}>{reference.accessedAt}</time></span>
          </>
        )}
      </div>
      {reference.note && (
        <p className="text-sm text-text-tertiary [text-wrap:pretty]">{reference.note}</p>
      )}
    </li>
  );
}

export function ReferencesSection({ pattern }: ReferencesSectionProps) {
  // Conditional render: an empty references array means the satellite shows
  // no references slot at all (rather than an empty header).
  if (pattern.references.length === 0) {
    return null;
  }

  return (
    <section id="references" aria-labelledby="references-heading" className="scroll-mt-24">
      <h2
        id="references-heading"
        className="font-mono text-xl font-semibold tracking-tight text-text-primary"
      >
        References
      </h2>
      <ol className="mt-4 list-none">
        {pattern.references.map((reference, idx) => (
          <ReferenceItem key={`${reference.url}-${idx}`} reference={reference} />
        ))}
      </ol>
    </section>
  );
}
