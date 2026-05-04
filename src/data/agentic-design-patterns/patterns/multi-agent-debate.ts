import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'multi-agent-debate',
  name: 'Multi-Agent Debate',
  alternativeNames: ['LLM Debate', 'Multiagent Debate', 'Society of Minds'],
  layerId: 'topology',
  topologySubtier: 'multi-agent',
  oneLineSummary: 'Several agents argue, critique each other, and converge on a single answer.',
  bodySummary: [
    'Multi-Agent Debate runs N language-model instances on the same prompt in parallel, then exposes each agent to the others\' answers and asks it to revise. The first round produces independent candidates that have not yet seen one another. The second round feeds every agent the full set of peer responses with an instruction to critique, defend, or update; agents may copy a peer\'s argument, contradict it, or merge fragments of several. The loop repeats for a fixed number of rounds, after which a deterministic aggregation — majority vote on the final answer field, or a separate judge over the closing statements — picks the verdict the system commits to.',
    'The mechanism earns its rent on tasks where errors are not correlated across independent samples but a single agent will not catch its own mistake. Du and colleagues report that debate raises factual accuracy on multi-hop arithmetic and trivia by margins self-consistency sampling does not match, because peer disagreement surfaces specific contradictions a same-prompt rollout would silently agree with. Liang and colleagues frame the same loop as a way out of Degeneration-of-Thought — the failure where a model commits to a confident-but-wrong answer and self-refinement only deepens the commitment. Cost is linear in agents and rounds: a four-agent two-round debate is eight LLM calls plus the judge against one for a baseline.',
    'The pattern sits next to Orchestrator-Workers and Evaluation (LLM-as-Judge) but is distinct from both. Orchestrator-Workers fans a fixed plan out to specialists chosen for their competence; debate runs symmetric peers and lets the disagreement do the work. LLM-as-Judge scores a fixed slate of candidates against a rubric; debate dynamically generates and refines the candidates before any verdict is taken. Khan and colleagues separately show that when candidates argue opposing positions and a weaker judge picks the winner, judge accuracy on hard reading-comprehension rises with debater capability — evidence the pattern composes with scalable-oversight pipelines, not just self-consistency.',
  ],
  mermaidSource: `graph TD
  A[Question] --> B1[Agent 1: initial answer]
  A --> B2[Agent 2: initial answer]
  A --> B3[Agent 3: initial answer]
  B1 --> C[Round 2: each agent reads all peer answers]
  B2 --> C
  B3 --> C
  C --> D1[Agent 1: revised answer]
  C --> D2[Agent 2: revised answer]
  C --> D3[Agent 3: revised answer]
  D1 --> E[Aggregate: majority vote or judge]
  D2 --> E
  D3 --> E
  E --> F[Final answer]`,
  mermaidAlt: 'A top-down flowchart in which one Question fans out to three agents that produce independent initial answers; those answers are concatenated and fed back to every agent for a critique-and-revise round, and the three revised answers are then collapsed by a majority vote or judge into one final answer.',
  whenToUse: [
    'Apply when factual accuracy or reasoning depth matters more than latency, and a single rollout silently produces a confident wrong answer that peer disagreement would expose.',
    'Use where the task admits a single committable verdict — a numeric answer, a multiple-choice label, a yes/no decision — that a deterministic aggregator can collapse the round to.',
    'Reach for it on questions a stronger model cannot reach but a panel of weaker models can, by triangulating between candidate explanations rather than averaging logits.',
    'Prefer it inside a scalable-oversight pipeline where opposing debaters surface contrasting evidence a less-capable judge can adjudicate more reliably than scoring one answer alone.',
  ],
  whenNotToUse: [
    'When latency or cost dominates and an N-agent K-round debate inflates per-query spend by an order of magnitude over a self-consistency sample for a marginal accuracy gain.',
    'Without a deterministic aggregation rule — vote, judge, or longest-justification heuristic — the debate produces N divergent finals and the system has no contract for what to commit to.',
    'When debaters share a single model snapshot and a single system prompt, errors stay correlated and the loop converges on the same wrong answer it started from rather than escaping it.',
  ],
  realWorldExamples: [
    {
      text: 'Du and colleagues publish a runnable reference implementation that wires three GPT-3.5 agents through two debate rounds on MMLU, GSM8K, and biographies, and report accuracy gains over chain-of-thought and self-consistency on the same prompts at the same compute envelope.',
      sourceUrl: 'https://composable-models.github.io/llm_debate/',
    },
    {
      text: 'AutoGen ships a Teams primitive in its AgentChat layer that composes multiple AssistantAgents into a round-robin or selector group chat, the canonical framework wiring of the debate loop where each agent reads the conversation transcript before its next turn.',
      sourceUrl: 'https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/teams.html',
    },
    {
      text: 'Anthropic\'s scalable-oversight programme runs debate as a research line in which two LLM debaters argue opposing positions on hard QA prompts and a weaker judge picks the winner, with measured judge accuracy rising as debater persuasiveness rises.',
      sourceUrl: 'https://www.anthropic.com/research/measuring-progress-on-scalable-oversight-for-large-language-models',
    },
  ],
  implementationSketch: `import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

const model = openai('gpt-4o')
const ask = (prompt: string) => generateText({ model, prompt }).then((r) => r.text)

export async function debate(question: string, agents = 3, rounds = 2): Promise<string> {
  let answers = await Promise.all(
    Array.from({ length: agents }, () => ask(\`Answer concisely. Question: \${question}\`)),
  )
  for (let r = 0; r < rounds; r++) {
    const transcript = answers.map((a, i) => \`Agent \${i + 1}: \${a}\`).join('\\n\\n')
    answers = await Promise.all(
      answers.map((_, i) =>
        ask(\`You are Agent \${i + 1}. Peers:\\n\${transcript}\\n\\nQuestion: \${question}\\nCritique the peers, then revise your answer.\`),
      ),
    )
  }
  return ask(\`Question: \${question}\\nFinal candidates:\\n\${answers.join('\\n---\\n')}\\nReturn the single best answer.\`)
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Liang and colleagues observe that when every debater is the same model with the same system prompt, the agents capitulate to the most confident-sounding peer within a round or two and the panel converges on whichever answer happened to be phrased most assertively, regardless of correctness. They label the failure mode Degeneration-of-Thought and recommend assigning explicit antagonist roles or temperatures so the agents argue rather than agree.',
    sourceUrl: 'https://arxiv.org/abs/2305.19118',
  },
  relatedSlugs: [],
  frameworks: ['autogen', 'crew-ai', 'langgraph'],
  references: [
    {
      title: 'Improving Factuality and Reasoning in Language Models through Multiagent Debate',
      url: 'https://arxiv.org/abs/2305.14325',
      authors: 'Du et al.',
      year: 2023,
      venue: 'ICML 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2305.14325',
      note: 'foundational paper; introduces the parallel-agents-then-critique-round loop on MMLU and GSM8K',
    },
    {
      title: 'Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate',
      url: 'https://arxiv.org/abs/2305.19118',
      authors: 'Liang Tian et al.',
      year: 2023,
      venue: 'EMNLP 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2305.19118',
      note: 'documents the Degeneration-of-Thought failure mode and the antagonist-role mitigation',
    },
    {
      title: 'Debating with More Persuasive LLMs Leads to More Truthful Answers',
      url: 'https://arxiv.org/abs/2402.06782',
      authors: 'Khan et al.',
      year: 2024,
      venue: 'ICML 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2402.06782',
      note: 'scalable-oversight result: weaker judges score debaters more accurately as debater capability rises',
    },
    {
      title: 'Measuring Progress on Scalable Oversight for Large Language Models',
      url: 'https://www.anthropic.com/research/measuring-progress-on-scalable-oversight-for-large-language-models',
      authors: 'Anthropic',
      year: 2022,
      type: 'essay',
      note: 'frames debate as a scalable-oversight protocol where weaker judges supervise stronger debaters',
    },
    {
      title: 'AutoGen — Teams (multi-agent group chat)',
      url: 'https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/teams.html',
      authors: 'Microsoft AutoGen team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'production wiring of the debate loop as a round-robin or selector group chat',
    },
    {
      title: 'Agentic Design Patterns, Chapter 7: Multi-Agent Collaboration',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [102, 119],
    },
  ],
  addedAt: '2026-05-04',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author Multi-Agent Debate satellite: parallel-agent answers, peer-critique rounds, deterministic aggregation; degeneration-of-thought gotcha.',
}
