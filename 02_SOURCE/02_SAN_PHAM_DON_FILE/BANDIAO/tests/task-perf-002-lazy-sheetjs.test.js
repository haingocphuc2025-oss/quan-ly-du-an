const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '../../STAGING/giao-dien-desktop-don-gian_v30_quan.html');
const source = fs.readFileSync(sourcePath, 'utf8');

test('SheetJS is absent from executable startup markup', () => {
  assert.doesNotMatch(source, /<script[^>]+src=["'][^"']*(?:xlsx|sheetjs)[^"']*["'][^>]*>/i);
  const startup = source.slice(source.indexOf("if(!window.__QLDA_APP_STARTED__)"));
  assert.doesNotMatch(startup, /loadSheetJS\s*\(/);
});

test('SheetJS loader is single-flight and publishes states', () => {
  assert.match(source, /function loadSheetJS\s*\(\)/);
  assert.match(source, /if\(sheetJSLoadPromise\) return sheetJSLoadPromise;/);
  assert.match(source, /setSheetJSState\('loading'\)/);
  assert.match(source, /setSheetJSState\('ready'\)/);
  assert.match(source, /setSheetJSState\('error'\)/);
});

test('Excel import and export await the lazy loader', () => {
  assert.match(source, /async function exportSheetToExcel[\s\S]*?await loadSheetJS\(\)/);
  assert.match(source, /async function readImportFile[\s\S]*?await loadSheetJS\(\)/);
  assert.match(source, /if \(!await exportSheetToExcel\(item\)\) return;/);
  assert.doesNotMatch(source, /exportSheetToExcel === 'function' && !await/);
});

test('loader failure is surfaced to users', () => {
  assert.match(source, /catch\(error\)\{\s*if\(typeof toast === 'function'\) toast\(error\.message, 'error'\)/);
  assert.match(source, /catch \(error\) \{ toast\(error\.message, 'error'\); return; \}/);
});
