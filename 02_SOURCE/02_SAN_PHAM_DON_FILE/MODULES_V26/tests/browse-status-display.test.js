const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const MODULE_ROOT = path.resolve(__dirname, '..');
const navigatorPath = path.join(MODULE_ROOT, 'js', 'workspace-navigator.js');
const navigatorSource = fs.readFileSync(navigatorPath, 'utf8');
const indexSource = fs.readFileSync(path.join(MODULE_ROOT, 'index.html'), 'utf8');

function loadFunction(name, globals = {}) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = navigatorSource.match(new RegExp(`^function\\s+${escapedName}\\([^\\n]*\\)\\{[\\s\\S]*?^\\}`, 'm'));
  assert.ok(match, `Expected function ${name} to exist`);
  const context = vm.createContext({...globals});
  vm.runInContext(`${match[0]}; globalThis.__fn = ${name};`, context);
  return context.__fn;
}

test('sharingStatusBadgeHtml maps stored shared state to Vietnamese badges', () => {
  const sharingStatusBadgeHtml = loadFunction('sharingStatusBadgeHtml');

  assert.match(sharingStatusBadgeHtml(true), /browse-sharing-badge shared/);
  assert.match(sharingStatusBadgeHtml(true), /Đã chia sẻ/);
  assert.match(sharingStatusBadgeHtml(false), /browse-sharing-badge private/);
  assert.match(sharingStatusBadgeHtml(false), /Riêng tư/);
});

test('workspace navigator items inherit owner and sharing state from their project', () => {
  const DATA = [
    {name: 'Dự án A', owner: 'Quân', shared: true, updated: '15/07/2026'},
    {name: 'Dự án B', owner: 'Lan', shared: false, updated: '14/07/2026'}
  ];
  const PROJECT_FOLDERS = [[{name: 'Sheet A', type: 'sheet'}], [{name: 'Report B', type: 'report'}]];
  const workspaceNavigatorItems = loadFunction('workspaceNavigatorItems', {
    DATA,
    PROJECT_FOLDERS,
    workspaceItemIconHtml: () => '<i></i>',
    workspaceItemVisualType: item => item.type || item,
    isWorkFile: () => true,
    getWorkspaceItemLabel: item => item.name
  });

  const items = workspaceNavigatorItems('workspaces');
  assert.deepEqual(Array.from(items, item => [item.owner, item.shared]), [
    ['Quân', true], ['Quân', true], ['Lan', false], ['Lan', false]
  ]);
});

test('Browse project rows render sharing status and owner from project data', () => {
  const workspaceBrowseRows = {innerHTML: ''};
  const workspaceBrowseTitle = {textContent: ''};
  const renderWorkspaceBrowseProjectRows = loadFunction('renderWorkspaceBrowseProjectRows', {
    workspaceBrowseRows,
    workspaceBrowseTitle,
    DATA: [{name: 'Dự án A', owner: 'Quân & Co', shared: false, updated: '15/07/2026'}],
    PROJECT_FOLDERS: [[{name: 'Sheet A', type: 'sheet'}]],
    getWorkspaceBrowseProjectIndex: () => 0,
    workspaceItemVisualType: item => item.type,
    isWorkFile: () => true,
    workspaceItemIconHtml: () => '<i></i>',
    getWorkspaceItemLabel: item => item.name,
    sharingStatusBadgeHtml: shared => shared ? 'Đã chia sẻ' : 'Riêng tư',
    escapeHtml: value => String(value).replaceAll('&', '&amp;')
  });

  renderWorkspaceBrowseProjectRows();
  assert.match(workspaceBrowseRows.innerHTML, /Riêng tư/);
  assert.match(workspaceBrowseRows.innerHTML, /Quân &amp; Co/);
});

test('all child views expose the same Browse breadcrumb hook', () => {
  const hooks = indexSource.match(/data-browse-breadcrumb/g) || [];
  const classes = indexSource.match(/class="[^"]*browse-breadcrumb[^"]*"/g) || [];

  assert.equal(hooks.length, 3, 'Grid/Repost, Report and Dashboard need breadcrumb hooks');
  assert.equal(classes.length, 3, 'All breadcrumb buttons need the shared visual class');
});

test('updateBrowseBreadcrumb shows the active project name on every child view', () => {
  const breadcrumbs = [{textContent: ''}, {textContent: ''}, {textContent: ''}];
  const updateBrowseBreadcrumb = loadFunction('updateBrowseBreadcrumb', {
    DATA: [{name: 'Dự án A'}],
    document: {querySelectorAll: () => breadcrumbs}
  });

  updateBrowseBreadcrumb(0);
  assert.deepEqual(breadcrumbs.map(item => item.textContent), ['‹ Dự án A', '‹ Dự án A', '‹ Dự án A']);
});
