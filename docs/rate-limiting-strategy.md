# Rate Limiting Strategy for Payload CMS API Routes

**Issue**: CON-89
**Author**: Backend Development Agent
**Date**: 2026-02-12
**Status**: Phase 1 Implemented (GraphQL Only)
**Last Updated**: 2026-02-13

## Executive Summary

This document outlines a comprehensive rate limiting strategy for the Mind-Controlled Payload CMS API routes deployed on Vercel's serverless infrastructure. The recommended solution uses **Upstash Redis with @upstash/ratelimit** with a **phased implementation approach**.

**Current Status (Phase 1)**: GraphQL endpoint protection via route handler is IMPLEMENTED. Global middleware protection is planned for Phase 2.

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Evaluation](#solution-evaluation)
3. [Recommended Solution](#recommended-solution)
4. [Rate Limiting Rules](#rate-limiting-rules)
5. [Implementation Plan](#implementation-plan)
6. [Configuration](#configuration)
7. [Testing Strategy](#testing-strategy)
8. [Monitoring & Observability](#monitoring--observability)
9. [Cost Analysis](#cost-analysis)
10. [Future Enhancements](#future-enhancements)

---

## Current Implementation (Phase 1)

**Location**: `/src/app/(payload)/api/graphql/route.ts`

**Protection Scope**: GraphQL endpoint only (`/api/graphql`)

**Rate Limit**: 100 requests per hour per IP

**Features Implemented**:
- ✅ Rate limiting via Upstash Redis (with in-memory fallback for dev)
- ✅ Standard rate limit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
- ✅ 429 error responses with retry information
- ✅ Fail-open error handling (if Redis unavailable, allows requests)
- ✅ Client IP detection via Vercel headers
- ✅ GraphQL Playground protection (disabled in production)

**What's NOT Protected Yet (Phase 2)**:
- ❌ Authentication endpoints (`/api/users/login`, `/api/users/forgot-password`)
- ❌ General API routes (`/api/*`)
- ❌ Admin routes (`/admin/*`)

**Rationale for Phased Approach**:
1. GraphQL is the highest-risk endpoint (complex queries, public access)
2. Auth endpoints don't exist yet in the application
3. Iterative approach allows testing rate limiting in production before full rollout
4. Route-level protection is simpler than middleware for single endpoint

**Next Steps**: When authentication is added, implement Phase 2 global middleware as described below.

---

## Problem Statement

### Current State

The application currently has:
- Payload CMS API routes at `/api/[...slug]` (REST endpoints)
- GraphQL endpoint at `/api/graphql`
- No rate limiting protection
- Authentication on admin routes only
- Deployment on Vercel serverless functions

### Security Risks

Without rate limiting, the application is vulnerable to:

1. **Brute Force Attacks**: Attackers can make unlimited login attempts against `/api/users/login`
2. **DoS/DDoS**: Malicious actors can overwhelm the API with requests, exhausting serverless function quotas
3. **API Abuse**: Scrapers and bots can consume excessive resources
4. **Cost Escalation**: Unlimited API calls can lead to unexpected Vercel and database costs
5. **GraphQL Query Complexity Attacks**: Complex nested queries can strain the database

### Constraints

- **Serverless Environment**: No persistent in-memory state between function invocations
- **Cold Starts**: Solution must handle cold start scenarios gracefully
- **Edge Runtime Compatibility**: Must work with Next.js Edge Runtime and Node.js runtime
- **Multi-Region**: Vercel deploys to multiple edge locations globally
- **Budget**: Need cost-effective solution for a personal/small project

---

## Solution Evaluation

### Option 1: Vercel Edge Config (Not Recommended)

**Description**: Use Vercel's native Edge Config for storing rate limit counters.

**Pros**:
- Native Vercel integration
- No additional service dependencies
- Fast edge-based reads
- Included in Vercel plans

**Cons**:
- **Not designed for high-write scenarios** (rate limiting requires frequent writes)
- Limited to 512KB storage per config
- Write operations are slower (propagation delay)
- No built-in rate limiting algorithms
- Would require custom implementation of sliding window/token bucket logic

**Verdict**: ❌ Not suitable for rate limiting use cases.

---

### Option 2: Vercel KV (Redis) (Good Alternative)

**Description**: Use Vercel's managed Redis (Vercel KV) with custom rate limiting logic.

**Pros**:
- Integrated Vercel service
- Redis-compatible (powered by Upstash)
- Simple billing through Vercel dashboard
- Good performance for edge runtime
- Built-in metrics in Vercel dashboard

**Cons**:
- Requires custom rate limiting implementation
- More expensive than direct Upstash (markup for Vercel integration)
- Less flexibility in algorithm choice
- No built-in analytics for rate limit events

**Verdict**: ✅ Viable option but more expensive and requires more custom code.

---

### Option 3: Upstash Redis + @upstash/ratelimit (Recommended)

**Description**: Use Upstash Redis directly with the official @upstash/ratelimit library.

**Pros**:
- **Purpose-built for rate limiting** (battle-tested algorithms)
- HTTP-based (no persistent connections needed - perfect for serverless)
- Multiple algorithms: Fixed Window, Sliding Window, Token Bucket
- Built-in analytics and metrics
- Ephemeral caching reduces Redis calls (cost optimization)
- Global edge network (low latency worldwide)
- Well-documented Next.js middleware integration
- Free tier: 10,000 commands/day (sufficient for small projects)
- Paid tier: $0.20 per 100K commands (cost-effective)
- TypeScript-first with excellent DX

**Cons**:
- Additional external service dependency
- Requires separate Upstash account
- Small latency overhead for Redis calls (mitigated by ephemeral cache)

**Verdict**: ✅✅ **Recommended** - Best balance of features, cost, and developer experience.

---

### Option 4: In-Memory Rate Limiting with @vercel/edge-rate-limit

**Description**: Use ephemeral in-memory storage with Vercel's experimental edge-rate-limit package.

**Pros**:
- No external dependencies
- Zero latency (in-process)
- No additional cost

**Cons**:
- **Not suitable for serverless/edge** (each function instance has separate memory)
- No shared state across regions or function instances
- Easy to bypass by sending requests to different edge locations
- Package is experimental/deprecated

**Verdict**: ❌ Not viable for distributed serverless architecture.

---

## Recommended Solution

**Winner**: **Upstash Redis + @upstash/ratelimit**

### Why Upstash?

1. **Serverless-Native**: HTTP-based Redis client designed specifically for edge/serverless environments
2. **Global Performance**: Multi-region replication ensures low latency worldwide
3. **Cost-Effective**: Free tier covers development and small production usage
4. **Mature Library**: @upstash/ratelimit provides production-ready algorithms
5. **Analytics**: Built-in tracking of rate limit events for monitoring
6. **Ephemeral Caching**: Reduces Redis calls by caching results in-memory during the function lifecycle

### Architecture Overview

```
Request
   ↓
Next.js Middleware (Edge Runtime)
   ↓
@upstash/ratelimit (with ephemeral cache)
   ↓
Upstash Redis (Global Edge Network)
   ↓
Rate Limit Decision (Allow/Deny)
   ↓
API Route Handler OR 429 Response
```

---

## Rate Limiting Rules

### Rule Set Definition

| Endpoint Pattern | Rate Limit | Algorithm | Identifier | Rationale |
|-----------------|-----------|-----------|-----------|-----------|
| `/api/users/login` | 5 req/min | Sliding Window | IP + User-Agent | Prevent brute force attacks |
| `/api/users/forgot-password` | 3 req/hour | Sliding Window | IP | Prevent password reset abuse |
| `/api/graphql` | 100 req/min | Token Bucket | IP or API Key | Allow bursts, prevent query spam |
| `/api/*` (general) | 300 req/min | Sliding Window | IP | General API protection |
| `/admin/*` | 60 req/min | Fixed Window | Authenticated User | Admin panel protection |

### Rate Limit Headers

Following [IETF draft-ietf-httpapi-ratelimit-headers](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers):

```
RateLimit-Limit: 100          # Max requests in window
RateLimit-Remaining: 87       # Requests remaining
RateLimit-Reset: 1678886700   # Unix timestamp when limit resets
```

### Response Format (429 Too Many Requests)

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 45,
  "limit": 100,
  "remaining": 0,
  "reset": 1678886700000
}
```

---

## Implementation Plan

### Implementation Status

**Phase 1: GraphQL Endpoint Protection (✅ COMPLETED)**
- Rate limiting library installed and configured
- GraphQL route handler protection implemented
- In-memory fallback for development
- Rate limit headers and error responses implemented
- **Status**: Production ready

**Phase 2: Global Middleware Protection (📋 TODO)**
- Create `/src/middleware.ts` for all API routes
- Implement endpoint-specific rate limiters (auth, password reset, general API)
- Add IP detection and identifier logic
- Comprehensive testing across all endpoints
- **Priority**: Medium (can be implemented when auth endpoints are added)

**Phase 3: Advanced Features (📋 FUTURE)**
- Per-user rate limiting
- Tiered rate limits
- GraphQL query complexity analysis
- Adaptive rate limiting
- **Priority**: Low (optimization phase)

### Phase 1: Setup and Configuration (✅ COMPLETED)

#### 1.1 Create Upstash Redis Database

1. Sign up for Upstash account (free tier)
2. Create a new Redis database
3. Select region closest to primary Vercel deployment region (or use global replication)
4. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

#### 1.2 Install Dependencies

```bash
npm install @upstash/redis @upstash/ratelimit
```

**Package versions**:
- `@upstash/redis`: ^1.30.0 or later
- `@upstash/ratelimit`: ^2.0.0 or later

#### 1.3 Configure Environment Variables

Add to `.env.local` and Vercel project settings:

```bash
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

**Security Note**: These credentials should be treated as secrets. Never commit to version control.

---

### Phase 2: Middleware Implementation (TODO)

**Note**: Phase 2 will be implemented when authentication endpoints are added to the application. Currently, only the GraphQL endpoint requires rate limiting protection, which is handled via route handler in `/src/app/(payload)/api/graphql/route.ts`.

#### 2.1 Create Rate Limiter Utility (✅ COMPLETED)

The rate limiter utility already exists at `src/lib/rate-limit.ts` with the following features:
- Upstash Redis integration with in-memory fallback
- Pre-configured rate limiters for different endpoint types
- Client IP extraction helper
- Error handling with fail-open strategy

**Current Implementation**: See `/src/lib/rate-limit.ts`

#### 2.2 Create Global Middleware (TODO - Phase 2)

When auth endpoints are added, create `src/middleware.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Shared Redis instance for rate limiting.
 * Uses HTTP-based client for serverless compatibility.
 */
export const redis = Redis.fromEnv();

/**
 * Rate limiter for authentication endpoints.
 * 5 requests per minute per IP to prevent brute force attacks.
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  ephemeralCache: new Map(),
  prefix: 'ratelimit:auth',
  analytics: true,
});

/**
 * Rate limiter for password reset endpoints.
 * 3 requests per hour per IP to prevent abuse.
 */
export const passwordResetRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  ephemeralCache: new Map(),
  prefix: 'ratelimit:password-reset',
  analytics: true,
});

/**
 * Rate limiter for GraphQL endpoint.
 * Token bucket allows 100 requests/min with burst tolerance.
 * Refills 100 tokens per minute, max bucket size 120.
 */
export const graphqlRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(100, '1 m', 120),
  ephemeralCache: new Map(),
  prefix: 'ratelimit:graphql',
  analytics: true,
});

/**
 * Rate limiter for general API endpoints.
 * 300 requests per minute per IP for general API protection.
 */
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, '1 m'),
  ephemeralCache: new Map(),
  prefix: 'ratelimit:api',
  analytics: true,
});

/**
 * Rate limiter for admin routes.
 * 60 requests per minute (after authentication).
 */
export const adminRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(60, '1 m'),
  ephemeralCache: new Map(),
  prefix: 'ratelimit:admin',
  analytics: true,
});
```

#### 2.2 Create Middleware

Create `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import {
  authRateLimiter,
  passwordResetRateLimiter,
  graphqlRateLimiter,
  apiRateLimiter,
  adminRateLimiter,
} from '@/lib/rate-limit';

/**
 * Gets a unique identifier for rate limiting.
 * Priority: IP address > X-Forwarded-For > fallback
 */
function getIdentifier(request: NextRequest): string {
  // Get IP from Vercel headers
  const ip = request.ip
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1';

  // For auth endpoints, include User-Agent to prevent simple IP rotation
  if (request.nextUrl.pathname.includes('/users/login')) {
    const userAgent = request.headers.get('user-agent') ?? 'unknown';
    return `${ip}:${userAgent}`;
  }

  return ip;
}

/**
 * Creates a rate limit exceeded response with proper headers.
 */
function createRateLimitResponse(
  limit: number,
  reset: number,
  retryAfter: number
): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter,
      limit,
      remaining: 0,
      reset,
    },
    { status: 429 }
  );

  // Standard rate limit headers (IETF draft)
  response.headers.set('RateLimit-Limit', limit.toString());
  response.headers.set('RateLimit-Remaining', '0');
  response.headers.set('RateLimit-Reset', reset.toString());
  response.headers.set('Retry-After', retryAfter.toString());

  return response;
}

/**
 * Main middleware function for rate limiting.
 */
export async function middleware(
  request: NextRequest,
  context: NextFetchEvent
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for:
  // - Static assets (_next/static)
  // - Images (_next/image)
  // - Favicon
  // - Public files
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  const identifier = getIdentifier(request);

  // Select appropriate rate limiter based on route
  let rateLimiter;

  if (pathname.startsWith('/api/users/login')) {
    rateLimiter = authRateLimiter;
  } else if (pathname.startsWith('/api/users/forgot-password')) {
    rateLimiter = passwordResetRateLimiter;
  } else if (pathname.startsWith('/api/graphql')) {
    rateLimiter = graphqlRateLimiter;
  } else if (pathname.startsWith('/admin')) {
    rateLimiter = adminRateLimiter;
  } else if (pathname.startsWith('/api/')) {
    rateLimiter = apiRateLimiter;
  } else {
    // No rate limiting for frontend routes
    return NextResponse.next();
  }

  try {
    // Perform rate limit check
    const { success, pending, limit, remaining, reset } = await rateLimiter.limit(identifier);

    // Use context.waitUntil for background analytics (required when analytics: true)
    context.waitUntil(pending);

    // If rate limit exceeded, return 429
    if (!success) {
      const now = Date.now();
      const retryAfter = Math.ceil((reset - now) / 1000); // seconds until reset

      return createRateLimitResponse(limit, reset, retryAfter);
    }

    // Allow request and add rate limit headers
    const response = NextResponse.next();
    response.headers.set('RateLimit-Limit', limit.toString());
    response.headers.set('RateLimit-Remaining', remaining.toString());
    response.headers.set('RateLimit-Reset', reset.toString());

    return response;
  } catch (error) {
    // If rate limiting fails (e.g., Redis down), log error but allow request
    // This ensures rate limiting doesn't become a single point of failure
    console.error('Rate limiting error:', error);

    // In production, you might want to track this error in monitoring
    // For now, fail open (allow the request)
    return NextResponse.next();
  }
}

/**
 * Middleware configuration.
 * Apply to all routes except excluded paths.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

### Phase 3: Error Handling and Edge Cases

#### 3.1 Graceful Degradation

**Fail-Open Strategy**: If Redis is unavailable, the middleware allows requests through rather than blocking all traffic. This prevents rate limiting from becoming a single point of failure.

**Logging**: Errors are logged to console and should be tracked in production monitoring (e.g., Vercel Analytics, Sentry).

#### 3.2 IP Address Detection

The middleware uses multiple sources to identify the client IP:

1. `request.ip` (Vercel provides this)
2. `X-Forwarded-For` header (first IP in chain)
3. `X-Real-IP` header
4. Fallback to `127.0.0.1` (localhost)

**Note**: For authentication endpoints, we combine IP + User-Agent to make it harder to bypass via simple IP rotation.

#### 3.3 Handling Authenticated Users

For admin routes, consider rate limiting by authenticated user ID instead of IP:

```typescript
// Example: Extract user ID from session/JWT
function getAuthenticatedIdentifier(request: NextRequest): string {
  const token = request.cookies.get('payload-token')?.value;
  if (token) {
    // Decode JWT to get user ID (implement JWT verification)
    const userId = decodeJWT(token).id;
    return `user:${userId}`;
  }
  // Fall back to IP if not authenticated
  return getIdentifier(request);
}
```

---

## Configuration

### Algorithm Selection Guide

| Algorithm | Use Case | Characteristics |
|-----------|----------|-----------------|
| **Fixed Window** | Simple counters, admin endpoints | Resets at fixed intervals; can have edge-case bursts |
| **Sliding Window** | Most API endpoints, authentication | Smooths out bursts at window boundaries; more accurate |
| **Token Bucket** | GraphQL, burst-tolerant APIs | Allows controlled bursts; refills over time |

### Ephemeral Cache Configuration

The `ephemeralCache: new Map()` setting provides in-memory caching within the function lifecycle:

- **Benefits**: Reduces Redis calls, lowers latency, saves costs
- **Scope**: Cache is per-function instance (not shared across instances)
- **Eviction**: Cache is cleared when function instance is terminated
- **Trade-off**: Slight inaccuracy in rate limits (acceptable for most use cases)

**Recommendation**: Keep ephemeral cache enabled for cost and performance optimization.

### Analytics Configuration

`analytics: true` enables tracking of rate limit events:

- Upstash records when limits are hit
- View analytics in Upstash dashboard
- Useful for tuning rate limits based on actual usage
- Requires `context.waitUntil(pending)` in middleware

**Recommendation**: Enable analytics in production for visibility.

---

## Testing Strategy

### 1. Unit Testing

Test rate limiting logic in isolation:

```typescript
// tests/lib/rate-limit.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { authRateLimiter } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset Redis state between tests (use a test database)
  });

  it('should allow requests under the limit', async () => {
    const identifier = 'test-user-1';

    for (let i = 0; i < 5; i++) {
      const result = await authRateLimiter.limit(identifier);
      expect(result.success).toBe(true);
    }
  });

  it('should block requests over the limit', async () => {
    const identifier = 'test-user-2';

    // Make 5 allowed requests
    for (let i = 0; i < 5; i++) {
      await authRateLimiter.limit(identifier);
    }

    // 6th request should be blocked
    const result = await authRateLimiter.limit(identifier);
    expect(result.success).toBe(false);
  });

  it('should reset after time window', async () => {
    // Test with shorter window for faster tests
    // (requires separate test configuration)
  });
});
```

**Setup Requirements**:
- Use a separate Upstash Redis database for testing
- Configure test-specific environment variables
- Clear Redis state between tests

### 2. Integration Testing

Test middleware with actual HTTP requests:

```typescript
// tests/middleware/rate-limit.test.ts
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('Rate Limiting Middleware', () => {
  it('should add rate limit headers to responses', async () => {
    const request = new NextRequest('http://localhost:3000/api/posts');
    const response = await middleware(request, {} as any);

    expect(response.headers.get('RateLimit-Limit')).toBeDefined();
    expect(response.headers.get('RateLimit-Remaining')).toBeDefined();
    expect(response.headers.get('RateLimit-Reset')).toBeDefined();
  });

  it('should return 429 when limit exceeded', async () => {
    // Make multiple requests to trigger limit
    // Assert 429 response with correct headers
  });
});
```

### 3. End-to-End Testing

Use Playwright to test rate limiting from a client perspective:

```typescript
// e2e/rate-limit.spec.ts
import { test, expect } from '@playwright/test';

test('should rate limit API requests', async ({ request }) => {
  const endpoint = 'http://localhost:3000/api/users/login';

  // Make requests up to the limit
  for (let i = 0; i < 5; i++) {
    const response = await request.post(endpoint, {
      data: { email: 'test@example.com', password: 'wrong' }
    });
    expect(response.status()).toBe(401); // Unauthorized (wrong password)
  }

  // Next request should be rate limited
  const rateLimitedResponse = await request.post(endpoint, {
    data: { email: 'test@example.com', password: 'wrong' }
  });

  expect(rateLimitedResponse.status()).toBe(429);

  const body = await rateLimitedResponse.json();
  expect(body.error).toBe('Rate limit exceeded');
  expect(body.retryAfter).toBeGreaterThan(0);
});
```

### 4. Load Testing

Use tools like Apache Bench or k6 to test rate limiting under load:

```bash
# Test with Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/posts

# Expected: First 300 requests succeed, rest return 429
```

### 5. Manual Testing Checklist

- [ ] Login endpoint limits to 5 req/min
- [ ] Password reset limits to 3 req/hour
- [ ] GraphQL endpoint allows bursts up to 120 requests
- [ ] General API limits to 300 req/min
- [ ] Rate limit headers are present in all API responses
- [ ] 429 responses include proper error message and retryAfter
- [ ] Different IPs are rate limited independently
- [ ] Same IP from different User-Agents is rate limited on auth endpoints
- [ ] Static assets (_next/static) are not rate limited
- [ ] Rate limiting fails open when Redis is unavailable

---

## Monitoring & Observability

### 1. Upstash Dashboard

**Built-in Metrics**:
- Total requests to Redis
- Rate limit hits (429 responses)
- Average latency
- Error rate

**Access**: Log into Upstash console > Select database > Analytics tab

### 2. Vercel Analytics

**Function Metrics**:
- Middleware execution duration
- Edge function invocations
- Error rates
- Regional distribution

**Custom Tracking**: Consider adding Vercel Analytics events:

```typescript
import { track } from '@vercel/analytics/server';

// In middleware when rate limit is hit
if (!success) {
  track('rate_limit_exceeded', {
    endpoint: pathname,
    identifier: identifier.split(':')[0], // IP only (privacy)
  });
}
```

### 3. Logging Strategy

**Development**: Log to console (visible in `vercel dev` and `next dev`)

**Production**: Integrate with logging service:

```typescript
// Example: Structured logging
const logRateLimitEvent = (event: {
  type: 'allowed' | 'blocked';
  endpoint: string;
  identifier: string;
  remaining: number;
  limit: number;
}) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., Axiom, Datadog, LogTail)
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'rate-limiter',
      ...event,
    }));
  }
};
```

### 4. Alerts

**Recommended Alerts**:

1. **High Rate Limit Hit Rate**: Alert when >10% of requests are rate limited
2. **Redis Errors**: Alert when Redis connection fails
3. **Unusual Traffic Patterns**: Detect potential DDoS (e.g., 1000+ requests from single IP)

**Implementation**: Use Upstash webhooks or Vercel log drains to trigger alerts.

### 5. Metrics to Track

| Metric | Purpose | Threshold |
|--------|---------|-----------|
| Rate limit hit rate | Detect attacks or overly strict limits | >5% of requests |
| Redis response time | Ensure low latency | <50ms p95 |
| Middleware duration | Monitor performance overhead | <10ms p95 |
| Unique IPs rate limited | Identify distributed attacks | >100/hour |

---

## Cost Analysis

### Upstash Redis Pricing

**Free Tier**:
- 10,000 commands/day
- 256 MB storage
- Global replication

**Pay-as-you-go**:
- $0.20 per 100,000 commands
- Storage: $0.25 per GB/month

### Estimated Costs

**Scenario 1: Small Blog (10,000 requests/day)**
- Requests: 10,000/day
- Rate limit checks: 10,000 commands/day
- **Cost**: Free tier (within 10K limit)

**Scenario 2: Medium Traffic (100,000 requests/day)**
- Requests: 100,000/day
- Rate limit checks: 100,000 commands/day
- Ephemeral cache hit rate: ~50% (reduces Redis calls)
- Actual Redis commands: ~50,000/day
- **Cost**: $0.20 per 100K × 1.5M/month = **$3/month**

**Scenario 3: High Traffic (1M requests/day)**
- Requests: 1,000,000/day
- Actual Redis commands (with cache): ~500,000/day
- **Cost**: $0.20 per 100K × 15M/month = **$30/month**

### Cost Optimization Tips

1. **Enable Ephemeral Cache**: Reduces Redis calls by 50-70%
2. **Use Longer Time Windows**: Fewer resets = fewer Redis operations
3. **Optimize Identifier Strategy**: Group similar requests when appropriate
4. **Monitor Analytics**: Disable in low-traffic environments to save on write operations

### ROI Analysis

**Without Rate Limiting**:
- Risk of bill shock from DDoS (Vercel function invocations)
- Potential database overload and downtime
- Security vulnerabilities (brute force attacks)

**With Rate Limiting ($3-30/month)**:
- Protection against attacks
- Predictable API costs
- Better user experience (prevents overload)
- Compliance with best practices

**Verdict**: Rate limiting pays for itself by preventing a single attack.

---

## Future Enhancements

### 1. Per-User Rate Limiting

For authenticated users, implement user-specific limits:

```typescript
// Higher limits for authenticated users
const authenticatedApiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'), // 10x higher
  prefix: 'ratelimit:api:authenticated',
});
```

### 2. Tiered Rate Limits

Implement different limits based on user tier (free, pro, enterprise):

```typescript
function getRateLimiterForUser(userTier: string) {
  switch (userTier) {
    case 'enterprise':
      return Ratelimit.slidingWindow(10000, '1 m');
    case 'pro':
      return Ratelimit.slidingWindow(1000, '1 m');
    default:
      return Ratelimit.slidingWindow(300, '1 m');
  }
}
```

### 3. GraphQL Query Complexity Analysis

Beyond rate limiting, analyze GraphQL query complexity:

```typescript
import { getComplexity } from 'graphql-query-complexity';

