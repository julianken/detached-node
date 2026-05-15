import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'identity-separated-review',
  name: 'Identity-Separated Review',
  alternativeNames: ['Cross-Identity Code Review', 'Cross-Tier Review', 'Bot-Identity Review'],
  layerId: 'methodology',
  oneLineSummary: 'Routes PR review through a separate machine-user identity on a different model tier.',
  bodySummary: [
    'Identity-Separated Review routes every code-review step through a dedicated machine-user identity that is structurally isolated from the implementer: separate GitHub account, separate macOS Keychain credential scoped to a single subprocess, and a different model tier loaded in a fresh context window. The separation is not organizational ritual. NeurIPS 2024 (arxiv:2410.21819) measured perplexity-familiarity bias — a model reviewing its own output assigns inflated scores because the output reads as familiar rather than correct. Cross-tier verification (NYU, January 2026) breaks the shared-prior mechanism empirically. You cannot undo that bias by adjusting the reviewer prompt; you have to change the reviewer identity.',
    'The review workflow follows a fixed sequence: the implementer subagent commits to a feature branch and opens the PR; the dispatcher loads a reviewer skill, retrieves the bot PAT from Keychain at invocation time, and dispatches the reviewer in a fresh context window. The reviewer reads the diff cold — via `gh pr view` and `gh pr diff` — never inheriting the implementer\'s framing. It applies a 12-rule rubric enforcing trace-every-claim (R1), cap-findings-at-3 (R3), mandatory-find second pass (R8), prompt-injection defense (R11), and cross-tier model bias (R12). The review posts via the GitHub REST API as the machine-user identity, never via `gh pr review` which lacks inline-comment support. After the bot posts, the dispatcher applies the merge-flow decision rule autonomously.',
    'OWASP LLM Top 10 2026 (OWASP LLM01:2026) catalogs indirect prompt injection via PR body as the dominant attack class on AI reviewers — responsible for more than 80 percent of enterprise incidents. R11 addresses this directly: PR title, body, and commit messages are treated as untrusted input. Text that resembles reviewer instructions is flagged as a BLOCKER, not followed. The identity separation that makes the pattern distinctive also provides the attack surface isolation: the bot identity can be revoked and re-minted without affecting the implementer identity, and its Keychain credential is never exported to disk.',
  ],
  mermaidSource: `graph LR
  A[Implementer subagent] --> B[Commit + open PR]
  B --> C[Dispatcher loads reviewer skill]
  C --> D[Retrieve bot PAT from Keychain]
  D --> E[Reviewer: fresh context, cross-tier model]
  E --> F[Read diff cold via gh pr view / gh pr diff]
  F --> G[Apply 12-rule rubric]
  G --> H[Post review via REST API as machine-user identity]
  H --> I{Verdict}
  I -->|APPROVE + polish SUGGESTION| J[Dispatcher merges via Mergify queue]
  I -->|REQUEST_CHANGES| K[Loop: fix + re-review]`,
  mermaidAlt: 'Structural identity separation: implementer commits and opens the PR; a separate machine-user identity — different credential, fresh context, cross-tier model — reads the diff cold, applies the rubric, and posts; APPROVE queues a merge, REQUEST_CHANGES loops.',
  whenToUse: [
    'Apply when the implementer and reviewer share a model family — same-model self-verification is measurably worse than cross-tier verification, and the bias cannot be corrected by rubric adjustments alone.',
    'Use where PR review is a gate before merge and the consequences of a missed defect (broken public contract, security issue, silent regression) justify the cost of a separate reviewing identity.',
    'Reach for it when prompt-injection attacks via PR body are a real risk — separate identity means the bot credential can be revoked without touching the implementer credential, and injection attempts are sandboxed to a single subprocess.',
    'Prefer it on agentic pipelines where the implementer is an autonomous subagent: autonomous implementer plus same-identity reviewer is equivalent to no review at all once the implementer has a successful track record.',
  ],
  whenNotToUse: [
    'When the PR author is human and the reviewer is a human-in-the-loop, the identity-separation layer adds overhead without addressing the bias problem it was designed for — same-family-model bias is a model property, not a human one.',
    'When the review rubric cannot be written down — if the quality criteria are tacit and judgment-dependent, a structured 12-rule rubric will miss what matters most; invest in rubric clarity before adding identity separation.',
    'Without a functional Mergify or equivalent merge-queue gate, the dispatcher\'s autonomous merge decision loses its safety check; the pattern depends on the CI gate being the final lock, not the human.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic shipped multi-agent code review as a managed feature in April 2026: a separate critic agent in fresh context, cross-provider model selection, and sycophancy-bias mitigation as an explicit design goal — structurally identical mechanics to what this pattern describes (InfoQ, The New Stack).',
      sourceUrl: 'https://www.infoq.com/news/2026/04/claude-code-review/',
    },
    {
      text: 'PR-Agent (Codium) encodes the same operational lesson independently: a default of num_max_findings = 3 and a "no filler praise" style rule to combat the 9:1 false-positive ratio of undisciplined AI reviewers — the same invariants encoded in R3 and R4 of a disciplined review rubric.',
      sourceUrl: 'https://github.com/Codium-ai/pr-agent',
    },
    {
      text: 'The HalluJudge paper (arxiv:2601.19072, 2025) defines a hallucinated review claim as one that cannot be traced to a specific file:line in the diff — R1 of the rubric encodes this operationally: no finding without a quotable anchor, no traceability means the comment is dropped.',
      sourceUrl: 'https://arxiv.org/abs/2601.19072',
    },
  ],
  implementationSketch: `// Pseudocode — the actual implementation uses a reviewer SKILL.md
// and macOS Keychain credential scoping.

// 1. Dispatcher retrieves bot PAT (never exported, scoped to one subprocess)
// const token = execSync('security find-generic-password -s reviewer-bot@github.com -a token -w').toString().trim()

// 2. Reviewer reads diff cold (never trusts dispatcher's narrative)
// const diff = execSync(\`GH_TOKEN=\${token} gh pr diff \${prNumber}\`).toString()
// const body = execSync(\`GH_TOKEN=\${token} gh pr view \${prNumber}\`).toString()

// 3. Apply rubric (12 rules: R1 trace, R3 cap-3, R8 second-pass, R11 injection-defense, R12 cross-tier)
const rubricFindings: Array<{ severity: 'BLOCKER' | 'IMPORTANT' | 'SUGGESTION'; body: string; path: string; line: number }> = []
// ... R8 mandatory-find second pass: before drafting verdict, run
// second pass with prior "this diff contains at least one improvement" ...

// 4. Post review via REST API (NEVER via \`gh pr review\` — no inline-comment support)
const reviewPayload = {
  body: verdictMarkdown,
  event: findings.some(f => f.severity === 'BLOCKER' || f.severity === 'IMPORTANT') ? 'REQUEST_CHANGES' : 'APPROVE',
  comments: rubricFindings.map(f => ({ path: f.path, line: f.line, body: f.body })),
}
// execSync(\`GH_TOKEN=\${token} gh api repos/owner/repo/pulls/\${prNumber}/reviews -X POST --input -\`, { input: JSON.stringify(reviewPayload) })

export {}
`,
  sdkAvailability: 'no-sdk',
  readerGotcha: {
    text: 'The `gh pr review` command does not support inline comments. Use the GitHub REST API directly (`gh api repos/owner/repo/pulls/N/reviews -X POST`) — any bot-review script that wraps `gh pr review` silently drops all file:line annotations, making the rubric\'s R1 (trace-every-claim) unenforceable.',
    sourceUrl: 'https://cli.github.com/manual/gh_pr_review',
  },
  relatedSlugs: ['evaluation-llm-as-judge', 'guardrails', 'human-in-the-loop'],
  frameworks: [],
  references: [
    {
      title: 'Self-Preference Bias in LLM-as-a-Judge',
      url: 'https://arxiv.org/abs/2410.21819',
      authors: 'Wataoka et al.',
      year: 2024,
      venue: 'NeurIPS 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2410.21819',
      note: 'foundational measurement of perplexity-familiarity self-review bias; motivates cross-tier reviewer identity',
    },
    {
      title: 'HalluJudge: A Reference-Free Hallucination Detection for Context Misalignment in Code Review Automation',
      url: 'https://arxiv.org/abs/2601.19072',
      authors: 'Tantithamthavorn et al.',
      year: 2026,
      type: 'paper',
      doi: '10.48550/arXiv.2601.19072',
      note: 'defines a hallucinated review claim as one lacking file:line traceability; grounds R1 of the rubric',
    },
    {
      title: 'OWASP LLM Top 10 — LLM01:2025/2026 Prompt Injection',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      authors: 'OWASP Foundation',
      year: 2026,
      type: 'docs',
      accessedAt: '2026-05-05',
      note: 'indirect prompt injection via PR body ranked #1 enterprise attack on AI reviewers; grounds R11',
    },
    {
      title: 'From Industry Claims to Empirical Reality: An Empirical Study of Code Review Agents in Pull Requests',
      url: 'https://arxiv.org/abs/2604.03196',
      authors: 'Chowdhury et al.',
      year: 2026,
      venue: 'arXiv preprint',
      type: 'paper',
      doi: '10.48550/arXiv.2604.03196',
      note: 'empirical study of code review agents benchmarking disciplined-rubric reviewers',
    },
    {
      title: 'Anthropic launches multi-agent code review for Claude Code (InfoQ, April 2026)',
      url: 'https://www.infoq.com/news/2026/04/claude-code-review/',
      authors: 'InfoQ editorial',
      year: 2026,
      type: 'essay',
      accessedAt: '2026-05-05',
      note: 'convergent managed-feature announcement; separate critic agent, fresh context, cross-tier selection',
    },
    {
      title: 'Anthropic launches a multi-agent code review tool for Claude Code (The New Stack, April 2026)',
      url: 'https://thenewstack.io/anthropic-launches-a-multi-agent-code-review-tool-for-claude-code/',
      authors: 'The New Stack editorial',
      year: 2026,
      type: 'essay',
      accessedAt: '2026-05-05',
      note: 'second trade-press source confirming April 2026 managed-feature release',
    },
    {
      title: 'Agentic Design Patterns, Chapter 21: Developer Workflows and Code Review',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [318, 334],
    },
  ],
  addedAt: '2026-05-05',
  dateModified: '2026-05-05',
  lastChangeNote: 'W3.0 — Generalize machine-user and reviewer-skill framing; remove internal implementation identifiers.',

  realizingInClaudeCode: {
    keyMoves: [
      'Dispatch the reviewer as a separate [subagent](https://docs.claude.com/en/docs/claude-code/sub-agents) in a fresh context window so it reads the diff cold, without the implementer\'s framing.',
      'Load a [SKILL.md](https://docs.claude.com/en/docs/claude-code/skills) rubric into the reviewer subagent at invocation — cap findings, require a second pass, treat PR body as untrusted input.',
      'Use a stronger model tier for the reviewer than the implementer; cross-tier review breaks the shared-prior bias documented in NeurIPS 2024.',
      'Gate the merge queue on the reviewer\'s structured verdict via branch protection; a CI-enforced gate means the review cannot be bypassed.',
    ],
    ccPrimitives: [
      'Task tool (reviewer subagent)',
      'SKILL.md rubric (versioned criteria)',
      'Branch protection (merge gate)',
    ],
    seeAlso: {
      siblingPatternSlugs: ['evaluation-llm-as-judge', 'guardrails', 'human-in-the-loop'],
    },
  },
  realizingInCursor: {
    keyMoves: [
      'Open a second Agent chat for the reviewer role — pass the diff via `@file` so the reviewer starts cold without the implementer session\'s context.',
      'Write the review rubric in a `.cursor/rules/*.mdc` file; load it by name in the reviewer chat before reading the diff.',
      'Select a different model in the reviewer chat than in the implementer chat using Cursor\'s model picker — reduces same-model self-preference.',
      'Commit review findings to a verdict file and reference it via `@file` in the implementer chat to close the feedback loop.',
    ],
    ccPrimitives: [
      'Multiple Agent chats (implementer + reviewer)',
      '.cursor/rules/*.mdc (rubric file)',
      '@file (diff and verdict sharing)',
      'Model picker (cross-tier selection)',
    ],
    seeAlso: {
      siblingPatternSlugs: ['evaluation-llm-as-judge', 'guardrails', 'human-in-the-loop'],
    },
  },
}
