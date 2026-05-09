# Crash recovery

Sessions crash, context gets lost, conversations expire. The funnel is designed to be **fully recoverable from local artifacts alone** — no conversation history required.

## What survives a crash

- Everything in `{ARTIFACT_ROOT}/` — `STATUS.md`, phase outputs, context packets
- Git state — branches, commits, worktrees

## What gets lost

- Conversation context (messages, reasoning, intermediate thinking)
- Any agent state not written to disk
- The orchestrator's mental model of what's in progress

## STATUS.md format

`STATUS.md` is the single source of truth for recovery. A new session with zero context must be able to read this one file and know exactly where things stand.

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

Use `scripts/update_status.py` to manage transitions atomically — don't hand-edit unless you're recovering a broken state.

## Update rules

- Update `STATUS.md` **before** starting each phase (mark in-progress) and **after** completing each phase (mark done, link artifacts). The `init_funnel.sh`, `update_status.py`, and `verify_phase.sh` scripts enforce this.
- Never delete previous entries — only update status fields.
- If `STATUS.md` does not exist when you're about to dispatch agents for any phase, stop. You skipped a checkpoint. Write `STATUS.md` before proceeding.

## Recovery procedure

When starting a new conversation after a crash, or when the user says "recover" or "where were we":

### Step 1: Find the artifact root

```bash
scripts/list_funnels.sh docs     # default location
# or wherever the user put it
```

If multiple funnels exist, show the user the list and ask which to resume.

### Step 2: Read STATUS.md

This tells you which phase was in progress, which sub-steps were complete, and where all artifacts live.

### Step 3: Read the relevant context packets

Based on the current phase:
- Resuming Phase 2: read `phase-0-packet` + `phase-1-packet`
- Resuming Phase 3: read `phase-0-packet` + `phase-2-packet`
- Resuming Phase 4: read `phase-0-packet` + `phase-3-packet`

**Do NOT read all artifacts.** The packets contain everything you need. Only read raw phase artifacts if a packet is missing or `STATUS.md` indicates an artifact was incomplete.

### Step 4: Resume

| State | Action |
|-------|--------|
| Mid-phase (e.g., Phase 1 investigators 1–3 done) | Read completed artifacts + packets, dispatch remaining agents, continue |
| Between phases (e.g., Phase 2 done, Phase 3 not started) | Read the latest packet, proceed to next phase |
| Phase 4 done | Report is complete; present to user |
| `STATUS.md` missing | Scan artifact root for what exists, reconstruct state from file timestamps and contents, write `STATUS.md` before proceeding |

### Step 5: Announce state to user

Before doing anything, tell the user:

```
Recovered funnel state for "{topic}":
- Phase: {current phase}
- Progress: {what's done / what's pending}
- Next action: {what you'll do next}

Proceed?
```

## Preventing data loss

1. Write `STATUS.md` before AND after every state transition. This is a ~100-token write. Do it every time.
2. Agents must write their output to disk before reporting completion. Never rely on agent return values as the sole record.
3. If `STATUS.md` does not exist when you're about to dispatch agents for any phase, stop. Write `STATUS.md` before proceeding.
