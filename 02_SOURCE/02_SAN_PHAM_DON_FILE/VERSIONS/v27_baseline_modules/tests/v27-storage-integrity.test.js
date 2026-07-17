const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const storageSource = fs.readFileSync(path.join(root, 'js', 'storage.js'), 'utf8');
const mainSource = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');

function buildFromManifest() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  let html = fs.readFileSync(path.join(root, manifest.index), 'utf8');
  for (const file of manifest.css) {
    html = html.replace(
      `<link rel="stylesheet" href="${file}">`,
      () => `<style>\n${fs.readFileSync(path.join(root, file), 'utf8')}\n</style>`
    );
  }
  for (const file of manifest.js) {
    html = html.replace(
      `<script src="${file}"></script>`,
      () => `<script>\n${fs.readFileSync(path.join(root, file), 'utf8')}\n</script>`
    );
  }
  return html.replace(/\r\n/g, '\n');
}

test('project persistence carries revision and per-tab sequence metadata', () => {
  assert.match(storageSource, /projectStorageSessionId/);
  assert.match(storageSource, /baseRevision\s*:\s*projectStorageRevision/);
  assert.match(storageSource, /sessionSequence/);
});

test('beforeunload does not save sample data before project storage is ready', () => {
  const unload = storageSource.slice(
    storageSource.indexOf('function saveProjectBeforeUnload()'),
    storageSource.indexOf("window.addEventListener('beforeunload'")
  );
  assert.match(unload, /if\(!projectStorageReady\) return/);
});

test('main declares escapeHtml only once', () => {
  assert.equal((mainSource.match(/^function escapeHtml\(/gm) || []).length, 1);
});

test('both V27 release artifacts are reproducible from the manifest', () => {
  const expected = buildFromManifest();
  const modulePackage = fs.readFileSync(
    path.join(root, 'giao-dien-desktop-don-gian_v27_quan.html'), 'utf8'
  ).replace(/\r\n/g, '\n');
  const bandiaoPackage = fs.readFileSync(
    path.join(root, '..', 'BANDIAO', 'giao-dien-desktop-don-gian_v27_quan.html'), 'utf8'
  ).replace(/\r\n/g, '\n');
  assert.equal(modulePackage, expected);
  assert.equal(bandiaoPackage, expected);
});



test('bundle preserves dollar signs inside JavaScript source', () => {
  const bundle = buildFromManifest();
  assert.match(bundle, /USD:'\$'/);
  assert.doesNotMatch(bundle, /USD:'\s*<script>/);
});
