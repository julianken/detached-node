import type { CollectionBeforeChangeHook } from 'payload'
import { generatePreview } from '@/lib/preview/encode'

/**
 * Payload beforeChange hook for the Media collection.
 *
 * Computes a content-aware preview from the uploaded file buffer:
 *  - `preview.color` — dominant `#rrggbb` (~7 bytes)
 *  - `preview.ascii` — 24×12 luminance halftone (288 chars)
 *
 * Runs on:
 *  - `create` (always, when a file buffer is present)
 *  - `update` when a file buffer is present (admin re-upload). Metadata-only
 *    edits (no req.file) are skipped silently.
 *
 * Backfill scripts MUST set `req.context.skipPreviewHook = true` on their
 * payload.update() calls to avoid an infinite hook → backfill loop.
 *
 * Fail-soft: any decode error logs a warning and returns data UNCHANGED.
 * Never throws or blocks the upload.
 */
export const generatePreviewHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  context,
}) => {
  // Backfill / re-entrancy guard.
  if (context && (context as { skipPreviewHook?: boolean }).skipPreviewHook) {
    return data
  }

  const file = req.file

  // Metadata-only update with no file buffer — quietly skip.
  if (operation === 'update' && !file?.data) {
    return data
  }

  // Need a file buffer to do anything useful.
  if (!file?.data) {
    req.payload.logger.warn(
      '[generate-preview] No file buffer on request — skipping preview generation',
    )
    return data
  }

  const mimeType = file.mimetype ?? data?.mimeType ?? ''
  if (!mimeType.startsWith('image/')) {
    req.payload.logger.warn(
      `[generate-preview] Non-image mimeType "${mimeType}" — skipping preview generation`,
    )
    return data
  }

  try {
    const preview = await generatePreview(Buffer.from(file.data))
    return { ...data, preview }
  } catch (err) {
    req.payload.logger.warn(
      `[generate-preview] Failed to generate preview: ${
        err instanceof Error ? err.message : String(err)
      }`,
    )
    return data
  }
}
