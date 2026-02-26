# Area 5: Content Format & Structure Optimization

**Date:** 2026-02-25
**Investigator:** Content Strategy / SEO Analyst
**Scope:** Optimal content formats, structural elements, SEO architecture, and differentiation opportunities for AI coding workflow content targeting technical practitioners
**Evidence Base:** Web search of SEO research, developer blog analysis, schema markup guides, pillar/cluster strategy literature, and competitive content audit from Area 2

---

## Executive Summary

Not all concepts from the sub-agent orchestration transcript map to the same content format. Tutorial formats dominate the git worktrees / practical implementation space because that audience arrives with a "how do I do this?" intent. Architectural deep-dives with diagrams suit concepts like node-locality and Venn-of-specialists because the idea itself requires a visual scaffold to land. Opinion and philosophy pieces serve probability-aware workflows and iterative review waves, where the insight is a reframing of how to think, not a set of steps to follow. Case studies with real cost data are essentially absent from this space and represent the highest differentiation potential.

The pillar topic is **multi-agent orchestration for Claude Code practitioners**, with the pillar page covering the full landscape and cluster articles drilling into each concept. Internal linking across clusters, structured data markup on tutorials and FAQs, and annotated code/config blocks in lieu of plain prose are the format levers that drive both engagement and ranking signals. Content length optimum for this audience is 2,000–3,500 words per article, with pillar pages at 4,000–5,000 words.

Detached Node's differentiation opportunity is not visual polish—it is **the practitioner annotating their own work**: inline commentary on skill file frontmatter, cost breakdowns embedded in config examples, and architecture diagrams that show failure modes, not just happy paths.

---

## Key Findings

### Finding 1: Format Follows Intent — Map Each Concept to Its Search Mode

**Evidence:** Area 4 documented six pain point clusters with distinct primary intents (How-to, Problem-solving, Informational, Educational). SEO research confirms that content format mismatches with user intent produce high bounce rates regardless of topic quality. Developer-focused SEO analysis from daily.dev shows technical searches skew toward long-tail, step-oriented queries ("how to run multiple Claude agents in parallel with git worktrees") rather than generic topic queries.

**Concept-to-Format Matrix:**

| Concept | Primary Search Intent | Optimal Format | Rationale |
|---|---|---|---|
| Git worktree isolation for parallel agents | How-to | Step-by-step tutorial with shell commands | Practitioners arrive with cursor ready; want copy-paste commands |
| Sub-agent skill file / YAML frontmatter | How-to | Annotated config tutorial | The artifact itself (the YAML block) is what practitioners seek |
| Parallel specialist dispatch (Venn model) | Informational | Architecture deep-dive with diagram | Concept requires spatial representation to make sense |
| Node-locality mental model | Informational | Conceptual essay with diagram | Novel framing; practitioner needs the model before the steps |
| Probability-aware workflows | Educational | Opinion/philosophy + concrete example | Mindset shift first; checklist second |
| Hallucination mitigation via redundancy | Problem-solving | Tutorial + before/after comparison | Practitioner has the problem, needs the solution pattern |
| Iterative review waves | Educational + How-to | Hybrid: framework piece + implementation section | Abstract pattern + concrete implementation steps |
| Context isolation / bounding | Problem-solving | Troubleshooting guide with diagnosis flow | Practitioner experiences symptoms, not the underlying model |
| Cost optimization (Opus orchestrator + Sonnet sub-agents) | How-to + Informational | Cost breakdown article with worked examples | Numbers anchor abstract cost claims; unique angle |
| Overlapping lanes of fire / specialist coverage | Informational | Conceptual architecture piece | Best explained with a Venn diagram + annotated dispatch table |

**Confidence:** HIGH. Intent-to-format mapping is well-established in SEO literature. Competitor analysis (Area 2) confirms existing content in this space is mismatched: most git worktree posts are intros that stop before operational detail; most hallucination posts are theoretical when practitioners need checklists.

---

### Finding 2: Annotated Configs and Skill Files Are a High-Differentiation Format Element

