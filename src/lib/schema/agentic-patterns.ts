// src/lib/schema/agentic-patterns.ts
//
// Schema generators for the agentic design patterns satellite pages.
//
// Two concerns intentionally separate from citation.ts:
//   - The Reference type here has an explicit 'type' discriminator field,
//     so mapping branches on that (not on field presence as citation.ts does).
//   - This module is for Article schema; citation.ts is for BlogPosting schema.
//     The two mappers serve different data shapes and should not be unified.
//
// Usage:
//   import { generatePatternArticleSchema } from '@/lib/schema';
//   <SchemaScript schema={generatePatternArticleSchema(pattern, baseUrl)} />

import { SITE_CONFIG, AUTHOR_CONFIG } from "./config";
import type { ArticleSchema, PatternCitationSchema } from "./types";
import type { Pattern, Reference } from "@/data/agentic-design-patterns/types";

// ---------------------------------------------------------------------------
// Reference → citation mapper
// ---------------------------------------------------------------------------

/**
 * Maps a single agentic design pattern Reference to a PatternCitationSchema.
 *
 * Type mapping (per issue #155 rule 1):
 *   'paper'                    → ScholarlyArticle (with DOI identifier when present)
 *   'book'                     → Book
 *   'spec' | 'docs' | 'essay'  → WebPage
 *
 * Fields intentionally omitted from JSON-LD:
 *   - Reference.note   — UI-only annotation; schema.org has no clean equivalent
 *                        for a 1-line contextual note at the citation level.
 *   - Reference.pages  — book chapter page range; schema.org Book does not have
 *                        a top-level pagination slot. Skipped for v1; a future
 *                        enhancement could model this as a Chapter sub-entity.
 */
export function referenceToPatternCitation(ref: Reference): PatternCitationSchema {
  const base: PatternCitationSchema = {
    "@type": mapRefTypeToSchemaType(ref.type),
    name: ref.title,
    url: ref.url,
  };

  if (ref.authors) {
    base.author = { "@type": "Person", name: ref.authors };
  }

  if (ref.year) {
    base.datePublished = String(ref.year);
  }

  // DOI identifier — only for ScholarlyArticle ('paper' type).
  // propertyID must be uppercase 'DOI' per schema.org PropertyValue convention.
  if (ref.type === "paper" && ref.doi) {
    base.identifier = {
      "@type": "PropertyValue",
      propertyID: "DOI",
      value: ref.doi,
    };
  }

  return base;
}

function mapRefTypeToSchemaType(
  type: Reference["type"]
): PatternCitationSchema["@type"] {
  switch (type) {
    case "paper":
      return "ScholarlyArticle";
    case "book":
      return "Book";
    case "spec":
    case "docs":
    case "essay":
      return "WebPage";
  }
}

// ---------------------------------------------------------------------------
// Pattern → Article schema
// ---------------------------------------------------------------------------

/**
 * Generates a schema.org Article JSON-LD object for an agentic design pattern
 * satellite page.
 *
 * @param pattern  - The full Pattern object from the data catalog.
 * @param baseUrl  - The base URL of the site (e.g. SITE_CONFIG.url). Callers
 *                   should pass SITE_CONFIG.url; the parameter is accepted for
 *                   testability without mocking the module.
 *
 * @id uses suffix #pattern-article (not #article) to avoid collision with the
 * BlogPosting @id pattern used on /posts/* pages.
 *
 * author uses an @id reference to the canonical Person entity — not the full
 * AUTHOR_CONFIG object — to enable entity de-duplication across pages when
 * Google's parser resolves the graph.
 */
export function generatePatternArticleSchema(
  pattern: Pattern,
  baseUrl: string = SITE_CONFIG.url
): ArticleSchema {
  const url = `${baseUrl}/agentic-design-patterns/${pattern.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#pattern-article`,
    headline: pattern.name,
    description: pattern.oneLineSummary,
    url,
    dateModified: pattern.dateModified,
    // author is an @id reference — not the full AUTHOR_CONFIG object.
    // This enables entity de-duplication: the parser resolves the reference
    // back to the Person node emitted by generatePersonSchema() on the same
    // or any other page.
    author: { "@id": AUTHOR_CONFIG.id },
    citation: pattern.references.map(referenceToPatternCitation),
  };
}