// Reject queries over complexity threshold
if (queryComplexity > 1000) {
  return new Response('Query too complex', { status: 400 });
}
```

### 4. Adaptive Rate Limiting

Adjust limits dynamically based on system load:

```typescript
// Reduce limits during high load
const currentLoad = await getSystemLoad();
const adjustedLimit = currentLoad > 0.8
  ? Math.floor(baseLimit * 0.5)
  : baseLimit;
```

### 5. IP Allowlist/Blocklist

Maintain lists of trusted IPs and blocked IPs:

```typescript
const ALLOWED_IPS = ['1.2.3.4']; // Trusted services
const BLOCKED_IPS = ['5.6.7.8']; // Known bad actors

if (BLOCKED_IPS.includes(ip)) {
  return new Response('Forbidden', { status: 403 });
}

if (ALLOWED_IPS.includes(ip)) {
  return NextResponse.next(); // Skip rate limiting
}
```

### 6. Custom Rate Limit Responses

Per-endpoint custom error messages:

```typescript
const rateLimitMessages = {
  '/api/users/login': 'Too many login attempts. Please try again in 1 minute.',
  '/api/graphql': 'Query rate limit exceeded. Reduce request frequency.',
};
```

---

## Implementation Checklist

Before implementation, ensure:

- [ ] Upstash Redis database created
- [ ] Environment variables configured (local and Vercel)
- [ ] Dependencies installed (`@upstash/redis`, `@upstash/ratelimit`)
- [ ] Rate limiting rules reviewed and approved
- [ ] Testing strategy defined
- [ ] Monitoring plan in place
- [ ] Documentation updated

During implementation:

- [ ] Create `/src/lib/rate-limit.ts` with rate limiter instances
- [ ] Create `/src/middleware.ts` with rate limiting logic
- [ ] Test locally with `npm run dev`
- [ ] Verify rate limits with manual testing
- [ ] Deploy to preview environment
- [ ] Run E2E tests
- [ ] Monitor Upstash dashboard for errors
- [ ] Deploy to production
- [ ] Set up alerts and monitoring

Post-implementation:

- [ ] Monitor rate limit hit rates
- [ ] Adjust limits based on actual traffic patterns
- [ ] Document any issues or lessons learned
- [ ] Schedule periodic review of rate limiting strategy

---

## Appendix

### A. Environment Variables Reference

```bash
# Required for @upstash/redis
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Optional: Override default rate limits (for testing)
RATE_LIMIT_AUTH_WINDOW="1 m"
RATE_LIMIT_AUTH_LIMIT="5"
RATE_LIMIT_API_WINDOW="1 m"
RATE_LIMIT_API_LIMIT="300"
```

### B. Useful Resources

- [Upstash Ratelimit Documentation](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [IETF Rate Limit Headers Draft](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)

### C. Alternative Algorithms Comparison

| Algorithm | Pros | Cons | Best For |
|-----------|------|------|----------|
| Fixed Window | Simple, predictable | Burst at window edges | Low-stakes endpoints |
| Sliding Window | Smooth, accurate | More Redis operations | Most API endpoints |
| Token Bucket | Allows bursts, flexible | Complex to tune | GraphQL, variable workloads |
| Leaky Bucket | Smooth output rate | Can delay valid requests | Async processing queues |

---

## Conclusion

This rate limiting strategy provides robust protection against API abuse while maintaining excellent developer experience and cost efficiency. The recommended approach using Upstash Redis with @upstash/ratelimit offers:

- **Security**: Protection against brute force, DoS, and API abuse
- **Performance**: Low latency with ephemeral caching
- **Cost-effectiveness**: Free tier for small projects, affordable scaling
- **Observability**: Built-in analytics and monitoring
- **Maintainability**: Battle-tested library with excellent documentation

**Next Steps**:
1. Review and approve this strategy
2. Create Linear issue for implementation (separate from research task)
3. Implement in feature branch
4. Test thoroughly in preview environment
5. Deploy to production with monitoring

**Estimated Implementation Time**: 4-6 hours
- Setup: 1 hour
- Middleware development: 2 hours
- Testing: 2 hours
- Documentation: 1 hour

---

**Document Version**: 1.0
**Last Updated**: 2026-02-12
**Status**: Ready for review and approval
