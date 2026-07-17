const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const workspaceSource = fs.readFileSync(path.join(root, 'js', 'workspace-navigator.js'), 'utf8');
const mainSource = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');
const gridSource = fs.readFileSync(path.join(root, 'js', 'grid.js'), 'utf8');
const reportSource = fs.readFileSync(path.join(root, 'js', 'report.js'), 'utf8');
const dashboardSource = fs.readFileSync(path.join(root, 'js', 'dashboard.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'css', 'main.css'), 'utf8');

test('Home and Recents open the shared project overview layout', () => {
  assert.match(workspaceSource, /section === 'home' \|\| section === 'recents'/);
  assert.match(workspaceSource, /openDetail\(overviewProjectIndex, \{pushHistory:false, remember:false\}\)/);
  assert.match(workspaceSource, /updateProjectListHeader\(section\)/);
  assert.match(workspaceSource, /setRailActive\(section\)/);
});

test('Recents stores at most ten valid project indexes and filters the project list', () => {
  assert.match(workspaceSource, /RECENT_PROJECT_LIMIT = 10/);
  assert.match(workspaceSource, /function rememberRecentProject\(projectIndex\)/);
  assert.match(workspaceSource, /function getRailProjectIndexes\(section = activeRailSection\)/);
  assert.match(mainSource, /const projectIndexes = typeof getRailProjectIndexes/);
  assert.match(mainSource, /projectIndexes\.map\(i =>/);
});

test('opening Workspace Sheet Report and Dashboard updates Recents', () => {
  assert.match(workspaceSource, /function openDetail\(projectIndex, options = \{\}\)/);
  assert.match(workspaceSource, /rememberRecentProject\(projectIndex\)/);
  assert.match(reportSource, /rememberRecentProject\(projectIndex\)/);
  assert.match(dashboardSource, /rememberRecentProject\(projectIndex\)/);
});

test('attachment preview is disabled until a local or Drive link is ready', () => {
  assert.match(gridSource, /function getAttachmentPreviewState\(file\)/);
  assert.match(gridSource, /file\.localStatus === 'saving' \|\| file\.driveStatus === 'uploading'/);
  assert.match(gridSource, /if\(!getAttachmentPreviewState\(file\)\.ready\) return false/);
  assert.match(gridSource, /previewState\.ready \? '>' : ' disabled>'/);
  assert.match(gridSource, /escapeHtml\(previewState\.title\)/);
  assert.match(cssSource, /\.attach-file-preview:disabled/);
});
test('back navigation returns to the Home overview instead of the old Browse page', () => {
  assert.match(workspaceSource, /function goHomeToProjectList\(\)\{\s*openRailProjectList\('home', false\)/);
});