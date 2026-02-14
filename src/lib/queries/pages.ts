import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Page } from '@/payload-types';
import { logError } from '@/lib/logging';
import { ErrorIds } from '@/lib/error-ids';
import { type Slug, isValidSlug } from '@/lib/types/branded';

/**
 * Get page by slug with branded type validation
 * Cached to prevent duplicate queries in generateMetadata + page component
 *
 * @param slug - Raw slug string from URL params (validated internally)
 * @returns The page if found and published, null otherwise
 */
export const getPageBySlug = cache(async (slug: string): Promise<Page | null> => {
  // Validate slug format before querying - invalid slugs can't match any page
  if (!isValidSlug(slug)) {
    logError(
      'Invalid slug format in getPageBySlug',
      new Error(`Invalid slug: ${slug}`),
      { collection: 'pages', slug },
      ErrorIds.INVALID_SLUG
    );
    return null;
  }

  // At this point, slug is branded as Slug type
  const validatedSlug: Slug = slug;

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: validatedSlug },
        status: { equals: 'published' },
      },
      limit: 1,
    });
    return docs[0] || null;
  } catch (error) {
    logError(
      'Failed to fetch page by slug',
      error,
      { collection: 'pages', slug: validatedSlug },
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
