import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'funnel-method',
  name: 'Funnel Method',
  alternativeNames: ['Phase-Funnel', 'Multi-Phase Agent Loop', '5+5+3+1 Funnel', 'Progressive Synthesis'],
  layerId: 'methodology',
  archived: true,
  oneLineSummary: 'Runs a 5+5+3+1 cascade of agents across four disk-anchored phases.',
  bodySummary: [
    'The Funnel Method is a four-phase multi-agent investigation and synthesis loop. Phase 1 fans out five parallel investigators, each exploring an independent facet of the problem space. Phase 2 fans out five iterators that develop, challenge, and extend the Phase 1 findings. Phase 3 fans out three synthesizers that converge through different analytical lenses. Phase 4 runs a single unifier that produces the final deliverable. Every phase boundary writes artifacts to disk before the next wave dispatches; a STATUS.md row updates synchronously at each transition; a compressed context packet (1–2 K tokens, not raw transcripts) flows forward as the dispatch payload. The next wave reads the packet plus its own brief — never the prior wave\'s full transcript.',
    'The 5+5+3+1 cardinality is one specific composition of well-established antecedents. The four-phase funnel shape is consistent with the Double Diamond framework (British Design Council, 2005), which names Discover, Define, Develop, and Deliver as the four moves in a design process. The parallel-then-converge dispatch mechanic draws on Nominal Group Technique (NGT, Delbecq and Van de Ven, 1971), which prescribes silent individual idea generation followed by group ranking — the same structural logic applied to agent waves. Anthropic\'s multi-agent research blog describes the lead-spawns-3-5-subagents primitive that is the direct computational ancestor of the parallel dispatch waves. LangGraph and Temporal own the durable-state-machine and phase-boundary-checkpoint framing that the disk-artifact protocol realizes at a simpler storage layer.',
    'Claude Code [skills](https://docs.claude.com/en/docs/claude-code/skills) encode the funnel as executable configuration, with variants for investigation, option evaluation, and creative production. The same 5+5+3+1 structure appears across all variants, applied to different triggering domains. The shared shape across independent triggering domains is the practical validation that the cardinality is stable rather than accidental. The disk-artifact protocol — STATUS.md, phase-{N}/{role}-{slug}.md artifacts, context-packets/phase-{N}-packet.md — is the shared scaffolding that makes each skill resumable, inspectable, and auditable across domains.',
  ],
  mermaidSource: `graph LR
  A[Brief + question] --> B[Phase 0: Frame]
  B --> C[Phase 1: Investigate — 5 parallel agents]
  C --> D[Disk checkpoint + STATUS.md + context packet]
  D --> E[Phase 2: Iterate — 5 parallel agents]
  E --> F[Disk checkpoint + STATUS.md + context packet]
  F --> G[Phase 3: Synthesize — 3 parallel agents]
  G --> H[Disk checkpoint + STATUS.md + context packet]
  H --> I[Phase 4: Unify — 1 agent]
  I --> J[Final deliverable on disk]`,
  mermaidAlt: 'A left-to-right flowchart in which a Brief and question flow into a Phase 0 Frame step, then into Phase 1 where five parallel agents investigate, writing to a disk checkpoint that updates STATUS.md and produces a context packet; that packet dispatches Phase 2 where five parallel agents iterate; another checkpoint dispatches Phase 3 where three parallel agents synthesize; a final checkpoint dispatches Phase 4 where one unifying agent produces the final deliverable on disk.',
  whenToUse: [
    'Apply when the problem space is broad and open-ended — a strategic question, a complex codebase audit, a multi-option decision with uncertain weights — and a single agent working sequentially will miss important facets because attention degrades inside a single context window.',
    'Use where the deliverable requires evidence from multiple independent investigation angles, iterative challenge of early findings, and synthesis through more than one analytical lens before a final judgment.',
    'Reach for it when resumability and auditability matter: the disk-artifact protocol means any phase can be re-run from the last checkpoint if a worker fails, and the artifact tree is the full audit trail of how the deliverable was produced.',
    'Prefer it on tasks where the analysis cost justifies parallel dispatch — the wall-clock saving from running five investigators in parallel (bounded by the slowest) rather than serially (bounded by their sum) pays the token overhead of five concurrent context windows.',
  ],
  whenNotToUse: [
    'When the task has a known answer that a single well-prompted call can return — the four-phase structure adds dispatch overhead and token cost without adding investigation coverage.',
    'Without a working disk-checkpoint setup (writable phase artifact directories, STATUS.md writer), the phase-boundary protocol cannot run; a lost-in-context sequential loop will produce worse results than a well-scoped single agent.',
    'When the question is implementation-first rather than understanding-first, the funnel\'s investigation shape will produce analysis rather than code; prefer a sequential prompt chain or orchestrator-workers topology with explicit task decomposition.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic\'s multi-agent research system dispatches parallel subagents that each explore independent branches of a complex research question, with a synthesis pass that converges the branch findings — the same parallel-dispatch-then-synthesize shape the Funnel Method encodes at 5+5+3+1 cardinality.',
      sourceUrl: 'https://www.anthropic.com/engineering/multi-agent-research-system',
    },
    {
      text: 'Google ADK\'s ParallelAgent primitive runs sub-agents concurrently and writes into shared session state for a downstream merger agent — the parallel fan-out and aggregation split that Phase 1 and Phase 2 waves realize in the Funnel Method.',
      sourceUrl: 'https://google.github.io/adk-docs/agents/multi-agents/',
    },
    {
      text: 'The Double Diamond framework (British Design Council) names Discover, Define, Deliver, and Develop as the four moves of a design process — the same four-phase funnel shape, applied to human design teams rather than agent waves.',
      sourceUrl: 'https://www.designcouncil.org.uk/our-resources/framework-for-innovation/',
    },
  ],
  implementationSketch: `// Pseudocode — the actual implementation uses a funnel SKILL.md
// and the single-message multi-Task() dispatch mechanic.

// Phase 0: frame the question, carve investigation areas
const brief = frameQuestion(input)

// Phase 1: five investigators in one assistant message (parallel dispatch)
// Each Task() runs in its own context window; all fire concurrently
const [inv1, inv2, inv3, inv4, inv5] = await Promise.all([
  Task({ brief, role: 'investigator', focus: areas[0] }),  // writes phase-1/investigator-{slug}.md
  Task({ brief, role: 'investigator', focus: areas[1] }),
  Task({ brief, role: 'investigator', focus: areas[2] }),
  Task({ brief, role: 'investigator', focus: areas[3] }),
  Task({ brief, role: 'investigator', focus: areas[4] }),
])
updateStatus(1, 'complete', artifactCount: 5)  // synchronous STATUS.md row
const packet1 = compressToContextPacket(phase1Artifacts)  // 1-2K tokens

// Phase 2: five iterators — same single-message dispatch pattern
// Each reads packet1 + its own brief; never sees Phase 1 transcripts directly
const [it1, it2, it3, it4, it5] = await Promise.all([
  Task({ packet: packet1, role: 'iterator', angle: angles[0] }),
  // ...
])
updateStatus(2, 'complete', artifactCount: 5)
const packet2 = compressToContextPacket(phase2Artifacts)

// Phase 3: three synthesizers
const [syn1, syn2, syn3] = await Promise.all([
  Task({ packet: packet2, role: 'synthesizer', lens: 'strategic' }),
  Task({ packet: packet2, role: 'synthesizer', lens: 'technical' }),
  Task({ packet: packet2, role: 'synthesizer', lens: 'risk' }),
])
updateStatus(3, 'complete', artifactCount: 3)
const packet3 = compressToContextPacket(phase3Artifacts)

// Phase 4: one unifier — produces the final deliverable
await Task({ packet: packet3, role: 'unifier' })  // writes phase-4/analysis-report.md
updateStatus(4, 'complete', artifactCount: 1)

export {}
`,
  sdkAvailability: 'no-sdk',
  readerGotcha: {
    text: 'The context packet between phases must be a compressed summary (1–2 K tokens), never a dump of raw phase artifacts. Passing raw artifacts forward bloats each wave\'s context and re-exposes details the prior wave already resolved. The context packet is a design artifact: it encodes what the next wave needs to know, not everything the prior wave produced. Funnel SKILL.md encodes this as a hard constraint — the context packet is the only inter-phase payload; the raw artifact directory stays on disk but is not forwarded into worker contexts.',
    sourceUrl: 'https://www.anthropic.com/engineering/multi-agent-research-system',
  },
  relatedSlugs: ['orchestrator-workers', 'parallelization', 'checkpointing', 'context-engineering'],
  frameworks: [],
  references: [
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'names the orchestrator-workers and parallelization primitives that the Funnel Method composes; the lead-spawns-3-5-subagents pattern is the direct computational ancestor of the parallel dispatch waves',
    },
    {
      title: 'Anthropic multi-agent research system',
      url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
      authors: 'Anthropic',
      year: 2025,
      type: 'essay',
      note: 'production-scale parallel subagent dispatch with synthesis pass; structurally identical to the Funnel Method at larger cardinality; the claimed ~90% latency reduction relative to sequential search is the same arithmetic the 5-investigator wave buys',
    },
    {
      title: 'Double Diamond — Framework for Innovation',
      url: 'https://www.designcouncil.org.uk/our-resources/framework-for-innovation/',
      authors: 'British Design Council',
      year: 2005,
      type: 'essay',
      accessedAt: '2026-05-05',
      note: 'Discover / Define / Develop / Deliver four-phase shape; the Funnel Method\'s four phases are structurally consistent with the Double Diamond; convergent parallel-then-converge discipline',
    },
    {
      title: 'Nominal Group Technique: A Method for Assessing Group Opinion',
      url: 'https://en.wikipedia.org/wiki/Nominal_group_technique',
      authors: 'Delbecq, Van de Ven',
      year: 1971,
      type: 'essay',
      accessedAt: '2026-05-05',
      note: 'NGT prescribes silent individual idea generation followed by group ranking — the same parallel-then-converge mechanic the Phase 1 investigator wave embodies; foundational antecedent for parallel independent work before aggregation',
    },
    {
      title: 'LangGraph — Workflows and agents (parallelization)',
      url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents',
      authors: 'LangChain team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-05',
      note: 'durable-state-machine framing for multi-phase agent workflows; LangGraph owns the phase-boundary-checkpoint abstraction at the framework layer that the Funnel Method realizes at the filesystem layer',
    },
    {
      title: 'Temporal — Workflow execution and durable execution',
      url: 'https://docs.temporal.io/workflows',
      authors: 'Temporal Technologies',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-05',
      note: 'journal-based durable execution: the structural model that the disk-artifact phase-boundary protocol approximates at a simpler storage layer; Temporal owns the replay-based recovery guarantee',
    },
    {
      title: 'Microsoft Azure — AI agent orchestration patterns',
      url: 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns',
      authors: 'Microsoft',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-05',
      note: 'Azure Architecture Center treatment of multi-agent coordination patterns; parallel dispatch and checkpoint patterns documented separately — the Funnel Method is one specific composition',
    },
    {
      title: 'Google ADK — Multi-Agent Systems (ParallelAgent)',
      url: 'https://google.github.io/adk-docs/agents/multi-agents/',
      authors: 'Google',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-05',
      note: 'ParallelAgent primitive for concurrent sub-agent dispatch with shared state; the fan-out primitive that Phase 1 and Phase 2 waves realize in Claude Code via single-message multi-Task() dispatch',
    },
  ],
  addedAt: '2026-05-05',
  dateModified: '2026-05-15',
  lastChangeNote: 'Archived: pattern retired from active catalog.',

  realizingInClaudeCode: {
    keyMoves: [
      'Dispatch all Phase 1 investigators in one assistant message so Claude Code runs them concurrently; wall-clock is bounded by the slowest, not the sum.',
      'Write each wave\'s outputs to deterministic disk paths before dispatching the next wave — the filesystem is the checkpoint store and the phase boundary.',
      'Forward a 1–2 K token context packet between waves, not raw phase transcripts; workers read the packet plus their own brief, keeping worker contexts independent.',
      'Update a `STATUS.md` row synchronously at each phase boundary so a fresh-context session can reconstruct which phase to resume from without replaying transcripts.',
    ],
    ccPrimitives: [
      'Task tool (parallel wave dispatch)',
      'Single-message multi-Task() dispatch',
      'Disk phase checkpoints',
      'STATUS.md phase tracking',
    ],
    seeAlso: {
      siblingPatternSlugs: [
        'orchestrator-workers',
        'parallelization',
        'checkpointing',
        'context-engineering',
      ],
    },
  },
  realizingInCursor: {
    keyMoves: [
      'Use [cloud agents](https://cursor.com/docs/cloud-agent) to run parallel investigation branches — each agent works in its own cloud session without seeing the others\' work.',
      'Write phase outputs to a shared branch; reference them via `@branch` in the synthesis session so the synthesizer reads committed artifacts, not in-memory chat.',
      'Compress each phase\'s findings into a handoff file before the next phase; pass it via `@file` to keep synthesizer contexts clean and independent.',
      'Use [Plan mode](https://cursor.com/docs/agent/plan-mode) to draft the 5+5+3+1 phase structure before execution; review the plan and adjust cardinality before any agents fire.',
    ],
    ccPrimitives: [
      'Cloud agents (parallel phase waves)',
      '@branch (phase artifact access)',
      '@file (context packet forwarding)',
      'Plan mode (phase structure review)',
    ],
    seeAlso: {
      siblingPatternSlugs: [
        'orchestrator-workers',
        'parallelization',
        'checkpointing',
        'context-engineering',
      ],
    },
  },
}
