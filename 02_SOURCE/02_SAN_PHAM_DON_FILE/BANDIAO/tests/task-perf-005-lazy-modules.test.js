const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.resolve(__dirname, '../../STAGING/giao-dien-desktop-don-gian_v30_quan.html');
const source = fs.readFileSync(sourcePath, 'utf8');

test('all inline application scripts remain syntactically valid', () => {
  const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  scripts.forEach((script, index) => assert.doesNotThrow(() => new vm.Script(script), `inline script ${index}`));
});

test('lazy module coordinator exposes init-once state for all expensive modules', () => {
  assert.match(source, /window\.__QLDA_LAZY_MODULES__/);
  assert.match(source, /function ensureModuleInitialized\s*\(/);
  for (const name of ['report', 'dashboard', 'repost', 'attachment']) {
    assert.match(source, new RegExp(`registerLazyModule\\('${name}'`));
  }
});

test('module entry points initialize their module before module work', () => {
  assert.match(source, /function openReport\([^)]*\)\s*{\s*ensureModuleInitialized\('report'\)/);
  assert.match(source, /function openDashboard\([^)]*\)\s*{\s*ensureModuleInitialized\('dashboard'\)/);
  assert.match(source, /function openAttachmentPanel\([^)]*\)\s*{\s*ensureModuleInitialized\('attachment'\)/);
  assert.match(source, /function openSheet\([^)]*\)[\s\S]*?isRepostSheet\([^)]*\)[\s\S]*?ensureModuleInitialized\('repost'\)/);
});

test('startup does not eagerly invoke module initializers', () => {
  for (const initializer of ['initReportModule', 'initDashboardModule', 'initRepostModule', 'initAttachmentModule']) {
    const calls = [...source.matchAll(new RegExp(`${initializer}\\(\\)`, 'g'))];
    assert.equal(calls.length, 1, `${initializer} must only appear as its declaration/registered callback`);
  }
});

test('module listeners are guarded by init-once initializers', () => {
  for (const initializer of ['initReportModule', 'initDashboardModule', 'initRepostModule', 'initAttachmentModule']) {
    assert.match(source, new RegExp(`function ${initializer}\\(\\)[\\s\\S]*?root\\.addEventListener`));
  }
});
