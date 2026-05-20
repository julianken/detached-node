/**
 * One-shot bulk submit every URL in the production sitemap to IndexNow.
 *
 * Use case:
 *   - First-time push after enabling IndexNow on production
 *   - Re-push after a content migration that touched a lot of slugs
 *   - Re-push after a key rotation
 *
 * NOT to be run from CI or the deploy pipeline. Run manually from a
 * developer workstation once the production key file is verified live
 * at `https://detached-node.dev/<INDEXNOW_KEY>.txt`.
 *
 * Usage (from repo root):
 *   pnpm tsx scripts/indexnow-submit-all.ts            # live submit
 *   pnpm tsx scripts/indexnow-submit-all.ts --dry-run  # parse + log, no POST
 *
 * Behaviour:
 *   - Fetches `<siteUrl>/sitemap.xml` (defaults to https://detached-node.dev).
 *   - Parses out every `<loc>...</loc>` URL.
 *   - Submits the whole batch in one POST via `notifyIndexNow`.
 *   - Prints the parsed URL count and the resulting log line; failures
 *     are logged but the script always exits 0 (matches helper semantics).
 *
 * Override target site by setting NEXT_PUBLIC_SERVER_URL in the shell or
 * `.env.local`. The helper itself derives `host` and `keyLocation` from
 * that env var, so a local-pointed run will (correctly) refuse to be
 * accepted by IndexNow for localhost.
 */

import 'dotenv/config'

const DRY_RUN = process.argv.includes('--dry-run')

function extractLocs(xml: string): string[] {
  const out: string[] = []
  // Tolerant of attributes, whitespace, and CDATA. Good enough for our
  // Next.js-generated sitemap which is plain `<loc>https://...</loc>`.
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(xml)) !== null) {
    out.push(match[1])
  }
  return out
}

async function main(): Promise<void> {
  // Lazy-import the helper so this script works without the full Next.js
  // env surface beyond what `notifyIndexNow` needs.
  const { notifyIndexNow, INDEXNOW_KEY } = await import('../src/lib/indexnow')
  const { siteUrl } = await import('../src/lib/site-config')

  const base = siteUrl.replace(/\/$/, '')
  const sitemapUrl = `${base}/sitemap.xml`

  console.log(`[indexnow-submit-all] Fetching ${sitemapUrl}${DRY_RUN ? ' (DRY RUN)' : ''}...`)

  const res = await fetch(sitemapUrl)
  if (!res.ok) {
    throw new Error(`Sitemap fetch failed: ${res.status} ${res.statusText}`)
  }
  const xml = await res.text()
  const urls = extractLocs(xml)

  console.log(`[indexnow-submit-all] Parsed ${urls.length} URL(s) from sitemap`)
  console.log(`[indexnow-submit-all] Using key: ${INDEXNOW_KEY.slice(0, 8)}... (host: ${new URL(siteUrl).host})`)

  if (urls.length === 0) {
    console.warn('[indexnow-submit-all] No URLs found in sitemap; nothing to submit.')
    return
  }

  if (DRY_RUN) {
    console.log('[indexnow-submit-all] DRY RUN -- first 5 URLs:')
    for (const u of urls.slice(0, 5)) console.log(`  ${u}`)
    if (urls.length > 5) console.log(`  ... and ${urls.length - 5} more`)
    return
  }

  await notifyIndexNow(urls)
  console.log(`[indexnow-submit-all] Submitted ${urls.length} URL(s) to IndexNow.`)
  console.log('[indexnow-submit-all] Verify in Bing Webmaster Tools -> Crawl Information within ~24h.')
}

main().catch((err) => {
  console.error('[indexnow-submit-all] Fatal error:', err)
  process.exit(1)
})
