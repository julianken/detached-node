// ---------------------------------------------------------------------------
// postBodyConverters
// ---------------------------------------------------------------------------
// JSX converter composition for post body rich-text rendering. Composes:
//
//   1. mermaidConverters(args) — brings in defaultConverters + the Mermaid
//      block override. This is a factory function (`JSXConvertersFunction`),
//      not an object literal; it MUST be invoked with `args`, not spread.
//
//   2. LinkJSXConverter — the canonical default link converter pair
//      (`link` + `autolink`). We hold a reference to its `link` so the
//      citation override below can delegate to it explicitly.
//
//   3. A citation-aware `link` override that wraps link nodes whose URL
//      matches `/^#ref-\d+$/` in a <sup>. Authors mark inline citations by
//      inserting a normal Lexical link pointing at `#ref-1`, `#ref-2`, etc.;
//      the rendered anchor jumps to the matching <li id="ref-N"> in
//      PostReferencesSection.
//
// Composition order is load-bearing.
//
// `mermaidConverters` already re-spreads `defaultConverters`, which includes
// the framework default `link`. If the citation override were placed BEFORE
// `...mermaidConverters(args)` it would be silently clobbered. The override
// MUST come last.
//
// The override MUST NOT return `null` for non-citation links. Payload's
// converter loop runs `.filter(Boolean)` on the produced JSX (see
// `node_modules/@payloadcms/richtext-lexical/dist/features/converters/lexicalToJSX/converter/index.js:261`),
// so a `null` return silently deletes the entire link node — every plain
// hyperlink in post bodies would vanish. We explicitly delegate to
// `linkPair.link(linkArgs)` for the non-citation branch.

import {
  LinkJSXConverter,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { DefaultNodeTypes } from '@payloadcms/richtext-lexical'
import { mermaidConverters } from './mermaid-converter'

const CITATION_HREF = /^#ref-\d+$/

export const postBodyConverters: JSXConvertersFunction<DefaultNodeTypes> = (
  args,
) => {
  // Citation links are author-maintained `#ref-N` fragments — no Payload
  // document lookup is involved. internalDocToHref still has to exist for
  // the converter pair to render any true internal-doc link cleanly; we
  // route it to `#` as a safe fallback (no Posts collection currently links
  // to other Posts via the internal-doc picker; if that changes, replace
  // with a real Payload doc-to-href resolver).
  const linkPair = LinkJSXConverter({
    internalDocToHref: () => '#',
  })

  // `JSXConverter<T>` is `((args) => ReactNode) | ReactNode`. Payload ships
  // `link` as a function, but the type union forces a narrow before call.
  // We capture the narrowed function once so both branches below can invoke
  // it without repeating the guard.
  const defaultLink = linkPair.link
  if (typeof defaultLink !== 'function') {
    // Should never happen — LinkJSXConverter ships a function. We throw
    // rather than return null so a future Payload upgrade that changes the
    // converter shape surfaces loudly instead of silently deleting links.
    throw new Error(
      'postBodyConverters: LinkJSXConverter returned a non-function link converter',
    )
  }

  return {
    // Mermaid + framework defaults (re-spreads defaultConverters internally).
    ...mermaidConverters(args),
    // Canonical link/autolink pair (anchors at known shape).
    ...linkPair,
    // Citation-aware link override — MUST come after the spreads above, or
    // the framework's default `link` clobbers it.
    link: (linkArgs) => {
      const href = linkArgs.node.fields.url ?? ''
      const isCitation =
        linkArgs.node.fields.linkType === 'custom' && CITATION_HREF.test(href)
      if (isCitation) {
        return (
          <sup className="align-super text-meta">
            {defaultLink(linkArgs)}
          </sup>
        )
      }
      // Explicit delegation — never return null. Payload's converter loop
      // filters null with .filter(Boolean), which would silently delete
      // every plain hyperlink in post bodies (BLOCKER regression guard).
      return defaultLink(linkArgs)
    },
  }
}
