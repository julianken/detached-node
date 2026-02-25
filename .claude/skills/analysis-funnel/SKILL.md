---
name: analysis-funnel
description: Structured investigate-iterate-synthesize pipeline (5->5->3->1) that sends parallel agents to explore different facets of a question, iterates on findings, progressively synthesizes, and produces a comprehensive analysis report
---

# Analysis Funnel: 5→5→3→1 Investigation Method

A progressive investigation and synthesis pipeline for **open-ended analysis**. 5 parallel agents investigate, 5 parallel agents iterate and develop the findings, 3 agents synthesize, and 1 agent produces the final unified analysis report.

The power comes from **breadth of investigation** and **progressive synthesis** — each wave compresses and refines what came before. The orchestrator decides dynamically how to use each wave based on what the previous wave produced.

Based on the Double Diamond framework (British Design Council), Nominal Group Technique (NGT), and structured ideation best practices adapted for AI agent workflows.

**CRITICAL: Agent Type Selection.** When dispatching subagents, the orchestrator should select the most domain-appropriate `subagent_type` from the available installed agents. Match each agent's task to the specialist whose domain is the closest fit. Do not default to generic agent types when a domain specialist is available.

**CRITICAL: Parallel Subagent Dispatch.** This skill MUST use the Task tool to dispatch work in parallel wherever phases are designed for independent execution. DO NOT run independent work sequentially in your own context — this wastes context window and removes the independence guarantee. Specifically:
- **Phase 1 (5 investigators):** Launch ALL 5 in a SINGLE message with 5 Task tool calls. They run in parallel.
- **Phase 2 (5 iterators):** Launch ALL 5 in a SINGLE message with 5 Task tool calls. They run in parallel.
- **Phase 3 (3 synthesizers):** Launch ALL 3 in a SINGLE message with 3 Task tool calls. They run in parallel.
- To dispatch in parallel, include multiple `Task(...)` invocations in the same assistant message. The system runs them concurrently.

**CRITICAL: Disk Checkpoints Between Phases.** Every phase transition MUST write artifacts to disk BEFORE dispatching the next phase's agents. This is a BLOCKING requirement — if you skip the disk write step, a crash loses all work from the completed phase. Specifically:
- **After Phase 0**: Write `phase-0/analysis-brief.md` + `context-packets/phase-0-packet.md` + `STATUS.md` BEFORE dispatching Phase 1 investigators.
- **After Phase 1**: Write `context-packets/phase-1-packet.md` + update `STATUS.md` BEFORE dispatching Phase 2 iterators.
- **After Phase 2**: Write `context-packets/phase-2-packet.md` + update `STATUS.md` BEFORE dispatching Phase 3 synthesizers.
- **After Phase 3**: Write `context-packets/phase-3-packet.md` + update `STATUS.md` BEFORE dispatching Phase 4 final synthesizer.
- **After Phase 4**: Update `STATUS.md` after the analysis report is written to disk.

If you find yourself about to dispatch agents without having written the preceding checkpoint files, STOP. Write the files first. No exceptions.

**CRITICAL: Every Agent Writes Its Own Output to Disk.** Agents MUST write their output to their designated file path BEFORE returning. The orchestrator should NEVER rely on extracting content from an agent's return value as the primary record. Each agent prompt MUST include the exact file path where the agent should write its output. If an agent returns without having written its file, treat it as a failed agent and re-dispatch. This applies to ALL phases:
- Phase 1 investigators write to `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md`
- Phase 2 iterators write to `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md`
- Phase 3 synthesizers write to `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md`
- Phase 4 final synthesizer writes to `{ARTIFACT_ROOT}/phase-4/analysis-report.md`

**CRITICAL: Use MCP Servers for Data.** Throughout every phase, actively use available MCP servers to query for real data rather than relying on assumptions or stale knowledge. This includes but is not limited to:
- **Context7** (`mcp__context7__*` / `mcp__plugin_context7_context7__*`) — Query up-to-date library documentation, API references, and code examples for any technology in the analysis scope. Use this before making claims about how a library or framework works.
- **Issue tracker** (e.g., `mcp__linear-server__*`) — Read issue descriptions, acceptance criteria, comments, and linked context. Never fabricate issue details.
- **Codebase tools** (e.g., `mcp__plugin_serena_serena__*`) — Use symbolic code analysis tools to understand existing architecture, find symbols, trace references, and read implementations. Prefer these over reading entire files.
- **Browser/Playwright** (e.g., `mcp__playwright__*`) — Validate UI assumptions by actually looking at the current state of the application during investigation phases.
- **Any other available MCP servers** — Check what's available and use them when they provide relevant data for the analysis.

The goal is to ground every phase in real data. Phase 1 investigators should reference actual code patterns found via MCP tools. Phase 2 iterators should verify claims against real documentation. Phase 4 should cite specific evidence for all claims.

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

