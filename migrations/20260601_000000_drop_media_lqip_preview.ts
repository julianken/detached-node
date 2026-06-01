import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Drop Media lqip + preview columns
 *
 * Removes the columns backing the now-deleted image-preview experiment from
 * the `media` table:
 *
 *  - `lqip`          — legacy AVIF low-quality-image-placeholder data URL
 *  - `preview_color` — dominant color (`#rrggbb`) for the ASCII preview
 *  - `preview_ascii` — 24×12 luminance halftone (288 chars)
 *
 * The ASCII/LQIP placeholder experiment was removed (issue #441); heroes now
 * render plain `next/image` with a CSS spinner, so none of these columns have
 * a consumer. This also completes #246's "drop the lqip column".
 *
 * Uses DROP COLUMN IF EXISTS for idempotency — safe to run against databases
 * where the columns were never added (e.g. a fresh DB created with
 * `push: true`) or were already dropped manually.
 *
 * The existing add-column migrations (20260425_220000_add_media_lqip,
 * 20260428_010142_add_media_preview) are intentionally left untouched; this is
 * a new forward migration layered on top of them.
 *
 * Down migration: re-adds the three columns as nullable varchars (reversible
 * shape-wise; the previously-stored placeholder values are not restored).
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      DROP COLUMN IF EXISTS "lqip",
      DROP COLUMN IF EXISTS "preview_color",
      DROP COLUMN IF EXISTS "preview_ascii";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "lqip" varchar,
      ADD COLUMN IF NOT EXISTS "preview_color" varchar,
      ADD COLUMN IF NOT EXISTS "preview_ascii" varchar;
  `)
}
