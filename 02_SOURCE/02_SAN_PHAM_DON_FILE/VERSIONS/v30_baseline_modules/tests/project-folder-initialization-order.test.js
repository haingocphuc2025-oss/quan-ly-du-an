const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('sample project folders are built only after grid column config is initialized', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const source = manifest.js
    .map(file => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n');
  const columnConfigIndex = source.indexOf('const SHEET_COLUMN_CONFIG = [');
  const folderInitializationIndex = source.indexOf('FOLDER_TEMPLATES = PROJECT_DEFAULT_ITEMS.map');

  assert.notEqual(columnConfigIndex, -1, 'grid column config declaration must exist');
  assert.notEqual(folderInitializationIndex, -1, 'sample folder initialization must exist');
  assert.ok(
    columnConfigIndex < folderInitializationIndex,
    'sample sheets must not call createEmptySheetCells while SHEET_COLUMN_CONFIG is in TDZ'
  );
});
