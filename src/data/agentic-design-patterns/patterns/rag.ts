import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'rag',
  name: 'RAG',
  alternativeNames: ['Retrieval-Augmented Generation', 'Retrieve-and-Generate'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Retrieve passages from an external store and condition the model on them.',
  bodySummary: [
    'Retrieval-Augmented Generation pairs a frozen language model with an external store of documents the model was never trained on. At query time the system embeds the question, scores it against a precomputed index of chunked text, and selects the top handful of passages by cosine similarity or hybrid sparse-dense ranking. Those passages are concatenated into the prompt as evidence the model is told to ground its answer in. The model then generates a response that, in the well-tuned case, cites or quotes the retrieved snippets rather than fabricating from parametric memory.',
    "The pattern's leverage is that knowledge can change without retraining: swap the index, update a chunk, redeploy nothing. The cost is that retrieval becomes the silent tail that dominates accuracy. Chunk size, overlap, embedding model, distance metric, top-k, prompt template, and reranker each have a budget of free parameters and each interacts with the others. Even the embedding's distance function is load-bearing: a passage that should rank first under cosine often ranks fifth under dot-product on the same vectors. Most production RAG quality work is retrieval engineering wearing a generation costume.",
    "The vanilla pattern is single-pass and stateless: one query in, one prompt out. That makes it cheap and easy to debug — every retrieved chunk and every token in the augmented prompt is inspectable without a stacktrace. It also makes it fragile to multi-hop questions where the answer depends on combining facts from multiple documents, ambiguous queries that require clarification, or domains where the relevant chunk is not lexically close to the user's phrasing. The agentic variant, in which the model rewrites queries, retrieves iteratively, and decides when to stop, addresses those gaps but is documented separately as a different pattern.",
  ],
  mermaidSource: `graph TD
  A[User query] --> B[Embed query]
  B --> C[Vector + keyword index]
  C --> D[Top-k passages]
  D --> E[Augmented prompt]
  A --> E
  E --> F[Generator LLM]
  F --> G[Grounded answer]`,
  mermaidAlt: 'A flowchart in which a User query is embedded and scored against a vector and keyword index, the top-k passages are concatenated with the original query into an augmented prompt, and a generator LLM produces a grounded answer.',
  whenToUse: [
    'Apply when the answer must be grounded in a corpus that changes faster than you can retrain or fine-tune (product manuals, internal wikis, regulatory filings, customer ticket history).',
    "Use where the user's question is well-formed and self-contained — a single retrieval step is enough to surface the relevant passage.",
    'Reach for it when hallucination cost is high and you need an inspectable audit trail: every cited claim points back to a specific chunk in a specific document.',
    'Prefer it when the corpus is large enough that fitting it in the context window is wasteful or impossible, but small enough that the index fits in a single vector store.',
  ],
  whenNotToUse: [
    'When the question requires combining facts across multiple documents that no single chunk surfaces — single-pass retrieval will miss the bridge and the answer will look confidently wrong.',
    "When the corpus is small enough to fit in the model's context window: long-context prompting is simpler, has no retrieval failure mode, and benchmarks competitively for under ~100k tokens.",
    "Without a way to evaluate retrieval quality independently of generation quality, the system's failures are unattributable and tuning becomes superstition.",
  ],
  realWorldExamples: [
    {
      text: 'Perplexity issues a search for every conversational turn, retrieves a few pages of results, and conditions its answer on those passages with inline citations — a consumer-facing RAG product whose UI exposes the retrieved sources next to each claim.',
      sourceUrl: 'https://docs.perplexity.ai/docs/getting-started/overview',
    },
    {
      text: "Glean indexes an enterprise's documents, chats, and tickets behind permissions-aware vector search, then answers employee questions by quoting the matching passages with links back to the source system.",
      sourceUrl: 'https://www.glean.com/product/assistant',
    },
    {
      text: "Anthropic's Contextual Retrieval writeup documents a production RAG variant that prepends a one-paragraph chunk-context preamble before embedding, raising recall on their own evals by reducing the rate at which a relevant chunk goes unretrieved.",
      sourceUrl: 'https://www.anthropic.com/engineering/contextual-retrieval',
    },
  ],
  implementationSketch: `import { generateText, embed } from 'ai'
import { openai } from '@ai-sdk/openai'

type Chunk = { id: string; text: string; embedding: number[] }
declare const store: {
  search(query: number[], k: number): Promise<Chunk[]>
}

async function ragAnswer(question: string, k = 5): Promise<string> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: question,
  })
  const passages = await store.search(embedding, k)
  const context = passages.map((p, i) => \`[\${i + 1}] \${p.text}\`).join('\\n\\n')
  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: 'Answer using only the numbered passages. Cite the bracketed index for each claim. If the passages do not support an answer, say so.',
    prompt: \`Passages:\\n\${context}\\n\\nQuestion: \${question}\`,
  })
  return text
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: "Embedding a chunk in isolation strips the surrounding context that disambiguates it — \"the company reported $X\" loses meaning when severed from the document that names the company. Anthropic's Contextual Retrieval evaluation shows that prepending a short LLM-written context to each chunk before embedding cuts the failed-retrieval rate substantially; the cheap fix that practitioners most often skip.",
    sourceUrl: 'https://www.anthropic.com/engineering/contextual-retrieval',
  },
  relatedSlugs: [],
  frameworks: ['langchain', 'langgraph', 'vercel-ai-sdk', 'mastra'],
  references: [
    {
      title: 'Retrieval-Augmented Generation for Large Language Models: A Survey',
      url: 'https://arxiv.org/abs/2312.10997',
      authors: 'Gao et al.',
      year: 2023,
      type: 'paper',
      doi: '10.48550/arXiv.2312.10997',
      note: 'taxonomy of naive, advanced, and modular RAG; canonical academic survey of the pattern',
    },
    {
      title: 'Dense Passage Retrieval for Open-Domain Question Answering',
      url: 'https://aclanthology.org/2020.emnlp-main.550/',
      authors: 'Karpukhin et al.',
      year: 2020,
      venue: 'EMNLP 2020',
      type: 'paper',
      doi: '10.18653/v1/2020.emnlp-main.550',
      note: 'the dense-retriever architecture most production RAG stacks descend from',
    },
    {
      title: 'KILT: a Benchmark for Knowledge Intensive Language Tasks',
      url: 'https://aclanthology.org/2021.naacl-main.200/',
      authors: 'Petroni et al.',
      year: 2021,
      venue: 'NAACL 2021',
      type: 'paper',
      doi: '10.18653/v1/2021.naacl-main.200',
      note: 'shared evaluation suite for knowledge-intensive tasks Lewis et al. introduced for RAG',
    },
    {
      title: 'Introducing Contextual Retrieval',
      url: 'https://www.anthropic.com/engineering/contextual-retrieval',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'production RAG variant that prepends chunk-level context before embedding',
    },
    {
      title: 'Agentic Design Patterns, Chapter 14: Knowledge Retrieval (RAG)',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [277, 320],
    },
    {
      title: 'Build a Retrieval Augmented Generation (RAG) App',
      url: 'https://docs.langchain.com/oss/python/langchain/rag',
      authors: 'LangChain team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Authored RAG pattern (vanilla retrieve-and-generate; agentic variant remains separate).',
}
