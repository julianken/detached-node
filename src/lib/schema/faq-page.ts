// src/lib/schema/faq-page.ts
//
// Generates FAQPage JSON-LD for an agentic design pattern satellite page.
// Emit as a SECOND top-level schema on the satellite page (per schema.org
// best practice for separate entity types) — NOT nested inside the Article
// schema.
//
// Returns null when the pattern declares no related questions, so that
// downstream callers can spread the result into a SchemaScript array and
// filter falsy values.
//
// Why we still emit FAQPage:
//   Google deprecated the FAQ rich result in Search on 2026-05-07 (see
//   https://developers.google.com/search/docs/appearance/structured-data/faqpage),
//   so this markup no longer drives expanded SERP cards. However, the
//   FAQPage type is now consumed as an AI-search citation signal by
//   Perplexity, ChatGPT search, Gemini, and Google AI Overviews, which read
//   the Q/A pairs as quotable evidence when answering related queries.
//
// Visibility contract: the same questions and answers in this JSON-LD MUST
// also be rendered visibly on the page (RelatedQuestionsBlock). Visibility
// is a long-standing structured-data requirement and also keeps the
// AI-search citation honest — agents penalize JSON-LD that doesn't match
// what a human reader can see.
//
// Usage:
//   import { generateFaqPageSchema } from '@/lib/schema';
//   const faq = generateFaqPageSchema(pattern, siteUrl);
//   const schemas = [
//     generatePatternArticleSchema(pattern, siteUrl),
//     generateHubChildBreadcrumb(pattern.slug, pattern.name),
//     ...(faq ? [faq] : []),
//   ];

import { SITE_CONFIG } from "./config";
import type { FaqPageSchema } from "./types";
import type { Pattern } from "@/data/agentic-design-patterns/types";

/**
 * Generates a schema.org FAQPage JSON-LD object from a pattern's
 * relatedQuestions array. Returns null when the array is missing or empty.
 *
 * @param pattern  - The Pattern object from the data catalog.
 * @param baseUrl  - The base URL of the site (e.g. SITE_CONFIG.url). Mirrors
 *                   the generatePatternArticleSchema signature so callsites
 *                   can pass the same value to both generators.
 *
 * @id uses suffix #faq on the same canonical satellite URL used by the
 * Article schema's @id, so the two schemas share a coherent entity graph.
 */
export function generateFaqPageSchema(
  pattern: Pattern,
  baseUrl: string = SITE_CONFIG.url,
): FaqPageSchema | null {
  if (!pattern.relatedQuestions || pattern.relatedQuestions.length === 0) {
    return null;
  }

  const url = `${baseUrl}/agentic-design-patterns/${pattern.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: pattern.relatedQuestions.map(({ q, a }) => ({
      "@type": "Question" as const,
      name: q,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: a,
      },
    })),
  };
}