**Evidence:** The competitive analysis (Area 2) found that official Anthropic sub-agent docs are "raw syntax, minimal guidance." The most cited unofficial resources are GitHub gists and single-developer blog posts that show the actual file structure without explaining the design decisions behind it. Claude Code sub-agent YAML frontmatter (fields: `name`, `description`, `tools`, `model`, `skills`, `maxTurns`, `permissionMode`) is documented but not annotated with practitioner reasoning in any existing content.

The Codapi and Sandpack ecosystems show that interactive code embeds drive significantly longer dwell times versus static code blocks. While full interactivity is a Phase 3 investment for Detached Node (as per `CLAUDE.md`), even **annotated static code blocks with inline commentary** outperform plain snippets in practitioner engagement because they answer the implicit "why" alongside the "what."

**Format prescription for skill/config content:**

```yaml
# Annotated example: specialist sub-agent for database review
# The 'description' field is read by the orchestrator at dispatch time —
# precision here determines how accurately Claude routes tasks.
name: db-specialist
description: >
  Reviews database queries, schema design, and ORM patterns.
  Invoke when changes touch migrations, models, or raw SQL.
  Do NOT invoke for frontend or purely UI-related changes.

# Sonnet is used here deliberately: review tasks don't require Opus-level
# reasoning and running 4-5 Sonnet instances costs less than 1 Opus call.
model: claude-sonnet-4-6

tools:
  - Read
  - Grep
  - Glob

# Limit context passed in: the agent needs the diff and the schema,
# not the entire project history. Context budget is real money.
maxTurns: 8
```

Each annotation explains a design decision the practitioner would otherwise have to discover by trial and error. This format is absent in competing content.

**Confidence:** HIGH. Direct evidence from competitor gap analysis; corroborated by developer content research showing DZone-style "refcardz" (cheat sheets) are among the most bookmarked developer content formats.

---

### Finding 3: Architecture Diagrams Drive Engagement for Systems-Level Concepts — But Must Show Failure Modes

**Evidence:** n8n's blog is specifically cited in Area 2 as using a "visual-first approach" that produces good engagement. Microsoft Azure's architecture center content is described as authoritative precisely because it uses pattern diagrams. However, both are criticized for being "template-like" — diagrams show the happy path, not the failure mode.

The transcript's most novel concepts (node-locality, Venn-of-specialists, overlapping lanes of fire) are inherently spatial ideas. Text alone cannot efficiently convey:
- Why instantiating an agent "on the node" produces a different perspective than the root orchestrator
- How Venn-diagram specialist overlap creates redundant validation coverage
- Where context contamination originates in a multi-agent graph

**Diagram types mapped to concepts:**

| Concept | Diagram Type | Failure Mode to Include |
|---|---|---|
| Parallel specialist dispatch | Fan-out graph with role labels | What happens when one agent hallucinates (show the outlier path) |
| Node-locality vs. root perspective | Two-panel perspective diagram | What the root sees vs. what the node-instantiated agent sees |
| Overlapping lanes of fire | Venn diagram with coverage zones | Where gaps remain despite overlap |
| Git worktree isolation | Filesystem tree + process diagram | Port collision and environment variable leakage |
| Iterative review waves | Timeline with gate checkpoints | What triggers a re-wave vs. a pass |
| Context bounding | Token budget bar chart | What happens to quality as context fills beyond optimal range |

The "failure mode" inclusion is the differentiation. Almost no competitor content shows the diagram of what goes wrong. Yet practitioners often arrive at a diagram *because* something went wrong and they are diagnosing it.

**Confidence:** MEDIUM-HIGH. Diagram effectiveness for systems concepts is well-documented. The "failure mode in diagram" angle is inferred from competitor gap analysis (Area 2 noted this gap explicitly: "failure modes unexplored") rather than measured directly.

---

### Finding 4: The Pillar Topic Is "Multi-Agent Orchestration for Claude Code" — Cluster Articles Cover Each Major Concept

**Evidence:** Pillar/cluster research shows 63% more keyword rankings within 90 days and 40% increase in organic traffic for sites that implement pillar-cluster architecture versus isolated posts (StanVentures, 2026 data). Following Google's December 2025 Core Update, E-E-A-T signals were increased across all content types, which favors topical depth through clusters over single comprehensive posts.

The keyword cluster around "Claude Code sub-agents," "parallel AI agents git worktrees," "multi-agent orchestration," and "hallucination mitigation AI coding" constitutes an emerging, low-competition cluster that Area 2 identified as having no established content authority.

