// ---------------------------------------------------------------------------
// SourcedClaimTable
// ---------------------------------------------------------------------------
// Replaces the bullet-list rendering of `realWorldExamples` with a two-column
// table: Source (parsed from the URL host) | Claim (the prose). Cuts ~30%
// vertical space vs. the bulleted list and makes provenance scannable at a
// glance.
//
// h2: "In the wild" (unchanged).

import type { Pattern } from "@/data/agentic-design-patterns/types";

interface SourcedClaimTableProps {
  pattern: Pattern;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourcedClaimTable({ pattern }: SourcedClaimTableProps) {
  if (pattern.realWorldExamples.length === 0) return null;

  return (
    <section id="in-the-wild" aria-labelledby="in-the-wild-heading" className="scroll-mt-24">
      <h2
        id="in-the-wild-heading"
        className="font-mono text-base font-semibold uppercase tracking-[0.08em] text-text-tertiary"
      >
        In the wild
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border border-border text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-40 border-b border-border bg-surface px-4 py-2 text-left font-mono text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary"
              >
                Source
              </th>
              <th
                scope="col"
                className="border-b border-border border-l border-l-border bg-surface px-4 py-2 text-left font-mono text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary"
              >
                Claim
              </th>
            </tr>
          </thead>
          <tbody>
            {pattern.realWorldExamples.map((ex, i) => (
              <tr key={i} className="odd:bg-surface even:bg-bg">
                <td className="border-b border-border-subtle px-4 py-3 align-top last:border-b-0">
                  <a
                    href={ex.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="font-mono text-xs text-accent underline underline-offset-4 hover:text-accent-muted"
                  >
                    {hostnameOf(ex.sourceUrl)} →
                  </a>
                </td>
                <td className="border-b border-border-subtle border-l border-l-border-subtle px-4 py-3 align-top text-text-secondary [text-wrap:pretty] last:border-b-0">
                  {ex.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
