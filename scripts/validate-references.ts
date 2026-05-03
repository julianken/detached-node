/**
 * validate-references.ts
 *
 * Verifies that every paper Reference in the agentic-design-patterns catalog
 * resolves to a real publication via Crossref, with OpenAlex as a fallback for
 * arXiv preprint DOIs (which Crossref returns 404 for — Reflexion, Self-Refine,
 * CRITIC are all in this bucket).
 *
 * Without the OpenAlex fallback, the script would fail on every arXiv preprint
 * citation. That is the WHOLE POINT of this guardrail — without it, our claim
 * to cite better than the source PDF is a marketing slogan, not enforced rigor.
 *
 * Validation:
 *   - title:   fuzzy match (lowercased, punctuation stripped)
 *   - year:    exact match (papers don't change publication year)
 *   - author:  surname of first author matches
 *
 * Cache:
 *   src/data/agentic-design-patterns/references.lock.json maps DOI → minimal
 *   record of what we verified. We short-circuit on cached entries, but only
 *   when the local Reference still matches the cached title/year/surname.
 *
 * Politeness:
 *   - User-Agent identifies us with a mailto: address (Crossref's polite-pool
 *     requirement).
 *   - 100 ms throttle between requests.
 *   - 3-attempt retry with exponential backoff for 5xx responses.
 *
 * Usage:  tsx scripts/validate-references.ts
 * Exit:   0 on success, 1 on first unverifiable reference.
 */

import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { PATTERNS } from '../src/data/agentic-design-patterns/index.js'
import type { Reference } from '../src/data/agentic-design-patterns/types.js'

const USER_AGENT = 'detached-node-validator/0.1 (mailto:juliankennon@gmail.com)'
const REQUEST_THROTTLE_MS = 100
const MAX_RETRIES = 3

const LOCK_PATH = resolve(
  process.cwd(),
  'src/data/agentic-design-patterns/references.lock.json',
)

// ── Cache ──────────────────────────────────────────────────────────────────

type LockEntry = {
  title: string
  year: number
  firstAuthorSurname: string
  source: 'crossref' | 'openalex'
  verifiedAt: string // ISO date
}

type LockFile = {
  version: 1
  doiToReference: Record<string, LockEntry>
}

function readLock(): LockFile {
  try {
    const raw = readFileSync(LOCK_PATH, 'utf8')
    const parsed = JSON.parse(raw) as Partial<LockFile>
    if (parsed && parsed.version === 1 && parsed.doiToReference && typeof parsed.doiToReference === 'object') {
      return { version: 1, doiToReference: parsed.doiToReference }
    }
  } catch {
    // missing/corrupt — start fresh
  }
  return { version: 1, doiToReference: {} }
}

function writeLock(lock: LockFile): void {
  // Stable key ordering for diff-friendliness.
  const sortedKeys = Object.keys(lock.doiToReference).sort()
  const sorted: Record<string, LockEntry> = {}
  for (const k of sortedKeys) sorted[k] = lock.doiToReference[k]!
  const out = { version: 1, doiToReference: sorted }
  const next = `${JSON.stringify(out, null, 2)}\n`
  // No-op write avoidance: leave the file untouched if content is unchanged
  // (otherwise a clean run would still produce a diff against committed state).
  let current = ''
  try {
    current = readFileSync(LOCK_PATH, 'utf8')
  } catch {
    /* missing — proceed to write */
  }
  if (current === next) return
  // Atomic write: write tmpfile then rename. Single writer; serialised in CI.
  const tmp = `${LOCK_PATH}.tmp`
  writeFileSync(tmp, next, 'utf8')
  renameSync(tmp, LOCK_PATH)
}

// ── Normalisation ──────────────────────────────────────────────────────────

export function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '') // strip combining marks (accents)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Extract the first author's surname from the catalog's free-text `authors`
 * field. We support common shapes:
 *   "Shinn et al."          → "Shinn"
 *   "Yao, Shunyu"           → "Yao"
 *   "Wei and Brown"         → "Wei"
 *   "Anthropic"             → "Anthropic" (corporate author)
 *   "Sutton, Richard et al." → "Sutton"
 */
export function extractFirstAuthorSurname(authors: string): string {
  const trimmed = authors.trim()
  if (!trimmed) return ''
  // Split on comma or " and " — take the first chunk.
  const firstChunk = trimmed.split(/,| and /)[0]!.trim()
  // Strip trailing " et al." in case the comma split didn't catch it.
  const cleaned = firstChunk.replace(/\s+et\s+al\.?$/i, '').trim()
  // If the remaining string looks like "Firstname Lastname", take the last
  // whitespace-delimited word as the surname; otherwise return as-is.
  const parts = cleaned.split(/\s+/)
  return parts[parts.length - 1] ?? cleaned
}

