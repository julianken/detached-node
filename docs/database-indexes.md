# Database Indexing Strategy

Related Linear issue: CON-111

## Overview

This document describes the database indexing strategy for optimizing query performance across the Detached Node CMS.

## Query Patterns

Based on analysis of the codebase, these are the most frequent query patterns:

### Posts Collection

1. **Published posts listing** (every page load)
   - Query: `WHERE status = 'published' ORDER BY publishedAt DESC`
   - Frequency: High
   - Index: `posts_status_published_at_idx`

2. **Post by slug** (post detail pages)
   - Query: `WHERE slug = ? AND status = 'published'`
   - Frequency: High
   - Index: `posts_slug_idx` (unique, auto-created)

3. **Featured posts** (homepage)
   - Query: `WHERE featured = true AND status = 'published' ORDER BY publishedAt DESC`
   - Frequency: Medium
   - Index: `posts_featured_status_published_at_idx` (partial index)

### Pages Collection

1. **Published pages** (sitemap generation)
   - Query: `WHERE status = 'published' ORDER BY updatedAt DESC`
   - Frequency: Medium
   - Index: `pages_status_updated_at_idx`

2. **Page by slug** (page detail)
   - Query: `WHERE slug = ? AND status = 'published'`
   - Frequency: Medium
   - Index: `pages_slug_idx` (unique, auto-created)

### Tags Collection

1. **Tag by slug** (tag pages)
   - Query: `WHERE slug = ?`
   - Frequency: Low
   - Index: `tags_slug_idx` (unique, auto-created)

## Index Implementation

### Single-Column Indexes

Managed by Payload through field configuration (`index: true`):

**Posts:**
- `posts_slug_idx` (unique)
- `posts_status_idx`
- `posts_published_at_idx`
- `posts_featured_idx`

**Pages:**
- `pages_slug_idx` (unique)
- `pages_status_idx`

**Tags:**
- `tags_slug_idx` (unique)

### Composite Indexes

Managed through migration `20260213_071400_add_query_optimization_composite_indexes.ts`:

1. **posts_status_published_at_idx**
   - Columns: `(status, published_at DESC NULLS LAST)`
   - Purpose: Optimize published posts listing
   - Type: Standard B-tree index

2. **posts_featured_status_published_at_idx**
   - Columns: `(featured, status, published_at DESC NULLS LAST)`
   - Purpose: Optimize featured posts query
   - Type: Partial index (only `WHERE featured = true`)
   - Benefit: Smaller index size, faster maintenance

3. **pages_status_updated_at_idx**
   - Columns: `(status, updated_at DESC)`
   - Purpose: Optimize sitemap generation
   - Type: Standard B-tree index

## Performance Impact

Expected improvements:

- **Query speed**: 10-100x faster on large datasets
- **Database CPU**: Reduced by 30-50% for read queries
- **Page load time**: 100-500ms improvement for post listings
- **Scalability**: Supports 10,000+ posts without degradation

## Migration Process

### 1. Apply Field-Level Indexes

The single-column indexes are automatically created by Payload when the schema is pushed or migrated:

```bash
npm run build
```

### 2. Apply Composite Indexes

Run the composite index migration:

```bash
npx payload migrate
```

This will apply migration `20260213_071400_add_query_optimization_composite_indexes.ts`.

### 3. Verify Index Creation

Connect to PostgreSQL and verify indexes:

```sql
-- List all indexes on posts table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'posts'
ORDER BY indexname;

-- Expected indexes:
-- posts_slug_idx (unique)
-- posts_status_idx
-- posts_published_at_idx
-- posts_featured_idx
-- posts_status_published_at_idx (composite)
-- posts_featured_status_published_at_idx (partial composite)
```

```sql
-- List all indexes on pages table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'pages'
ORDER BY indexname;

-- Expected indexes:
-- pages_slug_idx (unique)
-- pages_status_idx
-- pages_status_updated_at_idx (composite)
```

### 4. Analyze Query Plans

Verify that queries use the new indexes:

```sql
-- Test published posts query
EXPLAIN ANALYZE
SELECT *
FROM posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 50;

-- Should show: Index Scan using posts_status_published_at_idx
```

```sql
-- Test featured posts query
EXPLAIN ANALYZE
SELECT *
FROM posts
WHERE featured = true AND status = 'published'
ORDER BY published_at DESC
LIMIT 3;

-- Should show: Index Scan using posts_featured_status_published_at_idx
```

```sql
-- Test pages query
EXPLAIN ANALYZE
SELECT *
FROM pages
WHERE status = 'published'
ORDER BY updated_at DESC;

-- Should show: Index Scan using pages_status_updated_at_idx
```

## Validation Checklist

- [ ] Run `npm run build` successfully
- [ ] Run `npx payload migrate` successfully
- [ ] Verify all indexes exist in PostgreSQL
- [ ] Verify EXPLAIN ANALYZE shows index usage
- [ ] Test query performance before/after
- [ ] Monitor database metrics after deployment

## Maintenance

### Index Statistics

PostgreSQL automatically maintains index statistics. To manually update:

```sql
ANALYZE posts;
ANALYZE pages;
ANALYZE tags;
```

### Index Health Monitoring

Check index size and usage:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS times_used,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Unused Indexes

Identify unused indexes (run after at least 1 week of production traffic):

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelid NOT IN (
    SELECT indexrelid
    FROM pg_index
    WHERE indisunique OR indisprimary
  )
ORDER BY pg_relation_size(indexrelid) DESC;
```

## Future Optimizations

As the application grows, consider:

1. **Partial indexes** for type-based queries (e.g., `WHERE type = 'essay'`)
2. **Covering indexes** to avoid table lookups for common queries
3. **Expression indexes** if filtering by computed values
4. **GIN indexes** for full-text search on title/summary fields
5. **Materialized views** for complex aggregations

## References

- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Payload CMS Database Adapter](https://payloadcms.com/docs/database/overview)
- [PostgreSQL Index Performance](https://www.postgresql.org/docs/current/indexes-examine.html)
