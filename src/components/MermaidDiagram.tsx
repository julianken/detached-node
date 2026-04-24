'use client'

import mermaid from 'mermaid'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'

interface Props {
  source: string
}

// Cap each diagram's render scale to this value so text size is
// consistent across diagrams of different intrinsic widths. With a
// ~768px column, a sequence diagram of viewBox width ~1230 caps at
// scale 0.624 — pinning the global cap there keeps narrow diagrams
// from rendering at 1:1 (which would make their text visibly larger).
const TARGET_SCALE = 0.625

function capDiagramWidth(svgMarkup: string): string {
  const vbMatch = svgMarkup.match(/viewBox="[^"]*?\s(\d+(?:\.\d+)?)\s+\d+(?:\.\d+)?"/)
  if (!vbMatch) return svgMarkup
  const cap = Math.round(parseFloat(vbMatch[1]) * TARGET_SCALE)
  return svgMarkup.replace(/(style="[^"]*?max-width:\s*)\d+(?:\.\d+)?px/, `$1${cap}px`)
}

const subscribe = () => () => {}

export function MermaidDiagram({ source }: Props) {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastInitializedTheme = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!mounted) return

    let cancelled = false

    async function render() {
      const id = `mermaid-${crypto.randomUUID()}`
      const isDark = resolvedTheme === 'dark'
      const theme = isDark ? 'dark' : 'default'

      if (lastInitializedTheme.current !== theme) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme,
          sequence: { useMaxWidth: true },
          flowchart: { useMaxWidth: true },
          themeVariables: isDark
            ? {
                signalColor: '#d4d4d8',
                signalTextColor: '#f4f4f5',
                loopTextColor: '#18181b',
                noteTextColor: '#f4f4f5',
                actorTextColor: '#f4f4f5',
              }
            : undefined,
        })
        lastInitializedTheme.current = theme
      }

      try {
        const { svg: rendered } = await mermaid.render(id, source)
        if (!cancelled) {
          setSvg(capDiagramWidth(rendered))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setSvg(null)
        }
      }
    }

    render()

    return () => {
      cancelled = true
    }
  }, [source, resolvedTheme, mounted])

  if (error !== null) {
    return (
      <div className="my-6 overflow-x-auto">
        <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
          Failed to render diagram.
        </p>
        <pre className="rounded-sm border border-zinc-200 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {source}
        </pre>
      </div>
    )
  }

  if (!mounted || svg === null) {
    return (
      <div
        className="my-10 min-h-[12rem] animate-pulse rounded-sm bg-zinc-100 dark:bg-zinc-800"
        aria-label="Loading diagram"
      />
    )
  }

  return (
    <div
      className="mermaid-figure my-10"
      // mermaid.render() produces sanitized SVG; securityLevel:'strict' prevents injection
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