**Proposed Architecture:**

**Pillar Page (4,000–5,000 words):**
"Multi-Agent Orchestration with Claude Code: The Practitioner's Field Guide"
- Covers all major concepts at summary depth
- Links out to every cluster article
- Includes a concept dependency diagram (read X before Y)
- Targets: "multi-agent orchestration Claude Code," "parallel AI coding agents guide"

**Cluster Articles (2,000–3,500 words each):**

| Cluster Article | Pillar Link Anchor | Format |
|---|---|---|
| Git Worktrees for Parallel AI Agents: Complete Operational Guide | "Isolation at the filesystem level" | Tutorial |
| Designing Specialist Sub-Agents: The Skill File Annotated | "Specialist dispatch and skill design" | Annotated config tutorial |
| Node-Locality: Why Agent Perspective Matters More Than Agent Capability | "The node-locality principle" | Conceptual deep-dive + diagram |
| Hallucination Mitigation Through Redundancy: The Venn Dispatch Pattern | "Redundancy as validation" | Architecture post + before/after |
| Context Bounding: Keeping Sub-Agent Windows Clean | "Context isolation design" | Problem-solving guide |
| Iterative Review Waves: Structuring Feedback Loops with Human Gates | "Wave-based review methodology" | Framework post + implementation |
| Probability-Aware Workflows: Designing AI Systems for Non-Determinism | "Probability as a first-class design constraint" | Opinion/philosophy + example |
| Opus Orchestrates, Sonnet Executes: The Cost Case for Mixed-Model Dispatch | "Cost-aware model routing" | Cost breakdown + tutorial |

**Confidence:** HIGH. Pillar/cluster model is well-validated. The specific pillar topic matches the dominant emerging keyword cluster identified in Areas 2 and 4. Competition for this pillar is currently minimal (no established authority site has claimed it as of Feb 2026).

---

### Finding 5: SEO-Optimal Structure for Each Format Type

**Evidence:** SEO research confirms that heading hierarchy, direct answer placement, structured data markup, and content length all interact with ranking signals. The featured snippet format (paragraph snippets at 40–60 words, list snippets with 6–8 items, table snippets for comparisons) is the primary above-the-fold opportunity for how-to and informational queries in this space.

**Heading Hierarchy Pattern (apply consistently across cluster articles):**

```
H1: [Post title — primary keyword in first 60 characters]

[Hook paragraph — 2–3 sentences answering the core question directly for featured snippet capture]

## [H2: Why This Matters — the problem being solved]
## [H2: Core Concept / Mental Model — the framing]
### [H3: Sub-concept or variation]
## [H2: Implementation — the how-to section]
### [H3: Step 1...]
### [H3: Step 2...]
## [H2: Failure Modes and Troubleshooting]
## [H2: Cost and Tradeoff Analysis — if applicable]
## [H2: Summary + Next Steps]
### [H3: Key Takeaways — 5–7 bullet points for snippet capture]
### [H3: Related Reading — internal links to cluster articles]
```

**Structured Data Opportunities:**

| Article Type | Schema Type | Target Rich Result |
|---|---|---|
| Step-by-step tutorials | `HowTo` | How-to rich result in SERP |
| FAQ-style troubleshooting guides | `FAQPage` | Expandable FAQ panel |
| Comparison/tradeoff posts | `Table` (via HTML) | Table snippet |
| Pillar page | `Article` + `BreadcrumbList` | Enhanced sitelink breadcrumbs |
| Architecture concept posts | `Article` + `speakable` | AI answer eligibility |

**Content Length by Format:**

| Format | Target Word Count | Rationale |
|---|---|---|
| Pillar page | 4,000–5,000 | Must cover full topic; links to all clusters |
| Tutorial (how-to) | 2,000–3,000 | Steps + context + troubleshooting; 1,800 minimum for HowTo schema |
| Architecture deep-dive | 2,500–3,500 | Concept density is high; diagrams add navigational anchors |
| Opinion/philosophy | 1,500–2,500 | Argument-driven; engagement drops with excessive length |
| Cost breakdown | 1,500–2,500 | Numbers do the heavy lifting; prose should be sparse |
| Case study | 2,000–3,500 | Problem + approach + results + quantified outcomes |

