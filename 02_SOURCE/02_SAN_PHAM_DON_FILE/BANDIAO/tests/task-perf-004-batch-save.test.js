const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.resolve(__dirname, '../../STAGING/giao-dien-desktop-don-gian_v30_quan.html');
const source = fs.readFileSync(sourcePath, 'utf8');

test('all inline application scripts remain syntactically valid', () => {
  const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  scripts.forEach((script, index) => {
    assert.doesNotThrow(() => new vm.Script(script), `inline script ${index}`);
  });
});

test('project persistence uses dirty state with an 800ms debounce', () => {
  assert.match(source, /const PROJECT_SAVE_DEBOUNCE_MS = 800;/);
  assert.match(source, /let projectSaveDirty = false;/);
  assert.match(source, /function markProjectDirty\s*\(/);
  assert.match(source, /projectSaveTimer = window\.setTimeout\([\s\S]*?PROJECT_SAVE_DEBOUNCE_MS\);/);
});

test('legacy persist calls only mark dirty and do not serialize immediately', () => {
  assert.match(source, /function persistToDrive\s*\(\)\s*{\s*markProjectDirty\(/);
  assert.doesNotMatch(source, /function persistToDrive\s*\(\)[\s\S]{0,180}buildProjectSaveSnapshot/);
});

test('batch flush is single-flight, timed and clears dirty state only through save path', () => {
  assert.match(source, /function flushProjectSave\s*\(/);
  assert.match(source, /if\(projectSaveInFlight\)\{[\s\S]*?return projectSaveInFlight\.then/);
  assert.match(source, /window\.__QLDA_PERF__\.measure\('Save Duration'/);
  assert.match(source, /projectSaveDirty = false;/);
});

test('loss boundaries flush pending project data', () => {
  assert.match(source, /beforeunload[\s\S]{0,160}flushProjectSave/);
  assert.match(source, /pagehide[\s\S]{0,160}flushProjectSave/);
  assert.match(source, /function openDetail[\s\S]{0,240}flushProjectSave/);
  assert.match(source, /backToList[\s\S]{0,180}flushProjectSave/);
  assert.match(source, /file-refresh['"]?: function \(\) \{ flushProjectSave/);
});

test('first cell edit schedules persistence without synchronous project serialization', () => {
  const commit = source.match(/function commitEditingCell\(cell\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(commit, /scheduleCellSave\(/);
  assert.doesNotMatch(commit, /serialize|flushProjectSave|buildProjectSaveSnapshot/);
});

test('sheet selection remains UI-only and does not dirty or serialize project data', () => {
  const selection = source.match(/function setActiveSheetCell\([^)]*\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(selection, 'setActiveSheetCell must exist');
  assert.doesNotMatch(selection, /markProjectDirty|persistToDrive|serialize|flushProjectSave/);
});
