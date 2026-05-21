import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4173/', { waitUntil: 'load' })
await page.waitForTimeout(2000)
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight
  for (let y = 0; y < max; y += 800) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,60)) }
  window.scrollTo(0, 0); await new Promise(r=>setTimeout(r,300))
})
const data = await page.evaluate(() => {
  const out = []
  const findOne = (sel, label) => {
    const el = document.querySelector(sel)
    if (el) {
      const r = el.getBoundingClientRect()
      out.push({ label, sel, top: Math.round(r.top + window.scrollY), height: Math.round(r.height) })
    }
  }
  findOne('#platinum', 'platinum (client)')
  findOne('#platinum .cinematic', 'platinum cinematic')
  findOne('#giralt', 'giralt (client)')
  findOne('#giralt .cinematic', 'giralt cinematic')
  findOne('#giralt .sticky', 'giralt sticky')
  findOne('#giralt .mwall', 'giralt mwall')
  findOne('#giralt .pgrid', 'giralt pgrid')
  findOne('#deliverables', 'deliverables')
  findOne('#deliverables .cinematic', 'deliverables cinematic')
  findOne('#deliverables .hgallery', 'deliverables hgallery')
  findOne('#deliverables .mwall', 'deliverables mwall')
  findOne('.services', 'services')
  findOne('.contact', 'contact')
  findOne('.footer', 'footer')
  return { docHeight: document.documentElement.scrollHeight, out }
})
console.log('docHeight =', data.docHeight)
for (const s of data.out) console.log(`  top=${s.top.toString().padStart(6)} h=${s.height.toString().padStart(5)}  ${s.label}`)
await browser.close()
