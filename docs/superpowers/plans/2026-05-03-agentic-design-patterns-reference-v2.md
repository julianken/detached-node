# Agentic Design Patterns — Field Reference (v2 Plan)

> **Required execution skill:** `superpowers:subagent-driven-development`. Each task below dispatches three subagents in sequence: implementer → spec-reviewer → code-quality-reviewer. The implementer-subagent prompts in this plan are **paste-ready** — they reference the canonical issue body as the source of truth.

**Date:** 2026-05-03
**Status:** Active. Supersedes `docs/superpowers/plans/2026-05-02-agentic-design-patterns-reference.md` (kept as historical record).
**Source of truth:** GitHub epic #151 + sub-issues #152–#160 — all `ready-for-dev`.

## Goal

Ship the scaffold and one fully-authored "Reflexion" pattern at `/agentic-design-patterns`, with all guardrails (typecheck-sketches, validate-references with OpenAlex fallback, affiliate-link check, changelog lint) and the global nav link in place — so Phase 2 can dispatch the remaining 22 satellites in parallel via epic `#160b`.

## Architecture (per issues, not the old spec)

A static (ISR-revalidated) Next.js 16 pillar-cluster: one hub at `/agentic-design-patterns` with 23 satellite routes at `/agentic-design-patterns/[slug]`, plus a changelog page. Per-pattern data files under `src/data/agentic-design-patterns/patterns/` enable parallel-subagent authorship without merge contention. Citations are first-class — every `type: 'paper'` reference is cross-checked against Crossref **with OpenAlex fallback** for arXiv preprint DOIs (which return 404 from Crossref). The Reflexion satellite is the editorial-voice anchor for Phase 2.

## Tech Stack

Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, Mermaid (existing component reused), Vitest (unit), Playwright (e2e), `tsx` (script runner), `pnpm` (NOT npm), Crossref + OpenAlex APIs (reference validation), `next/og` (OG images, no `runtime = 'edge'`), `next-view-transitions`.

## Branch & cwd

- **Working directory:** `/Users/jul/repos/detached-node` (use absolute paths everywhere; subagent cwd resets between bash calls)
- **Branch:** `feat/agentic-design-patterns` (Phase 0 spike already committed locally at `2ba98f9` — first pre-flight action pushes it to origin)
- **PR target for tasks T1–T7:** the long-lived branch `feat/agentic-design-patterns`. Final integration PR merges that branch into `main` after T7.
- **Worktree branches:** subagent dispatches typically use `worktree-agent-<task-id>` short-lived branches; the cleanup hook script handles them.

---

## Universal implementer-subagent rules (cite in EVERY prompt)

These appear verbatim in every implementer prompt below. Centralized here for reference.

```
GOTCHAS — read before touching any code:

1. Use `pnpm`, NOT `npm`. The lockfile is pnpm-lock.yaml; mixing managers corrupts it. (Hard lesson from prior worktrees.)
2. Tests live under `tests/unit/...` per the vitest config — NOT `tests/data/...` or `tests/lib/...`. The old plan used the wrong path; do not propagate it.
3. Today's date is 2026-05-03 (machine clock authoritative). Compute programmatically: `new Date().toISOString().slice(0, 10)`.
4. Phase 0 spike artifacts at `docs/agentic-design-patterns/spike/` are committed at 2ba98f9. Do NOT modify, re-add, or rewrite them.
5. Phase 0 SPIKE_LOG lessons (apply when relevant):
   - tsc flags must include: `--noEmit --types node --skipLibCheck --lib es2022,dom --module esnext --target es2022 --moduleResolution bundler --strict`
   - Inject `export {}` into snippets that lack imports/exports — top-level await requires module mode (TS1375).
   - Capture both stdout AND stderr from tsc (errors split across both depending on flags).
6. Working dir is `/Users/jul/repos/detached-node`. Absolute paths only — your cwd resets between bash calls.
7. Branch is `feat/agentic-design-patterns` (already checked out). Do NOT switch branches; do NOT push to `main`.
8. Open PRs against `feat/agentic-design-patterns`, NOT against `main`.
9. Commits should be small and focused — one per task-step in the issue body. The acceptance criteria call out specific commit boundaries.
```

---

## Pre-flight (one commit on `feat/agentic-design-patterns`, before any task dispatch)

This runs **once, manually** by the dispatching engineer before T1. It is not a subagent task.

### PF.1 — Push branches to origin

```bash
cd /Users/jul/repos/detached-node
git checkout main && git push origin main
git checkout feat/agentic-design-patterns && git push -u origin feat/agentic-design-patterns
```

Phase 0 spike commit `2ba98f9` becomes visible on the remote. CI starts running on the feat branch.

### PF.2 — Verify CI bring-up locally

Before dispatching anything, confirm the current state of the branch is green:

```bash
cd /Users/jul/repos/detached-node
pnpm install --frozen-lockfile

# Verify gh CLI is authed against julianken/detached-node (subagents fail at step 1 if not)
gh auth status
gh -R julianken/detached-node issue list --limit 1

pnpm lint
pnpm test:unit

# E2E requires Postgres + the test DB seed — start Docker first if needed
# (skip with `--grep '@public'` if no DB available; ADP routes are public/DB-independent)
pnpm seed:test  # requires Postgres at DATABASE_URL; will fail if no DB
pnpm test:e2e -- --reporter=list
pnpm next build
```

If any of these fail on the spike commit, fix locally with a `chore(adp): bring CI green` commit before T1. **Do not dispatch into a red baseline.** If `pnpm test:e2e` fails because no local DB is up, that's OK for now (CI has Postgres); the ADP routes don't depend on DB but the existing public.spec.ts tests do.

### PF.3 — Coordination check: is #150 merged?

```bash
gh -R julianken/detached-node pr list --state merged --search "remove failure-modes"
gh -R julianken/detached-node issue view 150
```

- **If #150 is merged:** T4 (#157) sitemap edit is clean — just adds 25 ADP URLs.
- **If #150 is NOT merged:** T4 implementer prompt below instructs the subagent to **also remove the `/failure-modes` sitemap entry** in the same PR, and to call this out in the PR description (per #157 acceptance criterion #1).

Record the answer here for T4 dispatch:

> _#150 status as of pre-flight: **OPEN** (verified 2026-05-03 — `gh issue view 150` returns `state=open`). T4 implementer MUST also remove the `/failure-modes` sitemap entry in the same PR and call this out in the PR description._

### PF.4 — Confirm the source PDF is at `/tmp/adp.pdf`

```bash
ls -lh /tmp/adp.pdf
```

