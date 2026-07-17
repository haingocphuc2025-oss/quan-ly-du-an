const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gridSource = fs.readFileSync(path.join(root, 'js', 'grid.js'), 'utf8');

test('v27 removes the A1 text badge while keeping typed column icons', () => {
  assert.match(gridSource, /text:\x27\x27/);
  assert.doesNotMatch(gridSource, /text:\x27A1\x27/);
  assert.doesNotMatch(gridSource, /\}\[type\] \|\| \x27A1\x27/);
});

test('v27 supports Shift ranges and Ctrl or Meta disjoint column selection', () => {
  assert.match(gridSource, /function selectSheetColumnRange\(colIndex, extend = false, toggle = false\)/);
  assert.match(gridSource, /function getSelectedColumnIndexes\(fallbackCol = null\)/);
  assert.match(gridSource, /e\.ctrlKey \|\| e\.metaKey/);
  assert.match(gridSource, /columns\.map\(columnName\)\.join\(\x27, \x27\)/);
  assert.match(gridSource, /selectedColumns && !selectedColumns\.includes\(c\)/);
});

test('v27 deletes the selected column set with one confirmation', () => {
  assert.match(gridSource, /function deleteSelectedSheetColumns\(fallbackCol\)/);
  assert.match(gridSource, /const columns = \[\.\.\.new Set\(selectedColumns\)\]/);
  assert.match(gridSource, /if\(!confirm\(`Xoa \$\{suffix\}\?`\)\) return;/);
  assert.match(gridSource, /deleteSelectedSheetColumns\(colIndex\)/);
});