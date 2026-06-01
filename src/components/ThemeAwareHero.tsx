import { HeroImagePair } from "@/components/HeroImagePair";
import { isMediaObject } from "@/lib/types/media";
import type { Media } from "@/payload-types";

interface ThemeAwareHeroProps {
  light: number | Media | null | undefined;
  dark: number | Media | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  focalPoint?: { x?: number | null; y?: number | null } | null;
  aspectRatio?: string;
}

/**
 * Returns an objectPosition style only when the focal point diverges from 50/50.
 * Skips the inline style for the default (50/50) — keeps DevTools clean and avoids
 * unnecessary re-renders on the vast majority of posts.
 */
function focalPointStyle(
  fp?: { x?: number | null; y?: number | null } | null
): React.CSSProperties | undefined {
  if (!fp) return undefined;
  const x = fp.x ?? 50;
  const y = fp.y ?? 50;
  if (x === 50 && y === 50) return undefined;
  return { objectPosition: `${x}% ${y}%` };
}

/**
 * Convert absolute URLs from our own server to relative paths.
 * Payload generates full URLs using NEXT_PUBLIC_SERVER_URL, but in dev
 * the images are served locally — relative paths let Next.js resolve them.
 */
function toRelativeSrc(src: string): string {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverUrl && src.startsWith(serverUrl)) {
    return src.slice(serverUrl.length);
  }
  return src;
}

/**
 * Renders a pair of theme-matched hero images stacked in the same container.
 *
 * The light variant is visible in light mode (`hidden` in dark mode) and the
 * dark variant is visible in dark mode (`hidden` in light mode). When the
 * site-wide theme toggle runs inside `document.startViewTransition()`, the
 * browser takes a snapshot of the page before and after the class flip and
 * crossfades between them automatically. We intentionally do NOT add any
 * `transition-opacity` or fade CSS here on the wrapper — a CSS transition
 * would compete with the View Transitions snapshot crossfade and degrade the
 * animation.
 *
 * The parent `relative` wrapper holds an `aspect-ratio` matching the source
 * images so swapping which child is `display: none` never causes layout shift.
 *
 * This component stays a server component: it does the Media null-guard, URL
 * normalization, focal-point math, and aspect-ratio sizing, then hands the
 * image pair to {@link HeroImagePair} — a thin `"use client"` child that owns
 * the load-aware spinner + glitch-in reveal. Keeping the boundary here means
 * the public props and call sites (PostCard, posts/[slug]) are unchanged.
 *
 * LCP note: both children are `loading="lazy"` by default with
 * `fetchPriority="high"`. The browser correctly skips lazy-loading the
 * `display: none` variant, so we don't accidentally pay for both images on
 * initial render.
 */
export function ThemeAwareHero({
  light,
  dark,
  alt,
  className = "",
  sizes,
  focalPoint,
  aspectRatio,
}: ThemeAwareHeroProps) {
  if (!isMediaObject(light) || !light.url || !isMediaObject(dark) || !dark.url) {
    return null;
  }

  const width = light.width || 1200;
  const height = light.height || 630;
  const aspectStyle = { aspectRatio: aspectRatio ?? `${width} / ${height}` };
  const imgStyle = focalPointStyle(focalPoint);
  const resolvedSizes =
    sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`.trim()}
      style={aspectStyle}
    >
      <HeroImagePair
        lightSrc={toRelativeSrc(light.url)}
        darkSrc={toRelativeSrc(dark.url)}
        lightAlt={light.alt || alt}
        darkAlt={dark.alt || alt}
        sizes={resolvedSizes}
        imgStyle={imgStyle}
      />
    </div>
  );
}
