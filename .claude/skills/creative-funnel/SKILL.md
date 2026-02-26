---
name: creative-funnel
description: Parallel creative production pipeline (N items) with spec review and quality review cycles per item, disk checkpoints, and crash recovery. Produces N creative artifacts + structured documentation.
---

# Creative Funnel: N-Item Parallel Production Pipeline

A parallel creative production pipeline where **N agents each produce one item**, then each item goes through **spec review → revision → quality review → polish** before final collection. The orchestrator manages the pipeline; all work is done by dispatched agents.

The power comes from **parallel creation with sequential quality gates per item** — every item gets the same rigorous review cycle, but all items are produced and reviewed concurrently.

Combines the subagent-workflow's review discipline (spec + quality reviews, no shortcuts) with the funnel skills' checkpoint infrastructure (disk writes, crash recovery, STATUS.md).

```
INPUT (creative brief + list of N items to produce)
    │
    ▼
Phase 0: BRIEF ──────── Define what we're making, list N items, set quality criteria
    │
    ▼
Phase 1: CREATE ─────── N parallel agents, one per item (drafts)
    │
    ▼
Phase 2: SPEC REVIEW ── N parallel reviewers check drafts against brief
    │                    ↓ failed items get revised, re-reviewed (max 2 cycles)
    ▼
Phase 3: QUALITY REVIEW ── N parallel reviewers check craft quality
    │                       ↓ failed items get polished, re-reviewed (max 2 cycles)
    ▼
Phase 4: COLLECT ─────── Final versions assembled + documentation.md written
    │
    ▼
OUTPUT (N creative artifacts + documentation file)
```

---

## Core Principles

1. **One agent = one item** — never assign multiple items to a single agent
2. **Both spec + quality reviews required** — no exceptions, no shortcuts
3. **Revisions stay with the item** — failed reviews produce revision, not a new item
4. **All work via dispatched agents** — orchestrator coordinates, never writes creative content directly
5. **Every agent writes its own output to disk** — orchestrator never relies on return values as primary record
6. **Disk checkpoints between every phase** — crash recovery from artifacts alone
7. **Max 2 review cycles per gate** — if an item fails spec review twice, flag it for human attention rather than looping

---

## When to Use This Skill

Use the creative funnel when:
- You need to produce N independent creative artifacts (articles, docs, configs, templates, etc.)
- Each artifact should meet a defined quality bar before being considered done
- The artifacts are independent enough to be created in parallel
- You want reviewer agents checking work, not just the creator self-reviewing

