/**
 * Converts PNG hero images in `tmp/hero-pics/` to WebP at quality 85
 * using sharp. Produces ~15× size reduction for the hero-pair workflow.
 *
 * Run this BEFORE `pnpm tsx scripts/seed-theme-hero.ts` when onboarding
 * a new hero pair: drop PNGs in `tmp/hero-pics/`, run this, then run seed.
 *
 * The `tmp/hero-pics/` directory is gitignored — source PNGs stay local.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.resolve(__dirname, '..', 'tmp', 'hero-pics')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'))

for (const f of files) {
  const src = path.join(dir, f)
  const dst = path.join(dir, f.replace(/\.png$/, '.webp'))
  const before = fs.statSync(src).size
  await sharp(src).webp({ quality: 85 }).toFile(dst)
  const after = fs.statSync(dst).size
  const pct = Math.round(100 * (1 - after / before))
  console.log(`${f.padEnd(55)} ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB  (-${pct}%)`)
}
