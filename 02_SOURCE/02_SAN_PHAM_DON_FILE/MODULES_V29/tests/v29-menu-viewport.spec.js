const { test, expect } = require('@playwright/test');

test.describe('V29 viewport-safe Workspace menus', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__QLDA_APP_STARTED__ === true);
  });

  test('root menu and Create submenu stay inside 8px viewport margin', async ({ page }) => {
    const beforeScroll = await page.evaluate(() => document.scrollingElement.scrollTop);
    await page.evaluate(() => showProjectActionMenu(0, window.innerWidth - 2, window.innerHeight - 2));

    const root = page.locator('#ctxMenu');
    await expect(root).toBeVisible();
    const rootBox = await root.boundingBox();
    expect(rootBox.x).toBeGreaterThanOrEqual(8);
    expect(rootBox.y).toBeGreaterThanOrEqual(8);
    expect(rootBox.x + rootBox.width).toBeLessThanOrEqual(1358);
    expect(rootBox.y + rootBox.height).toBeLessThanOrEqual(760);

    const create = root.locator('.ctx-submenu-wrap');
    await create.hover();
    const submenu = create.locator('.ctx-submenu');
    await expect(submenu).toBeVisible();
    await expect(submenu.getByText('Workspace', { exact: true })).toBeVisible();
    const submenuBox = await submenu.boundingBox();
    expect(submenuBox.x).toBeGreaterThanOrEqual(8);
    expect(submenuBox.y).toBeGreaterThanOrEqual(8);
    expect(submenuBox.x + submenuBox.width).toBeLessThanOrEqual(1358);
    expect(submenuBox.y + submenuBox.height).toBeLessThanOrEqual(760);
    expect(await submenu.getAttribute('data-opens-left')).toBe('1');

    expect(await page.evaluate(() => document.scrollingElement.scrollTop)).toBe(beforeScroll);
  });

  test('open menu repositions after viewport/scaling change', async ({ page }) => {
    await page.evaluate(() => showProjectActionMenu(0, window.innerWidth - 2, window.innerHeight - 2));
    await page.setViewportSize({ width: 911, height: 512 });
    await page.waitForTimeout(50);
    const box = await page.locator('#ctxMenu').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(8);
    expect(box.y).toBeGreaterThanOrEqual(8);
    expect(box.x + box.width).toBeLessThanOrEqual(903);
    expect(box.y + box.height).toBeLessThanOrEqual(504);
  });

  test('arrow navigation keeps focused menu item visible and Escape closes', async ({ page }) => {
    await page.setViewportSize({ width: 911, height: 512 });
    await page.evaluate(() => showProjectActionMenu(0, 900, 500));
    const first = page.locator('#ctxMenu button').first();
    await first.focus();
    for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowDown');
    const visible = await page.evaluate(() => {
      const menu = document.querySelector('#ctxMenu');
      const focused = document.activeElement;
      const menuRect = menu.getBoundingClientRect();
      const focusedRect = focused.getBoundingClientRect();
      return focusedRect.top >= menuRect.top && focusedRect.bottom <= menuRect.bottom;
    });
    expect(visible).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ctxMenu')).not.toBeVisible();
  });
});
