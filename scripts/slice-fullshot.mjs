import sharp from 'sharp'
import path from 'node:path'
import { promises as fs } from 'node:fs'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const DIR = path.join(ROOT, 'content-audit', 'visual-qa')

async function sliceOne(file, prefix, sliceH = 1400) {
  const src = path.join(DIR, file)
  const img = sharp(src)
  const meta = await img.metadata()
  const W = meta.width
  const H = meta.height
  const slices = Math.ceil(H / sliceH)
  for (let i = 0; i < slices; i++) {
    const top = i * sliceH
    const h = Math.min(sliceH, H - top)
    await sharp(src)
      .extract({ left: 0, top, width: W, height: h })
      .toFile(path.join(DIR, `${prefix}-slice-${i + 1}.png`))
  }
  console.log(`Sliced ${file}: ${slices} slices`)
}

await sliceOne('desktop-full.png', 'desktop', 1400)
await sliceOne('mobile-full.png', 'mobile', 1100)
