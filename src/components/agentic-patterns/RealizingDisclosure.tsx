// ---------------------------------------------------------------------------
// RealizingDisclosure — W1.0
// ---------------------------------------------------------------------------
// Third collapsible disclosure on each ADP satellite page. Renders only when
// pattern.realizingInClaudeCode is defined; callers guard with && so absent
// patterns render nothing.
//
// Dispatches on tier:
//   Tier A — 5 sub-sections: CC primitives, scaffolding, worked example,
//             reader move, see also
//   Tier B  — compact: reader move + see also (+ optional body prose)
//   Tier C  — cross-link paragraph: body prose + reader move + see also
//   Tier U  — umbrella index: opening framing + pointer list + closing rule
//             + see also
//
// All styles follow the design system (zinc dark theme, Tailwind utilities).
// ---------------------------------------------------------------------------

import { DisclosureSection } from './DisclosureSection'
import type { Pattern, RealizingInClaudeCode, CcSeeAlso } from '@/data/agentic-design-patterns/types'

interface RealizingDisclosureProps {
  pattern: Pattern
}

// ---------------------------------------------------------------------------
// Sub-section heading (shared chrome)
// ---------------------------------------------------------------------------

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
      {children}
    </h4>
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
  const hasSkillPath = Boolean(seeAlso.skillPath)
  const hasArticleSlug = Boolean(seeAlso.articleSlug)

  if (!hasSiblings && !hasSkillPath && !hasArticleSlug) return null

  return (
    <div className="mt-3 border-t border-border-subtle pt-3">
      <SubHeading>See also</SubHeading>
      <ul className="flex flex-col gap-1">
        {hasSkillPath && (
          <li className="font-mono text-xs text-text-secondary">
            Skill: <span className="text-text-primary">{seeAlso.skillPath}</span>
          </li>
        )}
        {hasArticleSlug && (
          <li className="font-mono text-xs text-text-secondary">
            Article:{' '}
            <span className="text-text-primary">/{seeAlso.articleSlug}</span>
          </li>
        )}
        {hasSiblings && (
          <li className="font-mono text-xs text-text-secondary">
            Related patterns:{' '}
            <span className="text-text-primary">
              {seeAlso.siblingPatternSlugs!.join(' · ')}
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reader move block (shared Tier A / B / C)
// ---------------------------------------------------------------------------

function ReaderMoveBlock({ text, anchorUrl }: { text: string; anchorUrl: string }) {
  return (
    <div className="rounded-sm border border-border-subtle bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60">
      <SubHeading>Monday-morning move</SubHeading>
      <p className="text-sm leading-6 text-text-secondary">
        {text}{' '}
        <a
          href={anchorUrl}
          className="font-mono text-xs text-accent underline underline-offset-2 hover:no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          [anchor]
        </a>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier A body
// ---------------------------------------------------------------------------

function TierABody({ r }: { r: RealizingInClaudeCode }) {
  return (
    <div className="flex flex-col gap-4">
      {r.ccPrimitives && r.ccPrimitives.length > 0 && (
        <div>
          <SubHeading>CC primitives</SubHeading>
          <PillList items={r.ccPrimitives} />
        </div>
      )}

      {r.scaffolding && r.scaffolding.length > 0 && (
        <div>
          <SubHeading>Scaffolding</SubHeading>
          <PillList items={r.scaffolding} />
        </div>
      )}

      {r.workedExample && (
        <div>
          <SubHeading>Worked example</SubHeading>
          <a
            href={r.workedExample.url}
            className="text-sm text-accent underline underline-offset-2 hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {r.workedExample.description}
          </a>
        </div>
      )}

      {r.readerMove && (
        <ReaderMoveBlock text={r.readerMove.text} anchorUrl={r.readerMove.anchorUrl} />
      )}

      {r.seeAlso && <SeeAlsoBlock seeAlso={r.seeAlso} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier B body (compact: reader move + see also + optional body prose)
// ---------------------------------------------------------------------------

function TierBBody({ r }: { r: RealizingInClaudeCode }) {
  return (
    <div className="flex flex-col gap-4">
      {r.bodyMarkdown && (
        <p className="text-sm leading-6 text-text-secondary [text-wrap:pretty]">
          {r.bodyMarkdown}
        </p>
      )}

      {r.readerMove && (
        <ReaderMoveBlock text={r.readerMove.text} anchorUrl={r.readerMove.anchorUrl} />
      )}

      {r.seeAlso && <SeeAlsoBlock seeAlso={r.seeAlso} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier C body (cross-link paragraph: body prose required + reader move + see also)
// ---------------------------------------------------------------------------

function TierCBody({ r }: { r: RealizingInClaudeCode }) {
  return (
    <div className="flex flex-col gap-4">
      {r.bodyMarkdown && (
        <p className="text-sm leading-6 text-text-secondary [text-wrap:pretty]">
          {r.bodyMarkdown}
        </p>
      )}

      {r.readerMove && (
        <ReaderMoveBlock text={r.readerMove.text} anchorUrl={r.readerMove.anchorUrl} />
      )}

      {r.seeAlso && <SeeAlsoBlock seeAlso={r.seeAlso} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier U body (umbrella index)
// ---------------------------------------------------------------------------

function TierUBody({ r }: { r: RealizingInClaudeCode }) {
  return (
    <div className="flex flex-col gap-4">
      {r.openingFraming && (
        <p className="text-sm leading-6 text-text-secondary [text-wrap:pretty]">
          {r.openingFraming}
        </p>
      )}

      {r.umbrellaPointers && r.umbrellaPointers.length > 0 && (
        <div>
          <SubHeading>Pattern index</SubHeading>
          <ul className="flex flex-col gap-1.5">
            {r.umbrellaPointers.map((pointer) => (
              <li
                key={pointer.patternSlug}
                className="flex items-baseline gap-2 text-sm text-text-secondary"
              >
                <span className="shrink-0 font-mono text-xs text-text-tertiary">
                  {pointer.patternSlug}
                </span>
                <span className="text-text-secondary">{pointer.oneLine}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.closingRule && (
        <div className="rounded-sm border border-border-subtle bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60">
          <SubHeading>Meta-rule</SubHeading>
          <p className="font-mono text-xs leading-5 text-text-secondary italic">
            {r.closingRule}
          </p>
        </div>
      )}

      {r.seeAlso && <SeeAlsoBlock seeAlso={r.seeAlso} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function RealizingDisclosure({ pattern }: RealizingDisclosureProps) {
  const r = pattern.realizingInClaudeCode
  if (!r) return null

  return (
    <DisclosureSection
      id="realizing-disclosure"
      label="Realizing in Claude Code"
    >
      {r.tier === 'A' && <TierABody r={r} />}
      {r.tier === 'B' && <TierBBody r={r} />}
      {r.tier === 'C' && <TierCBody r={r} />}
      {r.tier === 'U' && <TierUBody r={r} />}
    </DisclosureSection>
  )
}
