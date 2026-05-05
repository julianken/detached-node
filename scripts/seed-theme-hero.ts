/**
 * Seeds (or updates) theme-aware hero image pairs for posts.
 *
 * Reads light + dark WebP files from `tmp/hero-pics/`, uploads via
 * Payload's local API to the Media collection, and links the resulting
 * media IDs to the matching posts via `featuredImageLight` /
 * `featuredImageDark`. Idempotent: media uploads are upserted by
 * filename and post updates always overwrite both variant fields, so
 * re-running refreshes bytes in place. Old media rows are NOT deleted
 * automatically — remove them via the admin if cleanup is desired.
 *
 * Run: `pnpm tsx scripts/seed-theme-hero.ts`
 *
 * Run `pnpm tsx scripts/convert-hero-webp.ts` FIRST if you only have
 * PNG source assets.
 *
 * Requires `DATABASE_URL`, `PAYLOAD_SECRET`, and (for prod uploads to
 * Google Cloud Storage) `GCS_BUCKET`, `GCS_HMAC_ACCESS_KEY`, and
 * `GCS_HMAC_SECRET` in `.env.local`.
 *
 * After a successful run, delete `tmp/hero-pics/`.
 */
import 'dotenv/config'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Media } from '../src/payload-types'

dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const heroPicsDir = path.join(repoRoot, 'tmp', 'hero-pics')

type Variant = 'light' | 'dark'

interface PostAssets {
  slug: string
  // Title shown in alt text for both variants when they don't already have one.
  title: string
  // Maps variant to the filename in tmp/hero-pics/.
  files: Record<Variant, string>
}

const POSTS: PostAssets[] = [
  {
    slug: 'rethinking-systems-in-the-agentic-age',
    title: 'Rethinking Systems in the Agentic Age',
    files: {
      light: 'rethinking-systems-in-the-agentic-age-light.webp',
      dark: 'rethinking-systems-in-the-agentic-age-dark.webp',
    },
  },
  {
    slug: 'what-tickets-and-prs-are-actually-for',
    title: 'What Tickets and PRs Are Actually For',
    files: {
      light: 'what-tickets-and-prs-are-actually-for-light.webp',
      dark: 'what-tickets-and-prs-are-actually-for-dark.webp',
    },
  },
]

async function main() {
  console.log('Seeding theme-aware hero images...')

  const { getPayload } = await import('payload')
  const configModule = await import('../src/payload.config.js')
  const config = configModule.default
  const payload = await getPayload({ config })

  for (const post of POSTS) {
    console.log(`\n→ ${post.slug}`)

    // Look up the post by slug so we know whether to proceed and what to link to.
    const { docs: matches } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
      depth: 0,
    })

    if (matches.length === 0) {
      console.warn(`  ⚠ Post not found; skipping`)
      continue
    }

    const postDoc = matches[0]

    // Upload (or re-upload) each variant. We upsert by filename to stay
    // idempotent — re-running the script won't pile up duplicate media rows.
    const mediaIds: Record<Variant, number> = { light: 0, dark: 0 }

    for (const variant of ['light', 'dark'] as const) {
      const filename = post.files[variant]
      const filePath = path.join(heroPicsDir, filename)

      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing source asset: ${filePath}`)
      }

      const alt = `${post.title} — ${variant} hero`

      // Find existing media by filename (Payload sets filename to the
      // upload's basename on disk — Payload persists the filename as
      // canonical regardless of storage adapter).
      const { docs: existingMedia } = await payload.find({
        collection: 'media',
        where: { filename: { equals: filename } },
        limit: 1,
        depth: 0,
      })

      let mediaDoc: Media
      if (existingMedia.length > 0) {
        console.log(`  ↻ Updating existing media #${existingMedia[0].id} (${filename})`)
        mediaDoc = await payload.update({
          collection: 'media',
          id: existingMedia[0].id,
          data: { alt },
          filePath,
        })
      } else {
        console.log(`  + Uploading ${filename}`)
        mediaDoc = await payload.create({
          collection: 'media',
          data: { alt },
          filePath,
        })
      }

      mediaIds[variant] = mediaDoc.id
    }

    console.log(
      `  ✓ Linking light=#${mediaIds.light}, dark=#${mediaIds.dark} to post #${postDoc.id}`,
    )
    await payload.update({
      collection: 'posts',
      id: postDoc.id,
      data: {
        featuredImageLight: mediaIds.light,
        featuredImageDark: mediaIds.dark,
      },
    })
  }

  console.log('\nDone.')
  console.log('Remember to: rm -rf tmp/hero-pics/')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
