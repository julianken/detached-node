---
name: analysis-funnel
description: Structured 5→5→3→1 investigation pipeline that sends parallel agents to explore facets of a question, iterates on findings, and produces a comprehensive analysis report. Use this whenever the user asks to "analyze", "investigate", "audit", "assess", or "do a deep-dive on" a broad, open-ended topic where the goal is understanding (codebase health checks, technology assessments, architecture audits, research questions) rather than implementing a fix. Do NOT use for implementation planning (prefer decision-funnel or creative-funnel) or for tasks with a known answer.
---

# Analysis Funnel: 5→5→3→1 Investigation Method

A progressive investigation and synthesis pipeline for **open-ended analysis**. 5 parallel agents investigate, 5 parallel agents iterate and develop the findings, 3 agents synthesize through different lenses, and 1 agent produces the final unified analysis report.

The power comes from **breadth of investigation** and **progressive synthesis** — each wave compresses and refines what came before. The orchestrator decides dynamically how to use each wave based on what the previous wave produced.

Based on the Double Diamond framework (British Design Council), Nominal Group Technique (NGT), and structured ideation best practices adapted for AI agent workflows.

```
INPUT (broad question/topic for analysis)
    │
    ▼
Phase 0: FRAME ─────── Define the analysis question, carve it into investigation areas
    │
    ▼
Phase 1: INVESTIGATE ── 5 parallel agents (tasks assigned by orchestrator)
    │
    ▼
Phase 2: ITERATE ────── 5 parallel agents (tasks assigned by orchestrator based on Phase 1)
    │
    ▼
Phase 3: SYNTHESIZE ─── 3 parallel agents (tasks assigned by orchestrator based on Phase 2)
    ▼
Phase 4: UNIFY ──────── 1 agent produces the final unified analysis report
    │
    ▼
OUTPUT (comprehensive analysis report)
```

## When to use this skill

Use the analysis funnel when:
- You need deep understanding of a broad or complex topic
- The question is open-ended — there isn't necessarily a "right answer" to converge on
- You want to explore a problem space before deciding what (if anything) to do about it
- You need an evidence-based assessment with identified gaps and open questions
- The analysis will inform future decisions, but the decision itself is not the goal right now

Do NOT use for:
- Problems where the goal is to produce an implementation plan
- Single-line fixes or obvious changes
- Tasks where the answer is already known
- Pure information retrieval (just read the docs)

## Three principles the pipeline depends on

These three things, if violated, break the funnel. Everything else in this document is workflow detail.

### 1. Parallel dispatch per wave, in a single message

Each wave (Phase 1: 5 investigators, Phase 2: 5 iterators, Phase 3: 3 synthesizers) is designed so agents run independently. Dispatch them with multiple `Task(...)` invocations in one assistant message — the system runs those concurrently. Running them in your own context, or sequentially one-per-message, is strictly worse: wall-clock is 5× longer, and the orchestrator's own context fills with intermediate output instead of staying at the coordination level.

### 2. Disk checkpoints between phases

Every phase transition writes artifacts to disk *before* dispatching the next phase's agents. Two reasons:

- **Crash survivability.** Agent conversations expire, sessions crash, the laptop sleeps. If the only record of Phase 1 lives in the orchestrator's ephemeral context, losing that context costs the whole wave. Written artifacts plus `STATUS.md` let a zero-context session pick up exactly where the last one stopped. See `references/crash-recovery.md`.
- **Agent-return-value is unreliable.** Agents sometimes fail to return what they said they would, truncate outputs, or return raw when structured was requested. Writing to a designated path and *then* returning means the orchestrator can treat return values as advisory and the file as authoritative. If an agent returns without the file on disk, re-dispatch.

Use the helper script to enforce this:

```bash
scripts/verify_phase.sh <artifact-root> <phase-number>
```

It checks that the expected files exist, reports which are missing, and exits non-zero if anything is absent. Run it before dispatching the next wave.

### 3. Context packets, not raw artifacts, flow forward

Each phase produces its own detailed artifacts (investigation reports, iteration reports, synthesis reports). What flows to the *next* phase is not those artifacts — it's a compressed **context packet** distilled from them. See `references/context-management.md` for format and the full waterfall.

If you're sending a downstream agent more than ~1,000 tokens of upstream context, you're doing it wrong. The packets are the designed handoff; the raw artifacts exist for audit and for Phase 4's final synthesis.

---

## Input requirements

Before running the funnel, gather these from the conversation or explicitly ask:

