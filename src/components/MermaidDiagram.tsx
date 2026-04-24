'use client'

import mermaid from 'mermaid'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'

interface Props {
  source: string
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
      const theme = resolvedTheme === 'dark' ? 'dark' : 'default'

      if (lastInitializedTheme.current !== theme) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme,
        })
        lastInitializedTheme.current = theme
      }

      try {
        const { svg: rendered } = await mermaid.render(id, source)
        if (!cancelled) {
          setSvg(rendered)
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
        className="my-6 min-h-[12rem] animate-pulse rounded-sm bg-zinc-100 dark:bg-zinc-800"
        aria-label="Loading diagram"
      />
    )
  }

  return (
    <div
      className="my-6 flex justify-center overflow-x-auto"
      // mermaid.render() produces sanitized SVG; securityLevel:'strict' prevents injection
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
