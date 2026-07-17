const { test, expect } = require('@playwright/test');

async function stubAuxiliaryRequests(page) {
  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({
    contentType:'application/javascript',
    body:'window.google={accounts:{oauth2:{initTokenClient:function(){return {};}}}};'
  }));
  await page.route('http://127.0.0.1:8780/project', route => route.fulfill({
    contentType:'application/json',
    body:JSON.stringify({ok:false, missing:true})
  }));
}

test('idle services start after UI-ready and reuse one promise', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if(message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  await stubAuxiliaryRequests(page);
  await page.goto('http://127.0.0.1:8767/STAGING/giao-dien-desktop-don-gian_v30_quan.html', {waitUntil:'domcontentloaded'});
  expect(await page.title()).toContain('v30');
  await page.waitForFunction(() => !!window.__QLDA_IDLE_SERVICES__);

  const result = await page.evaluate(async () => {
    const first = window.__QLDA_IDLE_SERVICES__.ensure('google-auth');
    const second = window.__QLDA_IDLE_SERVICES__.ensure('google-auth');
    await first;
    return {
      uiReady:document.documentElement.dataset.qldaUiReady,
      samePromise:first === second,
      googleScripts:document.querySelectorAll('#qldaGoogleIdentityScript').length
    };
  });

  expect(result).toEqual({uiReady:'1', samePromise:true, googleScripts:1});
  expect(errors).toEqual([]);
});

test('200 ms timeout fallback works without requestIdleCallback', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if(message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  await page.addInitScript(() => { window.requestIdleCallback = undefined; });
  await stubAuxiliaryRequests(page);
  await page.goto('http://127.0.0.1:8767/STAGING/giao-dien-desktop-don-gian_v30_quan.html', {waitUntil:'domcontentloaded'});
  expect(await page.title()).toContain('v30');
  await page.waitForFunction(() => !!window.__QLDA_IDLE_SERVICES__);
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => ({
    uiReady:document.documentElement.dataset.qldaUiReady,
    services:Array.from(window.__QLDA_IDLE_SERVICES__.services, ([name, state]) => ({name, started:!!state.promise}))
  }));
  expect(result.uiReady).toBe('1');
  expect(result.services).toHaveLength(5);
  expect(result.services.every(service => service.started)).toBe(true);
  expect(errors).toEqual([]);
});
