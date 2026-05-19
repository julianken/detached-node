// src/lib/robots-config.ts
//
// Canonical bot list for robots.txt. Each entry becomes a named
// User-Agent block in the rendered robots.txt with the same access
// rules as the wildcard fallback (`Allow: /`, `Disallow: /admin`,
// `Disallow: /api`). Named blocks signal *intent* to AI vendors and
// search engines, even though the effective access is unchanged from
// the wildcard.
//
// See issue #417 for rationale and the Microsoft Clarity AI-visibility
// guidance this list draws from.

/**
 * Paths every crawler — named or wildcard — must avoid.
 */
export const DISALLOWED_PATHS = ["/admin", "/api"] as const;

/**
 * AI grounding and training crawlers. Explicit allow signals that this
 * site welcomes AI ingestion and citation; flipping any entry to a
 * disallow later is a clean per-bot opt-out path.
 */
export const AI_BOT_USER_AGENTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "ClaudeBot",
  "anthropic-ai",
  "Claude-User",
  "Claude-SearchBot",
  // Google (AI training surface, distinct from Googlebot search)
  "Google-Extended",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Common Crawl (feeds many training corpora)
  "CCBot",
  // Apple Intelligence
  "applebot-extended",
  // Meta AI / Llama
  "Meta-ExternalAgent",
  // Amazon AI crawlers
  "Amazonbot",
] as const;

/**
 * Traditional search crawlers. Explicit allow makes the named-block
 * pattern consistent across AI + search and gives a single place to
 * adjust per-engine rules if ever needed.
 */
export const SEARCH_BOT_USER_AGENTS = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
] as const;

/**
 * All named user-agents emitted in robots.txt, in deterministic order
 * (AI bots first, search bots second). Used by `src/app/robots.ts`.
 */
export const NAMED_BOT_USER_AGENTS = [
  ...AI_BOT_USER_AGENTS,
  ...SEARCH_BOT_USER_AGENTS,
] as const;

export type RobotsRule = {
  userAgent: string;
  allow: string;
  disallow: string[];
};

/**
 * Build the rules array for `MetadataRoute.Robots`. Each named bot gets
 * its own block, and a final wildcard block catches any unnamed
 * crawler. All blocks share the same access rules; the only reason to
 * name a bot is to signal intent and provide a per-bot flip point.
 */
export function buildRobotsRules(): RobotsRule[] {
  const disallow = [...DISALLOWED_PATHS];
  const namedRules: RobotsRule[] = NAMED_BOT_USER_AGENTS.map((userAgent) => ({
    userAgent,
    allow: "/",
    disallow,
  }));
  const wildcardRule: RobotsRule = {
    userAgent: "*",
    allow: "/",
    disallow,
  };
  return [...namedRules, wildcardRule];
}
