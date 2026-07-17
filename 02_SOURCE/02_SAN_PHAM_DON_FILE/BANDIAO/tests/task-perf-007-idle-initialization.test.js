const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const sourcePath = path.resolve(__dirname, '../../STAGING/giao-dien-desktop-don-gian_v30_quan.html');
const source = fs.readFileSync(sourcePath, 'utf8');

test('five auxiliary services are scheduled only after UI-ready', () => {
  for (const name of ['google-auth', 'drive-helper', 'local-helper', 'cache-cleanup', 'background-sync']) {
    assert.match(source, new RegExp(`registerIdleService\\('${name}'`));
  }
  const ready = source.indexOf("document.documentElement.dataset.qldaUiReady = '1'");
  const scheduled = source.indexOf('scheduleRegisteredIdleServices();');
  assert.ok(ready >= 0 && scheduled > ready, 'idle services must be scheduled after UI-ready');
});

test('idle scheduler has a 200 ms fallback and one shared initialization promise', () => {
  assert.match(source, /typeof window\.requestIdleCallback === 'function'/);
  assert.match(source, /window\.setTimeout\([^,]+, 200\)/);
  assert.match(source, /if\(service\.promise\) return service\.promise/);
  assert.match(source, /scheduled\.forEach\(cancelScheduledIdleTask\)/);
  assert.match(source, /if\(service\.promise === attempt\) service\.promise = null/);
});

test('Google Identity is lazy-loaded and service preload failures are handled', () => {
  assert.doesNotMatch(source, /<script src="https:\/\/accounts\.google\.com\/gsi\/client" async defer><\/script>/);
  assert.match(source, /ensureIdleService\('drive-helper'\)/);
  assert.match(source, /ensureIdleService\('local-helper'\)/);
  assert.match(source, /ensureIdleService\(name\)\.catch\(function\(\)\{\}\)/);
});
