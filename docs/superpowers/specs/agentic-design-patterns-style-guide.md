# Agentic Design Patterns — Style Guide

**For:** Phase 2 subagents authoring pattern satellites.
**Read before:** opening any pattern file or writing any prose.

The Reflexion pattern (`src/data/agentic-design-patterns/patterns/reflexion.ts`) is the editorial exemplar. Read it first — this guide codifies the voice rules it demonstrates.

---

## Voice Rules

### Register: terse, diagnostic

Write as a field engineer explaining a pattern to a senior peer. No preamble, no cheerleading, no hedging. The reader already knows what LLMs are. Get to the mechanism.

**Not this:**
> Reflexion is an exciting technique that allows language agents to improve themselves through a fascinating process of self-reflection.

**This:**
> Reflexion teaches a language agent to learn from its own trajectories without touching model weights.

### Overview (bodySummary): third-person observational

State what the pattern does and why. Describe the mechanism as an outside observer would. 2–3 paragraphs, ~300 words total. No imperative verbs. No "you."

**Tense:** present.
**Person:** third (the pattern, the agent, the loop — not the reader).
**Tone:** precise, unapologetic.

### When to use bullets: second-person imperative

Each bullet opens with an imperative verb addressed to the practitioner. "Apply when…", "Use where…", "Reach for it when…", "Prefer it when…".

Bullets describe concrete deployment conditions, not abstract virtues. Each one answers: "Under what circumstances does this pattern pay its cost?"

**Not this:**
> Good for situations where improvement is needed.

**This:**
> Apply when the agent attempts the same task class repeatedly and you have a place to keep critiques across runs (multi-turn assistants, recurring job types, agent benchmarks).

### When NOT to use bullets: conditional or noun-phrase openers

Each bullet starts with a condition or noun phrase, not an imperative. "When…", "Without…", "If…", "Tasks where…". The NOT list is the differentiator — most references omit it. Write it with the same rigor as the When list.

**Not this:**
> Don't use this if it doesn't make sense.

**This:**
> When the task is single-shot, the lesson has no future attempt to inform and the critique step pays no rent.

### In the wild (realWorldExamples): third-person observational

Each entry describes a specific, publicly observable system. Present tense. Cite a URL. Do not invent examples. If you cannot find a real, verifiable example, leave the slot with fewer entries rather than fabricating one.

**Format:** Subject + present-tense verb + what the system does + what that demonstrates about the pattern. Then cite the source.

### Reader gotcha: one paragraph, always cited

Describe one operational hazard that field practitioners regularly miss. The gotcha must cite a public source. If no sourced gotcha exists for the pattern, set `readerGotcha: undefined` rather than writing an unsourced one.

### Implementation sketch: TypeScript or pseudocode with banner

~15 lines. If `sdkAvailability` is `first-party-ts` or `community-ts`, the sketch must compile against the relevant SDK types (`scripts/typecheck-sketches.ts` enforces this at lint time). If `python-only` or `no-sdk`, write illustrative pseudocode and the component renders a banner automatically.

---

## 8 Editorial Principles

Transcribed from the reference design spec. These are load-bearing — violations block merge.

1. **Cite the actual sources.** Every pattern's References section lists 3–7 cited works (papers, foundational essays, vendor docs, books), each with author, year, venue, and URL. Where applicable, papers include DOI and books include page ranges. Gulli's book is one citation among several where his treatment is canonical for that pattern.

2. **References are validated, not just URL-checked.** `scripts/validate-references.ts` cross-checks every `type === 'paper'` reference against Crossref / OpenAlex, verifying title + author surname + year actually match the cited URL. You cannot fabricate plausible-looking-but-wrong citations and pass review. This runs as part of `npm run lint`.

3. **Original prose only.** We summarize patterns in our own words; we never paraphrase a single source's sentences. The no-paraphrase rule with worked examples is in the section below.

4. **Original diagrams only.** Every Mermaid diagram is original. A structurally identical diagram with different fills counts as derivative and blocks merge.

5. **No affiliate tags on any outbound link, ever.** Not just Amazon, not just for one author. A lint rule scans all outbound URLs and rejects known affiliate query params (`tag=`, `ref=`, `aff=`, `linkCode=`, `?via=`, etc.).

6. **Page author is named.** Julian Ken's real name appears in `Article.author` schema and in the satellite footer. "Detached Node" is the publication; the page author is named.

7. **Living catalog, not a fixed-N claim.** The catalog count is dynamic in copy and schema. `dateModified` is tracked per pattern. Pattern files include `lastChangeNote` for changelog auto-generation. The hub eyebrow shows "updated [month YYYY]".

8. **Implementation sketches must compile where a TypeScript SDK exists.** `scripts/typecheck-sketches.ts` validates every TypeScript snippet against the relevant SDK types as part of `npm run lint`. For patterns whose canonical SDKs are Python-only (e.g., AutoGen, original CrewAI), the sketch is illustrative pseudocode with a banner. The `sdkAvailability` field on `Pattern` records which case applies.

---

## No-Paraphrase Rule

We summarize patterns **in our own words**. We do not paraphrase source sentences. Paraphrase means restructuring a source sentence while preserving its structure, word choices, or meaning chain. Even with citation, this is derivative.

**Source material:** Shinn et al. (2023), "Reflexion: Language Agents with Verbal Reinforcement Learning," NeurIPS 2023. https://arxiv.org/abs/2303.11366

The Reflexion abstract states:
> "We propose Reflexion, a novel framework to reinforce language agents not by updating weights, but instead through linguistic feedback. Reflexion agents verbally reflect on task feedback signals, then maintain their own reflective text in an episodic memory buffer to induce better decision-making in subsequent trials."

---

### GOOD example (original synthesis)

