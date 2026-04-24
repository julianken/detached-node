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

function uncapDiagramWidth(svgMarkup: string): string {
  // Strip the inline max-width so the SVG fills the lightbox container.
  // The id is kept identical to the inline copy so mermaid's embedded
  // <style> rules (scoped via that id) continue to apply.
  return svgMarkup.replace(/max-width:\s*\d+(?:\.\d+)?px;?\s*/, '')
}

const subscribe = () => () => {}

export function MermaidDiagram({ source }: Props) {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastInitializedTheme = useRef<string | undefined>(undefined)
  const dialogRef = useRef<HTMLDialogElement | null>(null)

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

  function openDialog() {
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) closeDialog()
  }

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
    <>
      <div className="mermaid-figure my-10">
        <button
          type="button"
          onClick={openDialog}
          aria-label="Expand diagram"
          className="group relative block w-full cursor-zoom-in rounded-sm border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          <span
            className="block"
            // mermaid.render() produces sanitized SVG; securityLevel:'strict' prevents injection
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/45 text-white opacity-50 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </span>
        </button>
      </div>
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-label="Expanded diagram"
        className="m-auto h-[90vh] w-[min(95vw,1400px)] border-0 bg-transparent p-0 backdrop:bg-zinc-950/85 backdrop:backdrop-blur-sm"
      >
        <div className="relative flex h-full w-full flex-col overflow-auto rounded-md border border-zinc-200 bg-white p-10 dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-md border-0 bg-transparent text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:bg-zinc-100 focus-visible:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:bg-zinc-800 dark:focus-visible:text-zinc-100"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div
            className="flex justify-center [touch-action:pinch-zoom]"
            // mermaid.render() produces sanitized SVG; securityLevel:'strict' prevents injection
            dangerouslySetInnerHTML={{ __html: uncapDiagramWidth(svg) }}
          />
        </div>
      </dialog>
    </>
  )
}
