import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateLqipHook } from '@/lib/hooks/generate-lqip'
import type { CollectionBeforeChangeHook } from 'payload'

// ---------------------------------------------------------------------------
// Minimal valid 2×2 red PNG buffer (real, not mocked — so sharp can decode it)
// Generated via: sharp({ create: { width: 2, height: 2, channels: 3, background: { r: 255, g: 0, b: 0 } } }).png().toBuffer()
// ---------------------------------------------------------------------------
const MINIMAL_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d4948445200000002000000020802000000fdd49a730000000970485973000003e8000003e801b57b526b0000001349444154789c63f8cfc0f09f018cff333000001fee03fd351b00330000000049454e44ae426082',
  'hex'
)

// ---------------------------------------------------------------------------
// Helper: build a minimal fake Payload hook args object
// ---------------------------------------------------------------------------
type HookArgs = Parameters<CollectionBeforeChangeHook>[0]

function makeArgs(overrides: Partial<HookArgs> & { file?: { data?: Buffer | null; mimetype?: string } | null } = {}): HookArgs {
  const { file, ...rest } = overrides
  const warnSpy = vi.fn()
  return {
    data: {},
    req: {
      file: file === undefined
        ? { data: MINIMAL_PNG, mimetype: 'image/png', name: 'test.png', size: MINIMAL_PNG.length }
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateLqipHook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates a non-empty data URL prefixed data:image/avif;base64, for a valid PNG buffer', async () => {
    const args = makeArgs()
    const result = await generateLqipHook(args)
    expect(result).toHaveProperty('lqip')
    expect(typeof result.lqip).toBe('string')
    expect(result.lqip).toMatch(/^data:image\/avif;base64,/)
    expect((result.lqip as string).length).toBeGreaterThan(30)
  })

  it('returns data UNCHANGED when operation === "update" (skip on update)', async () => {
    const args = makeArgs({ operation: 'update' as HookArgs['operation'] })
    const result = await generateLqipHook(args)
    expect(result).not.toHaveProperty('lqip')
    // warn should NOT have been called — this is a deliberate skip, not an error
    expect(getWarnSpy(args)).not.toHaveBeenCalled()
  })

  it('returns data UNCHANGED + logs warning when buffer is missing (no req.file)', async () => {
    const args = makeArgs({ file: null })
    const result = await generateLqipHook(args)
    expect(result).not.toHaveProperty('lqip')
    expect(getWarnSpy(args)).toHaveBeenCalledOnce()
    expect(getWarnSpy(args).mock.calls[0][0]).toMatch(/no file buffer/i)
  })

  it('returns data UNCHANGED + logs warning when buffer is missing (req.file.data is null)', async () => {
    const args = makeArgs({ file: { data: null, mimetype: 'image/png' } })
    const result = await generateLqipHook(args)
    expect(result).not.toHaveProperty('lqip')
    expect(getWarnSpy(args)).toHaveBeenCalledOnce()
  })

  it('returns data UNCHANGED + logs warning when buffer is malformed (cannot be decoded by sharp)', async () => {
    const args = makeArgs({ file: { data: Buffer.from('not-a-real-image'), mimetype: 'image/png' } })
    const result = await generateLqipHook(args)
    expect(result).not.toHaveProperty('lqip')
    expect(getWarnSpy(args)).toHaveBeenCalledOnce()
    expect(getWarnSpy(args).mock.calls[0][0]).toMatch(/failed to generate/i)
  })

  it('returns data UNCHANGED + logs warning when mimeType is not image/*', async () => {
    const args = makeArgs({ file: { data: MINIMAL_PNG, mimetype: 'application/pdf' } })
    const result = await generateLqipHook(args)
    expect(result).not.toHaveProperty('lqip')
    expect(getWarnSpy(args)).toHaveBeenCalledOnce()
    expect(getWarnSpy(args).mock.calls[0][0]).toMatch(/non-image mimetype/i)
  })
})
