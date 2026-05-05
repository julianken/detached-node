-- Database Index Validation Script
-- Run this after applying the composite index migration to verify indexes were created

-- ==========================================
-- 1. List all indexes on posts and pages tables
-- ==========================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('posts', 'pages')
ORDER BY tablename, indexname;

-- ==========================================
-- 2. Analyze index usage and size
-- ==========================================
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('posts', 'pages')
ORDER BY tablename, indexname;

-- ==========================================
-- 3. Verify composite indexes exist
-- ==========================================
SELECT
  indexname,
  CASE
    WHEN indexname = 'idx_posts_status_published_at' THEN 'Expected: posts(status, published_at DESC)'
    WHEN indexname = 'idx_posts_featured_status_published_at' THEN 'Expected: posts(featured, status, published_at DESC) WHERE featured = true'
    WHEN indexname = 'idx_posts_status_updated_at' THEN 'Expected: posts(status, updated_at DESC)'
    WHEN indexname = 'idx_pages_status_updated_at' THEN 'Expected: pages(status, updated_at DESC)'
    ELSE 'Other index'
  END AS expected_definition,
  indexdef AS actual_definition
FROM pg_indexes
WHERE indexname IN (
  'idx_posts_status_published_at',
  'idx_posts_featured_status_published_at',
  'idx_posts_status_updated_at',
  'idx_pages_status_updated_at'
);

-- ==========================================
-- 4. Test Query Plans - Published Posts
-- ==========================================
-- This should use idx_posts_status_published_at
EXPLAIN ANALYZE
SELECT *
FROM posts
WHERE status = 'published'
ORDER BY "published_at" DESC
LIMIT 50;

-- ==========================================
-- 5. Test Query Plans - Featured Posts
-- ==========================================
-- This should use idx_posts_featured_status_published_at
EXPLAIN ANALYZE
SELECT *
FROM posts
WHERE featured = true
  AND status = 'published'
ORDER BY "published_at" DESC
LIMIT 3;

-- ==========================================
-- 6. Test Query Plans - Published Pages
-- ==========================================
-- This should use idx_pages_status_updated_at
EXPLAIN ANALYZE
SELECT *
FROM pages
WHERE status = 'published'
ORDER BY "updated_at" DESC;

-- ==========================================
-- 7. Check for unused indexes
-- ==========================================
-- After the site has been running, check for indexes that are never used
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('posts', 'pages')
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- ==========================================
-- Expected Results:
-- ==========================================
-- Section 1: Should show all indexes including the 4 new composite indexes
-- Section 2: Should show index sizes (typically a few KB to MB depending on data volume)
-- Section 3: Should return 4 rows confirming the composite indexes exist
-- Sections 4-6: Query plans should show "Index Scan using idx_posts_status_published_at" etc. or "Index Only Scan"
-- Section 7: New indexes may show 0 scans initially - run again after traffic
