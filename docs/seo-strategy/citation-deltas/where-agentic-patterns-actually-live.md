# Citation Deltas — `where-agentic-patterns-actually-live`

Post URL: https://detached-node.dev/posts/where-agentic-patterns-actually-live
Published: May 15, 2026

## Summary

- **Proposed citations:** 8
- **Citations confirmed verified (HTTP 200 / successful fetch):** 8
- **References mentioned but no authoritative source found:** 1

This post is the densest source of unattributed external references in the published set. It names two arXiv papers, the Anthropic "Building effective agents" essay, Claude Code primitives (subagents, skills, hooks, MCP), and the superpowers plugin's writing-skills skill — none of which currently link out.

## Proposed insertions

### Citation 1: Anthropic's December 2024 "Building effective agents" essay

**Original snippet:**

> The shared names mostly come from Anthropic's December 2024 "Building effective agents" post, which lists six workflows: prompt chaining, routing, parallelization with sectioning and voting, orchestrator-workers, evaluator-optimizer, and the open-ended "agents" category.

**Proposed edit:**

> The shared names mostly come from Anthropic's December 2024 ["Building effective agents"](https://www.anthropic.com/engineering/building-effective-agents) post, which lists six workflows: prompt chaining, routing, parallelization with sectioning and voting, orchestrator-workers, evaluator-optimizer, and the open-ended "agents" category.

**Source:** https://www.anthropic.com/engineering/building-effective-agents
**Source verified:** YES on 2026-05-17. Confirmed as Anthropic's December 19, 2024 engineering post by that title.
**Rationale:** This is the load-bearing taxonomy citation for the whole post — the entire "shared names" framing is grounded in this essay. The page is the primary AI-discovery target for queries about agentic workflow patterns, so anchoring directly to it both grounds the post and surfaces it in retrievals that follow this citation.

### Citation 2: Reflexion paper (Shinn et al., 2023)

**Original snippet:**

> Reflection isn't on that list; it traces back to the Reflexion paper (Shinn et al., 2023) and Self-Refine (Madaan et al., 2023). I'll flag jargon where I use it.

**Proposed edit:**

> Reflection isn't on that list; it traces back to the [Reflexion paper (Shinn et al., 2023)](https://arxiv.org/abs/2303.11366) and [Self-Refine (Madaan et al., 2023)](https://arxiv.org/abs/2303.17651). I'll flag jargon where I use it.

**Source:** https://arxiv.org/abs/2303.11366
**Source verified:** YES on 2026-05-17. Confirmed title "Reflexion: Language Agents with Verbal Reinforcement Learning", authors include Noah Shinn et al., v4 submitted October 10, 2023.
**Rationale:** Academic citation in the canonical place — arXiv abstract page. Reflexion is one of two named papers in the post and the standard reference for the verbal-reflection pattern; linking it raises the page's authority signal for AI overviews summarizing reflection patterns, and serves engineer-readers who want to chase the primary source.

### Citation 3: Self-Refine paper (Madaan et al., 2023)

**Original snippet:**

> Reflection isn't on that list; it traces back to the Reflexion paper (Shinn et al., 2023) and Self-Refine (Madaan et al., 2023). I'll flag jargon where I use it.

**Proposed edit:**

> (Combined with Citation 2 above.) Reflection isn't on that list; it traces back to the [Reflexion paper (Shinn et al., 2023)](https://arxiv.org/abs/2303.11366) and [Self-Refine (Madaan et al., 2023)](https://arxiv.org/abs/2303.17651). I'll flag jargon where I use it.

**Source:** https://arxiv.org/abs/2303.17651
**Source verified:** YES on 2026-05-17. Confirmed title "Self-Refine: Iterative Refinement with Self-Feedback", lead author Aman Madaan, submitted March 30, 2023.
**Rationale:** Paired companion to Reflexion in the post's own phrasing. Same rationale: academic peer-source for the reflection pattern, picks up the AI-discovery audience that follows up on reflection lineage and the engineer-reader who reads primary papers.

### Citation 4: Anthropic SDK docs (the "build from scratch" reference)

**Original snippet:**

> Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover subagents, skills, hooks, and MCP servers individually.

**Proposed edit:**

