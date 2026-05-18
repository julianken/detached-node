import { describe, it, expect, vi } from "vitest";

// Mock the schema config module to avoid the NEXT_PUBLIC_SERVER_URL env check
// that fires at import time in src/lib/site-url.ts.
vi.mock("@/lib/schema/config", () => ({
  SITE_CONFIG: {
    url: "https://detached-node.com",
    name: "detached-node",
    description: "Test description",
    websiteId: "https://detached-node.com/#website",
  },
  AUTHOR_CONFIG: {
    name: "detached-node",
    url: "https://detached-node.com/about",
    id: "https://detached-node.com/#author",
    sameAs: ["https://github.com/detached-node"],
    description: "Writing on agentic AI workflows.",
  },
}));

import { generateFaqPageSchema } from "@/lib/schema/faq-page";
import { SITE_CONFIG } from "@/lib/schema/config";
import type { Pattern } from "@/data/agentic-design-patterns/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_URL = "https://test.example.com";

const patternWithoutQuestions: Pattern = {
  slug: "test-pattern",
  name: "Test Pattern",
  layerId: "topology",
  topologySubtier: "single-agent",
  oneLineSummary: "A minimal test pattern for FAQ schema generation.",
  bodySummary: ["First paragraph.", "Second paragraph."],
  mermaidSource: "graph TD\n  A --> B",
  mermaidAlt: "A flows to B",
  whenToUse: ["When testing."],
  whenNotToUse: ["When not testing."],
  realWorldExamples: [{ text: "Example", sourceUrl: "https://example.com" }],
  implementationSketch: "// sketch",
  sdkAvailability: "no-sdk",
  relatedSlugs: [],
  frameworks: [],
  references: [],
  addedAt: "2026-01-01",
  dateModified: "2026-05-03",
};

const patternWithOneQuestion: Pattern = {
  ...patternWithoutQuestions,
  relatedQuestions: [
    {
      q: "When should I reach for this pattern?",
      a: "When the task class is recurring and failures can be diagnosed from the trajectory itself.",
    },
  ],
};

const patternWithThreeQuestions: Pattern = {
  ...patternWithoutQuestions,
  slug: "multi-question-pattern",
  relatedQuestions: [
    { q: "Question A?", a: "Answer A." },
    { q: "Question B?", a: "Answer B." },
    { q: "Question C?", a: "Answer C." },
  ],
};

const patternWithEmptyQuestions: Pattern = {
  ...patternWithoutQuestions,
  relatedQuestions: [],
};

// ---------------------------------------------------------------------------
// Null-return cases
// ---------------------------------------------------------------------------

describe("generateFaqPageSchema — null-return cases", () => {
  it("returns null when pattern has no relatedQuestions field", () => {
    const schema = generateFaqPageSchema(patternWithoutQuestions, BASE_URL);
    expect(schema).toBeNull();
  });

  it("returns null when relatedQuestions is an empty array", () => {
    const schema = generateFaqPageSchema(patternWithEmptyQuestions, BASE_URL);
    expect(schema).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Populated emission cases
// ---------------------------------------------------------------------------

describe("generateFaqPageSchema — populated cases", () => {
  it("emits @context and @type FAQPage when relatedQuestions has 1 entry", () => {
    const schema = generateFaqPageSchema(patternWithOneQuestion, BASE_URL);
    expect(schema).not.toBeNull();
    expect(schema!["@context"]).toBe("https://schema.org");
    expect(schema!["@type"]).toBe("FAQPage");
  });

  it("@id uses the satellite URL and #faq suffix", () => {
    const schema = generateFaqPageSchema(patternWithOneQuestion, BASE_URL);
    expect(schema!["@id"]).toBe(
      `${BASE_URL}/agentic-design-patterns/${patternWithOneQuestion.slug}#faq`,
    );
  });

  it("@id includes the correct slug for a different pattern", () => {
    const schema = generateFaqPageSchema(patternWithThreeQuestions, BASE_URL);
    expect(schema!["@id"]).toBe(
      `${BASE_URL}/agentic-design-patterns/multi-question-pattern#faq`,
    );
  });

  it("mainEntity length matches relatedQuestions length (1 question)", () => {
    const schema = generateFaqPageSchema(patternWithOneQuestion, BASE_URL);
    expect(schema!.mainEntity).toHaveLength(1);
  });

  it("mainEntity length matches relatedQuestions length (3 questions)", () => {
    const schema = generateFaqPageSchema(patternWithThreeQuestions, BASE_URL);
    expect(schema!.mainEntity).toHaveLength(3);
  });

  it("each mainEntity element has @type Question", () => {
    const schema = generateFaqPageSchema(patternWithThreeQuestions, BASE_URL);
    for (const entity of schema!.mainEntity) {
      expect(entity["@type"]).toBe("Question");
    }
  });

  it("each Question.name copies the q field verbatim", () => {
    const schema = generateFaqPageSchema(patternWithThreeQuestions, BASE_URL);
    expect(schema!.mainEntity[0].name).toBe("Question A?");
    expect(schema!.mainEntity[1].name).toBe("Question B?");
    expect(schema!.mainEntity[2].name).toBe("Question C?");
  });

  it("each acceptedAnswer has @type Answer and the a field as text", () => {
    const schema = generateFaqPageSchema(patternWithThreeQuestions, BASE_URL);
    expect(schema!.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(schema!.mainEntity[0].acceptedAnswer.text).toBe("Answer A.");
    expect(schema!.mainEntity[1].acceptedAnswer.text).toBe("Answer B.");
    expect(schema!.mainEntity[2].acceptedAnswer.text).toBe("Answer C.");
  });

  it("uses SITE_CONFIG.url as default baseUrl when not provided", () => {
    const schema = generateFaqPageSchema(patternWithOneQuestion);
    expect(schema!["@id"]).toContain(SITE_CONFIG.url);
    expect(schema!["@id"]).toContain(`#faq`);
  });

  it("preserves question/answer order from the source array", () => {
    const schema = generateFaqPageSchema(patternWithThreeQuestions, BASE_URL);
    const names = schema!.mainEntity.map((e) => e.name);
    expect(names).toEqual(["Question A?", "Question B?", "Question C?"]);
  });
});
