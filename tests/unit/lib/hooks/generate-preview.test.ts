import { describe, it, expect, vi, beforeEach } from 'vitest'
import sharp from 'sharp'
import { generatePreviewHook } from '@/lib/hooks/generate-preview'
import type { CollectionBeforeChangeHook } from 'payload'
import { ASCII_LENGTH } from '@/lib/preview/encode'

// Real 16×16 red PNG so sharp can decode it during the test.
async function realPng(): Promise<Buffer> {
  return sharp({
    create: {
      width: 16,
      height: 16,
      channels: 3,
      background: { r: 200, g: 100, b: 50 },
    },
  })
    .png()
    .toBuffer()
}

let pngBuffer: Buffer

type HookArgs = Parameters<CollectionBeforeChangeHook>[0]

function makeArgs(
  overrides: Partial<HookArgs> & {
    file?: { data?: Buffer | null; mimetype?: string } | null
  } = {},
): HookArgs {
  const { file, ...rest } = overrides
  const warnSpy = vi.fn()
  return {
    data: {},
    req: {
      file:
        file === undefined
          ? { data: pngBuffer, mimetype: 'image/png', name: 'test.png', size: pngBuffer.length }
          : file,
      payload: {
        logger: { warn: warnSpy },
      },
    } as unknown as HookArgs['req'],
    operation: 'create',
    collection: {} as HookArgs['collection'],
    context: {},
    ...rest,
  } as unknown as HookArgs
}

function getWarnSpy(args: HookArgs): ReturnType<typeof vi.fn> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (args.req.payload.logger as any).warn
}

beforeEach(async () => {
  vi.clearAllMocks()
  pngBuffer = await realPng()
})

describe('generatePreviewHook', () => {
  it('attaches a `preview` group with valid color + ascii on create with a file buffer', async () => {
    const args = makeArgs()
    const result = await generatePreviewHook(args)

    expect(result).toHaveProperty('preview')
    const preview = (result as { preview: { color: string; ascii: string } }).preview
    expect(preview.color).toMatch(/^#[0-9a-f]{6}$/)
    expect(preview.ascii).toHaveLength(ASCII_LENGTH)
  })

  it('regenerates the preview on update when a file buffer is present (e.g. admin re-upload)', async () => {
    const args = makeArgs({ operation: 'update' as HookArgs['operation'] })
    const result = await generatePreviewHook(args)
    expect(result).toHaveProperty('preview')
  })

  it('skips on update without a file (metadata-only edit) — returns data unchanged, no warning', async () => {
    const args = makeArgs({ file: null, operation: 'update' as HookArgs['operation'] })
    const result = await generatePreviewHook(args)
    expect(result).not.toHaveProperty('preview')
    expect(getWarnSpy(args)).not.toHaveBeenCalled()
  })

  it('returns data unchanged + warns when file.data is null', async () => {
    const args = makeArgs({ file: { data: null, mimetype: 'image/png' } })
    const result = await generatePreviewHook(args)
    expect(result).not.toHaveProperty('preview')
    expect(getWarnSpy(args)).toHaveBeenCalledOnce()
  })

  it('returns data unchanged + warns when mimeType is non-image (e.g. pdf)', async () => {
    const args = makeArgs({ file: { data: pngBuffer, mimetype: 'application/pdf' } })
    const result = await generatePreviewHook(args)
    expect(result).not.toHaveProperty('preview')
    expect(getWarnSpy(args)).toHaveBeenCalledOnce()
    expect(getWarnSpy(args).mock.calls[0][0]).toMatch(/non-image mimetype/i)
  })

  it('returns data unchanged + warns when buffer cannot be decoded by sharp', async () => {
    const args = makeArgs({
      file: { data: Buffer.from('not-an-image'), mimetype: 'image/png' },
    })
    const result = await generatePreviewHook(args)
    expect(result).not.toHaveProperty('preview')
    expect(getWarnSpy(args)).toHaveBeenCalledOnce()
    expect(getWarnSpy(args).mock.calls[0][0]).toMatch(/failed to generate/i)
  })

  it('respects the skipPreviewHook context flag (skip silently — used by backfill)', async () => {
    const args = makeArgs({ context: { skipPreviewHook: true } as HookArgs['context'] })
    const result = await generatePreviewHook(args)
    expect(result).not.toHaveProperty('preview')
    expect(getWarnSpy(args)).not.toHaveBeenCalled()
  })
})
