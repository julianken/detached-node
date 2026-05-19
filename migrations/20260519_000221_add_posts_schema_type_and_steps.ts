import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Database Migration: Add `schemaType` field and `posts_steps` array table
 *
 * Supports issue #416 — per-post Schema.org primary type selection plus the
 * `HowTo.step` data source.
 *
 * Adds to the `posts` table:
 *   - `schema_type` — varchar NOT NULL, backed by the enum `enum_posts_schema_type`
 *     with values 'BlogPosting' | 'HowTo' | 'TechArticle'. Defaults to
 *     'BlogPosting' so all existing rows backfill to the existing behavior
 *     (the post detail page treats BlogPosting as the do-nothing case in the
 *     replace-emission strategy). The default is then dropped so the column
 *     matches what `payload generate:types` produces (Payload doesn't render
 *     DB defaults — it sets the default at the application layer via
 *     `defaultValue: 'BlogPosting'` on the field).
 *
 * Adds a new `posts_steps` table for the array field:
 *   - Standard Payload array-row columns: `_order` (int NOT NULL), `_parent_id`
 *     (int NOT NULL, FK → posts.id ON DELETE CASCADE), `id` (varchar PK).
 *   - `name` varchar NOT NULL, `text` varchar NOT NULL.
 *   - Indexes on `_order` and `_parent_id` matching the convention used by
 *     `posts_references` (so per-parent reads and ordering are both fast).
 *   - Per-row NOT NULL on `name`/`text` is enforced at the DB layer because
 *     Payload's `required: true` on each subfield maps directly to a NOT NULL
 *     column. The Posts collection adds a top-level array-level validator
 *     that requires at least one row when `schemaType === 'HowTo'`; that
 *     constraint is application-only and is NOT replicated in the DB schema
 *     (it depends on a sibling column value).
 *
 * Uses ADD COLUMN IF NOT EXISTS / IF EXISTS guards for idempotency so the
 * migration is safe against databases where `push: true` may have already
 * created the column or table in development.
 *
 * N-1 safe: the previous container revision SELECTs `posts.*` via Drizzle's
 * generated column list, which is baked from the schema known to that
 * revision. Adding a NOT NULL column with a default backfills cleanly. The
 * new `posts_steps` table is invisible to the prior revision. New code
 * branches on `post.schemaType` and reads `post.steps`; old rows are
 * 'BlogPosting' with no steps and fall through the new branches to the
 * existing BlogPosting generator.
 *
 * Down migration: drops the `posts_steps` table, drops `schema_type` from
 * `posts`, drops the enum type.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create the enum type idempotently.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_schema_type"
        AS ENUM ('BlogPosting', 'HowTo', 'TechArticle');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // Add schema_type with a temporary default so existing rows backfill to
  // 'BlogPosting', then drop the default to match what Payload expects (the
  // application-layer defaultValue handles new rows).
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "schema_type" "public"."enum_posts_schema_type"
        DEFAULT 'BlogPosting' NOT NULL;
  `)
  await db.execute(sql`
    ALTER TABLE "posts"
      ALTER COLUMN "schema_type" DROP DEFAULT;
  `)

  // Create the posts_steps array-element table.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "text" varchar NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_steps_order_idx"
      ON "posts_steps" USING btree ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_steps_parent_id_idx"
      ON "posts_steps" USING btree ("_parent_id");
  `)

  // FK guarded against re-runs by dropping first if it already exists.
  await db.execute(sql`
    ALTER TABLE "posts_steps"
      DROP CONSTRAINT IF EXISTS "posts_steps_parent_id_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "posts_steps"
      ADD CONSTRAINT "posts_steps_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop dependent table first, then the posts column, then the enum.
  await db.execute(sql`DROP TABLE IF EXISTS "posts_steps" CASCADE;`)

  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "schema_type";
  `)

  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_posts_schema_type";`)
}
