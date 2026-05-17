# Citation Deltas — `subagent-orchestration-workflow`

Post URL: https://detached-node.dev/posts/subagent-orchestration-workflow
Published: April 24, 2026

## Summary

- **Proposed citations:** 2
- **Citations confirmed verified (HTTP 200 / successful fetch):** 2
- **References mentioned but no authoritative source found:** 0

This post is mostly Julian's own framing of the orchestrator + clean-context subagent pattern. The two external references that warrant inline citations are: (1) Claude Code as the named tool, and (2) the autoregressive-LLM technical claim, which is grounded enough to deserve a primary source.

## Proposed insertions

### Citation 1: Claude Code (tool reference)

**Original snippet:**

> A walkthrough of an orchestration pattern for agentic coding: a single orchestrator dispatches scoped subagents to independent tasks, and an independent reviewer inspects each result. The examples use Claude Code, but the concepts apply to any modern agentic coding tool.

**Proposed edit:**

> A walkthrough of an orchestration pattern for agentic coding: a single orchestrator dispatches scoped subagents to independent tasks, and an independent reviewer inspects each result. The examples use [Claude Code](https://code.claude.com/docs/en/overview), but the concepts apply to any modern agentic coding tool.

**Source:** https://code.claude.com/docs/en/overview
**Source verified:** YES on 2026-05-17. The legacy `docs.claude.com/en/docs/claude-code/overview` 301-redirects to `code.claude.com/docs/en/overview`. The destination is the official Claude Code overview page.
**Rationale:** Claude Code is the named tool the entire walkthrough is grounded in, and it appears in the first paragraph without an anchor. Linking out from the first product mention is the cheapest standard SEO/citation hygiene move, and AI overviews summarizing this post will route through this URL when the post is the citation source. Engineer-reader, AI-citation, and recruiter audiences all benefit.

### Citation 2: Autoregressive LLM behavior (Claude Code best-practices on context-window behavior)

**Original snippet:**

> The large language model powering these tools is autoregressive; every new token attends to the full conversation history. As the context grows with each completed task, irrelevant work from earlier tasks is still present and influencing the model's output.

**Proposed edit:**

> The large language model powering these tools is autoregressive; every new token attends to the full conversation history. As the context grows with each completed task, [irrelevant work from earlier tasks is still present and influencing the model's output](https://code.claude.com/docs/en/best-practices).

**Source:** https://code.claude.com/docs/en/best-practices
**Source verified:** YES on 2026-05-17. Page titled "Best practices for Claude Code". Contains the explicit statement: *"LLM performance degrades as context fills. When the context window is getting full, Claude may start 'forgetting' earlier instructions or making more mistakes."* This is the operationally-grounded primary source for the claim Julian is making.
**Rationale:** The autoregressive claim is technical and could be sourced to a transformer paper (Vaswani et al., 2017), but the *operational* claim Julian is making — that residual context degrades subsequent task quality — is better sourced to Claude Code's own best-practices doc, which says exactly this. This citation reinforces the post's central argument about why fresh-context subagents work and routes AI overviews to a load-bearing primary source rather than an academic detour.

## References without confidently identifiable sources

None for this post. The remainder of the prose ("This also changes how review works...", "To structure your work, you will have subagents create tickets...") is Julian's own framing of the orchestration pattern and is correctly unattributed.
