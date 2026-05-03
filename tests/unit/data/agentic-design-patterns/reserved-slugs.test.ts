import { describe, it, expect } from 'vitest'
import { PATTERNS } from '@/data/agentic-design-patterns/index'

// ---------------------------------------------------------------------------
// Reserved-slug guard
// ---------------------------------------------------------------------------
// Static-segment routes WIN over dynamic-segment routes at the same level in
// Next.js. The hub directory currently contains:
//
//   /agentic-design-patterns/
//   ├── changelog/page.tsx       ← static segment
//   ├── [slug]/page.tsx          ← dynamic segment
//   └── ...
//
// If any pattern were added with `slug: 'changelog'`, every link to that
// pattern's satellite would silently resolve to the changelog page instead.
// The user would never see the satellite content; nothing would error.
//
// This test makes that mistake loud at CI time. Add additional reserved slugs
// to RESERVED_SLUGS as new static segments are introduced under the hub
// (e.g. `/agentic-design-patterns/about` would require adding 'about').

const RESERVED_SLUGS = ['changelog'] as const

describe('Agentic design patterns — reserved slugs', () => {
  it.each(RESERVED_SLUGS)(
    'no pattern uses the reserved slug "%s" (would shadow the static route)',
    (reserved) => {
      const slugs = PATTERNS.map((p) => p.slug)
      expect(slugs).not.toContain(reserved)
    },
  )
})