**TL;DR Section (apply to all articles 2,000+ words):**
A "Key Takeaways" or "TL;DR" block at the top (or after the intro) serves two purposes: it captures readers who skim, and it is the most likely block to be pulled as a featured snippet. Format as a 5–7 item bulleted list, each item a complete sentence, each under 20 words.

**Confidence:** HIGH. Content length and heading hierarchy recommendations are well-validated across multiple SEO research sources. Schema markup CTR improvement data (82% higher CTR for rich results) is cited from multiple 2025–2026 sources.

---

### Finding 6: The Differentiation Opportunity Is Practitioner Voice Inside the Format — Not a New Format

**Evidence:** The competitive landscape (Area 2) is populated by:
- Official docs (authoritative but thin)
- Theoretical architecture posts (deep but abstract)
- "Hello World" tutorials (concrete but shallow)
- SEO listicles (neither)

The one content type that is nearly absent is **annotated practitioner work**: content where someone shows their actual skill file, their actual worktree setup script, their actual cost breakdown from a real sprint, and then explains their design decisions in plain language. This is what the transcript provides in raw form—a practitioner talking through their real system.

The Martin Fowler model is instructive here: Fowler's authority does not come from novel formats (his site is mostly prose). It comes from the practitioner perspective that distills "complex concepts into accessible, practical guidance" and addresses "common pain points, making developers feel less alone." The Detached Node voice ("analytical, not promotional") is the right register for this.

**Specific format elements that create practitioner credibility:**

1. **Annotated code blocks:** Inline comments on each configuration decision (not just what the parameter does, but why the author chose that value)
2. **Cost tables from real usage:** "Running 4 Sonnet sub-agents for a 300-file review cost $X. Running 1 Opus instance on the same task cost $Y." Estimated or real numbers with methodology disclosed.
3. **Failure mode sections:** "Here is what broke the first time I tried this and why"
4. **Decision logs:** When the author considered an alternative approach and rejected it, with the reasoning shown
5. **Context budget worked examples:** "This ticket required 12K tokens of context. Here's how I selected which files to include and which to exclude, and why"
6. **Before/after comparisons:** Single-agent session excerpt vs. parallel specialist dispatch result for the same task — actual outputs, even if abbreviated

**What to avoid:**
- Generic "here are 5 tips" structures without the practitioner's own reasoning
- Diagrams that show only the successful path
- YAML examples without annotation explaining the design intent behind each field value
- Opinion pieces that state a position without showing the data or experience that produced it

**Confidence:** HIGH. The gap is structurally identifiable from competitor analysis. The prescription is grounded in what makes the reference voices in this space (Fowler, Osmani, Nick Mitchinson) effective.

---

### Finding 7: Series vs. Standalone — Cluster Model Wins, But Entry Points Must Work Standalone

**Evidence:** Google's December 2025 Core Update increased the weight of topical authority signals, which favors clusters. However, practitioner search behavior is non-linear — readers discover a cluster article directly from search, not from the pillar page. Content that requires prior reading of other cluster articles will suffer from high bounce rates for this audience.

**Design principle:** Every cluster article must be self-contained. The pillar page is a navigational hub for readers who have discovered the blog, not a prerequisite for readers who arrive from search.

**Implementation:**
- Each cluster article opens with a 2–3 sentence "context paragraph" that grounds the reader without requiring prior reading (e.g., "Claude Code allows you to dispatch sub-agents as specialist workers on isolated tasks. This article covers one isolation mechanism — git worktrees — in operational detail.")
- Internal links use descriptive anchor text that tells the reader what they will learn, not generic "read more" phrasing
- Each cluster article ends with 2–3 "Next Reading" links chosen based on concept dependency, not alphabetical order

**Standalone vs. Series Tradeoff by Concept:**

| Concept | Standalone Viability | Series Position if Sequenced |
|---|---|---|
| Git worktrees tutorial | High (search intent is direct) | Entry point — requires no prior reading |
| Specialist skill files | High | After worktrees (worktrees enable isolation; skills enable specialization) |
| Node-locality mental model | Medium (abstract without operational context) | After worktrees + skill files |
| Probability-aware workflows | Low standalone (requires orchestration foundation) | Late cluster — after all operational articles |
| Iterative review waves | Medium | After hallucination redundancy article |
| Cost model (Opus + Sonnet) | High (search intent is direct: "reduce Claude Code costs") | Any position; links back to pillar |

