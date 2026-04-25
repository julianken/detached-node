import { describe, it, expect } from 'vitest'
import { capDiagramWidth, uncapDiagramWidth } from '@/components/MermaidDiagram'

// ---------------------------------------------------------------------------
// Realistic mermaid SVG fixture — representative of what mermaid.render()
// emits for a sequence diagram. Constructed from the known output shape:
//   - Scoped id (mermaid-<uuid>)
//   - Embedded <style> block scoped via #<id>
//   - viewBox with minX/minY plus width/height
//   - Inline style attribute carrying max-width on the root <svg>
// ---------------------------------------------------------------------------
const FIXTURE_SVG = `<svg aria-roledescription="sequence" role="graphics-document document" viewBox="-50 -10 1230 512" style="max-width: 1230px;" id="mermaid-abc123" xmlns="http://www.w3.org/2000/svg" width="100%" xmlns:xlink="http://www.w3.org/1999/xlink">
  <style>#mermaid-abc123 { font-family: sans-serif; font-size: 16px; }
#mermaid-abc123 .actor { fill: #ffffff; stroke: #999; }
#mermaid-abc123 .sequenceNumber { fill: white; }</style>
  <g>
    <rect x="-50" y="-10" width="1230" height="512" fill="transparent"/>
    <text x="565" y="30" class="actor">Alice</text>
    <text x="665" y="30" class="actor">Bob</text>
    <line x1="565" y1="55" x2="665" y2="55" stroke="#333" stroke-width="1"/>
  </g>
</svg>`

describe('capDiagramWidth', () => {
  it('caps max-width to viewBox width × TARGET_SCALE (0.625), rounded', () => {
    // viewBox width = 1230 → 1230 × 0.625 = 768.75 → Math.round → 769
    const result = capDiagramWidth(
      '<svg viewBox="0 0 1230 512" style="max-width: 1230px;">content</svg>',
    )
    expect(result).toContain('max-width: 769px')
  })

  it('leaves the viewBox attribute unchanged', () => {
    const input = '<svg viewBox="0 0 1230 512" style="max-width: 1230px;">content</svg>'
    const result = capDiagramWidth(input)
    expect(result).toContain('viewBox="0 0 1230 512"')
  })

  it('returns input unchanged when there is no matching viewBox', () => {
    const input = '<svg style="max-width: 800px;">no viewbox</svg>'
    expect(capDiagramWidth(input)).toBe(input)
  })

  it('handles floating-point viewBox dimensions (rounds correctly)', () => {
    // viewBox width = 1230.5 → 1230.5 × 0.625 = 769.0625 → Math.round → 769
    const result = capDiagramWidth(
      '<svg viewBox="-50 -10 1230.5 1426" style="max-width: 1230.5px;">content</svg>',
    )
    expect(result).toContain('max-width: 769px')
  })
})

describe('uncapDiagramWidth', () => {
  it('strips max-width while preserving other style properties', () => {
    const input = '<svg style="background: #fff; max-width: 769px; opacity: 0.5;">x</svg>'
    const result = uncapDiagramWidth(input)
    expect(result).not.toMatch(/max-width/)
    expect(result).toContain('background: #fff;')
    expect(result).toContain('opacity: 0.5;')
  })

  it('returns input unchanged when there is no max-width in the style', () => {
    const input = '<svg style="background: #fff;">x</svg>'
    expect(uncapDiagramWidth(input)).toBe(input)
  })
})

describe('capDiagramWidth + uncapDiagramWidth — guard test with realistic fixture', () => {
  it('round-trips without mutating viewBox, and cap shrinks max-width below viewBox width', () => {
    // The fixture has viewBox width = 1230 and max-width: 1230px.

    const capped = capDiagramWidth(FIXTURE_SVG)

    // (a) cap shrank max-width below 1230
    const cappedWidthMatch = capped.match(/max-width:\s*(\d+)px/)
    expect(cappedWidthMatch).not.toBeNull()
    const cappedWidth = parseInt(cappedWidthMatch![1], 10)
    expect(cappedWidth).toBeLessThan(1230)
    expect(cappedWidth).toBe(769)

    // (b) viewBox is untouched through the cap pass
    expect(capped).toContain('viewBox="-50 -10 1230 512"')

    // (c) uncap removes max-width entirely
    const uncapped = uncapDiagramWidth(capped)
    expect(uncapped).not.toMatch(/max-width/)

    // (d) viewBox still untouched after both passes
    expect(uncapped).toContain('viewBox="-50 -10 1230 512"')
  })
})