function surnamesMatch(local: string, remote: string): boolean {
  const a = local.toLowerCase().normalize('NFKD').replace(/\p{M}+/gu, '')
  const b = remote.toLowerCase().normalize('NFKD').replace(/\p{M}+/gu, '')
  if (!a || !b) return false
  // Allow equality OR either string containing the other — handles "Sutton" vs
  // "Sutton-Smith" and corporate authors.
  return a === b || a.includes(b) || b.includes(a)
}

function titlesMatch(local: string, remote: string): boolean {
  const a = normaliseTitle(local)
  const b = normaliseTitle(remote)
  if (!a || !b) return false
  if (a === b) return true
  // Allow either being a prefix or the other to handle subtitles dropped on
  // arXiv listings.
  return a.startsWith(b) || b.startsWith(a)
}

// ── Network ────────────────────────────────────────────────────────────────

let lastRequestAt = 0

async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now()
  const wait = lastRequestAt + REQUEST_THROTTLE_MS - now
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastRequestAt = Date.now()
  return fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'application/json',
    },
  })
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastErr: unknown = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const res = await throttledFetch(url)
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        const backoff = 250 * 2 ** (attempt - 1)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      }
      return res
    } catch (err) {
      lastErr = err
      if (attempt === MAX_RETRIES) throw err
      const backoff = 250 * 2 ** (attempt - 1)
      await new Promise((r) => setTimeout(r, backoff))
    }
  }
  throw lastErr ?? new Error('fetchWithRetry: unreachable')
}

// ── Crossref ───────────────────────────────────────────────────────────────

type CrossrefAuthor = { family?: string; given?: string; name?: string }

type CrossrefMessage = {
  title?: string[]
  author?: CrossrefAuthor[]
  issued?: { 'date-parts'?: number[][] }
  created?: { 'date-parts'?: number[][] }
  published?: { 'date-parts'?: number[][] }
}

type CrossrefResponse = { status?: string; message?: CrossrefMessage }

async function fetchCrossrefByDoi(doi: string): Promise<CrossrefMessage | null> {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`
  const res = await fetchWithRetry(url)
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Crossref HTTP ${res.status} for DOI ${doi}`)
  }
  const json = (await res.json()) as CrossrefResponse
  return json.message ?? null
}

function crossrefYear(msg: CrossrefMessage): number | null {
  const candidate = msg.issued ?? msg.published ?? msg.created
  const parts = candidate?.['date-parts']?.[0]
  return parts && typeof parts[0] === 'number' ? parts[0] : null
}

function crossrefFirstAuthorSurname(msg: CrossrefMessage): string {
  const a = msg.author?.[0]
  if (!a) return ''
  if (a.family) return a.family
  // Some Crossref records use `name` for corporate authors.
  return a.name ?? ''
}

// ── OpenAlex (fallback for arXiv preprints) ────────────────────────────────

type OpenAlexAuthorship = {
  author?: { display_name?: string }
  raw_author_name?: string
}

type OpenAlexResponse = {
  title?: string
  display_name?: string
  publication_year?: number
  authorships?: OpenAlexAuthorship[]
}

async function fetchOpenAlexByDoi(doi: string): Promise<OpenAlexResponse | null> {
  // OpenAlex accepts the DOI verbatim after `doi:` — we MUST NOT URL-encode
  // the slash inside the DOI prefix or it returns 404.
  const url = `https://api.openalex.org/works/doi:${doi}`
  const res = await fetchWithRetry(url)
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`OpenAlex HTTP ${res.status} for DOI ${doi}`)
  }
  return (await res.json()) as OpenAlexResponse
}

function openAlexFirstAuthorSurname(work: OpenAlexResponse): string {
  const first = work.authorships?.[0]
  const display = first?.author?.display_name ?? first?.raw_author_name ?? ''
  if (!display) return ''
  // OpenAlex returns "Firstname Lastname" — last whitespace-delimited word.
  const parts = display.trim().split(/\s+/)
  return parts[parts.length - 1] ?? ''
}

// ── Validation ─────────────────────────────────────────────────────────────

type ValidationResult =
  | { ok: true; source: 'crossref' | 'openalex' | 'cache'; surname: string; title: string; year: number }
  | { ok: false; reason: string }

