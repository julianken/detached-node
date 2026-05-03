// ---------------------------------------------------------------------------
// PatternBody (D1 spec-sheet layout)
// ---------------------------------------------------------------------------
// Slot composition for the satellite page, body region only. Header is
// emitted by PatternHeader; meta/TOC/related by PatternStickyRail; references
// + Overview/Background disclosures by [slug]/page.tsx.
//
// Body slot order (top to bottom):
//   1. Diagram                — figure, no h2
//   2. Decision matrix        — h2 "Decision" (replaces When-to-use + When-NOT)
//   3. In the wild            — h2, source/claim table
//   4. Reader gotcha          — h2, optional, red-bordered callout
//   5. Implementation sketch  — h2, denser pre, frameworks subsection
//
// Heading count: this body emits up to 4 h2s (Decision, In the wild,
// Reader gotcha, Implementation sketch). Plus h2 from References + the
// disclosure summaries (which are NOT h2s — <summary> elements). The E2E
// fixture must be updated.

import type { Framework, Pattern, SdkAvailability } from "@/data/agentic-design-patterns/types";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { DecisionMatrix } from "./DecisionMatrix";
import { SourcedClaimTable } from "./SourcedClaimTable";

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
      className="font-mono text-base font-semibold uppercase tracking-[0.08em] text-text-tertiary"
    >
      {children}
    </h2>
  );
}

export function PatternBody({ pattern }: PatternBodyProps) {
  const showPseudocodeBanner = PSEUDOCODE_BANNER_SET.has(pattern.sdkAvailability);

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Diagram */}
      {pattern.mermaidSource && (
        <section>
          <figure>
            {/* IMPORTANT: only `{ source: string }` crosses the server/client boundary. */}
            <MermaidDiagram source={pattern.mermaidSource} />
            {pattern.mermaidAlt && (
              <figcaption className="mt-2 text-sm text-text-tertiary italic">
                {pattern.mermaidAlt}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {/* 2. Decision matrix — replaces When-to-use + When-NOT */}
      <DecisionMatrix pattern={pattern} />

      {/* 3. In the wild — source/claim table */}
      <SourcedClaimTable pattern={pattern} />

      {/* 4. Reader gotcha — red-bordered callout, differentiates from neutral matrix */}
      {pattern.readerGotcha && (
        <section id="reader-gotcha" aria-labelledby="gotcha-heading" className="scroll-mt-24">
          <SlotHeading id="gotcha-heading">Reader gotcha</SlotHeading>
          <div className="mt-4 rounded-sm border-l-2 border-rose-400/60 border-y border-r border-border-subtle bg-surface p-4">
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

      {/* 5. Implementation sketch — denser code, frameworks subsection */}
      {pattern.implementationSketch && (
        <section
          id="implementation-sketch"
          aria-labelledby="sketch-heading"
          className="scroll-mt-24"
        >
          {showPseudocodeBanner && (
            <div
              role="note"
              className="mb-4 rounded-sm border border-border-subtle bg-surface px-4 py-3 text-sm text-text-tertiary"
            >
              <span className="font-mono uppercase tracking-[0.05em] text-text-secondary">
                Pseudocode:
              </span>{" "}
              No first-party TypeScript SDK ({SDK_LABELS[pattern.sdkAvailability]}). The sketch below is illustrative.
            </div>
          )}
          <SlotHeading id="sketch-heading">Implementation sketch</SlotHeading>
          <pre className="mt-4 overflow-x-auto rounded-sm border border-border bg-surface p-4 text-[0.8125rem] leading-5">
            <code className="font-mono text-text-primary">{pattern.implementationSketch}</code>
          </pre>
          {pattern.frameworks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-xs text-text-tertiary">
              <span className="font-mono uppercase tracking-[0.08em]">
                {SDK_LABELS[pattern.sdkAvailability]}
              </span>
              <span aria-hidden="true">·</span>
              <ul className="flex flex-wrap gap-2">
                {pattern.frameworks.map((fw) => (
                  <li key={fw}>
                    <span className="inline-flex items-center rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-xs text-text-secondary">
                      {FRAMEWORK_LABELS[fw]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