---

## When to Use This Skill

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

---

## Input Requirements

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

**Data gathering:** Use MCP servers to fill in gaps. Query the issue tracker for context, use codebase tools to understand current state, and fetch library docs via Context7 for any technology in scope. Do this BEFORE Phase 0, not during it.

---

# Phase 0 — Frame the Analysis

**Mode: CONVERGENT. Establish the analytical frame before investigating.**

The goal is to ensure everyone (human and agent) agrees on what we're analyzing and how we'll evaluate the quality of the analysis.

1. **Restate the analysis question** in 5–10 bullet points. Strip opinions and premature conclusions — focus on observable facts, what we know, and what we need to find out.
2. **List assumptions and unknowns.** Flag anything that could change the analysis if the assumption is wrong. Distinguish between:
   - **Known knowns** — established facts we're building on
   - **Known unknowns** — specific questions we need to answer
   - **Suspected unknowns** — areas where we suspect gaps but aren't sure what the questions are yet
3. **Identify the analysis domains** — classify which domains this analysis touches (see Domain Detection below).
4. **Define quality criteria with weights** BEFORE seeing any findings (prevents retrofitting criteria to justify a preferred narrative).
5. **Carve the question into 5 investigation areas.** This is the most important step — it determines what Phase 1's 5 parallel investigators will each focus on. Each area should be a different **facet** of the question, not a different answer. Examples:
   - For an architecture audit: area 1 = component structure & dependencies, area 2 = data flow patterns, area 3 = error handling & resilience, area 4 = performance characteristics, area 5 = security posture
   - For a technology assessment: area 1 = current usage patterns, area 2 = ecosystem maturity, area 3 = performance benchmarks, area 4 = developer experience, area 5 = migration/adoption costs
   - For a codebase health check: area 1 = test coverage & quality, area 2 = code complexity & duplication, area 3 = dependency freshness, area 4 = documentation completeness, area 5 = operational readiness

   **Rules for area carving:**
   - Areas explore different ASPECTS of the question, not different answers
   - Each area should align with a domain from the Domain Detection table
   - Areas should have minimal overlap — if two areas would investigate the same files, merge them
   - Each area should be independently investigable (no area depends on another's results)

### Standard Quality Criteria

Adjust weights per analysis. These are defaults:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Evidence strength | 25% | Are findings backed by concrete data, code references, or verifiable facts? |
| Completeness | 20% | Does the analysis cover the full scope of the question? |
| Accuracy | 20% | Are claims factually correct and technically sound? |
| Actionability | 15% | Can someone act on the findings (even if actions aren't prescribed)? |
| Nuance | 10% | Does it acknowledge uncertainty, trade-offs, and multiple perspectives? |
| Clarity | 10% | Is it well-organized and comprehensible to the stated audience? |

### Domain Detection

Analyze the question and tag all applicable domains. Each domain activates a specialist investigation lens (Phase 1) and guides agent type selection for all phases.

| Domain | Detected When | Investigation Focus |
|--------|--------------|---------------------|
| **UI/Visual** | Analysis involves layouts, styling, visual hierarchy, animations, theming | Aesthetics, consistency, visual hierarchy, responsiveness |
| **React/Components** | Analysis involves component architecture, state, props, hooks, rendering | Component boundaries, re-render efficiency, hook correctness |
| **State Management** | Analysis involves stores, sync, real-time updates, caching | Data flow, race conditions, consistency guarantees |
| **API/Backend** | Analysis involves endpoints, data fetching, auth, server logic | Contracts, error handling, security, performance |
| **Database** | Analysis involves schema, queries, migrations, data modeling | Normalization, query patterns, migration safety |
| **GraphQL** | Analysis involves schema design, resolvers, federation, subscriptions | Schema design, N+1 risks, type safety, caching |
| **Auth/Security** | Analysis involves authentication, authorization, tokens, encryption | Attack vectors, token handling, OWASP compliance |
| **Accessibility** | Analysis involves screen readers, keyboard nav, ARIA, color contrast | WCAG compliance, assistive tech compatibility, focus management |
| **Performance** | Analysis involves load times, bundle size, rendering speed, memory | Bottlenecks, measurement methodology, regression risk |
| **Testing** | Analysis involves test strategy, coverage, E2E, mocking | Coverage gaps, flakiness risk, test maintainability |
| **DevOps/Infra** | Analysis involves CI/CD, deployment, monitoring, scaling | Deployment safety, rollback capability, observability |
| **Mobile/Native** | Analysis involves iOS, Android, React Native, responsive mobile UX | Platform conventions, gesture handling, offline behavior |
| **Architecture** | Analysis involves system design, module boundaries, patterns, coupling | Cohesion, coupling, abstraction quality, evolution fitness |
| **Developer Experience** | Analysis involves tooling, documentation, onboarding, workflow friction | Ergonomics, discoverability, consistency, cognitive load |

**Rules:**
- Tag 2–5 domains. If you tag more than 5, the question may need to be decomposed into separate funnels.
- If you tag fewer than 2, you may be thinking too narrowly — most real analyses span multiple domains.
- The detected domains guide which specialist agent types the orchestrator selects for each phase.

**Output:** Analysis brief + assumptions + domain tags + weighted quality criteria table + **5 investigation areas**.

### DISK CHECKPOINT: Phase 0 → Phase 1

**BLOCKING — do NOT dispatch Phase 1 investigators until all three writes complete.**

1. **Write `{ARTIFACT_ROOT}/phase-0/analysis-brief.md`** — the full Phase 0 output (question restatement, assumptions, domain tags, quality criteria, 5 investigation areas).
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-0-packet.md`** — the compressed context packet that Phase 1 investigators will receive. Use the Context Packet Format (see Context Management section).
3. **Write `{ARTIFACT_ROOT}/STATUS.md`** — initial recovery manifest marking Phase 0 complete and Phase 1 as in-progress. Include the question summary, domain tags, and artifact paths.

Verify all three files exist on disk before proceeding. If any write fails, retry before dispatching agents.

---

# Phase 1 — "5": Investigate

**Mode: DIVERGENT. Breadth of understanding.**

**CRITICAL: Dispatch all 5 investigators as PARALLEL subagents using the Task tool.** All 5 Task calls MUST be in the SAME assistant message so they run concurrently. Do NOT investigate sequentially in your own context.

### How to plan the wave:

The orchestrator reads the Phase 0 output, decides what this wave of 5 agents needs to investigate, and assigns each agent a specific task.

### Each investigator receives:
- The phase-0-packet (analysis question, scope, quality criteria)
- Their specific assigned task from the orchestrator's plan

### Each investigator must:
1. **Write output to their designated file** at `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md` — this is the agent's PRIMARY deliverable, not the return value. Write the file BEFORE returning.
2. **Gather evidence** — use MCP tools, read code, query docs, inspect the actual system
3. **Report findings** with evidence — every claim must cite where it came from (file path, line number, documentation URL, tool output)
4. **Identify surprises** — what was unexpected or contradicts prior assumptions?
5. **Flag unknowns** — what couldn't be determined and why?

### Investigator output format:

```markdown
# Investigation: {Area Name}

## Summary
{3-5 sentence overview of findings}

## Key Findings
### Finding 1: {title}
- **Evidence:** {specific code references, data, tool output}
- **Confidence:** {high|medium|low} — {why}
- **Implication:** {what this means for the broader analysis}

### Finding 2: {title}
...

## Surprises
- {Things that contradicted expectations}

## Unknowns & Gaps
- {What couldn't be determined and why}
- {Suggested follow-up investigations}

## Raw Evidence
- {File paths read, tool queries run, data collected — for traceability}
```

### Investigator agent type selection:
Each investigator's `subagent_type` should be chosen by the orchestrator to match the domain of their assigned task. Pick the most domain-relevant specialist available from installed agents.

### After all 5 investigators return:

The orchestrator reads all 5 investigation reports and produces a **phase-1-packet** — a compressed summary of the wave's findings. The orchestrator should note:
- **Convergences** — where multiple investigators found the same thing
- **Contradictions** — where investigators disagree or found conflicting evidence
- **Gaps** — areas that no investigator covered adequately
- **Surprises** — unexpected findings that may shift the analysis frame

**Output:** 5 investigation reports (one per area) + phase-1-packet.

### DISK CHECKPOINT: Phase 1 → Phase 2

**BLOCKING — do NOT dispatch Phase 2 iterators until all writes complete.**

1. **Verify all 5 investigation reports exist on disk** at `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md`. If any are missing (agent failed to write), re-dispatch that investigator.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-1-packet.md`** — compressed findings from all 5 investigators. Use the Context Packet Format. This is what Phase 2 iterators will receive — NOT the raw reports.
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 1 complete, Phase 2 in-progress. List all 5 investigation report paths.

Verify all files exist on disk before proceeding. If any write fails, retry before dispatching agents.

---

# Phase 2 — "5": Iterate and Develop

**Mode: DIVERGENT→CONVERGENT. Deepen understanding, resolve contradictions, fill gaps.**

**CRITICAL: Dispatch all 5 iterators as PARALLEL subagents using the Task tool.** All 5 Task calls MUST be in the SAME assistant message.

### How to plan the wave:

The orchestrator reads the phase-1-packet and decides what this wave of 5 agents needs to accomplish. The iterators are **deepening the analysis**, not developing solution options. Common iterator assignments:

- **Resolve a contradiction** — two investigators found conflicting evidence; an iterator digs deeper to determine which is correct
- **Fill a gap** — an investigation area flagged unknowns; an iterator pursues those specific unknowns
- **Cross-cut analysis** — look at a finding from one area through the lens of another (e.g., "investigate how the auth patterns found in area 2 interact with the performance findings from area 4")
- **Quantify** — a finding was qualitative ("the code is complex"); an iterator produces concrete metrics
- **Validate** — stress-test a key finding by looking for counter-evidence or edge cases
- **Historical analysis** — trace how the current state evolved (git history, issue tracker, etc.)

### Each iterator receives:
- The phase-0-packet (analysis question + quality criteria)
- The phase-1-packet (compressed findings from all 5 investigators)
- Their specific assigned task from the orchestrator's plan

### Each iterator must:
1. **Write output to their designated file** at `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md` — this is the agent's PRIMARY deliverable. Write the file BEFORE returning.
2. **Deepen** — produce more specific, evidence-backed analysis on their assigned task
3. **Cite evidence** — every claim must reference specific sources
4. **Assess confidence** — rate findings as high/medium/low confidence with reasoning
5. **Connect** — relate findings back to the broader analysis question

### Iterator output format:

```markdown
# Iteration: {Focus Area}

## Assignment
{What the orchestrator asked this iterator to do}

## Findings
### {Finding title}
- **Evidence:** {specific references}
- **Confidence:** {high|medium|low}
- **Relation to Phase 1:** {confirms|contradicts|extends} finding from area {N}
- **Significance:** {why this matters for the analysis}

## Resolved Questions
- {Questions from Phase 1 that this iteration answered}

## Remaining Unknowns
- {What still couldn't be determined}

## Revised Understanding
{How the analysis picture has changed based on this iteration}
```

### Iterator agent type selection:
Match the iterator's `subagent_type` to the domain of their specific task. For cross-cutting analysis, use an architecture or codebase exploration specialist.

### After all 5 iterators return:

The orchestrator reads all 5 iterator reports and produces a **phase-2-packet** — a compressed summary of the wave's findings, organized by theme rather than by iterator.

**Output:** 5 iterator reports + phase-2-packet.

### DISK CHECKPOINT: Phase 2 → Phase 3

**BLOCKING — do NOT dispatch Phase 3 synthesizers until all writes complete.**

1. **Verify all 5 iterator reports exist on disk** at `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md`. If any are missing, re-dispatch that iterator.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-2-packet.md`** — thematic summary of all findings, organized by confidence level, with contradictions and open questions flagged. This is what Phase 3 synthesizers will receive.
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 2 complete, Phase 3 in-progress. List all 5 iterator report paths.

Verify all files exist on disk before proceeding.

---

# Phase 3 — "3": Synthesize

**Mode: CONVERGENT. Build the narrative from evidence.**

**CRITICAL: Dispatch all 3 synthesizers as PARALLEL subagents using the Task tool.** All 3 Task calls MUST be in the SAME assistant message.

### How to plan the wave:

The orchestrator reads the phase-2-packet and assigns each of the 3 synthesizers a different **synthesis lens** — each builds a different narrative structure from the same evidence. Recommended lens assignments:

- **Synthesizer 1: Thematic synthesis** — Organize all findings into coherent themes. What are the 3–5 major themes that emerge? How do they relate to each other?
- **Synthesizer 2: Risk/opportunity synthesis** — What are the risks, vulnerabilities, or problems identified? What are the opportunities, strengths, or untapped potential? Rate severity/impact.
- **Synthesizer 3: Gap & implication synthesis** — What does the evidence NOT tell us? What are the implications of the findings for the stated audience? What decisions does this analysis enable or constrain?

The orchestrator MAY adjust these lenses based on what Phase 2 produced. For example, if the analysis is purely technical, replace the opportunity lens with a "technical debt synthesis" or "architecture fitness synthesis."

### Each synthesizer receives:
- The phase-0-packet (analysis question + quality criteria)
- The phase-2-packet (thematic summary of all Phase 2 findings)
- Their specific synthesis lens assignment from the orchestrator's plan

### Each synthesizer must:
1. **Write output to their designated file** at `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md` — this is the agent's PRIMARY deliverable. Write the file BEFORE returning.
2. **Synthesize** — don't just list findings; build a coherent narrative or framework
3. **Cite back** — every synthesis claim must trace to specific Phase 1/2 findings
4. **Rate confidence** — for the synthesis as a whole and for individual conclusions
5. **Identify blind spots** — what might this synthesis lens be missing?

### Synthesizer output format:

```markdown
# Synthesis: {Lens Name}

## Synthesis Approach
{How this synthesis lens was applied}

## Core Narrative
{The coherent story that emerges from the evidence through this lens — 1-2 paragraphs}

## Key Conclusions
### Conclusion 1: {title}
- **Supporting evidence:** {references to Phase 1/2 findings}
- **Confidence:** {high|medium|low}
- **Caveats:** {conditions under which this conclusion might not hold}

### Conclusion 2: {title}
...

## Blind Spots
- {What this lens might be missing or underweighting}

## Recommendations (if applicable)
- {High-level suggestions, NOT implementation plans}
```

### Synthesizer agent type:
Use a broad architectural/analytical specialist for all 3. They need broad thinking, not domain specialization.

### After all 3 synthesizers return:

The orchestrator reads all 3 synthesis reports and produces a **phase-3-packet** — a comparison of the 3 synthesis outputs, noting areas of agreement, divergence, and complementary insights.

**Output:** 3 synthesis reports + phase-3-packet.

### DISK CHECKPOINT: Phase 3 → Phase 4

**BLOCKING — do NOT dispatch the Phase 4 final synthesizer until all writes complete.**

1. **Verify all 3 synthesis reports exist on disk** at `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md`. If any are missing, re-dispatch that synthesizer.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-3-packet.md`** — comparison of the 3 synthesis outputs: where they agree, where they diverge, strongest conclusions, largest blind spots. This plus the raw Phase 3 artifacts are what Phase 4 receives.
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 3 complete, Phase 4 in-progress. List all 3 synthesis report paths.

Verify all files exist on disk before proceeding.

---

# Phase 4 — "1": Final Unified Analysis Report

**Mode: COMMIT. One report, fully evidenced.**

A single agent takes the 3 Phase 3 outputs and produces the final unified analysis report. This is NOT just "pick the best of 3" — it's a final synthesis that weaves together insights from all three lenses into a coherent, comprehensive analysis.

### The final synthesizer receives:
- The phase-0-packet (analysis question + quality criteria)
- The phase-3-packet (3 synthesis outputs, compared)
- The full Phase 3 artifacts (all 3 synthesis write-ups) — this is the one place where the agent reads raw artifacts, because it needs the full detail to produce the final report

### The final synthesizer must:
1. **Write the analysis report to `{ARTIFACT_ROOT}/phase-4/analysis-report.md`** — this is the agent's PRIMARY deliverable. Write the file BEFORE returning.
2. **Weave together** insights from all 3 synthesis lenses into a unified narrative
3. **Resolve contradictions** between synthesis outputs with explicit reasoning
4. **Verify completeness** — does the report address every aspect of the original analysis question from Phase 0?
5. **Check for blind spots** — did any investigation area's findings get lost during synthesis?
6. **Assess overall confidence** — how confident are we in the analysis as a whole?
7. **Produce the full analysis report** (see Output — Analysis Report below)

### Final synthesizer agent type:
Use a broad architectural/analytical specialist — same type as the Phase 3 synthesizers.

### DISK CHECKPOINT: Phase 4 Complete

**BLOCKING — the funnel is not complete until these writes succeed.**

1. **Verify the analysis report exists on disk** at `{ARTIFACT_ROOT}/phase-4/analysis-report.md`. If the Phase 4 agent failed to write it, extract the report from the agent's return value and write it yourself.
2. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 4 complete. Fill in the "Analysis Conclusion" section with 2-3 sentences. Mark all phases as complete in the Phase Completion checklist.

---

# Output — Analysis Report

The analysis report must be comprehensive enough to inform downstream decisions without requiring re-investigation.

## Structure:

### A) Executive Summary
Non-technical summary anyone could understand. 5–7 sentences covering: what was analyzed, the most important findings, and the key implications.

### B) Analysis Question & Scope
Restatement of what was analyzed and what was explicitly in/out of scope.

### C) Table of Contents
Every section of the report with 1–2 sentence summaries.

### D) Methodology
Brief description of what was investigated and how (which MCP tools, code areas, documents, etc.). This establishes credibility and traceability.

### E) Key Findings

Organized by theme (not by investigation area). Each finding:

```
### Finding: {TITLE}
**Confidence:** {high|medium|low}
**Evidence:** {specific code references, data, tool output}
**Impact:** {what this means — why it matters}
**Related findings:** {cross-references to other findings}
```

Findings should be ordered by a combination of confidence and impact — high-confidence, high-impact findings first.

### F) Analysis & Implications

The "so what" section. What do the findings mean when considered together? This is where the synthesis lenses combine:

- **Thematic patterns** — what recurring themes emerge across findings?
- **Risks & vulnerabilities** — what problems or dangers were identified?
- **Strengths & opportunities** — what's working well or could be leveraged?
- **Gaps & unknowns** — what couldn't be determined? What should be investigated further?

### G) Confidence Assessment

Overall assessment of how much to trust this analysis:

```
### Overall Confidence: {high|medium|low}

**Strongest claims** (high confidence):
- {claim 1} — {why we're confident}
- {claim 2} — {why we're confident}

**Moderate claims** (medium confidence):
- {claim 1} — {what would increase confidence}

**Weakest claims** (low confidence):
- {claim 1} — {why we're uncertain, what would help}

**Known blind spots:**
- {areas the analysis did not or could not cover}
```

### H) Recommendations

High-level recommendations, NOT implementation plans. Each recommendation:

```
### Recommendation: {TITLE}
**Priority:** {high|medium|low}
**Rationale:** {which findings support this}
**Trade-offs:** {what you'd be giving up or risking}
**Open questions:** {what needs to be answered before acting on this}
```

Recommendations are high-level only — do not include implementation details or execution plans.

### I) Open Questions

Questions that this analysis surfaced but did not answer. For each:
- The question itself
- Why it matters
- Suggested approach to answering it

### J) Appendix: Evidence Index

A reference table mapping every major finding to its evidence sources:

```
| Finding | Evidence Source | Type | Location |
|---------|---------------|------|----------|
| {title} | {file/tool/doc} | {code|data|doc|observation} | {path/URL} |
```

---

# Artifact Tracking

Write all phase outputs to an organized directory structure:

```
{ARTIFACT_ROOT}/
├── STATUS.md                    ← RECOVERY MANIFEST (always up-to-date)
├── phase-0/
│   └── analysis-brief.md       ← Question, domains, criteria, 5 investigation areas
├── phase-1/
│   ├── area-1-{slug}.md        ← Investigator 1 findings
│   ├── area-2-{slug}.md        ← Investigator 2 findings
│   ├── area-3-{slug}.md        ← Investigator 3 findings
│   ├── area-4-{slug}.md        ← Investigator 4 findings
│   └── area-5-{slug}.md        ← Investigator 5 findings
├── phase-2/
│   ├── iterator-1-{focus}.md   ← Iterator 1 output
│   ├── iterator-2-{focus}.md   ← Iterator 2 output
│   ├── iterator-3-{focus}.md   ← Iterator 3 output
│   ├── iterator-4-{focus}.md   ← Iterator 4 output
│   └── iterator-5-{focus}.md   ← Iterator 5 output
├── phase-3/
│   ├── synthesis-1.md          ← Synthesizer 1 output (thematic)
│   ├── synthesis-2.md          ← Synthesizer 2 output (risk/opportunity)
│   └── synthesis-3.md          ← Synthesizer 3 output (gaps/implications)
├── phase-4/
│   └── analysis-report.md      ← Final unified analysis report
└── context-packets/
    ├── phase-0-packet.md
    ├── phase-1-packet.md
    ├── phase-2-packet.md
    └── phase-3-packet.md
```

**Artifact root: `docs/{topic-slug}/`** where `{topic-slug}` is a short kebab-case name derived from the analysis topic (e.g., `docs/auth-audit/`, `docs/performance-analysis/`, `docs/codebase-health/`). This keeps analysis artifacts alongside project documentation and makes them discoverable by future sessions.

If the user specifies a different location (e.g., `tmp/`), use that instead.

### Recovery Manifest: STATUS.md

**This file is the single source of truth for crash recovery.** It MUST be updated at every phase transition. A new conversation with zero context should be able to read this one file and know exactly where things stand.

Write `STATUS.md` at `{ARTIFACT_ROOT}/STATUS.md` with this format:

```markdown
# Analysis Funnel Status: {topic}

## Current State
- **Phase:** {0|1|2|3|4}
- **Sub-state:** {e.g., "Phase 1: investigators 1-3 complete, 4-5 pending"}
- **Last updated:** {ISO timestamp}
- **Artifact root:** {absolute path}

## Analysis Question
{2-3 sentences from Phase 0 — what we're analyzing}

## Analysis Conclusion
{Filled after Phase 4 — 2-3 sentences summarizing the key finding}

## Domain Tags
{List from Phase 0}

## Phase Completion
- [x] Phase 0: Frame — {artifact path}
- [x] Phase 1: Investigate (5 areas) — {artifact path}
- [ ] Phase 2: Iterate (5 iterators) — iterators 1-3 done, 4-5 pending
- [ ] Phase 3: Synthesize (3 synthesizers)
- [ ] Phase 4: Final report

## Context Packets Available
- phase-0-packet.md: {1-line summary}
- phase-1-packet.md: {1-line summary}
- ...

## Recovery Instructions
To resume from this state:
1. Read this STATUS.md
2. Read the context packet for the current phase
3. Read any incomplete artifacts for the sub-state
4. Continue from where the sub-state indicates
```

**Update rules (MANDATORY — these are enforced by DISK CHECKPOINT blocks in each phase):**
- Update STATUS.md BEFORE starting each phase (mark it in-progress) — this happens as part of the DISK CHECKPOINT at the end of the preceding phase
- Update STATUS.md AFTER completing each phase (mark it done, link artifacts) — this happens as part of the DISK CHECKPOINT at the end of the completing phase
- Never delete previous entries — only update status fields
- **If STATUS.md does not exist when you are about to dispatch agents for ANY phase, STOP.** You have skipped a checkpoint. Write STATUS.md before proceeding.

---

# Context Management

**This is critical.** Without discipline here, agents run out of context window or produce degraded output from consuming too much upstream content.

### Context Budget Rules

Each agent dispatched via the Task tool has a finite context window. The funnel generates a LOT of content across phases. You must actively manage what goes into each agent's prompt.

#### Budget Tiers

| What the agent receives | Approximate token cost | Rule |
|------------------------|----------------------|------|
| Full phase output (e.g., all 5 reports) | 3,000–8,000 tokens per report | NEVER send to downstream agents |
| Context packet (1–2 pages) | 500–1,000 tokens | Safe to send; this is the designed handoff artifact |
| Single investigation area assignment | 200–500 tokens | Safe to send |
| Full analysis report | 2,000–5,000 tokens | Only for final review; individual agents get their assignment only |
| Codebase reads (file contents) | Varies wildly | Agent reads on-demand; do NOT pre-load files into prompt |

#### The Context Waterfall (what each phase/agent sees)

```
Phase 0 (orchestrator): analysis question input only
                         ↓ produces phase-0-packet (question + areas + criteria)

Phase 1 investigators:  phase-0-packet + their specific area assignment
  (5 parallel)           ↓ orchestrator reads all 5 reports, produces phase-1-packet

Phase 2 iterators:      phase-0-packet + phase-1-packet (compressed findings)
  (5 parallel)           ↓ orchestrator reads all 5 reports, produces phase-2-packet

Phase 3 synthesizers:   phase-0-packet + phase-2-packet (compressed Phase 2 output)
  (3 parallel)           ↓ orchestrator reads all 3 syntheses, produces phase-3-packet

Phase 4 final synth:    phase-0-packet + phase-3-packet + full Phase 3 artifacts
  (1 agent)              ↓ produces analysis-report
```

**Key principle: each agent sees packets from AT MOST 2 prior phases, never the raw artifacts. Exception: Phase 4 reads Phase 3 raw artifacts because it needs full detail for final synthesis.**

#### Context Packet Format (strict)

Each context packet MUST fit this template. If it exceeds ~1,000 tokens, it's too long — cut prose, keep data.

```markdown
# Context Packet: Phase {N}

## Key Findings
- {bullet list of most important findings, max 7}

## Confidence Levels
- {high-confidence findings}
- {medium-confidence findings}
- {low-confidence / uncertain findings}

## Contradictions & Open Questions
- {max 3 items that the next phase must address}

## Artifacts (read only if needed)
- {file path}: {1-line description}
```

#### Anti-Bloat Rules

1. **Never paste file contents into agent prompts.** Tell the agent which file to read; let it read on-demand.
2. **Never send "for reference" context.** If the agent doesn't need it for their specific task, don't include it.
3. **Summarize, don't excerpt.** If an investigator wrote 500 words about a finding, the packet says "Area 3 found high complexity in auth middleware — 4 verification paths with no shared abstraction (confidence: high)." That's it.
4. **One investigation task per agent prompt when possible.** If an agent handles 2+ tasks, they must be tightly related. Otherwise, dispatch separate agents.
5. **Agent prompts should be under 2,000 tokens** (excluding the skill/system prompt). If your prompt to a dispatched agent exceeds this, you're sending too much context.

---

# Agent Type Selection

When assigning agents to investigation areas and iteration tasks, the orchestrator selects from the available installed `subagent_type` values in the Task tool. The detected domains from Phase 0 guide this selection.

**Rules:**
- Every agent in the funnel MUST specify an explicit `subagent_type` value
- Match the task's primary domain to the most domain-relevant specialist available
- If a task spans multiple domains, pick the agent whose specialty covers the most critical aspect
- Do not default to generic agent types when a domain specialist is available
- The orchestrator has full discretion over which specific agents to use — the skill does not prescribe specific agent names

---

# Crash Recovery

Sessions crash, context gets lost, conversations expire. The funnel is designed to be **fully recoverable from local artifacts alone** — no conversation history required.

### What Gets Lost in a Crash

- The conversation context (messages, reasoning, intermediate thinking)
- Any agent state that wasn't written to disk
- The orchestrator's mental model of what's in progress

### What Survives a Crash

- Everything in `{ARTIFACT_ROOT}/` — STATUS.md, phase outputs, context packets
- Git state — branches, commits, worktrees

### Recovery Procedure

When starting a new conversation after a crash, or when the user says "recover" or "where were we":

#### Step 1: Find the artifact root

```
Look for STATUS.md in docs/ subdirectories:
  docs/*/STATUS.md
If multiple exist, show the user the list and ask which to resume.
```

#### Step 2: Read STATUS.md

This tells you:
- Which phase was in progress
- Which sub-steps were complete
- Where all artifacts live

#### Step 3: Read the relevant context packets

Based on the current phase from STATUS.md, read ONLY the packets needed:
- If resuming Phase 2: read phase-0-packet + phase-1-packet
- If resuming Phase 3: read phase-0-packet + phase-2-packet
- If resuming Phase 4: read phase-0-packet + phase-3-packet

**Do NOT read all artifacts.** The packets contain everything you need. Only read raw phase artifacts if a packet is missing or STATUS.md indicates an artifact was incomplete.

#### Step 4: Resume

Based on what you find:

| State | Action |
|-------|--------|
| **Mid-phase (e.g., Phase 1 investigators 1-3 done)** | Read completed artifacts + packets, dispatch remaining agents, continue |
| **Between phases (e.g., Phase 2 done, Phase 3 not started)** | Read the latest packet, proceed to next phase |
| **Phase 4 done** | Report is complete; present to user |
| **STATUS.md missing** | Scan artifact root for what exists, reconstruct state from file timestamps and contents, write STATUS.md before proceeding |

#### Step 5: Announce state to user

Before doing anything, tell the user:
```
Recovered funnel state for "{topic}":
- Phase: {current phase}
- Progress: {what's done / what's pending}
- Next action: {what you'll do next}

Proceed?
```

### Preventing Data Loss

These rules prevent the "crash and lose everything" scenario:

1. **Write STATUS.md before AND after every state transition.** This is a ~100-token write. Do it every time. No exceptions.
2. **Agents must write their output to disk before reporting completion.** Never rely on agent return values as the sole record.
3. **If STATUS.md does not exist when you are about to dispatch agents for ANY phase, STOP.** You have skipped a checkpoint. Write STATUS.md before proceeding.

---

# Stop Condition

**The funnel ends when the analysis report is written to disk.** There is no execution phase — the analysis report IS the deliverable.

---

# Quick Invocation

For rapid use, reference this skill and provide input from the current conversation:

```
Use the analysis funnel (5→5→3→1) on the following question. Output a fully structured
analysis report. Here is the input:

{paste or reference the question/topic from the conversation}
```

---

# Troubleshooting

**Agents in a wave produced redundant output:**
The orchestrator's task assignments for that wave weren't differentiated enough. Re-read the previous wave's output and reconsider how to assign tasks to the agents.

**Agents didn't follow their assigned task:**
The prompt was too vague or included too much context that distracted from the specific task. Re-dispatch with a more focused prompt and less background context.

**Findings lack evidence:**
The agent prompt didn't emphasize evidence gathering strongly enough, or the agent wasn't given the right MCP tools/file paths to investigate. Re-dispatch with explicit instructions to use specific tools and cite specific sources.

**Context packets are too long:**
Enforce the 1–2 page limit strictly. If you can't summarize a phase in 2 pages, the phase output needs restructuring, not a longer summary.

**User wants to skip phases:**
The funnel's value comes from the full pipeline. Skipping Phase 2 (iteration) is the most common request and the most dangerous — without it, raw investigation findings go directly to synthesis without being developed, validated, or cross-referenced. Push back gently but firmly.

**Agent ran out of context / output degraded:**
The agent prompt was too large. Check: (1) Are you sending raw phase artifacts instead of context packets? (2) Are you sending multiple tasks to one agent? (3) Are you pre-loading file contents into the prompt instead of letting the agent read on-demand? Fix: follow the Context Waterfall strictly — each agent sees packets from at most 2 prior phases. Agent prompts should be under 2,000 tokens.

**Crashed mid-funnel, no conversation context:**
Read `{ARTIFACT_ROOT}/STATUS.md`. It contains the full recovery state. Follow the Crash Recovery procedure — read STATUS.md, then the relevant context packets, then resume from the indicated sub-state. Do NOT re-read all phase artifacts.

**STATUS.md is missing or stale:**
Scan the artifact root directory. Check which phase folders exist and which contain complete artifacts. Look at file timestamps to determine order. Reconstruct STATUS.md from what you find, write it, then proceed with recovery. **This situation means the DISK CHECKPOINT rules were violated in the previous session.** After recovering, ensure all missing checkpoint artifacts (analysis-brief.md, context packets) are reconstructed before dispatching any new agents.

**Multiple funnel artifact roots exist:**
List all `docs/*/STATUS.md` files, show the user their topics and states, and ask which to resume.

**Analysis produced actionable recommendations — now what?**
The analysis report is the final deliverable. It's up to the user to decide what to do with the recommendations.
