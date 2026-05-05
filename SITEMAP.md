# Sitemap

All routes served by this site, grouped by type. Source of truth is `src/app/sitemap.ts`.

---

## Frontend routes (`src/app/(frontend)/`)

### Primary pages

| Route | Directory |
|---|---|
| `/` | `(frontend)/page.tsx` |
| `/posts` | `(frontend)/posts/` |
| `/posts/[slug]` | `(frontend)/posts/[slug]/` |
| `/about` | `(frontend)/about/` |

### Agentic Design Patterns catalog

| Route | Notes |
|---|---|
| `/agentic-design-patterns` | Hub — `(frontend)/agentic-design-patterns/` |
| `/agentic-design-patterns/changelog` | `(frontend)/agentic-design-patterns/changelog/` |
| `/agentic-design-patterns/[slug]` | `(frontend)/agentic-design-patterns/[slug]/` |

23 satellite slugs (non-archived, in catalog order):

**Layer 1 — Topology / Single-agent (10)**

- `prompt-chaining`
- `routing`
- `parallelization`
- `planning`
- `tool-use-react`
- `code-agent`
- `evaluator-optimizer`
- `rag`
- `agentic-rag`
- `reflexion`

**Layer 1 — Topology / Multi-agent (3)**

- `orchestrator-workers`
- `multi-agent-debate`
- `handoffs-swarm`

**Layer 2 — Quality & Control Gates (3)**

- `guardrails`
- `human-in-the-loop`
- `evaluation-llm-as-judge`

**Layer 3 — State & Context (3)**

- `memory-management`
- `context-engineering`
- `checkpointing`

**Layer 4 — Interfaces & Transport (3)**

- `mcp`
- `a2a`
- `streaming`

**Layer 5 — Methodology (1)**

- `12-factor-agent`

---

## Other public routes

| Route | Source |
|---|---|
| `/feed.xml` | `src/app/feed.xml/route.ts` |
| `/sitemap.xml` | `src/app/sitemap.ts` (Next.js convention) |
| `/robots.txt` | `src/app/robots.ts` (Next.js convention) |

---

## Excluded routes

These routes exist in `src/app/` but are intentionally absent from the public sitemap. Omission is deliberate, not accidental.

| Route | Reason |
|---|---|
| `/admin/*` | Auth-gated Payload CMS admin panel (`src/app/(payload)/admin/`) |
| `/api/*` | Payload CMS REST/GraphQL endpoints under `(payload)/api/*` (auth-gated for write ops; read-only for some) and the `/api/vitals` reporting endpoint (`src/app/api/vitals/`); robot-disallowed in `robots.ts` |
| `/test-error` | Dev/test only — `page.tsx` returns `notFound()` when `NODE_ENV === 'production'` |

---

## Auto-generated metadata routes

Next.js serves these directly from static files in `src/app/` — no route handler required. They are not included in the XML sitemap but are publicly reachable.

| Route | File |
|---|---|
| `/favicon.ico` | `src/app/favicon.ico` |
| `/icon.png` | `src/app/icon.png` |
| `/apple-icon.png` | `src/app/apple-icon.png` |
| `/manifest.webmanifest` | `src/app/manifest.webmanifest` |

---

Source of truth is `src/app/sitemap.ts`.
