const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const sourcePath = path.resolve(
  __dirname,
  '../../STAGING/giao-dien-desktop-don-gian_v31_quan.html'
);
const source = fs.readFileSync(sourcePath, 'utf8');

test('right toolbar is a fixed root-level rail outside the project topbar', () => {
  const toolbarIndex = source.indexOf('id="rightToolbar"');
  const mainIndex = source.indexOf('<div class="main">');
  const screenListIndex = source.indexOf('<div id="screen-list">');

  assert.ok(toolbarIndex >= 0, 'rightToolbar must exist');
  assert.ok(toolbarIndex < mainIndex, 'rightToolbar must be mounted before the main workspace');
  assert.ok(toolbarIndex < screenListIndex, 'rightToolbar must not be nested in screen-list/topbar');
  assert.doesNotMatch(source, /\.topbar\s+\.right-toolbar\s*\{/);
  assert.match(source, /\.right-toolbar\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?flex-direction:\s*column;/);
});

test('right rail keeps the four sheet tools and attachment entry point', () => {
  for (const id of ['tbAttach', 'tbComment', 'tbActivity', 'tbInfo']) {
    assert.match(source, new RegExp(`id=["']${id}["']`), `${id} must remain in the rail`);
  }
  assert.match(source, /id="tbAttach"[^>]*onclick="openAttachmentPanelFromToolbar\(\)"/);
  assert.match(source, /function openAttachmentPanelFromToolbar\(\)[\s\S]*?openAttachmentPanel\(row\)/);
});

test('the open sheet context wins over stale browse focus when marking the tree active', () => {
  assert.match(
    source,
    /function getWorkspaceBrowseFocusContext\(\)\s*\{\s*return activeSheetContext \|\| workspaceBrowseFocusContext \|\| null;\s*\}/
  );
  assert.match(source, /class="browse-tree-child \$\{isActiveChild \? 'active' : ''\}"/);
});
