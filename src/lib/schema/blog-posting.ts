// src/lib/schema/blog-posting.ts
//
// Generates BlogPosting schema for individual post detail pages.
// Requires a Post object with relations populated at depth:1
// (featuredImageLight/Dark as Media objects, tags as Tag objects).
//
// Google Article rich result requirements (to qualify for article card in SERPs):
//   Required: headline, image (>700px wide), datePublished, dateModified, author
//   Recommended: description, url, publisher, keywords
//
// Posts missing required fields still produce valid JSON-LD — they just
// won't qualify for the Article rich result card.
//
// Usage:
//   import { generateBlogPostingSchema } from '@/lib/schema';
//   <SchemaScript schema={generateBlogPostingSchema(post)} />

import { SITE_CONFIG, AUTHOR_CONFIG } from "./config";
import { mapReferenceToCitation } from "./citation";
import { isMediaObject, isTagObject } from "@/lib/types/media";
import type { BlogPostingSchema, ImageObjectSchema } from "./types";
import type { Post } from "@/payload-types";

export function generateBlogPostingSchema(post: Post): BlogPostingSchema {
  const postUrl = `${SITE_CONFIG.url}/posts/${post.slug}`;

  // Image: only include if featuredImageLight is populated (not just an ID reference)
  // and has a URL. Width and height fall back to standard OG dimensions (1200x630)
  // matching the pattern already used in the post detail page component.
  // Google requires >700px width for Article rich result thumbnails.
  // The hero image size (1920px) configured in Media.ts exceeds this requirement.
  // We use the light variant for schema.org/JSON-LD because SERPs render on a
  // neutral (light) background and a single canonical image is required.
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

  // Keywords: extract tag names from populated Tag objects
  // Tags may be numeric IDs (not populated) or Tag objects (populated at depth:1)
  const keywords: string[] = [];
  if (post.tags) {
    for (const tag of post.tags) {
      if (isTagObject(tag)) {
        keywords.push(tag.name);
      }
    }
  }

  // Citations from references array. Each entry is mapped to the strongest
  // available schema.org citation type based on field completeness.
  const citation =
    post.references && post.references.length > 0
      ? post.references.map(mapReferenceToCitation)
      : undefined;

  // dateModified: Post.updatedAt is always present (Payload sets it on every save).
  // It is a proxy for dateModified — accurate for content changes, but also updates
  // on non-content admin saves (e.g., toggling featured flag, changing tags).
  //
  // TODO: Replace post.updatedAt with post.dateModified when the dedicated
  // dateModified field is added to the Posts collection (SEO impl plan item 1).
  // The field should use a beforeChange hook that only fires on body/title/summary
  // field changes, not on status or admin field changes.
  const dateModified = post.updatedAt;

  // Build the schema object. Required fields are always present.
  // Optional fields use conditional assignment to avoid undefined-valued keys
  // in the serialized JSON (cleaner output, no false validation hints).
  const schema: BlogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    // Post entity @id: canonical URL + #article fragment
    // Pattern: https://detached-node.dev/posts/{slug}#article
    "@id": `${postUrl}#article`,
    headline: post.title,
    url: postUrl,
    // author and publisher both reference the same Person entity.
    // For a personal blog, author = publisher. If this ever changes
    // (e.g., a guest author or an organization publisher), update
    // only publisher here — author should always be the individual.
    author: { "@id": AUTHOR_CONFIG.id },
    publisher: { "@id": AUTHOR_CONFIG.id },
    // isPartOf links this post to the WebSite entity
    isPartOf: { "@id": SITE_CONFIG.websiteId },
  };

  // Optional fields — omit rather than including as undefined/null
  if (post.summary) schema.description = post.summary;
  if (post.publishedAt) schema.datePublished = post.publishedAt;
  if (dateModified) schema.dateModified = dateModified;
  if (image) schema.image = image;
  // articleSection maps the Payload type select to the schema field.
  // Values: 'essay' | 'decoder' | 'index' | 'field-report'
  if (post.type) schema.articleSection = post.type;
  if (keywords.length > 0) schema.keywords = keywords;
  if (citation && citation.length > 0) schema.citation = citation;

  return schema;
}
