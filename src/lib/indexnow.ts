/**
 * IndexNow push notifier.
 *
 * IndexNow (https://www.indexnow.org) is a search-engine push protocol started
 * by Microsoft Bing and Yandex (since joined by Naver, Seznam, Mojeek). A
 * single HTTP POST to the fan-out endpoint notifies every participating
 * engine that one or more URLs have changed, so they re-crawl quickly
 * instead of waiting for their next scheduled crawl. Bing typically picks up
 * notified URLs within hours.
 *
 * Google does NOT participate. Their Indexing API is restricted to
 * `JobPosting` and `BroadcastEvent` structured data; for general content
 * updates Google still relies on its own crawl scheduling and we can only
 * nudge it via Search Console URL Inspection.
 *
 * Protocol details that matter here:
 *   - Endpoint: `https://api.indexnow.org/IndexNow` (the fan-out endpoint —
 *     it forwards to every participating engine in one POST).
 *   - Body: JSON with `host`, `key`, `keyLocation`, `urlList`.
 *   - Key verification: engines fetch `keyLocation` (a plaintext file on our
 *     own origin) and confirm its body equals `key`. The key is intentionally
 *     public — that's how key ownership of the host is proven.
 *   - Submitted URLs must all be on `host`.
 *
 * This helper is fire-and-forget. Network failures, non-2xx responses, or
 * malformed input are logged as warnings via `logWarning` and swallowed —
 * an IndexNow outage must never break a Payload content save.
 */

import { logWarning } from './logging'
import { ErrorIds } from './error-ids'

/**
 * The IndexNow key for this site.
 *
 * This value is intentionally duplicated between this constant and the file
 * at `public/<INDEXNOW_KEY>.txt`. Both must agree: the constant is what
 * we send in the POST body, the file is what participating engines fetch
 * to verify the key. Rotating the key requires updating BOTH places (and
 * waiting for the new file to be live on production before submitting).
 */
export const INDEXNOW_KEY =
  '2a37eac9c8960b371ae360240090aa7f10b8969b77f6f9b53053a9adcae6d303'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'

/**
 * Read NEXT_PUBLIC_SERVER_URL directly (not via `site-config`) so the
 * shared env assertion in that module doesn't fire when this helper is
 * imported through the Payload collection → revalidate-hook chain.
 * `payload.config.ts` owns the canonical preflight; this helper fails
 * soft (no notify) if the var is somehow missing at call time.
 */
function readSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL
  return raw && raw.length > 0 ? raw : null
}

/**
 * Extract the bare host (e.g. `detached-node.dev`) from `siteUrl`. IndexNow
 * requires the `host` field to be just the host portion, not the full URL.
 */
function hostFromSiteUrl(siteUrl: string): string {
  try {
    return new URL(siteUrl).host
  } catch {
    // siteUrl is asserted as a required env var elsewhere; if it's ever
    // malformed at runtime we still want notify to fail soft, not throw.
    return siteUrl
  }
}

/**
 * Notify IndexNow-participating engines that the given URLs have changed.
 *
 * All URLs must be absolute and on the configured `siteUrl` host. The call
 * is non-blocking on errors: any failure is logged via `logWarning` with
 * `ErrorIds.INDEXNOW_NOTIFY_FAILED` and the returned promise still
 * resolves. Callers (Payload `afterChange` / `afterDelete` hooks) can
 * `await` this without risk to the content save.
 */
export async function notifyIndexNow(urls: string[]): Promise<void> {
  if (!Array.isArray(urls) || urls.length === 0) return

  const siteUrl = readSiteUrl()
  if (!siteUrl) {
    // No origin configured — silently skip. This can happen in tooling
    // contexts that import this module without the Next.js env surface
    // (e.g. some unit-test boots before mocks are applied).
    return
  }

  const host = hostFromSiteUrl(siteUrl)
  const keyLocation = `${siteUrl.replace(/\/$/, '')}/${INDEXNOW_KEY}.txt`

  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: urls,
  }

  try {
    // 5s timeout guards against a hung TCP connection to api.indexnow.org
    // pinning a socket + event-loop handler + retained context indefinitely.
    // Node's native fetch has no default timeout; without `AbortSignal.timeout`
    // a stalled connection never settles and the `.catch()` in the calling
    // hook can't help (the promise simply never resolves). 5s is well above
    // p99 latency for the fan-out endpoint, and on abort the `AbortError`
    // is caught below and logged via the same fail-soft path as any other
    // network error.
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      logWarning(
        `IndexNow notify returned non-2xx (${res.status})`,
        { status: res.status, statusText: res.statusText, urls, host },
        ErrorIds.INDEXNOW_NOTIFY_FAILED,
      )
    }
  } catch (err) {
    logWarning(
      'IndexNow notify request threw',
      {
        error: err instanceof Error ? err.message : String(err),
        urls,
        host,
      },
      ErrorIds.INDEXNOW_NOTIFY_FAILED,
    )
  }
}
