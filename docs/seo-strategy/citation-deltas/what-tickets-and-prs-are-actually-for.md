# Citation Deltas — `what-tickets-and-prs-are-actually-for`

Post URL: https://detached-node.dev/posts/what-tickets-and-prs-are-actually-for
Published: April 20, 2026

## Summary

- **Proposed citations:** 1
- **Citations confirmed verified (HTTP 200 / successful fetch):** 1
- **References mentioned but no authoritative source found:** 0

This post is almost entirely Julian's own argument about why ticketing and PR conventions still pay rent in an agentic workflow. The only external reference that benefits from an inline citation is the MCP / connector mention, which references a concrete open standard with a canonical URL.

## Proposed insertions

### Citation 1: MCP / connectors (the protocol the prose names directly)

**Original snippet:**

> The same artifacts are useful to an AI agent. Dispatching a fresh agent to pick up a ticket lets it start with a clean context and zero in on what matters for execution. With properly set up connectors or MCP servers, an agent can:

**Proposed edit:**

> The same artifacts are useful to an AI agent. Dispatching a fresh agent to pick up a ticket lets it start with a clean context and zero in on what matters for execution. With properly set up connectors or [MCP servers](https://modelcontextprotocol.io/), an agent can:

**Source:** https://modelcontextprotocol.io/
**Source verified:** YES on 2026-05-17. Page titled "What is the Model Context Protocol (MCP)?", canonical home of the open standard.
**Rationale:** MCP is the specific protocol the prose names. It is the only concrete external technology in the entire post, and linking it grounds the agent-readability claim that follows (traverse linked docs, interpret design mocks, ingest prior decisions). Linking the protocol home rather than the Claude Code MCP doc keeps the citation tool-agnostic, matching the post's tool-neutral framing. Serves AI-discovery (queries about agent + ticketing integration), engineer-reader (concrete protocol to investigate), and employer/peer audiences (signals literacy in current agentic stack).

## References without confidently identifiable sources

None for this post. The other references the post makes — to "convergence over decades", to engineering teams that "discovered their value the hard way", to "engineering team norms" — are general claims about the practice of software engineering, not citations to specific named work, and should remain unlinked. Adding speculative citations there would weaken rather than strengthen the post's authority.

## Note on absent citations

The post argues a position about the durability of ticketing and PR norms in agentic workflows. It is correct that this is largely original argument, not a literature survey, and the lack of additional citations is by design. The post's discoverability gains will come mostly from the named MCP citation above plus internal cross-links (e.g., to `subagent-orchestration-workflow` for the "multiple lenses" PR-review framing) — but internal cross-linking is out of scope here (see README).
