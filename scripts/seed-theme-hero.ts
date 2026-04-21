/**
 * Seed script: theme-aware hero images for the two currently-published posts.
 *
 * Run with: pnpm tsx scripts/seed-theme-hero.ts
 *
 * Uploads four source images from tmp/hero-pics/ (light + dark for each of
 * "rethinking-systems-in-the-agentic-age" and "what-tickets-and-prs-are-actually-for"),
 * then links the resulting media IDs to the matching posts via the new
 * featuredImageLight / featuredImageDark fields.
 *
 * Safe to run more than once: media uploads are upserted by filename, and the
 * post update is idempotent (we always overwrite both variant fields with the
 * freshest upload IDs). Old media rows are NOT deleted — delete manually in
 * the admin if cleanup is desired.
 *
 * Requires DATABASE_URL, PAYLOAD_SECRET, and (for prod uploads to Vercel Blob)
 * BLOB_READ_WRITE_TOKEN in .env.local.
 *
 * After a successful run, delete tmp/hero-pics/.
 */
import 'dotenv/config'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
      light: 'rethinking-systems-in-the-agentic-age-light.png',
      dark: 'rethinking-systems-in-the-agentic-age-dark.png',
    },
  },
  {
    slug: 'what-tickets-and-prs-are-actually-for',
    title: 'What Tickets and PRs Are Actually For',
    files: {
      light: 'what-tickets-and-prs-are-actually-for-light.png',
      dark: 'what-tickets-and-prs-are-actually-for-dark.png',
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
      // upload's basename on disk — matches work for both local disk and
      // Vercel Blob because Payload persists the filename as canonical).
      const { docs: existingMedia } = await payload.find({
        collection: 'media',
        where: { filename: { equals: filename } },
        limit: 1,
        depth: 0,
      })

      let mediaDoc
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
