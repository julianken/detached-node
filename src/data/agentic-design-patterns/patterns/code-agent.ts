import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'code-agent',
  name: 'Code Agent',
  alternativeNames: ['Software Engineering Agent', 'SWE Agent', 'Coding Agent'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  parentPatternSlug: 'tool-use-react',
  oneLineSummary: 'Tool-using agent whose primary toolkit is a codebase, an editor, and a test runner.',
  bodySummary: [
    'Code Agent is the Tool Use / ReAct loop wired to a software-engineering toolkit. The agent is given a goal stated against a working tree — fix this failing test, implement this ticket, refactor this module — and a small load-bearing set of actions: list files, open and search a file, edit a file by patch, run a shell command, read the result. Each turn is a thought, one of those actions, and the observation produced by running it against a real or sandboxed checkout. The loop terminates when the agent emits a final answer or, more commonly, when the test suite the user pinned as the success criterion comes back green.',
    'What separates the pattern from generic Tool Use is that the toolkit is designed for the agent, not borrowed from a human. SWE-agent calls this layer the Agent-Computer Interface and reports that swapping the bare Linux shell for a line-numbered file viewer, structured edit verbs, and a syntax-checked patch tool roughly doubles SWE-bench Verified scores at the same model. OpenHands generalises the move into a sandboxed runtime with an editor, a Jupyter kernel, and a browser hung off the same loop. Aider sits at the opposite end — a thin terminal that pairs a repository map with two narrow edit formats and forces the model to commit through git on every turn.',
    'The pattern earns its keep when the success criterion is executable: the patch compiles or it does not, the test passes or it does not, the refactor preserves behaviour or it does not. On those tasks the agent gets dense feedback from the runtime that no LLM-judged evaluation matches. Where it struggles is the inverse — work judged on style, intent, or downstream user impact. Production deployments add a human diff review step (Cursor, Claude Code, Devin all surface proposed changes before they land) because the test suite is necessary but rarely sufficient.',
  ],
  mermaidSource: `graph TD
  A[Goal + working tree] --> B[Read code: list, open, grep]
  B --> C[Plan an edit]
  C --> D[Apply patch to file]
  D --> E[Run tests / lint / build]
  E --> F{Green and goal met?}
  F -->|no| G[Read failure output]
  G --> B
  F -->|yes| H[Final diff for review]`,
  mermaidAlt: 'A flowchart showing a Goal plus working tree feeding a Read code step, which leads to Plan an edit, then Apply patch, then Run tests; a decision node checks whether the build is green and the goal met, looping back through Read failure output to Read code on no, or emitting a final diff for review on yes.',
  whenToUse: [
    'Apply when the success criterion is executable — a failing test that must pass, a build that must compile, a benchmark that must hit a target — so each iteration gets unambiguous feedback from the runtime.',
    'Use where the change is local enough to fit a sandboxed loop: bug fixes scoped by a stack trace, refactors with characterisation tests, ticket-shaped work with clear acceptance steps.',
    'Reach for it when the agent will run dozens of read-edit-test cycles per task and a custom Agent-Computer Interface (line-numbered viewer, structured edit verbs, syntax-checked patches) earns its keep over a raw shell.',
    'Prefer it when the diff stays reviewable by a human at the end — the loop is a faster path to a candidate change, not a substitute for the merge gate.',
  ],
  whenNotToUse: [
    'When the desired change spans many subsystems and depends on judgement no test encodes, the loop converges on patches that pass tests without solving the problem.',
    'Without a hermetic sandbox and a step budget, the agent will mutate state, exhaust an API quota, or rewrite history; the same loop running on a developer\'s laptop is a footgun.',
    'When the task is exploratory ("understand this codebase") rather than transformative, a chat-mode read-only assistant is cheaper and less destructive than booting the edit-test loop.',
  ],
  realWorldExamples: [
    {
      text: 'SWE-agent ships the Agent-Computer Interface its paper introduces — a custom file viewer, edit verb, and Python linter wrapped around a sandboxed shell — and reports the interface itself, not the model, accounts for most of the SWE-bench Verified gain.',
      sourceUrl: 'https://swe-agent.com',
    },
    {
      text: 'OpenHands runs the same read-edit-test loop inside a Docker sandbox that exposes a code editor, a bash terminal, and a Jupyter kernel; the open-source platform powers a community of coding agents that share the runtime contract.',
      sourceUrl: 'https://github.com/All-Hands-AI/OpenHands',
    },
    {
      text: 'Anthropic documents Claude Code as the loop the user holds open in a terminal: the CLI exposes file, shell, and search tools, parses the model\'s tool calls, executes them locally, and surfaces every proposed edit before it lands.',
      sourceUrl: 'https://docs.claude.com/en/docs/claude-code/overview',
    },
  ],
  implementationSketch: `import { generateText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'

const sh = promisify(exec)

const tools = {
  readFile: tool({
    description: 'Read a file from the working tree, with line numbers.',
    parameters: z.object({ path: z.string() }),
    execute: async ({ path }) => {
      const text = await readFile(path, 'utf8')
      return text.split('\\n').map((l, i) => \`\${i + 1}\\t\${l}\`).join('\\n')
    },
  }),
  applyPatch: tool({
    description: 'Overwrite a file with new contents (full-file replace).',
    parameters: z.object({ path: z.string(), contents: z.string() }),
    execute: async ({ path, contents }) => {
      await writeFile(path, contents, 'utf8')
      return \`wrote \${contents.length} bytes to \${path}\`
    },
  }),
  runTests: tool({
    description: 'Run the project test suite and return stdout/stderr.',
    parameters: z.object({}),
    execute: async () => {
      const r = await sh('pnpm test:unit', { timeout: 60_000 }).catch((e) => e)
      return { code: r.code ?? 0, stdout: r.stdout?.slice(-2000), stderr: r.stderr?.slice(-2000) }
    },
  }),
}

await generateText({
  model: openai('gpt-4o'),
  tools,
  maxSteps: 12, // bounded read-edit-test loop; runtime feeds tool results back
  prompt: 'Make tests/sum.test.ts pass without changing the test file.',
})

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'When the model emits a search-and-replace block whose context lines drift from the file by even one whitespace, the patch fails silently and the agent retries on a stale view of the code. Aider documents the failure mode — model-specific edit formats, the "diffs not applying" loop, and the fix of pinning a stricter format with a stronger model — as the most common stall in production.',
    sourceUrl: 'https://aider.chat/docs/troubleshooting/edit-errors.html',
  },
  relatedSlugs: ['tool-use-react', 'reflexion', 'planning'],
  frameworks: ['vercel-ai-sdk', 'langgraph', 'openai-agents', 'mastra'],
  references: [
    {
      title: 'SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering',
      url: 'https://arxiv.org/abs/2405.15793',
      authors: 'Yang et al.',
      year: 2024,
      venue: 'NeurIPS 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2405.15793',
      note: 'foundational paper; introduces the Agent-Computer Interface as the lever that doubles SWE-bench scores',
    },
    {
      title: 'OpenHands: An Open Platform for AI Software Developers as Generalist Agents',
      url: 'https://arxiv.org/abs/2407.16741',
      authors: 'Wang et al.',
      year: 2024,
      venue: 'ICLR 2025',
      type: 'paper',
      doi: '10.48550/arXiv.2407.16741',
      note: 'sandboxed runtime that hangs editor, shell, and browser off the same agent loop',
    },
    {
      title: 'Claude Code overview',
      url: 'https://docs.claude.com/en/docs/claude-code/overview',
      authors: 'Anthropic',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'production CLI that exposes file, shell, and search tools and surfaces every diff for review',
    },
    {
      title: 'Cursor — Agent',
      url: 'https://docs.cursor.com/agent/overview',
      authors: 'Cursor team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'IDE-embedded variant; agent edits across files and runs commands inside the editor',
    },
    {
      title: 'Aider — AI pair programming in your terminal',
      url: 'https://aider.chat',
      authors: 'Paul Gauthier',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'open-source code agent; canonical source for repository-map context-building and structured edit formats',
    },
    {
      title: 'SWE-bench technical report',
      url: 'https://www.cognition.ai/blog/swe-bench-technical-report',
      authors: 'Cognition',
      year: 2024,
      type: 'essay',
      note: 'production code agent (Devin) on the SWE-bench harness — the executable-success-criterion case study',
    },
    {
      title: 'Agentic Design Patterns, Chapter 8: Coding Agents',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [120, 134],
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author Code Agent satellite: read-edit-test loop, Agent-Computer Interface as the differentiator from generic Tool Use, edit-format gotcha.',
}
