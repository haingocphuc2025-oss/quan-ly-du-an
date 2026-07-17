const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gridSource = fs.readFileSync(path.join(root, 'js', 'grid.js'), 'utf8');

test('grid re-render preserves active cell and range selection', () => {
  assert.match(gridSource, /const previousActive = getActiveSheetCellPosition\(\);/);
  assert.match(gridSource, /anchor: selRangeAnchor \? \{\.\.\.selRangeAnchor\} : null/);
  assert.match(gridSource, /end: selRangeEnd \? \{\.\.\.selRangeEnd\} : null/);
  assert.match(gridSource, /else if\(previousSelection\.active && cells\.length > 1\)/);
  assert.match(gridSource, /setActiveSheetCell\(row, col, false\);[\s\S]*?updateRangeHighlight\(\);/);
});

test('toolbar formatting still renders through the shared selection-preserving grid path', () => {
  assert.match(gridSource, /function setCellStyleValue\(sheet, prop, value\)[\s\S]*?renderGridSheet\(sheet\);/);
  assert.match(gridSource, /ssBoldBtn\.addEventListener\('click', \(\) =>/);
  assert.match(gridSource, /ssAlignLeftBtn\.addEventListener\('click', \(\) =>/);
});