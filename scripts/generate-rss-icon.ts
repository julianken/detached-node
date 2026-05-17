/**
 * Generate the 144x144 RSS feed icon from the project's brand mark.
 *
 * RSS 2.0 spec caps <image> dimensions at 144x400. Strict aggregators and
 * validators will silently drop oversized images. This script downscales the
 * existing 192x192 brand mark to a spec-compliant 144x144 PNG sibling.
 *
 * Run with: pnpm tsx scripts/generate-rss-icon.ts
 */
import sharp from "sharp";

const SOURCE = "public/android-chrome-192x192.png";
const TARGET = "public/rss-icon-144.png";

await sharp(SOURCE)
  .resize(144, 144, { fit: "cover" })
  .png()
  .toFile(TARGET);

console.log(`Wrote ${TARGET}`);
