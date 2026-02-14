import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Post } from '@/payload-types';
import { logError } from '@/lib/logging';
import { ErrorIds } from '@/lib/error-ids';

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
      limit,
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
 * Get post by slug
 * Cached to prevent duplicate queries in generateMetadata + page component
 */
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
    });
    return docs[0] || null;
  } catch (error) {
    logError(
      'Failed to fetch post by slug',
      error,
      { collection: 'posts', slug },
      ErrorIds.PAYLOAD_FIND_FAILED
    );
    return null;
  }
});
