import { OptimizedImage } from "@/components/OptimizedImage";
import { isMediaObject } from "@/lib/types/media";
import type { Media } from "@/payload-types";

interface ThemeAwareHeroProps {
  light: number | Media | null | undefined;
  dark: number | Media | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
}

/**
 * Renders a pair of theme-matched hero images stacked in the same container.
 *
 * The light variant is visible in light mode (`hidden` in dark mode) and the
 * dark variant is visible in dark mode (`hidden` in light mode). When the
 * site-wide theme toggle runs inside `document.startViewTransition()`, the
 * browser takes a snapshot of the page before and after the class flip and
 * crossfades between them automatically. We intentionally do NOT add any
 * `transition-opacity` or fade CSS here — a CSS transition would compete with
 * the View Transitions snapshot crossfade and degrade the animation.
 *
 * The parent `relative` wrapper holds an `aspect-ratio` matching the source
 * images so swapping which child is `display: none` never causes layout shift.
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
}: ThemeAwareHeroProps) {
  if (!isMediaObject(light) || !light.url || !isMediaObject(dark) || !dark.url) {
    return null;
  }

  const width = light.width || 1200;
  const height = light.height || 630;
  const aspectStyle = { aspectRatio: `${width} / ${height}` };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`.trim()}
      style={aspectStyle}
    >
      <OptimizedImage
        src={light.url}
        alt={light.alt || alt}
        fill
        fetchPriority="high"
        sizes={sizes}
        className="object-cover dark:hidden"
      />
      <OptimizedImage
        src={dark.url}
        alt={dark.alt || alt}
        fill
        fetchPriority="high"
        sizes={sizes}
        className="hidden object-cover dark:block"
      />
    </div>
  );
}
