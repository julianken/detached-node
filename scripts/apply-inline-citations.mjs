/**
 * One-shot script that applies 12 inline external citations to the 4
 * published blog posts. Sources are the citation-delta files preserved
 * in git history at SHA e4656eb8d57719140435e624783082b5f28dcfd9 under
 * `docs/seo-strategy/citation-deltas/` — those files were removed from
 * `main` in PR #409 but the proposed citations remain canonical.
 *
 * Usage (from repo root):
 *   pnpm tsx scripts/apply-inline-citations.mjs --dry-run    # preview
 *   pnpm tsx scripts/apply-inline-citations.mjs              # live run
 *
 * Prerequisites:
 *   - `.env.local` with DATABASE_URL pointing at the target Payload DB
 *     (production Postgres for this work). PAYLOAD_SECRET must be set.
 *   - Run from the worktree root, not from inside `scripts/`.
 *
 * Behaviour:
 *   - Idempotent at the URL level — re-running the script finds the
 *     existing link and reports `already-linked` instead of duplicating.
 *   - Citation 2 on `agentic-patterns-in-your-coding-workflow` is an
 *     anchor extension: the existing Reflexion link's anchor text is
 *     widened from "Reflexion paper" → "Reflexion paper (Shinn et al.,
 *     2023)" while the URL stays unchanged.
 *   - `dedicatedDateModified` is passed through unchanged on each
 *     `payload.update` so the `beforeChange` hook treats it as
 *     editor-set and does NOT auto-bump it (which would falsely signal
 *     "this post was meaningfully edited" to BlogPosting.dateModified
 *     consumers). All 4 posts had `dedicatedDateModified: null` going
 *     in and end with `dedicatedDateModified: null` going out. See
 *     `src/lib/hooks/before-change-dedicated-date-modified.ts:41`.
 *   - `status` stays 'published'; `publishedAt` is not touched.
 *   - Next.js full-route ISR cache will not invalidate when this runs
 *     OUTSIDE a Next.js request context (the afterChange revalidate
 *     hook silently no-ops per `src/lib/revalidate-post.ts:14-20`).
 *     Production cache catches up via `revalidate = 3600` on
 *     `src/app/(frontend)/posts/[slug]/page.tsx`.
 *
 * This script can be re-run safely; it does not duplicate citations.
 * It is retained in-repo as the audit trail for issue #411.
 */
import dotenv from 'dotenv'
import crypto from 'node:crypto'
dotenv.config({ path: '.env.local' })

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config.ts')

const DRY_RUN = process.argv.includes('--dry-run')

/**
 * Generate a 24-char hex id like Payload's Mongo-style ObjectIds.
 * Lexical doesn't validate the id beyond uniqueness within the document;
 * matching the existing format keeps the body bag-of-bytes consistent.
 */
function newLexicalId() {
  return crypto.randomBytes(12).toString('hex')
}