Do NOT use for:
- A single artifact (just write it directly)
- Artifacts with strong interdependencies (where item 3 depends on item 1's content)
- Pure analysis or investigation (use analysis-funnel)
- Decision-making with execution plans (use decision-funnel)

For items with dependencies, the orchestrator should identify dependency groups in Phase 0 and sequence them: produce independent items first, then produce dependent items in a subsequent wave with the completed items as context.

---

## Input Requirements

Before running the funnel, gather or explicitly ask:

| Field | Description |
|-------|-------------|
| **Creative brief** | What are we making? What's the purpose, audience, and voice? |
| **Item list** | The N items to produce, each with a title and 1-2 sentence description |
| **Source material** | Any reference material the creators should read (files, URLs, prior analysis) |
| **Spec criteria** | What makes an item "correct" — completeness, accuracy, coverage requirements |
| **Quality criteria** | What makes an item "good" — voice, clarity, depth, formatting, originality |
| **Output format** | File format, naming convention, structural requirements per item |
| **Non-goals** | What to explicitly avoid (tone, scope, length constraints) |

If any of these are ambiguous, ask the user before starting Phase 0. Do not assume.

---

# Phase 0 — Define the Creative Brief

**Mode: CONVERGENT. Establish the brief before creating anything.**

1. **Restate the creative task** — what are we making, for whom, and why?
2. **Enumerate the N items** — each with title, slug, 1-2 sentence scope, and any item-specific instructions
3. **Define spec review criteria** — the checklist a spec reviewer will use. These are pass/fail requirements:
   - Does the item cover what the brief specified?
   - Is it factually accurate?
   - Does it meet structural requirements (length, sections, format)?
   - Does it address the stated audience?
4. **Define quality review criteria** — the checklist a quality reviewer will use. These are craft requirements:
   - Is the writing clear and engaging?
   - Does it match the specified voice/tone?
   - Is it genuinely insightful (not generic, not AI slop)?
   - Are there unnecessary filler paragraphs or repetition?
   - Does the structure aid comprehension?
5. **Assign agent types** — for each of the 3 roles (creator, spec reviewer, quality reviewer), select the most appropriate `subagent_type`. All N creators use the same type. All N spec reviewers use the same type. All N quality reviewers use the same type. Recommended defaults:
   - **Creators:** domain specialist matching the content type (e.g., `seo-content-creation:seo-content-writer` for blog posts, `javascript-typescript:typescript-pro` for code docs)
   - **Spec reviewers:** `feature-dev:code-reviewer` or a domain specialist
   - **Quality reviewers:** `seo-content-creation:seo-content-auditor` for written content, `code-refactoring:code-reviewer` for code
6. **Identify dependencies** — if any items depend on others, note them. Dependent items are created in a later wave within Phase 1 (not a separate phase).

**Output:** Creative brief with item list, review criteria, agent type assignments.

### DISK CHECKPOINT: Phase 0 → Phase 1

**BLOCKING — do NOT dispatch Phase 1 creators until all writes complete.**

1. **Write `{ARTIFACT_ROOT}/phase-0/creative-brief.md`** — full Phase 0 output.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-0-packet.md`** — compressed brief that creators will receive. Include: task summary, item list with scopes, source material paths, spec criteria, quality criteria, output format requirements.
3. **Write `{ARTIFACT_ROOT}/STATUS.md`** — initial recovery manifest.

---

# Phase 1 — Create (N Parallel)

**Mode: DIVERGENT. Produce all drafts.**

**CRITICAL: Dispatch all N creators as PARALLEL subagents using the Task tool.** All N Task calls MUST be in the SAME assistant message. If N > 10, batch into waves of 8-10 to avoid overwhelming the system.

### Each creator receives:
- The phase-0-packet (creative brief, spec criteria, quality criteria)
- Their specific item assignment (title, scope, item-specific instructions)
- Paths to any source material they should read

### Each creator must:
1. **Read source material** on-demand (do NOT paste source material into the prompt — tell the agent which files to read)
2. **Produce the complete item** — not an outline, not a draft with TODOs, the full artifact
3. **Write output to `{ARTIFACT_ROOT}/phase-1/draft-{N}-{slug}.md`** BEFORE returning
4. **Self-review against spec criteria** before writing — catch obvious gaps before the reviewer does

### Creator prompt template:
```
You are creating item {N} of {TOTAL} for a creative production pipeline.

**Item:** {title}
**Scope:** {1-2 sentence scope}
**Item-specific instructions:** {if any}

**Creative brief:** Read {ARTIFACT_ROOT}/context-packets/phase-0-packet.md for the full brief, audience, voice, and quality criteria.

**Source material to read:** {list of file paths}

**Output format:** {format requirements}

**Write your complete output to:** {ARTIFACT_ROOT}/phase-1/draft-{N}-{slug}.md

Write the COMPLETE artifact. Not an outline. Not a draft with TODOs. The full, finished piece. Self-review against the spec criteria in the brief before writing the file.
```

### After all N creators return:

The orchestrator verifies all N draft files exist on disk. If any are missing, re-dispatch those creators. The orchestrator does NOT read the drafts — they go directly to spec review.

**Output:** N draft files.

### DISK CHECKPOINT: Phase 1 → Phase 2

1. **Verify all N drafts exist on disk.**
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-1-packet.md`** — list of all draft file paths with item titles. Brief status note (all created, any re-dispatched).
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 1 complete, Phase 2 in-progress.

---

# Phase 2 — Spec Review + Revision

**Mode: CONVERGENT. Verify each item meets the brief.**

This phase has an internal cycle: review → revise (if needed) → re-review (if revised). Max 2 cycles.

### Step 2a: Dispatch N Spec Reviewers (parallel)

**CRITICAL: All N in a SINGLE message.**

Each reviewer receives:
- The phase-0-packet (spec criteria)
- The path to the draft they are reviewing (NOT the content — let them read it)

Each reviewer must:
1. **Read the draft** at `{ARTIFACT_ROOT}/phase-1/draft-{N}-{slug}.md`
2. **Evaluate against each spec criterion** — pass or fail, with specific evidence
3. **Write verdict to `{ARTIFACT_ROOT}/phase-2/spec-review-{N}-{slug}.md`** BEFORE returning

Verdict format:
```markdown
# Spec Review: {item title}

## Verdict: {APPROVED | REVISION NEEDED}

## Criteria Assessment
| Criterion | Pass/Fail | Evidence |
|-----------|-----------|----------|
| {criterion 1} | PASS | {specific reference} |
| {criterion 2} | FAIL | {what's missing/wrong} |

## Required Revisions (if REVISION NEEDED)
1. {Specific, actionable revision instruction}
2. {Specific, actionable revision instruction}

## Strengths (preserve these during revision)
- {what the draft does well}
```

### Step 2b: Dispatch Revisers for Failed Items (parallel)

After all reviewers return, the orchestrator reads the verdicts (not the drafts).

- **APPROVED items:** No action. They proceed to Phase 3 as-is.
- **REVISION NEEDED items:** Dispatch a reviser agent for each.

Each reviser receives:
- The draft path
- The spec review path (with specific revision instructions)
- The phase-0-packet (for reference)

Each reviser must:
1. Read the draft and the spec review
2. Revise the draft to address ALL identified issues
3. Preserve the strengths noted in the review
4. Write the revised version to `{ARTIFACT_ROOT}/phase-2/revised-{N}-{slug}.md` BEFORE returning

### Step 2c: Re-review Revised Items (parallel, if any)

Dispatch spec reviewers for revised items only. Same criteria, same format. Write to `{ARTIFACT_ROOT}/phase-2/spec-review-{N}-{slug}-r2.md`.

- **If APPROVED:** Proceed to Phase 3 using the revised version.
- **If STILL FAILING after 2 cycles:** Flag for human attention in STATUS.md. Do not loop further. Proceed to Phase 3 with the best available version and a note in documentation.md.

**Output:** N items, each either approved-as-drafted or revised-and-approved. Spec review artifacts for traceability.

### DISK CHECKPOINT: Phase 2 → Phase 3

1. **Verify all spec reviews exist on disk.** Verify all revisions exist for failed items.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-2-packet.md`** — list of all items with their status (approved / revised / flagged). For each item, note which file is the current best version (draft or revised).
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 2 complete, Phase 3 in-progress.

---

# Phase 3 — Quality Review + Polish

**Mode: CONVERGENT. Verify each item meets the craft bar.**

Same internal cycle as Phase 2: review → polish (if needed) → re-review (if polished). Max 2 cycles.

### Step 3a: Dispatch N Quality Reviewers (parallel)

Each reviewer receives:
- The phase-0-packet (quality criteria)
- The path to the current best version of the item (from phase-2-packet)

Each reviewer must:
1. **Read the item**
2. **Evaluate against each quality criterion** — with specific evidence
3. **Write verdict to `{ARTIFACT_ROOT}/phase-3/quality-review-{N}-{slug}.md`** BEFORE returning

Verdict format:
```markdown
# Quality Review: {item title}

## Verdict: {APPROVED | POLISH NEEDED}

## Quality Assessment
| Criterion | Rating (1-5) | Notes |
|-----------|-------------|-------|
| Clarity | 4 | {specific notes} |
| Voice/tone | 3 | {specific notes — what's off} |
| Insight depth | 5 | {specific notes} |
| Structure | 4 | {specific notes} |
| Originality | 3 | {what feels generic} |

## Required Polish (if POLISH NEEDED)
1. {Specific instruction — "paragraph 3 is filler, cut or replace with..."}
2. {Specific instruction — "the opening reads like AI slop, try leading with..."}

## Strengths (preserve these during polish)
- {what works well}
```

### Step 3b: Dispatch Polishers for Failed Items (parallel)

Same pattern as Phase 2 revision:
- **APPROVED items:** Proceed to Phase 4 as-is.
- **POLISH NEEDED items:** Dispatch polisher agents. Each reads the item + quality review, polishes, writes to `{ARTIFACT_ROOT}/phase-3/polished-{N}-{slug}.md`.

### Step 3c: Re-review Polished Items (parallel, if any)

Same as Step 2c. Max 2 cycles. If still failing, flag and proceed with best available version.

**Output:** N items, each quality-approved or flagged. Quality review artifacts for traceability.

### DISK CHECKPOINT: Phase 3 → Phase 4

1. **Verify all quality reviews exist on disk.**
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-3-packet.md`** — list of all items with final status and path to final version.
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 3 complete, Phase 4 in-progress.

---

# Phase 4 — Collect Final Output

**Mode: ASSEMBLY. Gather all final versions + produce documentation.**

This phase is executed by the orchestrator directly (not dispatched agents).

### Step 4a: Collect Final Versions

For each item, identify the final version file:
- If quality-approved from Phase 1 draft: copy from `phase-1/draft-{N}-{slug}.md`
- If revised in Phase 2: copy from `phase-2/revised-{N}-{slug}.md`
- If polished in Phase 3: copy from `phase-3/polished-{N}-{slug}.md`

Copy (not move) each final version to `{ARTIFACT_ROOT}/phase-4/{output-filename}.md` using the naming convention specified in the creative brief.

### Step 4b: Write Documentation

Write `{ARTIFACT_ROOT}/phase-4/documentation.md` with:

```markdown
# Creative Funnel Output: {project title}

## Summary
- **Items produced:** {N}
- **Items approved without revision:** {count}
- **Items requiring spec revision:** {count}
- **Items requiring quality polish:** {count}
- **Items flagged for human attention:** {count}
- **Date completed:** {ISO timestamp}

## Creative Brief
{1-paragraph summary of what was produced and why}

## Item Index

| # | Title | File | Spec Review | Quality Review | Notes |
|---|-------|------|-------------|----------------|-------|
| 1 | {title} | {filename} | APPROVED | APPROVED | — |
| 2 | {title} | {filename} | REVISED (1 cycle) | APPROVED | — |
| 3 | {title} | {filename} | APPROVED | POLISHED (1 cycle) | — |
| N | {title} | {filename} | REVISED (2 cycles) | FLAGGED | {issue description} |

## Review Artifact Paths
For traceability, all review artifacts are preserved:
- Spec reviews: `phase-2/spec-review-*.md`
- Revisions: `phase-2/revised-*.md`
- Quality reviews: `phase-3/quality-review-*.md`
- Polish passes: `phase-3/polished-*.md`

## Flagged Items (if any)
### Item {N}: {title}
- **Issue:** {what still doesn't pass}
- **Best available version:** {file path}
- **Recommended action:** {specific suggestion for human}
```

### DISK CHECKPOINT: Phase 4 Complete

1. **Verify all N final output files exist in `phase-4/`.**
2. **Verify `phase-4/documentation.md` exists.**
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 4 complete. Fill in summary.

---

# Artifact Tracking

```
{ARTIFACT_ROOT}/
├── STATUS.md
├── phase-0/
│   └── creative-brief.md
├── phase-1/                        ← Drafts
│   ├── draft-1-{slug}.md
│   ├── draft-2-{slug}.md
│   └── ...
├── phase-2/                        ← Spec reviews + revisions
│   ├── spec-review-1-{slug}.md
│   ├── revised-1-{slug}.md         ← Only if revision needed
│   ├── spec-review-1-{slug}-r2.md  ← Only if re-reviewed
│   └── ...
├── phase-3/                        ← Quality reviews + polish
│   ├── quality-review-1-{slug}.md
│   ├── polished-1-{slug}.md        ← Only if polish needed
│   ├── quality-review-1-{slug}-r2.md ← Only if re-reviewed
│   └── ...
├── phase-4/                        ← FINAL OUTPUT
│   ├── {output-1}.md               ← Named per creative brief convention
│   ├── {output-2}.md
│   ├── ...
│   └── documentation.md            ← Structured summary of entire pipeline
└── context-packets/
    ├── phase-0-packet.md
    ├── phase-1-packet.md
    ├── phase-2-packet.md
    └── phase-3-packet.md
```

**Artifact root:** `{user-specified-path}/` — the user must specify where output goes. There is no default. If the user says "output to blog-posts/", use `blog-posts/`.

### Recovery Manifest: STATUS.md

Same format as other funnel skills. Write at `{ARTIFACT_ROOT}/STATUS.md`:

```markdown
# Creative Funnel Status: {project title}

## Current State
- **Phase:** {0|1|2|3|4}
- **Sub-state:** {e.g., "Phase 2: spec reviews complete, 3/8 items need revision, revisers dispatched"}
- **Items:** {N total}, {approved} approved, {in-review} in review, {flagged} flagged
- **Last updated:** {ISO timestamp}
- **Artifact root:** {absolute path}

## Project Summary
{What we're producing — 1-2 sentences}

## Phase Completion
- [x] Phase 0: Brief — phase-0/creative-brief.md
- [x] Phase 1: Create (N drafts) — phase-1/draft-*.md
- [ ] Phase 2: Spec Review — 5/8 approved, 3/8 in revision
- [ ] Phase 3: Quality Review
- [ ] Phase 4: Collect

## Item Status
| # | Title | Draft | Spec | Revision | Quality | Polish | Final |
|---|-------|-------|------|----------|---------|--------|-------|
| 1 | ... | ✓ | APPROVED | — | pending | — | — |
| 2 | ... | ✓ | REVISION | pending | — | — | — |
| 3 | ... | ✓ | APPROVED | — | pending | — | — |

## Recovery Instructions
To resume from this state:
1. Read this STATUS.md
2. Read the context packet for the current phase
3. Check the Item Status table for per-item state
4. Resume from the sub-state indicated
```

**Update rules:** Same as other funnel skills — update before AND after every state transition. Update per-item status as each item progresses through review cycles.

---

# Context Management

### What Each Agent Receives

| Agent Role | Receives | Does NOT Receive |
|------------|----------|------------------|
| **Creator** | phase-0-packet + their item assignment + source material paths | Other items' assignments, other drafts |
| **Spec Reviewer** | phase-0-packet (spec criteria only) + path to draft | Other items, quality criteria |
| **Reviser** | phase-0-packet + draft path + spec review path | Other items, other reviews |
| **Quality Reviewer** | phase-0-packet (quality criteria only) + path to current best version | Other items, spec review history |
| **Polisher** | phase-0-packet + current version path + quality review path | Other items, other reviews |

**Key principle:** Each agent sees only its own item and only the review relevant to its task. No agent sees the full pipeline state. This prevents cross-contamination between items and keeps agent prompts small.

### Anti-Bloat Rules

1. **Never paste item content into agent prompts.** Give the agent a file path to read.
2. **Never send all N items to any single agent.** Each agent works on exactly one item.
3. **Agent prompts should be under 1,500 tokens** (excluding skill/system prompt). If your prompt is longer, you're sending too much context.
4. **Source material is read on-demand.** Tell the agent which files to read. Do not pre-load source material into the prompt.

---

# Crash Recovery

Same procedure as other funnel skills:

1. **Find STATUS.md** at the artifact root.
2. **Read it** — it tells you the current phase, sub-state, and per-item status.
3. **Read the relevant context packet** for the current phase.
4. **Check the Item Status table** — some items may be further along than others within a phase (e.g., 5 of 8 spec reviews complete).
5. **Resume** — dispatch agents for incomplete items only. Do not re-dispatch for items that already have artifacts on disk.

### Recovery Scenarios

| State | Action |
|-------|--------|
| **Mid-Phase 1 (some drafts written)** | Verify which drafts exist on disk, dispatch creators for missing items only |
| **Mid-Phase 2 (some reviews done)** | Check spec-review files, dispatch reviewers for unreviewed items; check revision files for items that needed revision |
| **Between phases** | Read latest context packet, proceed to next phase |
| **Phase 4 incomplete** | Check which final files exist in phase-4/, collect remaining, write documentation |

---

# Quick Invocation

```
Use the creative funnel to produce [N items]. Here is the brief:

[description of what to create]

Output to: [path]
```

Example:
```
Use the creative funnel to write the 8 article ideas from the analysis funnel
as complete blog post drafts. Use the analysis report at
analysis-output/blog-content-ideation/phase-4/analysis-report.md as source material.

Output to: blog-ideas/articles/
```

---

# Troubleshooting

**Creator produced an outline instead of a complete artifact:**
The prompt didn't emphasize "complete, finished piece." Re-dispatch with explicit instruction: "Write the COMPLETE artifact. Not an outline. Not a draft with TODOs."

**Spec reviewer is too lenient (approves everything):**
The spec criteria in Phase 0 are too vague. Revise the creative brief with specific, measurable criteria (e.g., "must include at least 2 code examples" instead of "should include code").

**Quality reviewer is too strict (rejects everything):**
Quality criteria may be unrealistic for first-draft quality. Focus quality review on HIGH-IMPACT issues only: voice, originality, and AI slop detection. Don't nitpick formatting or minor wording.

**Review cycles are looping (item fails twice):**
Cap at 2 cycles. After 2 failures, flag the item in documentation.md with the specific unresolved issue and move on. The human can address it.

**Items have dependencies the brief didn't capture:**
If item 5 references concepts from item 2, item 5's creator needs item 2 as input. Re-dispatch item 5's creator with item 2's final version as additional source material. To prevent this: identify dependencies in Phase 0.

**N is very large (>10 items):**
Batch Phase 1 creators into waves of 8-10 parallel agents. Same for reviewers. This prevents system overload while maintaining parallelism within each wave.

**Agent couldn't write to disk:**
Some agent types have read-only tools. Use `general-purpose` subagent type for creators if the domain specialist can't write files. Or use a subagent type that has Write tool access.
