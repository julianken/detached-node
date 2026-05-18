// ---------------------------------------------------------------------------
// ExpertQuoteBlock
// ---------------------------------------------------------------------------
// Semantic <blockquote> rendering an authoritative external quote with its
// attribution linked back to a public source. Sits between the diagram and
// the decision matrix so the satellite reads as: visual model → external
// validation → go/no-go.
//
// Visibility: not wrapped in <DisclosureSection> by design — the quote
// must render unconditionally for citation lift.

import type { Pattern } from "@/data/agentic-design-patterns/types";

interface ExpertQuoteBlockProps {
  quote: NonNullable<Pattern["expertQuote"]>;
}

export function ExpertQuoteBlock({ quote }: ExpertQuoteBlockProps) {
  return (
    <section
      id="expert-quote"
      aria-labelledby="expert-quote-heading"
      className="scroll-mt-24"
    >
      <h2 id="expert-quote-heading" className="sr-only">
        Expert quote
      </h2>
      <figure className="rounded-sm border-l-2 border-accent/60 border-y border-r border-border-subtle bg-surface px-5 py-4">
        <blockquote className="text-body italic leading-7 text-text-primary [text-wrap:pretty]">
          {quote.text}
        </blockquote>
        <figcaption className="mt-3 text-meta text-text-tertiary">
          <span aria-hidden="true">— </span>
          <a
            href={quote.sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="text-accent underline underline-offset-4 hover:text-accent-muted"
          >
            {quote.attribution}
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