> [Anthropic's SDK docs](https://github.com/anthropics/claude-cookbooks) show you how to build the patterns from scratch in code. The feature docs cover subagents, skills, hooks, and MCP servers individually.

**Source:** https://github.com/anthropics/claude-cookbooks
**Source verified:** YES on 2026-05-17. Confirmed as the official Anthropic Cookbook repo (`anthropics/claude-cookbooks`, 43.2k stars), which contains a `patterns/agents` directory of from-scratch implementations for the building-effective-agents workflows — exactly the artifact the prose references.
**Rationale:** The Cookbook is the canonical "build the patterns from scratch in code" companion to the Building Effective Agents essay. This connects Julian's claim to the actual implementation artifact. Note: if Julian had a narrower target in mind (e.g., the `@anthropic-ai/sdk` API reference, or a specific `claude-agent-sdk` page), this can be substituted, but the cookbook is the most defensible match for "show you how to build the patterns from scratch."

### Citation 5: Claude Code subagents docs

**Original snippet:**

> Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover subagents, skills, hooks, and MCP servers individually.

**Proposed edit:**

> Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover [subagents](https://code.claude.com/docs/en/sub-agents), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks), and [MCP servers](https://modelcontextprotocol.io/) individually.

**Source:** https://code.claude.com/docs/en/sub-agents
**Source verified:** YES on 2026-05-17. The previous `docs.claude.com/en/docs/claude-code/sub-agents` path now 301-redirects to `code.claude.com/docs/en/sub-agents`; the final destination resolves and is titled "Create custom subagents".
**Rationale:** This is the primary canonical doc for one of the four primitives the post is explicitly bridging onto. Linking each named primitive to its own doc serves the engineer-reader who needs the actual feature reference, and reinforces topical authority for "Claude Code subagents" AI queries.

### Citation 6: Claude Code skills docs

**Original snippet:**

> Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover subagents, skills, hooks, and MCP servers individually.

**Proposed edit:**

> (Combined with Citation 5 above.) Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover [subagents](https://code.claude.com/docs/en/sub-agents), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks), and [MCP servers](https://modelcontextprotocol.io/) individually.

**Source:** https://code.claude.com/docs/en/skills
**Source verified:** YES on 2026-05-17. Page titled "Extend Claude with skills", documents SKILL.md format, frontmatter fields, and skill-content lifecycle.
**Rationale:** Same as Citation 5 — the canonical doc for one of the four named primitives. The skills page is also where the SKILL.md format is defined, which the post directly references later ("A more long-term solution would be encoding that prompt as a SKILL.md file...").

### Citation 7: Claude Code hooks docs

**Original snippet:**

> Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover subagents, skills, hooks, and MCP servers individually.

**Proposed edit:**

> (Combined with Citation 5 above.) Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover [subagents](https://code.claude.com/docs/en/sub-agents), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks), and [MCP servers](https://modelcontextprotocol.io/) individually.

**Source:** https://code.claude.com/docs/en/hooks
**Source verified:** YES on 2026-05-17. Page titled "Hooks reference", documents the SubagentStop hook the post specifically names in the next section ("A SubagentStop hook (or a convention inside the subagent file) appends a structured note...").
**Rationale:** Same as Citations 5-6, with extra justification: the post later names `SubagentStop` specifically, and the hooks reference is the exact page that documents that hook event. Linking up front primes the reader for the named-hook reference that follows.

### Citation 8: Model Context Protocol home

**Original snippet:**

> Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover subagents, skills, hooks, and MCP servers individually.

**Proposed edit:**

> (Combined with Citation 5 above.) Anthropic's SDK docs show you how to build the patterns from scratch in code. The feature docs cover [subagents](https://code.claude.com/docs/en/sub-agents), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks), and [MCP servers](https://modelcontextprotocol.io/) individually.

**Source:** https://modelcontextprotocol.io/
**Source verified:** YES on 2026-05-17. Page titled "What is the Model Context Protocol (MCP)?", the canonical home of the open standard.
**Rationale:** MCP is its own open standard, not strictly an Anthropic feature — the canonical home is `modelcontextprotocol.io`, not Claude Code's docs. Linking the protocol itself rather than Claude Code's MCP integration page is more accurate to what the post says ("MCP servers" generally, not "Claude Code's MCP support"), and serves the broader audience that lands on this post via MCP-flavored queries.

## References without confidently identifiable sources

- **"the superpowers plugin"** in the line *"writing-skills in the superpowers plugin is the one I reach for"*. The most likely target is `github.com/obra/superpowers` (confirmed as the official superpowers plugin for Claude Code, containing the writing-skills skill among others). However, Julian may have intended a different distribution channel — the plugin marketplace listing, his own fork, or a more specific path inside the repo. Recommended URL if Julian confirms: `https://github.com/obra/superpowers`, optionally narrowed to `https://github.com/obra/superpowers/tree/main/skills/writing-skills` if such a directory exists at apply time. Flagged here rather than included in the count of 8 because Julian should disambiguate his preferred surface.

- **"an earlier piece on subagent orchestration"** in the Critic section. This is plausibly an internal link to `/posts/subagent-orchestration-workflow`. Internal cross-linking is out of scope for this delta (see README — internal-link audit is a separate concern), but flagging it here so Julian can decide whether to add it during the same Payload edit pass.
