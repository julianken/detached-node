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
 *   - update operations: Payload's `data` partial only contains fields the
 *     editor actually touched in this save, so presence of the key in
 *     `data` is the correct test for "editor set this field explicitly".
 *     - If `dedicatedDateModified` IS in the partial → respect the editor
 *       value, return data unchanged.
 *     - Else if `body`, `title`, or `summary` is in the partial (meaningful
 *       content changed) → stamp `data.dedicatedDateModified` with the
 *       current ISO timestamp.
 *     - Else → no-op (non-content field change like `featured`).
 *
 * The hook is non-blocking: it never throws and never rejects a save.
 */
const MEANINGFUL_FIELDS = ['body', 'title', 'summary'] as const

export const beforeChangeDedicatedDateModified: CollectionBeforeChangeHook = ({
  data,
  operation,
}) => {
  if (operation === 'create') {
    return data
  }

  // Payload's `data` on update is a partial containing only the fields the
  // editor changed. Presence of the key is the correct signal that the
  // editor set the field explicitly — a value-vs-originalDoc comparison
  // would treat any unchanged save as an editor override.
  const editorSetField = data != null && 'dedicatedDateModified' in data

  if (editorSetField) {
    return data
  }

  const meaningfulContentChanged =
    data != null && MEANINGFUL_FIELDS.some((field) => field in data)

  if (meaningfulContentChanged) {
    return {
      ...data,
      dedicatedDateModified: new Date().toISOString(),
    }
  }

  return data
}
