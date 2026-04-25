/**
 * Backfill LQIP (Low-Quality Image Placeholder) for existing Media docs.
 *
 * INTENDED FOR ONE-SHOT POST-DEPLOY INVOCATION against the Vercel Blob store.
 * DO NOT run this in CI or as part of the deploy pipeline.
 *
 * Usage:
 *   npx tsx scripts/backfill-lqip.ts            # live run
 *   npx tsx scripts/backfill-lqip.ts --dry-run  # preview without writes
 *
 * Prerequisites:
 *   - DATABASE_URL and PAYLOAD_SECRET in environment (e.g. via .env.local)
 *   - Network access to Vercel Blob URLs (doc.url)
 *
 * Review the --dry-run output before the live run.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { generateLqipDataUrl } from '../src/lib/lqip/encode'

const DRY_RUN = process.argv.includes('--dry-run')
const SLEEP_MS = 200

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log(`[backfill-lqip] Starting${DRY_RUN ? ' (DRY RUN — no writes)' : ''}…`)

  const payload = await getPayload({ config })

  const all = await payload.find({
    collection: 'media',
    pagination: false,
    where: {
      lqip: { exists: false },
    },
  })

  const pending = all.docs
  const total = pending.length

  console.log(`[backfill-lqip] ${total} doc(s) without LQIP (of ${all.totalDocs} total media matched)`)

  let succeeded = 0
  let failed = 0

  for (let i = 0; i < pending.length; i++) {
    const doc = pending[i]
    const label = `[${i + 1}/${total}] id=${doc.id} filename=${doc.filename ?? '(none)'}`

    if (!doc.url) {
      console.warn(`${label} — SKIP: no url`)
      failed++
      continue
    }

    if (DRY_RUN) {
      console.log(`${label} — would generate LQIP from ${doc.url}`)
      continue
    }

    try {
      const response = await fetch(doc.url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${doc.url}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      const lqip = await generateLqipDataUrl(Buffer.from(arrayBuffer))

      await payload.update({
        collection: 'media',
        id: doc.id,
        data: { lqip },
      })

      console.log(`${label} — generated (${lqip.length} chars)`)
      succeeded++
    } catch (err) {
      console.error(
        `${label} — FAILED: ${err instanceof Error ? err.message : String(err)}`
      )
      failed++
    }

    // Respect Vercel Blob rate limits between iterations.
    if (i < pending.length - 1) {
      await sleep(SLEEP_MS)
    }
  }

  if (!DRY_RUN) {
    console.log(
      `[backfill-lqip] Done. succeeded=${succeeded} failed=${failed} total=${total}`
    )
  } else {
    console.log(`[backfill-lqip] Dry run complete. ${total} doc(s) would be processed.`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('[backfill-lqip] Fatal error:', err)
  process.exit(1)
})
