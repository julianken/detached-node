# Rate Limiting Implementation

**Issue**: CON-89
**Author**: Backend Development Agent
**Date**: 2026-02-13
**Status**: Implemented

## Overview

Rate limiting has been successfully implemented for the Mind-Controlled API using a hybrid approach with Upstash Redis for production and an in-memory fallback for development.

## Implementation Details

### Files Created/Modified

1. **`/Users/j/repos/mind-controlled/src/lib/rate-limit.ts`**
   - Core rate limiting module
   - Implements both Upstash Redis and in-memory rate limiters
   - Provides rate limiter instances for different endpoints:
     - `graphqlRateLimiter`: 100 requests/hour
     - `globalRateLimiter`: 1000 requests/hour
     - `authRateLimiter`: 5 requests/minute
     - `passwordResetRateLimiter`: 3 requests/hour

2. **`/Users/j/repos/mind-controlled/src/app/(payload)/api/graphql/route.ts`**
   - Applied rate limiting to GraphQL API endpoints
   - Both GET (playground) and POST (queries) handlers protected
   - Returns proper 429 responses when rate limit exceeded
   - Adds rate limit headers to all responses

### Rate Limiting Strategy

#### Upstash Redis (Production)
When `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables are present:
- Uses Upstash Redis with sliding window algorithm
- Ephemeral caching reduces Redis calls by ~50-70%
- Analytics enabled for monitoring
- Shared state across all serverless function instances

#### In-Memory Fallback (Development)
When Upstash credentials are not available:
- Uses Map-based in-memory storage
- Per-instance state (not shared across function instances)
- Periodic cleanup of expired entries
- Logs warning about using fallback mode

### Rate Limit Headers

All API responses include rate limit information following the IETF draft standard:

```
RateLimit-Limit: 100           # Maximum requests in window
RateLimit-Remaining: 98        # Requests remaining in window
RateLimit-Reset: 1770970590228 # Unix timestamp when limit resets
```

### 429 Response Format

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "limit": 100,
  "remaining": 0,
  "reset": "2026-02-13T08:16:30.228Z",
  "retryAfter": 3540
}
```

Headers:
```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1770970590228
Retry-After: 3540
```

## Testing

### Manual Testing

Test rate limiting with curl:

```bash
# Make a request and check headers
curl -i -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ Posts { docs { id } } }"}'

# Expected headers in response:
# ratelimit-limit: 100
# ratelimit-remaining: 99
# ratelimit-reset: [unix timestamp]
```

### Test Script

A test script has been created at `/Users/j/repos/mind-controlled/scripts/test-rate-limit.ts`:

```bash
# Start dev server
npm run dev

# In another terminal
npx tsx scripts/test-rate-limit.ts
```

### Testing 429 Response

To test rate limit exceeded behavior:

1. Temporarily reduce the limit in `src/lib/rate-limit.ts`:
```typescript
export const graphqlRateLimiter = createRateLimiter(
  3,  // Changed from 100 to 3 for testing
  "1 h",
  "ratelimit:graphql"
);
```

2. Make multiple requests to trigger the limit
3. Verify 429 response with proper headers

## Error Handling

### Fail-Open Strategy

If rate limiting fails (e.g., Redis connection error):
- Request is allowed through
- Error is logged to console
- Rate limiting doesn't become a single point of failure

```typescript
if (!rateLimit.success) {
  // Log error but allow request
  console.error("[RATE_LIMIT_ERROR]", { error, identifier });
  return { success: true, limit: 0, remaining: 0, reset: 0 };
}
```

### Graceful Degradation

1. **No Upstash credentials**: Falls back to in-memory rate limiting
2. **Redis connection failure**: Logs error, allows request
3. **Invalid response**: Logs error, allows request

## Environment Variables

Add to `.env.local` for production-like testing:

```bash
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

In development without these variables, the system automatically uses in-memory fallback.

## Deployment Checklist

Before deploying to production:

- [ ] Set up Upstash Redis database
- [ ] Add `UPSTASH_REDIS_REST_URL` to Vercel environment variables
- [ ] Add `UPSTASH_REDIS_REST_TOKEN` to Vercel environment variables
- [ ] Test rate limiting in preview deployment
- [ ] Monitor Upstash dashboard for rate limit analytics
- [ ] Set up alerts for high rate limit hit rates

## Monitoring

### Development
- Console warnings show which rate limiter is active
- Request logs show IP addresses being rate limited
- Rate limit headers visible in browser DevTools

### Production (with Upstash)
- Upstash dashboard shows rate limit analytics
- Track 429 response rates via Vercel Analytics
- Monitor Redis command usage for cost tracking

## Performance Impact

- **Latency overhead**: ~10-50ms per request (Redis round-trip)
- **Ephemeral cache**: Reduces Redis calls, improves latency
- **Cost**: ~$3-30/month depending on traffic (see strategy doc)

## Future Enhancements

Following the rate limiting strategy document:

1. **Per-user rate limiting**: Higher limits for authenticated users
2. **Tiered rate limits**: Different limits based on user tier
3. **GraphQL query complexity**: Reject overly complex queries
4. **Adaptive rate limiting**: Adjust based on system load
5. **IP allowlist/blocklist**: Trusted IPs bypass limits, blocked IPs rejected
6. **Custom error messages**: Per-endpoint messages

## Related Documents

- `/Users/j/repos/mind-controlled/docs/rate-limiting-strategy.md` - Comprehensive strategy
- `/Users/j/repos/mind-controlled/scripts/test-rate-limit.ts` - Test script

## Verification Status

✅ Implementation complete
✅ In-memory fallback working (development)
✅ Rate limit headers added to responses
✅ 429 responses implemented
✅ Error handling (fail-open strategy)
⏳ Production testing with Upstash (pending credentials)
⏳ Load testing (pending)
⏳ Monitoring setup (pending)

## Notes

- The implementation follows the IETF draft for rate limit headers
- All rate limiters use sliding window algorithm for better accuracy
- GraphQL endpoint uses the same rate limiter for both GET and POST
- Rate limiting is applied before the Payload handler, preventing unnecessary processing
- Response headers are preserved when wrapping Payload's handlers