async function validateReference(ref: Reference, lock: LockFile): Promise<ValidationResult> {
  if (ref.type !== 'paper') return { ok: true, source: 'cache', surname: '', title: ref.title, year: ref.year }
  const doi = ref.doi
  if (!doi) {
    return {
      ok: false,
      reason: `Reference "${ref.title}" has type:'paper' but no doi — papers MUST cite by DOI`,
    }
  }

  const localSurname = extractFirstAuthorSurname(ref.authors)

  // Cache short-circuit
  const cached = lock.doiToReference[doi]
  if (cached) {
    const titlesOk = titlesMatch(ref.title, cached.title)
    const yearOk = ref.year === cached.year
    const surnameOk = surnamesMatch(localSurname, cached.firstAuthorSurname)
    if (titlesOk && yearOk && surnameOk) {
      return { ok: true, source: 'cache', surname: cached.firstAuthorSurname, title: cached.title, year: cached.year }
    }
    // Cache mismatch — fall through to re-verify (and overwrite the cache below).
  }

  // Try Crossref first.
  let crossrefMsg: CrossrefMessage | null = null
  let crossrefError: unknown = null
  try {
    crossrefMsg = await fetchCrossrefByDoi(doi)
  } catch (err) {
    crossrefError = err
  }

  if (crossrefMsg) {
    const remoteTitle = crossrefMsg.title?.[0] ?? ''
    const remoteYear = crossrefYear(crossrefMsg)
    const remoteSurname = crossrefFirstAuthorSurname(crossrefMsg)
    const titlesOk = titlesMatch(ref.title, remoteTitle)
    const yearOk = remoteYear !== null && ref.year === remoteYear
    const surnameOk = surnamesMatch(localSurname, remoteSurname)
    if (titlesOk && yearOk && surnameOk) {
      lock.doiToReference[doi] = {
        title: remoteTitle,
        year: remoteYear,
        firstAuthorSurname: remoteSurname,
        source: 'crossref',
        verifiedAt: new Date().toISOString().slice(0, 10),
      }
      return { ok: true, source: 'crossref', surname: remoteSurname, title: remoteTitle, year: remoteYear }
    }
    return {
      ok: false,
      reason:
        `Crossref record for DOI ${doi} disagrees with catalog: ` +
        `local(title="${ref.title}", year=${ref.year}, surname="${localSurname}") vs ` +
        `remote(title="${remoteTitle}", year=${remoteYear}, surname="${remoteSurname}")`,
    }
  }

  // Crossref returned 404 (or threw). Fall back to OpenAlex — this is the
  // critical path for arXiv preprints (10.48550/arXiv.*).
  let openalex: OpenAlexResponse | null = null
  try {
    openalex = await fetchOpenAlexByDoi(doi)
  } catch (err) {
    return {
      ok: false,
      reason:
        `DOI ${doi} not found in Crossref (${crossrefError ? `error: ${String(crossrefError)}` : '404'}) ` +
        `and OpenAlex fallback failed: ${String(err)}`,
    }
  }
  if (!openalex) {
    return {
      ok: false,
      reason: `DOI ${doi} not found in Crossref or OpenAlex — fabricated or mistyped`,
    }
  }

  const remoteTitle = openalex.title ?? openalex.display_name ?? ''
  const remoteYear = openalex.publication_year ?? null
  const remoteSurname = openAlexFirstAuthorSurname(openalex)
  const titlesOk = titlesMatch(ref.title, remoteTitle)
  const yearOk = remoteYear !== null && ref.year === remoteYear
  const surnameOk = surnamesMatch(localSurname, remoteSurname)
  if (titlesOk && yearOk && surnameOk) {
    lock.doiToReference[doi] = {
      title: remoteTitle,
      year: remoteYear,
      firstAuthorSurname: remoteSurname,
      source: 'openalex',
      verifiedAt: new Date().toISOString().slice(0, 10),
    }
    return { ok: true, source: 'openalex', surname: remoteSurname, title: remoteTitle, year: remoteYear }
  }
  return {
    ok: false,
    reason:
      `OpenAlex record for DOI ${doi} disagrees with catalog: ` +
      `local(title="${ref.title}", year=${ref.year}, surname="${localSurname}") vs ` +
      `remote(title="${remoteTitle}", year=${remoteYear}, surname="${remoteSurname}")`,
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const lock = readLock()
  const failures: { slug: string; refTitle: string; reason: string }[] = []
  let verified = 0
  let cached = 0
  let crossref = 0
  let openalex = 0
  let papers = 0

  for (const pattern of PATTERNS) {
    if (pattern.archived) continue
    for (const ref of pattern.references) {
      if (ref.type !== 'paper') continue
      papers += 1
      const result = await validateReference(ref, lock)
      if (!result.ok) {
        failures.push({ slug: pattern.slug, refTitle: ref.title, reason: result.reason })
      } else {
        verified += 1
        if (result.source === 'cache') cached += 1
        if (result.source === 'crossref') crossref += 1
        if (result.source === 'openalex') openalex += 1
      }
    }
  }

  // Persist the cache regardless of failure — partial verification is still useful.
  writeLock(lock)

  if (failures.length > 0) {
    console.error('validate-references: FAIL')
    for (const f of failures) {
      console.error(`\n[${f.slug}] "${f.refTitle}"\n${f.reason}\n`)
    }
    process.exit(1)
  }

  console.log(
    `validate-references: OK (papers=${papers}, verified=${verified}, ` +
      `cache=${cached}, crossref=${crossref}, openalex=${openalex})`,
  )
}

main().catch((err) => {
  console.error('validate-references: unhandled error', err)
  process.exit(1)
})
