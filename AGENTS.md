# Repository Guidelines

## Project Structure

- Planning docs: `PROJECT_BRIEF.md`, `CONTENT_MODEL.md`, `SITEMAP.md`.
- Reference docs: `docs/` (design system, deployment, testing guides).
- App source: `src/app/` using Next.js App Router with two route groups:
  - `(frontend)/` — public-facing blog pages.
  - `(payload)/` — Payload CMS admin routes.
- Components: `src/components/`.
- Public assets: `public/`.

## Build, Test, and Development Commands

```
pnpm install          # Install dependencies
pnpm dev              # Start local dev server (localhost:3000)
pnpm build            # Production build
pnpm typecheck        # TypeScript type-check (no emit)
pnpm lint             # ESLint + ADP validation scripts
pnpm test:unit        # Run Vitest unit tests (once)
pnpm test:unit:watch  # Run Vitest in watch mode
pnpm test:e2e         # Run Playwright end-to-end tests
```

## Coding Style & Naming Conventions

- TypeScript strict mode is canonical; see `tsconfig.json`.
- File names: `kebab-case` (e.g., `post-list.tsx`).
- Component names: `PascalCase`.
- Indentation: 2 spaces.
- Tailwind utility classes only; avoid inline styles.

## Testing

- Unit tests: Vitest + Testing Library (`*.test.ts` / `*.test.tsx`).
- E2E tests: Playwright (`tests/` directory).
- Run `pnpm test:unit` and `pnpm test:e2e` before opening a PR.

## Commit & Pull Request Guidelines

This repo uses **conventional commits**. Active scopes:

| Type        | When to use                              |
|-------------|------------------------------------------|
| `feat`      | New feature                              |
| `fix`       | Bug fix                                  |
| `chore`     | Maintenance, tooling, config             |
| `docs`      | Documentation only                       |
| `ci`        | CI/CD pipeline changes                   |
| `test`      | Adding or updating tests                 |
| `build(deps)` | Dependency bumps                       |
| `refactor`  | Code restructure without behavior change |
| `perf`      | Performance improvement                  |
| `design`    | Visual / aesthetic changes               |

Format: `type(scope): short imperative sentence (#issue)`.

PR descriptions: include a summary, test plan, and screenshots for UI changes. Screenshots go via GitHub user-attachments paste (not committed to the repo).

## Security

- Keep secrets out of the repo; use `.env.local` for local overrides.
- Required environment variables are documented in `docs/deployment.md`.
