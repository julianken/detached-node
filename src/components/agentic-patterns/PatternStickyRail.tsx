// ---------------------------------------------------------------------------
// PatternStickyRail
// ---------------------------------------------------------------------------
// Left-rail orientation surface for the satellite page. Sticky on lg+;
// collapses to a horizontal metadata strip below the header on smaller
// viewports.
//
// Holds: meta dl (Layer / SDK / Frameworks / Foundational / Last edited)
// + "On this page" jump links + Related chips. No card chrome — just text
// against the page background, with hairline bottom borders between rows.
//
// Foundational reference = first paper-type Reference. Convention enforced
// by per-pattern issue template ("foundational paper first in references").
//
// Server component — anchor links suffice for navigation; no scroll-spy in
// Phase 1 (would require a client boundary).

import { Link } from "next-view-transitions";
import { LAYERS } from "@/data/agentic-design-patterns/layers";
import { getPattern } from "@/data/agentic-design-patterns/index";
import type { Framework, Pattern, SdkAvailability } from "@/data/agentic-design-patterns/types";

interface PatternStickyRailProps {
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
  "first-party-ts": "First-party TS",
  "community-ts": "Community TS",
  "python-only": "Python only",
  "no-sdk": "No SDK",
};

const JUMP_LINKS = [
  { href: "#decision-matrix", label: "Decision" },
  { href: "#in-the-wild", label: "In the wild" },
  { href: "#implementation-sketch", label: "Sketch" },
  { href: "#references", label: "References" },
  { href: "#background-discussion", label: "Background ↓" },
] as const;

function RailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-subtle py-2.5 last:border-b-0">
      <dt className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-text-secondary [text-wrap:pretty]">{children}</dd>
    </div>
  );
}

function formatDateModified(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.valueOf())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function PatternStickyRail({ pattern }: PatternStickyRailProps) {
  const layer = LAYERS.find((l) => l.id === pattern.layerId);
  const layerLabel = layer
    ? pattern.topologySubtier
      ? `${layer.title} · ${pattern.topologySubtier === "single-agent" ? "single-agent" : "multi-agent"}`
      : layer.title
    : pattern.layerId;
  const foundational = pattern.references.find((ref) => ref.type === "paper");
  const frameworksDisplay =
    pattern.frameworks.length > 0
      ? pattern.frameworks.map((fw) => FRAMEWORK_LABELS[fw]).join(", ")
      : "—";
  const relatedPatterns = pattern.relatedSlugs
    .map((slug) => getPattern(slug))
    .filter((p): p is Pattern => p !== undefined);

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Pattern reference rail">
      <dl className="border-t border-border-subtle">
        <RailRow label="Layer">{layerLabel}</RailRow>
        <RailRow label="SDK">{SDK_LABELS[pattern.sdkAvailability]}</RailRow>
        <RailRow label="Frameworks">{frameworksDisplay}</RailRow>
        <RailRow label="Foundational">
          {foundational ? (
            <Link
              href={foundational.url}
              className="text-accent underline underline-offset-4 hover:text-accent-muted"
            >
              {foundational.authors.split(/[,&]/)[0].trim()}
              {foundational.year ? ` ${foundational.year}` : ""} →
            </Link>
          ) : (
            <span className="text-text-tertiary">—</span>
          )}
        </RailRow>
        <RailRow label="Last edited">{formatDateModified(pattern.dateModified)}</RailRow>
      </dl>

      <nav className="mt-6 border-t border-border-subtle pt-4" aria-label="On this page">
        <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          On this page
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {JUMP_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="block text-sm text-text-secondary hover:text-accent transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {relatedPatterns.length > 0 && (
        <div className="mt-6 border-t border-border-subtle pt-4">
          <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
            Related
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {relatedPatterns.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/agentic-design-patterns/${p.slug}`}
                  className="block text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  → {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
