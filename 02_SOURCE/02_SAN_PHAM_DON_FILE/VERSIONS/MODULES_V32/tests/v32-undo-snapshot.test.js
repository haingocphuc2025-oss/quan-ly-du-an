const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const moduleDir = path.resolve(__dirname, '..');
const importSource = fs.readFileSync(path.join(moduleDir, 'js', 'import-excel.js'), 'utf8');
const toolbarSource = fs.readFileSync(path.join(moduleDir, 'js', 'toolbar.js'), 'utf8');

test('sheet snapshots include and restore column labels, types and formats', () => {
    for (const property of ['columnConfigs', 'columnTypes', 'columnFormats']) {
        assert.match(toolbarSource, new RegExp(`${property}: cloneForHistory\\(`));
        assert.match(toolbarSource, new RegExp(`snapshot\\.${property}`));
    }
});

test('import pushes a complete before/after snapshot with the label in the correct argument', () => {
    assert.match(
        importSource,
        /pushSheetSnapshotUndo\(sheet, snapshot, takeUndoSnapshot\(sheet\), label\)/
    );
    assert.doesNotMatch(importSource, /pushSheetSnapshotUndo\(sheet, snapshot, label\)/);
});

test('report Undo restores the complete import snapshot', () => {
    assert.match(importSource, /restoreUndoSnapshot\(item, undoSnapshot\)/);
    assert.match(importSource, /renderGridSheet\(item\)/);
    assert.doesNotMatch(importSource, /item\.cells = JSON\.parse\(JSON\.stringify\(undoSnapshot\)\)/);
});
