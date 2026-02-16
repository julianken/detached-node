import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting configuration for Detached Node API routes.
 *
 * Uses Upstash Redis for production rate limiting with in-memory fallback
 * for development when Redis credentials are not available.
 *
 * @see docs/rate-limiting-strategy.md
 */

// Check if Upstash Redis credentials are available
const hasUpstashCredentials = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

/**
 * In-memory rate limiter for development/testing.
 * Not suitable for production as state is not shared across function instances.
 */
class InMemoryRateLimiter {
  private storage = new Map<string, { count: number; resetAt: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.maxRequests = limit;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    pending: Promise<unknown>;
  }> {
    const now = Date.now();
    const record = this.storage.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      const keysToDelete: string[] = [];
      this.storage.forEach((value, key) => {
        if (value.resetAt < now) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.storage.delete(key));
    }

    if (!record || record.resetAt < now) {
      // New window
      this.storage.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
        pending: Promise.resolve(),
      };
    }

    // Within window
    record.count++;
    const success = record.count <= this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - record.count);

    return {
      success,
      limit: this.maxRequests,
      remaining,
      reset: record.resetAt,
      pending: Promise.resolve(),
    };
  }
}

/**
 * Creates a rate limiter instance.
 * Uses Upstash Redis in production, in-memory fallback in development.
 */
function createRateLimiter(
  requests: number,
  window: `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`,
  prefix: string
): Ratelimit | InMemoryRateLimiter {
  if (hasUpstashCredentials) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      ephemeralCache: new Map(),
      prefix,
      analytics: true,
    });
  } else {
    // In-memory fallback for development
    console.warn(`[RATE_LIMIT] Using in-memory rate limiter for ${prefix} (Upstash credentials not found)`);

    // Convert window string to milliseconds
    const windowMs = window.endsWith('m')
      ? parseInt(window) * 60 * 1000
      : parseInt(window) * 60 * 60 * 1000;

    return new InMemoryRateLimiter(requests, windowMs);
  }
}

/**
 * Rate limiter for GraphQL endpoint.
 * 100 requests per hour per IP to prevent query spam.
 */
export const graphqlRateLimiter = createRateLimiter(
  100,
  "1 h",
  "ratelimit:graphql"
);

/**
 * Rate limiter for general API endpoints.
 * 1000 requests per hour per IP for general API protection.
 */
export const globalRateLimiter = createRateLimiter(
  1000,
  "1 h",
  "ratelimit:global"
);

/**
 * Rate limiter for authentication endpoints.
 * 5 requests per minute per IP to prevent brute force attacks.
 */
export const authRateLimiter = createRateLimiter(
  5,
  "1 m",
  "ratelimit:auth"
);

/**
 * Rate limiter for password reset endpoints.
 * 3 requests per hour per IP to prevent abuse.
 */
export const passwordResetRateLimiter = createRateLimiter(
  3,
  "1 h",
  "ratelimit:password-reset"
);

/**
 * Helper function to get client IP from request.
 * Extracts IP from Vercel headers with fallback chain.
 */
export function getClientIp(request: Request): string {
  // Try x-forwarded-for first (Vercel provides this)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Try x-real-ip
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for development
  return "127.0.0.1";
}

/**
 * Rate limit check function with logging and error handling.
 *
 * @param rateLimiter - The rate limiter instance to use
 * @param identifier - The identifier to rate limit (usually IP address)
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  rateLimiter: Ratelimit | InMemoryRateLimiter,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const result = await rateLimiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    // This ensures rate limiting doesn't become a single point of failure
    console.error("[RATE_LIMIT_ERROR]", { error, identifier });

    return {
      success: true,
      limit: -1,      // -1 indicates unlimited (fail-open mode)
      remaining: -1,  // -1 indicates unlimited
      reset: -1,      // -1 indicates no reset time
    };
  }
}
