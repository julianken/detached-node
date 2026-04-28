/**
 * Backfill content-aware previews (preview.color + preview.ascii) for
 * existing Media docs.
 *
 * INTENDED FOR ONE-SHOT POST-DEPLOY INVOCATION against a development /
 * test database, OR against production with the explicit env-var override.
 * DO NOT run this in CI or as part of the deploy pipeline.
 *
 * Usage:
 *   npx tsx scripts/backfill-previews.ts            # live run (asserts non-prod)
 *   npx tsx scripts/backfill-previews.ts --dry-run  # preview without writes
 *
 * Production override (mirrors scripts/seed-test-db.ts:16 convention):
 *   I_KNOW_THIS_IS_NOT_PROD=1 npx tsx scripts/backfill-previews.ts
 *
 * Idempotency: skips docs whose `preview.ascii` is already 288 chars long.
 *
 * Re-entrancy: passes `context.skipPreviewHook = true` on every update so
 * the hook does not re-fire and refetch / regenerate the same buffer.
 *
 * Prerequisites:
 *   - DATABASE_URL and PAYLOAD_SECRET in environment (e.g. via .env.local)
 *   - Network access to the Media URLs (doc.url)
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { generatePreview, ASCII_LENGTH } from '../src/lib/preview/encode'

const DRY_RUN = process.argv.includes('--dry-run')
const SLEEP_MS = 200

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assertNonProductionDatabase(): void {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL is not set')

  let host: string
  try {
    host = new URL(raw).hostname
  } catch {
    throw new Error('DATABASE_URL is not a valid URL')
  }

  const allowed =
    /^(localhost|127\.0\.0\.1|::1)$/.test(host) || /(^|[-.])test([-.]|$)/.test(host)
  if (!allowed) {
    throw new Error(
      `backfill-previews refuses to run against host ${host}. ` +
        `This script writes to every Media doc that lacks a populated preview. ` +
        `Point DATABASE_URL at a local/test-tier database (host must be ` +
        `localhost/127.0.0.1/::1 or contain a "test" segment), or set ` +
        `I_KNOW_THIS_IS_NOT_PROD=1 to override (used for the one-shot ` +
        `post-deploy run against production).`,
    )
  }
}

async function main(): Promise<void> {
  if (process.env.I_KNOW_THIS_IS_NOT_PROD !== '1') {
    assertNonProductionDatabase()
  }

  console.log(`[backfill-previews] Starting${DRY_RUN ? ' (DRY RUN — no writes)' : ''}…`)

  const payload = await getPayload({ config })

  // Fetch all media docs; filter client-side because Payload's `where` operators
  // for nested group fields with text comparisons can vary by adapter, and we
  // want a length-based idempotency check that's universally consistent.
  const all = await payload.find({
    collection: 'media',
    pagination: false,
  })

  const pending = all.docs.filter((doc) => {
    const ascii = (doc as { preview?: { ascii?: string | null } }).preview?.ascii
    return !ascii || ascii.length !== ASCII_LENGTH
  })
  const total = pending.length

  console.log(
    `[backfill-previews] ${total} doc(s) need backfill (of ${all.totalDocs} total media)`,
  )

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
      console.log(`${label} — would generate preview from ${doc.url}`)
      continue
    }

    try {
      const response = await fetch(doc.url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${doc.url}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      const preview = await generatePreview(Buffer.from(arrayBuffer))

      await payload.update({
        collection: 'media',
        id: doc.id,
        data: { preview },
        // Skip the beforeChange hook — we already have the preview; running
        // the hook would just re-decode the same buffer (which we don't have
        // here anyway) and warn about the missing req.file.
        context: { skipPreviewHook: true },
      })

      console.log(`${label} — generated color=${preview.color} ascii.len=${preview.ascii.length}`)
      succeeded++
    } catch (err) {
      console.error(
        `${label} — FAILED: ${err instanceof Error ? err.message : String(err)}`,
      )
      failed++
    }

    if (i < pending.length - 1) {
      await sleep(SLEEP_MS)
    }
  }

  if (!DRY_RUN) {
    console.log(
      `[backfill-previews] Done. succeeded=${succeeded} failed=${failed} total=${total}`,
    )
  } else {
    console.log(
      `[backfill-previews] Dry run complete. ${total} doc(s) would be processed.`,
    )
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('[backfill-previews] Fatal error:', err)
  process.exit(1)
})
