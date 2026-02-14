# Index Migration Testing Checklist

**Linear Issue:** CON-111
**Migration:** `migrations/20260213_072000_add_composite_indexes.ts`
**Date:** 2026-02-13

## Pre-Migration Checklist

### 1. Environment Preparation

- [ ] Database backup created
  ```bash
  # Vercel Postgres backup (automatic)
  # Local backup:
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] Development database connection verified
  ```bash
  echo $DATABASE_URL
  psql $DATABASE_URL -c "SELECT version();"
  ```

- [ ] Baseline query performance measured
  ```bash
  psql $DATABASE_URL -f scripts/validate-indexes.sql > baseline_performance.txt
  ```

### 2. Code Validation

- [x] TypeScript compilation successful: `npm run build`
- [x] Migration file created: `migrations/20260213_072000_add_composite_indexes.ts`
- [x] Query optimization added: `getFeaturedPosts()` sorts by `publishedAt`
- [x] Migration follows Payload CMS conventions

## Migration Execution

### Development Environment

```bash
# 1. Run migration
npm run payload migrate

# Expected output:
# ✓ Migration 20260213_add_composite_indexes completed successfully
```

### Production Environment

Migration runs automatically during deployment:

```bash
npm run build:production
# Runs: pnpm payload migrate && pnpm build
```

## Post-Migration Validation

### 1. Verify Indexes Created

```bash
psql $DATABASE_URL -c "
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('posts', 'pages')
  AND indexname LIKE 'idx_%'
ORDER BY indexname;
"
```

**Expected indexes:**
- `idx_posts_status_publishedAt`
- `idx_posts_featured_status_publishedAt`
- `idx_posts_status_updatedAt`
- `idx_pages_status_updatedAt`

### 2. Run Full Validation Script

```bash
psql $DATABASE_URL -f scripts/validate-indexes.sql > post_migration_validation.txt
```

**Review validation output:**
- [ ] All 4 composite indexes exist
- [ ] Query plans show "Index Scan using idx_..." for optimized queries
- [ ] No errors or warnings in output
- [ ] Index sizes are reasonable (< 1 MB for < 10k rows)

### 3. Compare Query Plans

#### Published Posts Query
```bash
psql $DATABASE_URL -c "
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE status = 'published'
ORDER BY \"publishedAt\" DESC
LIMIT 50;
"
```

**Expected output:**
```
Index Scan using idx_posts_status_publishedAt on posts
  Filter: (status = 'published')
  Rows Removed by Filter: 0
Planning Time: 0.xxx ms
Execution Time: x.xxx ms  <-- Should be < 10ms for < 10k rows
```

#### Featured Posts Query
```bash
psql $DATABASE_URL -c "
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE featured = true
  AND status = 'published'
ORDER BY \"publishedAt\" DESC
LIMIT 3;
"
```

**Expected output:**
```
Index Scan using idx_posts_featured_status_publishedAt on posts
  Index Cond: (featured = true)
  Filter: (status = 'published')
Planning Time: 0.xxx ms
Execution Time: x.xxx ms  <-- Should be < 5ms
```

### 4. Functional Testing

- [ ] Homepage loads correctly
  ```bash
  curl -I http://localhost:3000/
  # Expected: 200 OK
  ```

- [ ] Featured posts display on homepage
  - Visit http://localhost:3000/
  - Verify 3 featured posts appear
  - Check browser console for errors

- [ ] Post listing page loads
  ```bash
  curl -I http://localhost:3000/posts
  # Expected: 200 OK
  ```

- [ ] Post detail pages load
  - Visit http://localhost:3000/posts/[any-slug]
  - Verify post content displays
  - Check browser console for errors

- [ ] Sitemap generates correctly
  ```bash
  curl http://localhost:3000/sitemap.xml
  # Expected: XML with <url> entries for posts
  ```

- [ ] Admin panel loads
  - Visit http://localhost:3000/admin
  - Login and verify post list displays
  - Check for reasonable load times (< 2s)

### 5. Performance Testing

#### Query Performance Comparison

Compare baseline vs post-migration query times:

```bash
# Run 10 times and average
for i in {1..10}; do
  psql $DATABASE_URL -c "
    EXPLAIN ANALYZE
    SELECT * FROM posts
    WHERE status = 'published'
    ORDER BY \"publishedAt\" DESC;
  " | grep "Execution Time"
