import { describe, it, expect } from 'vitest'
import { LAYERS } from '@/data/agentic-design-patterns/layers'
import type { LayerId } from '@/data/agentic-design-patterns/types'

describe('LAYERS', () => {
  it('contains exactly 5 layers', () => {
    expect(LAYERS).toHaveLength(5)
  })

  it('layer numbers are 1 through 5 in order', () => {
    const numbers = LAYERS.map((l) => l.number)
    expect(numbers).toEqual([1, 2, 3, 4, 5])
  })

  it('layer ids are unique', () => {
    const ids = LAYERS.map((l) => l.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(5)
  })

  it('contains all five expected layer ids', () => {
    const ids = LAYERS.map((l) => l.id)
    const expected: LayerId[] = ['topology', 'quality', 'state', 'interfaces', 'methodology']
    for (const id of expected) {
      expect(ids).toContain(id)
    }
  })

  it('first layer is topology (the largest bucket)', () => {
    expect(LAYERS[0].id).toBe('topology')
    expect(LAYERS[0].number).toBe(1)
  })

  it('last layer is methodology', () => {
    expect(LAYERS[LAYERS.length - 1].id).toBe('methodology')
    expect(LAYERS[LAYERS.length - 1].number).toBe(5)
  })

  it('every layer has a non-empty title, question, and description', () => {
    for (const layer of LAYERS) {
      expect(layer.title.length).toBeGreaterThan(0)
      expect(layer.question.length).toBeGreaterThan(0)
      expect(layer.description.length).toBeGreaterThan(0)
    }
  })

  it('layer questions end with a question mark', () => {
    for (const layer of LAYERS) {
      expect(layer.question).toMatch(/\?$/)
    }
  })
})
