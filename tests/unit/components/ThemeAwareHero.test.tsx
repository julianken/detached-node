import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    [key: string]: unknown;
  }) => {
    // Strip out Next.js-only props that would generate React warnings on an
    // intrinsic <img> element; preserve the props we actually want to assert.
    void rest;
    return React.createElement("img", {
      src,
      alt,
      className,
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
  });

  it("applies hidden + dark:block to the dark variant", () => {
    const { container } = render(
      <ThemeAwareHero light={lightMedia} dark={darkMedia} alt="Hero" />
    );

    const darkImg = container.querySelector('img[src="/media/post-dark.png"]');
    expect(darkImg?.className).toContain("hidden");
    expect(darkImg?.className).toContain("dark:block");
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
});
