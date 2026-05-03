# `src/data/agentic-design-patterns/`

Data substrate for the Agentic Design Patterns catalog at `/agentic-design-patterns`.

## Directory map

| File | Purpose |
|---|---|
| `types.ts` | All TypeScript types: `LayerId`, `Pattern`, `Reference`, `ChangelogEntry`, etc. |
| `layers.ts` | `LAYERS` constant — 5-layer organization with titles, questions, and descriptions |
| `index.ts` | Barrel: imports all 23 pattern files, exports `PATTERNS` + helper functions |
| `changelog.ts` | `CHANGELOG` array — append-only audit trail of pattern adds/edits/retirements |
| `references.lock.json` | Canonical `{ doi → Reference }` map for deduplication across patterns |
| `patterns/<slug>.ts` | One file per pattern — `export const pattern: Pattern` |

## Slug → filename convention

Slugs are **kebab-case** and match the filename exactly:
- `reflexion` → `patterns/reflexion.ts`
- `tool-use-react` → `patterns/tool-use-react.ts`
- `12-factor-agent` → `patterns/12-factor-agent.ts` (digit-leading slug — alias in `index.ts`: `import { pattern as twelveFactorAgent } from './patterns/12-factor-agent'`)

## Layer organization

| Layer | ID | Count |
|---|---|---|
| Topology / Control Flow | `topology` | 13 (10 single-agent + 3 multi-agent) |
| Quality & Control Gates | `quality` | 3 |
| State & Context | `state` | 3 |
| Interfaces & Transport | `interfaces` | 3 |
| Methodology | `methodology` | 1 |

## Authoring a new pattern (STYLE_PASS checklist)

Every PR that populates a pattern stub must check off:

- [ ] All required `Pattern` fields populated; no empty strings or empty arrays in content slots
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (includes implementation-sketch typecheck in Phase 2)
- [ ] Read the style guide (`docs/superpowers/specs/agentic-design-patterns-style-guide.md`); voice matches Reflexion exemplar
- [ ] No prose copied or paraphrased from any source
- [ ] `mermaidSource` diagram renders in `pnpm dev` (visual check); `mermaidAlt` written
- [ ] `oneLineSummary.length <= 90` (enforced by unit test)
- [ ] All outbound URLs in `references[]` and `realWorldExamples[]` return 200
- [ ] Cross-links in `relatedSlugs` resolve to already-populated (non-stub) patterns
- [ ] `references[]` has 3-7 entries with `authors`, `year`, `venue`, `url`, `type`
- [ ] `CHANGELOG` has a new entry for this pattern with matching `slug`, `date`, `type: 'added'`
- [ ] `dateModified` set to today; `addedAt` set to today (first-time addition)
- [ ] Did NOT modify any other pattern file in this PR

## Adding a changelog entry

Prepend to `CHANGELOG` in `changelog.ts`:

```ts
{
  date: '2026-MM-DD',        // PR merge date (ISO)
  slug: 'your-slug',
  type: 'added',             // 'added' | 'edited' | 'retired'
  note: 'One-line description of what changed.',
  author: 'github-handle',
  prUrl: 'https://github.com/julianken/detached-node/pull/NNN',
}
```

## Reference deduplication (`references.lock.json`)

When adding a paper reference with a DOI, `scripts/validate-references.ts` will add a canonical entry. If two patterns cite the same DOI with different metadata, the lint step will warn. **Do not manually edit `references.lock.json`** — it is maintained by the validate script.

## What not to do

- Do not import pattern files directly outside of `index.ts` — use the helpers (`getPattern`, `getPatternsByLayer`, etc.)
- Do not hardcode the pattern count — use `getCatalogPatternCount()`
- Do not push `relatedSlugs` that point to stub-only patterns (they must be fully authored first)
- Do not set `archived: true` without a corresponding `CHANGELOG` entry with `type: 'retired'`
