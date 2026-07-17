const { test, expect } = require('@playwright/test');

test('lazy modules are dormant at startup and initialize once without console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('http://127.0.0.1:8765/STAGING/giao-dien-desktop-don-gian_v30_quan.html', {
    waitUntil: 'domcontentloaded'
  });

  const startup = await page.evaluate(() => JSON.parse(JSON.stringify(window.__QLDA_LAZY_MODULES__)));
  for (const state of Object.values(startup)) {
    expect(state).toMatchObject({initialized:false, initCount:0});
  }

  const afterRepeatedOpen = await page.evaluate(() => {
    ['report', 'dashboard', 'repost', 'attachment'].forEach(name => {
      ensureModuleInitialized(name);
      ensureModuleInitialized(name);
    });
    return JSON.parse(JSON.stringify(window.__QLDA_LAZY_MODULES__));
  });
  Object.values(afterRepeatedOpen).forEach(state => {
    expect(state.initialized).toBe(true);
    expect(state.initCount).toBe(1);
  });
  expect(errors).toEqual([]);
});
