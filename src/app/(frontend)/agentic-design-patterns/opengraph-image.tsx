// Open Graph image for the agentic-design-patterns hub page.
//
// 1200×630 — the standard OG card size; matches Twitter summary_large_image.
//
// Runtime: NO `runtime = 'edge'` declaration. The default Node runtime is
// fine for our use case and avoids two issues:
//   - The edge bundler chokes on `siteUrl`'s `assertRequiredEnv` indirection
//     (calls process.env transitively).
//   - Custom font loading at edge requires bundling the .ttf into the
//     handler — a separate hardening pass; for v1 we accept the system mono
//     fallback (flagged as a polish follow-up in the PR description).
//
// Satori (the renderer next/og uses) is strict about `display`: every node
// with more than one child OR with mixed text + JSX must declare
// `display: flex`. JSX expression interpolation like `{count} patterns`
// produces multiple text children and trips that rule, so every container
// here either has a single literal string or sets display: flex explicitly.

import { ImageResponse } from "next/og";
import { getCatalogPatternCount } from "@/data/agentic-design-patterns/index";

export const alt = "Agentic Design Patterns — a field-aware reference catalog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const count = getCatalogPatternCount();
  const subtitle = `A field-aware reference covering ${count} patterns for building agentic systems.`;
  const footerStat = `5 layers · ${count} patterns`;

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
          <span>detached-node · reference</span>
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
              fontSize: "84px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Agentic Design Patterns
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "32px",
              color: "#d4d4d8",
              lineHeight: 1.35,
              maxWidth: "950px",
            }}
          >
            {subtitle}
          </div>
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
          <span>{footerStat}</span>
          <span>detached-node.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
