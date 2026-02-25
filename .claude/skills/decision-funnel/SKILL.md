---
name: decision-funnel
description: Structured investigate-iterate-synthesize pipeline (5->5->3->1) that sends parallel agents to explore different facets of a problem, iterates on findings, progressively synthesizes, and produces a detailed execution plan
---

# Decision Funnel: 5→5→3→1 Investigation Method

A progressive investigation and synthesis pipeline. 5 parallel agents investigate, 5 parallel agents iterate and develop the findings, 3 agents synthesize, and 1 agent produces the final unified plan.

The power comes from **breadth of investigation** and **progressive synthesis** — each wave compresses and refines what came before. The orchestrator decides dynamically how to use each wave based on what the previous wave produced.

Based on the Double Diamond framework (British Design Council), Nominal Group Technique (NGT), and structured ideation best practices adapted for AI agent workflows.

**CRITICAL: Agent Type Discipline.** When this skill's output specifies agent types for execution, it MUST use specialized `subagent_type` values from the Task tool (e.g., `frontend-excellence:react-specialist`, `backend-development:backend-architect`, `feature-dev:code-reviewer`). NEVER default to generic types like `general-purpose`, `Explore`, or `Bash` when a domain-specific specialist exists. See Phase 0 Domain Detection and D.4 Agent Type Selection for the mapping.

**CRITICAL: Parallel Subagent Dispatch.** This skill MUST use the Task tool to dispatch work in parallel wherever phases are designed for independent execution. DO NOT run independent work sequentially in your own context — this wastes context window and removes the independence guarantee. Specifically:
- **Phase 1 (5 investigators):** Launch ALL 5 in a SINGLE message with 5 Task tool calls. They run in parallel.
- **Phase 2 (5 iterators):** Launch ALL 5 in a SINGLE message with 5 Task tool calls. They run in parallel.
- **Phase 3 (3 synthesizers):** Launch ALL 3 in a SINGLE message with 3 Task tool calls. They run in parallel.
- **Execution waves:** Launch all work units in a wave as parallel Task tool calls in a single message.
- To dispatch in parallel, include multiple `Task(...)` invocations in the same assistant message. The system runs them concurrently.

**CRITICAL: Disk Checkpoints Between Phases.** Every phase transition MUST write artifacts to disk BEFORE dispatching the next phase's agents. This is a BLOCKING requirement — if you skip the disk write step, a crash loses all work from the completed phase. Specifically:
- **After Phase 0**: Write `phase-0/problem-statement.md` + `context-packets/phase-0-packet.md` + `STATUS.md` BEFORE dispatching Phase 1 investigators.
- **After Phase 1**: Write `context-packets/phase-1-packet.md` + update `STATUS.md` BEFORE dispatching Phase 2 iterators.
- **After Phase 2**: Write `context-packets/phase-2-packet.md` + update `STATUS.md` BEFORE dispatching Phase 3 synthesizers.
- **After Phase 3**: Write `context-packets/phase-3-packet.md` + update `STATUS.md` BEFORE dispatching Phase 4 final synthesizer.
- **After Phase 4**: Update `STATUS.md` after the execution plan is written to disk.

If you find yourself about to dispatch agents without having written the preceding checkpoint files, STOP. Write the files first. No exceptions.

**CRITICAL: Every Agent Writes Its Own Output to Disk.** Agents MUST write their output to their designated file path BEFORE returning. The orchestrator should NEVER rely on extracting content from an agent's return value as the primary record. Each agent prompt MUST include the exact file path where the agent should write its output. If an agent returns without having written its file, treat it as a failed agent and re-dispatch. This applies to ALL phases:
- Phase 1 investigators write to `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md`
- Phase 2 iterators write to `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md`
- Phase 3 synthesizers write to `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md`
- Phase 4 final synthesizer writes to `{ARTIFACT_ROOT}/phase-4/execution-plan.md`

**CRITICAL: Use MCP Servers for Data.** Throughout every phase, actively use available MCP servers to query for real data rather than relying on assumptions or stale knowledge. This includes but is not limited to:
- **Context7** (`mcp__context7__*` / `mcp__plugin_context7_context7__*`) — Query up-to-date library documentation, API references, and code examples for any technology in the problem space. Use this before making claims about how a library or framework works.
- **Issue tracker** (e.g., `mcp__linear-server__*`) — Read issue descriptions, acceptance criteria, comments, and linked context. Never fabricate issue details.
- **Codebase tools** (e.g., `mcp__plugin_serena_serena__*`) — Use symbolic code analysis tools to understand existing architecture, find symbols, trace references, and read implementations. Prefer these over reading entire files.
- **Browser/Playwright** (e.g., `mcp__playwright__*`) — Validate UI assumptions by actually looking at the current state of the application during investigation phases, not just during execution.
- **Any other available MCP servers** — Check what's available and use them when they provide relevant data for the problem at hand.

The goal is to ground every phase in real data. Phase 1 investigators should reference actual code patterns found via MCP tools. Phase 2 iterators should verify claims against real documentation. Phase 4 work unit specs should reference real file paths confirmed by codebase queries.

