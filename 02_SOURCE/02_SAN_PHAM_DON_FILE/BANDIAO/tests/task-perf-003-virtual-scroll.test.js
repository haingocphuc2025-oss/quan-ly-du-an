const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '../../STAGING/giao-dien-desktop-don-gian_v30_quan.html');
const source = fs.readFileSync(sourcePath, 'utf8');

test('sheet rows use a bounded virtual viewport', () => {
  assert.match(source, /const SHEET_VIRTUAL_BUFFER_ROWS\s*=/);
  assert.match(source, /function calculateSheetVisibleRange\s*\(/);
  assert.match(source, /Math\.ceil\(viewportHeight\s*\/\s*rowHeight\)/);
  assert.match(source, /data-virtual-spacer="top"/);
  assert.match(source, /data-virtual-spacer="bottom"/);
  assert.doesNotMatch(source, /const body = cells\.map\(/);
});

test('scroll work is animation-frame scheduled and reuses the table shell', () => {
  assert.match(source, /function scheduleSheetVirtualRender\s*\(/);
  assert.match(source, /requestAnimationFrame\(\(\)\s*=>\s*renderSheetVirtualRows/);
  assert.match(source, /sheetGridWrap\.addEventListener\('scroll', scheduleSheetVirtualRender/);
  assert.match(source, /sheetVirtualState\.table = table/);
});

test('offscreen cell navigation materializes the target row', () => {
  assert.match(source, /function ensureSheetRowRendered\s*\(/);
  assert.match(source, /ensureSheetRowRendered\(rowIndex/);
  assert.match(source, /ensureSheetRowRendered\(row,/);
});
