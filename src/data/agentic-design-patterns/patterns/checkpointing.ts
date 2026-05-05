import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'checkpointing',
  name: 'Checkpointing',
  alternativeNames: ['Durable Execution', 'Checkpoint and Rollback', 'Workflow Persistence'],
  layerId: 'state',
  oneLineSummary: 'Agent persists its run state at safe boundaries so a crash mid-loop loses no work.',
  bodySummary: [
    'Checkpointing makes an agent run survive the failure of the process executing it. The orchestrator writes the run\'s state — accumulated messages, completed tool results, the next pending step, any pending writes — to durable storage at well-defined boundaries, keyed by a stable run identifier. When the worker dies mid-loop because a Kubernetes pod was evicted, a serverless function timed out, or an LLM call took fifteen minutes and the connection dropped, a fresh worker reads the last checkpoint, rehydrates the agent\'s state, and resumes from the boundary rather than from the prompt. The unit of recovery is the boundary, not the run; work already done is not redone.',
    'Two implementations dominate. Snapshot checkpointing — what LangGraph, Mastra, and the Anthropic Agent SDK ship — atomically writes the full state object after each step into a backend (in-memory for development, SQLite or Postgres for production) and resumes by loading the latest record for that thread or session. Replay-based durable execution — Temporal, Inngest, Restate — instead records a journal of completed steps and their results, then re-runs the agent code from the top on recovery, short-circuiting any step whose result is already in the journal. Both reach the same place: the LLM does not get called twice for the same prompt, and the tool whose side effect already fired does not fire again.',
    'The pattern is distinct from Memory Management, which retrieves prior context to inject into the next prompt, and from generic database transactions, which protect a single write. Checkpointing protects the unit-of-work that is the agent run itself. The cost is operational: someone owns the schema as it migrates between releases, the determinism contract if the implementation is replay-based, the retention policy for stale checkpoints, and the question of what happens when a checkpoint is loaded by a worker running a different version of the agent code than the one that wrote it.',
  ],
  mermaidSource: `graph LR
  A[Agent step] --> B[Execute LLM call or tool]
  B --> C[Atomically write checkpoint: state, next step, results]
  C --> D{Worker alive?}
  D -->|yes| A
  D -->|crash| E[New worker]
  E --> F[Load latest checkpoint by run id]
  F --> A`,
  mermaidAlt: 'A horizontal flowchart in which an Agent step executes an LLM call or tool, then atomically writes a checkpoint containing the state, the next step, and the result; if the worker is alive the loop continues, but if the worker crashes a new worker loads the latest checkpoint by run id and resumes the loop from the same point.',
  whenToUse: [
    'Apply when an agent run is long enough that a process restart between steps is likely (multi-minute tool calls, multi-hour batch jobs, sessions that span days).',
    'Use where steps have side effects you cannot afford to fire twice (charging a card, sending an email, opening a pull request) and need an idempotency anchor that survives crashes.',
    'Reach for it when the deployment target is preemptible — spot instances, serverless functions with execution caps, Kubernetes pods that the autoscaler may evict — and the agent must continue on a new worker without losing context.',
    'Prefer it when an operator needs to inspect or rewind a run between steps for debugging, audit, or human review of the trajectory before it continues.',
  ],
  whenNotToUse: [
    'When the run is single-shot, completes inside one short request, and the cost of restarting from the prompt is lower than the cost of a checkpoint write on every step.',
    'Without idempotent steps or a journal of completed effects, replay-style durable execution will re-fire the same side effect twice on recovery and produce a worse outcome than no checkpointing at all.',
    'When the checkpoint backend (Postgres, SQLite, or the journal store) is less reliable than the worker it is supposed to recover, the pattern moves the failure mode rather than removing it.',
  ],
  realWorldExamples: [
    {
      text: 'LangGraph ships a BaseCheckpointSaver interface with InMemorySaver, SqliteSaver, and PostgresSaver implementations; compiling a graph with a checkpointer writes a state snapshot at every super-step, keyed by thread_id, and a fresh process resumes by loading the latest checkpoint for that thread.',
      sourceUrl: 'https://docs.langchain.com/oss/python/langgraph/persistence',
    },
    {
      text: 'Temporal records a complete event history for every workflow execution and recovers from worker crashes by replaying that history on a new worker, short-circuiting Activities (LLM calls, tool invocations) whose results are already journaled — the same primitive Vercel\'s AI SDK durability plugin uses to make generateText() crash-safe.',
      sourceUrl: 'https://temporal.io/blog/building-durable-agents-with-temporal-and-ai-sdk-by-vercel',
    },
    {
      text: 'The Anthropic Claude Agent SDK persists every session — prompt, tool calls, tool results, responses — to disk under ~/.claude/projects/ as JSONL and exposes resume, continue, and fork options on query() so a process restart on the same machine picks up the conversation with full context intact.',
      sourceUrl: 'https://code.claude.com/docs/en/agent-sdk/sessions',
    },
  ],
  implementationSketch: `// Pseudocode — community-ts SDKs (LangGraph TS, Inngest, Temporal) provide
// these primitives directly; this sketch shows the snapshot-checkpoint shape
// the pattern requires regardless of backend.

type Checkpoint = { runId: string; step: number; state: AgentState; nextStep: string | null }

declare const store: {
  load(runId: string): Promise<Checkpoint | null>
  save(cp: Checkpoint): Promise<void>           // atomic; tolerates concurrent writers
}
declare function executeStep(state: AgentState, step: string): Promise<{ next: string | null; state: AgentState }>

async function runWithCheckpoints(runId: string, initialStep: string, initialState: AgentState) {
  const resumed = await store.load(runId)
  let state = resumed?.state ?? initialState
  let step: string | null = resumed?.nextStep ?? initialStep
  let i = (resumed?.step ?? -1) + 1

  while (step) {
    const result = await executeStep(state, step)        // LLM call or tool
    state = result.state
    await store.save({ runId, step: i, state, nextStep: result.next })   // commit boundary
    step = result.next                                   // crash here -> new worker resumes from saved checkpoint
    i += 1
  }
  return state
}

type AgentState = Record<string, unknown>
export {}
`,
  sdkAvailability: 'community-ts',
  readerGotcha: {
    text: 'Replay-based durable execution requires workflow code to be deterministic — the same input history must yield the same decisions on every replay. A stray Date.now(), a Math.random(), or an unguarded network call inside the workflow function will diverge from the journaled history on recovery and the runtime will throw a non-determinism error mid-replay. Temporal documents this as the cost of admission: side-effecting work must live inside Activities, not in the workflow body.',
    sourceUrl: 'https://docs.temporal.io/workflows',
  },
  relatedSlugs: [],
  realizingInClaudeCode: {
    tier: 'A',
    ccPrimitives: [
      'Disk-checkpoint discipline — each phase boundary writes artifacts to disk (phase-{N}/{role}-{slug}.md) before the next wave is dispatched; the filesystem is the checkpoint store, not an in-memory accumulator',
      'STATUS.md as the synchronous recovery anchor — a single row per phase updated inline during execution; a fresh-context successor session reads STATUS.md first and reconstructs where the funnel stopped without replaying any prior transcript',
      'init_funnel.sh boundary-enforcement script — initializes the phase artifact directory tree, writes the initial STATUS.md row, and gates execution: the funnel does not start if the output directories are not writable',
      'verify_phase.sh phase-exit gate — asserts all expected phase-{N}/{role}-{slug}.md files exist and are non-empty before dispatching the next wave; a missing artifact fails loudly rather than silently forwarding an incomplete context packet',
      'update_status.py inline STATUS.md writer — called synchronously at each phase boundary to mark the phase complete with a timestamp and artifact count; the STATUS.md row is the only persistent record the orchestrator session needs to resume',
      'Context-packet forwarding — between phases the orchestrator assembles a 1–2 K token context packet from phase artifacts (not raw transcripts) and passes it as the dispatch payload for the next wave; the packet keeps successor-session contexts clean',
    ],
    scaffolding: [
      '.claude/skills/analysis-funnel/SKILL.md — the orchestrator prompt encoding the 5+5+3+1 phase structure, the disk-checkpoint rule ("write each phase\'s artifacts before dispatching the next"), the STATUS.md synchronization contract, and the context-packet forwarding convention; the SKILL.md is the boundary-enforcement specification',
      'STATUS.md recovery anchor — one row per phase: phase number, status (pending / running / complete), artifact count, timestamp, and a one-line summary; the row is updated synchronously by update_status.py at each boundary; a new session that loses its context reads STATUS.md and knows exactly which phase to resume from',
      'phase-{N}/{role}-{slug}.md artifact convention — each investigator, iterator, and synthesizer writes its output to a deterministic path on disk; the path is the identity of the artifact and the checkpoint; the orchestrator never holds phase outputs in-context after the phase completes',
      'Context-packets directory — context-packets/phase-{N}-packet.md holds the 1–2 K token summary that crosses the boundary; it is the only inter-phase artifact the next wave\'s workers receive in addition to their brief; the full phase-{N}/ directory is available on disk but not forwarded into worker contexts',
    ],
    workedExample: {
      url: 'https://github.com/julianken/detached-node/blob/main/.claude/skills/analysis-funnel/SKILL.md',
      description: `The analysis-funnel SKILL.md documents the 5→5→3→1 disk-checkpoint discipline that is Checkpointing realized in Claude Code. The SKILL.md encodes the boundary protocol: write every phase's artifacts to disk before the next wave dispatches, update STATUS.md inline, forward a compressed context packet rather than raw transcripts. The three boundary-enforcement scripts — init_funnel.sh, verify_phase.sh, update_status.py — implement the checkpoint-write and gate-check steps that the pattern requires.

The structural mechanics in the SKILL.md match Checkpointing's core invariant: no phase work is held only in-context. Phase 1 investigators write findings to phase-1/{role}-{slug}.md on disk; verify_phase.sh asserts those files exist before Phase 2 dispatches. Phase 2 iterators read Phase 1 artifacts from disk (not from the orchestrator's in-context memory), produce phase-2/{role}-{slug}.md, and the process repeats. At each boundary, update_status.py marks the phase complete in STATUS.md with a timestamp and artifact count. A fresh-context session that opens STATUS.md can reconstruct the funnel's state entirely from disk — no transcript replay required, no in-context accumulation from the prior phase needed.

This realization is consistent with the durable-state-machine framing that LangGraph (BaseCheckpointSaver, thread_id-keyed snapshots) and Temporal (event-history replay, short-circuiting already-journaled Activities) describe in their documentation. The difference is the storage layer: production orchestration frameworks write to Postgres or a journal service; the analysis-funnel configuration writes to the local filesystem under a git-tracked directory tree. The recovery guarantee is weaker — a disk wipe loses the checkpoint — but the boundary discipline is identical: complete the step, persist the output, gate the next step on the persisted artifact.

STATUS.md as a recovery anchor is convergent practice across software-development tooling. Linear ships a per-issue status field updated synchronously with each transition. GitHub Projects tracks per-card status across board columns. Babel maintained a STATUS.md that documented compatibility-table completion per transform. Vue used a similar STATUS.md convention during the Vue 3 migration to track plugin and library readiness. Rust's tracking issues name per-feature stabilization status with inline checklists. The analysis-funnel configuration adds one specific deployment: using the STATUS.md row as the disk-anchored recovery signal for a fresh-context agent session resuming mid-funnel — the file's name is the prior art; the deployment pattern is what this configuration contributes.`,
    },
    readerMove: {
      text: "Write each phase's artifacts to disk before dispatching the next; sync STATUS.md inline.",
      anchorUrl: 'https://github.com/julianken/detached-node/blob/main/.claude/skills/analysis-funnel/SKILL.md',
    },
    seeAlso: {
      skillPath: '.claude/skills/analysis-funnel/SKILL.md',
      siblingPatternSlugs: ['orchestrator-workers', 'context-engineering'],
    },
  },
  frameworks: ['langgraph', 'mastra'],
  references: [
    {
      title: 'Pregel: A System for Large-Scale Graph Processing',
      url: 'https://15799.courses.cs.cmu.edu/fall2013/static/papers/p135-malewicz.pdf',
      authors: 'Malewicz et al.',
      year: 2010,
      venue: 'SIGMOD 2010',
      type: 'paper',
      doi: '10.1145/1807167.1807184',
      note: 'foundational super-step checkpointing model that LangGraph\'s BaseCheckpointSaver inherits',
    },
    {
      title: 'LangGraph — Persistence (checkpointers, threads, state)',
      url: 'https://docs.langchain.com/oss/python/langgraph/persistence',
      authors: 'LangChain team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'BaseCheckpointSaver interface and StateSnapshot semantics',
    },
    {
      title: 'Temporal — Workflow execution and durable execution',
      url: 'https://docs.temporal.io/workflows',
      authors: 'Temporal Technologies',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'event-history replay model and the determinism contract',
    },
    {
      title: 'Inngest — How functions are executed (step memoization)',
      url: 'https://www.inngest.com/docs/learn/how-functions-are-executed',
      authors: 'Inngest team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'step.run() memoization for resumable durable execution',
    },
    {
      title: 'Durable AI Loops: Fault Tolerance across Frameworks and without Handcuffs',
      url: 'https://restate.dev/blog/durable-ai-loops-fault-tolerance-across-frameworks-and-without-handcuffs/',
      authors: 'Restate team',
      year: 2025,
      type: 'essay',
      note: 'argues for journal-based durability wrapping existing agent SDKs',
    },
    {
      title: 'Claude Agent SDK — Work with sessions',
      url: 'https://code.claude.com/docs/en/agent-sdk/sessions',
      authors: 'Anthropic',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'first-party TS session persistence: continue, resume, fork',
    },
    {
      title: 'Agentic Design Patterns, Chapter 18: Guardrails / Safety Patterns',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [302, 303],
      note: 'frames Checkpoint and Rollback as the agent analogue of database commit/rollback',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-05',
  lastChangeNote: 'W2.2 — Populate realizingInClaudeCode Tier A: analysis-funnel SKILL.md worked example, disk-checkpoint primitives, STATUS.md scaffolding, phase-boundary readerMove.',
}
