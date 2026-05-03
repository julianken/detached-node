// ---------------------------------------------------------------------------
// PatternBody
// ---------------------------------------------------------------------------
// Composes the 8 satellite-page content slots for a pattern. Server component.
//
// 8-slot anatomy:
//   1. Overview      (bodySummary prose — no <h2>; sits directly under <h1>)
//   2. Diagram       (mermaidSource via <MermaidDiagram /> — no <h2>; figure only)
//   3. When to use   (<h2> — 2nd-person imperative bullets)
//   4. When NOT to use (<h2> — conditional/noun-phrase bullets)
//   5. In the wild   (<h2> — real-world examples with cited sources)
//   6. Reader gotcha (<h2> — optional; must cite source)
//   7. Implementation sketch (<h2> — TypeScript or pseudocode)
//   [8. Frameworks rendered as subsection inside Implementation sketch — no standalone <h2>]
//
// h2-bearing sections: When to use, When NOT to use, In the wild,
//   Reader gotcha, Implementation sketch.
// Plus Related patterns (<h2> from RelatedPatternsRow) and
//   References (<h2> from ReferencesSection) = 7 <h2>s total per satellite.
//
// Pseudocode banner appears only when sdkAvailability is 'python-only' or
// 'no-sdk' — readers landing on a pattern with no first-party TS SDK get an
// upfront callout that the sketch is illustrative.
//
// Server/client boundary: MermaidDiagram is 'use client'. We pass ONLY the
// `{ source: string }` prop — no functions, no closures, no JSX with
// server-only state. Adding any non-serializable prop fails the Next 16 build
// with "functions cannot be passed to client components".

import type { Framework, Pattern, SdkAvailability } from "@/data/agentic-design-patterns/types";
import { MermaidDiagram } from "@/components/MermaidDiagram";

interface PatternBodyProps {
  pattern: Pattern;
}

const FRAMEWORK_LABELS: Record<Framework, string> = {
  langchain: "LangChain",
  langgraph: "LangGraph",
  "crew-ai": "CrewAI",
  "google-adk": "Google ADK",
  autogen: "AutoGen",
  "vercel-ai-sdk": "Vercel AI SDK",
  "pydantic-ai": "Pydantic AI",
  "openai-agents": "OpenAI Agents",
  mastra: "Mastra",
  smolagents: "smolagents",
};

const SDK_LABELS: Record<SdkAvailability, string> = {
  "first-party-ts": "First-party TS SDK",
  "community-ts": "Community TS SDK",
  "python-only": "Python only",
  "no-sdk": "No SDK",
};

const PSEUDOCODE_BANNER_SET: ReadonlySet<SdkAvailability> = new Set([
  "python-only",
  "no-sdk",
]);

function SlotHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-mono text-xl font-semibold tracking-tight text-text-primary"
    >
      {children}
    </h2>
  );
}

export function PatternBody({ pattern }: PatternBodyProps) {
  const showPseudocodeBanner = PSEUDOCODE_BANNER_SET.has(pattern.sdkAvailability);

  return (
    <div className="flex flex-col gap-12">
      {/* 1. Overview — prose directly under <h1>; no <h2> heading per spec */}
      {pattern.bodySummary.length > 0 && (
        <section>
          <div className="flex flex-col gap-4">
            {pattern.bodySummary.map((para, idx) => (
              <p
                key={idx}
                className="max-w-prose text-base leading-7 text-text-secondary [text-wrap:pretty]"
              >
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* 2. Diagram — figure only; no <h2> heading per spec.
          MermaidDiagram renders its own .mermaid-figure div internally. */}
      {pattern.mermaidSource && (
        <section>
          <figure>
            {/* IMPORTANT: only `{ source: string }` is passed across the
                server/client boundary. No functions or closures. */}
            <MermaidDiagram source={pattern.mermaidSource} />
            {pattern.mermaidAlt && (
              <figcaption className="mt-2 text-sm text-text-tertiary italic">
                {pattern.mermaidAlt}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {/* 3. When to use */}
      {pattern.whenToUse.length > 0 && (
        <section aria-labelledby="when-to-use-heading">
          <SlotHeading id="when-to-use-heading">When to use</SlotHeading>
          <ul className="mt-4 list-disc pl-6 text-base leading-7 text-text-secondary">
            {pattern.whenToUse.map((item, idx) => (
              <li key={idx} className="[text-wrap:pretty]">{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. When NOT to use */}
      {pattern.whenNotToUse.length > 0 && (
        <section aria-labelledby="when-not-to-use-heading">
          <SlotHeading id="when-not-to-use-heading">When NOT to use</SlotHeading>
          <ul className="mt-4 list-disc pl-6 text-base leading-7 text-text-secondary">
            {pattern.whenNotToUse.map((item, idx) => (
              <li key={idx} className="[text-wrap:pretty]">{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. In the wild (real-world examples) */}
      {pattern.realWorldExamples.length > 0 && (
        <section aria-labelledby="real-world-heading">
          <SlotHeading id="real-world-heading">In the wild</SlotHeading>
          <ul className="mt-4 flex flex-col gap-3">
            {pattern.realWorldExamples.map((ex, idx) => (
              <li key={idx} className="text-base leading-7 text-text-secondary [text-wrap:pretty]">
                {ex.text}{" "}
                <a
                  href={ex.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-accent underline underline-offset-4 hover:text-accent-muted"
                >
                  source
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. Reader gotcha */}
      {pattern.readerGotcha && (
        <section aria-labelledby="gotcha-heading">
          <SlotHeading id="gotcha-heading">Reader gotcha</SlotHeading>
          <div className="mt-4 rounded-sm border border-border bg-surface p-4">
            <p className="text-base leading-7 text-text-secondary [text-wrap:pretty]">
              {pattern.readerGotcha.text}{" "}
              <a
                href={pattern.readerGotcha.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="text-accent underline underline-offset-4 hover:text-accent-muted"
              >
                source
              </a>
            </p>
          </div>
        </section>
      )}

      {/* 7. Implementation sketch — includes frameworks/SDK availability as a subsection (no standalone h2 for frameworks) */}
      {pattern.implementationSketch && (
        <section aria-labelledby="sketch-heading">
          <SlotHeading id="sketch-heading">Implementation sketch</SlotHeading>
          {showPseudocodeBanner && (
            <div
              role="note"
              className="mt-4 rounded-sm border border-border-subtle bg-surface px-4 py-3 text-sm text-text-tertiary"
            >
              <span className="font-mono uppercase tracking-[0.05em] text-text-secondary">
                Pseudocode:
              </span>{" "}
              No first-party TypeScript SDK is available for this pattern
              ({SDK_LABELS[pattern.sdkAvailability]}). The sketch below is illustrative.
            </div>
          )}
          <pre className="mt-4 overflow-x-auto rounded-sm border border-border bg-surface p-4 text-sm leading-6">
            <code className="font-mono text-text-primary">{pattern.implementationSketch}</code>
          </pre>
          {/* Frameworks + SDK availability — subsection inside sketch; no standalone h2 */}
          {pattern.frameworks.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              <div>
                <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.05em] text-text-tertiary">
                  SDK availability
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {SDK_LABELS[pattern.sdkAvailability]}
                </p>
              </div>
              <div>
                <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.05em] text-text-tertiary">
                  Frameworks
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {pattern.frameworks.map((fw) => (
                    <li key={fw}>
                      <span className="inline-flex items-center rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-sm text-text-secondary">
                        {FRAMEWORK_LABELS[fw]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