function makeLinkNode(url, anchorText) {
  return {
    id: newLexicalId(),
    type: 'link',
    fields: { url, newTab: true, linkType: 'custom' },
    format: '',
    indent: 0,
    version: 3,
    children: [
      {
        mode: 'normal',
        text: anchorText,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
    direction: null,
  }
}

function makeTextNode(text) {
  return {
    mode: 'normal',
    text,
    type: 'text',
    style: '',
    detail: 0,
    format: 0,
    version: 1,
  }
}

/**
 * Walk the Lexical tree and call cb(parent, indexInChildren, node) for every
 * text node. cb may mutate parent.children in place by replacing the
 * single text-node entry with N new entries — the walker handles the
 * splicing by re-traversing the parent's children after a replacement.
 */
function walkTextNodes(node, cb, parent = null, indexInParent = -1) {
  if (!node) return
  if (node.type === 'text') {
    cb(parent, indexInParent, node)
    return
  }
  if (Array.isArray(node.children)) {
    // Iterate by index because cb may splice in additional children.
    let i = 0
    while (i < node.children.length) {
      const prevLen = node.children.length
      walkTextNodes(node.children[i], cb, node, i)
      const grew = node.children.length - prevLen
      // Skip over freshly-inserted siblings so we don't reprocess them.
      i += 1 + Math.max(0, grew)
    }
  }
}

/**
 * In a parent.children list, replace the text node at index `idx`
 * (whose .text contains exactly the literal `anchor`) with a
 * pre-text + link + post-text triple. Returns true if the replacement
 * happened; false if anchor was not in that text node.
 */
function spliceLinkIntoTextNode(parent, idx, anchor, url) {
  const node = parent.children[idx]
  if (node?.type !== 'text' || typeof node.text !== 'string') return false
  const pos = node.text.indexOf(anchor)
  if (pos === -1) return false
  const pre = node.text.slice(0, pos)
  const post = node.text.slice(pos + anchor.length)
  const replacement = []
  if (pre.length > 0) replacement.push(makeTextNode(pre))
  replacement.push(makeLinkNode(url, anchor))
  if (post.length > 0) replacement.push(makeTextNode(post))
  parent.children.splice(idx, 1, ...replacement)
  return true
}

/**
 * Try to apply one citation (anchor + url) inside `body`. Returns:
 *   - 'inserted' when a text node was split and a new link node added
 *   - 'already-linked' when a link with this url and matching anchor exists
 *   - 'anchor-extended' when an existing link node had its anchor text
 *     extended to a longer-but-spec-faithful version
 *   - 'not-found' when the anchor literal wasn't found anywhere
 *
 * If `mustOccurAfter` is provided, the anchor must appear in a text node
 * that follows (in document order) a text node containing the literal
 * `mustOccurAfter`. Used to disambiguate when an anchor word repeats
 * (e.g. "MCP servers" or "Claude Code") — we anchor to a specific
 * passage by requiring a nearby preceding phrase.
 */
function applyCitation(body, anchor, url, options = {}) {
  const { mustOccurAfter, extendExistingAnchorTo } = options

  // First: does a link with this url already exist somewhere?
  let existingLinkInfo = null
  walkTextNodes(
    body.root,
    () => {},
    // Custom non-text walker to find link nodes — text-only walker doesn't see them.
  )
  // Manual link search:
  function findExistingLink(node) {
    if (!node) return
    if (node.type === 'link' && node.fields?.url === url) {
      existingLinkInfo = node
      return
    }
    if (Array.isArray(node.children)) {
      for (const c of node.children) findExistingLink(c)
    }
  }
  findExistingLink(body.root)

  if (existingLinkInfo) {
    // Check if anchor text already matches (or is a subset of) the desired anchor
    const existingAnchor = existingLinkInfo.children?.[0]?.text ?? ''
    if (existingAnchor === anchor) {
      return 'already-linked'
    }
    if (extendExistingAnchorTo && existingAnchor === extendExistingAnchorTo) {
      // Spec called for extending the anchor to a longer string. Check what
      // text immediately follows the link node and "absorb" it into the
      // anchor if it matches the suffix we want to include.
      // For Citation 2: existing anchor="Reflexion paper", desired="Reflexion paper (Shinn et al., 2023)".
      // Suffix to absorb: " (Shinn et al., 2023)".
      const desiredSuffix = anchor.slice(existingAnchor.length)
      // Find the parent that contains this link node + the following text node.
      function findParentOfLink(node) {
        if (!node) return null
        if (Array.isArray(node.children)) {
          for (let i = 0; i < node.children.length; i++) {
            if (node.children[i] === existingLinkInfo) {
              return { parent: node, index: i }
            }
            const inner = findParentOfLink(node.children[i])
            if (inner) return inner
          }
        }
        return null
      }
      const linkLoc = findParentOfLink(body.root)
      if (!linkLoc) return 'not-found'
      const { parent, index } = linkLoc
      const next = parent.children[index + 1]
      if (next?.type === 'text' && typeof next.text === 'string' && next.text.startsWith(desiredSuffix)) {
        // Absorb the suffix into the link's anchor child node.
        existingLinkInfo.children[0].text = anchor
        next.text = next.text.slice(desiredSuffix.length)
        if (next.text.length === 0) {
          parent.children.splice(index + 1, 1)
        }
        return 'anchor-extended'
      }
      return 'not-found'
    }
    // Different anchor and not the extend-case → treat as already-linked
    // since the URL already exists somewhere in the doc.
    return 'already-linked'
  }

  // No existing link. Find a text node containing the anchor.
  // If mustOccurAfter is given, only match after we've seen a text node
  // containing that prefix marker.
  let seenMarker = !mustOccurAfter
  let inserted = false
  walkTextNodes(body.root, (parent, idx, node) => {
    if (inserted) return
    if (!seenMarker && node.text.includes(mustOccurAfter)) {
      seenMarker = true
      // Allow the marker text node itself to ALSO be the anchor host if
      // the anchor literal occurs in the same text node AFTER the marker.
      // We handle this by re-running spliceLinkIntoTextNode here.
    }
    if (!seenMarker) return
    if (node.text.includes(anchor)) {
      inserted = spliceLinkIntoTextNode(parent, idx, anchor, url)
    }
  })

  return inserted ? 'inserted' : 'not-found'
}

const POSTS_CITATIONS = {
  // agentic-patterns-in-your-coding-workflow
  6: [
    {
      label: 'C1: Anthropic essay',
      anchor: '"Building effective agents"',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
    },
    {
      label: 'C2: Reflexion paper anchor extension',
      anchor: 'Reflexion paper (Shinn et al., 2023)',
      url: 'https://arxiv.org/abs/2303.11366',
      extendExistingAnchorTo: 'Reflexion paper',
    },
    {
      label: 'C3: Self-Refine paper',
      anchor: 'Self-Refine (Madaan et al., 2023)',
      url: 'https://arxiv.org/abs/2303.17651',
    },
    {
      label: 'C4: Anthropic SDK',
      anchor: "Anthropic's SDK docs",
      url: 'https://github.com/anthropics/anthropic-sdk-python',
    },
    {
      label: 'C5: Subagents docs',
      anchor: 'subagents',
      url: 'https://code.claude.com/docs/en/sub-agents',
      mustOccurAfter: 'The feature docs cover',
    },
    {
      label: 'C6: Skills docs',
      anchor: 'skills',
      url: 'https://code.claude.com/docs/en/skills',
      mustOccurAfter: 'The feature docs cover',
    },
    {
      label: 'C7: Hooks docs',
      anchor: 'hooks',
      url: 'https://code.claude.com/docs/en/hooks',
      mustOccurAfter: 'The feature docs cover',
    },
    {
      label: 'C8: MCP servers home',
      anchor: 'MCP servers',
      url: 'https://modelcontextprotocol.io/',
      mustOccurAfter: 'The feature docs cover',
    },
  ],
  // subagent-orchestration-workflow
  5: [
    {
      label: 'C1: Claude Code overview',
      anchor: 'Claude Code',
      url: 'https://code.claude.com/docs/en/overview',
    },
    {
      label: 'C2: autoregressive — best-practices doc',
      anchor: "irrelevant work from earlier tasks is still present and influencing the model's output",
      url: 'https://code.claude.com/docs/en/best-practices',
    },
  ],
  // what-tickets-and-prs-are-actually-for
  4: [
    {
      label: 'C1: MCP servers home',
      anchor: 'MCP servers',
      url: 'https://modelcontextprotocol.io/',
      mustOccurAfter: 'properly set up connectors',
    },
  ],
  // rethinking-systems-in-the-agentic-age
  3: [
    {
      label: 'C1: MCP servers home',
      anchor: 'MCP servers',
      url: 'https://modelcontextprotocol.io/',
      mustOccurAfter: 'Properly maintained connectors',
    },
  ],
}

const SLUG_BY_ID = {
  3: 'rethinking-systems-in-the-agentic-age',
  4: 'what-tickets-and-prs-are-actually-for',
  5: 'subagent-orchestration-workflow',
  6: 'agentic-patterns-in-your-coding-workflow',
}

console.log(`[apply-citations] ${DRY_RUN ? 'DRY RUN — no writes' : 'LIVE RUN — will PATCH posts'}`)

const payload = await getPayload({ config })

const summary = { applied: 0, alreadyLinked: 0, anchorExtended: 0, notFound: 0 }

for (const [postIdStr, citations] of Object.entries(POSTS_CITATIONS)) {
  const postId = Number(postIdStr)
  const slug = SLUG_BY_ID[postId]
  console.log(`\n=== Post id=${postId} slug=${slug} ===`)

  const existing = await payload.findByID({ collection: 'posts', id: postId, depth: 0 })
  if (!existing) {
    console.error(`  NOT FOUND (id ${postId})`)
    continue
  }
  console.log(`  title: ${existing.title}`)
  console.log(`  dedicatedDateModified (preserved): ${existing.dedicatedDateModified ?? 'null'}`)

  const body = JSON.parse(JSON.stringify(existing.body))

  for (const c of citations) {
    const result = applyCitation(body, c.anchor, c.url, {
      mustOccurAfter: c.mustOccurAfter,
      extendExistingAnchorTo: c.extendExistingAnchorTo,
    })
    console.log(`  ${c.label}: ${result}`)
    if (result === 'inserted') summary.applied++
    else if (result === 'already-linked') summary.alreadyLinked++
    else if (result === 'anchor-extended') summary.anchorExtended++
    else summary.notFound++
  }

  if (DRY_RUN) {
    console.log('  (dry run — not writing)')
    continue
  }

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      body,
      dedicatedDateModified: existing.dedicatedDateModified ?? null,
    },
  })
  console.log('  PATCHed body; dedicatedDateModified preserved')
}

console.log('\nSummary:')
console.log(`  inserted: ${summary.applied}`)
console.log(`  anchor-extended: ${summary.anchorExtended}`)
console.log(`  already-linked: ${summary.alreadyLinked}`)
console.log(`  not-found: ${summary.notFound}`)

process.exit(0)