**Confidence:** HIGH. Pillar-cluster research strongly supports this architecture. The standalone viability ratings are inferred from search intent analysis (Area 4) and confirmed by the structural independence of each concept.

---

## Surprises

1. **The Annotated Skill File Format Has No Established Competition.** Every source that covers Claude Code sub-agents shows the raw syntax. Not one source found in the competitive review provides inline commentary explaining *why* each frontmatter field is set as it is. This is the simplest format differentiation available: copy the official format, then annotate it with practitioner reasoning.

2. **Failure Mode Diagrams Are a Completely Open Field.** Architecture diagrams in this space universally show happy paths. Yet practitioners most need visual guidance precisely when things break — when agents interfere with each other, when context contamination degrades output, when a hallucination passes through without detection. Failure mode diagrams have no established creator in this space.

3. **Cost Breakdown Posts With Real Numbers Are Absent Despite High Demand.** Area 2 identified "cost models for multi-agent workflows don't exist" as a research gap. Area 4 identified context economics as Pain Point #6. Yet no practitioner has published a real sprint cost breakdown comparing single-agent vs. parallel sub-agent approaches with actual dollar figures. This is likely because practitioners consider cost data proprietary — which means the first person to publish estimated figures with disclosed methodology will own this keyword cluster.

4. **Interactive Elements Are a Phase 3 Investment, Not Phase 2.** The research on code playgrounds (Sandpack, Codapi) shows real engagement benefits. However, for a Phase 1–2 blog (as per `CLAUDE.md`), the investment is not justified. The format equivalent is: annotated static code blocks that answer the "why" question interactively through prose commentary — same cognitive effect, zero infrastructure cost.

5. **Thought Leadership Posts Are SEO-Weak But Backlink-Rich.** Opinion/philosophy posts (probability-aware workflows, the node-locality framing) will not rank for high-volume searches. They will, however, be cited by other practitioners and link aggregators (HackerNews, dev.to newsletters) in ways that build domain authority, which then lifts the whole cluster. The strategic role of opinion posts is to earn backlinks, not to capture search volume directly.

6. **Short-Form "TIL" Posts Have a Specific Use Case: Newsletter Fodder and Social Distribution.** The research shows short-form (under 1,000 words) generates more comments and social sharing than long-form, but performs worse in organic search. For Detached Node, the pattern is: long-form cluster articles for SEO, short-form "TIL" observations and findings for newsletter sections and social posts that drive readers back to the cluster articles.

---

## Unknowns

1. **Which Diagram Tool Integrates Best With Next.js for Maintainable Architecture Diagrams?** Mermaid.js (text-based diagrams embedded in MDX), Excalidraw exports (PNG), and Figma embeds are all viable. Unknown which produces the best combination of accessibility, load performance, and maintainability for this blog's Phase 2 content pipeline.

2. **Will Sub-Agent Skill File Syntax Remain Stable?** The annotated config format strategy assumes YAML frontmatter fields remain stable. If Anthropic changes the sub-agent API significantly, annotated examples date quickly. Unknown how to balance specificity (high engagement) with longevity (evergreen value).

3. **How Much of the Practitioner Voice Transcript Can Be Converted Without Additional First-Person Data?** Many of the highest-differentiation format elements (cost tables, before/after outputs, failure logs) require data points that are not in the transcript. The transcript provides the frameworks; the specific numbers and outputs require either fabrication (low credibility) or additional documentation of real runs. Unknown how much first-person evidence exists beyond what is in the transcript.

4. **Which Cluster Article Should Launch First?** The git worktree tutorial has the highest search volume and standalone viability, suggesting it should be the first published cluster article. But launching the pillar page first creates the internal linking structure. Unknown whether the pillar-first or highest-volume-cluster-first sequencing produces better early traffic for a new domain.

5. **Schema Markup Implementation Timing.** HowTo and FAQPage schema require structured data in JSON-LD. The blog's current Phase 1 state (Next.js scaffold per `CLAUDE.md`) does not appear to have a schema markup implementation. Unknown when this will be built out, and whether the CMS (Payload CMS with Postgres, as per `CLAUDE.md`) will support schema generation.

