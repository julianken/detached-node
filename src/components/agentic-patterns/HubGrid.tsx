// ---------------------------------------------------------------------------
// HubGrid
// ---------------------------------------------------------------------------
// Renders the 5-layer pattern hub. Server component (no client JS).
//
// Layer titles use <h2>. Topology gets sub-tier dividers ("Single-agent (N)"
// / "Multi-agent (N)") rendered as <h3> — counts are derived dynamically from
// getTopologyPatterns(...) so they stay correct when patterns are added or
// retired (NEVER hardcoded "10" / "3").
//
// PatternCard headingLevel is set by context:
// - Under a flat layer section (parent <h2>): card heading is <h3>
// - Under a topology sub-tier (parent <h3>): card heading is <h4>
//
// HubGrid is intentionally pure server: filtering coordination lives in the
// client wrapper introduced by issue #157 (HubFilterableContent), which owns
// its own search input and feeds a filtered patterns array down to this grid.

import { LAYERS } from "@/data/agentic-design-patterns/layers";
import { getPatternsByLayer, getTopologyPatterns } from "@/data/agentic-design-patterns/index";
import type { Layer, Pattern } from "@/data/agentic-design-patterns/types";
import { PatternCard } from "./PatternCard";

function LayerSectionTitle({ layer }: { layer: Layer }) {
  return (
    <header className="flex flex-col gap-1">
      <h2 className="font-mono text-2xl font-semibold tracking-tight text-text-primary">
        Layer {layer.number} — {layer.title}
      </h2>
      <p className="text-sm text-text-tertiary italic">{layer.question}</p>
      <p className="max-w-prose text-base leading-6 text-text-secondary [text-wrap:pretty]">
        {layer.description}
      </p>
    </header>
  );
}

interface CardGridProps {
  patterns: Pattern[];
  headingLevel: 3 | 4;
}

function CardGrid({ patterns, headingLevel }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {patterns.map((p) => (
        <PatternCard key={p.slug} pattern={p} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

interface SubTierProps {
  title: string;
  patterns: Pattern[];
}

function SubTier({ title, patterns }: SubTierProps) {
  // Dynamic count — NEVER hardcoded. Pulled from the live patterns array.
  const count = patterns.length;
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-mono text-lg font-semibold tracking-tight text-text-secondary">
        {title} <span className="text-text-tertiary font-normal">({count})</span>
      </h3>
      {/* Cards under sub-tier are <h4> because parent heading is <h3>. */}
      <CardGrid patterns={patterns} headingLevel={4} />
    </div>
  );
}

function TopologyLayer({ layer }: { layer: Layer }) {
  const singleAgent = getTopologyPatterns("single-agent");
  const multiAgent = getTopologyPatterns("multi-agent");
  return (
    <section className="flex flex-col gap-8">
      <LayerSectionTitle layer={layer} />
      <SubTier title="Single-agent" patterns={singleAgent} />
      <SubTier title="Multi-agent" patterns={multiAgent} />
    </section>
  );
}

function FlatLayer({ layer }: { layer: Layer }) {
  const patterns = getPatternsByLayer(layer.id);
  return (
    <section className="flex flex-col gap-6">
      <LayerSectionTitle layer={layer} />
      {/* Cards under a flat layer are <h3> because parent heading is <h2>. */}
      <CardGrid patterns={patterns} headingLevel={3} />
    </section>
  );
}

export function HubGrid() {
  return (
    <div className="flex flex-col gap-16">
      {LAYERS.map((layer) =>
        layer.id === "topology" ? (
          <TopologyLayer key={layer.id} layer={layer} />
        ) : (
          <FlatLayer key={layer.id} layer={layer} />
        ),
      )}
    </div>
  );
}
