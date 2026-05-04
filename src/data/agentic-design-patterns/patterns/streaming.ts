import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'streaming',
  name: 'Streaming',
  alternativeNames: ['Token Streaming', 'Incremental Output', 'Server-Sent Deltas'],
  layerId: 'interfaces',
  oneLineSummary: 'Deliver partial output as it is generated, not after the model has finished.',
  bodySummary: [
    'Streaming changes when the model\'s output reaches the consumer: bytes leave the inference server the moment they are generated, rather than accumulating until the full response is ready. The transport is almost always Server-Sent Events — a long-lived HTTP response whose body is a sequence of newline-delimited data frames the client parses as it reads. Each frame carries a small typed delta: a chunk of generated text, a partial JSON fragment of a tool call, an updated finish reason, or a terminal event that closes the stream. The consumer reconstructs the final state by accumulating deltas in order; nothing is broadcast and nothing is replayed.',
    'Three sub-variants share the same wire shape but differ in what is being incrementally revealed. Token streaming emits text deltas one fragment at a time and is what every chat UI renders character-by-character. Structured streaming emits a partial JSON object whose shape is fixed by a schema — the Vercel AI SDK\'s streamObject exposes the partial as a typed value at every step, so a form fills in field-by-field instead of appearing all at once. Tool-call streaming emits the arguments of a function call as they are generated; a long argument list becomes visible before the model has finished writing it, and a UI can begin rendering the call before dispatch.',
    'The pattern is a UX contract change as much as a transport detail. A thirty-second response that streams feels usable because the user sees evidence of work within the first hundred milliseconds; the same thirty seconds behind a single blocking request reads as a hung connection. Streaming is distinct from polling, where the client repeatedly asks whether the result is ready, and from progress events, which are out-of-band metadata about an otherwise-blocking operation. With streaming, the partial output is the operation.',
  ],
  mermaidSource: `graph LR
  A[Client request] --> B[Inference server]
  B -->|HTTP 200, keep-alive| C[SSE response]
  C --> D[message_start frame]
  D --> E[content_block_delta frames]
  E --> F[tool_call argument deltas]
  F --> G[message_stop frame]
  E -.token-by-token.-> H[UI renders incrementally]
  G --> I[Client closes stream]`,
  mermaidAlt: 'A left-to-right flowchart showing a client request reaching an inference server that opens an HTTP keep-alive connection and writes a Server-Sent Events response composed of a message_start frame, a sequence of content_block_delta frames, optional tool_call argument deltas, and a final message_stop frame; a dashed branch off the delta frames feeds a UI that renders the partial output incrementally before the client closes the stream.',
  whenToUse: [
    'Apply when the end-to-end latency of a full response would feel broken to a human reader — chat assistants, code completion, anything a person watches arrive in real time.',
    'Use where the consumer can act on partial output before the model finishes — a UI that renders tokens as they arrive, a downstream pipeline that processes structured fields the moment each one closes.',
    'Reach for it when you need to surface mid-generation telemetry — token counts, finish reason, tool calls under construction — that is impossible to inspect once the response is a single returned blob.',
    'Prefer it for tool-call workflows where the client wants to validate, render, or short-circuit a tool invocation while the arguments are still being generated.',
  ],
  whenNotToUse: [
    'When the consumer is another program that needs the full response to act — a batch evaluator, a webhook handler, a structured-data extractor — streaming buys nothing and complicates retry semantics.',
    'Without an HTTP client and proxy chain that supports long-lived connections, streaming silently degrades: a buffering reverse proxy will hold the response until the stream closes and the user sees the same blocking behaviour you tried to avoid.',
    'When the output is short enough that the network round trip dominates generation time, the framing overhead of SSE is wasted and a single response is simpler.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic\'s Messages API documents the canonical event flow — message_start, a series of content_block_delta frames per content block, message_delta, message_stop — that every Claude client (Console, Claude Code, third-party SDKs) consumes to render incremental output.',
      sourceUrl: 'https://docs.anthropic.com/en/api/messages-streaming',
    },
    {
      text: 'The Vercel AI SDK ships streamText and streamObject as first-class primitives; streamObject parses partial JSON against a Zod schema and yields a typed partial value at every delta, which is what powers form-fill and structured-output UIs in the Vercel templates.',
      sourceUrl: 'https://ai-sdk.dev/docs/foundations/streaming',
    },
    {
      text: 'OpenAI\'s cookbook publishes a runnable notebook that opens a chat completion with stream=True, iterates the SSE response, and prints each text delta as it arrives — the reference shape every OpenAI-compatible client implements.',
      sourceUrl: 'https://github.com/openai/openai-cookbook/blob/main/examples/How_to_stream_completions.ipynb',
    },
  ],
  implementationSketch: `import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

const result = streamText({
  model: openai('gpt-4o'),
  prompt: 'Summarise the streaming pattern in three sentences.',
  maxRetries: 2,
})

// Consume the union stream so text deltas, finish reason, and mid-stream
// errors all surface from a single for-await loop.
for await (const part of result.fullStream) {
  switch (part.type) {
    case 'text-delta':
      process.stdout.write(part.textDelta)
      break
    case 'finish':
      console.log('\\nfinish:', part.finishReason, 'tokens:', part.usage.totalTokens)
      break
    case 'error':
      console.error('mid-stream error:', part.error)
      break
  }
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'A streaming request returns HTTP 200 the moment the connection opens, before the model has generated a single token — so transport-layer error handling that branches on status code will mark a half-completed or overload-aborted response as success. Anthropic documents that mid-stream errors (overloaded_error, network drops) arrive as event frames inside the already-200 response; the client must inspect each frame and treat error events as failures, not just check the HTTP status when the connection closes.',
    sourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/streaming',
  },
  relatedSlugs: ['tool-use-react', 'mcp', 'a2a'],
  frameworks: ['vercel-ai-sdk', 'langchain', 'langgraph', 'openai-agents', 'mastra'],
  references: [
    {
      title: 'Streaming Messages',
      url: 'https://docs.anthropic.com/en/api/messages-streaming',
      authors: 'Anthropic',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'canonical SSE event flow: message_start, content_block_delta, message_delta, message_stop, plus tool-call input_json_delta',
    },
    {
      title: 'Streaming output',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/streaming',
      authors: 'Anthropic',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'mid-stream error events on an already-200 response; basis for the reader gotcha',
    },
    {
      title: 'AI SDK — Streaming',
      url: 'https://ai-sdk.dev/docs/foundations/streaming',
      authors: 'Vercel',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'first-party TypeScript primitives streamText and streamObject; partial-output stream typed against a Zod schema',
    },
    {
      title: 'Streaming — LangChain Conceptual Guide',
      url: 'https://js.langchain.com/docs/concepts/streaming',
      authors: 'LangChain',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'cross-vendor framework view: stream, astream, and astream_events as the three consumer surfaces',
    },
    {
      title: 'How to stream completions',
      url: 'https://github.com/openai/openai-cookbook/blob/main/examples/How_to_stream_completions.ipynb',
      authors: 'OpenAI',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'reference notebook for OpenAI-compatible SSE delta consumption with stream=True',
    },
    {
      title: 'HTML Living Standard — Server-sent events',
      url: 'https://html.spec.whatwg.org/multipage/server-sent-events.html',
      authors: 'WHATWG',
      year: 2025,
      type: 'spec',
      accessedAt: '2026-05-04',
      note: 'underlying wire format every LLM streaming API rides on; defines the EventSource interface and reconnection semantics',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author Streaming satellite: SSE event-flow, token vs structured vs tool-call variants, mid-stream-error gotcha.',
}