| Field | Description |
|-------|-------------|
| **Question** | The central analysis question — what are we trying to understand? |
| **Context** | What the conversation has established so far (background, prior knowledge, motivation) |
| **Scope** | What's in bounds for the analysis (specific apps, packages, systems, time periods) |
| **Depth** | How deep should the analysis go? Surface-level survey vs. deep-dive? |
| **Non-goals** | Explicitly out of scope (prevents scope creep during divergence) |
| **Known information** | What we already know; starting assumptions and their confidence levels |
| **Audience** | Who will read this analysis? What decisions might it inform? |

If any of these are ambiguous, ask the user before starting Phase 0. Do not assume.

**Data gathering before Phase 0.** Use available MCP servers to fill in gaps *before* framing, not during. Query issue trackers (Linear `mcp__linear-server__*`, GitHub Issues, Jira) for context, use codebase tools (e.g. `mcp__plugin_serena_serena__*`) to understand current state, and fetch library docs via Context7 (`mcp__plugin_context7_context7__*`) for any technology in scope. Grounding every phase in real data is the difference between an analysis and a plausible-sounding guess.

---

## Phase 0 — Frame the analysis

**Mode: CONVERGENT. Establish the analytical frame before investigating.**

1. **Restate the analysis question** in 5–10 bullet points. Strip opinions and premature conclusions — focus on observable facts, what we know, and what we need to find out.
2. **List assumptions and unknowns** — distinguish known knowns (established), known unknowns (specific questions we need to answer), and suspected unknowns (areas where we suspect gaps).
3. **Identify the analysis domains** — see `references/domain-detection.md` for the domain table. Tag 2–5 domains; if more than 5, the question needs decomposition.
4. **Define quality criteria with weights** BEFORE seeing any findings. Pre-committing to criteria prevents retrofitting them to justify a preferred narrative after the evidence is in. Defaults in `references/domain-detection.md`.
5. **Carve the question into 5 investigation areas.** This is the most important step — it determines what Phase 1's 5 parallel investigators will each focus on. Each area should be a different **facet** of the question, not a different answer. Examples and rules in `references/domain-detection.md`.

**Phase 0 → Phase 1 checkpoint.** Run:

```bash
scripts/init_funnel.sh <artifact-root> "<analysis question summary>"
# Write phase-0/analysis-brief.md and context-packets/phase-0-packet.md
scripts/verify_phase.sh <artifact-root> 0
```

The verify step will fail loud if any of the three expected files are missing. Don't dispatch Phase 1 until it passes.

---

## Phase 1 — "5": Investigate

**Mode: DIVERGENT. Breadth of understanding.**

Dispatch all 5 investigators as parallel subagents — 5 `Task(...)` calls in one assistant message.

Each investigator receives the phase-0 packet and a specific area assignment. Their primary deliverable is a file at `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md` — written *before* the agent returns. If an agent returns without writing its file, treat it as failed and re-dispatch.

Output format, evidence citation rules, and the "surprises + unknowns + raw evidence" structure are in `references/phase-templates.md`.

Pick `subagent_type` by matching each area to the best-fit domain specialist. Don't default to generic types when a specialist covers the area.

After all 5 return, the orchestrator reads the reports and produces `context-packets/phase-1-packet.md` noting convergences, contradictions, gaps, and surprises. Then:

```bash
scripts/verify_phase.sh <artifact-root> 1
scripts/update_status.py <artifact-root> --complete 1 --start 2
```

---

## Phase 2 — "5": Iterate and develop

**Mode: DIVERGENT→CONVERGENT. Deepen understanding, resolve contradictions, fill gaps.**

Dispatch all 5 iterators as parallel subagents — one message, 5 `Task(...)` calls.

The iterators **deepen the analysis**, not develop solution options. Common iterator assignments: resolve a contradiction, fill a gap, cross-cut analysis (one area's lens applied to another area's finding), quantify a qualitative finding, validate a key finding, historical analysis.

Each iterator receives the phase-0 packet + phase-1 packet + their specific task. Primary deliverable: `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md`. Format in `references/phase-templates.md`.

After all 5 return, produce `context-packets/phase-2-packet.md` — **organized by theme** rather than by iterator. Then:

```bash
scripts/verify_phase.sh <artifact-root> 2
scripts/update_status.py <artifact-root> --complete 2 --start 3
```

---

## Phase 3 — "3": Synthesize

**Mode: CONVERGENT. Build the narrative from evidence.**

