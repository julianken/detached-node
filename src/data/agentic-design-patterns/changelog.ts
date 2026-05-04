import type { ChangelogEntry } from './types'

// ---------------------------------------------------------------------------
// Agentic Design Patterns — Catalog Changelog
// ---------------------------------------------------------------------------
// Append-only audit trail. Every PR that touches patterns/<slug>.ts MUST add
// an entry here. CI (scripts/lint-changelog.mjs) enforces this in Phase 2.
//
// Sort: newest-first. When adding an entry, prepend to CHANGELOG.
//
// Fields:
//   date      ISO date the change landed (PR merge date)
//   slug      Pattern slug that was touched
//   type      'added' | 'edited' | 'retired'
//   note      1-line description (mirrors pattern.lastChangeNote for 'edited')
//   author    GitHub handle of the PR author
//   prUrl     Link to the merged PR (fill in after merge)

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-05-04',
    slug: 'handoffs-swarm',
    type: 'added',
    note: 'Author Handoffs / Swarm satellite: sequential conversation ownership, transfer-as-tool-call, supervisor variant.',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'guardrails',
    type: 'added',
    note: 'Author Guardrails satellite: input/output rails, layered defence, indirect-prompt-injection gotcha.',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'checkpointing',
    type: 'added',
    note: 'Author Checkpointing satellite: durable agent state across crashes; snapshot vs replay variants; determinism gotcha.',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'context-engineering',
    type: 'added',
    note: 'Author Context Engineering pattern (selection, ranking, layout, cache-aware assembly).',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'evaluation-llm-as-judge',
    type: 'added',
    note: 'Initial authoring of the Evaluation (LLM-as-Judge) pattern (wave-2, issue #179).',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'memory-management',
    type: 'added',
    note: 'Initial authoring of Memory Management pattern (wave 2; tiered working/episodic/semantic stores).',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'rag',
    type: 'added',
    note: 'Authored RAG pattern (vanilla retrieve-and-generate; agentic variant remains separate).',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'tool-use-react',
    type: 'added',
    note: 'Initial authoring of Tool Use / ReAct pattern (Phase-2 wave-1).',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'routing',
    type: 'added',
    note: 'Initial authoring of the Routing pattern (wave-1, issue #173).',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'prompt-chaining',
    type: 'added',
    note: 'Initial authoring of Prompt Chaining pattern (wave 1).',
    author: 'julianken',
  },
  {
    date: '2026-05-03',
    slug: 'planning',
    type: 'added',
    note: 'Author Planning satellite: planner-executor split, re-plan loop, ToT/HuggingGPT/Plan-and-Solve variants.',
    author: 'julianken',
  },
  {
    // Phase 1A scaffold: type model, layers, 23 stubs, helpers, changelog.
    // Reflexion stub is added here; full authoring ships in Phase 1F (#158).
    // Date bumped to 2026-05-03 by #158 so lint-changelog matches the
    // now-authored Reflexion pattern's dateModified. Note text is mandated by
    // #152 — do not change it; do not append a duplicate entry for this
    // slug+type.
    date: '2026-05-03',
    slug: 'reflexion',
    type: 'added',
    note: 'Catalog scaffold launched; Reflexion exemplar shipped in #158.',
    author: 'julianken',
  },
]
