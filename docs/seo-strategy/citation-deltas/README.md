# Citation Deltas — Inline Citation Pass for Published Posts

Research artifact from issue #392 (Category J of the SEO + AI-discovery plan).

The 4 published blog posts have zero inline citations despite narratively referencing Anthropic essays, arXiv papers, named researchers, and framework docs. Inline citations are associated with higher AI citation lift in generative-engine-optimization research (GEO, KDD 2024). This directory proposes specific link insertions for Julian's manual review and application via Payload admin.

Nothing here modifies post bodies. Nothing here touches production code. Every proposed URL was verified to return HTTP 200 (or an equivalent successful response) at the time of writing.

## Posts covered

| Post                                       | Delta file                                                                       | Proposed citations |
| ------------------------------------------ | -------------------------------------------------------------------------------- | ------------------ |
| `where-agentic-patterns-actually-live`     | [where-agentic-patterns-actually-live.md](./where-agentic-patterns-actually-live.md)         | 8                  |
| `subagent-orchestration-workflow`          | [subagent-orchestration-workflow.md](./subagent-orchestration-workflow.md)                   | 2                  |
| `what-tickets-and-prs-are-actually-for`    | [what-tickets-and-prs-are-actually-for.md](./what-tickets-and-prs-are-actually-for.md)       | 1                  |
| `rethinking-systems-in-the-agentic-age`    | [rethinking-systems-in-the-agentic-age.md](./rethinking-systems-in-the-agentic-age.md)       | 1                  |

Total: 12 proposed citations across 4 posts.

## Application workflow

For each delta:

1. Open the Payload admin at `https://detached-node.dev/admin` (or local equivalent).
2. Navigate to **Posts** and select the post by slug.
3. In the Lexical body editor, locate the passage cited in the delta — search by the original snippet's distinctive phrasing.
4. Select the proposed anchor text in the editor.
5. Open the link drawer (toolbar button or `Cmd-K`). Paste the proposed URL. Confirm.
6. Repeat for all proposed citations in the delta.
7. Save and re-publish.

### Lexical link drawer gotcha

Programmatic URL setting (e.g., `react-hook-form` `setValue`, or `evaluate_script` injection) drops the value silently. Use real keystrokes — manual paste-then-type by hand, or simulated `browser_type` if automated. The reference memory `reference_payload_lexical_links_via_playwright.md` documents this.

## Source verification

Every URL in these deltas was verified to return a successful response at the time of writing (2026-05-17). Re-verify before applying if significant time has passed; the Anthropic engineering essays in particular have moved between `www.anthropic.com/engineering/...` and `code.claude.com/docs/en/...` once already in 2025-2026.

When a redirect is involved, the delta lists the final destination URL — not the historical one — so the link is canonical at insertion time.

## What was deliberately NOT proposed

- **Author's own analysis and assertions.** Lines like "The named patterns are vocabulary. The work happens one level down" are Julian's voice, not external references; linking them out would be wrong.
- **References where no authoritative source could be confidently identified.** Where a phrase like "an earlier piece on subagent orchestration" could refer to multiple posts or an unpublished draft, the delta notes the ambiguity instead of fabricating a link.
- **General programming concepts.** "Autoregressive", "context window", "pair programming" are common knowledge and do not need citations on a blog post.
- **Internal cross-links.** A pass adding `[earlier piece](/posts/subagent-orchestration-workflow)` style internal links is a separate concern (related-posts surface, internal-link graph) and out of scope for this delta set.

## How to read a delta entry

Each citation entry has four parts:

1. **Original snippet** — three or so lines of verbatim context around the reference, so Julian can find the passage in the editor.
2. **Proposed edit** — the same snippet with `[anchor text](url)` inserted at the natural reference point. The anchor text is bolded as the link itself; surrounding prose is untouched.
3. **Source** — the verified URL.
4. **Rationale** — one sentence explaining why this source and which discovery audience benefits (AI citation, organic search, employer, recruiter, peer engineers).

A short "References without confidently identifiable sources" section at the end of each delta lists anything Julian should disambiguate himself before applying the rest.
