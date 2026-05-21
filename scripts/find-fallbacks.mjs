import { chromium } from 'playwright'

const url = process.env.PREVIEW_URL || 'http://localhost:4173/'
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

const browser = await chromium.launch({ headless: true })
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForTimeout(2000)
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight
    for (let y = 0; y < max; y += 800) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 100))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 400))
  })
  const found = await page.evaluate(() => {
    const fallbacks = Array.from(document.querySelectorAll('.placeholder--fallback'))
    return fallbacks.map((el) => {
      const r = el.getBoundingClientRect()
      const parent = el.closest('section') || el.parentElement
      const parentCls = parent?.className || ''
      const parentTag = parent?.tagName?.toLowerCase() || ''
      const sectionId = el.closest('section[id]')?.id || ''
      const sectionCls = el.closest('section')?.className || ''
      return {
        cls: el.className,
        w: Math.round(r.width),
        h: Math.round(r.height),
        topAbs: Math.round(r.top + window.scrollY),
        parent: `${parentTag}.${parentCls}`,
        sectionId,
        sectionCls,
      }
    })
  })
  console.log(`\n[${vp.name} ${vp.width}x${vp.height}] fallback count = ${found.length}`)
  for (const f of found) console.log('  ', JSON.stringify(f))
  await ctx.close()
}
await browser.close()
