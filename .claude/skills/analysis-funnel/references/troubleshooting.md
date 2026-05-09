# Troubleshooting

Common failure modes and their fixes.

## Agents in a wave produced redundant output

The orchestrator's task assignments for that wave weren't differentiated enough. Re-read the previous wave's output and reconsider how to assign tasks — each agent should have a meaningfully different slice of the problem.

## Agents didn't follow their assigned task

The prompt was too vague or included too much context that distracted from the specific task. Re-dispatch with a more focused prompt and less background context. If the agent had multiple concerns, split the task.

## Findings lack evidence

The agent prompt didn't emphasize evidence-gathering strongly enough, or the agent wasn't given the right MCP tools/file paths to investigate. Re-dispatch with explicit instructions to use specific tools and cite specific sources. Consider naming the specific MCP servers to use in the prompt.

## Context packets are too long

Enforce the 1–2 page limit strictly. If you can't summarize a phase in 2 pages, the phase output needs restructuring, not a longer summary. The packet captures *signal*, not *all content* — the raw artifacts exist for anyone who needs detail.

## User wants to skip phases

The funnel's value comes from the full pipeline. Skipping Phase 2 (iteration) is the most common request and the most dangerous — without it, raw investigation findings go directly to synthesis without being developed, validated, or cross-referenced. Push back gently but firmly.

## Agent ran out of context / output degraded

The agent prompt was too large. Check:
1. Are you sending raw phase artifacts instead of context packets?
2. Are you sending multiple tasks to one agent?
3. Are you pre-loading file contents into the prompt instead of letting the agent read on-demand?

Fix: follow the Context Waterfall strictly — each agent sees packets from at most 2 prior phases. Agent prompts should be under 2,000 tokens.

## Crashed mid-funnel, no conversation context

Read `{ARTIFACT_ROOT}/STATUS.md`. It contains the full recovery state. Follow the recovery procedure in `references/crash-recovery.md` — read `STATUS.md`, then the relevant context packets, then resume from the indicated sub-state. Do NOT re-read all phase artifacts.

## STATUS.md is missing or stale

Scan the artifact root directory. Check which phase folders exist and which contain complete artifacts. Look at file timestamps to determine order. Reconstruct `STATUS.md` from what you find, write it, then proceed with recovery.

This situation means the disk-checkpoint discipline was violated in the previous session. After recovering, make sure all missing checkpoint artifacts (analysis-brief, context packets) are reconstructed before dispatching any new agents.

## Multiple funnel artifact roots exist

Run `scripts/list_funnels.sh [search-root]`, show the user their topics and states, and ask which to resume.

## Analysis produced actionable recommendations — now what?

The analysis report is the final deliverable. It's up to the user to decide what to do with the recommendations.
