const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(
  path.resolve(__dirname, '../../STAGING/giao-dien-desktop-don-gian_v30_quan.html'),
  'utf8'
);

test('workspace item openers refresh the visible tree after changing active context', () => {
  const contextRefreshes = source.match(
    /activeSheetContext\s*=\s*\{[^}]+\};\s*refreshWorkspaceFolderTreeIfVisible\(\);/g
  ) || [];
  assert.ok(
    contextRefreshes.length >= 3,
    'Sheet, Report and Dashboard must refresh the visible Browse tree after changing active context'
  );
});
