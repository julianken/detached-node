import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Post } from '@/payload-types';
import { logError } from '@/lib/logging';
import { ErrorIds } from '@/lib/error-ids';
import { selectRelatedPosts } from './related-posts-select';

// Re-export the pure selection function + constants so callers that
// already import from `./related-posts` keep working. Unit tests should
// import directly from `./related-posts-select` to avoid pulling in
// `payload.config`, which demands DATABASE_URL/PAYLOAD_SECRET at import
// time.
export {
  selectRelatedPosts,
  RELATED_POSTS_FLOOR,
  RELATED_POSTS_CAP,
  type Tag,
} from './related-posts-select';

/**
 * Fetch related posts for the given post.
 *
 * Fetches all published posts at depth 1 (so `tags` and `featuredImage*`
 * are resolved) and runs them through `selectRelatedPosts`. Cached at the
 * React render level so a single post page that calls this once does not
 * re-query, and so that the same call inside `generateMetadata` (if it
 * ever lands) does not double-fetch.
 *
 * Returns an empty array on Payload error rather than throwing — the
 * Related Posts block is a progressive enhancement, never load-bearing
 * for the primary article content.
 */
export const getRelatedPosts = cache(async (post: Post): Promise<Post[]> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1, // resolves featuredImageLight/Dark + tags
    });
    return selectRelatedPosts(post, result.docs);
  } catch (error) {
    logError(
      'Failed to fetch related posts',
      error,
      { collection: 'posts', currentSlug: post.slug },
      ErrorIds.PAYLOAD_FIND_FAILED
    );
    return [];
  }
});
