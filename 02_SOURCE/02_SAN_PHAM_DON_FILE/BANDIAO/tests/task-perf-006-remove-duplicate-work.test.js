const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const sourcePath = path.resolve(__dirname, '../../STAGING/giao-dien-desktop-don-gian_v30_quan.html');
const source = fs.readFileSync(sourcePath, 'utf8');

test('lazy lifecycle exposes symmetric destroy and does not reset existing registration state', () => {
  assert.match(source, /function destroyModule\(name\)/);
  assert.match(source, /state\.cleanup\?\.\(\)/);
  assert.match(source, /if\(lazyModuleState\[name\]\) return false/);
  assert.match(source, /cleanupCount/);
});

test('lazy initializers use the required persistent init guard and symmetric cleanup', () => {
  for (const name of ['Report', 'Dashboard', 'Repost', 'Attachment']) {
    const block = source.match(new RegExp(`let initialized = false;\\n function init${name}Module\\(\\)\\{([\\s\\S]*?)\\n \\}`));
    assert.ok(block, `missing ${name} initializer`);
    assert.match(block[1], /if\(initialized\) return;/);
    assert.match(block[1], /initialized = true;/);
    assert.match(block[1], /return \(\) =>/);
    assert.match(block[1], /removeEventListener/);
  }
});

test('project render and column-width storage reads have unchanged-data guards', () => {
  assert.match(source, /let lastProjectRenderSignature = null/);
  assert.match(source, /if\(signature === lastProjectRenderSignature\) return false/);
  assert.match(source, /let colWidthsCache = null/);
  assert.match(source, /if\(colWidthsCache\) return/);
});
