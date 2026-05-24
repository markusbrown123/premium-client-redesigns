#!/usr/bin/env node
// Optimize the new "enhanced" A-1 driveway images into WebP + JPEG variants
// at the same sizes the rest of the A-1 site uses, so they slot into the
// existing srcset() helper without code changes.
// Run: node scripts/optimize-a1-enhanced.mjs

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ENHANCED = path.join(ROOT, 'public/media/a1-sealcoating/enhanced')
const OPTIMIZED = path.join(ROOT, 'public/media/a1-sealcoating/optimized')

const SLUGS = Array.from({ length: 10 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  return { src: `enhanced-driveway-${n}.png`, slug: `enhanced-driveway-${n}` }
})

const SIZES = [
  { width: 1920, suffix: '-1920' },
  { width: 1280, suffix: '-1280' },
  { width: 640,  suffix: '-640'  },
]

async function processOne({ src, slug }) {
  const inPath = path.join(ENHANCED, src)
  const buf = await fs.readFile(inPath)
  const meta = await sharp(buf).metadata()
  const orientation = (meta.width || 0) >= (meta.height || 0) ? 'landscape' : 'portrait'
  for (const { width, suffix } of SIZES) {
    const targetW = Math.min(width, meta.width || width)
    await sharp(buf).rotate().resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: 86, effort: 5 }).toFile(path.join(OPTIMIZED, `${slug}${suffix}.webp`))
    await sharp(buf).rotate().resize({ width: targetW, withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true, progressive: true }).toFile(path.join(OPTIMIZED, `${slug}${suffix}.jpg`))
  }
  return { slug, orientation, w: meta.width, h: meta.height }
}

async function main() {
  await fs.mkdir(OPTIMIZED, { recursive: true })
  for (const item of SLUGS) {
    const r = await processOne(item)
    console.log(`${r.slug}  ${r.orientation}  ${r.w}x${r.h}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
