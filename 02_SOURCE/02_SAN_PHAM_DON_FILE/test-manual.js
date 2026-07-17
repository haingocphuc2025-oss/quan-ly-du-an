const { chromium } = require('playwright');

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to page...');
  await page.goto('http://127.0.0.1:8766');
  
  console.log('Waiting for content...');
  await page.waitForTimeout(2000);
  
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check if menu button exists
  const menuButton = await page.$('.sheet-menu-link');
  if (menuButton) {
    console.log('Menu button found!');
    const isVisible = await menuButton.isVisible();
    console.log('Menu button visible:', isVisible);
  } else {
    console.log('Menu button NOT found');
  }
  
  // Check for file dropdown (maybe it auto-opens)
  const dropdown = await page.$('.file-dropdown');
  console.log('File dropdown found:', !!dropdown);
  
  await browser.close();
  console.log('Done!');
})();
