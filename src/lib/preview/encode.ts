import sharp from 'sharp'

/**
 * 10-character luminance ramp from densest (lowest luminance) to sparsest
 * (highest luminance). Each greyscale byte (0–255) is bucketed by
 * `Math.floor(lum / 26)` → values 0..9 → index into this ramp.
 *
 * Index 0 is space (heavy black areas read as empty cells, which keeps
 * the dominant background color visible). Indices 1..9 progressively
 * brighten with characters of decreasing visual weight.
 */
export const ASCII_RAMP = ' .:-=+*#%@'

/** Cells across in the ASCII halftone grid. */
export const ASCII_COLS = 24
/** Cells down in the ASCII halftone grid. */
export const ASCII_ROWS = 12
/** Total ASCII chars: ASCII_COLS × ASCII_ROWS = 288. */
export const ASCII_LENGTH = ASCII_COLS * ASCII_ROWS

const LUM_BUCKET = Math.ceil(256 / ASCII_RAMP.length) // 26

/**
 * Generate a content-aware preview from an image buffer.
 *
 * Returns:
 *  - `color`: the image's dominant color as `#rrggbb` (~7 bytes), derived
 *    from a 1×1 average resize.
 *  - `ascii`: a 24×12 luminance halftone (288 chars row-major) drawn from
 *    {@link ASCII_RAMP}. Each cell maps a greyscale luminance byte 0..255
 *    to an index `Math.floor(lum / 26)` into the ramp.
 *
 * Both passes use `fit: 'cover'` to mirror the consumer container's
 * `object-fit: cover` (ThemeAwareHero) — so the preview matches the crop
 * the user actually sees.
 *
 * Throws on sharp errors. Callers are responsible for fail-soft handling.
 */
export async function generatePreview(buffer: Buffer): Promise<{ color: string; ascii: string }> {
  // 1×1 average → 3 RGB bytes → "#rrggbb"
  const colorBuf = await sharp(buffer)
    .resize(1, 1, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer()
  const color = `#${[colorBuf[0], colorBuf[1], colorBuf[2]]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`

  // 24×12 greyscale → 288 luminance bytes → ramp chars
  const lumBuf = await sharp(buffer)
    .resize(ASCII_COLS, ASCII_ROWS, { fit: 'cover' })
    .greyscale()
    .removeAlpha()
    .raw()
    .toBuffer()

  let ascii = ''
  for (let i = 0; i < ASCII_LENGTH; i++) {
    const lum = lumBuf[i] ?? 0
    const idx = Math.min(ASCII_RAMP.length - 1, Math.floor(lum / LUM_BUCKET))
    ascii += ASCII_RAMP[idx]
  }

  return { color, ascii }
}
