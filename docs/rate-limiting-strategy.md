# Rate Limiting Strategy

**Status**: Phase 1 implemented (GraphQL only). Phase 2 planned.
**Source of truth for numerics**: `src/lib/rate-limit.ts`

> `src/lib/rate-limit.ts:10` references this file via `@see`.

---

## Algorithm

[Upstash Redis](https://upstash.com/) with the `@upstash/ratelimit` library using the **sliding window** algorithm. Requests are counted within a rolling time window — no hard resets at fixed clock boundaries.

Production traffic goes through Upstash's HTTP Redis client (no persistent connections — suited for containerized and serverless runtimes alike). Development falls back to an in-memory `Map`-based limiter when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are absent.

---

## Limiters

Four `createRateLimiter` calls are exported from `src/lib/rate-limit.ts`. Notation mirrors the Upstash window-string form used in source.

| Symbol | Limit | Endpoint covered | Rationale |
|---|---|---|---|
| `graphqlRateLimiter` | `100, "1 h"` | `/api/graphql` | Prevent complex-query spam |
| `globalRateLimiter` | `1000, "1 h"` | `/api/*` general | General API protection |
| `authRateLimiter` | `5, "1 m"` | `/api/users/login` | Brute-force mitigation |
| `passwordResetRateLimiter` | `3, "1 h"` | `/api/users/forgot-password` | Reset-abuse mitigation |

Identifier for all limiters: client IP, extracted via `x-forwarded-for` → `x-real-ip` → `127.0.0.1` fallback (`getClientIp` in `src/lib/rate-limit.ts`).

---

## Response shape

**Headers** (IETF draft standard):

```
RateLimit-Limit: 100
RateLimit-Remaining: 98
RateLimit-Reset: <unix-ms>
```

**429 body**:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "limit": 100,
  "remaining": 0,
  "reset": "<ISO-8601>",
  "retryAfter": 3540
}
```

---

## Fail-open error handling

If the Upstash call throws, `checkRateLimit` catches the error, logs it, and returns `success: true` with sentinel values (`limit: -1`, `remaining: -1`, `reset: -1`). Rate limiting never becomes a hard dependency.

---

## Infrastructure

**Runtime**: Cloud Run container (Node.js). Rate limiting state is shared via Upstash Redis — no in-process state is relied on across container instances.

**Environment variables** (set as GitHub Actions secrets, injected into Cloud Run):

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash database endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash auth token |

In local development, omitting these variables activates the in-memory fallback automatically.

---

## Implementation status

**Phase 1 (complete)**: `graphqlRateLimiter` applied to `/api/graphql` route handler.

**Phase 2 (TODO)**: Apply remaining limiters via `src/middleware.ts` when auth endpoints are added.

---

## Ephemeral cache

`Ratelimit` is instantiated with `ephemeralCache: new Map()`. This in-process cache deduplicates Redis calls within a single request lifecycle, reducing round-trips by ~50–70% under sustained traffic.

---

## Related files

- `src/lib/rate-limit.ts` — canonical implementation
- `docs/rate-limiting-implementation.md` — deployment checklist and curl examples
