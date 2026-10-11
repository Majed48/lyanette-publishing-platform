// Renders end-card PNGs from endcard.html with Playwright (Chromium).
// Usage: node render.js   (writes PNGs next to this file)
const path = require('path');
const { chromium } = require('playwright');

const variants = [
  { v: 'hero', w: 1080, h: 1920, out: 'endcard_hero_9x16.png' },
  { v: 'catering', w: 1080, h: 1920, out: 'endcard_catering_9x16.png' },
  { v: 'hero', w: 1080, h: 1350, out: 'endcard_hero_4x5.png' },
  { v: 'hero', w: 1920, h: 1080, out: 'endcard_hero_16x9.png' },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const { v, w, h, out } of variants) {
    await page.setViewportSize({ width: w, height: h });
    const url = 'file://' + path.join(__dirname, 'endcard.html') + `?v=${v}&w=${w}&h=${h}`;
    await page.goto(url);
    await page.waitForSelector('body[data-ready="1"]');
    await page.locator('#card').screenshot({ path: path.join(__dirname, out) });
    console.log('wrote', out);
  }
  await browser.close();
})();
