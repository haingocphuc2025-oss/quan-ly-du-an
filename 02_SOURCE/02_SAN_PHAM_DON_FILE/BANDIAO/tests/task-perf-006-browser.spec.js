const { test, expect } = require('@playwright/test');

test('repeated module lifecycle keeps handlers bounded and unchanged render is skipped', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://127.0.0.1:8765/STAGING/giao-dien-desktop-don-gian_v30_quan.html', {waitUntil:'domcontentloaded'});

  const result = await page.evaluate(() => {
    const renderBefore = window.__QLDA_PERF__.counts.render;
    const firstRenderResult = render();
    const secondRenderResult = render();
    for(let cycle = 0; cycle < 20; cycle += 1){
      for(const name of ['report','dashboard','repost','attachment']){
        window.__QLDA_MODULE_LIFECYCLE__.ensure(name);
        window.__QLDA_MODULE_LIFECYCLE__.ensure(name);
        window.__QLDA_MODULE_LIFECYCLE__.destroy(name);
      }
    }
    return {
      renderDelta:window.__QLDA_PERF__.counts.render - renderBefore,
      firstRenderResult,
      secondRenderResult,
      states:JSON.parse(JSON.stringify(window.__QLDA_LAZY_MODULES__))
    };
  });

  expect(result.renderDelta).toBeLessThanOrEqual(1);
  expect(result.secondRenderResult).toBe(false);
  for(const state of Object.values(result.states)){
    expect(state).toMatchObject({initialized:false, initCount:20, cleanupCount:20});
  }
  expect(errors).toEqual([]);
});
