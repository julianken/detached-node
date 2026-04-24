import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const paths = (slug?: string | null) => {
  const out = ['/', '/posts']
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

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  const targets = new Set<string>()
  for (const p of paths(doc?.slug)) targets.add(p)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    targets.add(`/posts/${previousDoc.slug}`)
  }
  for (const p of targets) safeRevalidate(p)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  for (const p of paths(doc?.slug)) safeRevalidate(p)
  return doc
}
