# Domain Detection and Area Carving

Analyze the question and tag all applicable domains. Each domain activates a specialist investigation lens (Phase 1) and guides agent type selection for all phases.

## Domain table

| Domain | Detected When | Investigation Focus |
|--------|--------------|---------------------|
| **UI/Visual** | Analysis involves layouts, styling, visual hierarchy, animations, theming | Aesthetics, consistency, visual hierarchy, responsiveness |
| **React/Components** | Analysis involves component architecture, state, props, hooks, rendering | Component boundaries, re-render efficiency, hook correctness |
| **State Management** | Analysis involves stores, sync, real-time updates, caching | Data flow, race conditions, consistency guarantees |
| **API/Backend** | Analysis involves endpoints, data fetching, auth, server logic | Contracts, error handling, security, performance |
| **Database** | Analysis involves schema, queries, migrations, data modeling | Normalization, query patterns, migration safety |
| **GraphQL** | Analysis involves schema design, resolvers, federation, subscriptions | Schema design, N+1 risks, type safety, caching |
| **Auth/Security** | Analysis involves authentication, authorization, tokens, encryption | Attack vectors, token handling, OWASP compliance |
| **Accessibility** | Analysis involves screen readers, keyboard nav, ARIA, color contrast | WCAG compliance, assistive tech compatibility, focus management |
| **Performance** | Analysis involves load times, bundle size, rendering speed, memory | Bottlenecks, measurement methodology, regression risk |
| **Testing** | Analysis involves test strategy, coverage, E2E, mocking | Coverage gaps, flakiness risk, test maintainability |
| **DevOps/Infra** | Analysis involves CI/CD, deployment, monitoring, scaling | Deployment safety, rollback capability, observability |
| **Mobile/Native** | Analysis involves iOS, Android, React Native, responsive mobile UX | Platform conventions, gesture handling, offline behavior |
| **Architecture** | Analysis involves system design, module boundaries, patterns, coupling | Cohesion, coupling, abstraction quality, evolution fitness |
| **Developer Experience** | Analysis involves tooling, documentation, onboarding, workflow friction | Ergonomics, discoverability, consistency, cognitive load |

**Tagging rules:**
- Tag 2–5 domains. More than 5 → decompose the question into separate funnels.
- Fewer than 2 → you may be thinking too narrowly; most real analyses span multiple domains.
- The detected domains guide which specialist agent types the orchestrator selects for each phase.

## Quality criteria (defaults)

Adjust weights per analysis — these are starting points, not mandates:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Evidence strength | 25% | Are findings backed by concrete data, code references, or verifiable facts? |
| Completeness | 20% | Does the analysis cover the full scope of the question? |
| Accuracy | 20% | Are claims factually correct and technically sound? |
| Actionability | 15% | Can someone act on the findings (even if actions aren't prescribed)? |
| Nuance | 10% | Does it acknowledge uncertainty, trade-offs, and multiple perspectives? |
| Clarity | 10% | Is it well-organized and comprehensible to the stated audience? |

Commit to weights *before* seeing findings. Retrofitting criteria to match the evidence you wanted is the most common way a sincere analysis becomes motivated reasoning.

## Carving rules for 5 investigation areas

Each area should be a different **facet** of the question, not a different answer. Rules:

- Areas explore different ASPECTS, not different conclusions
- Each area should align with one of the tagged domains
- Areas should have minimal overlap — if two areas would investigate the same files, merge them
- Each area must be independently investigable — no area depends on another's results (that's what Phase 2 is for)

## Examples

**Architecture audit:**
1. Component structure & dependencies
2. Data flow patterns
3. Error handling & resilience
4. Performance characteristics
5. Security posture

**Technology assessment:**
1. Current usage patterns
2. Ecosystem maturity
3. Performance benchmarks
4. Developer experience
5. Migration / adoption costs

**Codebase health check:**
1. Test coverage & quality
2. Code complexity & duplication
3. Dependency freshness
4. Documentation completeness
5. Operational readiness
