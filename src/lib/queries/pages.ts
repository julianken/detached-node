import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Page } from '@/payload-types';
import { logError } from '@/lib/logging';
import { ErrorIds } from '@/lib/error-ids';

/**
 * Get page by slug
 * Cached to prevent duplicate queries in generateMetadata + page component
 */
export const getPageBySlug = cache(async (slug: string): Promise<Page | null> => {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
    });
    return docs[0] || null;
  } catch (error) {
    logError(
      'Failed to fetch page by slug',
      error,
      { collection: 'pages', slug },
      ErrorIds.PAYLOAD_FIND_FAILED
    );
    return null;
  }
});

/**
 * Get all published pages
 * Cached to prevent duplicate queries
 */
export const getPublishedPages = cache(async (): Promise<Page[]> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'pages',
      where: { status: { equals: 'published' } },
      sort: '-updatedAt',
    });
    return result.docs;
  } catch (error) {
    logError(
      'Failed to fetch published pages',
      error,
      { collection: 'pages' },
      ErrorIds.PAYLOAD_FIND_FAILED
    );
    return [];
  }
});
