# Database Indexing Strategy

**Linear Issue:** CON-111
**Last Updated:** 2026-02-13
**Status:** Implemented

## Overview

This document describes the database indexing strategy for the Mind-Controlled CMS, optimizing query performance for common access patterns while minimizing index maintenance overhead.

## Index Categories

### 1. Single-Column Indexes (Defined in Collection Configs)

These indexes are created automatically by Payload CMS based on field configurations:

#### Posts Collection (`src/collections/Posts.ts`)
- `slug` (unique index): Fast lookups for post detail pages
- `status` (index): Filter published vs draft posts
- `publishedAt` (index): Sort by publication date
- `featured` (index): Filter featured posts

#### Pages Collection (`src/collections/Pages.ts`)
- `slug` (unique index): Fast lookups for page detail routes
- `status` (index): Filter published vs draft pages

#### Tags Collection (`src/collections/Tags.ts`)
- `slug` (unique index): Fast lookups for tag pages
- `name` (unique index): Prevent duplicate tag names

### 2. Composite Indexes (Database Migration)

Composite indexes optimize queries that filter and sort on multiple columns. Created via migration `migrations/20260213_072000_add_composite_indexes.ts`:

#### Posts Collection
```sql
-- Optimize: WHERE status = 'published' ORDER BY publishedAt DESC
CREATE INDEX idx_posts_status_publishedAt
ON posts(status, "publishedAt" DESC);

-- Optimize: WHERE featured = true AND status = 'published' ORDER BY publishedAt DESC
-- Partial index (only indexes featured = true rows)
CREATE INDEX idx_posts_featured_status_publishedAt
ON posts(featured, status, "publishedAt" DESC)
WHERE featured = true;

-- Optimize: WHERE status = 'published' ORDER BY updatedAt DESC (sitemap)
CREATE INDEX idx_posts_status_updatedAt
ON posts(status, "updatedAt" DESC);
```

#### Pages Collection
```sql
-- Optimize: WHERE status = 'published' ORDER BY updatedAt DESC
CREATE INDEX idx_pages_status_updatedAt
ON pages(status, "updatedAt" DESC);
```

## Query Pattern Analysis

### Critical Queries (Every Page Load)

| Query | Location | Frequency | Index Used |
|-------|----------|-----------|------------|
| Get published posts | `src/lib/queries/posts.ts:getPublishedPosts()` | Every `/posts` page | `idx_posts_status_publishedAt` |
| Get featured posts | `src/lib/queries/posts.ts:getFeaturedPosts()` | Every homepage load | `idx_posts_featured_status_publishedAt` |
| Get post by slug | `src/lib/queries/posts.ts:getPostBySlug()` | Every post detail page | `slug` (unique) |
| Get page by slug | `src/lib/queries/pages.ts:getPageBySlug()` | Every page detail route | `slug` (unique) |

### Secondary Queries (Periodic/Admin)

| Query | Location | Frequency | Index Used |
|-------|----------|-----------|------------|
| Get published pages | `src/lib/queries/pages.ts:getPublishedPages()` | Sitemap generation | `idx_pages_status_updatedAt` |
| Admin post list | Payload CMS admin | Admin browsing | `idx_posts_status_updatedAt` |

## Index Selection Strategy

PostgreSQL can only use one index per table per query. Our composite indexes are designed so PostgreSQL chooses the optimal index for each query:

### Example: Published Posts Query
```typescript
// Query from getPublishedPosts()
await payload.find({
  collection: 'posts',
  where: { status: { equals: 'published' } },
  sort: '-publishedAt',
})
```

**Indexes available:**
- `status` (single-column)
- `publishedAt` (single-column)
- `idx_posts_status_publishedAt` (composite) ✓ OPTIMAL

**PostgreSQL chooses** `idx_posts_status_publishedAt` because:
1. It covers both the filter condition (`status = 'published'`)
2. AND the sort order (`ORDER BY publishedAt DESC`)
3. No additional sort operation required (faster)

### Example: Featured Posts Query
```typescript
// Query from getFeaturedPosts()
await payload.find({
  collection: 'posts',
  where: {
    featured: { equals: true },
    status: { equals: 'published' },
  },
  sort: '-publishedAt',
  limit: 3,
})
```

