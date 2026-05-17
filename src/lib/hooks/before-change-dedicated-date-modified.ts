import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Payload beforeChange hook for the Posts collection.
 *
 * Maintains `dedicatedDateModified` as a deliberate signal of meaningful
 * content changes — independent of Payload's auto-updated `updatedAt`,
 * which fires on every admin save (toggling featured flag, swapping a tag,
 * etc.). Used by `generateBlogPostingSchema` as the canonical
 * `BlogPosting.dateModified` value.
 *
 * Semantics:
 *   - create operations: pass through unchanged (the post is new; an editor
 *     can fill `dedicatedDateModified` manually or leave it null).
 *   - update operations: when `body`, `title`, or `summary` actually changed
 *     (deep-equal compare via JSON serialization), and the editor has NOT
 *     manually set `dedicatedDateModified` in this save, stamp the field
 *     with the current ISO timestamp. Editor-supplied values are preserved.
 *
 * The hook is non-blocking: it never throws and never rejects a save.
 */
const MEANINGFUL_FIELDS = ['body', 'title', 'summary'] as const

export const beforeChangeDedicatedDateModified: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation === 'create') {
    return data
  }

  // If the editor manually changed dedicatedDateModified in this save,
  // respect that value — do not overwrite.
  const editorSetField =
    data?.dedicatedDateModified !== originalDoc?.dedicatedDateModified

  if (editorSetField) {
    return data
  }

  const changed = MEANINGFUL_FIELDS.some((field) => {
    return JSON.stringify(data?.[field]) !== JSON.stringify(originalDoc?.[field])
  })

  if (changed) {
    return {
      ...data,
      dedicatedDateModified: new Date().toISOString(),
    }
  }

  return data
}
