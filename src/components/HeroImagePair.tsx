"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

interface HeroImagePairProps {
  lightSrc: string;
  darkSrc: string;
  lightAlt: string;
  darkAlt: string;
  sizes: string;
  /** objectPosition style for both variants, or undefined for the 50/50 default. */
  imgStyle?: CSSProperties;
}

function rand(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

/**
 * Returns the per-instance CSS custom properties that drive the shared
 * `.glitch-reveal` keyframes (see globals.css). Mirrors FadeReveal so each
 * hero reveal jitters slightly differently instead of marching in lockstep.
 */
function glitchVars(): CSSProperties {
  return {
    "--gr-jitter-1": `${rand(0.5, 1.2)}px`,
    "--gr-jitter-2": `${rand(-0.8, -0.3)}px`,
    "--gr-jitter-3": `${rand(0.1, 0.5)}px`,
    "--gr-mid-opacity": `${rand(0.5, 0.75)}`,
    animationDuration: `${rand(280, 360)}ms`,
  } as CSSProperties;
}

/**
 * Load-aware hero image pair. Renders the two stacked theme variants
 * (light visible in light mode, dark visible in dark mode) and manages a
 * loading spinner + glitch-in reveal:
 *
 * - Cached case: a layout effect detects `img.complete` synchronously on
 *   mount (before the browser paints), so a warm image appears INSTANTLY —
 *   no spinner flash, no glitch.
 * - Real-load case: the spinner shows while the visible variant streams in;
 *   that variant's `onLoad` removes the spinner and applies `.glitch-reveal`
 *   for a quick glitch-in.
 *
 * `prefers-reduced-motion: reduce` is honored by the global media query in
 * globals.css, which collapses every animation (including `.glitch-reveal`)
 * to ~0ms — the image simply appears, with the spinner still allowed.
 *
 * The reveal class lives on a theme-agnostic inner wrapper that holds BOTH
 * variants, so the glitch reads correctly whichever variant the theme is
 * currently displaying. We deliberately keep the variants themselves free of
 * any opacity / transition classes so the View Transitions crossfade on the
 * site-wide theme toggle is not degraded (see issue #53).
 */
export function HeroImagePair({
  lightSrc,
  darkSrc,
  lightAlt,
  darkAlt,
  sizes,
  imgStyle,
}: HeroImagePairProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  // `loaded` gates the spinner; `glitch` is true only after a genuine load
  // (never for a cached image). Both start false so the SSR/first paint shows
  // the spinner; the layout effect flips them before paint for warm images.
  const [state, setState] = useState<{
    loaded: boolean;
    glitch: boolean;
    vars: CSSProperties;
  }>({ loaded: false, glitch: false, vars: {} });

  /** The currently displayed variant (the other is `display: none`). */
  function visibleImg(): HTMLImageElement | null {
    const imgs = innerRef.current?.querySelectorAll("img");
    if (!imgs) return null;
    for (const img of imgs) {
      if (window.getComputedStyle(img).display !== "none") {
        return img as HTMLImageElement;
      }
    }
    return null;
  }

  useLayoutEffect(() => {
    // Synchronous, pre-paint cache check: if the visible variant is already
    // decoded, reveal it instantly with no spinner and no glitch.
    const img = visibleImg();
    if (img?.complete && img.naturalWidth > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ loaded: true, glitch: false, vars: {} });
    }
    // Empty deps: this is a one-shot mount probe, mirroring FadeReveal.
  }, []);

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    // Only the visible variant drives the reveal; the hidden (display:none)
    // variant still fires onLoad as it streams, but it must not flip state.
    if (window.getComputedStyle(e.currentTarget).display === "none") return;
    setState((prev) => {
      if (prev.loaded) return prev;
      // Reaching here means the spinner was actually shown (not cached at
      // mount), so this is a genuine load → glitch-in.
      return { loaded: true, glitch: true, vars: glitchVars() };
    });
  }

  return (
    <>
      {/* Centered loading spinner, shown only while the visible variant loads. */}
      {!state.loaded && (
        <div
          className="hero-spinner pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
        </div>
      )}
      {/* `absolute inset-0` makes this the positioning context the two
          `fill` images need, while exactly overlaying the parent wrapper so
          there is no layout shift. The glitch class is added only on a real
          load; otherwise this is an inert full-bleed layer. */}
      <div
        ref={innerRef}
        className={`absolute inset-0${state.glitch ? " glitch-reveal" : ""}`}
        style={state.vars}
      >
        <Image
          src={lightSrc}
          alt={lightAlt}
          fill
          fetchPriority="high"
          sizes={sizes}
          className="object-cover dark:hidden"
          style={imgStyle}
          onLoad={handleLoad}
        />
        <Image
          src={darkSrc}
          alt={darkAlt}
          fill
          fetchPriority="high"
          sizes={sizes}
          className="hidden object-cover dark:block"
          style={imgStyle}
          onLoad={handleLoad}
        />
      </div>
    </>
  );
}
