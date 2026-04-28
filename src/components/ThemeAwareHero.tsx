import { OptimizedImage } from "@/components/OptimizedImage";
import { ImageWithAsciiPreview } from "@/components/ImageWithAsciiPreview";
import { isMediaObject } from "@/lib/types/media";
import type { Media } from "@/payload-types";
import { ASCII_LENGTH } from "@/lib/preview/encode";

interface ThemeAwareHeroProps {
  light: number | Media | null | undefined;
  dark: number | Media | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  focalPoint?: { x?: number | null; y?: number | null } | null;
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
 * True when a media doc has a usable preview (color present AND ascii is the
 * canonical 288 chars). Either alone is non-rendering, but both must be valid
 * for the new ImageWithAsciiPreview path to win the dual-read.
 *
 * Truth table (per bot review #139 finding I2):
 *   preview present + lqip present  → ImageWithAsciiPreview (preview wins)
 *   preview present + lqip missing  → ImageWithAsciiPreview (preview wins)
 *   preview missing + lqip present  → OptimizedImage with blur (legacy lqip)
 *   preview missing + lqip missing  → OptimizedImage with FALLBACK 1×1 PNG
 *                                     (existing pre-#138 behavior — calmer
 *                                     than the original yellow flood for
 *                                     freshly-uploaded docs because the new
 *                                     hook also writes preview at upload)
 */
function hasUsablePreview(media: Media): boolean {
  const ascii = media.preview?.ascii ?? "";
  const color = media.preview?.color ?? "";
  return color.length > 0 && ascii.length === ASCII_LENGTH;
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
 * animation. The ASCII reveal transition lives on the inner ASCII layer
 * (.ascii-preview-layer), not on either of the two variant wrappers.
 *
 * The parent `relative` wrapper holds an `aspect-ratio` matching the source
 * images so swapping which child is `display: none` never causes layout shift.
 *
 * Per-variant render path:
 *  - If `preview` is populated (color + 288-char ascii) → ImageWithAsciiPreview
 *  - Else (legacy / not-yet-backfilled) → OptimizedImage with placeholder="blur"
 *    using the legacy `lqip` field (or falling back to the 1×1 PNG default
 *    inside OptimizedImage if neither is present).
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
}: ThemeAwareHeroProps) {
  if (!isMediaObject(light) || !light.url || !isMediaObject(dark) || !dark.url) {
    return null;
  }

  const width = light.width || 1200;
  const height = light.height || 630;
  const aspectStyle = { aspectRatio: `${width} / ${height}` };
  const imgStyle = focalPointStyle(focalPoint);

  const lightUsesPreview = hasUsablePreview(light);
  const darkUsesPreview = hasUsablePreview(dark);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`.trim()}
      style={aspectStyle}
    >
      {lightUsesPreview ? (
        <ImageWithAsciiPreview
          src={light.url}
          alt={light.alt || alt}
          fetchPriority="high"
          sizes={sizes}
          className="dark:hidden"
          style={imgStyle}
          preview={light.preview}
        />
      ) : (
        <OptimizedImage
          src={light.url}
          alt={light.alt || alt}
          fill
          fetchPriority="high"
          sizes={sizes}
          className="object-cover dark:hidden"
          style={imgStyle}
          blurDataURL={light.lqip ?? undefined}
        />
      )}
      {darkUsesPreview ? (
        <ImageWithAsciiPreview
          src={dark.url}
          alt={dark.alt || alt}
          fetchPriority="high"
          sizes={sizes}
          className="hidden dark:block"
          style={imgStyle}
          preview={dark.preview}
        />
      ) : (
        <OptimizedImage
          src={dark.url}
          alt={dark.alt || alt}
          fill
          fetchPriority="high"
          sizes={sizes}
          className="hidden object-cover dark:block"
          style={imgStyle}
          blurDataURL={dark.lqip ?? undefined}
        />
      )}
    </div>
  );
}
