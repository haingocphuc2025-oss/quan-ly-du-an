const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const moduleRoot = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(moduleRoot, 'index.html'), 'utf8');
const navigator = fs.readFileSync(path.join(moduleRoot, 'js', 'workspace-navigator.js'), 'utf8');
const ctx = index.slice(index.indexOf('<div class="ctx-menu" id="ctxMenu">'), index.indexOf('<div class="layout-menu" id="layoutMenu">'));

test('workspace context menu exposes the Workspace action groups', () => {
  for (const label of [
    'Create', 'Grid', 'Task List', 'Project', 'Cards', 'Browse Templates',
    'Import Excel', 'Import Project', 'Import Google Sheets', 'Import Trello',
    'Report', 'Dashboard/Portal', 'Folder', 'Workspace', 'Open in New Tab',
    'Share...', 'Remove Me from Sharing...', 'Save as New...',
    'Workspace Colors &amp; Logo...', 'Request Backup...',
    'Schedule Recurring Backup...', 'Export to Excel', 'Export to PDF',
    'Export to Google Sheets', 'Download Workspace Sharing Report (csv)',
    'Properties...'
  ]) assert.ok(ctx.includes(label));
  assert.doesNotMatch(ctx, /data-action="rename"|data-action="delete"|Make Me the Owner/);
  assert.match(ctx, /ctx-submenu/);
});

test('blank-area menu contains only create and import actions', () => {
  const layout = index.slice(index.indexOf('<div class="layout-menu" id="layoutMenu">'), index.indexOf('<div class="sheet-modal" id="sheetNameModal"'));
  for (const label of [
    'Grid', 'Task List', 'Project', 'Cards', 'Browse Templates',
    'Import Microsoft Excel...', 'Import Microsoft Project...',
    'Import from Google Sheets...', 'Import from Atlassian Trello...',
    'Report', 'Dashboard/Portal', 'Folder', 'Workspace'
  ]) assert.ok(layout.includes(label));
  assert.doesNotMatch(layout, /Share|Backup|Export|Properties|Rename|Delete/);
  assert.match(navigator, /function showWorkspaceCreateMenuAt/);
  assert.match(navigator, /const openBlankWorkspaceMenu/);
});
test('sheet/report context menu has file actions and excludes Duplicate', () => {
  assert.match(navigator, /data-act="owner"><span class="menu-ic">O<\/span>Make Me the Owner/);
  assert.match(navigator, /data-act="save-new"/);
  assert.doesNotMatch(navigator, /data-act="duplicate"><span class="menu-ic">D<\/span>Duplicate/);
  assert.match(navigator, /if\(action === 'open'\)\{ if\(item\.type === 'report'\) openReport/);
});

test('workspace context menu is wired to the Browse tree and Workspace table rows', () => {
  assert.match(navigator, /workspaceBrowseTree\?\.addEventListener\('contextmenu'/);
  assert.match(navigator, /workspaceNavigatorRows\?\.addEventListener\('contextmenu'/);
  assert.match(navigator, /function showWorkspaceLayoutMenuAt\(x, y, projectIndex = getActionProjectIndex\(\)\)/);
  assert.match(navigator, /showProjectActionMenu\(projectIndex, x, y\)/);
});