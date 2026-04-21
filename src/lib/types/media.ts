// src/lib/types/media.ts
//
// Shared type guards for Payload CMS relation fields.
// Payload relationship fields are polymorphic: they return either a numeric ID
// (when the relation is not populated/depth=0) or the full object (depth>=1).
// These type guards allow type-safe access to object fields after confirming
// the relation has been populated.

import type { Media, Tag } from "@/payload-types";

/**
 * Narrows a Payload media relation field to a populated Media object.
 * Use before accessing .url, .width, .height, or .alt.
 *
 * @example
 * if (isMediaObject(post.featuredImageLight) && post.featuredImageLight.url) {
 *   // safely access post.featuredImageLight.url
 * }
 */
export function isMediaObject(
  media: number | Media | null | undefined
): media is Media {
  return typeof media === "object" && media !== null && "url" in media;
}

/**
 * Narrows a Payload tag relation field to a populated Tag object.
 * Use before accessing .name or .slug.
 *
 * @example
 * post.tags?.filter(isTagObject).map(tag => tag.name)
 */
export function isTagObject(tag: number | Tag): tag is Tag {
  return typeof tag === "object" && "name" in tag;
}
