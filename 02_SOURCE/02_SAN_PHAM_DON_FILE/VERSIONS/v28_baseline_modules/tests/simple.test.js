const { test, expect } = require('@playwright/test');

test('basic test - check app loads', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);
  const title = await page.title();
  console.log('Page title:', title);
});

test('check menu button exists', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);
  const menuButton = page.locator('.sheet-menu-link');
  await expect(menuButton).toBeVisible({ timeout: 5000 });
  console.log('Menu button found');
});
