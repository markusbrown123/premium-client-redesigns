import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4173/', { waitUntil: 'load' })
await page.waitForTimeout(2500)
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight
  for (let y = 0; y < max; y += 800) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,80)) }
  window.scrollTo(0, 0); await new Promise(r=>setTimeout(r,300))
})
const cinematics = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.cinematic')).map((sec) => {
    const ph = sec.querySelector('.placeholder')
    const v = ph?.querySelector('video')
    const i = ph?.querySelector('img')
    return {
      sectionIndex: sec.querySelector('.cinematic__index')?.textContent || '',
      title: sec.querySelector('.cinematic__title')?.textContent?.trim() || '',
      isFallback: ph?.classList.contains('placeholder--fallback') || false,
      hasMediaCls: ph?.classList.contains('placeholder--media') || false,
      videoSrc: v?.getAttribute('src') || null,
      imgSrc: i?.getAttribute('src') || null,
      videoNetworkState: v?.networkState,
      videoReadyState: v?.readyState,
      videoError: v?.error ? v.error.code : null,
    }
  })
})
console.log(JSON.stringify(cinematics, null, 2))
await browser.close()
