import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const paths = (slug?: string | null) => {
  const out = ['/', '/posts']
  if (slug) out.push(`/posts/${slug}`)
  return out
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  const targets = new Set<string>()
  for (const p of paths(doc?.slug)) targets.add(p)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    targets.add(`/posts/${previousDoc.slug}`)
  }
  for (const p of targets) revalidatePath(p)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  for (const p of paths(doc?.slug)) revalidatePath(p)
  return doc
}
