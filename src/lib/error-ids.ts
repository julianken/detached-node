/**
 * Error ID constants for tracking and error service integration
 *
 * These IDs help track errors across deployments and integrate with
 * error tracking services like Sentry, LogRocket, etc.
 */

export const ErrorIds = {
  // Database errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_TABLES_NOT_FOUND: 'DB_TABLES_NOT_FOUND',

  // Content errors
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  INVALID_SLUG: 'INVALID_SLUG',

  // Payload CMS errors
  PAYLOAD_INIT_FAILED: 'PAYLOAD_INIT_FAILED',
  PAYLOAD_FIND_FAILED: 'PAYLOAD_FIND_FAILED',

  // Metadata errors
  METADATA_GENERATION_FAILED: 'METADATA_GENERATION_FAILED',

  // Client-side errors
  RENDER_ERROR: 'RENDER_ERROR',
  HYDRATION_ERROR: 'HYDRATION_ERROR',

  // Sitemap errors
  SITEMAP_GENERATION_FAILED: 'SITEMAP_GENERATION_FAILED',
} as const

export type ErrorId = typeof ErrorIds[keyof typeof ErrorIds]
