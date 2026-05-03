/**
 * check-pattern-links.ts
 *
 * Walks every external URL in the pattern catalog (references, real-world
 * examples, reader-gotcha sources) and reports broken links. Designed to be
 * polite to upstream services:
 *
 *   - Per-host concurrency = 1, 1–3 second jittered delay between requests.
 *     Fanning out 5 in parallel against arXiv hits Cloudflare's rate limiter.
 *   - HEAD first, then GET with `Range: bytes=0-0` if the host rejects HEAD
 *     (Springer / IEEE / JSTOR are the usual offenders — 405/403/501).
 *   - Identifying User-Agent (mailto for Crossref polite-pool eligibility,
 *     general courtesy for everyone else).
 *
 * Run as a standalone tool OR weekly via .github/workflows/check-pattern-links.yml.
 *
 * Output: prints structured progress, then a JSON summary on stdout. Always
 * exits 0 — the workflow consumes the JSON to file/dedupe issues. (We don't
 * fail the lint chain on transient outages.)
 *
 * Usage:  tsx scripts/check-pattern-links.ts
 *         tsx scripts/check-pattern-links.ts --json-only   # only the JSON line
 */

import { PATTERNS } from '../src/data/agentic-design-patterns/index.js'

const USER_AGENT = 'detached-node-validator/0.1 (mailto:juliankennon@gmail.com)'

const PER_HOST_MIN_DELAY_MS = 1000
const PER_HOST_MAX_DELAY_MS = 3000
const REQUEST_TIMEOUT_MS = 15_000

const HEAD_REJECT_STATUSES = new Set<number>([403, 405, 501])

const jsonOnly = process.argv.includes('--json-only')

function logProgress(msg: string): void {
  if (!jsonOnly) console.error(msg)
}

type LinkRecord = { url: string; sources: string[] /* "<slug> <field>" */ }
type LinkOutcome = {
  url: string
  sources: string[]
  status: number | null
  ok: boolean
  reason: string | null
}

function collectLinks(): Map<string, LinkRecord> {
  const links = new Map<string, LinkRecord>()
  function add(url: string, source: string): void {
    if (!url) return
    const existing = links.get(url)
    if (existing) {
      if (!existing.sources.includes(source)) existing.sources.push(source)
    } else {
      links.set(url, { url, sources: [source] })
    }
  }
  for (const p of PATTERNS) {
    if (p.archived) continue
    for (const r of p.references) add(r.url, `${p.slug} references["${r.title}"]`)
    for (const e of p.realWorldExamples) add(e.sourceUrl, `${p.slug} realWorldExamples`)
    if (p.readerGotcha?.sourceUrl) add(p.readerGotcha.sourceUrl, `${p.slug} readerGotcha`)
  }
  return links
}

function jitter(): number {
  return Math.floor(
    PER_HOST_MIN_DELAY_MS + Math.random() * (PER_HOST_MAX_DELAY_MS - PER_HOST_MIN_DELAY_MS),
  )
}

async function timedFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function checkOne(url: string): Promise<{ status: number | null; ok: boolean; reason: string | null }> {
  const headers: Record<string, string> = {
    'user-agent': USER_AGENT,
    accept: '*/*',
  }

  // HEAD first.
  try {
    const res = await timedFetch(url, { method: 'HEAD', headers, redirect: 'follow' })
    if (res.ok) return { status: res.status, ok: true, reason: null }
    if (!HEAD_REJECT_STATUSES.has(res.status)) {
      return { status: res.status, ok: false, reason: `HEAD ${res.status}` }
    }
    // Fall through to GET — host probably rejects HEAD.
  } catch (err) {
    // Network error on HEAD — try GET before giving up.
    logProgress(`  HEAD failed (${String(err)}), trying GET`)
  }

  // GET with Range to avoid downloading whole bodies.
  try {
    const res = await timedFetch(url, {
      method: 'GET',
      headers: { ...headers, range: 'bytes=0-0' },
      redirect: 'follow',
    })
    // 206 (Partial Content), 200 (host ignored Range), 416 ("can't satisfy"
    // but the URL exists) all count as "the link works".
    if (res.ok || res.status === 416) return { status: res.status, ok: true, reason: null }
    return { status: res.status, ok: false, reason: `GET ${res.status}` }
  } catch (err) {
    return { status: null, ok: false, reason: `network error: ${String(err)}` }
  }
}

async function checkLinks(links: Map<string, LinkRecord>): Promise<LinkOutcome[]> {
  // Group by host so we can serialise per-host with delays between same-host requests.
  const byHost = new Map<string, LinkRecord[]>()
  for (const link of links.values()) {
    let host = 'unknown'
    try {
      host = new URL(link.url).hostname
    } catch {
      /* keep host=unknown — fetch will fail and produce a clear error */
    }
    const list = byHost.get(host) ?? []
    list.push(link)
    byHost.set(host, list)
  }

  const outcomes: LinkOutcome[] = []
  // Run hosts in parallel, but serialise within each host.
  await Promise.all(
    Array.from(byHost.entries()).map(async ([host, hostLinks]) => {
      for (let i = 0; i < hostLinks.length; i += 1) {
        const link = hostLinks[i]!
        if (i > 0) await new Promise((r) => setTimeout(r, jitter()))
        logProgress(`[${host}] ${link.url}`)
        const result = await checkOne(link.url)
        outcomes.push({ ...link, ...result })
      }
    }),
  )
  return outcomes
}

async function main(): Promise<void> {
  const links = collectLinks()
  logProgress(`check-pattern-links: ${links.size} unique URLs across ${PATTERNS.filter((p) => !p.archived).length} patterns`)

  if (links.size === 0) {
    const summary = { ok: true, totalUrls: 0, broken: [] as LinkOutcome[] }
    console.log(JSON.stringify(summary))
    return
  }

  const outcomes = await checkLinks(links)
  const broken = outcomes.filter((o) => !o.ok)

  const summary = {
    ok: broken.length === 0,
    totalUrls: outcomes.length,
    broken,
  }
  console.log(JSON.stringify(summary))
  if (!jsonOnly) {
    if (broken.length === 0) {
      logProgress(`check-pattern-links: OK (${outcomes.length} URLs)`)
    } else {
      logProgress(`check-pattern-links: ${broken.length} broken / ${outcomes.length} total`)
      for (const b of broken) {
        logProgress(`  ✗ ${b.url}\n    status=${b.status ?? 'n/a'} reason=${b.reason}\n    sources: ${b.sources.join(', ')}`)
      }
    }
  }
}

main().catch((err) => {
  // Even unhandled errors should still emit a JSON summary so the workflow
  // can detect the failure mode without scraping logs.
  console.log(JSON.stringify({ ok: false, totalUrls: 0, broken: [], fatal: String(err) }))
  process.exit(0)
})
