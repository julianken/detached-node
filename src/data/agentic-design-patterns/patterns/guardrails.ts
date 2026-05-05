import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'guardrails',
  name: 'Guardrails',
  alternativeNames: ['Safety Patterns', 'Programmable Rails', 'Input/Output Filters'],
  layerId: 'quality',
  oneLineSummary: 'Layered checks around the model that block unsafe input and output before either ships.',
  bodySummary: [
    'Guardrails wrap a language model with checks that fire before it sees an input and after it produces an output. The input rail inspects the user message, retrieved context, or tool result for prompt injection, disallowed topics, PII, and policy violations; if anything trips, the request never reaches the primary model and a refusal returns instead. The output rail inspects the response for the same hazards plus hallucinated citations, jailbroken text, and shape errors, then rewrites, redacts, or replaces it before the caller sees it. The rails are separable: a system can run input checks only, output checks only, or both.',
    'The pattern is canonically a layered defence rather than one model judging another. NeMo Guardrails composes programmable rails as a flow language so authors declare which checks fire in what order; Llama Guard ships a fine-tuned classifier scoring a conversation against a published taxonomy; constitutional training bakes one behaviour layer into the primary model. Each layer trades differently: an external classifier is auditable and swappable but adds a network hop; a self-check inside the primary call is cheap but inherits the failure modes of the model judging itself; regex and allow-lists are fastest and most brittle. Production stacks two or three because each catches what the others miss.',
    'Guardrails sit next to but distinct from prompt engineering, alignment fine-tuning, and human-in-the-loop review. Prompt engineering nudges the model toward safe outputs without blocking unsafe ones; alignment changes the model itself on a quarterly cadence; HITL inserts a person on the critical path. The guardrail layer is the run-time enforcement gap between them — the place where a refusal can be audited, a category can be added without retraining, and a bypass attempt is logged. The cost is operational, not algorithmic: someone has to author the policy, label a calibration set, watch the false-positive rate, and decide which classifier the rail itself runs.',
  ],
  mermaidSource: `graph LR
  A[User input] --> B{Input rail}
  B -->|block| C[Refusal]
  B -->|allow| D[Primary LLM]
  D --> E{Output rail}
  E -->|block or rewrite| F[Sanitized response]
  E -->|allow| G[Response]
  F --> H[Logged decision]
  G --> H`,
  mermaidAlt: 'A left-to-right flowchart in which a user input first hits an input rail that either blocks the request with a refusal or forwards it to the primary LLM, whose response then hits an output rail that either blocks and sanitizes the response or passes it through, with both terminal paths converging on a logged decision.',
  whenToUse: [
    'Apply when the agent is exposed to untrusted input — public users, third-party documents, retrieved web content — and a malicious prompt could redirect the model into hazardous tool use or content generation.',
    'Use where the response is consumed by a non-engineer audience and a single jailbroken output, leaked secret, or hallucinated citation is the kind of incident the team is paged on.',
    'Reach for it when policy must change faster than the model can be retrained: new disallowed topics, new regulated jurisdictions, new categories of brand safety the alignment layer never saw.',
    'Prefer it when the same primary model serves multiple products with different risk envelopes — finance and gaming run different rails over the same backbone rather than fine-tuning two separate models.',
  ],
  whenNotToUse: [
    'When the agent runs entirely on trusted input from a logged-in operator and the output is reviewed downstream, the rails add latency and false-positive volume without catching a real incident.',
    'Without a labelled evaluation set or production telemetry on rail decisions, the false-positive and false-negative rates are invisible and the rail tunes itself toward whatever the author last got annoyed about.',
    'When the rail itself is a same-prompt self-check on the primary model, it tends to approve its own outputs and the layer becomes theatre — substitute a different model, a fine-tuned classifier, or a deterministic check.',
  ],
  realWorldExamples: [
    {
      text: 'OpenAI\'s Agents SDK ships first-class input and output guardrails as a runtime concept: each agent declares classifier-style checks that run in parallel with the main turn and trip a tripwire which halts execution before the unsafe call returns.',
      sourceUrl: 'https://openai.github.io/openai-agents-python/guardrails/',
    },
    {
      text: 'NVIDIA\'s NeMo Guardrails open-source toolkit composes programmable rails — input, dialog, retrieval, execution, and output — as a flow language an application author edits without touching the underlying model, with a runnable Python server documented end-to-end.',
      sourceUrl: 'https://github.com/NVIDIA/NeMo-Guardrails',
    },
    {
      text: 'Meta publishes Llama Guard 3 as a downloadable safeguard classifier trained against a documented taxonomy of unsafe content categories, intended to be deployed in front of or behind a primary model as an auditable filter.',
      sourceUrl: 'https://huggingface.co/meta-llama/Llama-Guard-3-8B',
    },
  ],
  implementationSketch: `import { generateObject, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const Verdict = z.object({ allow: z.boolean(), category: z.string(), reason: z.string() })
const judge = openai('gpt-4o-mini')
const primary = openai('gpt-4o')

async function rail(text: string, role: 'input' | 'output'): Promise<z.infer<typeof Verdict>> {
  const { object } = await generateObject({
    model: judge,
    schema: Verdict,
    prompt: \`Classify this \${role} against the policy. Block jailbreaks, PII, hate, illegal content. Text: \${text}\`,
  })
  return object
}

async function answer(userInput: string): Promise<string> {
  const inputCheck = await rail(userInput, 'input')
  if (!inputCheck.allow) return \`Refused: \${inputCheck.category}\`
  const { text } = await generateText({ model: primary, prompt: userInput })
  const outputCheck = await rail(text, 'output')
  return outputCheck.allow ? text : \`Refused: \${outputCheck.category}\`
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Greshake et al. document indirect prompt injection: an attacker hides instructions in a webpage, email, or PDF the agent later retrieves, and the rail that only inspected the user message lets the payload through because the hostile text arrived as context, not as input. A guardrail that does not classify retrieved content with the same suspicion as user content is a guardrail that has not read the threat model.',
    sourceUrl: 'https://arxiv.org/abs/2302.12173',
  },
  relatedSlugs: [],
  frameworks: ['langchain', 'langgraph', 'crew-ai', 'openai-agents', 'vercel-ai-sdk'],
  references: [
    {
      title: 'NeMo Guardrails: A Toolkit for Controllable and Safe LLM Applications with Programmable Rails',
      url: 'https://arxiv.org/abs/2310.10501',
      authors: 'Rebedea et al.',
      year: 2023,
      venue: 'EMNLP 2023 (System Demonstrations)',
      type: 'paper',
      doi: '10.48550/arXiv.2310.10501',
      note: 'programmable-rails toolkit; canonical reference for the layered-defense framing',
    },
    {
      title: 'Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations',
      url: 'https://arxiv.org/abs/2312.06674',
      authors: 'Inan et al.',
      year: 2023,
      type: 'paper',
      doi: '10.48550/arXiv.2312.06674',
      note: 'fine-tuned classifier with a published unsafe-content taxonomy',
    },
    {
      title: 'Not what you\'ve signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection',
      url: 'https://arxiv.org/abs/2302.12173',
      authors: 'Greshake et al.',
      year: 2023,
      venue: 'AISec 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2302.12173',
      note: 'threat-model paper that motivates the gotcha — payloads arrive as retrieved context, not user input',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'frames safety as an orthogonal layer to the agent topology',
    },
    {
      title: 'OpenAI Agents SDK — Guardrails',
      url: 'https://openai.github.io/openai-agents-python/guardrails/',
      authors: 'OpenAI',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
    {
      title: 'NVIDIA NeMo Guardrails — repository and documentation',
      url: 'https://github.com/NVIDIA/NeMo-Guardrails',
      authors: 'NVIDIA',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
    {
      title: 'Agentic Design Patterns, Chapter 18: Guardrails/Safety Patterns',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [286, 305],
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-05',
  lastChangeNote: 'W2.4 — Populate realizingInClaudeCode Tier A: three-layer realization (hooks + skill-tables + branch-protection), PR #335 worked example.',
  realizingInClaudeCode: {
    tier: 'A',
    ccPrimitives: [
      'PreToolUse hooks (Layer 1) — shell scripts wired into Claude Code\'s settings.json that intercept Bash tool calls before they execute; .claude/hooks/block-debug-artifacts.sh and .claude/hooks/block-console-log.sh are the canonical Layer-1 instances in this repo: they fire on every git commit attempt and exit non-zero to abort the commit if a disallowed artifact or console.log is staged',
      'settings.json hook schema — the JSON object under "PreToolUse" that declares the matcher ("Bash") and the hook command array; this is the CC-native wiring point that connects a shell script to a tool event; the hook fires inside the Claude Code process, not as a git pre-commit hook, so it intercepts the model\'s own commit attempts rather than a human\'s',
      'CLAUDE.md / SKILL.md skill-table rules (Layer 2) — structured constraints the model reads as policy before it acts; the "Skill Ownership" section in CLAUDE.md and the frontmatter tables in .claude/skills/*.md are the convention layer: they tell the model what patterns to follow and what scaffolding to reach for, but they do not block any tool call at the process level',
    ],
    scaffolding: [
      '.claude/hooks/block-debug-artifacts.sh — PreToolUse script that exits 2 when git commit would stage debug-*.spec.ts or *.bak files; tracked in git so it exists on every fresh clone',
      '.claude/hooks/block-console-log.sh — PreToolUse script that exits 2 when a staged file outside the allowlist (tests/, e2e/, scripts/, *.test.*, *.spec.*) contains console.log; tracked in git, executable bit set',
      '.mergify.yml required-checks list (Layer 3) — the queue_conditions block gates the merge queue on ESLint, TypeScript, Vitest, Next.js Build, Analyze Bundle, CodeQL Analysis, and four E2E shards; a PR cannot merge until all checks pass regardless of approvals; this is the infrastructure enforcement layer that the model cannot bypass',
      'CLAUDE.md Skill Ownership section — documents which skills are global-canonical vs. repo-canonical and constrains how the model reasons about drift; a convention-layer guardrail that shapes model behavior without blocking tool calls',
      '.claude/skills/*/SKILL.md frontmatter — skill tables that name permitted tools, phase cardinalities, and dispatch constraints; loaded into the orchestrator context before Task() dispatch and act as the read-time policy layer between the model and the hook layer',
    ],
    workedExample: {
      url: 'https://github.com/julianken/detached-node/pull/335',
      description: `PR #335 — "infra(hooks): restore PreToolUse enforcement + remove worktree-agent dead code" — is the canonical Layer-1 realization of the Guardrails pattern in this repository. Before the PR, .claude/hooks/ was listed in .gitignore (line 62), so the two enforcement scripts never existed on any fresh clone; the three hooks referenced in settings.json were fail-open by construction — they were declared but unreachable. The PR tracked both scripts in git, set the executable bit, removed the dead block-worktree-push.sh reference, and removed dead CLAUDE.md documentation that referenced a non-existent clean-worktree-branches.sh script.

