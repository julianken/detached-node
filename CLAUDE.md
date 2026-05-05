# Claude Configuration

Project context and guidance for AI-assisted development on Detached Node.

## Project Overview

A tech blog exploring modern agentic AI workflows, autonomous systems, and the philosophy of machine intelligence. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

**Current phase:** Phase 3 (interaction layer in progress)

## Quick Reference

```bash
pnpm dev      # Start dev server (localhost:3000)
pnpm build    # Production build
pnpm lint     # Run ESLint
```

## Architecture

- **Framework:** Next.js App Router (`src/app/`)
- **Styling:** Tailwind CSS (utility classes, minimal custom CSS)
- **Content:** Payload CMS with Postgres backend
- **Deployment:** Google Cloud Run (Artifact Registry + Workload Identity Fed)

### Key Directories

```
src/app/
├── page.tsx           # Home page
├── layout.tsx         # Root layout with nav/footer
├── globals.css        # Tailwind imports + custom styles
├── posts/
│   ├── page.tsx       # Post listing
│   └── [slug]/page.tsx # Post detail (dynamic route)
└── about/page.tsx     # Static about page
```

## Content Model

Six Payload collections (see `CONTENT_MODEL.md` for full field definitions):
- **Posts:** Long-form entries (title, slug, summary, published_at, tags, body, references)
- **Listings:** Curated lists of posts
- **Pages:** Fixed content (About, Method, etc.)
- **Tags:** Taxonomy labels applied to posts
- **Media:** Uploaded images and files managed by Payload
- **Users:** Payload admin users

## Coding Conventions

- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Indentation:** 2 spaces
- **TypeScript:** Required for all app code
- **Commits:** Short, imperative messages (e.g., "Add post listing component")

## Voice and Tone (for content)

The blog's editorial voice is still being defined. For now:
- Assume a general reader
- Prioritize clarity over cleverness
- The subject matter is technical/analytical, not promotional

## Design System

**See `docs/design-system.md` for the complete design system specification.**

Key points:
- Page backgrounds use CSS custom properties (`--background`) - never add bg classes to body
- Cards/surfaces use `bg-zinc-50 dark:bg-zinc-800`
- Standard borders: `border-zinc-200 dark:border-zinc-700`
- Subtle borders (footer, sections): `border-zinc-200 dark:border-zinc-800`
- Text hierarchy: Primary (zinc-900/100), Secondary (zinc-600/400), Tertiary (zinc-500/500)
- Interactive hover states: `hover:bg-zinc-50 dark:hover:bg-zinc-800`

## What Claude Should Know

### When writing components:
- Use Tailwind utility classes; avoid inline styles
- Follow the color system defined in `docs/design-system.md`
- Cards use `dark:bg-zinc-800`, not `dark:bg-zinc-900` (unless intentionally recessed)
- Prefer `Link` from `next/link` for internal navigation

### When adding features:
- Check `PROJECT_BRIEF.md` for scope (some things are explicitly non-goals)
- Keep changes incremental; Phase 3 is in progress
- Document new patterns in `AGENTS.md` if they affect future development

### When working with content:
- Posts will eventually come from MDX files or a headless CMS
- The current hardcoded data is placeholder only
- Content structure should align with `CONTENT_MODEL.md`

## Worktree Branch Management

Subagent workflows create temporary `worktree-agent-*` branches. These are local-only development artifacts that must never be pushed to the remote.

**Safeguards:**
- A PreToolUse hook blocks `git push` commands referencing worktree-agent branches
- Cleanup script: `bash .claude/hooks/clean-worktree-branches.sh`
- These branches should be deleted after each session

**Convention:** If worktree branches accumulate, run the cleanup script before starting new work.

## Merge Queue (Mergify)

**After approving a PR, comment `@mergifyio queue` on it to add it to the merge queue.** Mergify will rebase onto main, re-run CI, and auto-merge if checks pass.

Required checks: ESLint, TypeScript, Vitest, Next.js Build, Analyze Bundle, CodeQL Analysis, E2E Shard 1/4, E2E Shard 2/4, E2E Shard 3/4, E2E Shard 4/4 + 1 approval.

Config: `.mergify.yml` at repo root. Dashboard: https://dashboard.mergify.com

## Common Tasks

| Task | Approach |
|------|----------|
| Add a new page | Create `src/app/[route]/page.tsx`, follow existing patterns |
| Modify layout | Edit `src/app/layout.tsx` |
| Add a component | Create in `src/components/` |
| Update styles | Prefer Tailwind utilities; update `globals.css` sparingly |
| Add content types | Update `CONTENT_MODEL.md` first, then implement |
| Add a Mermaid diagram to a post | Insert "Mermaid diagram" block in the body field; see `docs/design-system.md#mermaid-diagrams` |
| Queue a PR to merge | Comment `@mergifyio queue` on the approved PR |
| Clean worktree branches | `bash .claude/hooks/clean-worktree-branches.sh` |

## Phase Roadmap

1. **Phase 1** ✅ DONE — Deployed shell site + initial config
2. **Phase 2** ✅ DONE — Authoring and post pipeline (Payload CMS, content loading)
3. **Phase 3 (current):** Full aesthetic + interaction layer (in progress)
4. **Phase 4:** MVP complete

## Files to Read First

When starting a session, these provide the most context:
1. `CLAUDE.md` (this file)
2. `docs/design-system.md` (color palette and component patterns)
3. `docs/deployment.md` (Cloud Run deployment and production configuration)
4. `PROJECT_BRIEF.md` (goals and non-goals)
5. `CONTENT_MODEL.md` (data structure)
6. `src/app/layout.tsx` (design patterns)
