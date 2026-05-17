# Citation Deltas — `rethinking-systems-in-the-agentic-age`

Post URL: https://detached-node.dev/posts/rethinking-systems-in-the-agentic-age
Published: April 19, 2026

## Summary

- **Proposed citations:** 1
- **Citations confirmed verified (HTTP 200 / successful fetch):** 1
- **References mentioned but no authoritative source found:** 0

This is the earliest published post and is largely a posture-setting essay — what to evolve, what to leave behind, where to spend attention, how to work together. The post deliberately stays at the level of framing, so it names very few concrete external technologies. The one inline citation worth adding is to MCP, which is the only named protocol in the body.

## Proposed insertions

### Citation 1: MCP / connectors (the only named protocol in the post)

**Original snippet:**

> They were created and adopted to solve specific problems, and those problems are not just going to disappear. It will take time for our ways of working to evolve, and many of these technologies may be able to evolve along with us. Properly maintained connectors or MCP servers might be enough for us to continue using these services as-is.

**Proposed edit:**

> They were created and adopted to solve specific problems, and those problems are not just going to disappear. It will take time for our ways of working to evolve, and many of these technologies may be able to evolve along with us. Properly maintained connectors or [MCP servers](https://modelcontextprotocol.io/) might be enough for us to continue using these services as-is.

**Source:** https://modelcontextprotocol.io/
**Source verified:** YES on 2026-05-17. Page titled "What is the Model Context Protocol (MCP)?", canonical home of the open standard.
**Rationale:** MCP is the only specific external technology the post names by name. Linking it grounds the central claim that existing project-management tooling, git providers, and observability platforms may not need to be thrown out wholesale — they may instead be wrapped with MCP. This citation serves the AI-discovery audience (this is the load-bearing technology mention for "agentic integration" queries), the engineer-reader (concrete protocol to follow), and the employer/peer audiences (signals that the author tracks the current agentic stack, not just abstract framing).

## References without confidently identifiable sources

None for this post.

## Note on absent citations

The post deliberately operates at a posture-setting level — what to evolve, what to leave behind, where to spend attention. References like "AI generated document that the person who generated it hadn't even bothered to read yet", or "the way we've always measured tool effectiveness" are general industry observations, not citations to specific work. Forcing speculative citations into those passages would weaken the post.

If a future revision wanted one additional citation to strengthen AI-discovery surface area, the natural candidate would be a productivity-measurement source (e.g., DORA, SPACE framework) to ground the line *"Productivity shouldn't be measured by the number or size of the artifacts you generate."* This is flagged here for Julian's awareness but not proposed as a delta, because the post's own framing does not actually claim to be in dialogue with any specific productivity-measurement literature, and force-fitting a DORA citation would over-claim.