```
INPUT (broad problem/requirement)
    │
    ▼
Phase 0: NORMALIZE ─── Define the problem, carve it into investigation areas
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
Phase 4: COMMIT ─────── 1 agent produces the final unified execution plan
    │
    ▼
OUTPUT (detailed execution plan ready for orchestration)
```

---

## When to Use This Skill

Use the decision funnel when:
- A problem has multiple valid approaches and picking wrong is expensive
- You need to defend against recency bias, novelty bias, or anchoring
- The output must be a structured execution plan with work unit specs, sequencing, and verification
- The decision will affect architecture, UX flow, or system design significantly

Do NOT use for:
- Single-line fixes or obvious changes
- Tasks where the approach is already decided
- Pure research or information gathering

---

## Input Requirements

Before running the funnel, gather these from the conversation or explicitly ask:

| Field | Description |
|-------|-------------|
| **Context** | What the conversation has established so far (requirements, constraints, prior decisions) |
| **Goal** | What "done" looks like — concrete, measurable |
| **Constraints** | Technical, scope, compatibility, accessibility, performance, etc. |
| **Non-goals** | Explicitly out of scope (prevents scope creep during divergence) |
| **Current state** | What exists today; relevant files, architecture, patterns |
| **Risks & sensitivities** | What must not break; backwards compatibility needs |
| **Verification** | How we validate the result works (tests, e2e, manual checks, visual inspection) |

If any of these are ambiguous, ask the user before starting Phase 0. Do not assume.

**Data gathering:** Use MCP servers to fill in gaps. Query the issue tracker for requirements, use codebase tools to understand current state, and fetch library docs via Context7 for any technology you're unfamiliar with. Do this BEFORE Phase 0, not during it.

---

# Phase 0 — Normalize the Problem

**Mode: CONVERGENT. No solutioning yet.**

The goal is to ensure everyone (human and agent) agrees on what the problem actually is before generating solutions.

