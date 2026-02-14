import { GRAPHQL_POST, GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'
import config from '@payload-config'
import { getClientIp, graphqlRateLimiter, checkRateLimit } from '@/lib/rate-limit'

/**
 * Build a standardized rate limit error response
 */
function buildRateLimitResponse(rateLimit: {
  limit: number;
  remaining: number;
  reset: number;
}): Response {
  const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      reset: new Date(rateLimit.reset).toISOString(),
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "RateLimit-Limit": rateLimit.limit.toString(),
        "RateLimit-Remaining": rateLimit.remaining.toString(),
        "RateLimit-Reset": rateLimit.reset.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

/**
 * POST handler for GraphQL API with rate limiting.
 * Limits: 100 requests per hour per IP.
 */
export const POST = async (req: Request) => {
  // Rate limiting check
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(graphqlRateLimiter, ip);

  if (!rateLimit.success) {
    return buildRateLimitResponse(rateLimit);
  }

  // Call the original Payload GraphQL handler
  const response = await GRAPHQL_POST(config)(req);

  // Add rate limit headers to successful responses
  const headers = new Headers(response.headers);
  headers.set("RateLimit-Limit", rateLimit.limit.toString());
  headers.set("RateLimit-Remaining", rateLimit.remaining.toString());
  headers.set("RateLimit-Reset", rateLimit.reset.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * GET handler for GraphQL Playground (development only) with rate limiting.
 * Limits: 100 requests per hour per IP.
 */
export const GET = async (req: Request) => {
  // Production check for playground
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 });
  }

  // Rate limiting check (same as POST)
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(graphqlRateLimiter, ip);

  if (!rateLimit.success) {
    return buildRateLimitResponse(rateLimit);
  }

  // Call the original Payload GraphQL playground handler
  const response = await GRAPHQL_PLAYGROUND_GET(config)(req);

  // Add rate limit headers to successful responses
  const headers = new Headers(response.headers);
  headers.set("RateLimit-Limit", rateLimit.limit.toString());
  headers.set("RateLimit-Remaining", rateLimit.remaining.toString());
  headers.set("RateLimit-Reset", rateLimit.reset.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
