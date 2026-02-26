# Phase 2: Content Architecture Blueprint
## Multi-Agent Orchestration Pillar + Cluster Strategy

**Date:** 2026-02-25
**Document Type:** Content Architecture & Internal Linking Strategy
**Status:** Ready for Implementation
**Building On:** Phase 1 findings (Areas 1–5) + sub-agent orchestration transcript analysis

---

## Executive Summary

This document defines the complete content architecture for Detached Node's first pillar-cluster publication sequence. The strategy establishes:

1. **One pillar page** covering the full multi-agent orchestration landscape (4,500 words)
2. **Eight cluster articles** drilling into specific operational and conceptual concepts (2,000–3,500 words each)
3. **Three supporting concept pieces** (opinion/philosophy posts) that earn backlinks and domain authority
4. **A URL structure** optimized for siloing and topical authority
5. **An internal linking matrix** specifying anchor text, link direction, and relevance
6. **Publication sequencing** to maximize early SEO impact
7. **Schema markup specifications** per article type

**Key Differentiation:** Annotated practitioner artifacts (skill files, configs, cost tables) embedded in prose; failure mode diagrams; and cost breakdowns with disclosed methodology — formats that have no established competition in this space.

**Target Audience:** Intermediate-to-advanced AI coding practitioners (1–6 months into Claude Code adoption) seeking frameworks for reliability, cost control, and orchestration patterns.

---

## I. Pillar Page Architecture

### A. Pillar Page: "Multi-Agent Orchestration with Claude Code: The Practitioner's Field Guide"

**Target Keywords:** "multi-agent orchestration Claude Code," "parallel AI agents," "Claude Code sub-agent guide," "AI agent coordination"

**URL:** `/posts/multi-agent-orchestration/`

**Word Count Target:** 4,500–5,000 words

**Primary Goal:** Serve as a navigational hub for readers discovering the topic. Provide enough depth that a skimming reader understands the full landscape, and provide clear links to cluster articles for deeper dives on specific techniques.

#### Pillar Page Structure

```
H1: Multi-Agent Orchestration with Claude Code: The Practitioner's Field Guide

[Hook Paragraph — 3–4 sentences answering the core question for featured snippet capture]
"Claude Code allows you to dispatch multiple AI agents as specialized workers on isolated tasks.
This guide covers the architectural patterns, isolation techniques, and design frameworks that
practitioners use to orchestrate agents reliably at scale. Whether you're running two parallel
specialists or building a complex supervisor-worker topology, this field guide maps the full
decision landscape."

## [H2: The Multi-Agent Opportunity (and Why It Matters Now)]
[Context: Why now? Feb 2026 watershed. Everyone is multi-agent. Pain points it solves.]

### [H3: The Trust Problem — Why Single Agents Fail at Scale]
[Concept: Single agent as bottleneck. Hallucinations that no one catches. Long context windows that
degrade. Lack of specialization.]

### [H3: The Orchestration Solution — Parallel Specialists]
[Concept: Multiple agents, each constrained to a role. Reduces hallucination surface. Enables redundancy.
Lowers cost through model routing.]

## [H2: The Architectural Landscape — Five Patterns You Need to Know]
[Structure this as an index that the reader can scan, with each pattern linked to its cluster article.]

### [H3: Pattern 1 — Filesystem Isolation via Git Worktrees]
[1–2 paragraphs explaining why isolation at the filesystem level matters. Link: "Git Worktrees for
Parallel AI Agents: Complete Operational Guide"]

### [H3: Pattern 2 — Specialist Design via Skill Files]
[1–2 paragraphs on how to design sub-agents with constrained responsibility. Link: "Designing Specialist
Sub-Agents: The Skill File Annotated"]

### [H3: Pattern 3 — Node-Locality and Agent Perspective]
[1–2 paragraphs on why agent perspective matters. Link: "Node-Locality: Why Agent Perspective Matters
More Than Agent Capability"]

### [H3: Pattern 4 — Redundancy and the Venn Dispatch Pattern]
[1–2 paragraphs on using overlapping specialists to validate. Link: "Hallucination Mitigation Through
Redundancy: The Venn Dispatch Pattern"]

### [H3: Pattern 5 — Structured Review Waves and Human Gates]
[1–2 paragraphs on iterative feedback loops. Link: "Iterative Review Waves: Structuring Feedback Loops
with Human Gates"]

## [H2: Three Critical Design Constraints]

### [H3: Context as a Finite Resource]
[Explain context window budgeting. Link to "Context Bounding: Keeping Sub-Agent Windows Clean"]

### [H3: Probability as a First-Class Constraint]
[Explain non-determinism and designing for it. Link to "Probability-Aware Workflows: Designing AI
Systems for Non-Determinism"]

### [H3: Cost Amplification and Model Routing]
[Explain why model selection matters at scale. Link to "Opus Orchestrates, Sonnet Executes: The Cost
Case for Mixed-Model Dispatch"]

## [H2: Getting Started — A 3-Stage Progression]

### [H3: Stage 1 — Single Supervisor, Two Specialists]
[Simplified entry point. Which cluster articles to read first.]

### [H3: Stage 2 — Expanded Specialist Pool + Redundancy]
[Medium complexity. What to read next.]

### [H3: Stage 3 — Custom Orchestrator + Probability Modeling]
[Advanced. Full recommended reading sequence.]

## [H2: Concept Dependency Map]
[ASCII or simple Mermaid diagram showing which concepts to read in order.]

## [H2: Common Pitfalls + How to Avoid Them]

### [H3: Pitfall 1 — Infinite Sub-Agent Proliferation]
[Why more agents don't mean better coverage. Links to Venn and node-locality articles.]

### [H3: Pitfall 2 — Context Contamination Across Agents]
[Why isolated agents can still see each other's work. Link to context bounding.]

### [H3: Pitfall 3 — Hallucinations Passing Through Validation]
[Why redundancy alone isn't enough. Link to redundancy and probability articles.]

### [H3: Pitfall 4 — Runaway Costs from Over-Orchestration]
[Why more agents can cost more. Link to cost breakdown article.]

## [H2: Next Steps — How to Use This Guide]

[Summary of cluster articles with brief descriptions and entry points.]

### [H3: For Practitioners New to Sub-Agents]
[Suggested reading order]

### [H3: For Teams Building Custom Orchestrators]
[Different suggested order]

### [H3: For Enterprise Deployments]
[Another order]

## [H2: Key Takeaways]
[5–7 bullet points capturing the essential insights]

---

### Pillar Page Metadata

**Schema Type:** `Article` + `BreadcrumbList`

**Meta Description:** "Learn the architectural patterns, isolation techniques, and design frameworks for orchestrating multiple Claude Code agents reliably. Multi-agent field guide for intermediate practitioners."

**Internal Links:** 8 outbound links to cluster articles (in context paragraphs, not a separate "related" section)

**Estimated Content Depth:** 4,500–5,000 words

---

## II. Cluster Article Architecture

### Cluster Article Map: 8 Core Articles + 3 Supporting Concept Pieces

#### CLUSTER ARTICLE 1: Git Worktrees for Parallel AI Agents

**Title:** Git Worktrees for Parallel AI Agents: Complete Operational Guide

**Target Keywords:** "git worktrees parallel agents," "Claude Code parallel execution," "worktree isolation AI," "git worktree tutorial"

**URL:** `/posts/git-worktree-isolation-parallel-agents/`

**Word Count Target:** 2,500–3,000 words

**Format:** Step-by-step tutorial with annotated shell commands

**Primary Audience Intent:** "How do I run two agents simultaneously without them interfering with each other?"

**Hook Paragraph (Featured Snippet Target):**
"Git worktrees create isolated filesystem branches that allow you to run multiple Claude Code agents in parallel without filesystem conflicts. Each agent operates in its own worktree, with independent git history and environment variables, enabling true concurrent work on separate tasks. This guide covers the setup, common pitfalls, and operational patterns for orchestrating agents via worktrees."

**Section Structure:**

```
H1: Git Worktrees for Parallel AI Agents: Complete Operational Guide

[Hook paragraph for featured snippet]

## Why Filesystem Isolation Matters
[Problem: agents tripping over each other, port conflicts, env var pollution]

## Prerequisites and Setup
[What you need. Version checks.]

## Step 1: Creating Your First Worktree
[Shell command with annotation explaining each flag]

### Why These Flags?
[Inline reasoning for design decisions]

## Step 2: Configuring Environment Isolation
[env vars, .env files, port selection]

## Step 3: Running Parallel Agent Sessions
[How to instantiate agent in each worktree]

### Cost Note on Parallel Instantiation
[Small table: 2 agents in parallel vs. sequential; cost comparison]

## Step 4: Synchronizing Work Across Worktrees
[Merging outputs, avoiding conflicts]

## Common Failures and How to Fix Them

### Failure 1: Port Collision
[Symptom → Diagnosis → Fix]

### Failure 2: Environment Variable Leakage
[Symptom → Diagnosis → Fix]

