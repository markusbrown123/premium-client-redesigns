// Ad-hoc per-section screenshots for the A-1 polish pass.
// Captures key components at desktop + mobile so we can diff specific UI
// without paging through full-page shots.
import { chromium } from 'playwright'
const browser = await chromium.launch()
const sections = ['#featured', '#work', '.a1-reel', '.a1-equipment', '.a1-split', '.a1-faq', '#contact']
async function shoot(width, height, prefix) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto('http://localhost:4176/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  for (const sel of sections) {
    const h = await page.$(sel)
    if (!h) { console.log(`miss ${prefix} ${sel}`); continue }
    await h.scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
    const safe = sel.replace(/[^a-z0-9]/gi, '_')
    await h.screenshot({ path: `content-audit/visual-qa/a1-sealcoating/${prefix}-${safe}.png` })
  }
  await ctx.close()
}
await shoot(1440, 900, 'desk')
await shoot(390, 844, 'mob')
await browser.close()
console.log('done')
