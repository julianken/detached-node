// ---------------------------------------------------------------------------
// KeyStatisticCallout
// ---------------------------------------------------------------------------
// Above-fold callout box that surfaces a single quantitative claim with a
// linked public source and the year of the claim. Designed to live just
// before the pattern's diagram so the most citable line of the page is
// visible in the reader's first viewport.
//
// Visibility: not wrapped in <DisclosureSection>. The claim must render
// unconditionally so AI crawlers and SERP snippets can extract it.

import type { Pattern } from "@/data/agentic-design-patterns/types";

interface KeyStatisticCalloutProps {
  statistic: NonNullable<Pattern["keyStatistic"]>;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function KeyStatisticCallout({ statistic }: KeyStatisticCalloutProps) {
  return (
    <section
      id="key-statistic"
      aria-labelledby="key-statistic-heading"
      className="scroll-mt-24"
    >
      <h2 id="key-statistic-heading" className="sr-only">
        Key statistic
      </h2>
      <div className="rounded-sm border border-border bg-surface p-5">
        <p className="text-body leading-7 text-text-primary [text-wrap:pretty]">
          {statistic.claim}
        </p>
        <p className="mt-3 text-meta text-text-tertiary">
          <a
            href={statistic.sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="font-mono text-xs text-accent underline underline-offset-4 hover:text-accent-muted"
          >
            {hostnameOf(statistic.sourceUrl)} →
          </a>
          <span className="mx-1.5 text-text-tertiary">·</span>
          <span className="font-mono text-xs">{statistic.year}</span>
        </p>
      </div>
    </section>
  );
}
