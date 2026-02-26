import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add Composite Indexes for Query Optimization
 *
 * This migration adds composite indexes to optimize common query patterns:
 *
 * Posts Collection:
 * - idx_posts_status_publishedAt: Optimize queries filtering by status and sorting by date
 * - idx_posts_featured_status_publishedAt: Optimize featured post queries (partial index)
 * - idx_posts_status_updatedAt: Optimize sitemap generation and admin list views
 *
 * Pages Collection:
 * - idx_pages_status_updatedAt: Optimize published page queries with date sorting
 *
 * These indexes complement the existing single-column indexes on slug, status,
 * publishedAt, and featured fields defined in the collection configs.
 *
 * Query Patterns Optimized:
 * 1. getPublishedPosts(): WHERE status = 'published' ORDER BY publishedAt DESC
 * 2. getFeaturedPosts(): WHERE featured = true AND status = 'published'
 * 3. getPublishedPages(): WHERE status = 'published' ORDER BY updatedAt DESC
 * 4. Sitemap generation: WHERE status = 'published' ORDER BY updatedAt DESC
 *
 * Expected Performance Impact:
 * - 10-100x faster queries on large datasets (10k+ rows)
 * - Reduced database CPU usage
 * - Faster page loads, especially for post listings
 *
 * Validation:
 * After running this migration, verify indexes with:
 *   SELECT indexname, indexdef FROM pg_indexes
 *   WHERE tablename IN ('posts', 'pages')
 *   ORDER BY indexname;
 *
 * Test query performance with:
 *   EXPLAIN ANALYZE SELECT * FROM posts
 *   WHERE status = 'published'
 *   ORDER BY "publishedAt" DESC;
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Posts: Composite index for published posts sorted by date
  // Covers the most common query pattern across the site
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_posts_status_published_at
    ON posts(status, "published_at" DESC)
  `)

  // Posts: Partial composite index for featured posts
  // Only indexes rows where featured = true to minimize index size
  // More efficient than scanning all posts for the few featured ones
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_posts_featured_status_published_at
    ON posts(featured, status, "published_at" DESC)
    WHERE featured = true
  `)

  // Posts: Composite index for sitemap and admin list views
  // Used when displaying recently updated posts regardless of publish date
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_posts_status_updated_at
    ON posts(status, "updated_at" DESC)
  `)

  // Pages: Composite index for published pages sorted by update date
  // Optimizes both page listing and sitemap generation
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_pages_status_updated_at
    ON pages(status, "updated_at" DESC)
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove composite indexes in reverse order
  await db.execute(sql`DROP INDEX IF EXISTS idx_pages_status_updated_at`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_posts_status_updated_at`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_posts_featured_status_published_at`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_posts_status_published_at`)
}