**Indexes available:**
- `featured` (single-column)
- `status` (single-column)
- `publishedAt` (single-column)
- `idx_posts_status_publishedAt` (composite)
- `idx_posts_featured_status_publishedAt` (partial composite) ✓ OPTIMAL

**PostgreSQL chooses** `idx_posts_featured_status_publishedAt` because:
1. Partial index (WHERE featured = true) means much smaller index size
2. Only ~3-10 featured posts vs thousands of total posts
3. Index covers all filter conditions and sort order

## Performance Impact

### Expected Query Performance

| Dataset Size | Query Type | Without Index | With Composite Index | Speedup |
|--------------|------------|---------------|---------------------|---------|
| 100 posts | Published posts | ~5ms | ~2ms | 2.5x |
| 1,000 posts | Published posts | ~50ms | ~3ms | 16x |
| 10,000 posts | Published posts | ~500ms | ~5ms | 100x |
| 100,000 posts | Published posts | ~5000ms | ~10ms | 500x |

### Index Maintenance Cost

- **Write performance:** Minimal impact (< 5% overhead)
- **Storage:** ~1-2 KB per 1000 rows for composite indexes
- **Index updates:** Automatic on INSERT/UPDATE/DELETE

Composite indexes are updated automatically by PostgreSQL. The overhead is negligible compared to the read performance gains.

## Validation and Monitoring

### After Migration

Run the validation script to verify indexes were created:

```bash
psql $DATABASE_URL -f scripts/validate-indexes.sql
```

Expected output:
- 4 new composite indexes created
- Query plans show "Index Scan using idx_..." for optimized queries
- No errors or warnings

### Ongoing Monitoring

Check index usage periodically:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE tablename IN ('posts', 'pages')
ORDER BY idx_scan DESC;
```

**Healthy indexes:**
- `idx_scan` increases over time (index is being used)
- No indexes with `idx_scan = 0` and large size (unused indexes should be removed)

### Performance Testing

Before/after comparison with `EXPLAIN ANALYZE`:

```sql
-- Should show "Index Scan using idx_posts_status_publishedAt"
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE status = 'published'
ORDER BY "publishedAt" DESC;
```

## Future Considerations

### When to Add More Indexes

Add indexes if:
1. A query pattern becomes frequent (> 100 requests/hour)
2. Query execution time exceeds 50ms consistently
3. Database CPU usage is high due to sequential scans

### When to Remove Indexes

Remove indexes if:
1. `idx_scan = 0` after significant traffic (index never used)
2. Write performance degrades (too many indexes on write-heavy tables)
3. Storage constraints require optimization

### Potential Future Indexes

If these query patterns emerge:

```sql
-- Tag-based filtering (if tags are used for navigation)
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Full-text search (if search is implemented)
CREATE INDEX idx_posts_search ON posts USING GIN(to_tsvector('english', title || ' ' || summary));

-- Date range queries (if archive pages are added)
CREATE INDEX idx_posts_publishedAt_range ON posts("publishedAt") WHERE status = 'published';
```

## Migration Management

### Applying the Migration

```bash
# Development
npm run payload migrate

# Production (Vercel deployment)
npm run build:production
# (runs "pnpm payload migrate && pnpm build")
```

### Rolling Back

If the migration causes issues:

```bash
# Manually rollback
npm run payload migrate:rollback

# Or connect to database and run:
DROP INDEX IF EXISTS idx_pages_status_updatedAt;
DROP INDEX IF EXISTS idx_posts_status_updatedAt;
DROP INDEX IF EXISTS idx_posts_featured_status_publishedAt;
DROP INDEX IF EXISTS idx_posts_status_publishedAt;
```

### Testing in Development

1. Run migration: `npm run payload migrate`
2. Validate indexes: `psql $DATABASE_URL -f scripts/validate-indexes.sql`
3. Test queries: Check Payload admin panel loads quickly
4. Monitor logs: No index-related errors in console

## References

- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Payload CMS Migrations](https://payloadcms.com/docs/database/migrations)
- [Query Optimization Best Practices](https://www.postgresql.org/docs/current/sql-createindex.html)

## Related Files

- Migration: `migrations/20260213_072000_add_composite_indexes.ts`
- Validation: `scripts/validate-indexes.sql`
- Queries: `src/lib/queries/posts.ts`, `src/lib/queries/pages.ts`
- Collections: `src/collections/Posts.ts`, `src/collections/Pages.ts`
