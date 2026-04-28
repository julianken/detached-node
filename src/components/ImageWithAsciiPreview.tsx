import type { CSSProperties } from "react"
import { AsciiPreviewImage } from "@/components/AsciiPreviewImage"
import { ASCII_COLS, ASCII_LENGTH, ASCII_ROWS } from "@/lib/preview/encode"

interface ImageWithAsciiPreviewProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  style?: CSSProperties
  fetchPriority?: "high" | "low" | "auto"
  priority?: boolean
  /**
   * Content-aware preview from the Media collection's `preview` group.
   * `color` is `#rrggbb`; `ascii` is exactly 288 chars (24×12, row-major).
   * Either may be missing — the component degrades:
   *   - missing color → `var(--surface)` background
   *   - missing or wrong-length ascii → no <pre> rendered
   * Both failure modes are calmer than the original LQIP yellow flood.
   */
  preview?: { color?: string | null; ascii?: string | null } | null
}

/**
 * Validates and splits an ASCII halftone string into one row per array
 * element, preserving original character order (row-major). Returns null
 * when the input is missing or wrong length so the caller can omit the
 * <pre> entirely.
 */
function splitAsciiRows(ascii?: string | null): string[] | null {
  if (!ascii || ascii.length !== ASCII_LENGTH) return null
  const rows: string[] = []
  for (let r = 0; r < ASCII_ROWS; r++) {
    rows.push(ascii.slice(r * ASCII_COLS, (r + 1) * ASCII_COLS))
  }
  return rows
}

/**
 * Renders an image with a content-aware ASCII halftone preview painted
 * underneath it. The preview is server-rendered so Frame 0 is visible
 * the instant the wrapper paints (no JS required, no SVG filter chain,
 * no transparent-PNG fallback that could turn yellow under
 * Next.js's blur SVG filter).
 *
 * Component split (per bot review #139 finding B1):
 *  - This component is a Server Component. It renders the
 *    `<div data-loaded="false">` wrapper, the dominant-color background,
 *    and the static ASCII `<pre>`. Frame 0 is paintable from SSR HTML.
 *  - The actual `<Image>` (with `onLoad`) lives in <AsciiPreviewImage>,
 *    a small `"use client"` child that toggles `data-loaded="true"` on
 *    its nearest ancestor with that attribute.
 *  - CSS in globals.css drives the opacity transition off the
 *    `[data-loaded]` attribute selector — so the reveal is style-only.
 *
 * If you change the wrapper's data attribute name, also update:
 *  - `AsciiPreviewImage.tsx` (the closest('[data-loaded]') selector)
 *  - `globals.css` (`.ascii-preview-wrapper` rules under [data-loaded])
 */
export function ImageWithAsciiPreview({
  src,
  alt,
  className = "",
  sizes,
  style,
  fetchPriority,
  priority,
  preview,
}: ImageWithAsciiPreviewProps) {
  const color = preview?.color ?? undefined
  const rows = splitAsciiRows(preview?.ascii)

  // Tailwind utility merge — wrapper holds the [data-loaded] attribute that
  // CSS uses to drive both the ASCII fade-out and the image fade-in.
  const wrapperClass = `ascii-preview-wrapper ${className}`.trim()

  return (
    <div
      className={wrapperClass}
      data-loaded="false"
      style={{
        // Set the dominant-color fallback as a CSS variable so the .ascii-preview-bg
        // pseudo-element / child can read it without inline-styling each child.
        // Falling back to `var(--surface)` when color is missing keeps the wrapper
        // calm rather than transparent (which would let the page background bleed
        // through and look broken).
        ...(color ? ({ "--preview-color": color } as CSSProperties) : null),
      }}
    >
      {/* Background fill — sits at z=0 behind both the ASCII layer and the image. */}
      <div className="ascii-preview-bg" aria-hidden="true" />

      {/* ASCII halftone layer — server-rendered, fades out on load. */}
      {rows && (
        <pre className="ascii-preview-layer" aria-hidden="true">
          {rows.join("\n")}
        </pre>
      )}

      {/* Real image — client-rendered (onLoad needs a Client Component). */}
      <AsciiPreviewImage
        src={src}
        alt={alt}
        className="ascii-preview-img"
        sizes={sizes}
        style={style}
        fetchPriority={fetchPriority}
        priority={priority}
      />
    </div>
  )
}
