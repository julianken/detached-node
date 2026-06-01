import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeAwareHero } from "@/components/ThemeAwareHero";
import type { Media } from "@/payload-types";

// Mock next/image: render a plain <img> so we can make assertions on the
// className pass-through and src/alt without pulling in the full Next.js
// image loader pipeline.
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    fill,
    fetchPriority,
    priority,
    sizes,
    width,
    height,
    style,
    onLoad,
    ...rest
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    fetchPriority?: string;
    priority?: boolean;
    sizes?: string;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
    [key: string]: unknown;
  }) => {
    // Strip out Next.js-only props that would generate React warnings on an
    // intrinsic <img> element; preserve the props we actually want to assert.
    // onLoad is preserved so tests can simulate the image finishing loading.
    void rest;
    return React.createElement("img", {
      src,
      alt,
      className,
      style,
      onLoad,
      "data-fill": fill ? "true" : undefined,
      "data-fetch-priority": fetchPriority,
      "data-priority": priority ? "true" : undefined,
      "data-sizes": sizes,
      "data-width": width,
      "data-height": height,
    });
  },
}));

function makeMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: 1,
    alt: "default alt",
    url: "/media/light.png",
    width: 1200,
    height: 630,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  } as Media;
}

describe("ThemeAwareHero", () => {
  const lightMedia = makeMedia({
    id: 1,
    url: "/media/post-light.png",
    alt: "Light variant alt",
  });
  const darkMedia = makeMedia({
    id: 2,
    url: "/media/post-dark.png",
    alt: "Dark variant alt",
  });

  it("renders both light and dark images", () => {
    render(<ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/media/post-light.png");
    expect(images[1]).toHaveAttribute("src", "/media/post-dark.png");
  });

  it("applies dark:hidden to the light variant", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const lightImg = container.querySelector('img[src="/media/post-light.png"]');
    expect(lightImg?.className).toContain("dark:hidden");
    expect(lightImg?.className).toContain("object-cover");
  });

  it("applies hidden + dark:block to the dark variant", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const darkImg = container.querySelector('img[src="/media/post-dark.png"]');
    expect(darkImg?.className).toContain("hidden");
    expect(darkImg?.className).toContain("dark:block");
    expect(darkImg?.className).toContain("object-cover");
  });

  it("renders a centered loading spinner while the image is loading", () => {
    // jsdom never actually loads the image, so img.complete stays false and the
    // mount layout-effect leaves the component in its loading state.
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    // A decorative spinner element exists inside the positioned wrapper and is
    // aria-hidden (the images carry the real alt text).
    const spinner = container.querySelector(".hero-spinner");
    expect(spinner).toBeTruthy();
    expect(spinner?.getAttribute("aria-hidden")).toBe("true");
    expect(spinner?.querySelector(".animate-spin")).toBeTruthy();
  });

  // --- load-aware behavior (spinner / cached-instant / glitch-in) ---

  it("shows NO spinner and NO glitch when the visible image is already cached on mount", () => {
    // Stub the cached signal the layout effect reads: a warm image reports
    // complete=true with a real naturalWidth before paint.
    const completeSpy = vi
      .spyOn(window.HTMLImageElement.prototype, "complete", "get")
      .mockReturnValue(true);
    const naturalWidthSpy = vi
      .spyOn(window.HTMLImageElement.prototype, "naturalWidth", "get")
      .mockReturnValue(1200);

    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    // No spinner flash for a cached image, and no glitch-reveal applied.
    expect(container.querySelector(".hero-spinner")).toBeNull();
    expect(container.querySelector(".glitch-reveal")).toBeNull();

    completeSpy.mockRestore();
    naturalWidthSpy.mockRestore();
  });

  it("removes the spinner and applies glitch-reveal when a real load completes", () => {
    // Default jsdom: images are not complete on mount, so the spinner shows.
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );
    expect(container.querySelector(".hero-spinner")).toBeTruthy();
    expect(container.querySelector(".glitch-reveal")).toBeNull();

    // Simulate the visible variant finishing a genuine load.
    const lightImg = container.querySelector(
      'img[src="/media/post-light.png"]'
    ) as HTMLImageElement;
    fireEvent.load(lightImg);

    // Spinner gone; glitch-in applied to the (theme-agnostic) image wrapper.
    expect(container.querySelector(".hero-spinner")).toBeNull();
    expect(container.querySelector(".glitch-reveal")).toBeTruthy();
  });

  // --- visible/hidden onLoad discrimination (the display:"none" guard) ---
  //
  // The component decides which variant "owns" the reveal by reading
  // window.getComputedStyle(img).display: only the variant that is NOT
  // display:"none" may remove the spinner and trigger the glitch. jsdom never
  // applies the Tailwind stylesheet, so by default BOTH variants report
  // display:"inline" and the guard branch (handleLoad early-return for the
  // hidden variant) is never exercised — visibleImg() passes only by
  // first-element fallthrough. These tests stub getComputedStyle so the dark
  // variant reports display:"none" (hidden) and the light variant reports a
  // visible display, then drive onLoad on each variant to prove the guard.

  let computedStyleSpy: ReturnType<typeof vi.spyOn> | undefined;

  afterEach(() => {
    computedStyleSpy?.mockRestore();
    computedStyleSpy = undefined;
  });

  /**
   * Stub getComputedStyle so the DARK variant (src .../post-dark.png) reports
   * display:"none" and everything else delegates to jsdom's real
   * implementation (so the light variant stays visible: display:"inline").
   * The component only reads `.display`, so a minimal override is sufficient.
   */
  function stubDarkHidden() {
    const real = window.getComputedStyle.bind(window);
    computedStyleSpy = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation((el: Element, pseudo?: string | null) => {
        if (
          el instanceof window.HTMLImageElement &&
          (el.getAttribute("src") ?? "").endsWith("post-dark.png")
        ) {
          return { display: "none" } as unknown as CSSStyleDeclaration;
        }
        return real(el, pseudo ?? undefined);
      });
  }

  it("ignores onLoad from the HIDDEN (display:none) variant — no spinner removal, no glitch", () => {
    stubDarkHidden();

    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );
    // Spinner shows (images not complete at mount); no glitch yet.
    expect(container.querySelector(".hero-spinner")).toBeTruthy();
    expect(container.querySelector(".glitch-reveal")).toBeNull();

    // Fire load on the HIDDEN variant. Its onLoad must early-return on the
    // display:"none" guard and leave state untouched.
    const darkImg = container.querySelector(
      'img[src="/media/post-dark.png"]'
    ) as HTMLImageElement;
    fireEvent.load(darkImg);

    // No state change: spinner still present, still no glitch.
    expect(container.querySelector(".hero-spinner")).toBeTruthy();
    expect(container.querySelector(".glitch-reveal")).toBeNull();
  });

  it("honors onLoad from the VISIBLE variant — removes spinner and applies glitch (with dark variant stubbed hidden)", () => {
    stubDarkHidden();

    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );
    expect(container.querySelector(".hero-spinner")).toBeTruthy();
    expect(container.querySelector(".glitch-reveal")).toBeNull();

    // Loading the hidden variant first must NOT consume the reveal (guard).
    const darkImg = container.querySelector(
      'img[src="/media/post-dark.png"]'
    ) as HTMLImageElement;
    fireEvent.load(darkImg);
    expect(container.querySelector(".hero-spinner")).toBeTruthy();
    expect(container.querySelector(".glitch-reveal")).toBeNull();

    // Now the VISIBLE (light) variant finishes: spinner removed + glitch-in.
    const lightImg = container.querySelector(
      'img[src="/media/post-light.png"]'
    ) as HTMLImageElement;
    fireEvent.load(lightImg);
    expect(container.querySelector(".hero-spinner")).toBeNull();
    expect(container.querySelector(".glitch-reveal")).toBeTruthy();
  });

  it("does NOT apply transition-opacity or fade animation CSS (View Transitions compliance)", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const html = container.innerHTML;
    // Guard rail: a transition-opacity / opacity-0 / opacity-100 class would
    // compete with the browser-level View Transitions crossfade and degrade
    // the animation. See issue #53 for context.
    expect(html).not.toContain("transition-opacity");
    expect(html).not.toContain("opacity-0");
    expect(html).not.toContain("opacity-100");
    expect(html).not.toContain("animate-fade");
  });

  it("sets fetchPriority=high on both variants for LCP optimization", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    images.forEach((img) => {
      expect(img.getAttribute("data-fetch-priority")).toBe("high");
    });
  });

  it("does NOT set priority / loading=eager (should rely on lazy + fetchPriority)", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      // data-priority is only set when the prop was true; undefined means absent.
      expect(img.getAttribute("data-priority")).toBeNull();
    });
  });

  it("uses fill mode (no explicit width/height on <img>)", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect(img.getAttribute("data-fill")).toBe("true");
    });
  });

  it("locks parent aspect ratio to prevent layout shift on theme toggle", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeTruthy();
    // inline style aspect-ratio, derived from the light variant's dimensions.
    expect(wrapper.style.aspectRatio).toBe("1200 / 630");
  });

  it("honors an explicit aspectRatio prop over the natural ratio", () => {
    const { container } = render(
      <ThemeAwareHero
        light={lightMedia}
        dark={darkMedia}
        alt="Hero"
        aspectRatio="4 / 1"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe("4 / 1");
  });

  it("falls back to the provided alt when a variant lacks alt text", () => {
    const lightNoAlt = makeMedia({ ...lightMedia, alt: "" });
    render(
      <ThemeAwareHero light={lightNoAlt} dark={darkMedia} alt="Post title" />
    );

    // The light variant should fall back to 'Post title'; the dark still has its own alt.
    expect(screen.getByAltText("Post title")).toBeInTheDocument();
    expect(screen.getByAltText("Dark variant alt")).toBeInTheDocument();
  });

  it("returns null when either variant is not a populated Media object", () => {
    const { container: onlyLightContainer } = render(
      <ThemeAwareHero light={lightMedia} dark={42} alt="Hero" />
    );
    expect(onlyLightContainer.firstChild).toBeNull();

    const { container: onlyDarkContainer } = render(
      <ThemeAwareHero light={null} dark={darkMedia} alt="Hero" />
    );
    expect(onlyDarkContainer.firstChild).toBeNull();

    const { container: noneContainer } = render(
      <ThemeAwareHero light={null} dark={undefined} alt="Hero" />
    );
    expect(noneContainer.firstChild).toBeNull();
  });

  it("returns null when a media object lacks a url", () => {
    const lightNoUrl = makeMedia({ ...lightMedia, url: null });
    const { container } = render(
      <ThemeAwareHero light={lightNoUrl} dark={darkMedia} alt="Hero" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("passes sizes through to next/image", () => {
    const { container } = render(
      <ThemeAwareHero
        light={lightMedia}
        dark={darkMedia}
        alt="Hero"
        sizes="(max-width: 768px) 100vw, 720px"
      />
    );
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect(img.getAttribute("data-sizes")).toBe(
        "(max-width: 768px) 100vw, 720px"
      );
    });
  });

  it("merges a custom className onto the parent wrapper", () => {
    const { container } = render(
      <ThemeAwareHero
        light={lightMedia}
        dark={darkMedia}
        alt="Hero"
        className="my-custom-class"
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("my-custom-class");
    expect(wrapper.className).toContain("relative");
  });

  // --- focalPoint tests ---

  it("applies objectPosition style on both <img> children when focalPoint is non-default", () => {
    const { container } = render(
      <ThemeAwareHero
        light={lightMedia}
        dark={darkMedia}
        alt="Hero"
        focalPoint={{ x: 25, y: 75 }}
      />
    );
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    images.forEach((img) => {
      expect((img as HTMLElement).style.objectPosition).toBe("25% 75%");
    });
  });

  it("does NOT add objectPosition style when focalPoint is undefined", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect((img as HTMLElement).style.objectPosition).toBeFalsy();
    });
  });

  it("does NOT add objectPosition style when focalPoint is the default 50/50 (no-op skip)", () => {
    const { container } = render(
      <ThemeAwareHero
        light={lightMedia}
        dark={darkMedia}
        alt="Hero"
        focalPoint={{ x: 50, y: 50 }}
      />
    );
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect((img as HTMLElement).style.objectPosition).toBeFalsy();
    });
  });

  it("falls back y to 50 when focalPoint.y is null (Payload nullable number)", () => {
    const { container } = render(
      <ThemeAwareHero
        light={lightMedia}
        dark={darkMedia}
        alt="Hero"
        focalPoint={{ x: 25, y: null }}
      />
    );
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    images.forEach((img) => {
      // x=25 (non-default) with y=null→50: position is non-default, so style IS emitted
      expect((img as HTMLElement).style.objectPosition).toBe("25% 50%");
    });
  });

  // Regression tripwire: x=0,y=0 anchors to top-left. If someone changes the
  // ?? coalescing in focalPointStyle to ||, 0 would silently fall back to 50
  // and this test would fail loudly. The other tests all use values that
  // differ from both 0 and 50, so they wouldn't catch that regression.
  it("emits objectPosition '0% 0%' for top-left focal point (?? vs || tripwire)", () => {
    const { container } = render(
      <ThemeAwareHero
        light={lightMedia}
        dark={darkMedia}
        alt="Hero"
        focalPoint={{ x: 0, y: 0 }}
      />
    );
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    images.forEach((img) => {
      expect((img as HTMLElement).style.objectPosition).toBe("0% 0%");
    });
  });
});