### Failure 3: Git History Conflicts
[Symptom → Diagnosis → Fix]

### Failure 4: Disk Space and Performance
[Symptom → Diagnosis → Fix]

## Operational Patterns

### Pattern 1: Feature Development with Parallel Refactoring
[Use case + command sequence]

### Pattern 2: Review Agent + Implementation Agent
[Use case + command sequence]

## Troubleshooting Checklist
[Bullet-list TL;DR for common issues]

## Next Steps
[Link to skill file article, node-locality article, cost breakdown article]

## Key Takeaways
[5–7 bullet points]
```

**Code Blocks in This Article:** 6–8 annotated shell command blocks

**Diagrams:** 1 optional — filesystem tree showing worktree isolation + process diagram showing parallel execution with port labeling

**Schema Type:** `HowTo` (JSON-LD structured data)

**Internal Links (Inbound):** Pillar page, specialist skill files article, node-locality article, cost breakdown

**Internal Links (Outbound):** Skill files (how to design agents for each worktree), context bounding (how to limit each agent's window)

---

#### CLUSTER ARTICLE 2: Designing Specialist Sub-Agents

**Title:** Designing Specialist Sub-Agents: The Skill File Annotated

**Target Keywords:** "Claude Code skill file design," "sub-agent specialization," "Claude Code YAML frontmatter," "specialist agent pattern"

**URL:** `/posts/specialist-subagent-skill-design/`

**Word Count Target:** 2,500–3,000 words

**Format:** Annotated configuration tutorial with design rationale

**Primary Audience Intent:** "How do I design sub-agents so they actually specialize and don't interfere?"

**Hook Paragraph:**
"Sub-agent skill files define specialization through YAML frontmatter fields: `name`, `description`, `tools`, `model`, `skills`, `maxTurns`, and `permissionMode`. Each field encodes a design decision that shapes how the orchestrator routes tasks and what the agent can do. This guide walks through real skill file examples with inline annotations explaining the reasoning behind each configuration choice."

**Section Structure:**

```
H1: Designing Specialist Sub-Agents: The Skill File Annotated

[Hook paragraph]

