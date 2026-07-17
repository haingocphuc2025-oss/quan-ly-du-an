const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const grid = read('js/grid.js');
const toolbar = read('js/toolbar.js');
const main = read('js/main.js');
const index = read('index.html');
const css = read('css/main.css');

test('formatting helpers removed during the V27 split are restored', () => {
  assert.match(grid, /function setCellStyleEntry\(styles, key, mutate\)/);
  assert.match(grid, /function toggleCellStyleFlag\(sheet, flag\)/);
  assert.match(grid, /pushSheetSnapshotUndo[\s\S]*?`format-\$\{flag\}`/);
});

test('toolbar buttons use the centralized Microsoft 365 SVG icon system', () => {
  assert.match(toolbar, /const MICROSOFT_365_TOOLBAR_ICONS =/);
  assert.match(toolbar, /function microsoft365ToolbarIcon\(name\)/);
  assert.match(toolbar, /applyMicrosoft365ToolbarIcons\(\)/);
  assert.match(toolbar, /\['saveProjectBtn','save',''\]/);
  assert.match(toolbar, /\['ssColumnsBtn','columns','Cot'\]|\['ssColumnsBtn','columns','C.t'\]/);
  assert.match(index, /id="ssGridViewBtn"/);
  assert.match(css, /\.m365-toolbar-icon/);
});

test('dynamic labels preserve their SVG icons', () => {
  assert.match(toolbar, /setMicrosoft365ToolbarLabel\(ssColumnsBtn/);
  assert.match(grid, /setMicrosoft365ToolbarLabel\(ssBulkEditBtn/);
});

test('top actions and both More buttons have click handlers', () => {
  assert.match(main, /bind\('ssShareBtn', openSheetShareModal\)/);
  assert.match(main, /bind\('ssAiBtn', openSheetAiModal\)/);
  assert.match(main, /bind\('ssTopMoreBtn'/);
  assert.match(grid, /ssMoreBtn\.addEventListener\('click'/);
});

