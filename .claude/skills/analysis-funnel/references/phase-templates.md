# Phase output templates

Every agent writes to its designated file path **before** returning. Return values are advisory; the file on disk is authoritative. If the file is missing after the agent returns, treat the agent as failed and re-dispatch.

## Phase 1 — Investigator output

File path: `{ARTIFACT_ROOT}/phase-1/area-{N}-{slug}.md`

Each investigator must:

1. Gather evidence — use MCP tools, read code, query docs, inspect the actual system
2. Cite every claim with file path, line number, documentation URL, or tool output
3. Identify surprises — things that were unexpected or contradict prior assumptions
4. Flag unknowns — what couldn't be determined and why

```markdown
# Investigation: {Area Name}

## Summary
{3–5 sentence overview of findings}

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

## Phase 2 — Iterator output

File path: `{ARTIFACT_ROOT}/phase-2/iterator-{N}-{focus}.md`

Each iterator must:

1. Deepen the analysis on their assigned task (not develop solution options)
2. Cite evidence for every claim
3. Assess confidence with reasoning
4. Connect findings back to the broader analysis question

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

For cross-cutting analysis tasks, use an architecture or codebase-exploration specialist as the `subagent_type` — they need breadth, not depth in a single domain.

## Phase 3 — Synthesizer output

File path: `{ARTIFACT_ROOT}/phase-3/synthesis-{N}.md`

Each synthesizer must:

1. Synthesize — don't just list findings, build a coherent narrative or framework
2. Cite back — every synthesis claim traces to specific Phase 1/2 findings
3. Rate confidence for the synthesis as a whole and for individual conclusions
4. Identify blind spots — what might this synthesis lens be missing?

```markdown
# Synthesis: {Lens Name}

## Synthesis Approach
{How this synthesis lens was applied}

## Core Narrative
{The coherent story that emerges from the evidence through this lens — 1–2 paragraphs}

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

Use broad architectural/analytical specialists for all 3 synthesizers. They need broad thinking, not domain specialization.
