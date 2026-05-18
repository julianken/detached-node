import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add dedicatedDateModified to Posts
 *
 * Adds a nullable timestamp column to the `posts` table:
 *   - `dedicated_date_modified` — manually set when meaningful content changes
 *     ship. Used as the `dateModified` signal in BlogPosting JSON-LD. The
 *     beforeChange hook auto-stamps this on body/title/summary edits;
 *     rendering falls back to `updated_at` if unset.
 *
 * The column is nullable so existing posts are not broken by the migration —
 * pre-existing rows have NULL and the schema render falls back to
 * `updated_at` until the next meaningful edit triggers the hook.
 *
 * Uses ADD COLUMN IF NOT EXISTS / DROP COLUMN IF EXISTS for idempotency so
 * the migration is safe against databases where the column may already exist
 * (e.g. if `push: true` was used in development).
 *
 * N-1 safe: the previous container revision SELECTs `posts.*` via Drizzle's
 * generated column list. Adding a nullable column does not break old SELECTs
 * (Drizzle's column list is generated from the schema baked into that
 * revision, so it neither reads nor writes the new column). New code reads
 * dedicatedDateModified and falls back to updatedAt when null.
 *
 * Down migration: drops the column.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "dedicated_date_modified" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "dedicated_date_modified";
  `)
}
