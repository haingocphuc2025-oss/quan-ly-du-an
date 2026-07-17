const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('Navigating to http://127.0.0.1:8766...');
  await page.goto('http://127.0.0.1:8766', { waitUntil: 'networkidle2' });
  
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
  
  // Check for grid view
  const gridView = await page.$('#gridSheetView');
  console.log('Grid sheet view found:', !!gridView);
  
  // Check if file dropdown is already visible
  const dropdown = await page.$('.file-dropdown');
  console.log('File dropdown found:', !!dropdown);
  
  // If dropdown not found, click menu to open it
  if (menuButton && !dropdown) {
    console.log('Clicking menu button...');
    await menuButton.click();
    await page.waitForTimeout(500);
    
    const dropdownAfterClick = await page.$('.file-dropdown');
    console.log('File dropdown after click:', !!dropdownAfterClick);
    
    if (dropdownAfterClick) {
      const menuItems = await page.$$('.file-dropdown .menu-item');
      console.log('Number of menu items:', menuItems.length);
    }
  }
  
  await browser.close();
  console.log('Test complete!');
})();
