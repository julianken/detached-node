import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Enforce NOT NULL on posts.featured_image_light_id
 * and featured_image_dark_id.
 *
 * The theme-aware hero migration (20260421_205422) intentionally added
 * both columns as nullable to allow a migration-first-then-seed deploy
 * sequence. The seed (scripts/seed-theme-hero.ts) has run and both
 * published posts are populated. Payload already enforces required: true
 * at the app layer (src/collections/Posts.ts); this migration closes
 * the DB-level gap for defense in depth.
 *
 * Prerequisite: no rows in `posts` may have either column NULL when
 * this runs. Verified pre-merge via:
 *   SELECT COUNT(*) FROM posts WHERE featured_image_light_id IS NULL
 *                                  OR featured_image_dark_id IS NULL;
 * (Expected: 0.)
 *
 * Down migration: drop the NOT NULL constraint on both columns.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ALTER COLUMN "featured_image_light_id" SET NOT NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "posts"
      ALTER COLUMN "featured_image_dark_id" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ALTER COLUMN "featured_image_light_id" DROP NOT NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "posts"
      ALTER COLUMN "featured_image_dark_id" DROP NOT NULL;
  `)
}
