import sharp from 'sharp'

/**
 * Generate a low-quality image placeholder (LQIP) data URL from a buffer.
 *
 * Resizes to 24×12 px, encodes as AVIF at quality 30, and returns a
 * base64 data URL suitable for next/image's blurDataURL prop.
 *
 * Throws on error — callers are responsible for fail-soft handling.
 */
export async function generateLqipDataUrl(buffer: Buffer): Promise<string> {
  const avif = await sharp(buffer)
    .resize(24, 12, { fit: 'cover' })
    .avif({ quality: 30 })
    .toBuffer()

  return `data:image/avif;base64,${avif.toString('base64')}`
}
