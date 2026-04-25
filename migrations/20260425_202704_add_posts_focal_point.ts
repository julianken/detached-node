import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add focalPoint fields to Posts
 *
 * Adds two nullable numeric columns to the `posts` table:
 *   - `focal_point_x` — horizontal crop anchor (0=left, 50=center, 100=right)
 *   - `focal_point_y` — vertical crop anchor (0=top, 50=center, 100=bottom)
 *
 * Both columns are nullable so existing posts are not broken by the migration.
 * Payload stores the focalPoint group field values here; the defaultValue (50)
 * is applied at the application layer, not as a DB DEFAULT, so existing rows
 * will receive null until explicitly saved.
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
      ADD COLUMN IF NOT EXISTS "focal_point_x" numeric,
      ADD COLUMN IF NOT EXISTS "focal_point_y" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "focal_point_x",
      DROP COLUMN IF EXISTS "focal_point_y";
  `)
}
