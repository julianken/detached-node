import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Theme-aware hero images for Posts
 *
 * Replaces the single `featured_image_id` column on `posts` with two sibling
 * columns, `featured_image_light_id` and `featured_image_dark_id`. Both
 * columns are added as nullable — NOT NULL is enforced at the Payload
 * application layer (required: true) but not in this migration, because the
 * deploy sequence is migration-first-then-seed: existing rows will have NULL
 * for both columns until `scripts/seed-theme-hero.ts` populates them.
 * A follow-up migration should add the NOT NULL constraint once the seed has
 * run in production.
 *
 * The two currently-published posts are re-seeded by a separate script
 * (`scripts/seed-theme-hero.ts`), so we do NOT need to preserve legacy data
 * from the old column. The migration drops the column outright.
 *
 * Rationale: the site wraps theme changes in `document.startViewTransition()`,
 * which takes a browser snapshot of before/after DOM state and crossfades
 * between them. A single post-wide hero image could not participate in that
 * crossfade; pairing light/dark variants and swapping visibility via
 * `dark:hidden` / `dark:block` lets the View Transitions machinery render the
 * hero swap as part of the page-wide crossfade automatically.
 *
 * Down migration: restores the single `featured_image_id` column and drops
 * the two new columns. Any data in the new columns is lost — this is
 * acceptable because (a) only two posts exist, (b) both will be re-seeded
 * from disk assets, and (c) the rollback path is not expected to be taken.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Drop the FK constraint and index on the legacy column first.
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP CONSTRAINT IF EXISTS "posts_featured_image_id_media_id_fk";
  `)
  await db.execute(sql`DROP INDEX IF EXISTS "posts_featured_image_idx";`)

  // Drop the legacy single-variant column.
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "featured_image_id";
  `)

  // Add the two new columns as nullable. Existing rows will have NULL until
  // scripts/seed-theme-hero.ts runs. NOT NULL is enforced by Payload at the
  // app layer (required: true); DB-level NOT NULL belongs in a post-seed
  // follow-up migration.
  // TODO: add a follow-up migration to SET NOT NULL after the seed runs in prod.
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN "featured_image_light_id" integer,
      ADD COLUMN "featured_image_dark_id" integer;
  `)

  // Foreign keys to media, mirroring the original featured_image_id FK.
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_featured_image_light_id_media_id_fk"
      FOREIGN KEY ("featured_image_light_id")
      REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  `)
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_featured_image_dark_id_media_id_fk"
      FOREIGN KEY ("featured_image_dark_id")
      REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  `)

  // Index the two new columns (matches the original featured_image_idx).
  await db.execute(sql`
    CREATE INDEX "posts_featured_image_light_idx"
      ON "posts" USING btree ("featured_image_light_id");
  `)
  await db.execute(sql`
    CREATE INDEX "posts_featured_image_dark_idx"
      ON "posts" USING btree ("featured_image_dark_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop new indexes, FKs, and columns in reverse order.
  await db.execute(sql`DROP INDEX IF EXISTS "posts_featured_image_light_idx";`)
  await db.execute(sql`DROP INDEX IF EXISTS "posts_featured_image_dark_idx";`)

  await db.execute(sql`
    ALTER TABLE "posts"
      DROP CONSTRAINT IF EXISTS "posts_featured_image_light_id_media_id_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP CONSTRAINT IF EXISTS "posts_featured_image_dark_id_media_id_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "featured_image_light_id",
      DROP COLUMN IF EXISTS "featured_image_dark_id";
  `)

  // Restore the legacy single-variant column + FK + index.
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN "featured_image_id" integer;
  `)
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_featured_image_id_media_id_fk"
      FOREIGN KEY ("featured_image_id")
      REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  `)
  await db.execute(sql`
    CREATE INDEX "posts_featured_image_idx"
      ON "posts" USING btree ("featured_image_id");
  `)
}
