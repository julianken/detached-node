import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add lqip field to Media
 *
 * Adds a nullable text column `lqip` to the `media` table to store the
 * auto-generated AVIF low-quality image placeholder data URL.
 *
 * The column is nullable so existing Media docs are not broken — documents
 * uploaded before this migration (or where sharp generation fails) will
 * have NULL, and the application falls back to the 1×1 transparent PNG.
 *
 * Uses ADD COLUMN IF NOT EXISTS / DROP COLUMN IF EXISTS for idempotency so
 * the migration is safe against databases where the column may already exist
 * (e.g. if `push: true` was used in development).
 *
 * Down migration: drops the lqip column.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "lqip" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      DROP COLUMN IF EXISTS "lqip";
  `)
}
