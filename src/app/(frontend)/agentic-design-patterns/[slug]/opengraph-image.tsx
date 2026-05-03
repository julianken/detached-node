// Open Graph image for an individual agentic design pattern satellite page.
//
// 1200×630 — matches hub OG card size.
//
// Runtime: NO `runtime = 'edge'` declaration (see hub OG file for rationale).
//
// Satori (the renderer next/og uses) is strict about `display`: every node
// with more than one child OR with mixed text + JSX must declare
// `display: flex`. We pre-format strings so each text container has a single
// child, and set display: flex on every visual container.
//
// generateImageMetadata is intentionally NOT used; one OG card per pattern
// is sufficient. Next 16 derives the per-slug params from the route segment.

import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import {
  getPattern,
  getPatternSlugs,
} from "@/data/agentic-design-patterns/index";
import { LAYERS } from "@/data/agentic-design-patterns/layers";

export const alt = "Agentic design pattern reference card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pre-bake one OG image per non-archived pattern at build time.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getPatternSlugs().map((slug) => ({ slug }));
}

type OgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OgImage({ params }: OgImageProps) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) {
    notFound();
  }

  const layer = LAYERS.find((l) => l.id === pattern.layerId);
  const layerLabel = layer
    ? `Layer ${layer.number} — ${layer.title}`
    : pattern.layerId;
  const summary = pattern.oneLineSummary;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            color: "#a1a1aa",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "9999px",
              backgroundColor: "#f97316",
            }}
          />
          <span>{layerLabel}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "76px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {pattern.name}
          </div>
          {summary && (
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                color: "#d4d4d8",
                lineHeight: 1.35,
                maxWidth: "1000px",
              }}
            >
              {summary}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "20px",
            color: "#71717a",
            letterSpacing: "0.05em",
          }}
        >
          <span>Agentic Design Patterns</span>
          <span>detached-node.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
