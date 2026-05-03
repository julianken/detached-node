// Shared slot definitions for ADP satellite page tests.
// Reusable across all Phase-2 satellite tests — exports the 7 h2-bearing
// heading definitions for structural assertions on any pattern satellite.
//
// Anatomy note: satellites have 8 content slots but only 7 <h2> headings.
// The Overview slot (bodySummary) renders as prose directly under <h1> with
// NO <h2> heading. The Diagram slot is a <figure> with no <h2>. The remaining
// 7 slots each carry an <h2> heading.

export const SATELLITE_H2_HEADINGS = [
  { level: 2, name: 'When to use' },
  { level: 2, name: 'When NOT to use' },
  { level: 2, name: 'Implementation sketch' },
  { level: 2, name: 'In the wild' },
  { level: 2, name: 'Reader gotcha' },
  { level: 2, name: 'Related patterns' },
  { level: 2, name: 'References' },
] as const // 7 entries — h2-bearing slots only; Overview is prose-only and asserted separately
