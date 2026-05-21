import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.addInitScript(() => {
  window.__diagCounts = {}
})
await page.goto('http://localhost:4173/', { waitUntil: 'load' })
await page.waitForTimeout(1500)
// Get diagnostic info from the page
const info = await page.evaluate(() => {
  // Count placeholders and check the steve-giralt section
  const sec = document.querySelector('#giralt')
  const cinematic = sec?.querySelector('.cinematic')
  const ph = cinematic?.querySelector('.placeholder')
  return {
    sectionFound: !!sec,
    cinematicFound: !!cinematic,
    placeholderClasses: ph?.className || null,
    placeholderHTML: ph?.outerHTML?.slice(0, 800) || null,
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
