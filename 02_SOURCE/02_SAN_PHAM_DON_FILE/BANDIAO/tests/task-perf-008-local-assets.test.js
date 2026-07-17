const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const stagingDir = path.resolve(__dirname, '../../STAGING');
const sourcePath = path.join(stagingDir, 'giao-dien-desktop-don-gian_v30_quan.html');
const source = fs.readFileSync(sourcePath, 'utf8');

test('startup fonts are local and no Google Fonts connection remains', () => {
  assert.doesNotMatch(source, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.match(source, /<link rel="preload" href="\.\/assets\/fonts\/inter-latin-v1-400\.woff2" as="font" type="font\/woff2" crossorigin>/);
  assert.match(source, /@font-face\s*{[^}]*font-family:'Inter'[^}]*font-display:swap/);
  assert.match(source, /@font-face\s*{[^}]*font-family:'IBM Plex Mono'[^}]*font-display:swap/);
  assert.match(source, /@font-face\s*{[^}]*font-family:'Source Serif 4'[^}]*font-display:swap/);
});

test('all declared local fonts exist, are WOFF2, and remain under the 1 MiB budget', () => {
  const urls = [...source.matchAll(/url\(['"]?(\.\/assets\/fonts\/[^)'"\s]+\.woff2)/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, 14, 'only latin and Vietnamese subsets for the seven required faces should ship');
  let totalBytes = 0;
  for (const relativeUrl of new Set(urls)) {
    const filePath = path.resolve(stagingDir, relativeUrl);
    const bytes = fs.readFileSync(filePath);
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'wOF2', `${relativeUrl} must be WOFF2`);
    totalBytes += bytes.length;
  }
  assert.ok(totalBytes <= 1024 * 1024, `font payload ${totalBytes} exceeds 1 MiB`);
});

test('font licenses ship locally while large optional libraries stay lazy', () => {
  for (const family of ['inter', 'ibm-plex-mono', 'source-serif-4']) {
    const license = fs.readFileSync(path.join(stagingDir, 'assets', 'fonts', family, 'OFL.txt'), 'utf8');
    assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/i);
  }
  assert.match(source, /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/xlsx\/0\.18\.5\/xlsx\.full\.min\.js/);
  assert.doesNotMatch(source, /<script[^>]+xlsx\.full\.min\.js/i);
  assert.match(source, /script\.src = 'https:\/\/accounts\.google\.com\/gsi\/client'/);
});
