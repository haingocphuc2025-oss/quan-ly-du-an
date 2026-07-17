const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function buildFromManifest() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  let html = fs.readFileSync(path.join(root, manifest.index), 'utf8');
  const css = manifest.css.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  html = html.replace(/<link\s+rel="stylesheet"\s+href="[^"]*\.css">\s*/g, '');
  html = html.replace('</head>', () => '<style>\n' + css + '\n</style>\n</head>');
  const js = manifest.js.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n\n');
  for (const file of manifest.js) {
    html = html.replace('<script src="' + file + '"></script>', '');
  }
  return html.replace('</body>', () => '<script>\n' + js + '\n</script>\n</body>').replace(/\r\n/g, '\n');
}

test('V28 module and handoff bundles are reproducible from the manifest', () => {
  const expected = buildFromManifest();
  const modulePackage = fs.readFileSync(
    path.join(root, 'giao-dien-desktop-don-gian_v28_quan.html'), 'utf8'
  ).replace(/\r\n/g, '\n');
  const handoffPackage = fs.readFileSync(
    path.join(root, '..', 'BANDIAO', 'giao-dien-desktop-don-gian_v28_quan.html'), 'utf8'
  ).replace(/\r\n/g, '\n');
  assert.equal(modulePackage, expected);
  assert.equal(handoffPackage, expected);
});

test('V28 bundle preserves literal dollar signs in JavaScript source', () => {
  const bundle = buildFromManifest();
  assert.match(bundle, /USD:'\$'/);
  assert.doesNotMatch(bundle, /USD:'\s*<script>/);
});

test('V28 bundle contains one implemented File menu and its CSS', () => {
  const bundle = buildFromManifest();
  assert.equal((bundle.match(/FILE MENU - V28/g) || []).length, 1);
  assert.match(bundle, /fm-import-preview/);
  assert.doesNotMatch(bundle, /Coming soon/i);
});

