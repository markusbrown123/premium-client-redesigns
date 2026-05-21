import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const failures = []
const requests = []
page.on('requestfailed', (req) => {
  failures.push({ url: req.url(), failure: req.failure()?.errorText })
})
page.on('response', (res) => {
  const u = res.url()
  if (u.includes('/media/steve-giralt/') || u.includes('.mp4')) {
    requests.push({ url: u, status: res.status() })
  }
})
await page.goto('http://localhost:4173/', { waitUntil: 'load' })
await page.waitForTimeout(3500)
// scroll to load all
await page.evaluate(async () => {
  const max = document.documentElement.scrollHeight
  for (let y = 0; y < max; y += 800) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,80)) }
  window.scrollTo(0, 0); await new Promise(r=>setTimeout(r,400))
})
await page.waitForTimeout(1500)
console.log('--- request failures ---')
for (const f of failures) console.log('  ', f.url, '→', f.failure)
console.log('\n--- steve-giralt + mp4 responses ---')
for (const r of requests) console.log(' ', r.status, r.url.replace('http://localhost:4173',''))
await browser.close()
