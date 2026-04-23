import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add `prefix` field to Media
 *
 * Payload's upload handler stores an optional storage prefix (e.g. a GCS bucket
 * path or CDN subdirectory) alongside each uploaded file. The field appears in
 * `payload-types.ts` as `prefix?: string | null` but was absent from the
 * initial schema migration.
 *
 * Uses ADD COLUMN IF NOT EXISTS / DROP COLUMN IF EXISTS for idempotency so the
 * migration is safe against production databases where `push: true` may have
 * already created this column.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "prefix" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      DROP COLUMN IF EXISTS "prefix";
  `)
}
