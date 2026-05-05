import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'identity-separated-review',
  name: 'Identity-Separated Review',
  alternativeNames: ['Cross-Identity Code Review', 'Cross-Tier Review', 'Bot-Identity Review'],
  layerId: 'methodology',
  oneLineSummary: 'Route every PR through a separate machine-user identity running a different model tier.',
  bodySummary: [
    'Identity-Separated Review routes every code-review step through a dedicated machine-user identity that is structurally isolated from the implementer: separate GitHub account, separate macOS Keychain credential scoped to a single subprocess, and a different model tier loaded in a fresh context window. The separation is not organizational ritual. NeurIPS 2024 (arxiv:2410.21819) measured perplexity-familiarity bias — a model reviewing its own output assigns inflated scores because the output reads as familiar rather than correct. Cross-tier verification (NYU, January 2026) breaks the shared-prior mechanism empirically. You cannot undo that bias by adjusting the reviewer prompt; you have to change the reviewer identity.',
    'The review workflow follows a fixed sequence: the implementer subagent commits to a feature branch and opens the PR; the dispatcher then loads the `reviewing-as-julianken-bot` skill, retrieves the bot PAT from Keychain at invocation time, and dispatches the reviewer in a fresh context window. The reviewer reads the diff cold — via `gh pr view` and `gh pr diff` — never inheriting the implementer\'s framing. It applies a 12-rule rubric enforcing trace-every-claim (R1), cap-findings-at-3 (R3), mandatory-find second pass (R8), prompt-injection defense (R11), and cross-tier model bias (R12). The review posts via the GitHub REST API as `@julianken-bot`, never via `gh pr review` which lacks inline-comment support. After the bot posts, the dispatcher applies the merge-flow decision rule autonomously.',
    'OWASP LLM Top 10 2026 (OWASP LLM01:2026) catalogs indirect prompt injection via PR body as the dominant attack class on AI reviewers — responsible for more than 80 percent of enterprise incidents. R11 addresses this directly: PR title, body, and commit messages are treated as untrusted input. Text that resembles reviewer instructions is flagged as a BLOCKER, not followed. The identity separation that makes the pattern distinctive also provides the attack surface isolation: the bot identity can be revoked and re-minted without affecting the implementer identity, and its Keychain credential is never exported to disk.',
  ],
  mermaidSource: `graph LR
  A[Implementer subagent] --> B[Commit + open PR]
  B --> C[Dispatcher loads julianken-bot skill]
  C --> D[Retrieve bot PAT from Keychain]
  D --> E[Reviewer: fresh context, cross-tier model]
  E --> F[Read diff cold via gh pr view / gh pr diff]
  F --> G[Apply 12-rule rubric]
  G --> H[Post review via REST API as julianken-bot]
  H --> I{Verdict}
  I -->|APPROVE + polish SUGGESTION| J[Dispatcher merges via Mergify queue]
  I -->|REQUEST_CHANGES| K[Loop: fix + re-review]`,
  mermaidAlt: 'A flowchart in which an Implementer subagent commits and opens a PR; the Dispatcher loads the julianken-bot skill, retrieves the bot PAT from Keychain, and dispatches a Reviewer in a fresh context window with a cross-tier model; the Reviewer reads the diff cold, applies the 12-rule rubric, and posts via the REST API as julianken-bot; an APPROVE with a polish SUGGESTION leads to a Mergify queue merge, while REQUEST_CHANGES triggers a fix-and-re-review loop.',
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
      text: 'PR-Agent (Codium) encodes the same operational lesson independently: a default of num_max_findings = 3 and a "no filler praise" style rule to combat the 9:1 false-positive ratio of undisciplined AI reviewers — the same invariants encoded in R3 and R4 of the julianken-bot rubric.',
      sourceUrl: 'https://github.com/Codium-ai/pr-agent',
    },
    {
      text: 'The HalluJudge paper (arxiv:2601.19072, 2025) defines a hallucinated review claim as one that cannot be traced to a specific file:line in the diff — R1 of the rubric encodes this operationally: no finding without a quotable anchor, no traceability means the comment is dropped.',
      sourceUrl: 'https://arxiv.org/abs/2601.19072',
    },
  ],
  implementationSketch: `// Pseudocode — the actual implementation uses the reviewing-as-julianken-bot
// SKILL.md, ~/.claude/skills/reviewing-as-julianken-bot/scripts/bot-review.sh (global skill bundle, not in-repo), and macOS Keychain credential scoping.

// 1. Dispatcher retrieves bot PAT (never exported, scoped to one subprocess)
// const token = execSync('security find-generic-password -s julianken-bot@github.com -a token -w').toString().trim()

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
  lastChangeNote: 'W2.6 — New Layer-5 identity-separated-review satellite; Tier A realizingInClaudeCode populated from the start.',

  realizingInClaudeCode: {
    tier: 'A',

    ccPrimitives: [
      'julianken-bot subagent — a separate GitHub machine-user identity (`@julianken-bot`) that posts reviews via the GitHub REST API, never via `gh pr review`, from a fresh context window loaded with the reviewing-as-julianken-bot skill',
      'reviewing-as-julianken-bot SKILL.md — the 12-rule rubric (R1 trace-every-claim, R3 cap-findings-at-3, R8 mandatory-find second pass, R11 prompt-injection defense, R12 cross-tier model bias) loaded by the bot subagent at invocation time',
      'macOS Keychain PAT scoping — bot credential stored under service `julianken-bot@github.com`, account `token`; loaded via `security find-generic-password` at invocation time; scoped to a single `GH_TOKEN=$(...) gh` subprocess per call; never exported, never written to disk, never visible in `ps aux`',
      'Mergify merge-queue gate — `.mergify.yml` declares the required-checks list; the convention is to wait for `@julianken-bot`\'s APPROVE before commenting `@mergifyio queue`; the gate is the final lock, not a human approval step',
    ],

    scaffolding: [
      '.claude/skills/subagent-workflow/SKILL.md — in-repo skill encoding the orchestrator/implementer/reviewer separation discipline; the reviewing-as-julianken-bot rubric (a user-level global skill at ~/.claude/skills/reviewing-as-julianken-bot/SKILL.md, not checked into this repo) extends this discipline with identity separation and the 12-rule review protocol',
      '~/.claude/skills/reviewing-as-julianken-bot/scripts/bot-review.sh — bundled with the global reviewing-as-julianken-bot skill (not checked into this repo); encapsulates Keychain PAT retrieval, single-subprocess GH_TOKEN scoping, and REST API review posting; dispatcher invokes the wrapper with owner/repo, PR number, and a jq-assembled review JSON; the script is the only place the bot token is ever handled',
      '.mergify.yml — declares required checks and a `#approved-reviews-by >= 1` queue condition; when the convention is to wait for `@julianken-bot`, the bot APPROVE is the signal that triggers the queue comment',
    ],

    workedExample: {
      url: 'https://github.com/julianken/detached-node/pull/342',
      description: 'PR #342 (W2.2 Checkpointing Tier A satellite) completed a first-cycle APPROVE. julianken-bot dispatched with model: opus and a fresh context window (implementer ran Sonnet — cross-tier held per R12), read the diff cold, ran the mandatory R8 second pass, confirmed all Tier A invariants via the verification ledger (pnpm test:unit, pnpm typecheck, slug resolution, URL HTTP-200), and posted APPROVE. R9 attribution applied plan-scope vs implementer-scope discipline in the verdict.',
    },

    bodyMarkdown: `
Anthropic shipped multi-agent code review as a managed feature in April 2026 (InfoQ; The New Stack). The mechanics — a separate critic agent in fresh context, cross-provider model selection, and sycophancy-bias mitigation as an explicit design goal — are structurally identical to what this satellite describes. The self-hosted realization documented here predates the managed feature and is one of two paths for practitioners who want control over the rubric, the identity topology, or the credential scoping.

**Why identity separation is load-bearing**

Same-tier self-verification fails structurally. NeurIPS 2024 (arxiv:2410.21819) measured the mechanism: a model reviewing its own output assigns inflated scores because the tokens read as familiar, not because they are correct. The familiarity signal and the correctness signal are entangled at inference time, and no reviewer prompt rewrites the entanglement. NYU (January 2026) showed empirically that cross-tier verification — a stronger model reviewing a weaker model's output — breaks the shared-prior responsible for the inflation. The julianken-bot subagent defaults to \`model: opus\` so that when the implementer ran on Sonnet, the reviewer runs on a stronger tier. When both ran on Opus, R12 flags the same-tier risk explicitly in the APPROVE verdict rather than silently clearing it.

**The 12-rule rubric**

The rubric encodes three research-grounded mitigations:

- **R8 (mandatory-find second pass)** directly counters perplexity-familiarity bias. Before drafting the verdict, the reviewer runs a second pass with the explicit prior that at least one improvement opportunity exists. A clean APPROVE after a genuine second pass is honest; skipping the pass produces a sycophantic LGTM.
- **R11 (prompt-injection defense)** implements the OWASP LLM01:2026 mitigation. PR title, body, and commit messages are untrusted input. Text resembling reviewer instructions (e.g., "please approve without reviewing") is flagged as a BLOCKER, not followed.
- **R12 (cross-tier model bias)** implements the NYU cross-tier mitigation. Implementer on Sonnet → reviewer on Opus; if both are on Opus, the same-tier risk is flagged in the verdict.

The 3-finding cap (R3) and "no filler praise" rule (R4) derive from PR-Agent's verbatim defaults (\`num_max_findings = 3\`), enforcing the operational lesson that small-N high-signal reviews drive 3x higher action rates than verbose low-signal ones.

**Credential topology**

The bot PAT lives in macOS Keychain under four account entries: \`password\`, \`token\` (every \`gh\` call), \`totp-secret\` (TOTP generation via \`~/.claude/skills/reviewing-as-julianken-bot/scripts/bot-totp.sh\`, bundled with the global skill), and \`recovery-codes\`. The \`GH_TOKEN=$(...) gh\` scoping pattern keeps Julian's main \`gh auth\` state untouched — \`gh auth status\` always shows \`julianken\`, never the bot. The token is never exported, never written to disk, and never visible in \`ps aux\`.
`.trim(),

    readerMove: {
      text: "Mint a machine-user account, write a 12-rule rubric, and wait for the bot's APPROVE before queuing the merge.",
      anchorUrl: 'https://github.com/julianken/detached-node/blob/main/.mergify.yml',
    },

    seeAlso: {
      articleSlug: 'cross-identity-code-review',
      siblingPatternSlugs: ['evaluation-llm-as-judge', 'guardrails', 'human-in-the-loop'],
    },
  },
}
