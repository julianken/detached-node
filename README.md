# detached-node

A reference catalog of agentic AI design patterns for software engineers building with LLMs. The live site is [detached-node.dev](https://detached-node.dev). This repo is the source.

## What's in this repo

```
src/
├── app/
│   ├── (frontend)/                 # Public site
│   │   ├── agentic-design-patterns/   # 24-pattern catalog (hub + satellites)
│   │   ├── posts/                  # Essays
│   │   └── about/
│   └── (payload)/                  # Payload CMS admin
├── data/agentic-design-patterns/   # Pattern source-of-truth (one TS file per pattern)
├── lib/schema/                     # JSON-LD generators (BlogPosting, TechArticle, Person, etc.)
├── collections/                    # Payload CMS collection definitions
└── components/                     # Site UI

docs/                               # Project docs (design system, deployment, SEO strategy)
PROJECT_BRIEF.md                    # Goals, non-goals, phase roadmap
CONTENT_MODEL.md                    # Payload collection field definitions
AGENTS.md                           # Conventions for AI-assisted contributors
SITEMAP.md                          # Public route inventory
```

## Patterns covered

### Layer 1 — Topology / control flow

#### Single-agent

- **[Prompt Chaining](https://detached-node.dev/agentic-design-patterns/prompt-chaining)** — Decomposes a task into a fixed chain of LLM calls, each consuming the previous output.
- **[Routing](https://detached-node.dev/agentic-design-patterns/routing)** — Classifies the input, then forwards it to the matching prompt, model, or sub-agent.
- **[Parallelization](https://detached-node.dev/agentic-design-patterns/parallelization)** — Fires N LLM calls in parallel and reduces them with a deterministic aggregator.
- **[Planning](https://detached-node.dev/agentic-design-patterns/planning)** — Drafts a multi-step plan, executes it, and revises the tail when a step fails.
- **[Tool Use / ReAct](https://detached-node.dev/agentic-design-patterns/tool-use-react)** — Loops a thought, a tool call, and the result until the agent emits a final answer.
- **[Code Agent](https://detached-node.dev/agentic-design-patterns/code-agent)** — Wires the tool-use loop to a codebase, an editor, a shell, and a test runner.
- **[Evaluator-Optimizer](https://detached-node.dev/agentic-design-patterns/evaluator-optimizer)** — Drafts an answer, scores it against a rubric, and regenerates with the critique appended.
- **[RAG](https://detached-node.dev/agentic-design-patterns/rag)** — Pulls documents from an external store and uses them as context for the model's answer.
- **[Agentic RAG](https://detached-node.dev/agentic-design-patterns/agentic-rag)** — Lets the model issue retrieval as a tool call and decide when to stop searching.
- **[Reflexion](https://detached-node.dev/agentic-design-patterns/reflexion)** — Writes a critique after each attempt and retrieves prior critiques on the next attempt.

#### Multi-agent

- **[Orchestrator-Workers](https://detached-node.dev/agentic-design-patterns/orchestrator-workers)** — Has a central orchestrator dispatch sub-tasks to fresh workers and merge their outputs.
- **[Multi-Agent Debate](https://detached-node.dev/agentic-design-patterns/multi-agent-debate)** — Runs N agents on the same prompt, exposes them to each other's answers, and votes.
- **[Handoffs / Swarm](https://detached-node.dev/agentic-design-patterns/handoffs-swarm)** — Lets one agent own the dialogue and hand control off via a transfer tool call.

### Layer 2 — Quality and control gates

- **[Guardrails](https://detached-node.dev/agentic-design-patterns/guardrails)** — Wraps the model in input and output checks that block, rewrite, or refuse the response.
- **[Human in the Loop](https://detached-node.dev/agentic-design-patterns/human-in-the-loop)** — Pauses at designated steps and resumes only after a person approves, edits, or rejects.
- **[Evaluation (LLM-as-Judge)](https://detached-node.dev/agentic-design-patterns/evaluation-llm-as-judge)** — Scores model outputs with a stronger LLM applying a written rubric.

### Layer 3 — State and context

- **[Memory Management](https://detached-node.dev/agentic-design-patterns/memory-management)** — Splits agent state into a working window plus episodic and semantic durable stores.
- **[Context Engineering](https://detached-node.dev/agentic-design-patterns/context-engineering)** — Decides which tokens fill the model's window, in what order, at what fraction of budget.
- **[Checkpointing](https://detached-node.dev/agentic-design-patterns/checkpointing)** — Persists run state at step boundaries so a fresh worker resumes after a crash.

### Layer 4 — Interfaces and transport

- **[MCP](https://detached-node.dev/agentic-design-patterns/mcp)** — Standardises how an agent host discovers and calls tools across vendors over JSON-RPC.
- **[A2A](https://detached-node.dev/agentic-design-patterns/a2a)** — Lets one agent call another over HTTP by fetching an Agent Card and posting a Task.
- **[Streaming](https://detached-node.dev/agentic-design-patterns/streaming)** — Sends partial output frame by frame as it is generated, not after the model finishes.

### Layer 5 — Methodology

- **[12-Factor Agent](https://detached-node.dev/agentic-design-patterns/12-factor-agent)** — Catalogues twelve principles a team applies to push an agent from demo to production.
- **[Identity-Separated Review](https://detached-node.dev/agentic-design-patterns/identity-separated-review)** — Routes PR review through a separate machine-user identity on a different model tier.

## Recent essays

- **[Agentic Patterns in Your Coding Workflow](https://detached-node.dev/posts/agentic-patterns-in-your-coding-workflow)** (May 15, 2026)
- **[Subagent Orchestration Workflow](https://detached-node.dev/posts/subagent-orchestration-workflow)** (Apr 24, 2026)
- **[In Defense of Tickets and Pull Requests](https://detached-node.dev/posts/what-tickets-and-prs-are-actually-for)** (Apr 20, 2026)
- **[Rethinking Systems in the Agentic Age](https://detached-node.dev/posts/rethinking-systems-in-the-agentic-age)** (Apr 19, 2026)

## Architecture

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Payload CMS (Postgres backend), Google Cloud Run.

See:
- [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) — phase roadmap, goals, non-goals
- [`CONTENT_MODEL.md`](./CONTENT_MODEL.md) — Payload collection field definitions
- [`AGENTS.md`](./AGENTS.md) — conventions for AI-assisted contributors
- [`SITEMAP.md`](./SITEMAP.md) — public route inventory

## Development

```bash
pnpm dev        # localhost:3000
pnpm build      # production build
pnpm lint       # eslint + lint:adp
pnpm test:unit  # vitest
pnpm test:e2e   # playwright
```

## Live site

[detached-node.dev](https://detached-node.dev)

## License

MIT — see [LICENSE](./LICENSE).
