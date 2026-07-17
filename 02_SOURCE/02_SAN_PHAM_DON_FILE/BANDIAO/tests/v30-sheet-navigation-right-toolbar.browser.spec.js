const { test, expect } = require('@playwright/test');

test('sheet keeps the active tree state and fixed right tool rail', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.google={accounts:{oauth2:{initTokenClient:function(){return {};}}}};'
  }));
  await page.route('http://127.0.0.1:8780/project', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ ok: false, missing: true })
  }));

  await page.goto('http://127.0.0.1:8767/STAGING/giao-dien-desktop-don-gian_v30_quan.html', { waitUntil: 'load' });

  const rail = page.locator('#rightToolbar');
  await expect(rail).toBeVisible();
  await expect(rail).toHaveCSS('position', 'fixed');
  await expect(rail).toHaveCSS('flex-direction', 'column');
  await expect(rail.locator('button')).toHaveCount(4);

  const railBox = await rail.boundingBox();
  const viewport = page.viewportSize();
  expect(railBox.x + railBox.width).toBeGreaterThanOrEqual(viewport.width - 1);

  const targetSheet = page.locator('#workspaceBrowseTree button[data-browse-folder-i]', { hasText: 'Hợp đồng - pháp lý' }).first();
  await expect(targetSheet).toBeVisible();
  const projectIndex = await targetSheet.getAttribute('data-browse-project-i');
  const folderIndex = await targetSheet.getAttribute('data-browse-folder-i');
  await targetSheet.click();

  const activeSelector = `#workspaceBrowseTree button[data-browse-project-i="${projectIndex}"][data-browse-folder-i="${folderIndex}"]`;
  await expect(page.locator(activeSelector)).toHaveClass(/\bactive\b/);
  await expect(page.locator('#gridSheetView')).toBeVisible();

  await page.locator('#tbAttach').click();
  await expect(page.locator('#gridSheetView')).toHaveClass(/\battachments-open\b/);
  await expect(page.locator('#attachmentPanel')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#attachmentPanel')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
