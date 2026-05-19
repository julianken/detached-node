import type { Post, Tag } from '@/payload-types';

/**
 * Floor and cap for the related-posts list.
 *
 * The floor is enforced by the fallback step in `selectRelatedPosts`: if the
 * primary tag-overlap step returns fewer than FLOOR results, the function
 * fills remaining slots with the most recently published posts (excluding
 * self and already-chosen). The cap trims the final list.
 *
 * Per issue #420 the AC requires "≥ 2 internal post-to-post anchors" per
 * post page, so the floor must be 2. The cap is set at 4 to keep the
 * component visually compact at small-corpus sizes (4 published posts at
 * time of authoring).
 */
export const RELATED_POSTS_FLOOR = 2;
export const RELATED_POSTS_CAP = 4;

/**
 * Resolve `Post.tags` (depth-1 returns `Tag` objects; depth-0 returns IDs)
 * into a stable Set of numeric tag IDs.
 *
 * Drift note: this helper is the single place that interprets the
 * union type `(number | Tag)[] | null`. If the Payload depth semantics
 * change, only this function needs to update.
 */
function tagIdsOf(post: Pick<Post, 'tags'>): Set<number> {
  const ids = new Set<number>();
  for (const t of post.tags ?? []) {
    if (typeof t === 'number') {
      ids.add(t);
    } else if (t && typeof t === 'object' && typeof t.id === 'number') {
      ids.add(t.id);
    }
  }
  return ids;
}

/**
 * Stable comparator for "most recently published first". Posts with no
 * `publishedAt` sort to the end. Within equal `publishedAt`, fall back to
 * `id` desc so the order is deterministic across calls.
 */
function compareByPublishedAtDesc(a: Post, b: Post): number {
  const ad = a.publishedAt ? Date.parse(a.publishedAt) : Number.NEGATIVE_INFINITY;
  const bd = b.publishedAt ? Date.parse(b.publishedAt) : Number.NEGATIVE_INFINITY;
  if (ad !== bd) return bd - ad;
  return b.id - a.id;
}

/**
 * Pure selection logic for the related-posts component.
 *
 * Three steps, in order:
 *
 *   1. Primary — tag-overlap candidates from `candidates`, sorted by
 *      overlap count desc, then `publishedAt` desc. Self is always
 *      excluded.
 *   2. Fallback — if step 1 returns fewer than `RELATED_POSTS_FLOOR`,
 *      append most-recently-published posts from `candidates` (excluding
 *      self and posts already chosen in step 1) until the floor is met
 *      or candidates are exhausted.
 *   3. Cap — return at most `RELATED_POSTS_CAP` posts.
 *
 * The function is pure: same inputs, same outputs, no I/O. The DB
 * wrapper (`getRelatedPosts` in `./related-posts.ts`) handles the Payload
 * fetch and feeds the result here. Splitting the two is what makes this
 * code mechanically testable without spinning up Postgres in vitest —
 * importing this module does not pull in `payload.config`, which would
 * otherwise demand DATABASE_URL/PAYLOAD_SECRET at import time.
 */
export function selectRelatedPosts(post: Post, candidates: Post[]): Post[] {
  const currentTagIds = tagIdsOf(post);

  // Candidates excluding the current post. Use slug for the comparison
  // because slug is the user-facing identity (and the AC selector keys
  // off `href$=slug` exclusion at the E2E layer).
  const pool = candidates.filter((c) => c.slug !== post.slug);

  // ---- Step 1: tag-overlap primary ----
  const overlapping = pool
    .map((c) => {
      const candidateTagIds = tagIdsOf(c);
      let overlap = 0;
      for (const id of currentTagIds) {
        if (candidateTagIds.has(id)) overlap++;
      }
      return { post: c, overlap };
    })
    .filter((row) => row.overlap > 0)
    .sort((a, b) => {
      // Overlap count desc; tiebreak on publishedAt desc.
      if (a.overlap !== b.overlap) return b.overlap - a.overlap;
      return compareByPublishedAtDesc(a.post, b.post);
    })
    .map((row) => row.post);

  // ---- Step 2: fallback fill ----
  const result = overlapping.slice();
  if (result.length < RELATED_POSTS_FLOOR) {
    const alreadyChosenSlugs = new Set(result.map((p) => p.slug));
    const remaining = pool
      .filter((c) => !alreadyChosenSlugs.has(c.slug))
      .sort(compareByPublishedAtDesc);
    for (const c of remaining) {
      if (result.length >= RELATED_POSTS_FLOOR) break;
      result.push(c);
    }
  }

  // ---- Step 3: cap ----
  return result.slice(0, RELATED_POSTS_CAP);
}

// Re-export Tag for callers that want to type-check tag-overlap reasoning.
export type { Tag };
