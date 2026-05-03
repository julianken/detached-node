import { describe, it, expect } from "vitest";
import { searchPatterns, type LayerLabelMap } from "@/lib/pattern-search";
import type { Pattern } from "@/data/agentic-design-patterns/types";

// ---------------------------------------------------------------------------
// Test fixtures — minimal valid Pattern objects.
// We use literal stub values rather than the live PATTERNS array so this
// test stays robust to catalog edits (pattern stubs evolve in #158+).
// ---------------------------------------------------------------------------

function makePattern(overrides: Partial<Pattern>): Pattern {
  return {
    slug: overrides.slug ?? "test-pattern",
    name: overrides.name ?? "Test Pattern",
    layerId: overrides.layerId ?? "topology",
    topologySubtier: overrides.layerId === undefined || overrides.layerId === "topology" ? "single-agent" : undefined,
    oneLineSummary: overrides.oneLineSummary ?? "",
    bodySummary: [],
    mermaidSource: "",
    mermaidAlt: "",
    whenToUse: [],
    whenNotToUse: [],
    realWorldExamples: [],
    implementationSketch: "",
    sdkAvailability: "no-sdk",
    relatedSlugs: [],
    frameworks: [],
    references: [],
    addedAt: "2026-05-03",
    dateModified: "2026-05-03",
    ...overrides,
  };
}

const FIXTURES: Pattern[] = [
  makePattern({
    slug: "prompt-chaining",
    name: "Prompt Chaining",
    oneLineSummary: "Chain LLM calls so output of one feeds the next",
    layerId: "topology",
  }),
  makePattern({
    slug: "rag",
    name: "RAG",
    alternativeNames: ["Retrieval-Augmented Generation"],
    oneLineSummary: "Inject retrieved context before generation",
    layerId: "topology",
  }),
  makePattern({
    slug: "guardrails",
    name: "Guardrails",
    oneLineSummary: "Validate inputs and outputs before they reach the model",
    layerId: "quality",
    topologySubtier: undefined,
  }),
  makePattern({
    slug: "memory-management",
    name: "Memory Management",
    oneLineSummary: "Decide what to keep, summarize, or evict across turns",
    layerId: "state",
    topologySubtier: undefined,
  }),
];

const LAYER_LABELS: LayerLabelMap = {
  topology: "Layer 1 — Topology / Control Flow",
  quality: "Layer 2 — Quality & Control Gates",
  state: "Layer 3 — State & Context",
  interfaces: "Layer 4 — Interfaces & Transport",
  methodology: "Layer 5 — Methodology",
};

// ---------------------------------------------------------------------------
// Tests — required: empty, prefix, substring (over summary),
// case-insensitive, no-match.
// ---------------------------------------------------------------------------

describe("searchPatterns", () => {
  it("returns all patterns when the query is empty (or whitespace only)", () => {
    expect(searchPatterns(FIXTURES, "", LAYER_LABELS)).toHaveLength(FIXTURES.length);
    expect(searchPatterns(FIXTURES, "   ", LAYER_LABELS)).toHaveLength(FIXTURES.length);
  });

  it("matches by prefix on pattern name", () => {
    // "Prom" is a prefix of "Prompt Chaining"
    const results = searchPatterns(FIXTURES, "Prom", LAYER_LABELS);
    expect(results.map((p) => p.slug)).toEqual(["prompt-chaining"]);
  });

  it("matches by substring inside oneLineSummary", () => {
    // "summarize" appears mid-string in memory-management's summary
    const results = searchPatterns(FIXTURES, "summarize", LAYER_LABELS);
    expect(results.map((p) => p.slug)).toEqual(["memory-management"]);
  });

  it("is case-insensitive across all searched fields", () => {
    // Mixed-case query against differently-cased name and alt name
    const results = searchPatterns(FIXTURES, "rEtRiEvAl", LAYER_LABELS);
    expect(results.map((p) => p.slug)).toEqual(["rag"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchPatterns(FIXTURES, "zxzxzxzx-no-match", LAYER_LABELS)).toEqual([]);
  });
});
