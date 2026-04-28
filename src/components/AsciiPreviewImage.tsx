"use client"

import Image from "next/image"
import { useRef, type CSSProperties } from "react"

/**
 * Convert absolute URLs from our own server to relative paths.
 * Mirrors OptimizedImage's helper — required so Next.js's image loader
 * resolves locally in dev. Duplicated rather than imported because
 * OptimizedImage is server-only and importing from a server file into a
 * client file is fine, but the helper is small and self-contained.
 */
function toRelativeSrc(src: string): string {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
  if (serverUrl && src.startsWith(serverUrl)) {
    return src.slice(serverUrl.length)
  }
  return src
}

interface AsciiPreviewImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  style?: CSSProperties
  fetchPriority?: "high" | "low" | "auto"
  priority?: boolean
}

/**
 * Small client-only wrapper around <Image> that flips a sibling's
 * data-loaded attribute on the wrapper element when the image finishes
 * loading. This is the minimal client-component slice of
 * <ImageWithAsciiPreview>: the surrounding wrapper, the dominant-color
 * background, and the static ASCII <pre> all stay server-rendered so
 * Frame 0 (background + halftone) is paintable on the very first byte.
 *
 * The opacity transition itself lives in CSS
 * (`[data-loaded="true"] > .ascii-layer { opacity: 0 }` etc.) so this
 * component only needs to (a) render the <Image> and (b) toggle the
 * single attribute when load resolves.
 */
export function AsciiPreviewImage({
  src,
  alt,
  className = "",
  sizes,
  style,
  fetchPriority,
  priority = false,
}: AsciiPreviewImageProps) {
  // Use a ref to climb to the parent wrapper rather than passing a setter
  // down. The wrapper is the closest element with the [data-loaded] attr.
  const imgRef = useRef<HTMLImageElement | null>(null)

  return (
    <Image
      ref={imgRef}
      src={toRelativeSrc(src)}
      alt={alt}
      fill
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      className={className}
      style={style}
      priority={priority}
      fetchPriority={fetchPriority}
      placeholder="empty"
      onLoad={() => {
        // Climb to the nearest ancestor with the data-loaded attribute and
        // flip it. Using a DOM lookup (rather than an event handler that
        // forwards into a React state setter on a parent server component)
        // keeps this surgical: no parent state, no rerender.
        const el = imgRef.current
        if (!el) return
        const wrapper = el.closest('[data-loaded]') as HTMLElement | null
        if (wrapper) wrapper.dataset.loaded = "true"
      }}
    />
  )
}
