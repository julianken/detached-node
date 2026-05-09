---
name: copy-revision
description: Five-stage revision pipeline for fixing AI-flavored prose on detached-node. Use when revising copy flagged by .analysis/copy-audit.md, or when applying the audit's rubric to any piece of prose on the site. Composes with creative-funnel (for parallel multi-piece work) and uses the prose-critic agent for diagnosis and validation. Loads .analysis/voice-corpus/VOICE.md as cached context.
---

# Copy Revision: Five-Stage Pipeline

A revision pipeline for prose on detached-node.dev. Takes a piece of copy (a sentence, paragraph, or whole field), runs it through Diagnose → Propose → Reconcile → Integrate → Validate, and emits a revised version that scores ≥ 0.75 on the audit rubric.

The pipeline is deliberately staged — single-prompt revision produces noisy output; staged revision lets each step verify before advancing.

```
INPUT (file:line range, audit priority code, or raw prose)
    │
    ▼
Stage 1: DIAGNOSE ────── Dispatch prose-critic agent; receive structured violations + score
    │                     Gate: JSON parses; violations list non-empty
    ▼
Stage 2: PROPOSE ─────── For each violation, generate 3 candidate rewrites grounded in VOICE.md
    │                     Gate: candidates preserve semantic intent
    ▼
Stage 3: RECONCILE ───── Author (or scoring pass) selects one candidate per violation
    │                     Gate: selection logged with rationale
    ▼
Stage 4: INTEGRATE ───── Apply selected rewrites to the source file via Edit
    │                     Gate: build/lint passes; no orphan strings
    ▼
Stage 5: VALIDATE ────── Re-dispatch prose-critic; check weighted score ≥ 0.75
    │                     Gate: pass = done; fail + iter < 3 = loop to Stage 2; fail + iter = 3 = surface for human
    ▼
OUTPUT (revised file + Reflexion log entry)
```

---

## Mandatory context loading

Before invoking any stage, load these in order:

1. **`.analysis/voice-corpus/VOICE.md`** — persona, positive exemplars, negative anti-examples, operational constraints. This is the cached prefix for every revision call.
2. **`.analysis/copy-audit.md`** — the audit input; gives priorities, file:line citations, and the rubric.
3. **`.analysis/voice-corpus/reflexion/`** (if present) — read the 3 most recent per-piece logs to retrieve term commitments and tone notes from prior revisions. Prepend to the propose stage's context.

If `VOICE.md` is missing, stop and surface the error. Do not proceed without voice context.

---

## Stage 1: Diagnose

**Goal:** identify the specific tells in the input.

**Steps:**
1. Resolve the input. Three forms are valid:
   - File:line range (e.g. `src/lib/site-config.ts:13-14`)
   - Audit priority code (e.g. `P1`, `Bucket A`, `Bucket B`)
   - Raw prose pasted in
2. Dispatch the **prose-critic** agent (`subagent_type: "prose-critic"`) with the input. The agent loads VOICE.md and copy-audit.md itself; you do not need to inline them.
3. Parse the agent's JSON response.

**Gate to advance:**
- Response is valid JSON
- `top_violations` array contains at least one entry with severity ≥ 3, OR the weighted score is below 0.75
- If the score is already ≥ 0.75 with no severity-≥3 violations, return EARLY-PASS — no revision needed.

**Output of stage 1:** the structured findings JSON.

---

## Stage 2: Propose

**Goal:** generate candidate rewrites for each violation.

**Steps:**
1. For each violation in the diagnosis, draft 3 candidate rewrites that:
   - Preserve the semantic intent of the original (a sentence about agentic workflows is still about agentic workflows)
   - Replace the offending construction (mirror → flat assertion; matched-pair em-dash → parens or sentence; abstract gesture → named mechanism)
   - Pull voice cues directly from the positive exemplars in VOICE.md — match the rhythm and register of the closest exemplar
2. For each candidate, write a one-line **rationale** stating which exemplar shape it draws from and which violation it resolves.

**Prompt template for the propose call** (use Opus 4.7, extended thinking OFF for this stage — generation, not analysis):

```
Voice corpus is loaded above (VOICE.md). Per-piece Reflexion notes are loaded if applicable.

Original prose:
<verbatim>

Violations to address (from prose-critic):
- {type}: {snippet} — {suggested_direction}
- ...

Generate exactly 3 candidate rewrites. Each must:
- Preserve the original's meaning
- Match the rhythm and register of one of the positive exemplars in VOICE.md
- Resolve all listed violations simultaneously (don't fix one at the cost of another)
- Use contractions where natural
- Avoid the banned vocabulary cluster and mirror constructions

For each candidate, write one line of rationale: which exemplar shape it draws from, which violations it addresses.

Return as JSON: {"candidates": [{"text": "...", "rationale": "..."}, ...]}
```

**Gate to advance:**
- 3 candidates returned
- Each candidate semantically preserves the original (manual or BERTScore check; ≥ 0.85 cosine similarity acceptable as automated proxy)
- Each candidate avoids ALL banned constructions (`grep` check on the candidate text)

If a candidate fails the semantic-preservation check, regenerate that single slot once. If two candidates fail, regenerate the whole batch with a stricter system prompt.

