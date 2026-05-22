#!/usr/bin/env node
// Visual QA for A-1 Sealcoating site.
// Loads the dev server, scrolls through each section, captures shots at
// desktop + mobile viewports, and reports any console errors / missing images.

import { chromium } from 'playwright'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const URL = process.env.A1_URL || 'http://127.0.0.1:5173/'
const OUT = path.resolve('content-audit/a1-qa')
await fs.mkdir(OUT, { recursive: true })

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet',  width: 900,  height: 1200 },
  { name: 'mobile',  width: 390,  height: 844 },
]

const sections = ['top', 'services', 'featured', 'work', 'process', 'faq', 'contact']

const browser = await chromium.launch()
try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const page = await ctx.newPage()
    const errors = []
    const failed404 = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
    page.on('response', (resp) => {
      if (resp.status() >= 400) failed404.push(`${resp.status()} ${resp.url()}`)
    })

    console.log(`\n[${vp.name}] loading ${URL}`)
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })

    // Allow webfonts + hero rotation to settle.
    await page.waitForTimeout(700)
    await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve())

    // Full-page shot (long, captures layout overflow too).
    await page.screenshot({ path: path.join(OUT, `${vp.name}-fullpage.png`), fullPage: true })

    // Per-section shots.
    for (const id of sections) {
      try {
        await page.evaluate((targetId) => {
          const el = document.getElementById(targetId)
          if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' })
        }, id)
        await page.waitForTimeout(450)
        await page.screenshot({ path: path.join(OUT, `${vp.name}-${id}.png`) })
      } catch (e) {
        console.log(`  miss section #${id}: ${e.message}`)
      }
    }

    // Test the gallery filter on desktop only.
    if (vp.name === 'desktop') {
      try {
        await page.evaluate(() => document.getElementById('work')?.scrollIntoView({ block: 'start' }))
        await page.waitForTimeout(300)
        const btn = await page.$$('.a1-gallery__filter')
        if (btn[2]) {
          await btn[2].click() // Residential filter
          await page.waitForTimeout(400)
          await page.screenshot({ path: path.join(OUT, 'desktop-gallery-filter-residential.png') })
        }

        // Open lightbox on first visible image.
        const item = await page.$('.a1-gallery__item')
        if (item) {
          await item.click()
          await page.waitForTimeout(500)
          await page.screenshot({ path: path.join(OUT, 'desktop-lightbox.png') })
          await page.keyboard.press('Escape')
          await page.waitForTimeout(200)
        }
      } catch (e) {
        console.log(`  gallery interaction failed: ${e.message}`)
      }
    }

    // Page weight check: count rendered images and any that failed.
    const imgStats = await page.evaluate(() => {
      const imgs = Array.from(document.images)
      return {
        total: imgs.length,
        broken: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      }
    })
    console.log(`  console errors: ${errors.length}`)
    if (errors.length) errors.slice(0, 8).forEach((e) => console.log(`    ⚠ ${e}`))
    console.log(`  network 4xx/5xx: ${failed404.length}`)
    if (failed404.length) failed404.slice(0, 8).forEach((e) => console.log(`    ⚠ ${e}`))
    console.log(`  images rendered: ${imgStats.total}, broken: ${imgStats.broken.length}`)
    if (imgStats.broken.length) imgStats.broken.slice(0, 6).forEach((s) => console.log(`    ⚠ broken: ${s}`))

    await ctx.close()
  }
} finally {
  await browser.close()
}

console.log(`\nQA shots → ${OUT}`)
