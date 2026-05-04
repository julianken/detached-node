// ---------------------------------------------------------------------------
// DecisionMatrix
// ---------------------------------------------------------------------------
// Two-column comparison table that zips whenToUse and whenNotToUse row-for-row.
// When the two arrays are different lengths, the shorter side renders empty
// cells in the trailing rows.
//
// Replaces the standalone <h2>When to use</h2> + <h2>When NOT to use</h2>
// sections from the prose layout. Spec-sheet readers want side-by-side
// affordances for go/no-go decisions, not stacked bullet lists.
//
// h2 emitted: "Decision". This restructures the satellite's heading count
// from "When to use" + "When NOT to use" (2 h2s) to a single "Decision" h2.
// The E2E SATELLITE_H2_HEADINGS fixture must be updated to reflect this.
//
// On narrow viewports (<lg), the table collapses to a stack: Use cell above
// Avoid cell, separated by a thin divider, with sr-only column labels.

import type { Pattern } from "@/data/agentic-design-patterns/types";

interface DecisionMatrixProps {
  pattern: Pattern;
}

export function DecisionMatrix({ pattern }: DecisionMatrixProps) {
  const useWhen = pattern.whenToUse;
  const avoidWhen = pattern.whenNotToUse;
  if (useWhen.length === 0 && avoidWhen.length === 0) return null;

  const rowCount = Math.max(useWhen.length, avoidWhen.length);
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    use: useWhen[i] ?? null,
    avoid: avoidWhen[i] ?? null,
  }));

  return (
    <section id="decision-matrix" aria-labelledby="decision-heading" className="scroll-mt-24">
      <h2
        id="decision-heading"
        className="font-mono text-base font-semibold uppercase tracking-[0.08em] text-text-tertiary"
      >
        Decision
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full table-fixed border border-border text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-1/2 border-b border-border bg-surface px-4 py-2 text-left font-mono text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary"
              >
                Use when ✓
              </th>
              <th
                scope="col"
                className="w-1/2 border-b border-border border-l border-l-border bg-surface px-4 py-2 text-left font-mono text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary"
              >
                Avoid when ✗
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="odd:bg-surface even:bg-bg">
                <td className="border-b border-border-subtle px-4 py-3 align-top text-text-secondary [text-wrap:pretty] last:border-b-0">
                  {row.use ? (
                    <>
                      <span className="mr-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        +
                      </span>
                      {row.use}
                    </>
                  ) : null}
                </td>
                <td className="border-b border-border-subtle border-l border-l-border-subtle px-4 py-3 align-top text-text-secondary [text-wrap:pretty] last:border-b-0">
                  {row.avoid ? (
                    <>
                      <span className="mr-1 font-semibold text-rose-700 dark:text-rose-400">
                        −
                      </span>
                      {row.avoid}
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