T1 (#152) requires this file. If missing, copy from a known location before dispatching T1.

---

## Task overview & dependency graph

```
T1 (#152, foundation) ── typecheck script + types + 23 stubs + index helpers
   │
   ├──── T2-A (#153, sonnet, S) ── pnpm add -D ai @ai-sdk/openai zod
   ├──── T2-B (#155, sonnet, M) ── schema utilities (parallel-safe with T2-A, T2-C)
   └──── T2-C (#156, opus,   L) ── 10 components + pattern-search (parallel-safe with T2-A, T2-B)
                │                       │
                ├── T3 (#154, opus, L) ─┘── lint scripts (depends on T1 + T2-A)
                │
                └── T4 (#157, opus, M) ── routes + sitemap + OG (T1 + T2-B + T2-C)
                            │
                            └── T5 (#158, opus, M) ── Reflexion exemplar (T1+T2-A+T3+T2-B+T2-C+T4)
                                        │
                                        └── T6 (#159, sonnet, M) ── E2E + style guide (T4 + T5)
                                                    │
                                                    └── T7 (#160, sonnet, S) ── polish + nav + verify
                                                                │
                                                                └── T8 (post-merge) ── open #160b
```

**Parallelism opportunity:** After T1 lands, T2-A / T2-B / T2-C dispatch concurrently in three separate subagent threads. T3 starts when T1 + T2-A are both done. T4 starts when T1 + T2-B + T2-C are done. T5 only starts when the full union has merged.

Total estimated wall-clock if dispatched optimally: **~6 dispatch cycles** (T1 → {T2-A‖T2-B‖T2-C} → T3 → T4 → T5 → T6 → T7 → T8). T2 cycle counts as one if all three threads run in parallel.

---

## Task T1 — Type model + data scaffold (Issue #152)

**Issue:** https://github.com/julianken/detached-node/issues/152
**Dispatch model:** sonnet (mostly mechanical; helpers + stubs follow a fixed template)
**Estimated complexity:** L (longest task by file count — 23 stubs + types + tests + scaffold script + PDF)
**Depends on:** Pre-flight only
**Parallel-safe with:** none (foundation)

**Implementer subagent prompt** (verbatim — dispatcher pastes when invoking):

```
You are implementing GitHub issue #152 as part of the ADP (Agentic Design Patterns) Phase 1 build.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns (already checked out; do NOT switch)

Read the issue first — it's the canonical source of truth:

  gh -R julianken/detached-node issue view 152

The issue body specifies: prerequisites, files to create, exact tasks in order, and acceptance criteria. Follow it strictly. The plan you're being dispatched from is a coordinator artifact, NOT a substitute for the issue body.

Workflow:
1. Read the issue body completely
2. Confirm `/tmp/adp.pdf` exists (~19MB); copy to docs/agentic-design-patterns/Agentic_Design_Patterns.pdf
3. Add a `typecheck` script to package.json — the prereq commit. The issue calls this out as the FIRST commit; do it before anything else.
4. Verify tests live under `tests/unit/data/agentic-design-patterns/...` (NOT `tests/data/...` — the vitest config requires `tests/unit/`).
5. Implement task-by-task per the issue's "Tasks" section, in order.
6. After each substantive task, run `pnpm typecheck && pnpm test:unit -- tests/unit/data/agentic-design-patterns/` and commit with a focused message.
7. The "12-factor-agent" stub filename starts with a digit — alias the import in `index.ts` (`import twelveFactorAgent from './patterns/12-factor-agent'`).
8. When all acceptance criteria are met, open a PR against `feat/agentic-design-patterns`.
9. Report back: status (DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED), list of commits, PR URL, any open questions.

GOTCHAS — read before touching any code:

1. Use `pnpm`, NOT `npm`. The lockfile is pnpm-lock.yaml; mixing managers corrupts it.
2. Tests live under `tests/unit/...` per the vitest config — NOT `tests/data/...`.
3. Today's date is 2026-05-03 (machine clock authoritative). Compute programmatically: `new Date().toISOString().slice(0, 10)`.
4. Phase 0 spike artifacts at `docs/agentic-design-patterns/spike/` are committed at 2ba98f9. Do NOT modify them.
5. Working dir is /Users/jul/repos/detached-node. Absolute paths only — cwd resets between bash calls.
6. Branch is feat/agentic-design-patterns. Do NOT switch; do NOT push main.
7. Open the PR against feat/agentic-design-patterns, NOT main.
8. Topology pattern membership is exact: 10 single-agent + 3 multi-agent. Helpers must enforce this with tests.
```

**Spec-reviewer subagent prompt** (paste after implementer reports DONE):

```
Review the PR for issue #152 against the issue's "Acceptance Criteria" section.

  gh -R julianken/detached-node issue view 152
  gh -R julianken/detached-node pr view <PR_URL>

For each acceptance criterion, mark PASS / FAIL / PARTIAL with evidence (file:line or test output). Pay special attention to:
- `pnpm typecheck` exits 0 (run it locally on the PR branch)
- 23 active patterns counted (not 22, not 24)
- Single-agent set is exactly {prompt-chaining, routing, parallelization, planning, tool-use-react, code-agent, evaluator-optimizer, rag, agentic-rag, reflexion}
- Multi-agent set is exactly {orchestrator-workers, multi-agent-debate, handoffs-swarm}
- typecheck script exists in package.json BEFORE any data files
- Tests are at tests/unit/data/agentic-design-patterns/ (not tests/data/)
- references.lock.json present (can be empty or {})
- The stub for 12-factor-agent is correctly aliased in index.ts (filename starts with digit)

Report: APPROVED / CHANGES_REQUESTED with specific items.
```

**Code-quality-reviewer subagent prompt** (paste after spec-reviewer approves):

```
Review the PR for issue #152 for code quality.

  gh -R julianken/detached-node pr view <PR_URL> --json files
  gh -R julianken/detached-node pr diff <PR_URL>

Focus areas:
- Type safety: types.ts uses discriminated unions correctly; no `any` types; optional fields use `?:` not `| undefined` (consistency with existing src/lib/schema/types.ts)
- Helpers in index.ts handle the empty-stub case (most patterns are stubs at this point — getCatalogDateModified() must not crash on a stub set)
- README.md and LICENSE-NOTICE.md follow the conventions in docs/agentic-design-patterns/ (markdown style consistent with SPIKE_LOG.md)
- The scaffold script (scripts/scaffold-pattern-stubs.mjs) is idempotent — re-running doesn't duplicate stubs
- Test coverage: every helper has at least one test; the topology-membership assertions are exact-set equality (not subset)
- Code conventions: 2-space indent, kebab-case files, PascalCase types, double quotes (matches existing src/lib code)
- No commented-out code; no TODO comments without an issue link

Report: APPROVED / CHANGES_REQUESTED with file:line references.
```

---

## Task T2-A — Install AI SDK devDependencies (Issue #153)

**Issue:** https://github.com/julianken/detached-node/issues/153
**Dispatch model:** sonnet (single command + verification)
**Estimated complexity:** S
**Depends on:** T1 (needs the `typecheck` script committed in T1's prereq commit; can dispatch as soon as that single commit is on the branch — does NOT need to wait for T1's full PR to merge)
**Parallel-safe with:** T2-B, T2-C

**Implementer subagent prompt:**

```
You are implementing GitHub issue #153 as part of the ADP Phase 1 build.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first:

  gh -R julianken/detached-node issue view 153

This is the smallest task in the epic — install three packages as devDependencies and commit the lockfile. The issue specifies exact versions and the install command.

Workflow:
1. Confirm the typecheck script exists in package.json (T1 prereq) — `pnpm typecheck` should work.
2. Run exactly: `pnpm add -D ai@^4 @ai-sdk/openai@^1 zod@^3.25.76`
3. Verify NO entries were added to `dependencies` (check the diff).
4. Verify no `package-lock.json` was created (only pnpm-lock.yaml updates).
5. Run `pnpm install` again to confirm zero peer-dependency warnings.
6. Run `pnpm typecheck` — must exit 0.
7. Commit `package.json` + `pnpm-lock.yaml` together.
8. Open PR against feat/agentic-design-patterns.
9. Report back: status, commit SHA, PR URL.

GOTCHAS:
- Use `pnpm`, NOT `npm`. Mixing creates package-lock.json which the issue explicitly forbids.
- Today's date is 2026-05-03.
- Working dir is /Users/jul/repos/detached-node. Absolute paths only.
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #153.

  gh -R julianken/detached-node issue view 153
  gh -R julianken/detached-node pr view <PR_URL>

Check each acceptance criterion:
- All three packages (ai@^4, @ai-sdk/openai@^1, zod@^3.25.76) appear in `devDependencies` (NOT `dependencies`)
- `pnpm-lock.yaml` updated and committed in the same commit
- No `package-lock.json` created
- `pnpm typecheck` exits 0 on the PR branch
- No peer-dependency warnings on a fresh `pnpm install`

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR diff for issue #153.

  gh -R julianken/detached-node pr diff <PR_URL>

This is a near-mechanical change. Verify:
- Only `package.json` and `pnpm-lock.yaml` modified (no stray edits)
- Version ranges match the issue exactly (no upgrades, no downgrades)
- Lockfile diff is internally consistent (no orphaned entries)

Report: APPROVED / CHANGES_REQUESTED.
```

---

## Task T2-B — Schema utilities (Issue #155)

**Issue:** https://github.com/julianken/detached-node/issues/155
**Dispatch model:** sonnet (well-specified mapping with type rules)
**Estimated complexity:** M
**Depends on:** T1 (needs `Pattern`, `Reference` types)
**Parallel-safe with:** T2-A, T2-C

**Implementer subagent prompt:**

```
You are implementing GitHub issue #155 as part of the ADP Phase 1 build.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first:

  gh -R julianken/detached-node issue view 155

Read these existing schema modules to match conventions before writing code:
- src/lib/schema/breadcrumb.ts (you'll be appending generateHubChildBreadcrumb to this)
- src/lib/schema/citation.ts (toScholarlyArticleSchema mapping precedent)
- src/lib/schema/types.ts (existing schema interfaces — use these typed shapes, not Record<string, unknown>)
- src/lib/schema/config.ts (SITE_CONFIG.url usage pattern)
- src/lib/schema/index.ts (re-export the new helpers from the barrel)

Workflow:
1. Read the issue's "Implementation Requirements" section completely — the Reference→schema mapping is rule-by-rule.
2. Create src/lib/schema/agentic-patterns.ts exporting `generatePatternArticleSchema(pattern: Pattern, baseUrl: string): ArticleSchema`.
3. Reference→schema mapping rules:
   - `type === 'paper'` → ScholarlyArticle (with `identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: ref.doi }` when DOI present — uppercase `'DOI'` per schema.org PropertyValue convention; lowercase will fail validation)
   - `type === 'book'` → Book
   - `type === 'spec'` | `'docs'` | `'essay'` → WebPage
   - Skip Reference.note and Reference.pages in JSON-LD output (UI-only fields). Document the omissions with inline comments.
4. Article schema @id MUST use `#pattern-article` suffix (not `#article` — avoids collision with future BlogPosting on same URL).
5. Include: dateModified, headline, description, citation array, **`author: { '@id': AUTHOR_CONFIG.id }`** (an `@id` reference to the canonical author entity at `${siteUrl}/#author`, NOT the whole AUTHOR_CONFIG object embedded — use `.id` reference for entity de-duplication across pages).
6. Append `generateHubChildBreadcrumb(slug: string, name: string)` to src/lib/schema/breadcrumb.ts (parameter order: SLUG FIRST, then name — matches issue #157 callsite). Returns typed BreadcrumbListSchema (3 levels: Home > Hub > Pattern).
7. Re-export both new helpers from src/lib/schema/index.ts.
8. Write tests at tests/unit/lib/schema/agentic-patterns.test.ts and tests/unit/lib/schema/breadcrumb-hub.test.ts.
9. Tests must include a 5-reference fixture verifying citation array length and per-type mapping.
10. Run `pnpm typecheck && pnpm test:unit -- tests/unit/lib/schema/`.
11. Commit small focused changes; open PR against feat/agentic-design-patterns.

GOTCHAS:
- Use `pnpm`, NOT `npm`.
- Tests at tests/unit/lib/schema/ (NOT tests/lib/schema/).
- Today's date 2026-05-03.
- Working dir /Users/jul/repos/detached-node.
- Branch feat/agentic-design-patterns.
- Use typed BreadcrumbListSchema return — don't fall back to Record<string, unknown>.
- Use double quotes (matches existing schema/ files).
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #155.

  gh -R julianken/detached-node issue view 155
  gh -R julianken/detached-node pr view <PR_URL>

For each acceptance criterion:
- Reference 'paper' maps to ScholarlyArticle with DOI when present, **propertyID is uppercase `'DOI'`** (NOT `'doi'`)
- Reference 'book' maps to Book
- Reference 'spec'/'docs'/'essay' maps to WebPage
- Reference.note and Reference.pages NOT in JSON-LD output (verify in test fixture)
- Article @id ends with `#pattern-article`
- **Article.author is `{ '@id': AUTHOR_CONFIG.id }`** (an @id reference, not the embedded object)
- Breadcrumb returns typed 3-level list (not Record<string, unknown>)
- **`generateHubChildBreadcrumb` parameter order is `(slug, name)`** (slug first — matches #157 callsite)
- Both helpers re-exported from src/lib/schema/index.ts
- 5-reference fixture test exists and passes; **fixture covers all 5 ReferenceTypes (paper, book, spec, docs, essay)**
- All unit tests pass: `pnpm test:unit -- tests/unit/lib/schema/`

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR for issue #155.

Focus:
- Type safety: full typed return from both helpers; no `as` casts; uses existing ArticleSchema/BreadcrumbListSchema interfaces
- Comments document the omitted Reference fields (note, pages)
- Convention match: file style matches existing src/lib/schema/*.ts (double quotes, named function declarations, JSDoc on exports)
- DOI handling: properly URL-encoded if needed; PropertyValue shape is canonical
- Test fixtures: representative — covers all 5 reference types, missing-DOI case, missing-note case
- No accidental coupling to specific patterns (the helpers should work for any Pattern)

Report: APPROVED / CHANGES_REQUESTED with file:line references.
```

---

## Task T2-C — Components + pattern-search (Issue #156)

**Issue:** https://github.com/julianken/detached-node/issues/156
**Dispatch model:** opus (10 components, accessibility constraints, design-system parity, server/client boundary judgment)
**Estimated complexity:** L
**Depends on:** T1 (needs `Pattern`, `Layer` types and the `LAYERS` constant)
**Parallel-safe with:** T2-A, T2-B

**Implementer subagent prompt:**

```
You are implementing GitHub issue #156 as part of the ADP Phase 1 build.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first:

  gh -R julianken/detached-node issue view 156

You're building 10 React components plus a search utility. Read these design-system anchors before writing any component:
- docs/design-system.md (color tokens, spacing, hover states)
- src/app/globals.css lines 237–257 (design tokens)
- tailwind.config.ts lines 73–83 (focus-ring utility)
- src/components/PostCard.tsx (PatternCard heading typography MUST match exactly: "font-mono text-lg font-semibold tracking-tight text-text-primary" with [text-wrap:balance])
- src/components/MermaidDiagram.tsx (PatternBody imports this, server-safe)

Workflow:
1. Read the issue body completely — it specifies the heading hierarchy, server/client boundary, and accessibility rules per component.
2. Build components in this order (lowest deps first):
   a. LivingCatalogBadge (no deps)
   b. PatternCard (uses card-trace card-scanline frame-label utilities; matches PostCard heading typography exactly)
   c. PatternHeader (single <h1>)
   d. ReferencesSection (returns null if empty; uses <cite> for titles)
   e. RelatedPatternsRow (<h2>)
   f. PrevNextNav (uses getAdjacentPatterns from T1's index.ts)
   g. HubHero (single <h1>; emits dynamic count from getCatalogPatternCount)
   h. HubGrid (server component; layer titles <h2>; topology sub-tier dividers with dynamic (N) counts)
   i. PatternBody (composes 8 slots; conditional rendering; imports MermaidDiagram)
   j. HubSearchBar (the ONLY 'use client' component; ships with NO callback props — filtering coordination moves to T4/#157)
3. Build src/lib/pattern-search.ts — pure function, prefix + substring across name + alternativeNames + oneLineSummary + layer label.
4. Write 5 tests at tests/unit/lib/pattern-search.test.ts (empty query, prefix, substring, case-insensitive, no-match).
5. Components live at src/components/agentic-patterns/*.tsx.
6. Heading hierarchy is mandatory:
   - Hub: 1 <h1> (HubHero), <h2> for layer titles, <h3> for topology sub-tiers, <h3> card titles (or <h4> under sub-tier — PatternCard takes a `headingLevel: 3 | 4` prop)
   - Satellite: 1 <h1> (PatternHeader), <h2> for slot headings, <h3> sub-headings
7. Run `pnpm typecheck && pnpm test:unit -- tests/unit/lib/pattern-search.test.ts`.
8. Commit per-component (10–11 commits is fine — they're small and focused).
9. Open PR against feat/agentic-design-patterns.

GOTCHAS:
- Use `pnpm`, NOT `npm`.
- Tests at tests/unit/lib/ (NOT tests/lib/).
- Today's date 2026-05-03.
- Working dir /Users/jul/repos/detached-node.
- Branch feat/agentic-design-patterns.
- HubSearchBar has NO callback props in this issue. Filtering wiring lives in T4/#157 (the wrapper component there is `<HubFilterableContent>`). If you find yourself adding `onFilterChange`, stop — re-read the issue.
- PatternCard heading className MUST be exactly `"font-mono text-lg font-semibold tracking-tight text-text-primary"` with `[text-wrap:balance]` to match PostCard parity.
- **PatternBody MUST NOT pass non-serializable props (functions, classes, JSX with closures over server-only data) to MermaidDiagram.** Only `{ source: string }` is allowed. Adding any function/closure prop will fail the Next 16 build with "functions cannot be passed to client components".
- Cards use `bg-zinc-50 dark:bg-zinc-800` per docs/design-system.md (NOT dark:bg-zinc-900 unless intentionally recessed).
- Borders: `border-zinc-200 dark:border-zinc-700` for standard, `border-zinc-200 dark:border-zinc-800` for subtle.
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #156.

  gh -R julianken/detached-node issue view 156
  gh -R julianken/detached-node pr view <PR_URL>

Check each acceptance criterion:
- All 10 components exist at src/components/agentic-patterns/
- src/lib/pattern-search.ts exists with 5 passing tests
- HubSearchBar has 'use client' directive AND no callback props (grep for `onFilter`, `onChange.*=>` props in interface)
- All other components are server-only (no 'use client')
- PatternCard className includes "font-mono text-lg font-semibold tracking-tight text-text-primary" and [text-wrap:balance]
- PatternCard uses card-trace card-scanline frame-label utilities
- HubGrid topology sub-dividers display dynamic (N) counts (verify with the test render)
- Heading hierarchy: hub has exactly 1 <h1> in HubHero; satellite has exactly 1 <h1> in PatternHeader; layer titles are <h2>
- ReferencesSection returns null on empty
- Pattern search tests cover all 5 cases listed in the issue
- `pnpm typecheck` exits 0

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR for issue #156.

Focus areas:
- Accessibility: every interactive element has a label; focus rings present (focus-ring utility); ARIA live region on HubSearchBar; <cite> wraps reference titles in ReferencesSection; keyboard navigation works (tab order, Esc/Enter/Arrow handling on filter chips — wired in T4 but the components must be a11y-ready)
- Type safety: no `any`; props interfaces explicit; headingLevel prop on PatternCard is union `3 | 4` not `number`
- Server/client boundary: HubSearchBar is the ONLY client component; PatternBody imports MermaidDiagram in a server-safe way (MermaidDiagram itself handles client rendering internally)
- Code conventions: matches src/components/PostCard.tsx and existing src/components/* patterns (named exports, double quotes, function components, no React.FC)
- Test coverage on pattern-search: edge cases (whitespace-only query, very long query, special chars in query)
- No stray console.log or commented-out code
- Tailwind class ordering follows project convention (layout → spacing → typography → color)

Report: APPROVED / CHANGES_REQUESTED with file:line references.
```

---

## Task T3 — Lint scripts / guardrails (Issue #154)

**Issue:** https://github.com/julianken/detached-node/issues/154
**Dispatch model:** opus (script logic, OpenAlex fallback, GitHub workflow, multiple gotchas from spike + bot review)
**Estimated complexity:** L
**Depends on:** T1 (needs index.ts helpers), T2-A (needs ai SDK installed for typecheck-sketches.ts)
**Parallel-safe with:** T2-B, T2-C (only after T1+T2-A merged)

**Implementer subagent prompt:**

```
You are implementing GitHub issue #154 — the guardrail lint scripts. This is the highest-stakes task in the epic because it's what makes the citation-rigor claim real.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first — it has extensive critical implementation requirements:

  gh -R julianken/detached-node issue view 154

ALSO READ THIS BEFORE WRITING typecheck-sketches.ts:

  cat docs/agentic-design-patterns/spike/SPIKE_LOG.md

The spike log has hard-won lessons that MUST be applied (see the "Lessons applied to scripts/typecheck-sketches.ts" section).

Workflow:
1. Confirm `pnpm list tsx` shows tsx in devDependencies. If absent, add it (`pnpm add -D tsx`) — but it should already be there.
2. Confirm `getCatalogDateModified()` exists in src/data/agentic-design-patterns/index.ts (T1 deliverable).
3. Build scripts in this order:
   a. scripts/typecheck-sketches.ts (apply ALL spike lessons — see below)
   b. scripts/validate-references.ts (the OpenAlex fallback is CRITICAL — see below)
   c. scripts/check-affiliate-links.ts (expanded parameter list — see issue)
   d. scripts/lint-changelog.ts (uses git diff against origin/main; handles archived patterns)
   e. scripts/check-pattern-overlap.ts (manual tool — NOT wired into CI)
   f. scripts/check-pattern-links.ts (per-host concurrency = 1, GET fallback for HEAD-rejecting hosts)
   g. .github/workflows/check-pattern-links.yml (permissions: contents: read, issues: write; pnpm setup; de-dup issues)
4. Wire package.json:
   "lint": "eslint && pnpm run lint:adp",
   "lint:adp": "tsx scripts/typecheck-sketches.ts && tsx scripts/validate-references.ts && tsx scripts/check-affiliate-links.ts && tsx scripts/lint-changelog.ts"
   (Note: check-pattern-overlap.ts and check-pattern-links.ts are NOT in lint:adp.)
5. Run `pnpm lint` against the empty stub set from T1 — it must pass.
6. Add negative-test fixtures and verify they fail:
   - Fabricated DOI `10.48550/arXiv.9999.99999` → validate-references exits 1
   - URL with `?tag=foo-20` → check-affiliate-links exits 1
   - Snippet with top-level await but no exports → typecheck-sketches.ts injects export {} and passes
7. Commit each script in its own commit; open PR against feat/agentic-design-patterns.

CRITICAL — typecheck-sketches.ts:
- tsc flags MUST include: `--noEmit --types node --skipLibCheck --lib es2022,dom --module esnext --target es2022 --moduleResolution bundler --strict`
- Inject `export {}` automatically at end of any snippet that lacks an import or export (fixes TS1375 from top-level await)
- Capture both stdout AND stderr from tsc subprocess (errors split across both)
- Skip patterns whose `sdkAvailability === 'python-only'` or `'no-sdk'` for compilation, but verify a "pseudocode" banner is present in those sketches

CRITICAL — validate-references.ts (the OpenAlex fallback is the WHOLE POINT):
- For every Reference with type === 'paper':
  1. Read references.lock.json — short-circuit if DOI is verified
  2. Try Crossref first: `https://api.crossref.org/works/{doi}` (cached, fast)
  3. ON 404 OR NETWORK ERROR, fall back to OpenAlex: `https://api.openalex.org/works/doi:{doi}`
  4. Validate title fuzzy-match (lowercase + strip punctuation), year exact, first-author surname (after splitting on ', ' or ' and ')
- User-Agent: `detached-node-validator/0.1 (mailto:juliankennon@gmail.com)` (Crossref polite-pool requirement)
- 100ms throttle between requests
- 3-attempt retry with exponential backoff for 5xx
- The plan's old `fetchOpenAlexByDoi` was DEAD CODE — make sure your fallback path is actually called on Crossref 404. Test with `10.48550/arXiv.2303.11366` (Reflexion paper) — Crossref returns 404; OpenAlex resolves it.

CRITICAL — check-affiliate-links.ts:
- Detect: tag, ref, aff, linkCode, via, irclickid, clickid, cjevent, awc, afftrack, sscid, ascsubtag, linkId, pf_rd_*, pd_rd_*, mc_cid, mc_eid
- Reject shortener domains: bit.ly, lnkd.in, t.co, buff.ly (or HEAD-unwrap them first; rejecting outright is acceptable for v1)

CRITICAL — check-pattern-links.ts:
- Per-host concurrency = 1 with 1–3s delay between requests
- HEAD requests rejected by Springer/IEEE/JSTOR (405/403/501) — fall back to GET with `Range: bytes=0-0`
- Same User-Agent as validate-references.ts

CRITICAL — .github/workflows/check-pattern-links.yml:
- permissions: { contents: read, issues: write }
- Use pnpm/action-setup@v4 + actions/setup-node@v4 (node 22, cache: pnpm) + `pnpm install --frozen-lockfile` + `pnpm exec tsx scripts/check-pattern-links.ts`
- De-duplicate issues: search-or-create logic (don't open dozens of identical issues during outages)
- Labels: ['agentic-design-patterns', 'broken-link']

CRITICAL — lint-changelog.ts:
- `git diff --name-only origin/main...HEAD` to detect modified pattern files
- Every touched patterns/<slug>.ts must have a CHANGELOG entry dated >= today
- Handle both active AND archived patterns

GOTCHAS:
- Use `pnpm`, NOT `npm`. Workflow uses pnpm-action-setup@v4.
- Today's date 2026-05-03.
- Working dir /Users/jul/repos/detached-node.
- Branch feat/agentic-design-patterns.
- All scripts invoked via `tsx scripts/<name>.ts` — never `node` or `npx tsx`.
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #154 — verify EVERY acceptance criterion.

  gh -R julianken/detached-node issue view 154
  gh -R julianken/detached-node pr view <PR_URL>

Run these against the PR branch:
- `pnpm lint` — must execute eslint + all four guardrail scripts and pass against the empty stub set
- Test with REAL fixture: a stubbed Reference with `doi: '10.48550/arXiv.2303.11366'` and `type: 'paper'` — validate-references must call OpenAlex fallback and pass
- Test with negative fixture: `doi: '10.48550/arXiv.9999.99999'` — exit code 1
- Test with negative fixture: a Reference url containing `?tag=foo-20` — check-affiliate-links exits 1
- Test typecheck-sketches.ts with a snippet using top-level await + no exports — must inject `export {}` and pass
- Verify tsc flags include `--types node`
- User-Agent string includes `mailto:juliankennon@gmail.com`
- references.lock.json is read first (cache short-circuits)
- check-pattern-overlap.ts is NOT in `lint:adp` (manual only)
- check-pattern-links.ts is NOT in `lint:adp` (workflow only)
- Workflow YAML has `permissions: { contents: read, issues: write }`
- All scripts invoked as `tsx scripts/<name>.ts`

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR for issue #154.

Focus:
- Error handling: every fetch wrapped in try/catch with retry; exits with informative messages on failure (not silent)
- Throttling: 100ms between Crossref/OpenAlex requests respected; per-host concurrency in check-pattern-links is correctly limited (use a Map<host, Promise> queue or a small library; do not parallelize per-host)
- Logging: scripts emit structured progress (e.g. "✓ Validated 12/12 paper references" or "✗ DOI 10.x/y not found in Crossref or OpenAlex")
- Type safety: no `any`; fetch responses typed via Zod or hand-written interfaces; surname extraction handles edge cases (single-author papers, no comma)
- Cache logic: lock file read AND written atomically (no partial writes); cache invalidation on title mismatch
- Workflow YAML: lints clean (`actionlint .github/workflows/check-pattern-links.yml` if available); pnpm action versions pinned; node version pinned to 22; uses `pnpm install --frozen-lockfile`
- No hardcoded secrets; no API keys (Crossref/OpenAlex are public)
- Code conventions: 2-space indent, double quotes, named function exports, JSDoc on public functions

Report: APPROVED / CHANGES_REQUESTED.
```

---

## Task T4 — Routes + sitemap + OG images (Issue #157)

**Issue:** https://github.com/julianken/detached-node/issues/157
**Dispatch model:** opus (Next 16 async params, dynamic vs force-static decision, sitemap coordination, schema discriminators)
**Estimated complexity:** M
**Depends on:** T1 (helpers), T2-B (schema generators), T2-C (components)
**Parallel-safe with:** none (single-PR boundary on sitemap.ts)

**Implementer subagent prompt:**

```
You are implementing GitHub issue #157 as part of the ADP Phase 1 build.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first — it contains a CORE DECISION you must make:

  gh -R julianken/detached-node issue view 157

DECISION (default Option A unless told otherwise):
- Option A (RECOMMENDED): Drop `force-static`, use `revalidate = 3600` (ISR). Server filters `?layer=` URLs correctly. State your choice + rationale in the PR description (acceptance criterion #1).
- Option B: Keep `force-static`, drop searchParams reading. Client-only filtering. Promise of server-side filtering broken.

If unsure, dispatch as Option A.

ALSO CRITICAL — Coordination with #150:
The dispatching engineer marked #150 status during pre-flight. Look it up:

  gh -R julianken/detached-node issue view 150
  gh -R julianken/detached-node pr list --state merged --search "remove failure-modes"

- If #150 IS merged: just add 25 ADP URLs to sitemap.ts.
- If #150 is NOT merged: also remove the /failure-modes entry in this PR. Call this out in the PR description.

Workflow:
1. Read the issue body completely.
2. Read the precedent files first:
   - src/app/posts/[slug]/page.tsx — Next 16 async params pattern (`searchParams: Promise<{...}>`)
   - src/app/(payload)/admin/[[...segments]]/page.tsx — async searchParams precedent
   - src/app/(frontend)/failure-modes/page.tsx — Article schema + sitemap precedent
3. Create routes:
   - src/app/(frontend)/agentic-design-patterns/page.tsx (hub)
   - src/app/(frontend)/agentic-design-patterns/[slug]/page.tsx (satellite — generateStaticParams + dynamicParams: false; calls notFound() for unknown slugs)
   - src/app/(frontend)/agentic-design-patterns/changelog/page.tsx
   - src/app/(frontend)/agentic-design-patterns/opengraph-image.tsx (hub OG; NO `runtime = 'edge'`)
   - src/app/(frontend)/agentic-design-patterns/[slug]/opengraph-image.tsx (per-pattern OG)
4. Hub Article schema: `@id = ${PAGE_URL}#hub-article` (NOT #article — avoids future BlogPosting collision)
5. Satellite uses generatePatternArticleSchema from T2-B (#155).
6. Modify src/app/sitemap.ts: add hub + changelog + 23 satellite URLs (= 25 entries with the agentic-design-patterns prefix).
7. Modify src/lib/site-config.ts: add 4 keywords ("agentic design patterns", "AI agent design patterns", "agent design patterns", "LLM agent reference").
8. **Create `<HubFilterableContent>` wrapper** at `src/components/agentic-patterns/HubFilterableContent.tsx` (`'use client'`). This component owns the filter-state coordination that #156's HubSearchBar deliberately does NOT include: it composes HubSearchBar + HubGrid, holds the search-query state, debounces, and passes a filtered `Pattern[]` down to HubGrid. Per the epic's "Implicit ownership" section, this wrapper is owned by THIS issue (#157) — #156 explicitly defers it. The hub page (`page.tsx`) renders this wrapper as the main content.
   - Spec-reviewer for this task MUST verify: `HubFilterableContent.tsx` exists with `'use client'`; composes HubSearchBar + HubGrid; owns filter state; the hub `page.tsx` renders it. Without this, T4 implementer can pass review by skipping the wrapper entirely.
   - Performance note: hub now ships TWO client components (HubSearchBar nested inside HubFilterableContent). The old "no client JS shipped from hub except HubSearchBar" line in the perf review is stale.
9. Reserved-slug guard: write a unit test asserting `'changelog' ∉ PATTERNS.map(p => p.slug)`. Static segments override dynamic routes; a pattern with that slug would silently shadow the changelog page.
10. Verify routes:
    - `pnpm dev` boots; hub renders with title
    - `/agentic-design-patterns/reflexion` returns 200 (stub OK at this point)
    - `/agentic-design-patterns/not-a-real-slug` returns 404 (notFound() actually rendered, not blank)
    - `/agentic-design-patterns/changelog` resolves to changelog/page.tsx (NOT [slug]/page.tsx)
11. Commit per route; open PR against feat/agentic-design-patterns.

GOTCHAS:
- Use `pnpm`, NOT `npm`.
- Today's date 2026-05-03.
- Working dir /Users/jul/repos/detached-node.
- Branch feat/agentic-design-patterns.
- Next 16 params/searchParams MUST be `Promise<>` typed and awaited.
- DO NOT add `runtime = 'edge'` to OG routes (next/og default is fine; edge breaks build with custom fonts).
- next/og fonts: accept the generic mono fallback for v1 — flag in PR description as polish follow-up.
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #157.

  gh -R julianken/detached-node issue view 157
  gh -R julianken/detached-node pr view <PR_URL>

Verify each acceptance criterion (12 total):
1. PR description states Option A or B with rationale
2. All routes use `Promise<>`-typed params/searchParams (grep for the pattern)
3. Satellite has `dynamicParams: false`; unknown slugs return 404 (curl test)
4. `pnpm dev` boots; hub title appears
5. /agentic-design-patterns/reflexion returns 200
6. /agentic-design-patterns/not-a-real-slug returns 404 (page renders the notFound UI, not blank/error)
7. /agentic-design-patterns/changelog resolves to changelog/page.tsx (route inspection — NOT [slug])
8. Sitemap contains exactly 25 agentic-design-patterns URLs (count with grep)
9. OG routes build without error (`pnpm next build`)
10. Hub uses `#hub-article` @id; satellite uses `#pattern-article` @id (via T2-B helper)
11. No `runtime = 'edge'` on OG routes (grep)
12. Test for changelog slug exclusion exists and passes
13. PR description states #150 coordination decision (merged-after-150 OR also-removes-failure-modes)

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR for issue #157.

Focus:
- Async params: every page uses `await params` and `await searchParams` correctly; no synchronous unwrapping
- Schema embedding: SchemaScript (or equivalent) component used per existing precedent in failure-modes/page.tsx
- Metadata: per-page unique meta description; canonical URL set per page (no trailing slashes)
- Error handling: notFound() called for invalid satellite slugs; no try/catch around it (notFound is a Next-level signal, not an error)
- Code conventions: matches src/app/(frontend)/failure-modes/page.tsx structure (export const dynamic / revalidate / metadata, then component)
- OG image: text fits within bounds; readable at 1200x630; uses next/og <div> tree (not raw <img>)
- Sitemap: priorities reasonable (hub 0.95, satellites 0.8, changelog 0.5); lastModified populated
- Performance: no client JS shipped from hub except HubSearchBar; check next build output bundle sizes

Report: APPROVED / CHANGES_REQUESTED with file:line references.
```

---

## Task T5 — Reflexion exemplar (Issue #158)

**Issue:** https://github.com/julianken/detached-node/issues/158
**Dispatch model:** opus (editorial voice, paper-citation rigor, no-paraphrase rule, mermaid design)
**Estimated complexity:** M
**Depends on:** T1, T2-A, T3 (CRITICAL — T3's OpenAlex fallback is what makes this lint-pass), T2-B, T2-C, T4
**Parallel-safe with:** none

**Implementer subagent prompt:**

```
You are implementing GitHub issue #158 — the Reflexion exemplar that becomes the editorial-voice anchor for Phase 2's parallel subagents.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first — it contains the voice rubric and exact citation list:

  gh -R julianken/detached-node issue view 158

CRITICAL DEPENDENCY: T3 (#154) MUST have shipped the OpenAlex fallback in scripts/validate-references.ts before you start. Three of the six required references for Reflexion are arXiv preprints whose DOIs return 404 from Crossref:
- 10.48550/arXiv.2303.11366 (Shinn et al. — Reflexion)
- 10.48550/arXiv.2303.17651 (Madaan et al. — Self-Refine)
- 10.48550/arXiv.2305.11738 (Gou et al. — CRITIC)

Verify the fallback works before authoring:

  cd /Users/jul/repos/detached-node
  grep -n "openalex\|OpenAlex" scripts/validate-references.ts

Expected: at least one match showing OpenAlex fallback wired in. If zero matches, T3 has a regression — STOP and report BLOCKED. (T3's spec-reviewer already enforced this; this grep is the redundant double-check.)

Workflow:
1. Read the issue body completely.
2. Read the source materials BEFORE writing any prose (no paraphrasing — read, close, write):
   - docs/agentic-design-patterns/Agentic_Design_Patterns.pdf chapter 4 (Reflection)
   - https://arxiv.org/abs/2303.11366 (Reflexion abstract)
   - https://arxiv.org/abs/2303.17651 (Self-Refine abstract)
   - https://arxiv.org/abs/2305.11738 (CRITIC abstract)
   - https://www.anthropic.com/engineering/building-effective-agents (Reflection section)
   - https://arxiv.org/abs/2308.03688 (AgentBench abstract)
3. Replace the stub at src/data/agentic-design-patterns/patterns/reflexion.ts with the full Pattern object. Required fields per the issue:
   - bodySummary: 200–320 words across 3 paragraphs, third-person observational, terse-diagnostic tone
   - whenToUse: 3–5 bullets, second-person imperative ("Use when...", "Apply where...")
   - whenNotToUse: 2–3 bullets including the same-model sycophancy gotcha (cite CRITIC)
   - realWorldExamples: 3 bullets, each citing a public observable system. CORRECT URL: `https://www.cognition.ai/blog/introducing-devin` (NOT cognition.ai/blog/devin — the plan had it wrong)
   - readerGotcha: cite CRITIC paper for same-model sycophancy
   - implementationSketch: ~15 lines using @ai-sdk/openai (NOT LangChain); compiles via typecheck-sketches.ts; INCLUDE `export {}` at end
   - mermaidSource: original diagram, labeled boxes only (no icon shortcodes — securityLevel: 'strict' rejects them)
   - mermaidAlt: complete sentence describing the diagram
   - references: exactly 6 entries (Shinn 2023, Madaan 2023, Gou 2023, Anthropic 2024 essay, Gulli 2026 ch.4, LangGraph reflection workflow docs)
   - relatedSlugs: ['evaluator-optimizer', 'memory-management', 'evaluation-llm-as-judge']
   - alternativeNames: ['Verbal RL', 'Self-Reflection']
   - secondaryLayerId: 'state' (manual addition AFTER the stub — the layerId stays 'topology', secondaryLayerId triggers the cross-link badge in the UI)
   - dateModified: 2026-05-03
   - lastChangeNote: 'Initial authoring as the Phase-1 exemplar.'
4. **CHANGELOG handling — bump the existing T1 seed entry's date, do NOT add a new entry.** Per issue #158, no new entry needed. Per issue #152, T1 seeded the CHANGELOG with: `{ date: '2026-05-02', slug: 'reflexion', type: 'added', note: 'Catalog scaffold launched; Reflexion exemplar shipped in #158.' }`. T5 must bump that entry's date to today (`new Date().toISOString().slice(0,10)`) so `lint-changelog.ts`'s "latest CHANGELOG date == latest pattern dateModified" check passes after T5 sets `pattern.dateModified` to today. **Do not append a new entry** (would duplicate slug+type) and **do not change the note text** (#152 mandates exact wording).
5. Verify all source URLs return 200 manually:
   curl -I https://www.cognition.ai/blog/introducing-devin
   curl -I https://arxiv.org/abs/2303.11366
   (etc. for all 6 references and 3 realWorldExamples sourceUrls)
6. Run `pnpm lint` — it must pass:
   - typecheck-sketches: implementationSketch compiles
   - validate-references: all 6 references resolve (3 via OpenAlex fallback)
   - check-affiliate-links: no affiliate query params
   - lint-changelog: matching entry exists
7. Run `pnpm dev` and visually confirm /agentic-design-patterns/reflexion renders all 8 slots and the mermaid diagram displays correctly.
8. Commit; open PR against feat/agentic-design-patterns.

GOTCHAS:
- Use `pnpm`, NOT `npm`.
- Today's date 2026-05-03. Per issue #158 AC: use `new Date().toISOString().slice(0,10)` programmatically (not a hardcoded string) so the field stays accurate when the file is later edited.
- Working dir /Users/jul/repos/detached-node.
- Branch feat/agentic-design-patterns.
- NO PARAPHRASING. Read the abstract, close the tab, write in your own voice. Style guide will check this in T6.
- Devin URL fix: https://www.cognition.ai/blog/introducing-devin (NOT /blog/devin)
- secondaryLayerId is 'state' — manual addition, not generated by stub script
- Mermaid: labeled boxes only, no `fa:fa-cog`-style icon shortcodes; securityLevel 'strict' rejects them
- arXiv DOIs require T3's OpenAlex fallback. If validate-references fails on one of the three Reflexion-related DOIs, T3 has a regression — STOP and report BLOCKED.
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #158 — this is the editorial template, so be strict.

  gh -R julianken/detached-node issue view 158
  gh -R julianken/detached-node pr view <PR_URL>

Verify each acceptance criterion:
- `pnpm lint` passes (typecheck, validate-references via OpenAlex, affiliate-links, changelog)
- bodySummary word count is 200–320 (count it)
- bodySummary is exactly 3 paragraphs in third-person observational tone
- whenToUse: 3–5 bullets, second-person imperative phrasing
- whenNotToUse: 2–3 bullets, includes same-model sycophancy and cites CRITIC
- All 3 realWorldExamples URLs return 200 (curl -I)
- Devin URL is /blog/introducing-devin (NOT /blog/devin)
- references: exactly 6 entries (Shinn, Madaan, Gou, Anthropic, Gulli ch.4, LangGraph)
- All 3 paper DOIs resolve via OpenAlex (run validate-references in isolation)
- relatedSlugs: ['evaluator-optimizer', 'memory-management', 'evaluation-llm-as-judge']
- alternativeNames: ['Verbal RL', 'Self-Reflection']
- secondaryLayerId: 'state'
- dateModified is computed via `new Date().toISOString().slice(0,10)` (programmatic — not hardcoded; current value will be today's date when the PR opens)
- lastChangeNote: 'Initial authoring as the Phase-1 exemplar.'
- mermaidSource renders without error in `pnpm dev`
- mermaidAlt is a complete sentence
- implementationSketch uses @ai-sdk/openai (NOT LangChain), includes `export {}`, compiles
- **CHANGELOG: existing T1 seed entry's date was bumped to today; note text unchanged ('Catalog scaffold launched; Reflexion exemplar shipped in #158.'); NO new entry was added** (verify by `wc -l` on changelog.ts before/after — should be unchanged line count for the array)
- **`lint-changelog.ts` passes** (the bump above keeps "latest CHANGELOG date == latest pattern dateModified" green)

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR for issue #158.

Focus areas (this is editorial content, so reviewing differs from code review):
- Voice consistency: every bullet in whenToUse starts with an imperative verb; every bullet in whenNotToUse starts with a noun phrase or conditional ("when...", "if..."); bodySummary stays third-person throughout (no "you" / "we")
- Citation discipline: each reference has authors+year+venue+url+type (no missing fields); paper references include DOI; book reference (Gulli) includes pages: [N, M]
- No prose paraphrased: spot-check 2–3 sentences of bodySummary against the cited abstracts; paraphrase = "different words, same sentence structure" — flag if too close
- Implementation sketch: idiomatic AI SDK usage; the example demonstrates the pattern (one Reflexion loop with a critic and an actor); not toy / not over-elaborate
- Mermaid: nodes are labeled (rectangles or stadium shapes, not bare circles); arrows annotated; flow is left-to-right or top-to-bottom (consistent direction)
- No fabricated URLs: every URL in references[].url, realWorldExamples[].sourceUrl, readerGotcha.sourceUrl is real and resolvable
- TypeScript correctness: the Pattern object satisfies the Pattern type from T1 (no missing required fields); literal types where appropriate (layerId: 'topology' not string)

Report: APPROVED / CHANGES_REQUESTED.
```

---

## Task T6 — E2E tests + style guide (Issue #159)

**Issue:** https://github.com/julianken/detached-node/issues/159
**Dispatch model:** sonnet (well-specified test selectors and style-guide structure)
**Estimated complexity:** M
**Depends on:** T4 (routes exist), T5 (Reflexion content exists)
**Parallel-safe with:** none

**Implementer subagent prompt:**

```
You are implementing GitHub issue #159 — Playwright E2E tests + the editorial style guide.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first — it specifies exact test selectors and the satellite anatomy:

  gh -R julianken/detached-node issue view 159

Workflow:
1. Read the issue body completely. Note: the satellite has 7 <h2>-headed sections + 1 Overview prose with no <h2> = 8 anatomy slots. Tests assert exactly 7 <h2>s.
2. Create tests/e2e/agentic-design-patterns/_satellite-fixtures.ts exporting (object shape — matches issue #159 verbatim, used as Playwright getByRole options):
   export const SATELLITE_H2_HEADINGS = [
     { level: 2, name: 'When to use' },
     { level: 2, name: 'When NOT to use' },
     { level: 2, name: 'Implementation sketch' },
     { level: 2, name: 'In the wild' },
     { level: 2, name: 'Reader gotcha' },
     { level: 2, name: 'Related patterns' },
     { level: 2, name: 'References' },
   ] as const  // 7 entries
3. Create tests/e2e/agentic-design-patterns/hub.spec.ts (3 tests):
   a. Title + 5 layer sections render with dynamic counts using regex /\d+/
   b. `/`-keypress focuses the search bar
   c. ?layer=quality URL filters the grid (only quality-layer cards visible)
4. Create tests/e2e/agentic-design-patterns/satellite.spec.ts (3 tests):
   a. Reflexion renders 1 <h1> + 7 <h2>s (matching SATELLITE_H2_HEADINGS) + Overview prose + Mermaid SVG
   b. Article schema emits with citation array of length ≥ 3 (use page.locator('script[type="application/ld+json"]').allTextContents() — iterate, do NOT .first())
   c. Unknown slug returns 404 status AND no fallback content (assert both — status 404 alone is necessary but insufficient)
5. Selector rules (mandatory):
   - Use getByRole('heading', { level: 2, name: 'When to use' }) NOT page.locator('h2:has-text("When to use")')
   - Mermaid selector exactly: '.mermaid-figure svg[id^="mermaid-"][role*="graphics-document"]'
   - Iterate all schema script tags via .allTextContents(), parse each, find the Article one (NOT .first())
6. EVERY test file includes the comment at the top:
   // No fixture import — these routes are public and DB-independent
7. Create docs/superpowers/specs/agentic-design-patterns-style-guide.md with:
   - Voice rules (terse, diagnostic; second-person imperative for whenToUse; third-person observational for prose)
   - 8 editorial principles (transcribe from spec § Editorial principles)
   - Paraphrase rules: 1 worked GOOD example + 1 worked BAD example, both pulled from a real source (use the Reflexion abstract from arxiv.org/abs/2303.11366)
   - Mermaid security rules (labeled boxes only; no icon shortcodes; securityLevel: 'strict')
   - References formatting standard (with the visual table example from spec)
   - STYLE_PASS checklist (transcribe from spec § Sub-issue template)
8. Run `pnpm test:e2e -- tests/e2e/agentic-design-patterns/` — all 6 tests must pass.
9. Commit per file (test-by-test); open PR against feat/agentic-design-patterns.

GOTCHAS:
- Use `pnpm`, NOT `npm`.
- Today's date 2026-05-03.
- Working dir /Users/jul/repos/detached-node.
- Branch feat/agentic-design-patterns.
- 7 <h2>s, NOT 8 — Overview is prose without an <h2> per the issue.
- Mermaid selector MUST include `[role*="graphics-document"]` (matches existing Playwright precedent in the repo).
- Schema iteration: NEVER .first() — there will be Article + BreadcrumbList + maybe more JSON-LD scripts; iterate and find by @type.
- 404 test asserts BOTH status code AND absence of fallback content (e.g., the Reflexion title must NOT appear).
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #159.

  gh -R julianken/detached-node issue view 159
  gh -R julianken/detached-node pr view <PR_URL>

Verify each acceptance criterion:
- All 6 tests pass: run `pnpm test:e2e -- tests/e2e/agentic-design-patterns/` on PR branch
- Hub uses `\d+` regex for layer-count assertions (not hardcoded numbers)
- 404 test asserts status AND missing fallback content
- _satellite-fixtures.ts exports SATELLITE_H2_HEADINGS with EXACTLY 7 entries
- All 3 test files include the "// No fixture import" comment at the top
- Style guide has worked GOOD and BAD paraphrase examples from a real source
- Mermaid selector exactly matches: `.mermaid-figure svg[id^="mermaid-"][role*="graphics-document"]`
- Schema iteration uses .allTextContents() (grep test files; flag any .first() on script[type="application/ld+json"])
- Style guide includes STYLE_PASS checklist

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR for issue #159.

Focus:
- Test quality: each test has a single clear assertion focus (3 hub tests test 3 different things, not overlapping); selectors are role-based not CSS-class-based
- Test independence: each test re-navigates (no shared state across tests)
- Style guide quality: examples are concrete (cite real sources by URL); rules are checkable (not vague "be clear")
- Style guide structure: matches docs/superpowers/specs/ markdown conventions (existing files in that directory)
- No flakiness: tests don't rely on timing (use Playwright auto-waiting via expect/locator); search debounce is awaited explicitly if tested
- DRY: fixtures actually reused between tests (not duplicated inline)

Report: APPROVED / CHANGES_REQUESTED.
```

---

## Task T7 — Polish + nav + verification (Issue #160)

**Issue:** https://github.com/julianken/detached-node/issues/160
**Dispatch model:** sonnet (one nav edit + verification checklist)
**Estimated complexity:** S
**Depends on:** T1–T6 all merged into feat/agentic-design-patterns
**Parallel-safe with:** none

**Implementer subagent prompt:**

```
You are implementing GitHub issue #160 — the launch-readiness verification.

Working dir: /Users/jul/repos/detached-node
Branch: feat/agentic-design-patterns

Read the issue first:

  gh -R julianken/detached-node issue view 160

Workflow:
1. Confirm all of T1–T6 are merged into feat/agentic-design-patterns. Spot-check by:
   - `pnpm next build` succeeds
   - Hub renders 23 cards in 5 layers
   - Reflexion satellite renders 8 anatomy elements + 6 references
2. Edit src/app/(frontend)/layout.tsx around lines 102–104. Add between Posts and About:

   <Link className="hover:text-accent py-2 transition-colors focus-ring" href="/agentic-design-patterns">
     Patterns
   </Link>

3. Verification suite (run all on PR branch):
   - `pnpm lint` (eslint + ADP guardrails)
   - `pnpm test:unit`
   - `pnpm test:e2e`
   - `pnpm next build`
4. Lighthouse audit on Vercel preview (mobile profile) for hub + Reflexion satellite. Targets:
   - Performance ≥ 90
   - Accessibility ≥ 95
   - Best Practices ≥ 95
   - SEO ≥ 95
   Minor misses (1–2 points) → open follow-up issues, do NOT block merge.
5. Schema validation via https://validator.schema.org/ for hub URL and Reflexion URL on the preview deployment:
   - Hub Article schema validates
   - Satellite Article schema validates with citation array present
6. Walk the Pre-Launch Checklist from spec § lines 520–544. Tick each item in PR description.
7. Commit the nav-link change (one commit) and the PR description carries the verification log.
8. Open PR against feat/agentic-design-patterns (this is the LAST PR before the integration PR to main).

DO NOT in this task:
- Create the Phase 2 epic. That's T8 (post-merge) → opens issue #160b.
- Hand-design OG images per pattern (deferred).
- Add full-text pattern body search (out of scope).

GOTCHAS:
- Use `pnpm`, NOT `npm`.
- Today's date 2026-05-03.
- Working dir /Users/jul/repos/detached-node.
- Branch feat/agentic-design-patterns.
- Nav link position: between Posts and About — the existing layout has those two; insert between them, do NOT append at the end.
- Lighthouse: run on Vercel preview, NOT localhost. Localhost numbers misrepresent because no CDN/edge caching.
```

**Spec-reviewer subagent prompt:**

```
Review the PR for issue #160.

  gh -R julianken/detached-node issue view 160
  gh -R julianken/detached-node pr view <PR_URL>

Verify each acceptance criterion:
- Nav link "Patterns" appears between Posts and About in src/app/(frontend)/layout.tsx
- `pnpm lint` passes
- `pnpm test:unit` passes
- `pnpm test:e2e` passes
- `pnpm next build` succeeds
- Lighthouse scores on Vercel preview meet thresholds (PR description has screenshot or numbers)
- Schema validator passes for hub + satellite (PR description has links to validator results or screenshots)
- Pre-launch checklist items 1–23 from spec are ticked in the PR description (or noted as N/A with reason)

Report: APPROVED / CHANGES_REQUESTED.
```

**Code-quality-reviewer subagent prompt:**

```
Review the PR for issue #160.

Focus:
- The nav-link diff is exactly the one shown in the issue (className, href, label)
- No other unrelated changes in layout.tsx
- The PR description's verification log is concrete (numbers, links to Lighthouse runs, validator screenshots), not assertions like "all good"
- Follow-up issues opened for any Lighthouse miss (link in PR description)

Report: APPROVED / CHANGES_REQUESTED.
```

---

## Task T8 — Open Phase 2 epic (post-merge follow-up #160b)

**Type:** Manual GitHub-only work, NOT a subagent dispatch
**Depends on:** T7 PR merged into feat/agentic-design-patterns AND feat/agentic-design-patterns merged into main
**When:** Immediately after the integration PR merges to main

### Steps (manual, by the dispatching engineer)

1. Open the integration PR `feat/agentic-design-patterns → main`. After all checks pass, comment `@mergifyio queue` per CLAUDE.md.
2. After merge, open issue **#160b**: `[Epic] Author 22 remaining ADP satellites (Phase 2)`. Body should include:
   - Link to the merged Phase 1 PR
   - Link to the Reflexion exemplar at /agentic-design-patterns/reflexion
   - Link to the style guide (docs/superpowers/specs/agentic-design-patterns-style-guide.md)
   - Link to the committed PDF at docs/agentic-design-patterns/Agentic_Design_Patterns.pdf
   - The 22 remaining slugs as a checklist
   - Reference to the per-pattern sub-issue template from spec § Sub-issue template
3. Open 22 sub-issues under #160b, one per slug, using the spec's sub-issue template. The implementation script that scaffolded T1's stubs can be repurposed to scaffold these issues via `gh issue create` in a loop.
4. Dispatch in waves of 4–5 patterns per the spec § Phase 2 plan.

---

## Critical gotchas summary (recap — already in every implementer prompt)

| # | Gotcha | Where it bites |
|---|--------|---------------|
| 1 | `pnpm`, NOT `npm` | Every task |
| 2 | Tests at `tests/unit/...`, NOT `tests/data/...` or `tests/lib/...` | T1, T2-B, T2-C |
| 3 | Today is 2026-05-03 (machine clock) | T1, T5 |
| 4 | Don't touch Phase 0 spike artifacts at `docs/agentic-design-patterns/spike/` | All tasks |
| 5 | typecheck-sketches: tsc flags include `--types node`; inject `export {}` | T3 |
| 6 | validate-references: OpenAlex fallback for arXiv DOIs (Crossref returns 404) | T3, T5 |
| 7 | Devin URL is `/blog/introducing-devin` (not `/blog/devin`) | T5 |
| 8 | Mermaid: labeled boxes only, no icon shortcodes (securityLevel: 'strict') | T5 |
| 9 | Phase 2 epic creation is post-merge as `#160b`, NOT in T7 | T7, T8 |
| 10 | Branch is `feat/agentic-design-patterns`; do NOT push `main` directly | All tasks |
| 11 | OG routes: NO `runtime = 'edge'` | T4 |
| 12 | HubSearchBar: NO callback props in T2-C; wiring lives in T4 | T2-C, T4 |
| 13 | PatternCard heading className must match PostCard exactly | T2-C |
| 14 | Reserved slug guard: `'changelog'` must NOT be a pattern slug | T1, T4 |
| 15 | Hub schema uses `#hub-article`; satellite uses `#pattern-article` | T4, T2-B |

---

## Self-review (spec-coverage check, per writing-plans skill)

Walked through spec § (the v1 spec at `docs/superpowers/specs/2026-05-02-agentic-design-patterns-reference-design.md`) and each issue body, confirming requirements map to tasks:

- **Spec § Editorial principles 1–8** → fully covered:
  - 1 (cite the actual sources): T5 (6 references in Reflexion); enforced by T3 validate-references on every PR
  - 2 (references are validated): T3 with OpenAlex fallback (gap from old plan filled here)
  - 3 (original prose only): T6 style guide with worked good/bad examples; T3 has check-pattern-overlap.ts as manual tool
  - 4 (original diagrams only): T5 mermaid spec; T6 style guide encodes the rule
  - 5 (no affiliate tags): T3 check-affiliate-links.ts with expanded parameter list (gap from old plan filled here)
  - 6 (page author named): T2-B schema includes AUTHOR_CONFIG; satellite footer in T2-C PatternBody
  - 7 (living catalog): T1 changelog.ts + T1 helpers + T2-C LivingCatalogBadge + T3 lint-changelog.ts
  - 8 (sketches must compile where TS SDK exists): T3 typecheck-sketches.ts with sdkAvailability awareness; T5 Reflexion uses @ai-sdk/openai
- **Spec § Architecture / Data model** → T1 (types.ts, layers.ts, index.ts, 23 stubs)
- **Spec § Component inventory** → T2-C (10 components + pattern-search) + T2-B (schema utilities)
- **Spec § Hub + Satellite page composition** → T4 (routes) + T2-C (components composing them)
- **Spec § Schema.org / SEO infrastructure** → T2-B (helpers) + T4 (route integration + sitemap + OG)
- **Spec § Cross-cutting concerns (a11y, performance, mobile, search)** → T2-C (components) + T6 (E2E asserts heading hierarchy + 404 behavior)
- **Spec § Build sequence Phase 1** → T1–T7
- **Spec § Living catalog upkeep** → T1 (changelog.ts, references.lock.json) + T3 (lint-changelog.ts)
- **Spec § Testing strategy** → T1 (unit tests for helpers) + T2-B (schema tests) + T2-C (pattern-search tests) + T6 (E2E)
- **Spec § Pre-launch checklist** → T7
- **Spec § Phase 2 (parallel agentic dispatch)** → out of scope here; T8 opens #160b

**Gaps found vs. old plan, now filled in v2:**
- Old plan's `validate-references.ts` had dead OpenAlex code; T3 prompt explicitly calls out the arXiv 404 issue and verifies the fallback path with `10.48550/arXiv.2303.11366`.
- Old plan placed tests at `tests/data/...` and `tests/lib/...`; v2 uses `tests/unit/...` per actual vitest config.
- Old plan didn't surface the #150 sitemap coordination; v2 pre-flight PF.3 + T4 prompt handle it explicitly.
- Old plan used `npm` throughout; v2 uses `pnpm` everywhere (lockfile risk noted).
- Old plan didn't have the `#hub-article` vs `#pattern-article` discriminator distinction; v2 T4 + T2-B prompts both reference it.
- Old plan didn't surface the HubSearchBar no-callback design; v2 T2-C and T4 both call it out.
- Old plan didn't pre-empt the Devin URL typo; v2 T5 explicitly fixes it.

**Out of scope for this plan (deliberate):**
- 22 remaining pattern satellites (Phase 2; epic #160b post-merge)
- Hand-designed OG images (top-5 polish, deferred)
- Full-text pattern body search (deferred)
- "Browse by problem" navigation (deferred)
- CMS data migration (deferred indefinitely)
- Multi-language UI (deferred)

---

## Output handoff

Plan saved to: `docs/superpowers/plans/2026-05-03-agentic-design-patterns-reference-v2.md`

Execute via `superpowers:subagent-driven-development`:

1. Run pre-flight (PF.1 → PF.4) once.
2. Dispatch T1; await PR merge into `feat/agentic-design-patterns`.
3. After T1's typecheck-script prereq commit lands, dispatch T2-A in parallel; once T1 fully merges, also dispatch T2-B and T2-C in parallel.
4. After T1 + T2-A merged: dispatch T3.
5. After T1 + T2-B + T2-C merged: dispatch T4.
6. After T3 merged AND T4 merged: dispatch T5.
7. After T4 + T5 merged: dispatch T6.
8. After T6 merged: dispatch T7.
9. Open integration PR `feat/agentic-design-patterns → main`; comment `@mergifyio queue`.
10. After merge: execute T8 (open #160b + 22 sub-issues).
