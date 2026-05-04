import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'mcp',
  name: 'MCP',
  alternativeNames: ['Model Context Protocol'],
  layerId: 'interfaces',
  oneLineSummary: 'Open protocol for agents to discover and call tools across vendors over one wire format.',
  bodySummary: [
    'Model Context Protocol (MCP) is an open standard, published by Anthropic in November 2024, for how an agent host talks to external tools and data sources. The protocol fixes the wire format (JSON-RPC 2.0 over stdio for local servers, streamable HTTP for remote ones), the handshake (capability negotiation on connect), and three primitives a server can expose: tools the agent can invoke, resources the agent can read, and prompts the agent can substitute into its own context. Anything that follows the spec is wire-compatible with anything else that does, regardless of which model sits on the host side or which backend sits behind the server.',
    'The point of the protocol is the inverse of bespoke tool integration. Without MCP, every host re-implements the connector for every backend it wants to expose; with MCP, a single server is written once and consumed by any compliant host. Discovery is server-side: the host calls list_tools and receives the JSON-schema-typed catalog at runtime, so the host never knew the schema in advance and the server can publish a new tool without a host release. Capability negotiation lets the two sides agree on which features apply to a given session — sampling, roots, streaming — and the host adapts.',
    'MCP sits next to but distinct from Tool Use / ReAct, the runtime loop that decides when to invoke a tool. Tool Use is the consumer-side pattern; MCP is the integration substrate the consumer reads from. They compose: the ReAct agent picks an action from the catalog the MCP client returned, the client dispatches the JSON-RPC call, the result comes back as an observation, and the loop continues. The cost is operational. Local stdio servers run with the privileges of the host process; remote HTTP servers need OAuth, scope review, and a threat model for payloads hidden in tool descriptions or returned content. The protocol handles the wire; the deployment handles the trust.',
  ],
  mermaidSource: `graph TD
  A[Agent host: Claude Desktop, IDE, custom client] --> B[MCP client]
  B -->|JSON-RPC over stdio or HTTP| C[Filesystem server]
  B -->|JSON-RPC over stdio or HTTP| D[Database server]
  B -->|JSON-RPC over stdio or HTTP| E[Third-party SaaS server]
  C --> F[list_tools, list_resources, call_tool]
  D --> F
  E --> F
  F --> G[Capability-negotiated session]`,
  mermaidAlt: 'A top-down diagram in which an Agent host contains an MCP client that opens JSON-RPC sessions over stdio or HTTP to three independent servers — a filesystem server, a database server, and a third-party SaaS server — each of which exposes the same primitive operations (list_tools, list_resources, call_tool) through a capability-negotiated session.',
  whenToUse: [
    'Apply when the same set of tools must be reachable from more than one host (a desktop assistant, an IDE, a custom agent) and writing the integration once per host is wasted effort.',
    'Use where the tool catalog needs to grow without a host release — a server team can add a tool and every connected host sees it on the next list_tools call.',
    'Reach for it when the host and the tool backend are owned by different teams, vendors, or companies, and a typed wire format is the cheapest contract between them.',
    'Prefer it over a hand-rolled tool registry when you want users to install third-party servers (a Postgres connector, a GitHub connector, a Slack connector) the same way they install browser extensions.',
  ],
  whenNotToUse: [
    'When the agent has one host, one tool backend, and one team owns both, the protocol overhead buys nothing the local function-calling SDK does not already provide.',
    'Without an authentication and authorization story for remote servers (OAuth scopes, allow-listed origins, audit logs), exposing tools over HTTP is a wider attack surface than a same-process function call.',
    'When the tools require streaming bidirectional state the spec does not yet codify, falling back to a custom WebSocket protocol is honest; pretending to be MCP-compliant while breaking the contract corrupts the ecosystem.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic ships Claude Desktop with a built-in MCP client and publishes a reference filesystem, git, postgres, and brave-search server set so a user can wire any of them into the assistant by editing one config file.',
      sourceUrl: 'https://github.com/modelcontextprotocol/servers',
    },
    {
      text: 'Cloudflare runs MCP servers on Workers behind an OAuth provider, demonstrating the remote-server deployment shape — public URL, scoped access, no local install — and ships an OAuth helper library other server authors can adopt.',
      sourceUrl: 'https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/',
    },
    {
      text: 'OpenAI Agents SDK ships first-class MCP server support, letting a Python agent connect to any compliant server and consume its tools without per-server adapter code, on the explicit reasoning that the protocol is becoming the cross-vendor default.',
      sourceUrl: 'https://openai.github.io/openai-agents-python/mcp/',
    },
  ],
  implementationSketch: `import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  { name: 'fs-server', version: '0.1.0' },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'read_file',
    description: 'Read a file from disk',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
    },
  }],
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'read_file') {
    const { readFile } = await import('node:fs/promises')
    const path = req.params.arguments?.path as string
    return { content: [{ type: 'text', text: await readFile(path, 'utf-8') }] }
  }
  throw new Error(\`Unknown tool: \${req.params.name}\`)
})

await server.connect(new StdioServerTransport())
export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Invariant Labs documented a tool-poisoning attack in which a malicious MCP server hides instructions inside tool descriptions or in fields the host renders without showing to the user; on next session the agent reads the description, follows the embedded instructions, and exfiltrates data the user never authorised. The protocol does not sanitise descriptions — tool metadata is untrusted input the host must classify and gate before showing it to the model.',
    sourceUrl: 'https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks',
  },
  relatedSlugs: ['tool-use-react', 'guardrails', 'context-engineering'],
  frameworks: ['langchain', 'langgraph', 'openai-agents', 'mastra', 'google-adk'],
  references: [
    {
      title: 'Model Context Protocol Specification (2025-11-25)',
      url: 'https://modelcontextprotocol.io/specification/2025-11-25',
      authors: 'Anthropic and contributors',
      year: 2025,
      type: 'spec',
      accessedAt: '2026-05-04',
      note: 'current canonical spec revision; defines JSON-RPC wire format, transports, capability negotiation, tools/resources/prompts',
    },
    {
      title: 'Introducing the Model Context Protocol',
      url: 'https://www.anthropic.com/news/model-context-protocol',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'announcement post explaining the rationale for an open standard over per-vendor connectors',
    },
    {
      title: 'MCP architecture',
      url: 'https://modelcontextprotocol.io/docs/learn/architecture',
      authors: 'Anthropic and contributors',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
    },
    {
      title: 'TypeScript SDK for the Model Context Protocol',
      url: 'https://github.com/modelcontextprotocol/typescript-sdk',
      authors: 'Anthropic',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'first-party TypeScript SDK published as @modelcontextprotocol/sdk on npm',
    },
    {
      title: 'Bringing remote MCP support to Cloudflare Workers',
      url: 'https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/',
      authors: 'Cloudflare',
      year: 2025,
      type: 'essay',
      note: 'remote-server deployment shape; OAuth provider library; streamable HTTP transport in production',
    },
    {
      title: 'Agentic Design Patterns, Chapter 10: Model Context Protocol',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [155, 170],
    },
    {
      title: 'OpenAI Agents SDK — Model Context Protocol',
      url: 'https://openai.github.io/openai-agents-python/mcp/',
      authors: 'OpenAI',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'cross-vendor consumer-side support; canonical evidence the protocol is becoming the integration default',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author MCP satellite: open protocol for cross-vendor tool/resource/prompt discovery; tool-poisoning gotcha.',
}
