# Context management

Without discipline here, agents run out of context window or produce degraded output from consuming too much upstream content. This is the single most common way a funnel run fails.

## Context budget tiers

| What the agent receives | Approximate token cost | Rule |
|------------------------|----------------------|------|
| Full phase output (e.g., all 5 reports) | 3,000–8,000 tokens per report | Never send to downstream agents |
| Context packet (1–2 pages) | 500–1,000 tokens | Safe to send; this is the designed handoff artifact |
| Single investigation area assignment | 200–500 tokens | Safe to send |
| Full analysis report | 2,000–5,000 tokens | Only for final review; individual agents get their assignment only |
| Codebase reads (file contents) | Varies wildly | Agent reads on-demand; do NOT pre-load files into prompt |

## Context waterfall

What each phase's agents see:

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

**Key principle:** each agent sees packets from at most 2 prior phases, never the raw artifacts. Phase 4 is the one exception because it needs the detail to write the final report.

## Context packet format

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

## Anti-bloat rules

1. **Never paste file contents into agent prompts.** Tell the agent which file to read; let it read on-demand. If you pre-load, the agent pays for content it may not need, and you've lost the opportunity for the agent to skip it.
2. **Never send "for reference" context.** If the agent doesn't need it for their specific task, don't include it. "Just in case" context is the fastest way to burn a context window.
3. **Summarize, don't excerpt.** If an investigator wrote 500 words about a finding, the packet says "Area 3 found high complexity in auth middleware — 4 verification paths with no shared abstraction (confidence: high)." That's it.
4. **One investigation task per agent prompt when possible.** If an agent handles 2+ tasks, they must be tightly related. Otherwise, dispatch separate agents.
5. **Agent prompts should be under 2,000 tokens** (excluding the skill/system prompt). If your prompt to a dispatched agent exceeds this, you're sending too much context.
