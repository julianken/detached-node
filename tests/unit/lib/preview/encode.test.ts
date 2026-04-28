import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { generatePreview, ASCII_RAMP } from '@/lib/preview/encode'

// Solid red 16×16 PNG buffer — gives a deterministic dominant color and
// uniform luminance, so we can assert exact properties of the output.
async function solidColorPng(r: number, g: number, b: number, width = 16, height = 16): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r, g, b },
    },
  })
    .png()
    .toBuffer()
}

describe('generatePreview', () => {
  it('returns { color, ascii } with a 7-char hex color and 288-char ASCII string', async () => {
    const png = await solidColorPng(120, 80, 200)
    const result = await generatePreview(png)

    expect(result).toHaveProperty('color')
    expect(result).toHaveProperty('ascii')
    expect(result.color).toMatch(/^#[0-9a-f]{6}$/)
    expect(result.ascii).toHaveLength(288)
  })

  it('produces a color matching the input (within sharp resize tolerance)', async () => {
    const png = await solidColorPng(255, 0, 0)
    const { color } = await generatePreview(png)
    // Solid red — first hex pair should dominate.
    expect(color).toMatch(/^#f[ef][0-9a-f]{4}$/)
  })

  it('uses only characters from the ramp (and produces 288 of them)', async () => {
    const png = await solidColorPng(127, 127, 127)
    const { ascii } = await generatePreview(png)

    expect(ascii).toHaveLength(288)
    // Every char must come from the ramp.
    const rampSet = new Set(ASCII_RAMP)
    for (const ch of ascii) {
      expect(rampSet.has(ch)).toBe(true)
    }
  })

  it('exports an ASCII_RAMP of exactly 10 chars (one per luminance bucket)', () => {
    // Mapping function buckets luminance into Math.floor(lum / 26),
    // which yields values 0..9 (since 255/26 == 9.8). The ramp must
    // therefore cover all 10 buckets.
    expect(ASCII_RAMP).toHaveLength(10)
  })

  it('encodes a black image as the first ramp char (densest, lowest luminance)', async () => {
    const png = await solidColorPng(0, 0, 0)
    const { ascii } = await generatePreview(png)
    // Bucket 0 → first ramp char (space). Every cell should match.
    const expected = ASCII_RAMP[0].repeat(288)
    expect(ascii).toBe(expected)
  })

  it('encodes a white image as the last ramp char (sparsest, highest luminance)', async () => {
    const png = await solidColorPng(255, 255, 255)
    const { ascii } = await generatePreview(png)
    const expected = ASCII_RAMP[9].repeat(288)
    expect(ascii).toBe(expected)
  })

  it('throws on a buffer that sharp cannot decode (caller must fail-soft)', async () => {
    const bogus = Buffer.from('not-a-real-image-buffer')
    await expect(generatePreview(bogus)).rejects.toThrow()
  })
})
