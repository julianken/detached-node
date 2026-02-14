import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Post } from '@/payload-types';
import { logError } from '@/lib/logging';
import { ErrorIds } from '@/lib/error-ids';
import { type Slug, isValidSlug } from '@/lib/types/branded';

/**
 * Get featured posts for homepage
 * Cached to prevent duplicate queries
 */
export const getFeaturedPosts = cache(async (limit = 3): Promise<Post[]> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'posts',
      where: {
        featured: { equals: true },
        status: { equals: 'published' },
      },
      sort: '-publishedAt', // Sort by date to use composite index idx_posts_featured_status_publishedAt
      limit,
      depth: 1, // Include featuredImage relationship
    });
    return result.docs;
  } catch (error) {
    logError(
      'Failed to fetch featured posts',
      error,
      { collection: 'posts', limit },
      ErrorIds.PAYLOAD_FIND_FAILED
    );
    return [];
  }
});

/**
 * Get all published posts
 * Cached to prevent duplicate queries
 */
export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1, // Include featuredImage relationship
    });
    return result.docs;
  } catch (error) {
    logError(
      'Failed to fetch published posts',
      error,
      { collection: 'posts' },
      ErrorIds.PAYLOAD_FIND_FAILED
    );
    return [];
  }
});

/**
 * Get post by slug with branded type validation
 * Cached to prevent duplicate queries in generateMetadata + page component
 *
 * @param slug - Raw slug string from URL params (validated internally)
 * @returns The post if found and published, null otherwise
 *
 * Note: This function accepts a raw string and validates it internally,
 * allowing callers to pass URL params directly. Invalid slugs return null
 * rather than throwing, following the "not found" pattern.
 */
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  // Validate slug format before querying - invalid slugs can't match any post
  if (!isValidSlug(slug)) {
    logError(
      'Invalid slug format in getPostBySlug',
      new Error(`Invalid slug: ${slug}`),
      { collection: 'posts', slug },
      ErrorIds.INVALID_SLUG
    );
    return null;
  }

  // At this point, slug is branded as Slug type
  const validatedSlug: Slug = slug;

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: validatedSlug },
        status: { equals: 'published' },
      },
      limit: 1,
      depth: 1, // Include featuredImage relationship
    });
    return docs[0] || null;
  } catch (error) {
    logError(
      'Failed to fetch post by slug',
      error,
      { collection: 'posts', slug: validatedSlug },
      ErrorIds.PAYLOAD_FIND_FAILED
    );
    return null;
  }
});
