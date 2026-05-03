/**
 * check-affiliate-links.ts
 *
 * Refuses to ship pattern references whose URLs carry affiliate / tracking
 * query parameters. Editorial principle: zero affiliate links anywhere in the
 * catalog. Even an Amazon "tag=detachednode-20" would compromise the "we
 * actually read the book" claim.
 *
 * Coverage (per issue #154):
 *   - tag, ref, aff, linkCode, via, partner, affiliate, affid, aff_id,
 *     partnerid, utm_source_aff
 *   - irclickid, clickid, cjevent (Commission Junction)
 *   - awc (AWIN), afftrack, sscid (ShareASale)
 *   - ascsubtag, linkId, pf_rd_*, pd_rd_* (Amazon variants)
 *   - mc_cid, mc_eid (Mailchimp)
 *
 * Plus: hard-reject known URL-shortener domains. A shortener can hide an
 * affiliate redirect, and we don't have time to HEAD-unwrap every link.
 *
 * Scope: every Reference url AND every realWorldExamples[*].sourceUrl AND every
 * readerGotcha.sourceUrl across all non-archived patterns.
 *
 * Usage:  tsx scripts/check-affiliate-links.ts
 * Exit:   0 on success, 1 on first violation.
 */

import { PATTERNS } from '../src/data/agentic-design-patterns/index.js'

// Exact-match parameter names that always indicate an affiliate / tracker.
const FORBIDDEN_PARAMS_EXACT = new Set<string>([
  'tag',
  'ref',
  'aff',
  'linkcode',
  'via',
  'partner',
  'affiliate',
  'affid',
  'aff_id',
  'partnerid',
  'utm_source_aff',
  'irclickid',
  'clickid',
  'cjevent',
  'awc',
  'afftrack',
  'sscid',
  'ascsubtag',
  'linkid',
  'mc_cid',
  'mc_eid',
])

// Prefix-match parameters (Amazon's pf_rd_* and pd_rd_* family).
const FORBIDDEN_PARAM_PREFIXES = ['pf_rd_', 'pd_rd_']

// URL-shortener domains we refuse to accept — they may hide affiliate redirects.
const SHORTENER_DOMAINS = new Set<string>([
  'bit.ly',
  'lnkd.in',
  't.co',
  'buff.ly',
  'goo.gl',
  'tinyurl.com',
  'ow.ly',
  'rebrand.ly',
])

type Violation = {
  slug: string
  url: string
  context: string
  reason: string
}

function inspectUrl(url: string, context: string, slug: string, violations: Violation[]): void {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    violations.push({ slug, url, context, reason: 'malformed URL' })
    return
  }

  const host = parsed.hostname.toLowerCase()
  if (SHORTENER_DOMAINS.has(host)) {
    violations.push({
      slug,
      url,
      context,
      reason: `URL shortener domain "${host}" is rejected — may hide affiliate redirect`,
    })
    return
  }

  for (const [name] of parsed.searchParams) {
    const lower = name.toLowerCase()
    if (FORBIDDEN_PARAMS_EXACT.has(lower)) {
      violations.push({
        slug,
        url,
        context,
        reason: `forbidden affiliate/tracking param "${name}"`,
      })
      return
    }
    for (const prefix of FORBIDDEN_PARAM_PREFIXES) {
      if (lower.startsWith(prefix)) {
        violations.push({
          slug,
          url,
          context,
          reason: `forbidden Amazon-tracking param "${name}" (matches prefix "${prefix}*")`,
        })
        return
      }
    }
  }
}

function main(): void {
  const violations: Violation[] = []
  let urlsChecked = 0

  for (const pattern of PATTERNS) {
    if (pattern.archived) continue

    for (const ref of pattern.references) {
      urlsChecked += 1
      inspectUrl(ref.url, `references["${ref.title}"].url`, pattern.slug, violations)
    }
    for (const example of pattern.realWorldExamples) {
      urlsChecked += 1
      inspectUrl(example.sourceUrl, `realWorldExamples.sourceUrl`, pattern.slug, violations)
    }
    if (pattern.readerGotcha?.sourceUrl) {
      urlsChecked += 1
      inspectUrl(pattern.readerGotcha.sourceUrl, 'readerGotcha.sourceUrl', pattern.slug, violations)
    }
  }

  if (violations.length > 0) {
    console.error('check-affiliate-links: FAIL')
    for (const v of violations) {
      console.error(`\n[${v.slug}] ${v.context}\n  ${v.url}\n  → ${v.reason}\n`)
    }
    process.exit(1)
  }

  console.log(`check-affiliate-links: OK (checked ${urlsChecked} URLs)`)
}

main()
