const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const gridSource = fs.readFileSync(path.join(root, 'js', 'grid.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'css', 'main.css'), 'utf8');

test('attachment rows expose a real checkbox and an eye preview action', () => {
  assert.match(gridSource, /class="attach-file-check"/);
  assert.match(gridSource, /class="attach-file-preview"/);
  assert.match(gridSource, /openAttachmentPreview\(file\)/);
  assert.match(cssSource, /\.attach-eye-icon\{/);
});

test('attachment toolbar supports select all and selected-state actions', () => {
  assert.match(gridSource, /class="attach-select-all"/);
  assert.match(gridSource, /selectedAttachmentIndexes = new Set\(\)/);
  assert.match(gridSource, /selectAll\.indeterminate = selectedCount > 0/);
  assert.match(gridSource, /data-attach-bulk="download"/);
  assert.match(gridSource, /data-attach-bulk="delete"/);
});

test('bulk download uses direct attachment links and preserves all selected files', () => {
  assert.match(gridSource, /function getAttachmentDownloadHref\(file\)/);
  assert.match(gridSource, /function downloadSelectedAttachments\(\)/);
  assert.match(gridSource, /entries\.forEach\(\(\{file\}, order\)=>/);
  assert.match(gridSource, /downloadAttachmentFile\(file, order \* 120\)/);
});

test('bulk delete confirms once and removes indexes from right to left', () => {
  assert.match(gridSource, /function deleteSelectedAttachments\(\)/);
  assert.match(gridSource, /confirm\('Xóa ' \+ entries\.length \+ ' file đã chọn\?'\)/);
  assert.match(gridSource, /\.sort\(\(a, b\)=>b - a\)/);
  assert.match(gridSource, /removed\.forEach\(file=>/);
});

test('attachment controls work for both sheet and report attachment sources', () => {
  assert.match(gridSource, /const sheet = getAttachmentSheet\(\);/);
  assert.doesNotMatch(
    gridSource.slice(
      gridSource.indexOf("attachList.addEventListener('click'"),
      gridSource.indexOf('backToWorkspace.addEventListener')
    ),
    /getActiveSheet\(\)/
  );
});