// ---------------------------------------------------------------------------
// PatternBody (D1 spec-sheet layout)
// ---------------------------------------------------------------------------
// Slot composition for the satellite page, body region only. Header is
// emitted by PatternHeader; meta/TOC/related by PatternStickyRail; references
// + Overview/Background disclosures by [slug]/page.tsx.
//
// Body slot order (top to bottom):
//   0. Key statistic          — optional, callout above the diagram
//   1. Diagram                — figure, no h2
//   1b. afterDiagram slot     — e.g. RealizingDisclosure cards
//   1c. Expert quote          — optional, semantic <blockquote>
//   2. Decision matrix        — h2 "Decision" (replaces When-to-use + When-NOT)
//   2b. Related questions     — optional, visible <dl> Q&A (unlocks FAQPage JSON-LD)
//   3. In the wild            — h2, source/claim table
//   4. Reader gotcha          — h2, optional, red-bordered callout
//   5. Implementation sketch  — h2, denser pre, frameworks subsection
//
// Heading count: this body emits up to 5 h2s (Decision, Common questions,
// In the wild, Reader gotcha, Implementation sketch) plus optional sr-only
// h2s on Key statistic and Expert quote. Plus h2 from References + the
// disclosure summaries (which are NOT h2s — <summary> elements). The E2E
// fixture must be updated when relatedQuestions is populated for a pattern.

import type { Framework, Pattern, SdkAvailability } from "@/data/agentic-design-patterns/types";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { DecisionMatrix } from "./DecisionMatrix";
import { ExpertQuoteBlock } from "./ExpertQuoteBlock";
import { KeyStatisticCallout } from "./KeyStatisticCallout";
import { RelatedQuestionsBlock } from "./RelatedQuestionsBlock";
import { SourcedClaimTable } from "./SourcedClaimTable";

interface PatternBodyProps {
  pattern: Pattern;
  /** Optional slot rendered immediately after the diagram, before the decision matrix. */
  afterDiagram?: React.ReactNode;
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
      className="font-mono text-nav font-semibold uppercase tracking-[0.08em] text-text-tertiary"
    >
      {children}
    </h2>
  );
}

export function PatternBody({ pattern, afterDiagram }: PatternBodyProps) {
  const showPseudocodeBanner = PSEUDOCODE_BANNER_SET.has(pattern.sdkAvailability);

  return (
    <div className="flex flex-col gap-10">
      {/* 0. Key statistic — optional above-fold callout */}
      {pattern.keyStatistic && (
        <KeyStatisticCallout statistic={pattern.keyStatistic} />
      )}

      {/* 1. Diagram */}
      {pattern.mermaidSource && (
        <section>
          <figure className="mx-auto max-w-prose-wide">
            {/* IMPORTANT: only `{ source: string }` crosses the server/client boundary. */}
            <MermaidDiagram source={pattern.mermaidSource} />
            {pattern.mermaidAlt && (
              <figcaption className="mt-2 text-card-summary leading-relaxed text-text-secondary italic">
                {pattern.mermaidAlt}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {/* 1b. Optional slot — e.g. RealizingDisclosure card sits here */}
      {afterDiagram}

      {/* 1c. Expert quote — optional semantic <blockquote> */}
      {pattern.expertQuote && (
        <ExpertQuoteBlock quote={pattern.expertQuote} />
      )}

      {/* 2. Decision matrix — replaces When-to-use + When-NOT */}
      <DecisionMatrix pattern={pattern} />

      {/* 2b. Related questions — optional visible Q&A; unlocks FAQPage JSON-LD */}
      {pattern.relatedQuestions && pattern.relatedQuestions.length > 0 && (
        <RelatedQuestionsBlock questions={pattern.relatedQuestions} />
      )}

      {/* 3. In the wild — source/claim table */}
      <SourcedClaimTable pattern={pattern} />

      {/* 4. Reader gotcha — red-bordered callout, differentiates from neutral matrix */}
      {pattern.readerGotcha && (
        <section id="reader-gotcha" aria-labelledby="gotcha-heading" className="scroll-mt-24">
          <SlotHeading id="gotcha-heading">Reader gotcha</SlotHeading>
          <div className="mt-4 rounded-sm border-l-2 border-rose-400/60 border-y border-r border-border-subtle bg-surface p-4">
            <p className="text-body leading-7 text-text-secondary [text-wrap:pretty]">
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
              className="mb-4 rounded-sm border border-border-subtle bg-surface px-4 py-3 text-meta text-text-tertiary"
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
