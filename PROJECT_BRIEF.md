# Detached Node

## Goal
Create a tech blog exploring modern agentic AI workflows, autonomous systems, and the philosophy of machine intelligence. The site should have a distinctive editorial voice, a clear and repeatable content structure, be easy to publish to, easy to navigate, and ready for future customization.

## Audience
AI engineers, agent-system practitioners, and technical readers exploring agentic AI workflows. Content assumes familiarity with software systems and an interest in how autonomous agents are designed, deployed, and reasoned about.

## Voice and Tone
Writing on Detached Node is precise, analytical, and practitioner-facing. It prioritizes honest engagement with tradeoffs over promotional framing. For full editorial guidance, see the ADP style guide (SHA-pinned, survives `docs/` purge in #240):
[`agentic-design-patterns-style-guide.md`](https://github.com/julianken/detached-node/blob/9ee44859dd28f345e804bca6a1b8916ff281cea9/docs/superpowers/specs/agentic-design-patterns-style-guide.md)

## Phase Roadmap

### Phase 1 ✅ DONE
Deployed shell site with navigation and placeholder content. Content model and site structure defined at a high level. Initial Vercel deployment, ESLint/TypeScript/Vitest CI, and Tailwind design system established.

### Phase 2 ✅ DONE
Full authoring and post pipeline shipped: Payload CMS with six collections (Posts, Listings, Pages, Tags, Media, Users), Lexical rich-text editor, Mermaid diagram support, ISR cache, preview pipeline, and ADP infrastructure shipped via PRs #162–#218 (Phase 1) plus #220 polish; 23 pattern satellites live at /agentic-design-patterns/. Deployment migrated from Vercel to Google Cloud Run with Workload Identity Federation and Artifact Registry.

### Phase 3 (current)
Full aesthetic and interaction layer. Success criteria:
- ADP series launch verified with live posts visible on the production site.
- Interaction layer (post reactions, reading progress, or equivalent engagement surface) implemented and passing E2E.
- Cloud Run preview environment audits clean (no stale ISR, no migration hangs).
- Bundle size and Core Web Vitals baselines established and documented.
- Design system finalized: dark/light parity, typography scale, and component library stable.

### Phase 4
MVP complete.

## Non-Goals (current scope)
- Social/community features (comments, user accounts, newsletters).
- Advanced search or personalization beyond current tag filtering.
- Native mobile app or PWA offline support.
- Monetization or advertising infrastructure.
- Support for non-English content.