> Reflexion teaches a language agent to learn from its own trajectories without touching model weights. After each attempt, the agent inspects the trajectory and any environment feedback, then writes a short verbal critique — a paragraph that names what went wrong and what to try next. That critique is appended to an episodic memory buffer keyed by task or task class. On the next attempt, the agent retrieves the most recent and most relevant critiques and conditions its plan on them, treating prior failures as instructions rather than as silent gradient signal.

**Why it passes:** The mechanism is described in our own words using different sentence structures, different vocabulary choices ("trajectories," "names what went wrong," "silent gradient signal"), and a different conceptual framing (teaching vs. reinforcing; failure as instruction vs. feedback). The source is cited in the References section.

---

### BAD example (paraphrase — do not do this)

> Reflexion is a framework that reinforces language agents not by updating weights, but through linguistic feedback. Reflexion agents verbally reflect on task feedback signals and maintain their own reflective text in an episodic memory buffer to induce better decision-making in future trials.

**Why it fails:** This is a lightly restructured version of the abstract sentence. "Not by updating weights, but through linguistic feedback" is borrowed directly from Shinn et al. The phrase "episodic memory buffer" appears in both (acceptable as a technical term), but the surrounding sentence structure ("verbally reflect on task feedback signals") is a near-direct restatement. Even with a citation, this reproduces the authors' sentence rather than restating the idea independently.

---

### Similarity-check tool

`scripts/check-pattern-overlap.mjs` computes word-level Jaccard similarity between a pattern's `bodySummary` and named source materials, exempting proper nouns and chapter titles. Run it manually during PR review:

```bash
node scripts/check-pattern-overlap.mjs reflexion
```

A high overlap score (> 0.35 with any single source) is a review red flag.

---

## Mermaid Security Rules

**securityLevel: 'strict'** is enforced in `MermaidDiagram.tsx`. This means:

1. **Labeled boxes only.** Use descriptive text labels in every node, not icon shortcodes. Icon shortcodes (`fa:`, `mdi:`) are not available in strict mode and will cause render errors.
2. **No HTML in labels.** `securityLevel: 'strict'` strips HTML tags inside node labels. Plain text only.
3. **No `%%` directives** that change security settings. The component hardcodes `securityLevel: 'strict'` — overrides via `%%{ init: { "securityLevel": "loose" } }%%` will be overridden back to strict.
4. **All diagrams must be original.** Do not reproduce a diagram that appears in a cited source — even structural equivalents with cosmetic changes.

**Preferred diagram types:** `graph TD` (top-down flowchart) or `graph LR` (left-right). Sequence diagrams (`sequenceDiagram`) are acceptable for interaction patterns. Avoid gantt and pie chart types in this context.

**Example of a valid node:**
```
A[Task] --> B[Generate]
```

**Example of an invalid node (icon shortcode — fails strict mode):**
```
A[fa:fa-robot Task] --> B[Generate]
```

---

## References Section Formatting Standard

Each reference must include: `title`, `url`, `authors`, `year`, `type`. For papers: add `doi`. For books: add `venue` and `pages`. For vendor docs: add `accessedAt`.

**Visual table example** (how it renders on the satellite page):

```
REFERENCES
────────────────────────────────────────────────────────────────
[paper]  Shinn et al. (2023) — Reflexion: Language Agents with Verbal
         Reinforcement Learning. NeurIPS 2023. DOI: 10.48550/arXiv.2303.11366
         (foundational paper)

[essay]  Anthropic (2024) — Building Effective Agents.
         Engineering blog. (field-shaping essay)

[paper]  Madaan et al. (2023) — Self-Refine: Iterative Refinement
         with Self-Feedback. NeurIPS 2023.

[book]   Gulli, A. (2026) — Agentic Design Patterns, ch. 4.
         Springer. ISBN 9783032014016. pp. 56–68.

[docs]   LangChain team (2024) — LangGraph: Reflection workflow.
         accessed 2026-05-03.
```

**Count constraint:** 3 minimum, 7 maximum per pattern. The minimum is enforced by the satellite schema test (`citation.length >= 3`). The maximum is editorial — beyond 7, prune to the most authoritative sources.

**Type vocabulary:**
- `paper` — peer-reviewed or arXiv preprint
- `essay` — vendor blog, foundational essay (Anthropic, Karpathy, etc.)
- `docs` — official framework/SDK documentation
- `book` — published book with ISBN
- `spec` — protocol specification (MCP, A2A, OpenAPI, etc.)

---

## STYLE_PASS Checklist

Every subagent PR must check these items in the PR body before requesting review. Julian checks the same list during review.

```
## STYLE_PASS checklist

Pattern: [slug]

- [ ] 3–7 references in `references[]`, each with required fields
- [ ] All paper references have `doi`
- [ ] All book references have `venue` and `pages`
- [ ] All vendor doc references have `accessedAt`
- [ ] `bodySummary` prose is original — not a paraphrase of any single source
- [ ] `whenToUse` bullets open with imperative verbs
- [ ] `whenNotToUse` bullets open with conditional/noun-phrase openers
- [ ] `realWorldExamples` entries cite real, verifiable public sources
- [ ] `readerGotcha` (if present) cites a public source
- [ ] `mermaidSource` compiles without errors (run `pnpm dev` and verify diagram renders)
- [ ] Mermaid diagram uses labeled boxes only — no icon shortcodes
- [ ] `implementationSketch` compiles against SDK types (`pnpm lint` passes) OR `sdkAvailability` is `python-only`/`no-sdk`
- [ ] No affiliate query params in any outbound URL
- [ ] `relatedSlugs` all resolve to existing patterns (`pnpm build` will catch this)
- [ ] `dateModified` is today's ISO date
- [ ] `lastChangeNote` is a 1-line description of this PR's change
```
