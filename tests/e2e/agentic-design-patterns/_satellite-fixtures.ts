// Shared slot definitions for ADP satellite page tests.
// Reusable across all Phase-2 satellite tests — exports the 7 h2-bearing
// heading definitions for structural assertions on any pattern satellite.
//
// Anatomy note: satellites have 8 content slots but only 7 <h2> headings.
// The Overview slot (bodySummary) renders as prose directly under <h1> with
// NO <h2> heading. The Diagram slot is a <figure> with no <h2>. The remaining
// 7 slots each carry an <h2> heading.
//
// COUPLING: 'Reader gotcha' is technically optional in the Pattern type
// (PatternBody renders it conditionally on pattern.readerGotcha). The full
// 7-h2 set assumes the canonical E2E target defines all optional slots.
// Reflexion (T5) defines readerGotcha. Before reusing this fixture against a
// different pattern, verify it has all 7 h2 sections — otherwise filter
// SATELLITE_H2_HEADINGS to the slots that pattern actually renders.

export const SATELLITE_H2_HEADINGS = [
  { level: 2, name: 'When to use' },
  { level: 2, name: 'When NOT to use' },
  { level: 2, name: 'Implementation sketch' },
  { level: 2, name: 'In the wild' },
  { level: 2, name: 'Reader gotcha' },
  { level: 2, name: 'Related patterns' },
  { level: 2, name: 'References' },
] as const // 7 entries — h2-bearing slots only; Overview is prose-only and asserted separately
