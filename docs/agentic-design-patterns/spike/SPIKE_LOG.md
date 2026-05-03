# Phase 0 Calibration Spike Log

## MCP sketch
- Time to honest, compiling sketch: ~6 minutes (writing + sandbox install + compile)
- SDK availability: `first-party-ts` (`@modelcontextprotocol/sdk`)
- Notes:
  - Sketch compiled first try once tsc flags included `--types node --skipLibCheck`
  - `req.params.arguments` is typed as `Record<string, unknown> | undefined`; explicit `as string` cast needed
  - **Implication for `scripts/typecheck-sketches.ts`:** include `--types node --skipLibCheck --lib es2022,dom` and inject `export {}` per snippet so top-level await works

## A2A sketch
- Time to honest, compiling sketch: ~7 minutes (writing + 1 iteration + compile)
- SDK availability: `no-sdk` (used `fetch` directly per spec)
- Notes:
  - First compile failed with TS1375 ("top-level await requires module") — **had to add `export {}` at end**
  - This is a recurring snag for snippets without explicit imports/exports — script must inject this automatically

## Decision
- Total spike time: ~13 minutes for both sketches
- Threshold from spec was 45 min/sketch (90 min total)
- Actual: well under (~14% of budget)
- **Phase 2 parallel-subagent plan: PROCEED as spec'd**
- No patterns need to be downgraded to pseudocode based on these two; SDK availability per pattern stays as scaffolded in `scripts/scaffold-pattern-stubs.mjs`

## Lessons applied to `scripts/typecheck-sketches.ts` (Task 1.8)
1. tsc flags must include: `--types node --skipLibCheck --lib es2022,dom --module esnext --target es2022 --moduleResolution bundler --strict`
2. Wrap each snippet with a synthetic `export {}` if not present, so top-level await works
3. Capture both stdout and stderr from tsc — error output goes to both depending on flags
