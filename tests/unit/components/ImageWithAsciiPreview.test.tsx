import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"
import React from "react"
import { ImageWithAsciiPreview } from "@/components/ImageWithAsciiPreview"
import { ASCII_LENGTH, ASCII_ROWS } from "@/lib/preview/encode"

// Mock next/image — same surface as the existing ThemeAwareHero test mocks.
vi.mock("next/image", () => ({
  default: React.forwardRef<HTMLImageElement, {
    src: string
    alt: string
    className?: string
    fill?: boolean
    priority?: boolean
    fetchPriority?: string
    sizes?: string
    style?: React.CSSProperties
    placeholder?: string
    onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
    [key: string]: unknown
  }>(function MockImage(
    {
      src,
      alt,
      className,
      fill,
      priority,
      fetchPriority,
      sizes,
      style,
      placeholder,
      onLoad,
      ...rest
    },
    ref,
  ) {
    void rest
    void placeholder
    return React.createElement("img", {
      ref,
      src,
      alt,
      className,
      style,
      onLoad,
      "data-fill": fill ? "true" : undefined,
      "data-priority": priority ? "true" : undefined,
      "data-fetch-priority": fetchPriority,
      "data-sizes": sizes,
    })
  }),
}))

const VALID_ASCII = ".".repeat(ASCII_LENGTH)

describe("ImageWithAsciiPreview", () => {
  it("renders the wrapper with data-loaded='false' on first paint", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const wrapper = container.querySelector(".ascii-preview-wrapper") as HTMLElement
    expect(wrapper).toBeTruthy()
    expect(wrapper.getAttribute("data-loaded")).toBe("false")
  })

  it("wires the dominant color into the wrapper as a CSS custom property", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const wrapper = container.querySelector(".ascii-preview-wrapper") as HTMLElement
    expect(wrapper.style.getPropertyValue("--preview-color")).toBe("#1e2530")
  })

  it("renders 12 newline-separated rows in the ASCII <pre>", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const pre = container.querySelector("pre.ascii-preview-layer") as HTMLPreElement
    expect(pre).toBeTruthy()
    const rowCount = pre.textContent!.split("\n").length
    expect(rowCount).toBe(ASCII_ROWS)
  })

  it("omits the ASCII <pre> when ascii is the wrong length (defensive)", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ color: "#1e2530", ascii: "short" }}
      />,
    )
    expect(container.querySelector("pre.ascii-preview-layer")).toBeNull()
    // Background still renders so the wrapper is never transparent.
    expect(container.querySelector(".ascii-preview-bg")).toBeTruthy()
  })

  it("omits the ASCII <pre> when ascii is missing", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ color: "#1e2530" }}
      />,
    )
    expect(container.querySelector("pre.ascii-preview-layer")).toBeNull()
  })

  it("uses the surface fallback when color is missing (no inline custom property)", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ ascii: VALID_ASCII }}
      />,
    )
    const wrapper = container.querySelector(".ascii-preview-wrapper") as HTMLElement
    expect(wrapper.style.getPropertyValue("--preview-color")).toBe("")
  })

  it("marks the ASCII layer aria-hidden (decorative — not for screen readers)", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const pre = container.querySelector("pre.ascii-preview-layer")
    expect(pre?.getAttribute("aria-hidden")).toBe("true")
    const bg = container.querySelector(".ascii-preview-bg")
    expect(bg?.getAttribute("aria-hidden")).toBe("true")
  })

  it("preserves alt text on the underlying <img> for assistive tech", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="A neural network diagram"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const img = container.querySelector("img")
    expect(img?.getAttribute("alt")).toBe("A neural network diagram")
  })

  it("propagates dark:hidden from className to the inner <img>", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        className="dark:hidden"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const wrapper = container.querySelector(".ascii-preview-wrapper") as HTMLElement
    const img = container.querySelector("img") as HTMLImageElement
    expect(wrapper.className).toContain("dark:hidden")
    expect(img.className).toContain("dark:hidden")
  })

  it("propagates 'hidden dark:block' (off-by-default variant) to the inner <img>", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        className="hidden dark:block"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const img = container.querySelector("img") as HTMLImageElement
    expect(img.className).toContain("hidden")
    expect(img.className).toContain("dark:block")
  })

  it("does not propagate non-display utilities (e.g. object-cover) to the inner <img>", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        className="object-cover dark:hidden"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const img = container.querySelector("img") as HTMLImageElement
    expect(img.className).toContain("dark:hidden")
    expect(img.className).not.toContain("object-cover")
  })

  it("flips data-loaded to 'true' on the wrapper when the image fires onLoad", () => {
    const { container } = render(
      <ImageWithAsciiPreview
        src="/media/test.png"
        alt="alt"
        preview={{ color: "#1e2530", ascii: VALID_ASCII }}
      />,
    )
    const wrapper = container.querySelector(".ascii-preview-wrapper") as HTMLElement
    const img = container.querySelector("img") as HTMLImageElement
    expect(wrapper.getAttribute("data-loaded")).toBe("false")
    img.dispatchEvent(new Event("load"))
    expect(wrapper.getAttribute("data-loaded")).toBe("true")
  })
})