---

## Stage 3: Reconcile

**Goal:** select one candidate to integrate.

**Two paths:**

### 3a. Author-in-the-loop (default for high-stakes pieces — P1, P3, P4, P6)
Present the 3 candidates side-by-side with their rationales. Author picks one (or rejects all and asks for a regeneration with feedback).

### 3b. Automated ranking (default for catalog-scale work — P2 across 23 patterns, Bucket A em-dash sweep)
Dispatch a Sonnet 4.6 judge prompt that ranks the 3 candidates against the voice corpus and returns the top pick with rationale. Use this for high-volume work where author review per item is impractical; the author still reviews the final PR.

**Output of stage 3:** the selected candidate text + a one-line rationale captured for the Reflexion log.

---

## Stage 4: Integrate

**Goal:** apply the selected rewrite to the source file.

**Steps:**
1. Use the Edit tool to replace the original prose with the selected candidate.
2. If the change affects multiple files (e.g., P1's `siteDescription` propagates across `src/lib/site-config.ts` AND `src/lib/schema/config.ts`), apply to all affected files.
3. Run a quick post-edit verification:
   - `grep` for any orphan references to the old phrasing in adjacent code (comments, tests, type definitions)
   - `pnpm lint` and `pnpm tsc --noEmit` if the file is TypeScript

**Gate to advance:**
- Edit succeeded (no patch failure)
- No orphan strings (or any orphans flagged for follow-up)
- Lint/typecheck pass (warnings OK, errors block)

---

## Stage 5: Validate

**Goal:** confirm the revision actually improved the rubric score, and didn't introduce new violations.

**Steps:**
1. Re-dispatch the **prose-critic** agent on the revised file:line range.
2. Compare the new weighted score to the original.
3. Apply the convergence rules:

| Outcome | Action |
|---|---|
| New score ≥ 0.75 AND no new violations introduced | PASS. Proceed to Reflexion log. |
| New score ≥ 0.75 BUT introduces a new violation not in the original | PARTIAL. Surface for author review. |
| New score < 0.75 AND iteration < 3 | LOOP. Return to Stage 2 with the new violation list. |
| New score < 0.75 AND iteration = 3 | STALL. Surface to author with the best attempt; do not commit. |

**Cross-piece consistency check** (only for catalog-scale work):
- If revising a pattern file, also load the last 3 Reflexion logs and check for term drift (e.g., did this file say "routing" while the last 3 said "dispatching"? flag).
- Compute cosine distance between the revised paragraph and the recent corpus; flag if > 0.15.

---

## Reflexion log

After every PASS, write a per-piece log to `.analysis/voice-corpus/reflexion/<slug>.md`. Slug = the file path with slashes converted to dashes (e.g., `src-lib-site-config.md`).

Log structure:

```markdown
# Reflexion log: <file path>

**Revised:** YYYY-MM-DD
**Iterations:** N
**Final weighted score:** 0.XX

## What changed
- Original: <verbatim>
- Revised: <verbatim>

## Violations addressed
- <type>: <how it was resolved>

## Voice notes
- Tone hits: <2-3 things that worked>
- Tone misses: <anything that needed a 2nd pass>

## Cross-piece commitments
- Term choices: <e.g., "routing" not "dispatching">
- Example shapes: <e.g., "Architectural anecdotes preferred over generic diagrams">
- Constraint changes (if any): <e.g., "Allowed one solo em-dash per ~600 words for this voice">
```

These logs feed back into Stage 2 of subsequent revisions (Reflexion pattern: load the 3 most recent before generating new candidates).

---

## When to use this skill

- Any item flagged by `.analysis/copy-audit.md` (P1–P6, Bucket A, Bucket B, Bucket C)
- Any new copy being written for the site that should match the established voice
- Any revision request where the audit rubric should drive the change

## When NOT to use this skill

- Code comments that don't render to the user (use the simpler "edit comment" workflow)
- Reference titles in `references[].title` fields when the title matches the source URL's actual `<title>` (those are out of the author's control; verify, don't revise)
- Anything where the user has explicitly said "rewrite this from scratch" rather than "match my voice" — this skill enforces voice constraints; it doesn't generate fresh content from a blank page

## Composition with other skills

- **`creative-funnel`** — for catalog-scale work (P2 across 23 patterns; Bucket A em-dash sweep), wrap this skill in creative-funnel's parallel pipeline. Each pattern becomes one creative-funnel item; copy-revision runs as the inner workflow per item.
- **`subagent-workflow`** — for whole-PR coordination, use subagent-workflow as the outer harness. The implementer dispatches copy-revision per file; the spec-review and quality-review subagents validate the resulting PR against the audit.

## Verification at PR time

Before opening a PR for any phase of the audit:
1. Run `grep '—' <changed-files>` and confirm the count dropped vs. baseline
2. Run prose-critic on each changed file and confirm weighted scores ≥ 0.75
3. For catalog-scale work, do the cross-pattern skim test: read 3 patterns in a row; if they sound templated, P2 didn't land
4. For high-stakes pieces (P1, P4): read aloud. If it doesn't sound like Julian, redo.
