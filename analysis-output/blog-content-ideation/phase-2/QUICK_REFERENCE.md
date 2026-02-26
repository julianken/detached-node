# Quick Reference: Content Architecture at a Glance

## The Pillar-Cluster Strategy

**1 Pillar Page** + **8 Cluster Articles** + **3 Supporting Concepts** = Complete topical authority

---

## Pillar Page

**Title:** Multi-Agent Orchestration with Claude Code: The Practitioner's Field Guide
**URL:** `/posts/multi-agent-orchestration/`
**Word Count:** 4,500–5,000
**Format:** Navigation hub + landscape overview
**Publication:** Week 1, Day 1

---

## 8 Cluster Articles (Publication Order)

### Week 1: Git Worktrees
- **Title:** Git Worktrees for Parallel AI Agents: Complete Operational Guide
- **URL:** `/posts/git-worktree-isolation-parallel-agents/`
- **Words:** 2,500–3,000
- **Format:** Step-by-step tutorial
- **Schema:** HowTo
- **Search Intent:** "How do I run agents in parallel?"

### Week 2: Specialist Skills
- **Title:** Designing Specialist Sub-Agents: The Skill File Annotated
- **URL:** `/posts/specialist-subagent-skill-design/`
- **Words:** 2,500–3,000
- **Format:** Annotated config tutorial
- **Schema:** HowTo
- **Search Intent:** "How do I design specialists?"

### Week 3: Node-Locality
- **Title:** Node-Locality: Why Agent Perspective Matters More Than Agent Capability
- **URL:** `/posts/node-locality-agent-perspective/`
- **Words:** 2,500–3,500
- **Format:** Conceptual deep-dive + diagrams
- **Schema:** Article + speakable
- **Search Intent:** "Why does agent placement matter?"

### Week 4A: Venn Dispatch
- **Title:** Hallucination Mitigation Through Redundancy: The Venn Dispatch Pattern
- **URL:** `/posts/hallucination-mitigation-venn-dispatch/`
- **Words:** 2,500–3,000
- **Format:** Architecture post + before/after
- **Schema:** HowTo
- **Search Intent:** "How do I prevent hallucinations?"

### Week 4B: Context Bounding
- **Title:** Context Bounding: Keeping Sub-Agent Windows Clean
- **URL:** `/posts/context-bounding-subagent-windows/`
- **Words:** 2,000–2,500
- **Format:** Problem-solving guide
- **Schema:** FAQPage
- **Search Intent:** "How much context should agents have?"

### Week 5: Iterative Waves
- **Title:** Iterative Review Waves: Structuring Feedback Loops with Human Gates
- **URL:** `/posts/iterative-review-waves-feedback-gates/`
- **Words:** 2,500–3,000
- **Format:** Framework + implementation
- **Schema:** HowTo
- **Search Intent:** "How do I structure multi-turn work?"

### Week 6: Probability
- **Title:** Probability-Aware Workflows: Designing AI Systems for Non-Determinism
- **URL:** `/posts/probability-aware-workflow-design/`
- **Words:** 1,500–2,500
- **Format:** Opinion/philosophy + example
- **Schema:** Article
- **Search Intent:** "How do I design for uncertainty?"

### Week 7: Cost Breakdown
- **Title:** Opus Orchestrates, Sonnet Executes: The Cost Case for Mixed-Model Dispatch
- **URL:** `/posts/opus-orchestrates-sonnet-executes-cost/`
- **Words:** 1,500–2,500
- **Format:** Cost analysis + worked examples
- **Schema:** Article (with table)
- **Search Intent:** "How do I reduce orchestration costs?"

---

## 3 Supporting Concepts (Thought Leadership)

Published Week 8, staggered. These earn backlinks and build domain authority.

- **Vibe Coding & Technical Debt** (`/posts/vibe-coding-technical-debt/`)
- **The Feb 2026 Multi-Agent Watershed** (`/posts/multi-agent-watershed-2026/`)
- **From Prompting to Orchestration** (`/posts/prompting-to-orchestration-progression/`)

