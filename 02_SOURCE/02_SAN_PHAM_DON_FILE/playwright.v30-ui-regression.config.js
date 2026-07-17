module.exports = {
  testDir: './BANDIAO/tests',
  testMatch: 'v30-sheet-navigation-right-toolbar.browser.spec.js',
  timeout: 30000,
  use: {
    browserName: 'chromium',
    viewport: { width: 1365, height: 900 },
    launchOptions: {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
  }
};
