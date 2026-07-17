// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:8766',
  },
  webServer: {
    command: 'python -m http.server 8766',
    port: 8766,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
});