1. **Restate the problem** in 5–10 bullet points. Strip opinions and solutions — focus on observable facts, user needs, and system requirements.
2. **List assumptions and unknowns.** Flag anything that could invalidate an approach if the assumption is wrong.
3. **Identify the problem domains** — classify which domains this problem touches (see Domain Detection below). This determines which specialist agent types are used across all phases.
4. **Define evaluation criteria with weights** BEFORE seeing any options (prevents retrofitting criteria to justify a favorite).
5. **Carve the problem into 5 investigation areas.** This is the most important step — it determines what Phase 1's 5 parallel investigators will each focus on. Each area should be a different **facet** of the problem, not a different solution. Examples:
   - For a UI redesign: area 1 = current component structure, area 2 = accessibility gaps, area 3 = design system patterns, area 4 = performance implications, area 5 = state management needs
   - For an auth refactor: area 1 = current token flow, area 2 = security attack vectors, area 3 = session management patterns, area 4 = cross-app SSO requirements, area 5 = migration path from current system
   - For a data model change: area 1 = current schema + queries, area 2 = downstream consumers, area 3 = migration strategy, area 4 = performance impact, area 5 = backwards compatibility

   **Rules for area carving:**
   - Areas explore different ASPECTS of the problem, not different solutions
   - Each area should map to a domain specialist agent type
   - Areas should have minimal overlap — if two areas would investigate the same files, merge them
   - Each area should be independently investigable (no area depends on another's results)

### Standard Evaluation Criteria

Adjust weights per problem. These are defaults:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| User impact | 20% | How much does this improve the user's experience? |
| Correctness | 20% | Does it solve the actual problem completely? |
| Complexity | 15% | How much cognitive/code complexity does it add? (lower is better) |
| Risk | 15% | What can go wrong? How bad is the failure mode? |
| Testability | 10% | Can we write clear, automated tests for this? |
| Maintainability | 10% | Will this be easy to understand and modify in 6 months? |
| Time-to-validate | 10% | How quickly can we prove it works or doesn't? |

### Domain Detection

Analyze the problem and tag all applicable domains. Each domain activates a specialist investigation lens (Phase 1) and a specialist agent type for all phases.

| Domain | Detected When | Investigation Focus | Agent Type |
|--------|--------------|---------------------|------------|
| **UI/Visual** | Problem involves layouts, styling, visual hierarchy, animations, theming | Aesthetics, consistency, visual hierarchy, responsiveness | UI/CSS specialist |
| **React/Components** | Problem involves component architecture, state, props, hooks, rendering | Component boundaries, re-render efficiency, hook correctness | React specialist |
| **State Management** | Problem involves stores, sync, real-time updates, caching | Data flow, race conditions, consistency guarantees | State management agent |
| **API/Backend** | Problem involves endpoints, data fetching, auth, server logic | Contracts, error handling, security, performance | Backend/API agent |
| **Database** | Problem involves schema, queries, migrations, data modeling | Normalization, query patterns, migration safety | Database agent |
| **GraphQL** | Problem involves schema design, resolvers, federation, subscriptions | Schema design, N+1 risks, type safety, caching | GraphQL specialist |
| **Auth/Security** | Problem involves authentication, authorization, tokens, encryption | Attack vectors, token handling, OWASP compliance | Security specialist |
| **Accessibility** | Problem involves screen readers, keyboard nav, ARIA, color contrast | WCAG compliance, assistive tech compatibility, focus management | Accessibility specialist |
| **Performance** | Problem involves load times, bundle size, rendering speed, memory | Bottlenecks, measurement methodology, regression risk | Performance specialist |
| **Testing** | Problem involves test strategy, coverage, E2E, mocking | Coverage gaps, flakiness risk, test maintainability | Testing specialist |
| **DevOps/Infra** | Problem involves CI/CD, deployment, monitoring, scaling | Deployment safety, rollback capability, observability | DevOps agent |
| **Mobile/Native** | Problem involves iOS, Android, React Native, responsive mobile UX | Platform conventions, gesture handling, offline behavior | Mobile specialist |

**Rules:**
- Tag 2–5 domains. If you tag more than 5, the problem may need to be decomposed into separate funnels.
- If you tag fewer than 2, you may be thinking too narrowly — most real problems span multiple domains.
- The detected domains directly determine which specialist agent types are used in Phase 1 investigation areas and throughout the funnel. See each phase for how they're used.

**Output:** Problem statement + assumptions + domain tags + weighted criteria table + **5 investigation areas with assigned agent types**.

### DISK CHECKPOINT: Phase 0 → Phase 1

**BLOCKING — do NOT dispatch Phase 1 investigators until all three writes complete.**

1. **Write `{ARTIFACT_ROOT}/phase-0/problem-statement.md`** — the full Phase 0 output (problem restatement, assumptions, domain tags, evaluation criteria, 5 investigation areas with agent types).
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-0-packet.md`** — the compressed context packet that Phase 1 investigators will receive. Use the Context Packet Format (see Context Management section).
3. **Write `{ARTIFACT_ROOT}/STATUS.md`** — initial recovery manifest marking Phase 0 complete and Phase 1 as in-progress. Include the problem summary, domain tags, and artifact paths.

Verify all three files exist on disk before proceeding. If any write fails, retry before dispatching agents.

---

# Phase 1 — "5": Investigate

**Mode: DIVERGENT. Breadth of understanding.**

**CRITICAL: Dispatch all 5 investigators as PARALLEL subagents using the Task tool.** All 5 Task calls MUST be in the SAME assistant message so they run concurrently. Do NOT investigate sequentially in your own context.

### How to plan the wave:

The orchestrator reads the Phase 0 output, decides what this wave of 5 agents needs to investigate, and assigns each agent a specific task.

### Each investigator receives:
- The phase-0-packet (problem statement, constraints, criteria)
- Their specific assigned task from the orchestrator's plan

### Each investigator must:
1. **Write output to their designated file** at `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md` — this is the agent's PRIMARY deliverable, not the return value. Write the file BEFORE returning.
2. **Analyze** their assigned area
3. **Produce multiple suggestions** within their area
4. **Provide an overall recommendation** for their area

### Investigator agent type selection:
Each investigator's `subagent_type` is determined by the domain of their assigned task (from the Domain Detection table → Agent Type Selection mapping in D.4). Match the agent type to the task's domain.

### After all 5 investigators return:

The orchestrator reads all 5 investigation reports and produces a **phase-1-packet** — a compressed summary of the wave's findings.

**Output:** 5 investigation reports (one per area) + phase-1-packet.

### DISK CHECKPOINT: Phase 1 → Phase 2

**BLOCKING — do NOT dispatch Phase 2 iterators until all writes complete.**

1. **Verify all 5 investigation reports exist on disk** at `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md`. If any are missing (agent failed to write), re-dispatch that investigator.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-1-packet.md`** — compressed findings from all 5 investigators. Use the Context Packet Format. This is what Phase 2 iterators will receive — NOT the raw reports.
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 1 complete, Phase 2 in-progress. List all 5 investigation report paths.

Verify all files exist on disk before proceeding. If any write fails, retry before dispatching agents.

---

# Phase 2 — "5": Iterate and Develop

**Mode: DIVERGENT→CONVERGENT. Build on what was found.**

**CRITICAL: Dispatch all 5 iterators as PARALLEL subagents using the Task tool.** All 5 Task calls MUST be in the SAME assistant message.

### How to plan the wave:

The orchestrator reads the phase-1-packet, decides what this wave of 5 agents needs to accomplish based on what Phase 1 produced, and assigns each agent a specific task.

### Each iterator receives:
- The phase-0-packet (problem + criteria)
- The phase-1-packet (compressed findings from all 5 investigators)
- Their specific assigned task from the orchestrator's plan

### Each iterator must:
1. **Write output to their designated file** at `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md` — this is the agent's PRIMARY deliverable. Write the file BEFORE returning.
2. **Analyze** the Phase 1 findings through their assigned task
3. **Produce multiple suggestions**
4. **Provide an overall recommendation** for their area

### Iterator agent type selection:
Iterators should generally be `feature-dev:code-architect`. For highly domain-specific tasks, use the domain specialist from the Agent Type Selection table.

### After all 5 iterators return:

The orchestrator reads all 5 iterator reports and produces a **phase-2-packet** — a compressed summary of the wave's findings.

**Output:** 5 iterator reports + phase-2-packet.

### DISK CHECKPOINT: Phase 2 → Phase 3

**BLOCKING — do NOT dispatch Phase 3 synthesizers until all writes complete.**

1. **Verify all 5 iterator reports exist on disk** at `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md`. If any are missing, re-dispatch that iterator.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-2-packet.md`** — catalog of all distinct suggestions and recommendations, grouped by similarity, annotated with evaluation criteria fit. This is what Phase 3 synthesizers will receive.
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 2 complete, Phase 3 in-progress. List all 5 iterator report paths.

Verify all files exist on disk before proceeding.

---

# Phase 3 — "3": Synthesize

**Mode: CONVERGENT. Compress and reconcile.**

**CRITICAL: Dispatch all 3 synthesizers as PARALLEL subagents using the Task tool.** All 3 Task calls MUST be in the SAME assistant message.

### How to plan the wave:

The orchestrator reads the phase-2-packet, decides what this wave of 3 agents needs to accomplish based on what Phase 2 produced, and assigns each agent a specific task.

### Each synthesizer receives:
- The phase-0-packet (problem + criteria)
- The phase-2-packet (all developed suggestions from the 5 iterators)
- Their specific assigned task from the orchestrator's plan

### Each synthesizer must:
1. **Write output to their designated file** at `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md` — this is the agent's PRIMARY deliverable. Write the file BEFORE returning.
2. **Analyze** the Phase 2 findings through their assigned task
3. **Produce multiple suggestions**
4. **Provide an overall recommendation** for their area

### Synthesizer agent type:
Use `feature-dev:code-architect` for all 3. They need broad architectural thinking, not domain specialization.

### After all 3 synthesizers return:

The orchestrator reads all 3 synthesis reports and produces a **phase-3-packet** — a compressed summary of the wave's findings, to be used as input for the Phase 4 final synthesis.

**Output:** 3 synthesis reports + phase-3-packet.

### DISK CHECKPOINT: Phase 3 → Phase 4

**BLOCKING — do NOT dispatch the Phase 4 final synthesizer until all writes complete.**

1. **Verify all 3 synthesis reports exist on disk** at `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md`. If any are missing, re-dispatch that synthesizer.
2. **Write `{ARTIFACT_ROOT}/context-packets/phase-3-packet.md`** — comparison of the 3 synthesis outputs against evaluation criteria, areas of agreement/divergence, strongest candidates. This plus the raw Phase 3 artifacts are what Phase 4 receives.
3. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 3 complete, Phase 4 in-progress. List all 3 synthesis report paths.

Verify all files exist on disk before proceeding.

---

# Phase 4 — "1": Final Synthesis into Execution Plan

**Mode: COMMIT. One plan, fully detailed.**

A single agent takes the 3 Phase 3 outputs and produces the final unified execution plan. This is NOT just "pick the best of 3" — it's a final synthesis that may combine elements from multiple Phase 3 outputs.

### The final synthesizer receives:
- The phase-0-packet (problem + criteria)
- The phase-3-packet (3 synthesis outputs, compared)
- The full Phase 3 artifacts (all 3 synthesis write-ups) — this is the one place where the agent reads raw artifacts, because it needs the full detail to produce the final plan

### The final synthesizer must:
1. **Write the execution plan to `{ARTIFACT_ROOT}/phase-4/execution-plan.md`** — this is the agent's PRIMARY deliverable. Write the file BEFORE returning.
2. **Select and combine** the strongest elements from across Phase 3 outputs
3. **Justify the selection** against the evaluation criteria with specific reasoning
4. **Verify completeness** — does the final plan address every aspect of the original problem statement from Phase 0?
5. **Check for blind spots** — did any investigation area's concerns get lost during synthesis?
6. **Produce the full execution plan** (see Output — Execution Plan below)

### Final synthesizer agent type:
Use `feature-dev:code-architect`.

### DISK CHECKPOINT: Phase 4 Complete

**BLOCKING — the funnel is not complete until these writes succeed.**

1. **Verify the execution plan exists on disk** at `{ARTIFACT_ROOT}/phase-4/execution-plan.md`. If the Phase 4 agent failed to write it, extract the plan from the agent's return value and write it yourself.
2. **Update `{ARTIFACT_ROOT}/STATUS.md`** — mark Phase 4 complete. Fill in the "Chosen Approach" section with 2-3 sentences. Mark all phases as complete in the Phase Completion checklist.

---

# Output — Execution Plan

The execution plan must be detailed enough that an orchestration system (e.g., subagent-workflow) can execute it without further clarification.

## Structure:

### A) ELI5 Explanation
Non-technical summary anyone could understand. 3–5 sentences.

### B) 5-Sentence Summary
What will change, at a technical level, in exactly 5 sentences.

### C) Table of Contents
Every section of the plan with 1–2 sentence summaries.

### D) Full Detailed Plan

#### D.1) Architecture / Approach Summary
How the chosen plan works. Diagrams if helpful. Key patterns and decisions.

#### D.2) Step-by-Step Implementation Sequence
Ordered list of what gets built/changed and in what order. Include dependency arrows between steps.

#### D.3) Work Unit Specs

Define the units of work that the orchestration workflow will turn into real tickets (in Linear, GitHub Issues, or whatever tracker the project uses). **This skill does NOT create tickets** — it produces specs. The orchestration workflow (e.g., `Skill(subagent-workflow)`) is responsible for creating actual tickets, assigning them, and tracking their state.

Each work unit spec:

```
### Work Unit: {TITLE}
**Objective:** What this unit accomplishes
**Files/areas touched:** List of files or modules
**Implementation notes:** Key decisions, patterns to follow, gotchas
**Acceptance criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
**Tests/verification:**
- [ ] Test 1
- [ ] Test 2
**Risks/rollback:** What could go wrong and how to undo it
**Dependencies:** Which other work units must complete before this one
**Recommended agent type:** `subagent_type` value (see D.4)
```

##### Recommended Ticket Breakdown

After the work unit specs, include a **recommended ticket breakdown** — guidance for the orchestration workflow on how to turn these work units into actual tickets in the issue tracker. This is a recommendation, not the tickets themselves.

```
## Recommended Ticket Breakdown

### Ticket strategy: {one-ticket-per-unit | grouped | phased}

| Suggested Ticket | Work Units Covered | Rationale |
|------------------|--------------------|-----------|
| "{ticket title}" | Units 1, 2 | Same component, tightly coupled changes |
| "{ticket title}" | Unit 3 | Independent, can parallelize |
| "{ticket title}" | Units 4, 5 | Sequential dependency, same feature area |

### Parallelization recommendation
- **Wave 1 (parallel):** Tickets A, B — no dependencies
- **Wave 2 (after wave 1):** Ticket C — depends on A
- **Wave 3 (after wave 2):** Ticket D — integration/verification

### Sizing guidance
- Each ticket should be completable by a single agent in one session
- If a work unit is too large for one agent session, split it and note the split
- Group tightly-coupled work units into one ticket to avoid cross-ticket coordination
```

The orchestration workflow reads this breakdown and creates the actual tickets. This keeps the decision funnel's output as a plan/recommendation while giving the orchestrator clear guidance.

#### D.4) Agent/Task Orchestration Plan
How the orchestration workflow should divide work across parallel agents. Agent types MUST be selected from the available `subagent_type` options in the Task tool (see Agent Type Selection below).

- **Agent assignments per work unit** — map each unit to a specific `subagent_type` based on domain match
- **Context allocation per agent** — what each agent receives (keep minimal; summarize, don't dump)
- **Expected outputs per agent** — files, PRs, test results, notes
- **Parallelization strategy** — which work units can run simultaneously vs. sequentially

**IMPORTANT: Parallel dispatch mechanics.** The orchestrator MUST launch independent work units as multiple Task tool calls in a SINGLE assistant message. This is how the Task tool achieves parallelism — multiple calls in one message run concurrently. Sequential messages = sequential execution. Specifically:
```
// CORRECT — parallel (all in one message):
Task(subagent_type="react-specialist", prompt="Work unit 1: ...")
Task(subagent_type="backend-architect", prompt="Work unit 2: ...")
Task(subagent_type="css-expert", prompt="Work unit 3: ...")

// WRONG — sequential (separate messages):
Message 1: Task(subagent_type="react-specialist", prompt="Work unit 1: ...")
Message 2: Task(subagent_type="backend-architect", prompt="Work unit 2: ...")
Message 3: Task(subagent_type="css-expert", prompt="Work unit 3: ...")
```

##### Agent Type Selection

When assigning agents to work units, select from the available specialized `subagent_type` values in the Task tool. Match the work unit's primary domain to the most specific agent type available. **Do NOT default to generic agent types (e.g., "general-purpose", "Explore", "Bash") when a specialist exists.**

Map domains from Phase 0 to agent types:

| Domain | Preferred `subagent_type` | Fallback |
|--------|--------------------------|----------|
| UI/Visual | `frontend-excellence:css-expert`, `ui-design:ui-designer` | `frontend-excellence:component-architect` |
| React/Components | `frontend-excellence:react-specialist` | `frontend-excellence:component-architect` |
| State Management | `frontend-excellence:state-manager` | `frontend-excellence:react-specialist` |
| API/Backend | `backend-development:backend-architect` | `javascript-typescript:typescript-pro` |
| Database | `database-design:database-architect`, `database-design:sql-pro` | `backend-development:backend-architect` |
| GraphQL | `backend-development:graphql-architect` | `backend-development:backend-architect` |
| Auth/Security | `backend-development:backend-architect` | `javascript-typescript:typescript-pro` |
| Accessibility | `accessibility-compliance:ui-visual-validator` | `ui-design:accessibility-expert` |
| Performance | `frontend-excellence:frontend-optimizer` | `frontend-excellence:react-specialist` |
| Testing | `backend-development:tdd-orchestrator` | `javascript-typescript:typescript-pro` |
| DevOps/Infra | `shell-scripting:bash-pro` | `Bash` |
| Mobile/Native | `multi-platform-apps:mobile-developer` | `multi-platform-apps:flutter-expert` |
| Code Review | `feature-dev:code-reviewer`, `code-refactoring:code-reviewer` | `feature-dev:code-reviewer` |
| Architecture | `feature-dev:code-architect` | `backend-development:backend-architect` |
| Codebase Analysis | `feature-dev:code-explorer` | `Explore` |

**Rules:**
- Every work unit in the orchestration plan MUST specify an explicit `subagent_type` value
- If a work unit spans multiple domains, pick the agent whose specialty covers the most critical aspect
- For review work units, always use a `code-reviewer` variant
- For initial codebase exploration before implementation, use `feature-dev:code-explorer`

#### D.5) Checkpoints Between Milestones
After each milestone:

- What to verify (tests, lint, typecheck, e2e, visual inspection)
- What constitutes "stop and fix before continuing"
- What constitutes "good enough, proceed"

#### D.6) Branch and Merge Strategy
- Sync from mainline before starting (if applicable)
- Feature branch naming convention
- Commit strategy (per work unit? per milestone?)
- Final verification before merge/handoff

---

# Artifact Tracking

Write all phase outputs to an organized directory structure:

```
{ARTIFACT_ROOT}/
├── STATUS.md                    ← RECOVERY MANIFEST (always up-to-date)
├── phase-0/
│   └── problem-statement.md     ← Problem, domains, criteria, 5 investigation areas
├── phase-1/
│   ├── area-1-{slug}.md         ← Investigator 1 findings
│   ├── area-2-{slug}.md         ← Investigator 2 findings
│   ├── area-3-{slug}.md         ← Investigator 3 findings
│   ├── area-4-{slug}.md         ← Investigator 4 findings
│   └── area-5-{slug}.md         ← Investigator 5 findings
├── phase-2/
│   ├── iterator-1-{focus}.md    ← Iterator 1 output
│   ├── iterator-2-{focus}.md    ← Iterator 2 output
│   ├── iterator-3-{focus}.md    ← Iterator 3 output
│   ├── iterator-4-{focus}.md    ← Iterator 4 output
│   └── iterator-5-{focus}.md    ← Iterator 5 output
├── phase-3/
│   ├── synthesis-1.md           ← Synthesizer 1 output
│   ├── synthesis-2.md           ← Synthesizer 2 output
│   └── synthesis-3.md           ← Synthesizer 3 output
├── phase-4/
│   └── execution-plan.md        ← Final unified plan
├── context-packets/
│   ├── phase-0-packet.md
│   ├── phase-1-packet.md
│   ├── phase-2-packet.md
│   └── phase-3-packet.md
└── execution/                   ← Created during orchestration
    ├── ticket-status.md
    └── agent-outputs/
        ├── ticket-1/
        ├── ticket-2/
        └── ...
```

**Artifact root: `docs/{topic-slug}/`** where `{topic-slug}` is a short kebab-case name derived from the investigation topic (e.g., `docs/round-recap-flow/`, `docs/ui-redesign/`, `docs/auth-refactor/`). This keeps investigation artifacts alongside project documentation and makes them discoverable by future sessions.

If the user specifies a different location (e.g., `tmp/`), use that instead.

### Recovery Manifest: STATUS.md

**This file is the single source of truth for crash recovery.** It MUST be updated at every phase transition and every ticket state change. A new conversation with zero context should be able to read this one file and know exactly where things stand.

Write `STATUS.md` at `{ARTIFACT_ROOT}/STATUS.md` with this format:

```markdown
# Decision Funnel Status: {topic}

## Current State
- **Phase:** {0|1|2|3|4|execution}
- **Sub-state:** {e.g., "Phase 1: investigators 1-3 complete, 4-5 pending" or "Execution: work units 1-3 done, unit 4 in progress"}
- **Last updated:** {ISO timestamp}
- **Artifact root:** {absolute path}

## Problem Summary
{2-3 sentences from Phase 0 — what we're solving}

## Chosen Approach
{Filled after Phase 4 — 2-3 sentences on what was selected and why}

## Domain Tags
{List from Phase 0}

## Phase Completion
- [x] Phase 0: Normalize — {artifact path}
- [x] Phase 1: Investigate (5 areas) — {artifact path}
- [ ] Phase 2: Iterate (5 iterators) — iterators 1-3 done, 4-5 pending
- [ ] Phase 3: Synthesize (3 synthesizers)
- [ ] Phase 4: Final plan
- [ ] Execution

## Execution Progress (if in execution)
| Ticket | Title | Agent Type | Status | Branch/PR | Notes |
|--------|-------|------------|--------|-----------|-------|
| 1 | ... | `react-specialist` | done | PR #45 | merged |
| 2 | ... | `backend-architect` | in-progress | feat/... | blocked on ticket 1 |
| 3 | ... | `css-expert` | pending | — | — |

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
- During execution, update after each ticket completes or changes state
- Never delete previous entries — only update status fields
- **If STATUS.md does not exist when you are about to dispatch agents for ANY phase, STOP.** You have skipped a checkpoint. Write STATUS.md before proceeding.

---

# Context Management

**This is critical.** Without discipline here, agents run out of context window or produce degraded output from consuming too much upstream content. This is the most common failure mode of the 5→5→3→1 method.

### Context Budget Rules

Each agent dispatched via the Task tool has a finite context window. The funnel generates a LOT of content across phases. You must actively manage what goes into each agent's prompt.

#### Budget Tiers

| What the agent receives | Approximate token cost | Rule |
|------------------------|----------------------|------|
| Full phase output (e.g., all 5 options) | 3,000–8,000 tokens per option | NEVER send to downstream agents |
| Context packet (1–2 pages) | 500–1,000 tokens | Safe to send; this is the designed handoff artifact |
| Single work unit spec with implementation notes | 200–500 tokens | Safe to send |
| Full execution plan | 2,000–5,000 tokens | Only send to orchestrator; individual agents get their work unit only |
| Codebase reads (file contents) | Varies wildly | Agent reads on-demand; do NOT pre-load files into prompt |

#### The Context Waterfall (what each phase/agent sees)

```
Phase 0 (orchestrator): problem input only
                         ↓ produces phase-0-packet (problem + areas + criteria)

Phase 1 investigators:  phase-0-packet + their specific area assignment
  (5 parallel)           ↓ orchestrator reads all 5 reports, produces phase-1-packet

Phase 2 iterators:      phase-0-packet + phase-1-packet (compressed findings)
  (5 parallel)           ↓ orchestrator reads all 5 reports, produces phase-2-packet

Phase 3 synthesizers:   phase-0-packet + phase-2-packet (compressed Phase 2 output)
  (3 parallel)           ↓ orchestrator reads all 3 syntheses, produces phase-3-packet

Phase 4 final synth:    phase-0-packet + phase-3-packet + full Phase 3 artifacts
  (1 agent)              ↓ produces execution-plan

Execution agents:       goal (from phase-0-packet) + plan (from phase-4)
                        + their specific work unit(s) ONLY
```

**Key principle: each agent sees packets from AT MOST 2 prior phases, never the raw artifacts. Exception: Phase 4 reads Phase 3 raw artifacts because it needs full detail for final synthesis.**

#### Context Packet Format (strict)

Each context packet MUST fit this template. If it exceeds ~1,000 tokens, it's too long — cut prose, keep data.

```markdown
# Context Packet: Phase {N}

## Decisions Made
- {bullet list of key decisions, max 5}

## Key Data
- {scores, rankings, numbers — not prose}

## Carry-Forward Concerns
- {max 3 items that the next phase must address}

## Artifacts (read only if needed)
- {file path}: {1-line description}
```

#### Anti-Bloat Rules

1. **Never paste file contents into agent prompts.** Tell the agent which file to read; let it read on-demand.
2. **Never send "for reference" context.** If the agent doesn't need it for their specific work unit, don't include it.
3. **Summarize, don't excerpt.** If an investigator wrote 500 words about a risk, the packet says "Area 3 found high risk in auth integration — token flow incompatible with proposed change." That's it.
4. **One work unit per agent prompt when possible.** If an agent handles 2+ units, they must be tightly related (same files, same feature). Otherwise, dispatch separate agents.
5. **Agent prompts should be under 2,000 tokens** (excluding the skill/system prompt). If your prompt to a dispatched agent exceeds this, you're sending too much context.

---

# Crash Recovery

Sessions crash, context gets lost, conversations expire. The funnel is designed to be **fully recoverable from local artifacts alone** — no conversation history required.

### What Gets Lost in a Crash

- The conversation context (messages, reasoning, intermediate thinking)
- Any agent state that wasn't written to disk
- The orchestrator's mental model of what's in progress

### What Survives a Crash

- Everything in `{ARTIFACT_ROOT}/` — STATUS.md, phase outputs, context packets, execution artifacts
- Git state — branches, commits, worktrees, PRs
- Issue tracker state — Linear/ticket statuses, comments

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
- Which tickets were in flight
- Where all artifacts live

#### Step 3: Read the relevant context packets

Based on the current phase from STATUS.md, read ONLY the packets needed:
- If resuming Phase 2: read phase-0-packet + phase-1-packet
- If resuming Phase 3: read phase-0-packet + phase-2-packet
- If resuming execution: read phase-0-packet + phase-4-packet (execution plan)

**Do NOT read all artifacts.** The packets contain everything you need. Only read raw phase artifacts if a packet is missing or STATUS.md indicates an artifact was incomplete.

#### Step 4: Check git and ticket state

```bash
# Check for in-flight branches
git branch --list 'feat/*' --list 'fix/*'

# Check for active worktrees
git worktree list

# Check for open PRs
gh pr list --state open
```

Cross-reference with STATUS.md's execution progress table.

#### Step 5: Resume

Based on what you find:

| State | Action |
|-------|--------|
| **Mid-phase (e.g., Phase 1 investigators 1-3 done)** | Read completed artifacts + packets, dispatch remaining agents, continue |
| **Between phases (e.g., Phase 2 done, Phase 3 not started)** | Read the latest packet, proceed to next phase |
| **Mid-execution (some tickets done)** | Read execution plan + ticket-status.md, dispatch agents for remaining tickets |
| **Execution done but not merged** | Check PR state, run verification, proceed to merge |
| **STATUS.md missing** | Scan artifact root for what exists, reconstruct state from file timestamps and contents, write STATUS.md before proceeding |

#### Step 6: Announce state to user

Before doing anything, tell the user:
```
Recovered funnel state for "{topic}":
- Phase: {current phase}
- Progress: {what's done / what's pending}
- Next action: {what you'll do next}

Proceed?
```

### Preventing Data Loss During Execution

These rules prevent the "crash and lose everything" scenario:

1. **Write STATUS.md before AND after every state transition.** This is a ~100-token write. Do it every time. No exceptions.
2. **Agents must write their output to disk before reporting completion.** Never rely on agent return values as the sole record.
3. **Commit incrementally during execution.** After each ticket completes and passes checks, commit to the feature branch. Don't batch commits at the end.
4. **Execution agents write to `{ARTIFACT_ROOT}/execution/agent-outputs/ticket-{N}/`.** Each agent writes:
   - `summary.md` — what was done, what files changed
   - `status.md` — pass/fail, test results, any issues
5. **The orchestrator updates `{ARTIFACT_ROOT}/execution/ticket-status.md`** after each agent completes, with a simple table matching the STATUS.md format.

---

# Stop Condition

**Do not execute.** This skill produces a plan only. Output the execution plan and stop.

To execute, the user must explicitly invoke their orchestration workflow (e.g., `Skill(subagent-workflow)`) with the plan as input.

---

# Quick Invocation

For rapid use, reference this skill and provide input from the current conversation:

```
Use the decision funnel (5→5→3→1) on the following. Output a fully structured
execution plan ready for orchestration. Here is the input:

{paste or reference the requirement/spec/problem from the conversation}
```

---

# Troubleshooting

**Agents in a wave produced redundant output:**
The orchestrator's task assignments for that wave weren't differentiated enough. Re-read the previous wave's output and reconsider how to assign tasks to the agents.

**Agents didn't follow their assigned task:**
The prompt was too vague or included too much context that distracted from the specific task. Re-dispatch with a more focused prompt and less background context.

**Context packets are too long:**
Enforce the 1–2 page limit strictly. If you can't summarize a phase in 2 pages, the phase output needs restructuring, not a longer summary.

**User wants to skip phases:**
The funnel's value comes from the full pipeline. Skipping Phase 2 (iteration) is the most common request and the most dangerous — without it, raw investigation findings go directly to synthesis without being developed. Push back gently but firmly.

**Agent ran out of context / output degraded:**
The agent prompt was too large. Check: (1) Are you sending raw phase artifacts instead of context packets? (2) Are you sending multiple work units to one agent? (3) Are you pre-loading file contents into the prompt instead of letting the agent read on-demand? Fix: follow the Context Waterfall strictly — each agent sees packets from at most 2 prior phases. Agent prompts should be under 2,000 tokens.

**Crashed mid-funnel, no conversation context:**
Read `{ARTIFACT_ROOT}/STATUS.md`. It contains the full recovery state. Follow the Crash Recovery procedure — read STATUS.md, then the relevant context packets, then resume from the indicated sub-state. Do NOT re-read all phase artifacts.

**STATUS.md is missing or stale:**
Scan the artifact root directory. Check which phase folders exist and which contain complete artifacts. Look at file timestamps to determine order. Reconstruct STATUS.md from what you find, write it, then proceed with recovery. **This situation means the DISK CHECKPOINT rules were violated in the previous session.** After recovering, ensure all missing checkpoint artifacts (problem-statement.md, context packets) are reconstructed before dispatching any new agents.

**Context packets are missing but phase artifacts exist:**
This means the orchestrator completed a phase but skipped the DISK CHECKPOINT. Reconstruct the missing context packet by reading the raw phase artifacts and compressing them into the Context Packet Format. Write the packet to disk, then update STATUS.md, before proceeding to the next phase.

**Multiple funnel artifact roots exist:**
List all `docs/*/STATUS.md` files, show the user their topics and states, and ask which to resume.
