# Final analysis report template

File path: `{ARTIFACT_ROOT}/phase-4/analysis-report.md`

The analysis report must be comprehensive enough to inform downstream decisions without requiring re-investigation.

## Structure

### A) Executive summary

Non-technical summary anyone could understand. 5–7 sentences covering: what was analyzed, the most important findings, and the key implications.

### B) Analysis question & scope

Restatement of what was analyzed and what was explicitly in/out of scope.

### C) Table of contents

Every section of the report with 1–2 sentence summaries.

### D) Methodology

Brief description of what was investigated and how (which MCP tools, code areas, documents, etc.). This establishes credibility and traceability.

### E) Key findings

Organized by theme (not by investigation area). Each finding:

```
### Finding: {TITLE}
**Confidence:** {high|medium|low}
**Evidence:** {specific code references, data, tool output}
**Impact:** {what this means — why it matters}
**Related findings:** {cross-references to other findings}
```

Order by a combination of confidence and impact — high-confidence, high-impact findings first.

### F) Analysis & implications

The "so what" section. What do the findings mean when considered together? This is where the synthesis lenses combine:

- **Thematic patterns** — what recurring themes emerge across findings?
- **Risks & vulnerabilities** — what problems or dangers were identified?
- **Strengths & opportunities** — what's working well or could be leveraged?
- **Gaps & unknowns** — what couldn't be determined? What should be investigated further?

### G) Confidence assessment

Overall assessment of how much to trust this analysis:

```
### Overall Confidence: {high|medium|low}

**Strongest claims** (high confidence):
- {claim 1} — {why we're confident}
- {claim 2} — {why we're confident}

**Moderate claims** (medium confidence):
- {claim 1} — {what would increase confidence}

**Weakest claims** (low confidence):
- {claim 1} — {why we're uncertain, what would help}

**Known blind spots:**
- {areas the analysis did not or could not cover}
```

### H) Recommendations

High-level recommendations, NOT implementation plans. Each recommendation:

```
### Recommendation: {TITLE}
**Priority:** {high|medium|low}
**Rationale:** {which findings support this}
**Trade-offs:** {what you'd be giving up or risking}
**Open questions:** {what needs to be answered before acting on this}
```

Recommendations stay high-level — implementation details and execution plans belong in a separate deliverable.

### I) Open questions

Questions that this analysis surfaced but did not answer. For each:
- The question itself
- Why it matters
- Suggested approach to answering it

### J) Appendix: Evidence index

A reference table mapping every major finding to its evidence sources:

```
| Finding | Evidence Source | Type | Location |
|---------|---------------|------|----------|
| {title} | {file/tool/doc} | {code|data|doc|observation} | {path/URL} |
```

## Phase 4 synthesis checklist

The Phase 4 agent must:

1. Weave together insights from all 3 synthesis lenses into a unified narrative
2. Resolve contradictions between synthesis outputs with explicit reasoning
3. Verify completeness — does the report address every aspect of the original analysis question from Phase 0?
4. Check for blind spots — did any investigation area's findings get lost during synthesis?
5. Assess overall confidence — how confident are we in the analysis as a whole?
6. Produce the full analysis report per the structure above

This is NOT just "pick the best of 3" — it's a final synthesis that weaves insights from all three lenses together.