---

## Internal Linking Pattern

**Pillar Page links to all 8 clusters** (in context paragraphs)

**Each cluster links to:**
- The pillar page (in intro + footer)
- 2–3 related clusters (based on concept dependency)

**Supporting concepts link back** to clusters (not vice versa)

---

## Schema Markup Deployment

| Article Type | Schema | Use Case |
|---|---|---|
| Tutorials (5 articles) | HowTo | Google "How-to" rich results |
| Conceptual (2 articles) | Article + speakable | AI overview eligibility |
| FAQ-style (2 articles) | FAQPage | Expandable FAQ panel |
| Pillar | Article + BreadcrumbList | Enhanced breadcrumbs |

---

## Featured Snippet Targets

- **Git Worktree:** List snippet (step list, 6–8 items)
- **Specialist Skills:** List snippet or paragraph (field overview)
- **Node-Locality:** Paragraph (explanation of concept)
- **Venn Dispatch:** Table snippet (coverage analysis table)
- **Context Bounding:** Paragraph (context bounding principle) + list (strategies)
- **Iterative Waves:** List snippet (wave phases) or diagram reference
- **Probability:** Paragraph (definition of probability-aware design)
- **Cost Breakdown:** Table snippet (cost comparison tables)

---

## Key Differentiation

1. **Annotated YAML Skill Files** — Inline comments explaining design decisions (no one else does this)
2. **Failure Mode Diagrams** — Shows what breaks, not just happy paths
3. **Cost Breakdowns with Real Numbers** — Estimated with disclosed methodology
4. **Node-Locality Mental Model** — Novel conceptual framework
5. **Probability-Aware Design** — Treats uncertainty as a design constraint, not a problem
6. **Practitioner Voice** — Shows the reasoning behind decisions, not just the artifacts

---

## Metrics to Track (6-Month Target)

- Pillar page ranking: Top 5 for primary keyword
- Cluster articles: Each ranks Top 5–10 for at least one keyword
- Total cluster traffic: 500+ monthly sessions
- Inbound backlinks: 10+ referring domains to the cluster
- Internal link CTR: 15%+ of readers follow internal links
- Average time on page: 3+ minutes (clusters)

---

## URL Structure

```
/posts/multi-agent-orchestration/                         [PILLAR]
/posts/git-worktree-isolation-parallel-agents/           [CLUSTER]
/posts/specialist-subagent-skill-design/                 [CLUSTER]
/posts/node-locality-agent-perspective/                  [CLUSTER]
/posts/hallucination-mitigation-venn-dispatch/           [CLUSTER]
/posts/context-bounding-subagent-windows/                [CLUSTER]
/posts/iterative-review-waves-feedback-gates/            [CLUSTER]
/posts/probability-aware-workflow-design/                [CLUSTER]
/posts/opus-orchestrates-sonnet-executes-cost/           [CLUSTER]
/posts/vibe-coding-technical-debt/                       [SUPPORT]
/posts/multi-agent-watershed-2026/                       [SUPPORT]
/posts/prompting-to-orchestration-progression/           [SUPPORT]
```

No nesting under pillar; all clusters are sibling URLs. Topical relationship created via breadcrumbs + internal linking + schema.

---

## Implementation Checklist (Quick Version)

- [ ] Write pillar page (Week 1)
- [ ] Write 8 cluster articles (Weeks 1–7, publication schedule above)
- [ ] Write 3 supporting concepts (Week 8)
- [ ] Implement all schema markup (HowTo, Article, FAQPage, BreadcrumbList)
- [ ] Build internal linking matrix data structure
- [ ] Optimize each article for featured snippet candidates
- [ ] Set up GA4 event tracking (internal links, scroll depth, code clicks)
- [ ] Verify GSC + submit sitemap
- [ ] Create 6-month monitoring dashboard (GSC + GA4)

---

**Document:** `/Users/j/repos/tech-blog/analysis-output/blog-content-ideation/phase-2/iterator-4-content-architecture.md`

**Status:** Complete, ready for authoring phase
