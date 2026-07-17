const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js', 'workspace-navigator.js'), 'utf8');

function loadFolderClassifier() {
  const start = source.indexOf('function isWorkspaceFolderLike(item)');
  const end = source.indexOf('\n}\n', start) + 3;
  assert.ok(start >= 0 && end > start, 'isWorkspaceFolderLike must exist');
  const sandbox = {};
  vm.runInNewContext(source.slice(start, end) + '; this.classify = isWorkspaceFolderLike;', sandbox);
  return sandbox.classify;
}

function folderRowsContextHandler() {
  const start = source.indexOf("document.getElementById('folderRows').addEventListener('contextmenu'");
  const end = source.indexOf('\n});\n', start) + 5;
  assert.ok(start >= 0 && end > start, 'folderRows contextmenu handler must exist');
  return source.slice(start, end);
}

test('folder classifier never treats folder-sheet as a folder', () => {
  const isFolder = loadFolderClassifier();
  assert.equal(isFolder({kind: 'folder-sheet', type: 'sheet'}), false);
  assert.equal(isFolder({kind: 'dashboard', type: 'dashboard'}), false);
  assert.equal(isFolder({kind: 'folder'}), true);
  assert.equal(isFolder({type: 'workspace'}), true);
});

test('workspace row context menu routes files to item menu and blank area to create', () => {
  const handler = folderRowsContextHandler();
  assert.match(handler, /if\(!row\)[\s\S]*?showWorkspaceLayoutMenuAt\(e\.clientX, e\.clientY\)/);
  assert.match(handler, /if\(isWorkspaceFolderLike\(item\)\)[\s\S]*?showWorkspaceLayoutMenuAt\(e\.clientX, e\.clientY\)/);
  assert.match(handler, /openWorkspaceItemMenuFromRow\(row, e, activeProjectIndex\)/);
});

test('navigation tree does not register a row context-menu handler', () => {
  assert.doesNotMatch(source, /workspaceNavTree\?\.addEventListener\(\s*contextmenu/);
});
