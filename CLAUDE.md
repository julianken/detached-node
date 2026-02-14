# Claude Configuration

Project context and guidance for AI-assisted development on Mind-Controlled.

## Project Overview

A cynical philosophy blog exploring propaganda, conditioning, and the mechanics of mind control (in the Ellul sense). Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

**Current phase:** Phase 1 (shell site with navigation and placeholders)

## Quick Reference

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

- **Framework:** Next.js App Router (`src/app/`)
- **Styling:** Tailwind CSS (utility classes, minimal custom CSS)
- **Content:** Payload CMS with Postgres backend
- **Deployment:** Vercel (see `docs/deployment.md` for complete guide)

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

Three page types defined in `CONTENT_MODEL.md`:
- **Post:** Long-form entry (title, slug, summary, published_at, tags, body, references)
- **Listing:** Curated list of posts
- **Static Page:** Fixed content (About, Method, etc.)

## Coding Conventions

- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Indentation:** 2 spaces
- **TypeScript:** Required for all app code
- **Commits:** Short, imperative messages (e.g., "Add post listing component")

## Voice and Tone (for content)

The blog's editorial voice is still being defined. For now:
- Assume a general reader
- Prioritize clarity over cleverness
- The subject matter is critical/analytical, not promotional

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
- Check `PROJECT_BRIEF.md` for scope (some things are explicitly non-goals for Phase 1)
- Keep changes incremental; this is still a scaffold
- Document new patterns in `AGENTS.md` if they affect future development

### When working with content:
- Posts will eventually come from MDX files or a headless CMS
- The current hardcoded data is placeholder only
- Content structure should align with `CONTENT_MODEL.md`

## Brainstorming System

The project includes a structured system for ideation in `docs/`:

```
docs/
├── brainstorms/    # Dated session files (raw ideation)
├── concepts/       # Graduated ideas (refined, reusable)
└── README.md       # Full workflow documentation
```

### When brainstorming with the user:
1. Create a new file: `docs/brainstorms/YYYY-MM-DD-topic.md` (copy from `_TEMPLATE.md`)
2. Capture ideas freely — don't over-organize during the session
3. Note interesting threads and questions as they emerge
4. After the session, update status and tags

### When an idea matures:
1. Create a concept file in `docs/concepts/`
2. Link back to the source brainstorm(s)
3. Mark the brainstorm as `graduated`

See `docs/README.md` for the full workflow.

## Common Tasks

| Task | Approach |
|------|----------|
| Start a brainstorm | Copy `docs/brainstorms/_TEMPLATE.md` to a dated file |
| Graduate an idea | Move to `docs/concepts/`, link back to source |
| Add a new page | Create `src/app/[route]/page.tsx`, follow existing patterns |
| Modify layout | Edit `src/app/layout.tsx` |
| Add a component | Create in `src/components/` (not yet created) |
| Update styles | Prefer Tailwind utilities; update `globals.css` sparingly |
| Add content types | Update `CONTENT_MODEL.md` first, then implement |

## Phase Roadmap

1. **Phase 1 (current):** Deployed shell site + initial config
2. **Phase 2:** Authoring and post pipeline (MDX, content loading)
3. **Phase 3:** Full aesthetic + interaction layer
4. **Phase 4:** MVP complete

## Files to Read First

When starting a session, these provide the most context:
1. `CLAUDE.md` (this file)
2. `docs/design-system.md` (color palette and component patterns)
3. `docs/deployment.md` (Vercel deployment and production configuration)
4. `PROJECT_BRIEF.md` (goals and non-goals)
5. `CONTENT_MODEL.md` (data structure)
6. `src/app/layout.tsx` (design patterns)
