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
  const css = manifest.css.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  html = html.replace(/<link\s+rel="stylesheet"\s+href="[^"]*\.css">\s*/g, '');
  html = html.replace('</head>', () => '<style>\n' + css + '\n</style>\n</head>');
  const js = manifest.js.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n\n');
  for (const file of manifest.js) html = html.replace('<script src="' + file + '"></script>', '');
  return html.replace('</body>', () => '<script>\n' + js + '\n</script>\n</body>').replace(/\r\n/g, '\n');
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

test('both current release artifacts are reproducible from the manifest', () => {
  const expected = buildFromManifest();
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  for (const file of [
    path.join(root, manifest.output),
    path.join(root, '..', 'BANDIAO', manifest.output)
  ]) {
    assert.equal(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), expected);
  }
});

test('bundle preserves dollar signs inside JavaScript source', () => {
  const bundle = buildFromManifest();
  assert.match(bundle, /USD:'\$'/);
  assert.doesNotMatch(bundle, /USD:'\s*<script>/);
});

