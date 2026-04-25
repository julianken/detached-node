'use client'

import mermaid from 'mermaid'
import panzoom from 'panzoom'
import type { PanZoom } from 'panzoom'
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
  const [glitchKey, setGlitchKey] = useState(0)
  const [closing, setClosing] = useState(false)
  const lastInitializedTheme = useRef<string | undefined>(undefined)
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const pzRef = useRef<PanZoom | null>(null)

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
    setGlitchKey((k) => k + 1)
    dialogRef.current?.showModal()
    // Wait one frame so the dialog has laid out (otherwise panzoom
    // initializes against zero-size bounds and the first interaction is dead).
    requestAnimationFrame(() => {
      const svgEl = stageRef.current?.querySelector('svg') as SVGSVGElement | null
      if (!svgEl) return
      pzRef.current = panzoom(svgEl, {
        maxZoom: 4,
        minZoom: 0.25,
        bounds: true,
        boundsPadding: 0.15,
        smoothScroll: false,
        zoomDoubleClickSpeed: 1,
      })
      // Defer fit one more frame so panzoom finishes its own first-frame
      // setup before we apply the initial fit transform.
      requestAnimationFrame(fitToScreen)
    })
  }

  function closeDialog() {
    if (closing) return
    setClosing(true)
    // Let the glitch-out animation play before actually closing.
    window.setTimeout(() => {
      pzRef.current?.dispose()
      pzRef.current = null
      dialogRef.current?.close()
      triggerRef.current?.focus()
      setClosing(false)
    }, 150)
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) closeDialog()
  }

  function handleDialogCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    // Intercept Esc so the panel can play its exit animation before
    // the dialog actually closes.
    e.preventDefault()
    closeDialog()
  }

  function zoomBy(factor: number) {
    const pz = pzRef.current
    const stage = stageRef.current
    if (!pz || !stage) return
    const r = stage.getBoundingClientRect()
    pz.smoothZoom(r.width / 2, r.height / 2, factor)
  }

  function fitToScreen() {
    const pz = pzRef.current
    const stage = stageRef.current
    if (!pz || !stage) return
    const svg = stage.querySelector('svg') as SVGSVGElement | null
    if (!svg) return
    // Reset transform first so getBoundingClientRect reflects the SVG's
    // natural (post-layout) size, then compute the scale that fits both
    // axes inside the stage and translate so the result is centered.
    pz.zoomAbs(0, 0, 1)
    pz.moveTo(0, 0)
    const sr = stage.getBoundingClientRect()
    const vr = svg.getBoundingClientRect()
    if (vr.width === 0 || vr.height === 0) return
    const scale = Math.min(sr.width / vr.width, sr.height / vr.height, 1)
    pz.zoomAbs(0, 0, scale)
    const tx = (sr.width - vr.width * scale) / 2
    const ty = (sr.height - vr.height * scale) / 2
    pz.moveTo(tx, ty)
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

  const chromeBtn =
    'inline-flex h-9 w-9 items-center justify-center bg-transparent text-text-tertiary ' +
    'transition-colors duration-150 hover:bg-hover-bg hover:text-accent ' +
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring'

  return (
    <>
      <div className="mermaid-figure my-10">
        <button
          ref={triggerRef}
          type="button"
          onClick={openDialog}
          aria-label="Expand diagram"
          className="group relative block w-full cursor-zoom-in rounded-sm border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
        >
          <span
            className="block text-center"
            // mermaid.render() produces sanitized SVG; securityLevel:'strict' prevents injection
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-surface/85 text-text-tertiary opacity-60 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </span>
        </button>
      </div>
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        onCancel={handleDialogCancel}
        aria-label="Expanded diagram"
        className="mermaid-lightbox m-auto h-[90vh] w-[min(95vw,1400px)] overflow-hidden border-0 bg-transparent p-0 backdrop:bg-[rgb(6_5_10_/_0.92)] backdrop:backdrop-blur-md"
      >
        <div
          key={glitchKey}
          className={`${closing ? 'glitch-conceal' : 'glitch-reveal'} relative h-full w-full overflow-hidden rounded-sm border border-border bg-surface shadow-[0_0_24px_rgba(180,156,255,0.08)]`}
        >
          <span aria-hidden="true" className="frame-label">DIAGRAM</span>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className={`absolute right-3 top-3 z-10 rounded-sm border-0 ${chromeBtn}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div
            ref={stageRef}
            className="mermaid-lightbox-stage relative h-full w-full"
            // mermaid.render() produces sanitized SVG; securityLevel:'strict' prevents injection
            dangerouslySetInnerHTML={{ __html: uncapDiagramWidth(svg) }}
          />
          <div
            role="group"
            aria-label="Zoom controls"
            className="absolute bottom-4 right-4 z-10 inline-flex items-stretch overflow-hidden rounded-sm border border-border bg-surface/95 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => zoomBy(0.8)}
              aria-label="Zoom out"
              className={chromeBtn}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>
            <button
              type="button"
              onClick={fitToScreen}
              aria-label="Fit to screen"
              className={`${chromeBtn} border-l border-border`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => zoomBy(1.25)}
              aria-label="Zoom in"
              className={`${chromeBtn} border-l border-border`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