6. **AI-Generated Content Detection and E-E-A-T Risk.** Google's December 2025 Core Update increased E-E-A-T weight. Content that reads as AI-generated without first-person experience signals may be demoted regardless of structural optimization. Unknown how strictly this applies to technical practitioner content where the author's real-world experience is the primary E-E-A-T signal.

---

## Raw Evidence

### SEO Structure and Length Research
- [How to Structure Blog Posts For SEO (2025 Guide)](https://digitalmarketingwinds.com/structure-blog-posts-for-seo/)
- [The Blog Post Structure That Google (and Readers) Love](https://www.crazyegg.com/blog/blog-post-structure/)
- [Long-form content that wins developer SEO in 2025](https://maximize.partners/blog/long-form-content-that-wins-developer-seo-in-2025)
- [Ideal Blog Post Length for SEO: 2026 Word Count Guide](https://www.bluehost.com/blog/ideal-blog-post-length/)
- [Content Length: Ideal Blog Post Length in 2025 in 9 Charts](https://seo.co/content-length/)

### Featured Snippets and Structured Data
- [Are Featured Snippets Still a Thing? (2026 SEO Guide)](https://keywordseverywhere.com/blog/are-featured-snippets-still-a-thing-2025-seo-guide/)
- [Technical SEO Elements for Featured Snippets](https://insidea.com/blog/seo/aeo/technical-seo-elements-for-featured-snippets/)
- [How to Optimize for Featured Snippets: A Quick Guide](https://embedpress.com/blog/how-to-optimize-for-featured-snippets/)
- [Schema Markup Guide: Structured Data for Rich Results 2025](https://www.digitalapplied.com/blog/schema-markup-implementation-guide)
- [FAQ Schema for AI Answers: Setup Guide & Examples](https://www.getpassionfruit.com/blog/faq-schema-for-ai-answers)
- [Using structured data for SEO in 2026](https://comms.thisisdefinition.com/insights/ultimate-guide-to-structured-data-for-seo)

### Pillar/Cluster Architecture
- [Pillar Cluster Content Model: A Complete Guide (2026)](https://www.stanventures.com/blog/pillar-cluster-content-model/)
- [How to Build Pillar Content: A Step-by-Step Guide (2026 Edition)](https://niumatrix.com/pillar-cluster-content-guide/)
- [Content Clusters vs. Single Pages: SEO Architecture for 2026](https://www.xictron.com/en/blog/content-cluster-seo-architecture-2026/)
- [SEO Content Clusters 2026: Topic Authority Guide](https://www.digitalapplied.com/blog/seo-content-clusters-2026-topic-authority-guide)
- [Designing Pillar Pages for Maximum SEO Impact](https://www.siteimprove.com/blog/pillar-page-design/)

### Thought Leadership and Developer Blog Strategy
- [Thought Leadership and SEO: 5 Ways Thought Leadership Drives Rankings](https://www.orbitmedia.com/blog/thought-leadership-seo/)
- [How to create good thought leadership content that also ranks for SEO](https://erinpennings.com/create-good-thought-leadership-content-seo/)
- [Why Case Study Content Helps Pages Rank Faster](https://hashmeta.com/blog/why-case-study-content-helps-pages-rank-faster-the-seo-science-behind-proof-based-content/)
- [Best Technical Blogs for Developers in 2026](https://draft.dev/learn/technical-blogs)
- [12 Tips for Effective Technical Blogging](https://trstringer.com/technical-blogging-tips/)

### Interactive Content and Code Playgrounds
- [A World-Class Code Playground with Sandpack](https://www.joshwcomeau.com/react/next-level-playground/)
- [codapi: Interactive code examples](https://codapi.org/)
- [Introducing the MDN Playground: Bring your code to life!](https://developer.mozilla.org/en-US/blog/introducing-the-mdn-playground/)

### Reference Voice Analysis (Fowler/Osmani)
- [Martin Fowler — Software Architecture and Bliki](https://martinfowler.com/)
- [AddyOsmani.com — My LLM coding workflow going into 2026](https://addyosmani.com/blog/ai-coding-workflow/)
- [Agentic AI, MCP, and spec-driven development: Top blog posts of 2025 — GitHub Blog](https://github.blog/developer-skills/agentic-ai-mcp-and-spec-driven-development-top-blog-posts-of-2025/)

### Claude Code Sub-Agent Format Reference
- [Create custom subagents — Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)
- [Claude Code Customization: CLAUDE.md, Slash Commands, Skills, and Subagents](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [Best practices for Claude Code sub-agents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### Git Worktrees Content Structure Reference
- [How Git Worktrees Changed My AI Agent Workflow — Nx Blog](https://nx.dev/blog/git-worktrees-ai-agents)
- [Using Git Worktrees for Multi-Feature Development with AI Agents — Nick Mitchinson](https://www.nrmitchi.com/2025/10/using-git-worktrees-for-multi-feature-development-with-ai-agents/)
- [Git worktrees for parallel AI coding agents — Upsun Developer Center](https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/)
- [Running Multiple AI Agents at Once Using Git Worktrees — Medium](https://medium.com/design-bootcamp/running-multiple-ai-agents-at-once-using-git-worktrees-57759e001d7a)

### Long-Form vs. Short-Form Research
- [Long-Form Content vs Short-Form Content for SEO](https://www.myseofreelancer.com/post/is-longer-content-better-for-seo-when-to-use-long-form-content-vs-short-form-content)
- [Short-Form vs. Long-Form Content: Choosing the Right Length in SEO](https://searchatlas.com/blog/short-form-vs-long-form/)
- [Long Form vs Short Form Content Strategy: The 2027 Guide](https://www.automateed.com/long-form-vs-short-form-content-strategy)

---

## Summary of Format Prescriptions by Post Type

### Tutorial / How-To (git worktrees, skill file setup, context bounding)

- Length: 2,000–3,000 words
- Structure: Hook (featured snippet target) → Why this matters → Prerequisite setup → Step-by-step with commands → Failure modes and troubleshooting → TL;DR
- Code blocks: Annotated with inline comments explaining design decisions, not just syntax
- Schema: `HowTo` JSON-LD
- Diagrams: Optional; if included, show process flow with failure branches
- Internal links: Link to pillar page and 2–3 related cluster articles

### Architecture Deep-Dive (node-locality, Venn-of-specialists, iterative review waves)

- Length: 2,500–3,500 words
- Structure: Hook → Mental model introduction → Diagram (happy path) → Diagram (failure mode) → Implementation sketch → Practical implications → TL;DR
- Diagrams: Required; both happy path and failure mode; Mermaid or Excalidraw exports
- Schema: `Article` + `speakable` for AI answer eligibility
- Internal links: Link to the how-to cluster articles that implement the concept described

### Opinion / Philosophy (probability-aware workflows, why vibe coding fails)

- Length: 1,500–2,500 words
- Structure: Strong opening claim → Evidence (data + practitioner experience) → Counter-argument acknowledged → Resolution → Concrete implication for reader → Call to next reading
- No structured data schema (opinion content does not qualify for rich results)
- Distribution role: Earn backlinks from HackerNews, dev.to; drive domain authority for cluster
- No code blocks unless illustrating the argument; not a tutorial in disguise

### Cost Breakdown (Opus + Sonnet mixed-model strategy)

- Length: 1,500–2,500 words
- Structure: Hook with quantified claim → Setup (what the test was) → Cost tables with methodology notes → Analysis → Extrapolation to larger scale → TL;DR with key numbers
- Tables: Required; cost comparison formatted for table featured snippet capture
- Schema: `Article` (table content does not have a dedicated schema type but HTML table markup is sufficient)
- Requires first-person data: estimated figures with disclosed methodology are acceptable if clearly labeled as estimates

### Case Study (a real sprint, ticket, or debugging session)

- Length: 2,000–3,500 words
- Structure: Situation → Approach (with design decisions annotated) → What worked → What failed → Results (quantified) → What I would do differently
- E-E-A-T signal: Highest of any format because it demonstrates first-hand experience
- Internal links: Most natural anchor for referencing all cluster articles (case study uses the tools described in the cluster)
- Not required for launch but should appear by the 5th–6th published article to establish credibility

---

**Analysis Complete:** 2026-02-25
**Document Status:** Ready for Phase 2 iteration
