import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { notifyIndexNow } from './indexnow'

const paths = (slug?: string | null) => {
  const out = ['/', '/posts', '/sitemap.xml', '/feed.xml']
  if (slug) out.push(`/posts/${slug}`)
  return out
}

// Safe revalidate: no-op when invoked outside a Next.js request context
// (e.g. seed scripts, `payload migrate`, Local API CLI). In those contexts
// `revalidatePath` throws "Invariant: static generation store missing" — we
// have no ISR cache to invalidate there, so silently skipping is correct.
const safeRevalidate = (path: string) => {
  try {
    revalidatePath(path)
  } catch {
    // outside request scope; nothing to invalidate
  }
}

// Read NEXT_PUBLIC_SERVER_URL directly (not via `site-config`) so the
// shared env assertion in that module doesn't fire at import-time on
// this hook's import chain. `payload.config.ts` owns the canonical
// NEXT_PUBLIC_SERVER_URL preflight; this hook fails soft if the var
// is somehow missing at hook-fire time (returns no URLs to notify).
// See tests/unit/lib/payload-config-env.test.ts for the contract this
// preserves.
const getSiteOrigin = (): string | null => {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL
  if (!raw) return null
  return raw.replace(/\/$/, '')
}

const postUrls = (slugs: Array<string | null | undefined>): string[] => {
  const base = getSiteOrigin()
  if (!base) return []
  const out: string[] = []
  for (const slug of slugs) {
    if (typeof slug === 'string' && slug.length > 0) {
      out.push(`${base}/posts/${slug}`)
    }
  }
  return out
}

// Fire-and-forget IndexNow notify. `notifyIndexNow` already swallows its
// own errors, but `.catch()` here is belt-and-braces — the Payload save
// must never see this rejection. We intentionally do NOT `await` because
// the content save should not be gated on a third-party HTTP round-trip.
const notify = (urls: string[]): void => {
  if (urls.length === 0) return
  void notifyIndexNow(urls).catch(() => {
    /* notifyIndexNow logs internally; nothing to do here */
  })
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  const targets = new Set<string>()
  for (const p of paths(doc?.slug)) targets.add(p)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    targets.add(`/posts/${previousDoc.slug}`)
  }
  for (const p of targets) safeRevalidate(p)

  // Notify IndexNow with the post URL(s). Include the previous slug on
  // rename so engines learn the old URL is gone (they'll hit a 404 and
  // drop it from their index on the next crawl).
  notify(postUrls([doc?.slug, previousDoc?.slug !== doc?.slug ? previousDoc?.slug : null]))

  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  for (const p of paths(doc?.slug)) safeRevalidate(p)

  // Notify IndexNow on delete so engines re-crawl the URL, hit the 404,
  // and drop it from their index. IndexNow has no explicit deletion
  // signal — submitting a since-deleted URL is the documented pattern.
  notify(postUrls([doc?.slug]))

  return doc
}
