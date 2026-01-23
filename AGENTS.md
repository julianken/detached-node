# Repository Guidelines

## Project Structure & Module Organization
- Root planning docs: `PROJECT_BRIEF.md`, `CONTENT_MODEL.md`, `SITEMAP.md`.
- App source: `src/app` (Next.js App Router).
- Public assets: `public/`.
- Keep new docs in the repository root unless a dedicated `docs/` folder is introduced.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the local dev server.
- `npm run build` creates the production build.
- `npm run start` serves the production build.
- `npm run lint` runs Next.js linting.

## Coding Style & Naming Conventions
- Use TypeScript for application code once the app is scaffolded.
- Favor `kebab-case` for file names (e.g., `post-list.tsx`) and `PascalCase` for React components.
- Keep indentation at 2 spaces for JSON/Markdown; follow default formatter rules once added.

## Testing Guidelines
- No tests are configured yet.
- When tests are added, document the framework and command in `README.md` and align file naming with the framework defaults (e.g., `*.test.ts`).

## Commit & Pull Request Guidelines
- No commit conventions are established in this repository yet.
- Suggested default: short, imperative commit messages (e.g., `Add initial Next.js scaffold`).
- PRs should include a brief summary, testing notes, and screenshots for UI changes.

## Security & Configuration Tips
- Keep secrets out of the repo; use `.env.local` once the app exists.
- If new config files are added, document required keys and defaults in `README.md`.
