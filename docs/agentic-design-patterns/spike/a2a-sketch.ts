// A2A — Agent-to-Agent communication pattern
// SDK: nascent — Google's a2a-protocol spec is JSON-over-HTTP; community
// TypeScript clients exist but coverage is partial. This snippet uses
// fetch directly per the spec, which is always available and shows the
// underlying mechanics.

type AgentCard = {
  name: string
  description: string
  url: string
  capabilities: { skills: { id: string; description: string }[] }
}

type TaskRequest = { skillId: string; input: Record<string, unknown> }

async function discover(agentUrl: string): Promise<AgentCard> {
  const res = await fetch(`${agentUrl}/.well-known/agent.json`)
  if (!res.ok) throw new Error(`Agent discovery failed: ${res.status}`)
  return (await res.json()) as AgentCard
}

async function invoke(agentUrl: string, req: TaskRequest): Promise<unknown> {
  const res = await fetch(`${agentUrl}/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    throw new Error(`Task failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

const card = await discover('https://research-agent.example.com')
const skill = card.capabilities.skills.find((s) => s.id === 'literature_search')
if (!skill) throw new Error('Required skill not advertised by agent')
const result = await invoke('https://research-agent.example.com', {
  skillId: 'literature_search',
  input: { query: 'agentic design patterns' },
})
console.log(result)

export {}
