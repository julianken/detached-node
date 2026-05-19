// src/lib/schema/howto.ts
//
// Generates HowTo schema for posts whose `schemaType` field is set to
// "HowTo". Mirrors the per-post shape used by generateBlogPostingSchema —
// the same Person/WebSite @id references, the same image/keyword/citation
// derivation — and adds the `step` array sourced from `post.steps`.
//
// Step source: an explicit Payload field, not Lexical-heading extraction.
// See issue #416 "Design decisions made in this spec" for the rationale.
// When `post.steps` is missing or empty this generator returns null so the
// caller can fall back to the BlogPosting default (the Posts collection
// enforces `steps` as conditionally required when `schemaType === "HowTo"`,
// so reaching this null branch in practice means an editor mis-tagged a
// post — the caller's fallback prevents that authoring slip from emitting
// a non-grounding HowTo).
//
// Google's HowTo rich-result category requires at least one `step` with a
// `name` and `text` to trigger. Both fields are enforced as `required: true`
// on the Payload array element so the JSON-LD is guaranteed to satisfy that
// trigger when present.
//
// Usage:
//   import { generateHowToSchema } from '@/lib/schema';
//   const schema = generateHowToSchema(post);
//   if (schema) <SchemaScript schema={schema} />;

import { SITE_CONFIG, AUTHOR_CONFIG } from "./config";
import { mapReferenceToCitation } from "./citation";
import { isMediaObject, isTagObject } from "@/lib/types/media";
import type { HowToSchema, HowToStep, ImageObjectSchema } from "./types";
import type { Post } from "@/payload-types";

export function generateHowToSchema(post: Post): HowToSchema | null {
  // Step source is the Payload `steps` array. Empty or missing → no HowTo:
  // emitting one without `step` would validate as JSON-LD but contribute no
  // grounding signal beyond a generic Article, contradicting the issue's
  // motivation. Callers should fall back to BlogPosting in that case.
  if (!post.steps || post.steps.length === 0) {
    return null;
  }

  const steps: HowToStep[] = post.steps.map((s) => ({
    "@type": "HowToStep" as const,
    name: s.name,
    text: s.text,
  }));

  const postUrl = `${SITE_CONFIG.url}/posts/${post.slug}`;

  // Image: same light-variant convention as BlogPosting. Width and height
  // default to 1200x630 (standard OG dimensions) when the Media record
  // doesn't carry them. >700px width is the Google Article-rich-result
  // floor; the configured 1920px hero size in Media.ts clears it.
  let image: ImageObjectSchema | undefined;
  if (isMediaObject(post.featuredImageLight) && post.featuredImageLight.url) {
    image = {
      "@type": "ImageObject",
      url: post.featuredImageLight.url,
      width: post.featuredImageLight.width ?? 1200,
      height: post.featuredImageLight.height ?? 630,
      description: post.featuredImageLight.alt || undefined,
    };
  }

  const keywords: string[] = [];
  if (post.tags) {
    for (const tag of post.tags) {
      if (isTagObject(tag)) {
        keywords.push(tag.name);
      }
    }
  }

  const citation =
    post.references && post.references.length > 0
      ? post.references.map(mapReferenceToCitation)
      : undefined;

  const dateModified = post.dedicatedDateModified ?? post.updatedAt;

  // HowTo uses `name` rather than `headline` as the top-level title field
  // (it inherits from CreativeWork, not Article). The visible post title
  // serves both roles fine.
  const schema: HowToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${postUrl}#article`,
    name: post.title,
    url: postUrl,
    author: { "@id": AUTHOR_CONFIG.id },
    publisher: { "@id": AUTHOR_CONFIG.id },
    isPartOf: { "@id": SITE_CONFIG.websiteId },
    step: steps,
  };

  if (post.summary) schema.description = post.summary;
  if (post.publishedAt) schema.datePublished = post.publishedAt;
  if (dateModified) schema.dateModified = dateModified;
  if (image) schema.image = image;
  if (keywords.length > 0) schema.keywords = keywords;
  if (citation && citation.length > 0) schema.citation = citation;

  return schema;
}