done
```

**Acceptance criteria:**
- Execution time < 10ms for < 1k rows
- Execution time < 50ms for < 10k rows
- Execution time improvement > 50% vs baseline

#### Page Load Performance

Measure full page load times:

```bash
# Install hyperfine if needed: brew install hyperfine
hyperfine \
  --warmup 3 \
  --runs 10 \
  'curl -s http://localhost:3000/posts > /dev/null'
```

**Acceptance criteria:**
- Page load time < 500ms (dev mode)
- Page load time < 200ms (production build)

### 6. Database Health Check

```bash
psql $DATABASE_URL -c "
SELECT
  pg_size_pretty(pg_database_size(current_database())) AS db_size,
  pg_size_pretty(pg_total_relation_size('posts')) AS posts_table_size,
  pg_size_pretty(pg_indexes_size('posts')) AS posts_indexes_size,
  pg_size_pretty(pg_total_relation_size('pages')) AS pages_table_size,
  pg_size_pretty(pg_indexes_size('pages')) AS pages_indexes_size;
"
```

**Acceptance criteria:**
- Index size increase < 10% of table size
- No unexpected size growth
- Database remains within quota

## Rollback Procedure

If validation fails or performance degrades:

### Option 1: Migration Rollback (Preferred)

```bash
npm run payload migrate:rollback
```

### Option 2: Manual Index Removal

```bash
psql $DATABASE_URL -c "
DROP INDEX IF EXISTS idx_pages_status_updatedAt;
DROP INDEX IF EXISTS idx_posts_status_updatedAt;
DROP INDEX IF EXISTS idx_posts_featured_status_publishedAt;
DROP INDEX IF EXISTS idx_posts_status_publishedAt;
"
```

### Option 3: Database Restore (Last Resort)

```bash
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

## Post-Deployment Monitoring

### 24 Hours After Deployment

- [ ] Check error logs for index-related errors
  ```bash
  vercel logs [deployment-url]
  ```

- [ ] Monitor database CPU and memory usage
  - Vercel Dashboard > Storage > Postgres > Metrics
  - Expected: CPU usage stable or reduced

- [ ] Verify index usage statistics
  ```bash
  psql $DATABASE_URL -c "
  SELECT
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE indexname LIKE 'idx_%'
  ORDER BY idx_scan DESC;
  "
  ```
  - Expected: `idx_scan > 0` for all composite indexes

### 1 Week After Deployment

- [ ] Compare query performance metrics
- [ ] Check for slow query logs
- [ ] Review index usage patterns
- [ ] Optimize further if needed

## Success Criteria

Migration is considered successful when:

1. ✅ All 4 composite indexes created without errors
2. ✅ Query plans show index usage for optimized queries
3. ✅ Page load times improved or stable
4. ✅ No functional regressions (all pages load correctly)
5. ✅ Database CPU usage stable or reduced
6. ✅ No index-related errors in logs
7. ✅ Index usage statistics show active usage (`idx_scan > 0`)

## Notes

### Known Warnings (Safe to Ignore)

- `Collections with uploads enabled require a storage adapter` - Expected for local development without Vercel Blob
- `Using in-memory rate limiter` - Expected for local development without Upstash

### Potential Issues

1. **Index not used by query planner:**
   - Run `ANALYZE posts;` and `ANALYZE pages;` to update statistics
   - Check query plan with `EXPLAIN` to verify index selection

2. **Migration timeout:**
   - For very large tables (> 1M rows), create indexes with `CONCURRENTLY`
   - Modify migration to use: `CREATE INDEX CONCURRENTLY ...`

3. **Duplicate index error:**
   - Drop existing indexes before re-running migration
   - Check for duplicate indexes with validation script

## Related Documentation

- [Database Indexing Strategy](./database-indexing-strategy.md)
- Migration File: `migrations/20260213_072000_add_composite_indexes.ts`
- Validation Script: `scripts/validate-indexes.sql`
- Payload Migrations: https://payloadcms.com/docs/database/migrations
