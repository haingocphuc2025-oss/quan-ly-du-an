const { test, expect } = require('@playwright/test');

test.describe('v27 File Menu', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#gridSheetView', { state: 'visible' });
  });

  test.describe('Menu Structure', () => {
    test('hiển thị menu File button', async ({ page }) => {
      await expect(page.locator('.sheet-menu-link')).toBeVisible();
    });

    test('mở menu File khi click', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await expect(page.locator('.file-dropdown')).toBeVisible();
    });

    test('có đầy đủ các mục menu', async ({ page }) => {
      await page.click('.sheet-menu-link');
      const items = page.locator('.file-dropdown .menu-item');
      await expect(items).toHaveCount(await items.count());
      expect(await items.count()).toBeGreaterThan(10);
    });

    test('có Import submenu', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await expect(page.locator('.file-dropdown .menu-item', { hasText: 'Import' })).toBeVisible();
    });

    test('có Export submenu', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await expect(page.locator('.file-dropdown .menu-item', { hasText: 'Export' })).toBeVisible();
    });

    test('có Share, Properties, Activity Log', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await expect(page.locator('.file-dropdown .menu-item', { hasText: 'Share' })).toBeVisible();
      await expect(page.locator('.file-dropdown .menu-item', { hasText: 'Properties' })).toBeVisible();
      await expect(page.locator('.file-dropdown .menu-item', { hasText: 'Activity Log' })).toBeVisible();
    });
  });

  test.describe('Export Submenu', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.hover('.file-dropdown .menu-item', { hasText: 'Export' });
      await page.waitForTimeout(200);
    });

    test('mở Export submenu khi hover', async ({ page }) => {
      await expect(page.locator('.export-submenu')).toBeVisible();
    });

    test('có Export to Excel', async ({ page }) => {
      await expect(page.locator('.export-submenu .menu-item', { hasText: 'Export to Microsoft Excel' })).toBeVisible();
    });

    test('có Export to PDF', async ({ page }) => {
      await expect(page.locator('.export-submenu .menu-item', { hasText: 'Export to PDF' })).toBeVisible();
    });

    test('có Export Gantt to PNG', async ({ page }) => {
      await expect(page.locator('.export-submenu .menu-item', { hasText: 'Export Gantt to Image' })).toBeVisible();
    });
  });

  test.describe('Import Submenu', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.hover('.file-dropdown .menu-item', { hasText: 'Import' });
      await page.waitForTimeout(200);
    });

    test('mở Import submenu khi hover', async ({ page }) => {
      await expect(page.locator('.import-submenu')).toBeVisible();
    });

    test('có Import CSV', async ({ page }) => {
      await expect(page.locator('.import-submenu .menu-item', { hasText: 'Import CSV' })).toBeVisible();
    });

    test('có Import Excel', async ({ page }) => {
      await expect(page.locator('.import-submenu .menu-item', { hasText: 'Import from Excel' })).toBeVisible();
    });
  });

  test.describe('Modal System', () => {
    test('mở Properties modal', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.click('.file-dropdown .menu-item', { hasText: 'Properties' });
      await expect(page.locator('.fm-modal')).toBeVisible();
      await expect(page.locator('.fm-modal-header h3')).toContainText('Properties');
    });

    test('mở Share modal', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.click('.file-dropdown .menu-item', { hasText: 'Share' });
      await expect(page.locator('.fm-modal')).toBeVisible();
      await expect(page.locator('.fm-modal-header h3')).toContainText('Share');
    });

    test('mở Activity Log modal', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.click('.file-dropdown .menu-item', { hasText: 'Activity Log' });
      await expect(page.locator('.fm-modal')).toBeVisible();
      await expect(page.locator('.fm-modal-header h3')).toContainText('Activity Log');
    });

    test('đóng modal bằng nút X', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.click('.file-dropdown .menu-item', { hasText: 'Properties' });
      await page.click('.fm-modal-close');
      await expect(page.locator('.fm-modal')).not.toBeVisible();
    });

    test('đóng modal bằng click outside', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.click('.file-dropdown .menu-item', { hasText: 'Properties' });
      await page.click('.fm-modal-overlay', { position: { x: 10, y: 10 } });
      await expect(page.locator('.fm-modal')).not.toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('đóng menu bằng Escape', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await expect(page.locator('.file-dropdown')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.file-dropdown')).not.toBeVisible();
    });
  });

  test.describe('Toast Notifications', () => {
    test('hiển thị toast khi click placeholder items', async ({ page }) => {
      await page.click('.sheet-menu-link');
      await page.click('.file-dropdown .menu-item', { hasText: 'Send as Attachment' });
      await expect(page.locator('#fmToast')).toBeVisible();
    });
  });
});