## Why Skill File Design Matters
[Problem: agents that don't specialize, that have too much capability]

## The Anatomy of a Skill File
[Overview of all fields]

## Field-by-Field Design Decisions

### The 'name' Field: Brevity and Clarity
[Good names vs. bad names. Why this matters for dispatch.]

### The 'description' Field: How Orchestrators Route Tasks
[This is where the magic happens. Precision = accurate routing.
Annotation example below.]

### The 'tools' Field: Capability Constraints
[Least privilege principle. Why fewer tools = better specialization.]

### The 'model' Field: Cost and Reasoning Trade-offs
[Why Sonnet for specialist tasks. When to use Opus.]

### The 'skills' Field: Layering Specialization
[How to reference other skill files to create hierarchies.]

### The 'maxTurns' Field: Preventing Runaway Agents
[Why this is a circuit breaker. Cost implications.]

### The 'permissionMode' Field: Isolation and Safety
[Different modes; implications for each.]

## Five Annotated Skill File Examples

### Example 1: The Database Specialist
[Full YAML + inline annotations explaining each design choice]

### Example 2: The Frontend Reviewer
[Full YAML + annotations]

### Example 3: The Context Optimizer
[Full YAML + annotations]

### Example 4: The Test Writer
[Full YAML + annotations]

### Example 5: The Integration Checker
[Full YAML + annotations]

## Common Specialization Pitfalls

### Pitfall 1: Too Many Tools → Loss of Focus
[Why more capability dilutes specialization]

### Pitfall 2: Overlapping Responsibilities → Conflict
[Why two agents with the same tools fight over routing]

### Pitfall 3: Underspecified Description → Miscall Routing
[Why the description is the orchestrator's "brain"]

### Pitfall 4: maxTurns Too High → Infinite Loops
[Circuit breaker design patterns]

## Composition Patterns: Combining Skill Files

### Pattern 1: Vertical Specialization (by layer)
[Frontend specialist, backend specialist, database specialist]

### Pattern 2: Horizontal Specialization (by phase)
[Planning agent, implementation agent, review agent]

### Pattern 3: Domain Specialization (by domain)
[Payment system specialist, user auth specialist, etc.]

## Decision Matrix: Which Tools Belong in Each Specialist?
[Table showing tool assignments across 5 example specialists]

## Testing Your Skill File Design
[How to diagnose if a specialist is truly specialized]

## Next Steps

## Key Takeaways
[5–7 bullets]
```

**Code Blocks:** 5 complete annotated YAML skill file examples

**Diagrams:** 1 optional — skill file dependency graph showing how multiple specialists compose

**Schema Type:** `HowTo` (JSON-LD structured data for the skill file design steps)

**Internal Links (Inbound):** Pillar page, git worktree article, node-locality article

**Internal Links (Outbound):** Node-locality article (how agent isolation changes perspective), cost breakdown (model choice implications), context bounding (why max-context matters for skill file design)

---

#### CLUSTER ARTICLE 3: Node-Locality

**Title:** Node-Locality: Why Agent Perspective Matters More Than Agent Capability

**Target Keywords:** "node-locality orchestration," "agent perspective AI," "Claude Code agent perspective," "local agent instance"

**URL:** `/posts/node-locality-agent-perspective/`

**Word Count Target:** 2,500–3,500 words

**Format:** Conceptual deep-dive with diagrams (happy path + failure mode)

**Primary Audience Intent:** "Why does it matter where an agent is instantiated? What's the difference between a root orchestrator and a node-local agent?"

**Hook Paragraph:**
"Node-locality is the principle that an agent instantiated 'on the node' — as a sub-agent within a task context — has a different perspective, and often better decisions, than the same agent operating from the root orchestrator level. This article explains the mental model: what a node-local agent sees vs. what the root orchestrator sees, when perspective matters, and how to use perspective differences to your advantage."

**Section Structure:**

```
H1: Node-Locality: Why Agent Perspective Matters More Than Agent Capability

[Hook paragraph]

## The Mental Model: Two Perspectives on the Same Problem

### The Root Orchestrator Perspective
[Wide, high-altitude. All context. All decisions. All problems visible.]

### The Node-Local Agent Perspective
[Narrow, task-focused. Only relevant context. Only one decision at a time.]

### Why This Matters
[Reasoning quality improves with focus. Hallucination surface area shrinks.]

## Diagram 1: The Happy Path — Perspective Advantage
[Side-by-side panels showing root vs. node-local view of the same task]
[Annotation: Root sees everything; local agent sees only what matters]

## Diagram 2: The Failure Mode — Perspective Mismatch
[What happens when root and local agent disagree? How does conflict arise?]
[Annotation: Context contamination, missed dependencies, different interpretations]

## When Node-Locality Wins: Four Scenarios

### Scenario 1: Deep Code Review
[Local agent (on the diff) has better perspective than root orchestrator (on the full system)]

### Scenario 2: Schema Optimization
[Local agent (on the table) reasons better than root (on all tables)]

### Scenario 3: Debugging
[Local agent (on the error) vs. root (on the full request log)]

### Scenario 4: Refactoring Decisions
[Local agent (on the component) vs. root (on the full codebase)]

## When Node-Locality Loses: Three Counter-Scenarios

### Counter-Scenario 1: Cross-System Dependencies
[Local agent can't see the full dependency graph]

### Counter-Scenario 2: Long-Term Coherence
[Local agent optimizes for the immediate task, misses architectural impact]

### Counter-Scenario 3: Rollback and Safety
[Local agent makes decisions that global orchestrator would reject]

## The Perspective Diagram: Understanding the Visual
[Full explanation of the diagram showing information flow]

## Practical Implication 1: Skill File Design
[How understanding node-locality changes your specialist design]
[Link to specialist skill file article]

## Practical Implication 2: Context Bounding
[Why node-local agents need less context than root orchestrators]
[Link to context bounding article]

## Practical Implication 3: Validation Strategy
[Why you validate differently for node-local agents]
[Link to redundancy/Venn article]

## The Anti-Pattern: Over-Centralization
[Why centralizing all decisions in root orchestrator is expensive and error-prone]

## Real Example: Parallel Code Review
[Before (root agent doing all reviews) vs. after (node-local specialists)]
[Metrics: speed, cost, quality]

## Decision Framework: Should This Agent Be Node-Local or Root-Level?
[Decision matrix]

## Building Intuition: Three Mental Models
[Different ways to think about node-locality]

## Next Steps

## Key Takeaways
[5–7 bullets]
```

**Diagrams:** 2 required
- Diagram A: Side-by-side perspective (root vs. node-local agent looking at the same task)
- Diagram B: Failure mode scenario (what breaks when perspectives misalign)

Both diagrams should include annotations explaining the information available to each perspective.

**Schema Type:** `Article` + optional `speakable` (for AI answer eligibility)

**Internal Links (Inbound):** Pillar page, specialist skill file article, git worktree article

**Internal Links (Outbound):** Specialist skill design (how to leverage perspective), context bounding (minimize context to exploit local focus), Venn/redundancy (validate using perspective differences)

---

#### CLUSTER ARTICLE 4: Hallucination Mitigation Through Redundancy

**Title:** Hallucination Mitigation Through Redundancy: The Venn Dispatch Pattern

**Target Keywords:** "hallucination mitigation AI," "redundancy validation agents," "Venn dispatch pattern," "multi-agent validation," "Claude Code redundancy"

**URL:** `/posts/hallucination-mitigation-venn-dispatch/`

**Word Count Target:** 2,500–3,000 words

**Format:** Architecture post with before/after comparison and Venn diagram

**Primary Audience Intent:** "How do I prevent hallucinations from passing through validation? What's a practical redundancy pattern?"

**Hook Paragraph:**
"The Venn dispatch pattern uses overlapping specialist agents to validate each other automatically. Instead of running one agent on a task and hoping it's right, you run 2–3 overlapping specialists, each with partial responsibility. Their overlap creates redundant coverage: a hallucination must fool multiple agents to pass through. This article explains the pattern with Venn diagrams, cost analysis, and before/after examples of detection rates."

**Section Structure:**

```
H1: Hallucination Mitigation Through Redundancy: The Venn Dispatch Pattern

[Hook paragraph]

## The Problem: Why Single-Agent Validation Fails

### Case Study: The Missing NULL Check
[Concrete example: single agent misses a bug that gets caught by redundancy]

## The Venn Principle

### How Overlapping Specialists Create Validation
[Explanation of the concept]

## Diagram 1: The Happy Path Venn
[Three specialists, three overlapping circles, showing which areas are covered and which hallucinations would be caught]

## Diagram 2: The Failure Mode — Gaps Despite Overlap
[Showing where hallucinations can slip through despite overlap. The gap that remains.]

## Designing the Venn: Four Parameters

### Parameter 1: Overlap Percentage
[How much overlap is enough? Cost vs. coverage trade-off]

### Parameter 2: Specialist Roles
[Which three roles create the best redundancy?]

### Parameter 3: Consensus Rules
[2-of-3 agreement? Unanimous? Majority? Cost implications.]

### Parameter 4: Escalation Logic
[What happens when specialists disagree?]

## Real Example 1: Code Review Venn
[Frontend specialist, backend specialist, integration specialist.
Overlap: backend and integration both review database calls]

### Coverage Analysis Table
[What each specialist catches]

### Cost Analysis
[Cost of 3 agents vs. cost of missed bug in production]

## Real Example 2: Schema Validation Venn
[Schema specialist, performance specialist, backward-compatibility specialist]

### Coverage Analysis

### Cost Analysis

## Before/After: Hallucination Detection Rate
[Metrics from real practice (annotated as estimates if needed)]
[Single agent: 78% detection rate]
[Venn pattern (2-of-3): 94% detection rate]

## Anti-Pattern: Over-Specialization Kills Redundancy
[Why 5 specialists = worse coverage than 3. Dilution effect.]

## Venn in Practice: A Step-by-Step Dispatch

### Step 1: Identify the Task
[What are we validating?]

### Step 2: Select the Specialist Set
[Which 3 roles?]

### Step 3: Parallel Dispatch
[Run all 3 in parallel]

### Step 4: Collect Results
[Wait for all to complete]

### Step 5: Consensus Check
[Apply decision rule]

### Step 6: Escalation (if disagreement)
[What happens next?]

## Cost Breakdown: Is Redundancy Affordable?

### Scenario A: Small Task (1K tokens per agent)
[Single agent: $cost. Venn (3x): $cost. Difference?]

### Scenario B: Medium Task (10K tokens per agent)
[Calculations]

### Scenario C: Large Task (50K tokens per agent)
[Calculations]

### When Venn is NOT Cost-Effective
[Task types where single agent + review is better]

## The Role of Model Mixing
[Why redundancy + model mixing (Sonnet + Opus) is powerful]
[Cost implications]

## Integrating Venn With Iterative Review Waves
[How redundancy + human review gates work together]
[Link to iterative review waves article]

## Decision Matrix: Redundancy vs. Single-Agent-Plus-Review
[When to use each approach]

## Next Steps

## Key Takeaways
[5–7 bullets]
```

**Diagrams:** 2 required
- Venn diagram (3 overlapping circles) showing specialist coverage and gap areas
- Timeline/flowchart showing dispatch → execution → consensus check

**Code Blocks:** 2–3 pseudo-code or annotated configuration showing dispatch logic

**Tables:** Cost breakdown table (scenario A, B, C; single vs. Venn)

**Schema Type:** `HowTo` (JSON-LD for the dispatch steps)

**Internal Links (Inbound):** Pillar page, specialist skill file article, iterative review waves article

**Internal Links (Outbound):** Model mixing/cost breakdown (why Sonnet + Opus redundancy is efficient), iterative review waves (how human validation integrates with Venn), probability-aware workflows (how to model uncertainty with redundancy)

---

#### CLUSTER ARTICLE 5: Context Bounding

**Title:** Context Bounding: Keeping Sub-Agent Windows Clean

**Target Keywords:** "context window optimization," "Claude Code context bounding," "token budget," "context management AI agents," "context isolation"

**URL:** `/posts/context-bounding-subagent-windows/`

**Word Count Target:** 2,000–2,500 words

**Format:** Problem-solving guide with troubleshooting diagnosis flow

**Primary Audience Intent:** "How much context should I give each sub-agent? How do I prevent context contamination?"

**Hook Paragraph:**
"Context bounding is the practice of deliberately limiting the information passed to a sub-agent to only what is relevant for its specific task. A specialist sub-agent reviewing a single file doesn't need the entire codebase, every test suite, and 6 months of commit history. Bounding context improves reasoning quality, reduces hallucinations, and cuts costs. This guide covers the decision framework, common pitfalls, and operational patterns."

**Section Structure:**

```
H1: Context Bounding: Keeping Sub-Agent Windows Clean

[Hook paragraph]

## The Core Principle: Less Context = Better Reasoning (Usually)

### The Graph: Output Quality vs. Context Window Size
[Visualization showing quality peaks at ~30-50% window, then degrades]

## Why Context Bloats
[Common sources of unnecessary context]

## Designing Context Boundaries: Four Questions

### Question 1: What Is the Agent Responsible For?
[Scope definition]

### Question 2: What Information Does the Agent Need to Succeed?
[Necessary vs. nice-to-have distinction]

### Question 3: What Information Would Confuse the Agent?
[Noise that increases hallucination risk]

### Question 4: What Is the Cost Threshold?
[Budget constraint]

## Decision Framework: Context Selection Matrix
[Table showing task type vs. recommended context window size]

## Five Bounding Strategies

### Strategy 1: Task-Specific File Selection
[Pass only the files the agent needs to touch]
[Pseudo-code example]

### Strategy 2: Diff-Based Context
[Pass only the changes, not the full file]
[Pseudo-code example]

### Strategy 3: Metadata-First Approach
[Pass schema/interface definition, not full code]
[Example]

### Strategy 4: Temporal Bounding
[Pass only recent history, not full changelog]
[Example]

### Strategy 5: Hierarchical Bounding
[Pass summary layer, drill-down only if needed]
[Example]

## The Contamination Problem: Context Bleeding

### Contamination Type 1: Unrelated Code
[Agent hallucinates that it needs to modify unrelated code]

### Contamination Type 2: Outdated References
[Agent makes decisions based on old code it sees but shouldn't touch]

### Contamination Type 3: Cross-Cutting Concerns
[Agent sees too many interdependencies and freezes]

## Troubleshooting Diagnosis Flow

[Flowchart: Agent behavior → symptoms → likely context problem → fix]

## Real Example: The Database Review Workflow

### Bounding Choices Made
[This review task gets: migrations, models, schema. It does NOT get: views, tests, frontend.]

### Why These Choices?
[Reasoning for each inclusion/exclusion]

### Cost Impact
[Tokens saved vs. quality tradeoff]

## Operational Patterns

### Pattern 1: File Passing via Glob Selectors
[Pseudo-code: which files match the pattern?]

### Pattern 2: Smart Diff Extraction
[How to pass only the changed lines]

### Pattern 3: Documentation-First (Schema + Examples)
[When to pass interface docs instead of implementation]

## Testing Your Context Bounds

### Test 1: Can the Agent Complete the Task?
[Diagnostic check]

### Test 2: Does the Agent Hallucinate Unrelated Changes?
[Diagnostic check]

### Test 3: What's the Cost vs. Single-Agent Baseline?
[Measurement]

## When to Relax Bounds
[Situations where broader context is justified]

## Integration With Node-Locality
[How node-local agents naturally get smaller context windows]
[Link to node-locality article]

## Next Steps

## Key Takeaways
[5–7 bullets]
```

**Tables:** Context bounding matrix (task type vs. recommended window size)

**Diagrams:** Optional flowchart for contamination diagnosis flow

**Code/Pseudo-Code Blocks:** 4–5 examples of file selection, diff extraction, etc.

**Schema Type:** `FAQPage` (JSON-LD for common troubleshooting questions)

**Internal Links (Inbound):** Pillar page, specialist skill file article, node-locality article

**Internal Links (Outbound):** Node-locality (why local agents can use smaller windows), cost breakdown (cost implications of context sizing), git worktrees (how worktrees naturally bound context)

---

#### CLUSTER ARTICLE 6: Iterative Review Waves

**Title:** Iterative Review Waves: Structuring Feedback Loops with Human Gates

**Target Keywords:** "iterative review loops AI," "feedback gates," "multi-turn AI workflow," "human-in-the-loop AI agents," "review wave orchestration"

**URL:** `/posts/iterative-review-waves-feedback-gates/`

**Word Count Target:** 2,500–3,000 words

**Format:** Framework piece + implementation section (hybrid)

**Primary Audience Intent:** "How do I structure multi-turn work where agents iterate based on feedback? Where do I add human gates?"

**Hook Paragraph:**
"Iterative review waves structure multi-turn agent work as a series of passes, each followed by a gate (human decision, automated validation, or both) that determines whether to proceed or loop back for revision. This pattern prevents runaway agents, ensures human oversight at critical points, and allows agents to refine outputs based on explicit feedback. This article covers the framework, gate design patterns, and implementation."

**Section Structure:**

```
H1: Iterative Review Waves: Structuring Feedback Loops with Human Gates

[Hook paragraph]

## The Problem: Why Multi-Turn Agent Work Goes Wrong

### Anti-Pattern 1: Agents Looping Forever
[No exit condition. Agents keep trying without feedback.]

### Anti-Pattern 2: Runaway Edits
[Agents make changes that contradict each other across loops]

### Anti-Pattern 3: Missing Critical Reviews
[Important decisions pass through without human eyes]

## The Wave Framework: Five Phases

### Phase 1: Planning Wave
[Agent lays out approach; human approves or redirects]

### Phase 2: Execution Wave
[Agent executes the plan]

### Phase 3: Validation Wave
[Agents (or human) validate the output]

### Phase 4: Feedback Gate
[Human decides: approve, minor revision, major revision, or reject]

### Phase 5: Revision Wave (if needed)
[Agent revises based on specific feedback and loops back to Phase 3]

## Diagram 1: The Happy Path Wave Cycle
[Timeline showing phases, gates, and loops]

## Diagram 2: The Failure Mode — Infinite Loop
[Where the cycle can go wrong; when gates should trigger an exit]

## Gate Design: Three Types

### Gate Type 1: Binary Decision Gates
[Approve/reject. Example: "Does the implementation match the plan?"]

### Gate Type 2: Feedback Gates
[Provide specific revision guidance. Example: "Minor refactoring needed in lines 45–67."]

### Gate Type 3: Escalation Gates
[Escalate to human or higher-level agent. Example: "This violates architectural constraints; escalate to tech lead."]

## Implementing Gates: The Decision Rule Matrix
[Table showing condition → gate type → action]

## Real Example 1: Feature Implementation Workflow

### Wave Setup
[4 waves: design review, implementation review, test review, final approval]

### Gate Conditions
[What triggers approval vs. revision at each gate?]

### Loop Limits
[How many revision loops before escalation?]

### Human Touch Points
[Where humans must review]

## Real Example 2: Documentation Generation Workflow

### Wave Setup
[3 waves: draft, refinement, final]

### Gate Conditions

### Loop Limits

### Human Touch Points

## Cost Analysis: Human Gates and Efficient Looping

### Scenario A: No Human Gates (Fully Automated)
[Cost: low. Risk: high. Hallucinations and errors compound.]

### Scenario B: Human Gate at Every Wave
[Cost: high (gates are expensive). Risk: low. Slowest.]

### Scenario C: Strategic Gates (middle ground)
[Cost: medium. Risk: medium. Fastest iteration.]

### Decision Framework: Which Scenario for Your Task?
[How to choose]

## Anti-Pattern: Infinite Revision Loops

### How to Set Loop Limits
[maxWaves, maxRevisionsPerPhase, etc.]

### How to Detect When to Escalate
[Signals that the wave cycle isn't converging]

## Integrating With Venn Redundancy
[How to use redundancy inside a wave cycle]
[Multiple agents review each wave before gate]

## Fallback Strategies When Agents Can't Complete

### Fallback 1: Escalation to Specialist
[If generic agent gets stuck, escalate to expert agent]

### Fallback 2: Context Expansion
[If agent fails, expand context and retry]

### Fallback 3: Human Takeover
[When to give up and let human handle it]

## Next Steps

## Key Takeaways
[5–7 bullets]
```

**Diagrams:** 2 required
- Wave cycle diagram (5 phases with gates)
- Failure mode diagram (infinite loop scenario; where gates prevent it)

**Tables:** Gate decision rule matrix; cost analysis (3 scenarios)

**Code/Pseudo-Code:** Wave state machine (pseudo-code representation of the state transitions)

**Schema Type:** `HowTo` (JSON-LD for the wave phases and gate logic)

**Internal Links (Inbound):** Pillar page, redundancy/Venn article

**Internal Links (Outbound):** Redundancy/Venn (how to apply inside wave cycles), probability-aware workflows (modeling uncertainty in loops)

---

#### CLUSTER ARTICLE 7: Probability-Aware Workflows

**Title:** Probability-Aware Workflows: Designing AI Systems for Non-Determinism

**Target Keywords:** "non-deterministic AI workflows," "probabilistic orchestration," "AI system uncertainty," "Claude Code stochasticity"

**URL:** `/posts/probability-aware-workflow-design/`

**Word Count Target:** 1,500–2,500 words

**Format:** Opinion/philosophy + concrete example

**Primary Audience Intent:** "How do I design systems that account for the fact that LLMs are probabilistic, not deterministic?"

**Hook Paragraph:**
"Most AI practitioner failures stem from treating LLMs as if they were deterministic: 'If I pass this input, I will always get this output.' LLMs are not deterministic. They are probability distributions. Probability-aware workflow design means accepting non-determinism as a first-class constraint and building systems that handle uncertainty explicitly. This article explores the mindset shift and its implications for orchestration."

**Section Structure:**

```
H1: Probability-Aware Workflows: Designing AI Systems for Non-Determinism

[Hook paragraph]

## The Myth: Deterministic AI

### Why We Believe It
[We focus on successes, ignore failures]

### Why It Breaks at Scale
[Low-probability events become high-probability when you run 1000 tasks]

## The Reality: Distributions, Not Functions

### Mental Model 1: The Probability Distribution View
[Each prompt → distribution of possible outputs]

### Mental Model 2: The Failure Surface Area
[At scale, tail risks become head risks]

### Mental Model 3: The Design Lever
[You can't eliminate uncertainty; you can design for it]

## Five Implications of Probability-Aware Design

### Implication 1: Retry Logic Is Not Optional
[Why you need probabilistic retries as a standard pattern]

### Implication 2: Validation Is Different
[You validate distributions, not single outputs]

### Implication 3: Cost Has Variance
[Cost isn't a point estimate; it's a distribution]

### Implication 4: Latency Becomes Measurable Risk
[Why deadlines matter differently]

### Implication 5: Generalization Requires Multiple Samples
[One success doesn't prove the system works]

## Real-World Case Study: The 97% Agent

[A system that works 97% of the time. Is that good? What does "good" even mean?
At 1,000 tasks, 30 fail. At 10,000 tasks, 300 fail. The design question changes completely.]

## Design Patterns for Non-Determinism

### Pattern 1: Redundancy as Variance Reduction
[Run the same agent 3x, take majority vote]

### Pattern 2: Diversity Over Redundancy
[Run 3 different agents; they fail in different ways]

### Pattern 3: Threshold-Based Escalation
[If confidence < X%, escalate instead of using output]

### Pattern 4: Probabilistic Rejection
[Don't use outputs below a confidence threshold; design for graceful degradation]

## The Economics of Probability-Aware Design

### The Naive Approach: Assume Success
[Low cost upfront. High cost at scale when failures compound.]

### The Conservative Approach: Validate Everything
[High cost. Low risk. Can be prohibitively expensive.]

### The Pragmatic Approach: Risk-Based Design
[Cost varies by task importance]

### Decision Framework: How Much Certainty Do You Need?
[Table: task type vs. required confidence threshold vs. cost implications]

## Failure Modes of Ignoring Non-Determinism

### Failure 1: Hidden Errors
[Hallucination that looks plausible but is wrong]

### Failure 2: Compound Errors
[Small errors in agent A feed into larger errors in agent B]

### Failure 3: Rare Event Blindness
[Edge cases you didn't test for; they appear in production]

## Integration With Other Patterns

### Probability + Redundancy
[Venn dispatch is probability-aware by design]

### Probability + Iterative Waves
[Loop exit conditions must account for probability]

### Probability + Node-Locality
[Local agents have different failure distributions than root orchestrators]

## The Philosophical Angle: Embracing Uncertainty

[Why accepting uncertainty is not weakness; it's the mature engineering approach]

## Next Steps

## Key Takeaways
[5–7 bullets]
```

**No Diagrams Required** (opinion pieces don't typically have diagrams, but optional: a probability distribution visualization)

**Tables:** Decision framework table (task type vs. confidence threshold)

**Code/Examples:** Pseudo-code for retry logic, threshold-based escalation, voting patterns

**Schema Type:** `Article` (no rich results for opinion content)

**Internal Links (Inbound):** Pillar page, iterative review waves, redundancy/Venn

**Internal Links (Outbound):** Iterative review waves (design loops for non-determinism), redundancy/Venn (redundancy as variance reduction strategy)

---

#### CLUSTER ARTICLE 8: Cost Optimization

**Title:** Opus Orchestrates, Sonnet Executes: The Cost Case for Mixed-Model Dispatch

**Target Keywords:** "Claude cost optimization," "Opus vs. Sonnet," "mixed-model orchestration," "LLM cost efficiency," "AI coding budget"

**URL:** `/posts/opus-orchestrates-sonnet-executes-cost/`

**Word Count Target:** 1,500–2,500 words

**Format:** Cost breakdown with worked examples

**Primary Audience Intent:** "How do I reduce costs while keeping quality? When should I use Sonnet vs. Opus?"

**Hook Paragraph:**
"At scale, model choice is a cost lever you can't ignore. Opus is 4–5x more expensive than Sonnet per token. For specialist sub-agents running narrow, well-defined tasks, Sonnet is often sufficient—and at 1/5 the cost. This article breaks down real costs from parallel orchestration scenarios, showing where model switching saves money without sacrificing quality."

**Section Structure:**

```
H1: Opus Orchestrates, Sonnet Executes: The Cost Case for Mixed-Model Dispatch

[Hook paragraph]

## The Model Choice Question

### When Cost Matters
[At small scale: doesn't. At large scale: everything.]

## Scenario A: Small Feature Implementation

### Setup
[Task: implement a new API endpoint with tests. Context: 15 KB.]

### Cost Comparison Table

| Approach | Tokens In | Tokens Out | Cost @ Opus | Cost @ Sonnet | Difference |
|---|---|---|---|---|---|
| 1 Opus agent | 15K | 8K | $X | - | - |
| 1 Sonnet agent | 15K | 8K | - | $Y | -60% |
| 1 Opus supervisor + 3 Sonnet specialists | 5K + (5K × 3) | 2K + (3K × 3) | - | $Z | -75% |

[Analysis: Which approach is best for this task size?]

## Scenario B: Large Codebase Review

### Setup
[Task: review 50-file PR with architecture implications. Context: 150 KB.]

### Cost Comparison Table

[Similar structure; shows where Opus + Sonnet mix is better than pure Opus]

## Scenario C: Parallel Specialist Dispatch

### Setup
[5 agents running in parallel for different aspects of a large project]

### Cost Per Model Choice

[Single Opus orchestrator + 4 Sonnet specialists vs. all Opus vs. all Sonnet]

## Decision Framework: Which Model for Which Role?

### Orchestrator Role (Supervisor)
[High-level decisions; needs reasoning. Use: Opus or Sonnet-Mega if available]

### Specialist Role (Narrow Task)
[Well-defined input/output; procedural. Use: Sonnet]

### Validation Role (Checking Work)
[Compare two outputs; pattern matching. Use: Sonnet]

### Edge Case Detection (Hallucination Finding)
[Requires subtle reasoning. Use: Opus or Sonnet-Mega]

## Real Cost Example: A Typical Week of Development

### Monday: Feature Implementation (3 tasks)
[Task 1: API design. Task 2: Backend. Task 3: Tests.]
[Model choice for each. Total cost with Opus. Total cost with mixed approach.]

### Tuesday–Friday: Bug Fixes and Review
[Similar breakdown]

### Weekly Total
[Pure Opus cost. Mixed approach cost. Savings.]

### Extrapolation to Annual Budget
[Projected annual spend differences]

## Quality vs. Cost: The Tradeoff

### Measurement: Hallucination Rate
[Does Sonnet hallucinate more than Opus for specialist tasks?]
[Data: estimated from benchmark and real practice]

### Measurement: Revision Rate
[Do Sonnet outputs require more revision?]

### Measurement: Success Rate
[What percentage of tasks can Sonnet handle alone?]

## When NOT to Use Sonnet

### Case 1: High-Stakes Decisions
[Use Opus for architectural decisions with long-term implications]

### Case 2: Ambiguous Context
[Use Opus when input is messy or contradictory]

### Case 3: Cross-Domain Reasoning
[Use Opus when connecting ideas across domains]

## When to Use Sonnet Confidently

### Case 1: Well-Scoped Tasks
[Reformat code. Write boilerplate. Apply known patterns.]

### Case 2: Validation and Comparison
[Compare two approaches. Check for bugs. Verify pattern consistency.]

### Case 3: Specialist Review
[Expert in one domain reviewing its own domain.]

## Cost Optimization Patterns

### Pattern 1: Opus Orchestrator + N Sonnet Specialists
[Diagram showing dispatch pattern]
[Cost calculation]

### Pattern 2: Staged Filtering (Sonnet First, Escalate to Opus)
[Try Sonnet first; if confidence low, escalate to Opus]
[Decision tree]

### Pattern 3: Audit Trail (Sonnet Does Work, Opus Spot-Checks)
[Sonnet handles 100% of routine tasks. Opus randomly audits 10%]
[Expected cost savings]

## Accounting for Latency in Cost Analysis

[Sonnet is faster. Does speed reduce cost? Or just improve UX?]
[Framework for when latency matters economically]

## Integration With Other Design Patterns

### Cost + Redundancy
[Running Sonnet redundancy (3x Sonnet) vs. single Opus]

### Cost + Parallel Execution
[Cost curve flattens as you parallelize]

## Build vs. Buy: In-House vs. API

[Running agents on your own infra vs. Anthropic API]
[When each makes sense]

## Next Steps and Monitoring

[How to track actual spend vs. estimates]

## Key Takeaways
[5–7 bullets]
```

**Tables:** 3–4 cost comparison tables (scenarios A, B, C; decision matrix)

**Diagrams:** Optional — dispatch pattern diagram showing Opus orchestrator + Sonnet specialists

**Code/Pseudo-Code:** Configuration examples showing model assignment in skill files

**Schema Type:** `Article` (tables may be pulled as featured snippets)

**Internal Links (Inbound):** Pillar page, specialist skill file article, redundancy/Venn article

**Internal Links (Outbound):** Specialist skill file design (model field), redundancy/Venn (cost implications of redundancy), context bounding (context size affects cost distribution)

---

### Supporting Concept Pieces: 3 Thought Leadership Articles

These articles are not required for the pillar-cluster SEO architecture but serve a specific role: **earning backlinks from tech publications, HackerNews, dev.to newsletters, and industry aggregators**. They establish thought leadership and build domain authority, which then lifts the entire cluster.

**Publishing Strategy for Supporting Pieces:** Publish after the main 8 cluster articles are live. They link back to cluster articles.

---

#### SUPPORTING CONCEPT 1: Vibe Coding and Technical Debt

**Title:** Why "Vibe Coding" Is a Debt Trap: How to Recover From AI-Generated Technical Debt

**Target Keywords:** "vibe coding," "technical debt AI," "AI-generated debt," "code quality AI"

**URL:** `/posts/vibe-coding-technical-debt/`

**Word Count Target:** 1,500–2,000 words

**Format:** Opinion/critique

**Purpose:** Establish authority on the problem domain. Attract practitioners struggling with AI code quality issues.

**Internal Links (Outbound):** Link back to specialist skill design (how to enforce design constraints), context bounding (how to make agents more precise), node-locality (perspective matters for quality).

---

#### SUPPORTING CONCEPT 2: The Feb 2026 Multi-Agent Watershed

**Title:** The Multi-Agent Moment: Why Feb 2026 Changed Everything for AI Coding

**Target Keywords:** "multi-agent AI," "AI agent orchestration," "agentic AI," "AI coding 2026"

**URL:** `/posts/multi-agent-watershed-2026/`

**Word Count Target:** 1,500–2,000 words

**Format:** Industry analysis / opinion

**Purpose:** Establish currency and relevance. Show that Detached Node is analyzing the moment, not reacting to it.

**Internal Links (Outbound):** Link to pillar page, all 8 cluster articles as "further reading."

---

#### SUPPORTING CONCEPT 3: Beyond Prompting: The Practitioner's Progression

**Title:** From Prompting to Orchestration: How Practitioners Level Up in AI-Assisted Development

**Target Keywords:** "AI coding maturity," "prompt engineering to orchestration," "agentic thinking," "advanced AI development"

**URL:** `/posts/prompting-to-orchestration-progression/`

**Word Count Target:** 1,500–2,000 words

**Format:** Educational framework / progression model

**Purpose:** Show the full journey. Position the pillar/cluster as the "next level" content for practitioners ready to graduate from basic prompting.

**Internal Links (Outbound):** Link to pillar page; all 8 cluster articles positioned as "advanced techniques."

---

## III. URL Structure & Siloing Strategy

### A. URL Hierarchy

**Pillar Page:**
```
/posts/multi-agent-orchestration/
```

**Cluster Articles (Topical Silo):**
```
/posts/git-worktree-isolation-parallel-agents/
/posts/specialist-subagent-skill-design/
/posts/node-locality-agent-perspective/
/posts/hallucination-mitigation-venn-dispatch/
/posts/context-bounding-subagent-windows/
/posts/iterative-review-waves-feedback-gates/
/posts/probability-aware-workflow-design/
/posts/opus-orchestrates-sonnet-executes-cost/
```

**Supporting Concepts:**
```
/posts/vibe-coding-technical-debt/
/posts/multi-agent-watershed-2026/
/posts/prompting-to-orchestration-progression/
```

### Siloing Rationale

**Why This Structure:**
- Single `/posts/` prefix keeps all blog content together (easy to manage, clear to search engines)
- Cluster article URLs are specific and keyword-rich (each URL targets its primary keyword)
- URL length is reasonable (not too long, not too short)
- No nesting under the pillar URL (each cluster article is independent and discoverable)
- Supporting concept URLs clearly relate to the topic cluster without being part of the tactical 8

**Breadcrumb Navigation:** Every page includes breadcrumbs showing:
```
Home > Blog > [Pillar Topic] > [Article Title]
```

This creates the topical relationship without URL nesting.

---

## IV. Internal Linking Matrix

### A. Linking Rules

1. **Every cluster article links to the pillar page** (in the intro paragraph + footer "Next Reading" section)
2. **The pillar page links to all 8 cluster articles** (in the concept explanations)
3. **Cluster articles link to related clusters** (based on concept dependency)
4. **Supporting concepts link to the cluster articles** they reference (not the other way around; maintain pillar/cluster focus)
5. **Anchor text is descriptive, not generic** (avoid "read more"; use phrase-based anchors)

### B. Internal Linking Map

**From PILLAR PAGE:**

| Link To | Anchor Text | Context |
|---|---|---|
| Git Worktree | "Isolation at the filesystem level" | When explaining Pattern 1 |
| Specialist Skills | "Specialist dispatch and skill design" | When explaining Pattern 2 |
| Node-Locality | "The node-locality principle" | When explaining Pattern 3 |
| Venn Dispatch | "Redundancy as validation" | When explaining Pattern 4 |
| Iterative Waves | "Wave-based review methodology" | When explaining Pattern 5 |
| Context Bounding | "Context isolation design" | When explaining the context constraint |
| Probability | "Probability as a first-class design constraint" | When explaining non-determinism |
| Cost Breakdown | "Cost-aware model routing" | When explaining cost constraint |

**From GIT WORKTREE article:**

| Link To | Anchor Text | Context | Section |
|---|---|---|---|
| Pillar | "Multi-Agent Orchestration with Claude Code" | In intro paragraph | Introduction |
| Specialist Skills | "Designing specialist sub-agents for each worktree" | When explaining agent design in worktrees | Step 3 or 4 |
| Node-Locality | "How agent perspective changes across worktrees" | Optional; when discussing whether each agent sees the full project | Troubleshooting |
| Context Bounding | "Limiting context passed to each agent" | When discussing what context each agent should receive | Step 2 |
| Cost Breakdown | "Cost implications of parallel Sonnet execution" | When discussing cost note in Step 3 | Cost Note |
| Pillar | "See the full orchestration guide" | In footer Next Reading section | Key Takeaways / Next Steps |

**From SPECIALIST SKILLS article:**

| Link To | Anchor Text | Context |
|---|---|---|
| Pillar | "See the full orchestration landscape" | Intro paragraph |
| Git Worktree | "Isolation mechanisms that allow specialization to work" | When explaining why specialization requires isolation |
| Node-Locality | "How perspective influences specialist design" | When discussing designing for the specialist's vantage point |
| Cost Breakdown | "Model selection in skill files" | When discussing the model field |
| Pillar | "See related patterns" | Next Reading section |
| Context Bounding | "Limiting specialist context" | When discussing information handling in specialists |

**From NODE-LOCALITY article:**

| Link To | Anchor Text | Context |
|---|---|---|
| Pillar | "The multi-agent orchestration guide" | Intro paragraph |
| Specialist Skills | "How to design specialists that leverage perspective advantages" | In Practical Implication 1 |
| Context Bounding | "Why node-local agents need less context" | In Practical Implication 2 |
| Venn Dispatch | "Using perspective differences for validation" | In Practical Implication 3 |
| Pillar | "Back to the orchestration framework" | Next Reading section |

**From VENN DISPATCH article:**

| Link To | Anchor Text | Context |
|---|---|---|
| Pillar | "See the full orchestration context" | Intro paragraph |
| Specialist Skills | "Designing specialist roles for redundancy" | When explaining specialist selection |
| Iterative Waves | "Integrating Venn with human review gates" | In dedicated section |
| Cost Breakdown | "Cost implications of multi-model redundancy" | When discussing cost tradeoffs |
| Probability | "How to model uncertainty with redundancy" | When discussing reliability models |
| Pillar | "Back to the guide" | Next Reading section |

**From CONTEXT BOUNDING article:**

| Link To | Anchor Text | Context |
|---|---|---|
| Pillar | "The orchestration guide" | Intro paragraph |
| Node-Locality | "Why node-local agents can use smaller windows" | When explaining why context naturally bounds with isolation |
| Git Worktree | "Worktree isolation naturally supports context bounding" | When discussing isolation mechanisms |
| Cost Breakdown | "Context size and cost implications" | When discussing cost calculation |
| Pillar | "Return to orchestration patterns" | Next Reading section |

**From ITERATIVE WAVES article:**

| Link To | Anchor Text | Context |
|---|---|---|
| Pillar | "The full orchestration landscape" | Intro paragraph |
| Venn Dispatch | "Using redundancy within wave cycles" | In dedicated section |
| Probability | "Designing loops for non-determinism" | When discussing loop exit conditions |
| Pillar | "Orchestration guide" | Next Reading section |

**From PROBABILITY article:**

| Link To | Anchor Text | Context |
|---|---|---|
| Pillar | "The orchestration framework" | Intro paragraph |
| Iterative Waves | "Wave cycles account for non-determinism" | When discussing loop design |
| Venn Dispatch | "Redundancy as variance reduction" | When discussing Pattern 1 |
| Pillar | "Orchestration guide" | Next Reading section |

**From COST BREAKDOWN article:**

| Link To | Anchor Text | Context |
|---|---|---|
| Pillar | "The orchestration guide" | Intro paragraph |
| Specialist Skills | "Model assignment in skill files" | When explaining model field design |
| Venn Dispatch | "Cost implications of redundancy" | When discussing multi-model dispatch |
| Context Bounding | "Context size affects cost" | When discussing token calculations |
| Pillar | "Orchestration guide" | Next Reading section |

**From SUPPORTING CONCEPTS:**

| Article | Link To | Anchor Text | Rationale |
|---|---|---|---|
| Vibe Coding | Specialist Skills | "Enforcing design constraints" | Recovery strategy |
| Vibe Coding | Context Bounding | "Making agents more precise" | Recovery strategy |
| Vibe Coding | Node-Locality | "Perspective matters for output quality" | Quality improvement |
| Multi-Agent Watershed | Pillar | "The complete multi-agent guide" | Readers ready for depth |
| Multi-Agent Watershed | All 8 clusters | "Advanced techniques (link to each)" | "Further reading" section |
| Progression | Pillar | "Learn the advanced orchestration landscape" | Graduates to pillar |
| Progression | All 8 clusters | "In-depth explorations of each pattern" | "Advanced topics" section |

---

### C. Linking Principles

**Anchor Text Best Practices:**
- Descriptive of the target concept (not "click here" or "read more")
- Includes primary keyword of target article when natural
- 2–6 words (sweet spot for SEO and usability)
- Contextually relevant (reader understands where they're going)

**Frequency:**
- Pillar page: 8 outbound links (one to each cluster)
- Each cluster article: 3–5 inbound links from related clusters + pillar + supporting concepts
- No "see also" sidebars or link walls (keeps reading flow clean)

**Bidirectional Links:**
- Pillar → Clusters (always)
- Clusters → Pillar (always, in intro and footer)
- Cluster ↔ Cluster (only when concept-dependent; not all pairs)

---

## V. Schema Markup Specifications

### A. Schema by Article Type

#### Schema for Tutorials (Git Worktree, Specialist Skills, Context Bounding, Iterative Waves)

**Schema Type:** `HowTo`

**Implementation (JSON-LD):**

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "[Article Title]",
  "description": "[Meta description or hook paragraph]",
  "image": "[Optional: cover image URL]",
  "estimatedCost": {
    "@type": "PriceSpecification",
    "currency": "USD",
    "price": "0"
  },
  "totalTime": "[ISO 8601 duration — estimate for completion]",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "[Step name]",
      "text": "[Step description, typically H3 heading + first few sentences]"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "[Step name]",
      "text": "[Step description]"
    }
  ]
}
```

**For Tutorials with Multiple Scenarios:** Use multiple `HowTo` schemas (one per scenario) or nest `HowToSection` for grouped steps.

**Use Case:** Captures the Google "How-to" rich result, which appears above organic results for how-to queries.

---

#### Schema for Conceptual Deep-Dives (Node-Locality, Probability)

**Schema Type:** `Article` (with optional `speakable` for AI answer eligibility)

**Implementation (JSON-LD):**

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Article Title]",
  "description": "[Hook paragraph or meta description]",
  "image": "[Article thumbnail or diagram image]",
  "datePublished": "[ISO 8601 publication date]",
  "dateModified": "[ISO 8601 last update date]",
  "author": {
    "@type": "Person",
    "name": "[Author name]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Detached Node",
    "logo": {
      "@type": "ImageObject",
      "url": "[Site logo URL]"
    }
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      "h1",
      ".article-summary"
    ]
  }
}
```

**Use Case:** `speakable` increases eligibility for Google's AI Overviews (answer content). Targeted sections (H1, summary) are flagged as "AI-answer-eligible."

---

#### Schema for Troubleshooting/FAQ (Context Bounding, Venn Dispatch)

**Schema Type:** `FAQPage`

**Implementation (JSON-LD):**

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question as H3 heading]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer paragraph(s)]"
      }
    },
    {
      "@type": "Question",
      "name": "[Question as H3 heading]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer paragraph(s)]"
      }
    }
  ]
}
```

**Use Case:** Captures Google's expandable FAQ panel in SERP. Each question/answer pair appears as a collapsible item.

**Requirement:** At least 3 question/answer pairs per FAQPage schema.

---

#### Schema for Pillar Page

**Schema Type:** `Article` + `BreadcrumbList`

**Implementation (JSON-LD):**

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Multi-Agent Orchestration with Claude Code: The Practitioner's Field Guide",
  "description": "[Meta description]",
  "datePublished": "[ISO date]",
  "dateModified": "[ISO date]",
  "author": {
    "@type": "Person",
    "name": "[Author]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Detached Node"
  }
}
```

**+ BreadcrumbList:**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://detached-node.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://detached-node.com/posts"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Multi-Agent Orchestration",
      "item": "https://detached-node.com/posts/multi-agent-orchestration/"
    }
  ]
}
```

**Use Case:** BreadcrumbList enables enhanced sitelink breadcrumbs in SERP (show path to page). Article schema captures rich metadata.

---

### B. Implementation Notes for Payload CMS

**Where to Add Schema:**
- Payload CMS typically stores JSON-LD in a custom field or in the page `<head>` via a plugin
- Ensure the schema is injected server-side (Next.js App Router) so it's available to Google's crawler

**Tools to Validate:**
- [Google's Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

**Rendering:**
- If using MDX for blog content, schema should be injected at the Next.js page level (in the layout or via a component wrapping the content)
- Never hardcode schema in markdown; it should be generated from the page metadata

---

## VI. Publication Sequencing Strategy

### A. Phase 2 Publication Schedule

**Goal:** Establish topical authority as quickly as possible while maximizing early SEO impact.

**Key Principle:** Launch high-volume, standalone articles first to build a content footprint. Follow with conceptual pieces that deepen authority.

**Recommended Sequence:**

**Week 1 (Day 1–7):**
- **Publish:** Pillar page + Git Worktree cluster article
- **Rationale:** Pillar establishes the topic landscape. Git Worktree has highest standalone search volume and entry point accessibility. Publishing these together signals topical cohesion to Google.

**Week 2 (Day 8–14):**
- **Publish:** Specialist Skills article
- **Rationale:** Natural follow-on from Git Worktrees (isolation → specialization). Readers discovering Git Worktree will be primed for this.

**Week 3 (Day 15–21):**
- **Publish:** Node-Locality article
- **Rationale:** Conceptual grounding for the deeper patterns. Link back to Git Worktrees and Specialist Skills to deepen those pieces.

**Week 4 (Day 22–28):**
- **Publish:** Venn Dispatch + Context Bounding articles
- **Rationale:** These are operational deepenings (applying concepts to reliability and resource management). Publishing as a pair signals richness.

**Week 5 (Day 29–35):**
- **Publish:** Iterative Waves article
- **Rationale:** Brings together redundancy (Venn) and feedback loops. Shows how to orchestrate the full lifecycle.

**Week 6 (Day 36–42):**
- **Publish:** Probability-Aware Workflows article
- **Rationale:** Philosophical reframing. Practitioners at this point in the sequence are ready for the mindset shift.

**Week 7 (Day 43–49):**
- **Publish:** Cost Breakdown article
- **Rationale:** Economics. By this point, readers want to know the real cost implications of these patterns.

**Week 8 (Day 50–56):**
- **Publish:** Supporting Concepts (3 articles, staggered over the week)
  - Day 50: "Vibe Coding and Technical Debt"
  - Day 53: "The Feb 2026 Multi-Agent Watershed"
  - Day 56: "From Prompting to Orchestration"
- **Rationale:** Thought leadership pieces. They link back to the cluster articles, amplifying internal links. Stagger them to maintain consistent publishing rhythm.

### B. Promotion Strategy Alongside Publication

**For High-Volume Entries (Git Worktree, Specialist Skills, Cost Breakdown):**
- Email newsletter (if available)
- Dev.to cross-posting (with canonical link back to Detached Node)
- Twitter/X thread summarizing key points
- HackerNews submission (if appropriate)

**For Conceptual/Thought Leadership (Node-Locality, Probability, Supporting Concepts):**
- Longer-form social posts on LinkedIn (where this audience congregates)
- Email newsletter as "deep-read recommendation"
- Potential podcast appearances or talks (if the author has those channels)

**Internal Promotion:**
- Homepage hero section features "Latest Series" (multi-agent orchestration)
- Navigation menu may include a "Multi-Agent Series" section once 3+ articles are live

---

## VII. Featured Snippet Optimization

### A. Snippet Targets by Article Type

**Tutorial Articles (HowTo Schema):**
- **Snippet Type:** List snippet (6–10 step items)
- **Optimal Format:** Each step as a 1–2 sentence summary
- **Target SERP Placement:** Below the featured snippet position, but in "people also ask" or "how-to" carousels

**Example for Git Worktree:**
```
Featured Snippet Candidate:
- Step 1: Create a new worktree with `git worktree add`
- Step 2: Configure environment variables for isolation
- Step 3: Initialize the agent in the new worktree
- Step 4: Run agents in parallel without conflicts
```

**Conceptual Articles (Deep-Dives):**
- **Snippet Type:** Paragraph snippet (40–60 words)
- **Optimal Format:** Hook paragraph or a single well-written explanation paragraph
- **Placement:** Less likely to capture featured snippets (Google prefers procedural/informational); may appear in "people also ask"

**Cost Articles:**
- **Snippet Type:** Table snippet
- **Optimal Format:** HTML table (3–4 columns, 4–8 rows) with clear headers
- **Placement:** Likely to capture table snippet in SERP

**FAQ Articles:**
- **Snippet Type:** FAQ carousel (expandable items)
- **Optimal Format:** Question/Answer pairs with clear Q/A separation
- **Placement:** Google's expandable FAQ panel

---

### B. Implementation: Featured Snippet Targeting

**Best Practices:**
1. **Lead with a direct answer (40–60 words max)** immediately after the H1. This is the featured snippet candidate.
2. **Use clear list formatting** for steps or items. Avoid prose lists; use HTML `<ol>` or `<ul>`.
3. **Avoid dense paragraphs.** Break complex concepts into scannable chunks.
4. **Answer the query exactly as it appears in the search bar.** If the search is "how to run git worktrees with AI agents," your first paragraph should directly answer that.

**Example Hook Paragraph (Git Worktree Article):**

```
Git worktrees create isolated filesystem branches that allow you to run multiple Claude Code agents
in parallel without conflicts. Each agent operates in its own worktree with independent git history
and environment variables. This guide covers setup, operational patterns, and common pitfalls.
```

This is ~55 words, directly answers the search query, and is snippet-eligible.

---

## VIII. Content Depth and Evergreen Lifespan Assessment

### A. Evergreen vs. Time-Sensitive Content

**Pillar Page:** 90% evergreen
- Core orchestration principles are architectural and will remain relevant
- 10% time-sensitive: specific Claude model capabilities (if API changes, update; happens rarely)
- Update frequency: 2–3 times per year (or when major Claude model updates happen)

**Git Worktree Article:** 95% evergreen
- Git worktree mechanics are stable (git command structure unlikely to change)
- 5% time-sensitive: CLI flags, environment variable names (if Claude Code changes its sub-agent API)
- Update frequency: On-demand (when Claude Code API changes)

**Specialist Skills Article:** 60% evergreen, 40% API-specific
- Skill design principles are evergreen; specific YAML fields are API-dependent
- Highest risk of dating: if Anthropic redesigns the skill file frontmatter
- Update frequency: On-demand (when Anthropic updates the sub-agent API)
- Mitigation: Use disclaimer ("As of Feb 2026, sub-agent YAML structure is...") and plan for a "2026 Update" version

**Node-Locality:** 95% evergreen
- The mental model is conceptual and durable
- Will remain relevant regardless of API evolution
- Update frequency: Rarely (only if the concept is challenged by evidence)

**Venn Dispatch:** 90% evergreen
- Pattern is architectural and tool-agnostic
- Applies to any multi-agent orchestration
- Update frequency: Rarely

**Context Bounding:** 85% evergreen
- Principle is durable; specific context window sizes change with model updates
- Mitigation: Express context budgets as percentages of max window, not absolute tokens
- Update frequency: 1x per major model release

**Iterative Waves:** 95% evergreen
- Feedback loop patterns are stable
- Applicable across domains
- Update frequency: Rarely

**Probability-Aware Workflows:** 100% evergreen
- Foundational principle; will never date
- Update frequency: Never

**Cost Breakdown:** 50% evergreen, 50% time-sensitive
- Pricing structure is the highest-risk element (Anthropic may adjust pricing)
- Pattern and reasoning are evergreen; actual numbers date quickly
- Mitigation: Publish cost estimates with "as of Feb 2026" disclaimer; update pricing on schedule
- Update frequency: 2–3 times per year (whenever Anthropic adjusts pricing) or annually

---

## IX. Success Metrics & Tracking

### A. SEO Metrics to Monitor (Post-Publication)

| Metric | Target (6 months) | Measurement |
|---|---|---|
| Pillar page: keyword rankings | Top 5 for primary keyword; Top 10 for 10+ secondary keywords | Google Search Console |
| Cluster articles: keyword rankings (each) | Top 5 for at least one cluster keyword; Top 10 for secondary keywords | GSC |
| Total organic traffic to cluster | 500+ monthly sessions (across all 8 articles) | Google Analytics 4 |
| Inbound backlinks to cluster | 10+ referring domains | Ahrefs or similar |
| Internal link click-through rate | 15%+ of readers follow internal links within the cluster | GA4 event tracking |
| Average time on page (clusters) | 3+ minutes | GA4 |
| Bounce rate (clusters) | <45% | GA4 |
| Search visibility score | 40+ (Ahrefs or SE Ranking) | Third-party SEO tool |

### B. Content Engagement Metrics

| Metric | Tracking Method |
|---|---|
| Comments per article | Blog commenting system (if enabled) |
| Newsletter sign-up rate | Email platform integration |
| Social shares | Social share button tracking |
| GitHub stars/forks (if code examples included) | GitHub API |
| "Copy code" clicks (if code blocks interactive) | GA4 event |
| Scroll depth (% of page scrolled) | GA4 scroll event |
| Links clicked (internal + external) | GA4 outbound link event |

---

## X. Competitive Differentiation Summary

### What Detached Node Brings That Competitors Don't

1. **Annotated Practitioner Artifacts**
   - Skill files with inline reasoning comments explaining each design decision
   - Not available in any competing content

2. **Failure Mode Diagrams**
   - Diagrams that show what can go wrong, not just happy paths
   - Competitors show architecture; Detached Node shows where architecture fails

3. **Cost Breakdowns with Real Numbers**
   - Estimated costs with disclosed methodology (not just generic guidance)
   - Unique in the space (most practitioners consider cost proprietary)

4. **Node-Locality as a Mental Model**
   - A specific conceptual framework for thinking about agent perspective
   - Novel framing; no existing content explores this

5. **Probability-Aware Design as First-Class Constraint**
   - Explicit treatment of non-determinism as a design pattern, not a problem
   - Absent from competing content (most ignore randomness or hide it)

6. **Practitioner Voice**
   - Annotated design decisions explaining *why*, not just *what*
   - Matches the tone and depth of Martin Fowler's work; unavailable in AI/Claude Code space

---

## XI. Technical Implementation Notes

### A. Next.js App Router Structure (for Engineering team)

```
src/app/
├── posts/
│   ├── [slug]/
│   │   ├── page.tsx          # Post detail page
│   │   ├── layout.tsx        # Post-level layout (breadcrumbs, schema)
│   │   └── metadata.ts       # Dynamic meta tags + schema injection
│   └── page.tsx              # Post listing page
├── layout.tsx                 # Root layout
└── globals.css                # Global styles + Tailwind imports
```

### B. Schema Markup Injection

**Recommended Approach:**
- Use Next.js `Metadata` API in `metadata.ts` to generate JSON-LD schema in `<head>`
- For complex schemas (HowTo with steps), generate from a data structure, not hardcoded strings

**Example (pseudo-code):**

```typescript
// src/app/posts/[slug]/metadata.ts
import { generateHowToSchema, generateArticleSchema } from '@/lib/schema-generators'

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  const schema = post.format === 'tutorial'
    ? generateHowToSchema(post)
    : generateArticleSchema(post)

  return {
    title: post.title,
    description: post.summary,
    other: {
      'application/ld+json': JSON.stringify(schema)
    }
  }
}
```

---

### C. Internal Linking Implementation

**Recommended Approach:**
- Store internal links as data in the CMS (Payload CMS)
- Each post has a field: `relatedPosts: { slug, anchorText, context }`
- Render related links in a consistent component

**Example Component (pseudo-code):**

```tsx
// src/components/RelatedPostLink.tsx
export function RelatedPostLink({ slug, anchorText, context }) {
  return (
    <Link href={`/posts/${slug}/`} className="internal-link">
      {anchorText}
    </Link>
  )
}
```

---

## XII. Risk Mitigation

### Risk 1: API-Specific Content Dates Quickly

**Mitigation:**
- Add disclaimer at the top of API-specific articles: "Last updated: Feb 2026. Sub-agent API subject to change."
- Plan update schedule (quarterly review of skill file syntax, pricing structure)
- Use relative language ("typical context window" vs. "exactly 150K tokens")

### Risk 2: Cost Estimates Become Inaccurate

**Mitigation:**
- Publish actual costs with disclaimer: "Estimated based on Feb 2026 pricing. Anthropic pricing subject to change."
- Use a cost calculation formula readers can update themselves
- Review and update cost article every 6 months

### Risk 3: Specialist Skill File Syntax Unstable

**Mitigation:**
- Check Anthropic's roadmap for planned changes
- Include a note: "This article assumes [version] of Claude Code. Check the official docs for the latest syntax."
- Offer a way for readers to report outdated information (issue template or email)

### Risk 4: Competitors Copy the Architecture

**Mitigation:**
- The differentiation is not the structure (anyone can copy that); it's the depth, voice, and specific examples
- Focus on keeping content current and high-quality
- Establish backlinks early (thought leadership pieces, speaking engagements, social presence)

---

## Summary: Implementation Checklist

- [ ] **Pillar Page**: Write and publish "Multi-Agent Orchestration with Claude Code: The Practitioner's Field Guide" (4,500 words, Week 1)
- [ ] **Git Worktree Cluster**: Write and publish (2,500–3,000 words, Week 1)
- [ ] **Specialist Skills Cluster**: Write and publish (2,500–3,000 words, Week 2)
- [ ] **Node-Locality Cluster**: Write and publish (2,500–3,500 words, Week 3)
- [ ] **Venn Dispatch Cluster**: Write and publish (2,500–3,000 words, Week 4)
- [ ] **Context Bounding Cluster**: Write and publish (2,000–2,500 words, Week 4)
- [ ] **Iterative Waves Cluster**: Write and publish (2,500–3,000 words, Week 5)
- [ ] **Probability-Aware Workflows Cluster**: Write and publish (1,500–2,500 words, Week 6)
- [ ] **Cost Breakdown Cluster**: Write and publish (1,500–2,500 words, Week 7)
- [ ] **Supporting Concepts** (3 articles): Write and publish (1,500–2,000 words each, Week 8)
- [ ] **Schema Markup**: Implement HowTo, Article, FAQPage, BreadcrumbList schemas for all articles
- [ ] **Internal Linking Matrix**: Build data structure mapping all internal links per the matrix in Section IV
- [ ] **Featured Snippet Optimization**: Review each article for snippet-eligible content (direct answer paragraphs, list formatting, tables)
- [ ] **GA4 Events**: Set up event tracking for internal link clicks, code block interactions, scroll depth
- [ ] **Search Console**: Claim and verify property; submit sitemap with all new articles
- [ ] **Monitoring Dashboard**: Set up GSC + GA4 dashboard tracking rankings, traffic, engagement for 6-month review

---

**Document Complete: 2026-02-25**
**Status:** Ready for Authoring Phase
**Next Step:** Assign each article to a writer, establish publishing calendar, and begin content production.
