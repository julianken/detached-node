import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'a2a',
  name: 'A2A',
  alternativeNames: ['Agent2Agent', 'Inter-Agent Communication', 'Agent-to-Agent Protocol'],
  layerId: 'interfaces',
  oneLineSummary: 'Cross-runtime agents discover each other by URL and exchange tasks over HTTP+JSON.',
  bodySummary: [
    "A2A defines a wire protocol for one agent to call another it did not author and may not share a runtime with. The remote agent advertises itself by serving an Agent Card — a JSON document at a well-known path under its base URL — that lists the skills it offers, declares supported transports, and names which auth schemes a caller must satisfy. A client agent fetches that card, picks a matching skill, and posts a Task over JSON-RPC, REST, or gRPC. The Task carries a stable identifier and a lifecycle (submitted, working, completed, failed, cancelled) so a long-running call can be polled or streamed without holding the request open.",
    "The pattern's load-bearing claim is opacity. The remote agent is not a tool the caller introspects; it is a black box that owns its own model, prompt, memory, and tool catalogue, and the contract is the Agent Card plus the Task envelope rather than shared code. That separation is what lets a LangGraph agent in one company's VPC delegate to a CrewAI agent in another's without either side importing the other's framework. Capability negotiation happens at the card level, before any task is posted, so a missing skill is a 4xx rather than a runtime mystery.",
    "A2A sits next to but distinct from MCP and from in-process handoffs. MCP standardises the channel between an agent and the tools it consumes; A2A standardises the channel between two agents that consume tools of their own. Handoffs and Swarm-style topologies pass control between agents inside one runtime over an in-memory bus; A2A passes control across processes, networks, and trust boundaries, with mutual TLS and OAuth as the seam. The cost is operational: someone owns the public surface, the auth scheme as it rotates, the deprecation policy when a skill changes shape, and the trace that ties a downstream Task back to its upstream caller.",
  ],
  mermaidSource: `graph LR
  A[Client agent] --> B[GET /.well-known/agent-card.json]
  B --> C[Agent Card: skills, auth, transport]
  C --> D{Required skill advertised?}
  D -->|no| E[Abort or pick a different agent]
  D -->|yes| F[POST Task over JSON-RPC]
  F --> G[Remote agent runs its own loop]
  G --> H[Task lifecycle: working then completed or failed]
  H --> I[Artifacts and messages returned to client]`,
  mermaidAlt: 'A left-to-right flowchart in which a client agent first fetches the Agent Card from a well-known path on the remote agent, inspects the advertised skills and authentication, aborts if the required skill is missing, otherwise posts a Task over JSON-RPC, and waits for the remote agent to drive its own loop through the Task lifecycle until artifacts and messages are returned.',
  whenToUse: [
    'Apply when one agent must delegate work to another that lives in a different runtime, was built by a different team, or runs on a different vendor — the kind of integration where importing the callee\'s framework is not on the table.',
    'Use where the remote agent should stay opaque: it owns its model, prompt, and tools, and the caller only contracts on the advertised skill surface.',
    'Reach for it when discovery and capability negotiation have to happen at request time — the caller does not know in advance which skills a partner agent supports, or those skills change between deploys.',
    'Prefer it when the call may run long enough that the synchronous request-response shape breaks down (multi-minute research, code generation, ticket triage) and the Task lifecycle gives you streaming and polling without bespoke plumbing.',
  ],
  whenNotToUse: [
    'When both agents live in the same process and can pass messages through an in-memory bus, the JSON-RPC hop and Agent Card round-trip are pure overhead — Handoffs / Swarm is the cheaper match.',
    'When the callee is a tool, resource, or function rather than an agent that runs its own reasoning loop, MCP is the protocol that fits and A2A is the wrong abstraction.',
    'Without an authentication story the operator can audit (mutual TLS, scoped OAuth, signed Agent Cards), an open A2A endpoint is an unauthenticated RPC surface that any caller on the internet can drive.',
  ],
  realWorldExamples: [
    {
      text: 'The a2aproject reference repository ships sample servers and clients that discover each other via Agent Cards and exchange Tasks over JSON-RPC, gRPC, or REST — the canonical cross-framework demonstration the spec authors maintain alongside the spec itself.',
      sourceUrl: 'https://github.com/a2aproject/A2A',
    },
    {
      text: 'LangSmith\'s Agent Server exposes any LangGraph deployment as an A2A endpoint, mapping the protocol\'s message/send and message/stream RPC methods onto the graph\'s message-based state so other A2A clients can call a LangGraph agent without touching LangChain code.',
      sourceUrl: 'https://docs.langchain.com/langsmith/server-a2a',
    },
    {
      text: 'The a2aproject/a2a-samples repository publishes interoperable agent implementations in Python, Java, and Go that wire LangGraph, CrewAI, Azure AI Foundry, and AG2 into the same protocol, demonstrating the cross-framework collaboration the spec was written to enable.',
      sourceUrl: 'https://github.com/a2aproject/a2a-samples',
    },
  ],
  implementationSketch: `// Community TS SDK exists (\`@a2a-js/sdk\`); the spec is HTTP+JSON-RPC and works
// with bare \`fetch\`, which is what the snippet below shows so the wire shape is
// visible without an SDK indirection.

type AgentCard = {
  name: string
  url: string
  capabilities: { skills: { id: string; description: string }[] }
}

type TaskEnvelope = { jsonrpc: '2.0'; id: string; method: 'message/send'; params: unknown }

async function discover(agentUrl: string): Promise<AgentCard> {
  const res = await fetch(\`\${agentUrl}/.well-known/agent-card.json\`)
  if (!res.ok) throw new Error(\`Agent discovery failed: \${res.status}\`)
  return (await res.json()) as AgentCard
}

async function invoke(agentUrl: string, skillId: string, text: string, token: string): Promise<unknown> {
  const body: TaskEnvelope = {
    jsonrpc: '2.0',
    id: crypto.randomUUID(),
    method: 'message/send',
    params: { skillId, message: { role: 'user', parts: [{ kind: 'text', text }] } },
  }
  const res = await fetch(\`\${agentUrl}/\`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: \`Bearer \${token}\` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(\`Task failed: \${res.status} \${await res.text()}\`)
  return res.json()
}

const card = await discover('https://research-agent.example.com')
if (!card.capabilities.skills.some((s) => s.id === 'literature_search')) {
  throw new Error('Required skill not advertised by remote agent')
}
const result = await invoke('https://research-agent.example.com', 'literature_search', 'agentic design patterns', process.env.A2A_TOKEN!)
console.log(result)

export {}
`,
  sdkAvailability: 'community-ts',
  readerGotcha: {
    text: 'A2A endpoints are public RPC surfaces by default — the Agent Card declares the auth scheme but the protocol does not enforce one. An agent server deployed without mutual TLS, scoped OAuth, or at minimum an API key is an unauthenticated remote-execution endpoint any caller on the internet can drive into the underlying tool catalogue. The spec\'s security section spells this out, but the failure mode in the wild is shipping the development server with the auth section of the card left empty.',
    sourceUrl: 'https://a2a-protocol.org/latest/specification/',
  },
  relatedSlugs: ['tool-use-react', 'guardrails'],
  frameworks: ['langgraph', 'crew-ai', 'google-adk'],
  references: [
    {
      title: 'Agent2Agent (A2A) Protocol Specification',
      url: 'https://a2a-protocol.org/latest/specification/',
      authors: 'a2aproject (Linux Foundation)',
      year: 2026,
      type: 'spec',
      accessedAt: '2026-05-04',
      note: 'canonical specification (v1.0); governs Agent Card schema, Task lifecycle, and JSON-RPC / REST / gRPC bindings',
    },
    {
      title: 'Announcing the Agent2Agent Protocol (A2A)',
      url: 'https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/',
      authors: 'Google',
      year: 2025,
      type: 'essay',
      note: 'launch post (April 2025) naming the five design principles and the initial 50-partner consortium',
    },
    {
      title: 'a2aproject/A2A — protocol repository',
      url: 'https://github.com/a2aproject/A2A',
      authors: 'a2aproject',
      year: 2026,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'reference servers, conformance samples, governance under the Linux Foundation',
    },
    {
      title: 'a2aproject/a2a-js — official TypeScript SDK',
      url: 'https://github.com/a2aproject/a2a-js',
      authors: 'a2aproject',
      year: 2026,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: '@a2a-js/sdk — first-party JavaScript client and server bindings tracking the spec',
    },
    {
      title: 'A2A endpoint in Agent Server',
      url: 'https://docs.langchain.com/langsmith/server-a2a',
      authors: 'LangChain team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'maps the protocol onto a LangGraph deployment (message/send, message/stream, tasks/get)',
    },
    {
      title: 'Agentic Design Patterns, Chapter 15: Inter-Agent Communication (A2A)',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [217, 231],
      note: 'frames A2A as the multi-agent counterpart to MCP; documents Agent Card, core actors, and security model',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author A2A satellite: Agent Card discovery, Task lifecycle, distinction from MCP and in-process Handoffs.',
}
