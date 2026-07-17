const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js', 'file-menu.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('current manifest produces the V29 single-file artifact', () => {
  assert.equal(manifest.output, 'giao-dien-desktop-don-gian_v29_quan.html');
});

test('File menu has every requested command and no placeholder handler', () => {
  const ids = [
    'file-new', 'file-import', 'file-open', 'file-save', 'file-save-as',
    'file-save-template', 'file-rename', 'file-refresh', 'file-share',
    'file-send', 'file-email', 'file-export', 'file-print', 'file-delete',
    'file-activity', 'file-properties'
  ];
  for (const id of ids) assert.match(source, new RegExp("'" + id + "'"));
  assert.doesNotMatch(source, /Coming soon/i);
  assert.doesNotMatch(source, /file-save[^\\n]+disabled/);
});

test('save, copy, rename, delete and activity use persistent project data', () => {
  assert.match(source, /function persistProject\(\)/);
  assert.match(source, /saveCurrentProjectStateSilently/);
  assert.match(source, /persistToDrive/);
  assert.match(source, /cloneWorkspaceItem/);
  assert.match(source, /renameWorkspaceItem/);
  assert.match(source, /items\.splice\(Number\(ctx\.folderIndex\), 1\)/);
  assert.match(source, /_activityLog/);
});

test('CSV and Excel imports show preview and support append or replace', () => {
  assert.match(source, /function parseCSV\(text\)/);
  assert.match(source, /XLSX\.read/);
  assert.match(source, /showImportPreview/);
  assert.match(source, /value="append"/);
  assert.match(source, /value="replace"/);
  assert.match(source, /scheduleSheetDataSave/);
});

test('exports include Excel, PDF print and PNG generation', () => {
  assert.match(source, /exportSheetToExcel/);
  assert.match(source, /window\.print\(\)/);
  assert.match(source, /canvas\.toBlob/);
  assert.match(source, /Export to Microsoft Excel/);
  assert.match(source, /Export to PDF/);
});

test('menu keeps keyboard navigation and responsive submenus', () => {
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /event\.key === 'ArrowDown'/);
  assert.match(source, /event\.key === 'Enter'/);
  assert.match(source, /toggleSubmenu\('import'/);
  assert.match(source, /toggleSubmenu\('export'/);
});

