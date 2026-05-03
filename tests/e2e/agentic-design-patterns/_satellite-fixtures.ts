// Shared slot definitions for ADP satellite page tests (D1 spec-sheet layout).
// Reusable across all Phase-2 satellite tests — exports the h2-bearing
// heading definitions for structural assertions on any pattern satellite.
//
// Anatomy: the spec-sheet layout emits 5 h2s in the article body —
//   Decision (replaces When-to-use + When-NOT, zipped into a comparison table)
//   In the wild
//   Reader gotcha (optional; cited)
//   Implementation sketch
//   References
//
// The Overview and Background prose live behind <details> disclosures
// (default-open and default-closed respectively); their <summary> labels
// are NOT h2s so they don't appear here. Related patterns moves to the
// sticky meta rail, also no h2.
//
// COUPLING: 'Reader gotcha' is technically optional in the Pattern type
// (renders conditionally on pattern.readerGotcha). The full 5-h2 set assumes
// the canonical E2E target defines all optional slots. Reflexion (T5)
// defines readerGotcha. Before reusing this fixture against a different
// pattern, verify it has all 5 h2 sections — otherwise filter
// SATELLITE_H2_HEADINGS to the slots that pattern actually renders.

export const SATELLITE_H2_HEADINGS = [
  { level: 2, name: 'Decision' },
  { level: 2, name: 'In the wild' },
  { level: 2, name: 'Reader gotcha' },
  { level: 2, name: 'Implementation sketch' },
  { level: 2, name: 'References' },
] as const // 5 entries — h2-bearing slots only
