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

import {
  generatePatternArticleSchema,
  referenceToPatternCitation,
} from "@/lib/schema/agentic-patterns";
import { SITE_CONFIG, AUTHOR_CONFIG } from "@/lib/schema/config";
import type { Pattern, Reference } from "@/data/agentic-design-patterns/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_URL = "https://test.example.com";

/** Minimal valid Reference for each ReferenceType */
const paperRef: Reference = {
  title: "ReAct: Synergizing Reasoning and Acting in Language Models",
  url: "https://arxiv.org/abs/2210.03629",
  authors: "Shinn et al.",
  year: 2022,
  type: "paper",
  doi: "10.48550/arXiv.2210.03629",
};

const paperRefNoDoi: Reference = {
  title: "Paper without DOI",
  url: "https://example.com/paper",
  authors: "Anonymous",
  year: 2021,
  type: "paper",
};

const bookRef: Reference = {
  title: "Deep Learning",
  url: "https://www.deeplearningbook.org/",
  authors: "Goodfellow et al.",
  year: 2016,
  type: "book",
  pages: [10, 50],
};

const specRef: Reference = {
  title: "OpenAPI Specification",
  url: "https://spec.openapis.org/oas/v3.1.0",
  authors: "OpenAPI Initiative",
  year: 2021,
  type: "spec",
};

const docsRef: Reference = {
  title: "LangChain Documentation",
  url: "https://docs.langchain.com/",
  authors: "LangChain",
  year: 2023,
  type: "docs",
  accessedAt: "2024-01-01",
};

const essayRef: Reference = {
  title: "Building Effective Agents",
  url: "https://anthropic.com/research/building-effective-agents",
  authors: "Anthropic",
  year: 2024,
  type: "essay",
  note: "Foundational framing for the pattern taxonomy",
};

/** 5-reference fixture — one of each ReferenceType */
const fiveRefs: Reference[] = [paperRef, bookRef, specRef, docsRef, essayRef];

const minimalPattern: Pattern = {
  slug: "test-pattern",
  name: "Test Pattern",
  layerId: "topology",
  topologySubtier: "single-agent",
  oneLineSummary: "A minimal test pattern for schema generation.",
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
  references: fiveRefs,
  addedAt: "2026-01-01",
  dateModified: "2026-05-03",
};

// ---------------------------------------------------------------------------
// referenceToPatternCitation
// ---------------------------------------------------------------------------

describe("referenceToPatternCitation", () => {
  describe("paper type", () => {
    it("maps to ScholarlyArticle", () => {
      const citation = referenceToPatternCitation(paperRef);
      expect(citation["@type"]).toBe("ScholarlyArticle");
    });

    it("includes identifier with uppercase DOI propertyID when doi is present", () => {
      const citation = referenceToPatternCitation(paperRef);
      expect(citation.identifier).toBeDefined();
      expect(citation.identifier!["@type"]).toBe("PropertyValue");
      expect(citation.identifier!.propertyID).toBe("DOI"); // uppercase — schema.org convention
      expect(citation.identifier!.value).toBe(paperRef.doi);
    });

    it("omits identifier when doi is absent", () => {
      const citation = referenceToPatternCitation(paperRefNoDoi);
      expect(citation.identifier).toBeUndefined();
    });

    it("includes name, url, author, datePublished", () => {
      const citation = referenceToPatternCitation(paperRef);
      expect(citation.name).toBe(paperRef.title);
      expect(citation.url).toBe(paperRef.url);
      expect(citation.author).toEqual({ "@type": "Person", name: paperRef.authors });
      expect(citation.datePublished).toBe(String(paperRef.year));
    });
  });

  describe("book type", () => {
    it("maps to Book", () => {
      const citation = referenceToPatternCitation(bookRef);
      expect(citation["@type"]).toBe("Book");
    });

    it("does not include DOI identifier", () => {
      const citation = referenceToPatternCitation(bookRef);
      expect(citation.identifier).toBeUndefined();
    });

    it("includes name, url, author, datePublished", () => {
      const citation = referenceToPatternCitation(bookRef);
      expect(citation.name).toBe(bookRef.title);
      expect(citation.url).toBe(bookRef.url);
      expect(citation.author).toEqual({ "@type": "Person", name: bookRef.authors });
      expect(citation.datePublished).toBe(String(bookRef.year));
    });

    it("does NOT surface pages field (UI-only / no clean Book.pagination slot)", () => {
      const citation = referenceToPatternCitation(bookRef);
      // pages is intentionally omitted from JSON-LD output
      expect("pages" in citation).toBe(false);
    });
  });

  describe("spec type", () => {
    it("maps to WebPage", () => {
      const citation = referenceToPatternCitation(specRef);
      expect(citation["@type"]).toBe("WebPage");
    });

    it("does not include identifier", () => {
      const citation = referenceToPatternCitation(specRef);
      expect(citation.identifier).toBeUndefined();
    });
  });

  describe("docs type", () => {
    it("maps to WebPage", () => {
      const citation = referenceToPatternCitation(docsRef);
      expect(citation["@type"]).toBe("WebPage");
    });
  });

  describe("essay type", () => {
    it("maps to WebPage", () => {
      const citation = referenceToPatternCitation(essayRef);
      expect(citation["@type"]).toBe("WebPage");
    });

    it("does NOT surface note field (UI-only — schema.org has no citation-level note equivalent)", () => {
      const citation = referenceToPatternCitation(essayRef);
      expect("note" in citation).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// generatePatternArticleSchema
// ---------------------------------------------------------------------------

describe("generatePatternArticleSchema", () => {
  it("emits @context and @type Article", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Article");
  });

  it("uses #pattern-article suffix for @id (not #article)", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema["@id"]).toBe(
      `${BASE_URL}/agentic-design-patterns/${minimalPattern.slug}#pattern-article`
    );
    expect(schema["@id"]).not.toMatch(/#article$/);
  });

  it("sets headline from pattern.name", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema.headline).toBe(minimalPattern.name);
  });

  it("sets description from pattern.oneLineSummary", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema.description).toBe(minimalPattern.oneLineSummary);
  });

  it("sets url correctly", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema.url).toBe(
      `${BASE_URL}/agentic-design-patterns/${minimalPattern.slug}`
    );
  });

  it("sets dateModified from pattern.dateModified", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema.dateModified).toBe(minimalPattern.dateModified);
  });

  it("author is an @id reference to AUTHOR_CONFIG.id — NOT the full object", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema.author).toEqual({ "@id": AUTHOR_CONFIG.id });
    // Must NOT embed full author object
    expect("name" in schema.author).toBe(false);
    expect("url" in schema.author).toBe(false);
  });

  it("citation array length matches references length (5-reference fixture)", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    expect(schema.citation).toHaveLength(fiveRefs.length); // 5
  });

  it("citation array covers all 5 ReferenceTypes in correct schema.org types", () => {
    const schema = generatePatternArticleSchema(minimalPattern, BASE_URL);
    const citations = schema.citation!;

    const types = citations.map((c) => c["@type"]);
    expect(types[0]).toBe("ScholarlyArticle"); // paper
    expect(types[1]).toBe("Book");             // book
    expect(types[2]).toBe("WebPage");          // spec
    expect(types[3]).toBe("WebPage");          // docs
    expect(types[4]).toBe("WebPage");          // essay
  });

  it("uses SITE_CONFIG.url as default baseUrl when not provided", () => {
    const schema = generatePatternArticleSchema(minimalPattern);
    expect(schema.url).toContain(SITE_CONFIG.url);
    expect(schema["@id"]).toContain(SITE_CONFIG.url);
  });
});
