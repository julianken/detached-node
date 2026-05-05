# Detached Node

A tech blog exploring modern agentic AI workflows, autonomous systems, and the philosophy of machine intelligence.

**Live site:** [detached-node.dev](https://detached-node.dev)

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| CMS | Payload CMS 3 |
| Database | PostgreSQL via Supabase |
| Media | Google Cloud Storage |
| Rate Limiting | Upstash Redis (with in-memory fallback) |
| Deployment | Google Cloud Run |
| Testing | Vitest (unit) + Playwright (e2e) |

### Project Structure

```
src/
├── app/
│   ├── (frontend)/                    # Public-facing routes
│   │   ├── page.tsx                    # Home
│   │   ├── posts/                      # Post listing + detail ([slug])
│   │   ├── about/                      # Static about page
│   │   ├── failure-modes/              # Pillar page for article clusters
│   │   └── agentic-design-patterns/    # Hub + [slug] satellites + changelog
│   └── (payload)/                      # CMS admin routes
├── components/            # Shared React components
├── lib/                   # Utilities, config, schema generators
└── collections/           # Payload CMS collection definitions
```

### Key Design Decisions

- **Route groups** separate the public site `(frontend)` from the CMS admin `(payload)`, sharing a Next.js app without coupling concerns.
- **JSON-LD structured data** is generated per page via schema utilities in `src/lib/schema/`, supporting BlogPosting, BreadcrumbList, WebSite, and Person entities.
- **Rate limiting** uses a strategy pattern — Upstash Redis in production, an in-memory implementation in development — so the app runs without external dependencies locally.
- **Payload CMS** runs embedded within the Next.js app (no separate server), using the Local API for content seeding and server-side queries.

## Development

```bash
pnpm install
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test:unit    # Vitest unit tests
pnpm test:e2e     # Playwright end-to-end tests
```

### Environment

Copy `.env.example` for the required environment variables. The app requires:
- `DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — Payload CMS encryption key

Optional for full functionality:
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — production rate limiting
- `GCS_BUCKET` — Google Cloud Storage bucket name for media
- `GCS_HMAC_ACCESS_KEY` — GCS HMAC access key for S3-compatible media uploads
- `GCS_HMAC_SECRET` — GCS HMAC secret for S3-compatible media uploads

### AI-Assisted Development

This project uses [Claude Code](https://claude.ai/code) as a development tool. The `CLAUDE.md` file provides project context and coding conventions to the AI assistant — functioning as executable documentation that keeps AI contributions consistent with the project's architecture and style.

## Content Model

Three content types managed through Payload CMS:

- **Post** — Long-form article with title, slug, summary, body (Lexical rich text), tags, and publication date
- **Listing** — Curated groupings of posts
- **Page** — Static content (About, etc.)

See `CONTENT_MODEL.md` for the full schema specification.

## License

MIT — see [LICENSE](./LICENSE).