Dispatch all 3 synthesizers as parallel subagents — one message, 3 `Task(...)` calls. Default lens assignments:

- **Synthesizer 1: Thematic** — 3–5 major themes emerging from the evidence; how they relate
- **Synthesizer 2: Risk/opportunity** — risks, vulnerabilities, problems vs. strengths, opportunities; severity-rated
- **Synthesizer 3: Gap & implication** — what the evidence doesn't tell us; implications for the stated audience; what decisions this enables or constrains

You may adjust lenses based on what Phase 2 produced (e.g. "technical debt synthesis" or "architecture fitness synthesis" for a purely technical analysis). Synthesizers want broad thinkers — pick broad architectural/analytical specialists, not domain experts.

Primary deliverable: `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md`. Format in `references/phase-templates.md`. After all 3 return, produce `context-packets/phase-3-packet.md` comparing the three.

```bash
scripts/verify_phase.sh <artifact-root> 3
scripts/update_status.py <artifact-root> --complete 3 --start 4
```

---

## Phase 4 — "1": Final unified analysis report

**Mode: COMMIT. One report, fully evidenced.**

A single agent takes the 3 Phase 3 outputs and produces the unified report. This is **not** "pick the best of 3" — it's a final synthesis that weaves insights from all three lenses into a coherent, comprehensive analysis.

The Phase 4 agent is the one exception to "packets only, never raw artifacts" — it reads the phase-0 packet, the phase-3 packet, *and* the full Phase 3 artifacts, because it needs the detail to write the final report without losing nuance.

Primary deliverable: `{ARTIFACT_ROOT}/phase-4/analysis-report.md`. Full structure (sections A–J, evidence index, confidence assessment) in `references/report-template.md`.

```bash
scripts/verify_phase.sh <artifact-root> 4
scripts/update_status.py <artifact-root> --complete 4
```

The funnel is complete when the report exists on disk. The analysis report *is* the deliverable — there's no execution phase.

---

## Artifact tracking

Write all phase outputs to an organized tree. Default root is `docs/{topic-slug}/` so analyses live alongside project docs and future sessions can find them. Override if the user specifies a location (e.g., `analysis-output/` for gitignored artifacts, `tmp/` for throwaway).

```
{ARTIFACT_ROOT}/
├── STATUS.md                    ← recovery manifest, always up-to-date
├── phase-0/analysis-brief.md
├── phase-1/area-{1..5}-{slug}.md
├── phase-2/iterator-{1..5}-{focus}.md
├── phase-3/synthesis-{1..3}.md
├── phase-4/analysis-report.md
└── context-packets/
    ├── phase-0-packet.md
    ├── phase-1-packet.md
    ├── phase-2-packet.md
    └── phase-3-packet.md
```

`STATUS.md` is the single source of truth for crash recovery — a new session with zero context should be able to read this one file and know exactly where things stand. Format, update rules, and recovery procedure are in `references/crash-recovery.md`.

---

## Agent type selection

Every agent in the funnel MUST specify an explicit `subagent_type` value. Match the task's primary domain to the most domain-relevant specialist available; if a task spans multiple domains, pick the agent whose specialty covers the most critical aspect. The orchestrator has full discretion — the skill does not prescribe specific agent names.

---

## Quick invocation

```
Use the analysis funnel (5→5→3→1) on the following question. Output a fully structured
analysis report. Here is the input:

{paste or reference the question/topic from the conversation}
```

## Troubleshooting

Common failure modes (redundant output within a wave, findings without evidence, packets too long, mid-funnel crashes, etc.) and their fixes are in `references/troubleshooting.md`.

---

## Reference files

- `references/domain-detection.md` — Domain table, carving rules, quality-criteria weights
- `references/phase-templates.md` — Output format for each phase's artifacts
- `references/report-template.md` — Final analysis-report structure (A–J sections)
- `references/context-management.md` — Context packet format, context waterfall, budget tiers
- `references/crash-recovery.md` — STATUS.md format + step-by-step recovery procedure
- `references/troubleshooting.md` — Common failure modes and their fixes

## Scripts

- `scripts/init_funnel.sh <artifact-root> <question-summary>` — create the tree + initial STATUS.md
- `scripts/verify_phase.sh <artifact-root> <phase>` — verify expected files exist; non-zero on missing
- `scripts/update_status.py <artifact-root> [--complete N] [--start N]` — atomic STATUS.md transitions
- `scripts/list_funnels.sh [search-root]` — find all `*/STATUS.md` under search-root with phase state summary
