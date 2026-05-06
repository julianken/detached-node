// ---------------------------------------------------------------------------
// RealizingDisclosure — W4.0 reference-card redesign
// ---------------------------------------------------------------------------
// Renders pattern.realizingInClaudeCode as an always-visible reference card
// at the top of the satellite article (positioned by the slug page).
//
// Lead format for every tier: scannable `keyMoves` bullets first, followed by
// the existing structured fields (pills, worked-example link, reader-move
// callout, see-also chips). Long-form prose (`bodyMarkdown`) collapses into
// an inner "Why this works" sub-disclosure for the rare deep-dive reader.
//
// Tier-specific extras render after the shared lead:
//   Tier A — ccPrimitives + scaffolding pill rows + workedExample link
//   Tier B — keyMoves + readerMove + seeAlso (+ bodyMarkdown if present)
//   Tier C — keyMoves + readerMove + seeAlso (+ bodyMarkdown if present)
//   Tier U — umbrellaPointers + closingRule + openingFraming (collapsed)
// ---------------------------------------------------------------------------

import { Link } from 'next-view-transitions'
import type { RealizingInClaudeCode, CcSeeAlso } from '@/data/agentic-design-patterns/types'

interface RealizingDisclosureProps {
  /** Section label, e.g. "Claude Code" or "Cursor". */
  label: string
  /** Content for this IDE; if undefined, the section renders an empty-state placeholder. */
  realizing?: RealizingInClaudeCode
  /** Open by default (typical for the IDE the reader most likely uses). */
  defaultOpen?: boolean
}

// ---------------------------------------------------------------------------
// Inline markdown renderer — handles `code` and [text](url) only.
// Strings are short technical lines, so a regex pass beats pulling in a
// full markdown library.
// ---------------------------------------------------------------------------

const INLINE_TOKEN = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g
const LINK_PARTS = /^\[([^\]]+)\]\(([^)]+)\)$/

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(INLINE_TOKEN)
  return parts.map((part, i) => {
    if (!part) return null
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded-sm bg-zinc-100 px-1 py-0.5 font-mono text-[0.85em] text-text-primary dark:bg-zinc-800"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    const link = part.match(LINK_PARTS)
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          className="text-accent underline underline-offset-2 hover:no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link[1]}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// ---------------------------------------------------------------------------
// Sub-section heading (shared chrome)
// ---------------------------------------------------------------------------

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2.5 text-xl font-semibold text-text-primary">
      {children}
    </h4>
  )
}

// ---------------------------------------------------------------------------
// Lead heading for the whole card
// ---------------------------------------------------------------------------

// CardHeading replaced by the <summary> of the outer <details>.

// ---------------------------------------------------------------------------
// keyMoves bulleted list — primary reference content
// ---------------------------------------------------------------------------

function KeyMovesList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5 pl-5 text-base leading-7 text-text-primary [list-style:disc] marker:text-text-tertiary">
      {items.map((move, idx) => (
        <li key={idx} className="[text-wrap:pretty]">
          {renderInline(move)}
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Pill list for CC primitives / scaffolding
// ---------------------------------------------------------------------------

function PillList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-sm border border-border-subtle bg-zinc-100 px-2 py-0.5 font-mono text-xs text-text-secondary dark:bg-zinc-800"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// See-also block (shared across tiers)
// ---------------------------------------------------------------------------

function SeeAlsoBlock({ seeAlso }: { seeAlso: CcSeeAlso }) {
  const hasSiblings = seeAlso.siblingPatternSlugs && seeAlso.siblingPatternSlugs.length > 0
  const hasArticleSlug = Boolean(seeAlso.articleSlug)

  if (!hasSiblings && !hasArticleSlug) return null

  return (
    <div className="flex flex-col gap-4 border-t border-border-subtle pt-4">
      {hasSiblings && (
        <div>
          <SubHeading>Related patterns</SubHeading>
          <ul className="flex flex-wrap gap-2">
            {seeAlso.siblingPatternSlugs!.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/agentic-design-patterns/${slug}`}
                  className="inline-flex rounded-sm border border-border-subtle bg-zinc-100 px-2.5 py-1 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent dark:bg-zinc-800"
                >
                  {slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasArticleSlug && (
        <div>
          <SubHeading>Article</SubHeading>
          <Link
            href={`/${seeAlso.articleSlug}`}
            className="inline-flex rounded-sm border border-border-subtle bg-zinc-100 px-2.5 py-1 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent dark:bg-zinc-800"
          >
            /{seeAlso.articleSlug}
          </Link>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Example footer chip — small, optional, not lead content
// ---------------------------------------------------------------------------

function ExampleChip({ url }: { url: string }) {
  return (
    <div className="border-t border-border-subtle pt-3">
      <p className="text-sm text-text-tertiary">
        Example:{' '}
        <a
          href={url}
          className="font-mono text-accent underline underline-offset-2 hover:no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {url.replace(/^https?:\/\//, '')}
        </a>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline paragraphs (umbrella opening framing only — not used for bodyMarkdown)
// ---------------------------------------------------------------------------

function InlineParagraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  return (
    <div className="flex flex-col gap-3 text-base leading-7 text-text-secondary [text-wrap:pretty]">
      {paragraphs.map((para, i) => (
        <p key={i}>{renderInline(para)}</p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export — single render path; surfaces whatever fields are populated
// ---------------------------------------------------------------------------

export function RealizingDisclosure({ label, realizing: r, defaultOpen }: RealizingDisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-sm border border-border-default bg-bg-elevated dark:border-zinc-700 dark:bg-zinc-900"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <h3 className="text-2xl font-semibold tracking-tight text-text-primary">{label}</h3>
        <span aria-hidden className="text-text-tertiary transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="border-t border-border-subtle px-4 py-4">
        {!r ? (
          <p className="text-base leading-7 text-text-tertiary italic">
            Realization in {label} is not yet documented for this pattern.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {r.openingFraming && <InlineParagraphs text={r.openingFraming} />}

            {r.keyMoves && r.keyMoves.length > 0 && <KeyMovesList items={r.keyMoves} />}

            {r.ccPrimitives && r.ccPrimitives.length > 0 && (
              <div>
                <SubHeading>Primitives</SubHeading>
                <PillList items={r.ccPrimitives} />
              </div>
            )}

            {r.umbrellaPointers && r.umbrellaPointers.length > 0 && (
              <div>
                <SubHeading>Pattern index</SubHeading>
                <ul className="flex flex-col gap-2 text-base leading-7 text-text-primary">
                  {r.umbrellaPointers.map((pointer) => (
                    <li key={pointer.patternSlug} className="flex items-baseline gap-2 [text-wrap:pretty]">
                      <span className="shrink-0 font-mono text-sm text-text-tertiary">{pointer.patternSlug}</span>
                      <span>{renderInline(pointer.oneLine)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {r.closingRule && (
              <div className="rounded-sm border border-border-subtle bg-zinc-50 px-3 py-3 dark:bg-zinc-800/60">
                <SubHeading>Meta-rule</SubHeading>
                <p className="text-base leading-7 text-text-secondary italic [text-wrap:pretty]">
                  {renderInline(r.closingRule)}
                </p>
              </div>
            )}

            {r.seeAlso && <SeeAlsoBlock seeAlso={r.seeAlso} />}

            {r.workedExample && <ExampleChip url={r.workedExample.url} />}
          </div>
        )}
      </div>
    </details>
  )
}
