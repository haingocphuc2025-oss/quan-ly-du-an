const { test, expect } = require('@playwright/test');

test('startup uses local fonts, loads them successfully, and reuses browser cache', async ({ page }) => {
  const issues = [];
  const fontResponses = [];
  page.on('pageerror', error => issues.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') issues.push(message.text());
  });
  page.on('requestfailed', request => issues.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => {
    if (response.url().includes('/assets/fonts/') && response.url().endsWith('.woff2')) {
      fontResponses.push({ url: response.url(), status: response.status() });
    }
  });
  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.google={accounts:{oauth2:{initTokenClient:function(){return {};}}}};'
  }));
  await page.route('http://127.0.0.1:8780/project', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ ok: false, missing: true })
  }));

  await page.goto('http://127.0.0.1:8767/STAGING/giao-dien-desktop-don-gian_v30_quan.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => ({
    inter: document.fonts.check('400 16px Inter', 'Quản lý dự án'),
    mono: document.fonts.check('500 12px "IBM Plex Mono"', 'Tiến độ'),
    serif: document.fonts.check('600 16px "Source Serif 4"', 'Báo cáo')
  }))).toEqual({ inter: true, mono: true, serif: true });
  expect(fontResponses.length).toBeGreaterThan(0);
  expect(fontResponses.every(item => item.status === 200)).toBe(true);
  expect(fontResponses.every(item => item.url.startsWith('http://127.0.0.1:8767/STAGING/assets/fonts/'))).toBe(true);

  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const cachedFonts = await page.evaluate(() => performance.getEntriesByType('resource')
    .filter(entry => entry.name.includes('/assets/fonts/') && entry.name.endsWith('.woff2'))
    .map(entry => ({ name: entry.name, transferSize: entry.transferSize })));
  expect(cachedFonts.length).toBeGreaterThan(0);
  expect(cachedFonts.every(entry => entry.transferSize === 0)).toBe(true);
  expect(issues).toEqual([]);
});
