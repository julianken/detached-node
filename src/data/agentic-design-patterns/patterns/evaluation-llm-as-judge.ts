import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'evaluation-llm-as-judge',
  name: 'Evaluation (LLM-as-Judge)',
  alternativeNames: ['LLM-as-a-Judge', 'Model-graded Evaluation', 'Automatic Evaluator'],
  layerId: 'quality',
  oneLineSummary: 'Score model outputs with another LLM applying a written rubric.',
  bodySummary: [
    'LLM-as-Judge replaces human raters with a stronger language model that reads a candidate output, applies a written rubric, and emits a score and a justification. The judge prompt fixes the criteria the rater is allowed to consider — helpfulness, factuality, instruction-following, safety, format conformance — and constrains the response to a structured object the eval harness can aggregate. The pattern earns its keep when collecting human preferences would gate every release: a frontier model paid per million tokens reproduces majority human judgement closely enough that running thousands of comparisons becomes a CI step rather than a quarterly contract.',
    'Two judging shapes dominate. Pairwise comparison shows the judge two candidate responses to the same prompt and asks which is better; aggregating many such comparisons into a Bradley-Terry or Elo rating produces the leaderboard form Chatbot Arena and AlpacaEval popularised. Single-answer scoring asks the judge to rate one response on a fixed numeric scale against an explicit rubric — the shape most production teams adopt for regression tracking. Both inherit the same operational hazards: position bias when the order of A and B leaks into the verdict, length bias when verbosity is rewarded, self-preference when the judge shares weights with the candidate, and rubric drift when the criteria text is edited without rerunning prior baselines.',
    'The pattern is the class-level concern that the Reflexion gotcha names as one instance: a same-model judge systematically agrees with its own output, so the judge must come from a different family or a stronger tier than what it scores. G-Eval adds chain-of-thought rubrics that elicit per-criterion reasoning before the score, raising Spearman correlation with human judgement on summarisation but not fixing bias on tasks where the judge itself is unreliable. Production teams treat the judge prompt as versioned code, freeze the judge behind a pinned snapshot, and audit a sampled fraction of judgements against human raters to detect drift before a regression ships.',
  ],
  mermaidSource: `graph LR
  A[Candidate output] --> B[Judge prompt + rubric]
  C[Reference or paired candidate] --> B
  B --> D[Judge LLM]
  D --> E[Structured judgement: score + rationale]
  E --> F[Aggregate over eval set]
  F --> G[Leaderboard or regression report]`,
  mermaidAlt: 'A flowchart in which a candidate output and an optional reference or paired candidate are combined with a judge prompt and rubric, fed to a judge LLM that emits a structured judgement of score plus rationale, which is aggregated over an eval set into a leaderboard or regression report.',
  whenToUse: [
    'Apply when collecting human preferences is the bottleneck on every release and a frontier model agrees with majority human judgement closely enough to gate CI on its score.',
    'Use where the rubric can be written down — helpfulness against an instruction, faithfulness to retrieved context, format conformance, safety policy adherence — and the judge can read both the criteria and the candidate in one call.',
    'Reach for it when you need pairwise leaderboards or A/B regression tracking across many candidate models, prompts, or RAG configurations on the same eval set.',
    'Prefer it when the task admits a structured verdict (score, label, ranking) the harness can aggregate, and a written rationale a reviewer can audit when a number looks wrong.',
  ],
  whenNotToUse: [
    'When the judge and the candidate share a model family or training data, self-preference inflates scores even when the candidate is worse — pick a judge from a different family or a stronger tier.',
    'When the rubric criteria require ground truth the judge cannot verify (live database state, proprietary numeric facts, code that must execute), a tool-grounded check or unit test produces a more honest verdict.',
    'Without a sampled human-audit loop calibrated to the eval set, judge drift across model snapshots silently changes the regression baseline and the leaderboard becomes unfalsifiable.',
  ],
  realWorldExamples: [
    {
      text: 'LMSYS Chatbot Arena collects pairwise human votes between anonymous model responses and reports an Elo leaderboard; the same paper validates GPT-4 as a judge whose pairwise verdicts agree with human majority at roughly the rate two humans agree with each other.',
      sourceUrl: 'https://lmarena.ai/leaderboard',
    },
    {
      text: 'AlpacaEval scores instruction-following models with an LLM judge that compares each candidate response against a reference from text-davinci-003 across 805 prompts, publishing a length-controlled win-rate leaderboard that tracks closely with Arena rankings.',
      sourceUrl: 'https://tatsu-lab.github.io/alpaca_eval/',
    },
    {
      text: 'LangSmith documents an LLM-as-judge evaluator type that runs a judge prompt over each candidate trace and writes the structured score back to the experiment, the canonical wiring of this pattern in a production observability stack.',
      sourceUrl: 'https://docs.smith.langchain.com/evaluation/concepts',
    },
  ],
  implementationSketch: `import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const Judgement = z.object({
  score: z.number().int().min(1).max(5),
  rationale: z.string(),
  flags: z.array(z.enum(['off-topic', 'unsafe', 'malformed'])).default([]),
})

const RUBRIC = [
  '5 = fully answers the prompt with correct, well-supported claims.',
  '3 = partially correct or missing key context.',
  '1 = wrong, evasive, or off-topic.',
].join('\\n')

export async function judge(prompt: string, candidate: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: Judgement,
    system: \`You are an impartial grader. Score using this rubric:\\n\${RUBRIC}\\nReason step by step before assigning the score.\`,
    prompt: \`PROMPT:\\n\${prompt}\\n\\nCANDIDATE:\\n\${candidate}\`,
  })
  return object
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Zheng et al. measured a position bias in pairwise judging: GPT-4 prefers the response shown first in roughly 60 percent of ties, enough to flip leaderboard rankings if the order is fixed. The mitigation they recommend is running each comparison twice with swapped order and counting only consistent verdicts, which doubles judge cost but is the difference between a defensible benchmark and a confounded one.',
    sourceUrl: 'https://arxiv.org/abs/2306.05685',
  },
  relatedSlugs: [],
  frameworks: ['langchain', 'langgraph', 'vercel-ai-sdk'],
  references: [
    {
      title: 'Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena',
      url: 'https://arxiv.org/abs/2306.05685',
      authors: 'Zheng et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2306.05685',
      note: 'foundational measurement of judge agreement with human raters; documents position, verbosity, and self-preference biases',
    },
    {
      title: 'G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment',
      url: 'https://arxiv.org/abs/2303.16634',
      authors: 'Liu et al.',
      year: 2023,
      venue: 'EMNLP 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2303.16634',
      note: 'chain-of-thought rubric that raises Spearman correlation with human summarisation judgements',
    },
    {
      title: 'Length-Controlled AlpacaEval: A Simple Way to Debias Automatic Evaluators',
      url: 'https://arxiv.org/abs/2404.04475',
      authors: 'Dubois et al.',
      year: 2024,
      venue: 'arXiv preprint',
      type: 'paper',
      doi: '10.48550/arXiv.2404.04475',
      note: 'documents and corrects length bias in the AlpacaEval LLM-judge leaderboard',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'frames LLM-judged evaluation as the prerequisite for shipping any agent workflow',
    },
    {
      title: 'Agentic Design Patterns, Chapter 19: Evaluation and Monitoring',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [290, 307],
    },
    {
      title: 'LangSmith — Evaluation concepts (LLM-as-judge)',
      url: 'https://docs.smith.langchain.com/evaluation/concepts',
      authors: 'LangChain team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'production wiring of the pattern as a first-class evaluator type',
    },
    {
      title: 'OpenAI Evals — open-source evaluation framework',
      url: 'https://github.com/openai/evals',
      authors: 'OpenAI',
      year: 2023,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'reference framework that ships ModelGradedSpec for LLM-judge templates',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Initial authoring of the Evaluation (LLM-as-Judge) pattern (wave-2, issue #179).',
}
