#!/usr/bin/env node
// Build clean A-1 Sealcoating logo PNGs.
// Renders SVG via headless Chromium (Playwright) for accurate text/textLength.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public/brand')

// Use Google Fonts loaded in-page so PNGs are identical to the live site.
const FONT_LINK = `<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700;800;900&family=Caveat:wght@600;700&display=swap" rel="stylesheet">`

const fullSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" width="1200" height="520">
  <defs>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#e8e8e8"/>
      <stop offset="50%" stop-color="#8a8a8a"/>
      <stop offset="65%" stop-color="#d4d4d4"/>
      <stop offset="100%" stop-color="#555555"/>
    </linearGradient>
    <filter id="dShadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="rShadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.4" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <text x="600" y="170" font-family="'Saira Condensed', sans-serif" font-weight="900" font-style="italic"
        font-size="172" fill="url(#chrome)" text-anchor="middle"
        textLength="1100" lengthAdjust="spacingAndGlyphs" filter="url(#dShadow)">A-1 SEALCOATING LLC</text>

  <text x="600" y="252" font-family="'Saira Condensed', sans-serif" font-weight="700"
        font-size="72" fill="#ffffff" text-anchor="middle"
        textLength="780" lengthAdjust="spacingAndGlyphs">ASPHALT SERVICES</text>

  <rect x="370" y="280" width="460" height="3" fill="#E32626"/>

  <text x="600" y="370" font-family="'Caveat', cursive" font-weight="700"
        font-size="84" fill="#E32626" text-anchor="middle"
        textLength="700" lengthAdjust="spacingAndGlyphs" filter="url(#rShadow)">Over 25 Years Experience</text>

  <text x="600" y="455" font-family="'Saira Condensed', sans-serif" font-weight="700"
        font-size="42" fill="#ffffff" text-anchor="middle"
        textLength="920" lengthAdjust="spacingAndGlyphs">FULLY INSURED &#x2022; COMMERCIAL &amp; RESIDENTIAL</text>
</svg>`

const navSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 280" width="1200" height="280">
  <defs>
    <linearGradient id="chromeN" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#e8e8e8"/>
      <stop offset="50%" stop-color="#8a8a8a"/>
      <stop offset="65%" stop-color="#d4d4d4"/>
      <stop offset="100%" stop-color="#555555"/>
    </linearGradient>
    <filter id="dShadowN" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <text x="600" y="160" font-family="'Saira Condensed', sans-serif" font-weight="900" font-style="italic"
        font-size="172" fill="url(#chromeN)" text-anchor="middle"
        textLength="1120" lengthAdjust="spacingAndGlyphs" filter="url(#dShadowN)">A-1 SEALCOATING</text>

  <text x="600" y="238" font-family="'Saira Condensed', sans-serif" font-weight="600"
        font-size="52" fill="#ffffff" text-anchor="middle"
        textLength="880" lengthAdjust="spacingAndGlyphs">ASPHALT SERVICES LLC</text>
</svg>`

const fullDarkSvg = fullSvg
  .replace('stop-color="#ffffff"', 'stop-color="#3a3a3a"')
  .replace('stop-color="#e8e8e8"', 'stop-color="#1a1a1a"')
  .replace('stop-color="#8a8a8a"', 'stop-color="#000000"')
  .replace('stop-color="#d4d4d4"', 'stop-color="#222222"')
  .replace('stop-color="#555555"', 'stop-color="#000000"')
  .replace(/fill="#ffffff"/g, 'fill="#0d0d0d"')

const markSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect x="0" y="0" width="512" height="512" rx="92" fill="#0a0a0a"/>
  <rect x="22" y="22" width="468" height="468" rx="74" fill="none" stroke="#E32626" stroke-width="14"/>
  <text x="256" y="345" font-family="'Saira Condensed', sans-serif" font-weight="900" font-style="italic"
        font-size="300" fill="#ffffff" text-anchor="middle"
        textLength="340" lengthAdjust="spacingAndGlyphs">A-1</text>
</svg>`

function pageHtml(svg, viewW, viewH, pxWidth) {
  const scale = pxWidth / viewW
  const pxHeight = Math.round(viewH * scale)
  return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}
    <style>
      html,body{margin:0;padding:0;background:transparent;}
      .stage{width:${pxWidth}px;height:${pxHeight}px;display:block;}
      .stage > svg{width:100%;height:100%;display:block;}
    </style></head>
    <body><div class="stage" id="stage">${svg}</div></body></html>`
}

async function renderOne(page, svg, viewW, viewH, outPath, pxWidth) {
  await page.setViewportSize({ width: pxWidth, height: Math.max(1, Math.round(viewH * pxWidth / viewW)) })
  await page.setContent(pageHtml(svg, viewW, viewH, pxWidth), { waitUntil: 'networkidle' })
  // Wait an extra tick for webfonts to apply.
  await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve())
  const el = await page.$('#stage')
  await el.screenshot({ path: outPath, omitBackground: true })
}

async function main() {
  await fs.mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ deviceScaleFactor: 1 })
  const page = await ctx.newPage()

  // Persist source SVGs as well.
  await fs.writeFile(path.join(OUT, 'a1-logo-clean.svg'), fullSvg.trim(), 'utf8')
  await fs.writeFile(path.join(OUT, 'a1-logo-nav.svg'),   navSvg.trim(), 'utf8')
  await fs.writeFile(path.join(OUT, 'a1-logo-clean-dark.svg'), fullDarkSvg.trim(), 'utf8')
  await fs.writeFile(path.join(OUT, 'a1-mark.svg'), markSvg.trim(), 'utf8')

  await renderOne(page, fullSvg,     1200, 520, path.join(OUT, 'a1-logo-clean.png'),         1600)
  await renderOne(page, fullSvg,     1200, 520, path.join(OUT, 'a1-logo-clean@1200w.png'),   1200)
  await renderOne(page, fullSvg,     1200, 520, path.join(OUT, 'a1-logo-clean@800w.png'),     800)
  await renderOne(page, navSvg,      1200, 280, path.join(OUT, 'a1-logo-nav.png'),           1200)
  await renderOne(page, navSvg,      1200, 280, path.join(OUT, 'a1-logo-nav@800w.png'),       800)
  await renderOne(page, navSvg,      1200, 280, path.join(OUT, 'a1-logo-nav@480w.png'),       480)
  await renderOne(page, fullDarkSvg, 1200, 520, path.join(OUT, 'a1-logo-clean-dark.png'),    1600)
  await renderOne(page, fullDarkSvg, 1200, 520, path.join(OUT, 'a1-logo-clean-dark@1200w.png'),1200)
  await renderOne(page, markSvg,      512, 512, path.join(OUT, 'a1-mark.png'),                512)
  await renderOne(page, markSvg,      512, 512, path.join(OUT, 'a1-mark@256w.png'),           256)
  await renderOne(page, markSvg,      512, 512, path.join(OUT, 'a1-mark@128w.png'),           128)

  await browser.close()
  console.log('Rendered to', OUT)
}

main().catch((e) => { console.error(e); process.exit(1) })
