// MCP — Model Context Protocol pattern
// SDK: @modelcontextprotocol/sdk (first-party TypeScript)
// This snippet shows a minimal MCP server exposing one tool ("read_file")
// and the request handlers a client would invoke over stdio.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
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
  tools: [
    {
      name: 'read_file',
      description: 'Read a file from disk',
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string' } },
        required: ['path'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'read_file') {
    const { readFile } = await import('node:fs/promises')
    const path = req.params.arguments?.path as string
    const content = await readFile(path, 'utf-8')
    return { content: [{ type: 'text', text: content }] }
  }
  throw new Error(`Unknown tool: ${req.params.name}`)
})

await server.connect(new StdioServerTransport())
