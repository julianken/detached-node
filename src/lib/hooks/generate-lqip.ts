import type { CollectionBeforeChangeHook } from 'payload'
import { generateLqipDataUrl } from '@/lib/lqip/encode'

/**
 * Payload beforeChange hook for the Media collection.
 *
 * On create-only operations: reads the uploaded file buffer, generates a
 * 24×12 AVIF LQIP data URL, and attaches it as `lqip` on the document.
 *
 * Fail-soft: any error (missing buffer, non-image, sharp failure) logs a
 * warning and returns data UNCHANGED. Never throws or blocks the upload.
 */
export const generateLqipHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only run on create — skip metadata-only updates.
  if (operation !== 'create') {
    return data
  }

  // Guard: need a file buffer.
  const file = req.file
  if (!file?.data) {
    req.payload.logger.warn('[generate-lqip] No file buffer on request — skipping LQIP generation')
    return data
  }

  // Guard: must be an image mimeType.
  const mimeType = file.mimetype ?? data?.mimeType ?? ''
  if (!mimeType.startsWith('image/')) {
    req.payload.logger.warn(
      `[generate-lqip] Non-image mimeType "${mimeType}" — skipping LQIP generation`
    )
    return data
  }

  try {
    const lqip = await generateLqipDataUrl(Buffer.from(file.data))
    return { ...data, lqip }
  } catch (err) {
    req.payload.logger.warn(
      `[generate-lqip] Failed to generate LQIP: ${err instanceof Error ? err.message : String(err)}`
    )
    return data
  }
}
