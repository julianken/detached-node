import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'reflexion',
  name: 'Reflexion',
  alternativeNames: ['Verbal RL', 'Self-Reflection'],
  layerId: 'topology',
  secondaryLayerId: 'state',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Agent writes self-critiques into memory to improve next attempts.',
  bodySummary: [
    'Reflexion teaches a language agent to learn from its own trajectories without touching model weights. After each attempt, the agent inspects the trajectory and any environment feedback, then writes a short verbal critique — a paragraph that names what went wrong and what to try next. That critique is appended to an episodic memory buffer keyed by task or task class. On the next attempt, the agent retrieves the most recent and most relevant critiques and conditions its plan on them, treating prior failures as instructions rather than as silent gradient signal.',
    'The pattern straddles two layers. As Topology it shapes the control flow: a generator-execute-evaluate loop that, on failure, branches into a critique step before retrying. As State it maintains durable, retrievable memory whose unit is a natural-language lesson, not an embedding of a previous answer. The mechanism only earns its keep when failures are diagnosable from the trajectory itself — the agent must be able to articulate, in words, what an outside observer could also see. Tasks where failure is invisible (a stale tool, a wrong premise the agent never questioned) defeat the loop, because the critique is grounded in nothing.',
    'Reflexion sits next to but distinct from a within-attempt generator-critic loop. Self-Refine iterates on a single output until a critic stops complaining; Reflexion iterates across attempts, so the lesson outlives the run and the next encounter with the same problem class starts informed. The cost is operational, not algorithmic: someone has to decide what counts as the same task, how many critiques to retrieve, when to compact the buffer, and which model writes the critique. The default of having the same model judge its own work is the hazard the pattern is most often deployed without noticing.',
  ],
  mermaidSource: `graph TD
  A[Task] --> B[Generate]
  B --> C[Execute]
  C --> D{Success?}
  D -->|yes| E[Return]
  D -->|no| F[Generate verbal critique]
  F --> G[Append to episodic memory]
  G --> A`,
  mermaidAlt: 'A flowchart in which a Task feeds a Generate step, which feeds an Execute step, whose Success decision either returns the result or, on failure, generates a verbal critique that is appended to episodic memory before looping back to the Task node.',
  whenToUse: [
    'Apply when the agent attempts the same task class repeatedly and you have a place to keep critiques across runs (multi-turn assistants, recurring job types, agent benchmarks).',
    'Use where failure is diagnosable from the trajectory — the agent can name the mistake in words an outside reviewer could verify.',
    'Reach for it when fine-tuning is too slow or too expensive but you can afford a second LLM call per failed attempt and a small key-value store for lessons.',
    'Prefer it when you want behavioral improvements that survive a deploy: the lessons are inspectable text you can read, edit, or evict by hand.',
  ],
  whenNotToUse: [
    'Skip it for single-shot tasks: there is no second attempt for the lesson to inform, and the critique step pays no rent.',
    'Avoid same-model self-critique without external grounding — the model tends to approve its own work even when it should not. Use a different model, a tool-grounded check, or the CRITIC pattern instead.',
    'Drop it when failures are not visible in the trajectory (stale data the agent could not have known about, hidden environment changes), because the critique will hallucinate a cause.',
  ],
  realWorldExamples: [
    {
      text: 'Cognition documents Devin keeping notes on what worked and what failed across sessions on the same project, then reading those notes back when it picks the work up again.',
      sourceUrl: 'https://www.cognition.ai/blog/introducing-devin',
    },
    {
      text: 'LangGraph ships a runnable Reflection tutorial that wires a generator and reflector around a shared message thread, exactly the loop this pattern describes.',
      sourceUrl: 'https://langchain-ai.github.io/langgraph/tutorials/reflection/reflection/',
    },
    {
      text: 'AgentBench evaluates language agents across eight environments and reports that Reflexion-style verbal feedback measurably improves performance on programming and operating-system tasks where trajectory signal is rich.',
      sourceUrl: 'https://arxiv.org/abs/2308.03688',
    },
  ],
  implementationSketch: `import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

type Episode = { task: string; outcome: 'success' | 'failure'; critique: string }
const memory: Episode[] = []

declare function evaluate(output: string): Promise<boolean>

async function attemptWithReflexion(task: string, maxAttempts = 3): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const lessons = memory
      .filter((m) => m.outcome === 'failure')
      .slice(-3)
      .map((m) => m.critique)
      .join('\\n')
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: \`Lessons from prior attempts:\\n\${lessons}\\n\\nTask: \${task}\`,
    })
    if (await evaluate(text)) return text
    const critique = await generateText({
      model: openai('gpt-4o'),
      prompt: \`Task: \${task}\\nAttempt: \${text}\\nWhy did this fail? Write a one-paragraph lesson for next time.\`,
    })
    memory.push({ task, outcome: 'failure', critique: critique.text })
  }
  throw new Error('Max attempts exceeded')
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'A same-model critic trained on the same prompt will systematically approve its own output, producing sycophantic agreement that looks like self-correction but adds no signal. Ground the critique externally — a different model, a code interpreter, a search-grounded checker — as CRITIC argues.',
    sourceUrl: 'https://arxiv.org/abs/2305.11738',
  },
  relatedSlugs: ['evaluator-optimizer', 'memory-management', 'evaluation-llm-as-judge'],
  frameworks: ['langchain', 'langgraph'],
  references: [
    {
      title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
      url: 'https://arxiv.org/abs/2303.11366',
      authors: 'Shinn et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2303.11366',
      note: 'foundational paper',
    },
    {
      title: 'Self-Refine: Iterative Refinement with Self-Feedback',
      url: 'https://arxiv.org/abs/2303.17651',
      authors: 'Madaan et al.',
      year: 2023,
      type: 'paper',
      doi: '10.48550/arXiv.2303.17651',
      note: 'closely related single-attempt variant',
    },
    {
      title: 'CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing',
      url: 'https://arxiv.org/abs/2305.11738',
      authors: 'Gou et al.',
      year: 2023,
      type: 'paper',
      doi: '10.48550/arXiv.2305.11738',
      note: 'tool-grounded variant; addresses the same-model sycophancy gotcha',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'frames the within-attempt cousin as the evaluator-optimizer workflow',
    },
    {
      title: 'Agentic Design Patterns, Chapter 4: Reflection',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [56, 68],
    },
    {
      title: 'LangGraph — Reflection workflow',
      url: 'https://langchain-ai.github.io/langgraph/tutorials/reflection/reflection/',
      authors: 'LangChain team',
      year: 2024,
      type: 'docs',
      accessedAt: new Date().toISOString().slice(0, 10),
    },
  ],
  addedAt: '2026-05-02',
  dateModified: new Date().toISOString().slice(0, 10),
  lastChangeNote: 'Initial authoring as the Phase-1 exemplar.',
}
