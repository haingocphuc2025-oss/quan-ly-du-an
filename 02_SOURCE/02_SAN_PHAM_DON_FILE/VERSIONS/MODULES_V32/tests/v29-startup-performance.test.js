const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('V29 loads viewport positioning before menu modules', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const helperIndex = manifest.js.indexOf('js/menu-position.js');
  assert.ok(helperIndex >= 0);
  assert.ok(helperIndex < manifest.js.indexOf('js/workspace-navigator.js'));
  assert.ok(helperIndex < manifest.js.indexOf('js/file-menu.js'));
});

test('File menu initializes without polling timers', () => {
  const source = read('js/file-menu.js');
  assert.doesNotMatch(source, /setInterval\s*\(/);
  assert.match(source, /fileMenuReadyMs/);
  assert.match(source, /positionSubmenuElement/);
});

test('external libraries no longer block HTML parsing or CSS import', () => {
  const index = read('index.html');
  const css = read('css/main.css');
  assert.match(index, /xlsx\.full\.min\.js" defer/);
  assert.match(index, /rel="preload" as="style"/);
  assert.doesNotMatch(css, /@import\s+url\(['"]https:\/\/fonts\.googleapis\.com/);
});

test('UI-ready performance mark is recorded after initial render', () => {
  const source = read('js/main.js');
  assert.match(source, /__QLDA_PERF__\.uiReadyMs = performance\.now\(\)/);
  assert.match(source, /qlda-ui-ready/);
});
