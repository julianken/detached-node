import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add `theme` field to Posts
 *
 * Adds a nullable `theme` column to the `posts` table backed by a PostgreSQL
 * enum type `enum_posts_theme`. The three allowed values map directly to the
 * site's three visual themes:
 *   - 'isolation'    — sparse, high-contrast monochrome aesthetic
 *   - 'signal'       — amber / warning-band palette
 *   - 'architecture' — blueprint / technical-diagram palette
 *
 * The column is nullable so that existing posts are not broken by the
 * migration. Payload's `required: true` on the collection field enforces a
 * value at the application layer for new posts; existing rows can be
 * backfilled separately.
 *
 * An index on `posts(theme)` is created to support future queries that filter
 * or group posts by theme (e.g. listing pages per theme).
 *
 * Down migration: drops the index, drops the column, and drops the enum type.
 * No data preservation is needed — the field is editorial metadata that can
 * be re-entered if the migration is rolled back.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create the enum type idempotently — no-op if it already exists.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_theme"
        AS ENUM ('isolation', 'signal', 'architecture');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // Add the nullable theme column to posts.
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "theme" "public"."enum_posts_theme";
  `)

  // Index for theme-based filtering queries.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_theme_idx"
      ON "posts" USING btree ("theme");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop index first, then column, then enum type.
  await db.execute(sql`DROP INDEX IF EXISTS "posts_theme_idx";`)

  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "theme";
  `)

  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_posts_theme";`)
}
