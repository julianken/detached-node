import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add `preview` group to Media (color + ascii columns)
 *
 * Adds two nullable text columns to the `media` table that back the new
 * `preview` field group on the Media collection:
 *
 *  - `preview_color` — dominant color as `#rrggbb` (~7 chars / ~7 bytes)
 *  - `preview_ascii` — 24×12 luminance halftone (288 chars / ~288 bytes)
 *
 * Both columns are nullable. The `lqip` column is intentionally NOT dropped
 * in this migration — PR 1 dual-reads (preview if present, lqip blur as
 * fallback) so the existing 9 not-yet-backfilled docs do not regress to
 * the original yellow-flood placeholder during the deploy window between
 * PR 1 ship and the post-deploy backfill run.
 *
 * The `lqip` column will be dropped in PR 2 once all docs have a `preview`
 * populated and the render path is `preview`-only.
 *
 * Uses ADD COLUMN IF NOT EXISTS / DROP COLUMN IF EXISTS for idempotency.
 *
 * Down migration: drops both preview columns. Reversible.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "preview_color" varchar,
      ADD COLUMN IF NOT EXISTS "preview_ascii" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      DROP COLUMN IF EXISTS "preview_color",
      DROP COLUMN IF EXISTS "preview_ascii";
  `)
}
