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

export function capDiagramWidth(svgMarkup: string): string {
  const vbMatch = svgMarkup.match(/viewBox="[^"]*?\s(\d+(?:\.\d+)?)\s+\d+(?:\.\d+)?"/)
  if (!vbMatch) return svgMarkup
  const cap = Math.round(parseFloat(vbMatch[1]) * TARGET_SCALE)
  return svgMarkup.replace(/(style="[^"]*?max-width:\s*)\d+(?:\.\d+)?px/, `$1${cap}px`)
}

export function uncapDiagramWidth(svgMarkup: string): string {
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
  const closingRef = useRef(false)
  const closeTimerRef = useRef<number | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
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

  // Clear any in-flight close timer on unmount so a pending dialog.close()
  // doesn't fire against an unmounted component.
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [])

  function openDialog() {
    // If a close animation is still in flight, cancel its timer so the
    // lingering timeout cannot fire dialog.close() on the just-reopened
    // dialog (~500ms after the user clicked to re-open). Without this,
    // the lightbox blinks shut on its own after a rapid close→reopen.
    if (closeTimerRef.current !== null) {
      // Cancel the stale close so dialog.close() doesn't fire ~500ms after
      // re-open. Remove 'is-closing' so the backdrop's fade-out transition
      // stops mid-flight. The panel itself doesn't need DOM surgery here:
      // setGlitchKey (below) unmounts the old keyed panel and mounts a fresh
      // one with className="glitch-reveal …" from JSX, re-running the entry
      // animation on the new node.
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
      closingRef.current = false
      dialogRef.current?.classList.remove('is-closing')
    }
    setGlitchKey((k) => k + 1)
    // Dispose any panzoom instance left over from the previous session.
    // We defer dispose to here (rather than running it during close) so the
    // SVG keeps its fit transform throughout the exit animation — otherwise
    // the diagram snaps back to its natural (much larger) size for one
    // visible frame as the lightbox fades out.
    pzRef.current?.dispose()
    pzRef.current = null
    dialogRef.current?.classList.remove('is-closing')
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
    if (closingRef.current) return
    closingRef.current = true
    // Drive the class swap via DOM mutation, NOT React state. React
    // re-rendering the panel causes it to re-set the stage's innerHTML
    // (because reading innerHTML back returns serialized markup that
    // differs from the input string), which wipes panzoom's transform
    // mid-animation and produces a "diagram flash zoomed in" frame.
    panelRef.current?.classList.remove('glitch-reveal')
    panelRef.current?.classList.add('glitch-conceal')
    dialogRef.current?.classList.add('is-closing')
    // Let the glitch-out animation play before actually closing. We
    // intentionally do NOT dispose panzoom here — the next openDialog
    // disposes any leftover instance before initializing a new one.
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      dialogRef.current?.close()
      triggerRef.current?.focus()
      closingRef.current = false
    }, 600)
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
    // axes inside the stage minus padding so the diagram doesn't crowd
    // the panel edges (or the close + zoom-control chrome).
    pz.zoomAbs(0, 0, 1)
    pz.moveTo(0, 0)
    const sr = stage.getBoundingClientRect()
    const vr = svg.getBoundingClientRect()
    if (vr.width === 0 || vr.height === 0) return
    const PAD = 56
    const availW = Math.max(sr.width - PAD * 2, 1)
    const availH = Math.max(sr.height - PAD * 2, 1)
    const scale = Math.min(availW / vr.width, availH / vr.height, 1)
    pz.zoomAbs(0, 0, scale)
    const tx = (sr.width - vr.width * scale) / 2
    const ty = (sr.height - vr.height * scale) / 2
    pz.moveTo(tx, ty)
  }

  // F2: When the theme flips while the lightbox is open, the render effect
  // above updates `svg` state and React re-renders the stage with the new
  // SVG markup. The old pzRef still points at the previous (now-detached)
  // SVG node — all pan/zoom gestures become dead. Re-initialize panzoom
  // against the freshly mounted SVG element whenever `svg` changes and the
  // dialog is currently open. Dispose first to avoid duplicate listeners.
  // This path is separate from openDialog, which also disposes (handling
  // the "leftover from a previous session" case on normal re-open).
  useEffect(() => {
    if (!dialogRef.current?.open) return
    pzRef.current?.dispose()
    pzRef.current = null
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
      requestAnimationFrame(fitToScreen)
    })
  }, [svg])

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
        className="mermaid-lightbox m-auto h-[90vh] w-[min(95vw,1400px)] overflow-hidden border-0 bg-transparent p-0 backdrop:bg-[rgb(6_5_10_/_0.75)] backdrop:backdrop-blur-sm"
      >
        <div
          key={glitchKey}
          ref={panelRef}
          className="glitch-reveal relative h-full w-full overflow-hidden rounded-sm border border-border bg-surface shadow-[0_0_24px_rgba(180,156,255,0.08)]"
        >
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
