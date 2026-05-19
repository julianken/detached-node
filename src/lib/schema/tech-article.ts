// src/lib/schema/tech-article.ts
//
// Generates TechArticle schema for posts whose `schemaType` field is set to
// "TechArticle". Field-for-field mirror of generateBlogPostingSchema with
// `@type` swapped — TechArticle and BlogPosting are siblings under Article
// and share the same descriptive surface (headline, description, image,
// dates, keywords, citations).
//
// Why a separate generator (and not a parameterized BlogPosting):
//   The schema generators are intentionally one-file-per-type so each can
//   evolve independently as Schema.org or Google's rich-result guidance
//   changes. Sharing implementation via a helper would couple them through
//   refactor risk; the duplication here is small and deliberate.
//
// Replace strategy (see issue #416 design decisions): when this generator
// runs for a post, the BlogPosting generator does NOT also run for that
// post. The Posts collection's `schemaType` field is the single switch the
// post detail page reads to decide which generator to call.
//
// Usage:
//   import { generateTechArticleSchema } from '@/lib/schema';
//   <SchemaScript schema={generateTechArticleSchema(post)} />

import { SITE_CONFIG, AUTHOR_CONFIG } from "./config";
import { mapReferenceToCitation } from "./citation";
import { isMediaObject, isTagObject } from "@/lib/types/media";
import type { ImageObjectSchema, TechArticleSchema } from "./types";
import type { Post } from "@/payload-types";

export function generateTechArticleSchema(post: Post): TechArticleSchema {
  const postUrl = `${SITE_CONFIG.url}/posts/${post.slug}`;

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

  const schema: TechArticleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${postUrl}#article`,
    headline: post.title,
    url: postUrl,
    author: { "@id": AUTHOR_CONFIG.id },
    publisher: { "@id": AUTHOR_CONFIG.id },
    isPartOf: { "@id": SITE_CONFIG.websiteId },
  };

  if (post.summary) schema.description = post.summary;
  if (post.publishedAt) schema.datePublished = post.publishedAt;
  if (dateModified) schema.dateModified = dateModified;
  if (image) schema.image = image;
  if (post.type) schema.articleSection = post.type;
  if (keywords.length > 0) schema.keywords = keywords;
  if (citation && citation.length > 0) schema.citation = citation;

  return schema;
}