The structural mechanics visible in PR #335 map directly to the three-layer framing this satellite describes. Layer 1 became operational the moment .claude/hooks/ was removed from .gitignore: the two scripts now exist on every clone, both hooks fire on every git commit attempt the model makes, and a non-zero exit aborts the commit before the staged artifact ships. Layer 2 was adjusted simultaneously — the dead CLAUDE.md section was removed so the model's read-time policy matched the actual tool surface. Layer 3 (the .mergify.yml required-checks queue) was already in place and remained unchanged; the PR had to pass all CI gates before Mergify advanced it.

The test plan in PR #335 includes smoke tests that confirm the hooks fire as specified: staging debug-foo.spec.ts exits 2; staging a clean src/foo.ts exits 0; staging an allowlisted tests/_smoketest.ts with console.log exits 0. These are the observable signals that distinguish an operational guardrail from a declared-but-unreachable one. The PR is evidence for the Layer-1 guardrail pattern because it demonstrates the full lifecycle: authoring the script, tracking it in git, confirming it fires, and gating the merge on CI. All three layers are in view in a single PR — the hooks became operational (Layer 1), the CLAUDE.md policy section was updated to reflect the actual tool surface (Layer 2), and the merge queue required all CI gates to pass before Mergify advanced the PR (Layer 3).`,
    },
    readerMove: {
      text: 'Write your .claude/hooks/ scripts; track them in git; gate the merge queue on the lint check.',
      anchorUrl: 'https://github.com/julianken/detached-node/blob/main/.claude/hooks/block-debug-artifacts.sh',
    },
    seeAlso: {
      siblingPatternSlugs: ['evaluation-llm-as-judge', 'human-in-the-loop'],
    },
    bodyMarkdown: `Guardrails in Claude Code realize as three distinct layers that complement each other without overlapping. Understanding which layer catches which failure class is the practitioner's job; deploying one layer and assuming the others are covered is the failure mode PR #335 was built to prevent.

### Layer 1: PreToolUse hooks

PreToolUse hooks are shell scripts declared in .claude/settings.json under the "PreToolUse" key with a tool matcher. When the matcher fires — "Bash" matches any Bash tool call — Claude Code runs the hook command before the tool executes. A non-zero exit aborts the tool call. The hook fires inside the Claude Code process, not as a git pre-commit hook, which means it intercepts the model's own commit attempts before they reach git.

This repo's two hook scripts enforce artifact hygiene at the commit boundary. .claude/hooks/block-debug-artifacts.sh exits 2 when git commit would stage debug-*.spec.ts or *.bak files. .claude/hooks/block-console-log.sh exits 2 when a staged file outside the allowlist (tests/, e2e/, scripts/, *.test.*, *.spec.*) contains console.log. Both scripts must be tracked in git and carry the executable bit — an untracked or non-executable hook is fail-open. PR #335 corrected exactly this failure: both scripts existed conceptually but were gitignored, so no enforcement ran on any fresh clone.

The Layer-1 guarantee is process-level: the hook runs in the Claude Code process and the model cannot skip it by rephrasing the Bash command. It is also scope-limited: hooks fire only on the tool events their matcher matches. A PreToolUse hook on Bash does not intercept Write tool calls, Edit tool calls, or actions outside Claude Code. Layer 1 guards the model's own actions within the session; it does not govern what ships through the merge queue.

### Layer 2: skill-table rules

Skill-table rules are structured constraints the model reads as policy before it acts. The "Skill Ownership" section in this repo's CLAUDE.md declares which skills are global-canonical versus repo-canonical and constrains how the model reasons about drift. The SKILL.md files in .claude/skills/ carry phase cardinalities, dispatch constraints, and tool surface declarations that shape model behavior at read time.

Layer 2 is the convention layer. It operates by telling the model what to do, not by blocking it from doing otherwise. A well-authored CLAUDE.md constraint is fast (no process overhead), broad (applies to any tool call the model reads about), and brittle (the model can reason past it under pressure or when the context window is full). Layer 2 is not a substitute for Layer 1; it is the layer that shapes model behavior on the large class of actions that do not touch a hook-matched tool event.

The Layer-2 guarantee is probabilistic: the model is more likely to follow a clearly stated rule than to violate it, and the rule is auditable as plaintext. It is not a hard stop.

### Layer 3: branch-protection infrastructure

The .mergify.yml queue_conditions block is the infrastructure enforcement layer. It gates the merge queue on ESLint, TypeScript, Vitest, Next.js Build, Analyze Bundle, CodeQL Analysis, and four E2E shards. A PR cannot advance in the queue until all checks pass and at least one approval is recorded. This runs in GitHub's infrastructure, not in Claude Code, and the model cannot bypass it by any in-session action.

Layer 3 is the highest-trust layer because it is fully outside the model's control surface. Its scope is also the narrowest: it governs what merges into main, not what the model does within a session. A session that produces malformed output, leaks secrets into a file that is never committed, or calls a disallowed tool does not touch Layer 3 at all. Layer 3 is the last line of defense, not the only one.

### The three layers as a system

The layers are complementary because their failure modes are orthogonal. A PreToolUse hook that is never tracked in git is fail-open (Layer 1 gap — exactly the PR #335 scenario). A CLAUDE.md rule that is never read because the context window is full is silently bypassed (Layer 2 gap). A merge queue that passes because a check was never added to the conditions list merges what it should block (Layer 3 gap). Running all three layers means each one catches what the others miss. Instrumenting each layer — confirming hooks fire on smoke tests, auditing CLAUDE.md for drift, reviewing .mergify.yml conditions on each major scope addition — is what keeps the system operational rather than merely declared.`,
  },
}
