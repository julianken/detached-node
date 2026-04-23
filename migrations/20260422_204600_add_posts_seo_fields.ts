import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add SEO fields to Posts
 *
 * Adds two nullable varchar columns to the `posts` table:
 *   - `seo_title`         — search-optimized title (falls back to title if blank)
 *   - `meta_description`  — meta description for search results (falls back to summary)
 *
 * Both columns are nullable so existing posts are not broken by the migration.
 * Payload enforces `maxLength` (160 and 320 respectively) at the application layer;
 * no CHECK constraint is added to the DB column.
 *
 * Uses ADD COLUMN IF NOT EXISTS / DROP COLUMN IF EXISTS for idempotency so the
 * migration is safe against production databases where `push: true` may have
 * already created these columns.
 *
 * Down migration: drops both columns.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "seo_title" varchar,
      ADD COLUMN IF NOT EXISTS "meta_description" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "seo_title",
      DROP COLUMN IF EXISTS "meta_description";
  `)
}
