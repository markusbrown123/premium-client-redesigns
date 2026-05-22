#!/usr/bin/env node
// Optimize A-1 Sealcoating photos into WebP + JPEG variants at multiple sizes.
// Renames the original timestamp filenames into traceable, descriptive slugs.
// Run: node scripts/optimize-a1-media.mjs

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ORIGINALS = path.join(ROOT, 'public/media/a1-sealcoating/originals')
const OPTIMIZED = path.join(ROOT, 'public/media/a1-sealcoating/optimized')

// Manual mapping: original filename -> descriptive slug.
// Derived from human inspection of each photo. No invented locations or names.
const MAP = [
  { orig: '20240729_103417.jpg', slug: 'stucco-mansion-fresh-seal' },
  { orig: '20240811_123603.jpg', slug: 'crew-on-the-job-residential' },
  { orig: '20240811_125420.jpg', slug: 'gray-colonial-curved-drive' },
  { orig: '20241001_135156.jpg', slug: 'estate-cobblestone-apron' },
  { orig: '20250604_142558.jpg', slug: 'blue-colonial-long-drive' },
  { orig: '20250625_155131.jpg', slug: 'coastal-mansion-equipment' },
  { orig: '20250625_155153.jpg', slug: 'coastal-mansion-finished' },
  { orig: '20250714_104243.jpg', slug: 'brick-colonial-jet-black-wide' },
  { orig: '20250714_164556.jpg', slug: 'modern-estate-curved-drive' },
  { orig: '20250729_134432.jpg', slug: 'trailer-truck-at-estate' },
  { orig: '20250812_194934.jpg', slug: 'dusk-fresh-seal-crepe-myrtle' },
  { orig: '20250827_180053.jpg', slug: 'hilltop-estate-pillared-entry' },
]

// Sizes to emit. Hero needs ~1920w; gallery card ~1200w; thumbs ~640w.
const SIZES = [
  { width: 1920, suffix: '-1920' },
  { width: 1280, suffix: '-1280' },
  { width: 640,  suffix: '-640'  },
]

async function processOne({ orig, slug }) {
  const inPath = path.join(ORIGINALS, orig)
  const buf = await fs.readFile(inPath)
  const img = sharp(buf, { failOn: 'none' }).rotate()
  const meta = await img.metadata()
  const orientation = (meta.width || 0) >= (meta.height || 0) ? 'landscape' : 'portrait'

  const outputs = []
  for (const { width, suffix } of SIZES) {
    // Skip up-scaling: if requested size > original, clamp to original.
    const targetW = Math.min(width, meta.width || width)
    const webpPath = path.join(OPTIMIZED, `${slug}${suffix}.webp`)
    const jpegPath = path.join(OPTIMIZED, `${slug}${suffix}.jpg`)

    await sharp(buf).rotate().resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: 86, effort: 5 }).toFile(webpPath)
    await sharp(buf).rotate().resize({ width: targetW, withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true, progressive: true }).toFile(jpegPath)

    outputs.push({ webp: webpPath, jpeg: jpegPath, width: targetW })
  }

  return {
    slug,
    orig,
    orientation,
    origWidth: meta.width,
    origHeight: meta.height,
    outputs: outputs.length,
  }
}

async function main() {
  await fs.mkdir(OPTIMIZED, { recursive: true })
  const results = []
  for (const item of MAP) {
    process.stdout.write(`Optimizing ${item.orig} -> ${item.slug} ... `)
    try {
      const r = await processOne(item)
      results.push(r)
      console.log(`${r.orientation} ${r.origWidth}x${r.origHeight} (${r.outputs} variants × 2 formats)`)
    } catch (err) {
      console.error('FAIL', err.message)
      throw err
    }
  }
  await fs.writeFile(
    path.join(OPTIMIZED, '_manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  )
  console.log(`\nDone. ${results.length} photos × ${SIZES.length} sizes × 2 formats = ${results.length * SIZES.length * 2} files.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
