const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const moduleDir = path.resolve(__dirname, '..');
const importSource = fs.readFileSync(path.join(moduleDir, 'js', 'import-excel.js'), 'utf8');

test('V32 identifies itself as the preserve-template import release', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(moduleDir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.version, '32.0.0');
    assert.match(manifest.name, /v32/i);
});

test('header selection continues to explicit mapping instead of importing positionally', () => {
    const headerNextBlock = importSource.match(/querySelector\('#headerNext'\)[\s\S]*?\n\s*}\);/i)?.[0] || '';
    assert.match(headerNextBlock, /showMappingDialog\(/);
    assert.doesNotMatch(headerNextBlock, /validateAndStore\(/);
    assert.doesNotMatch(importSource, /mapping\[excelColIndex\]\s*=\s*excelColIndex\s*\+\s*2/);
});

test('automatic mapping normalizes header names and supports explicit aliases', () => {
    assert.match(importSource, /function normalizeImportHeader\(/);
    assert.match(importSource, /IMPORT_HEADER_ALIASES/);
    assert.match(importSource, /function buildAutomaticMapping\(headerCols,\s*sheet\)/);
    assert.match(importSource, /getImportableColumns\(sheet\)/);
});

test('preserve-template mode never applies imported schema during execution', () => {
    const executeBlock = importSource.match(/function executeAllImports\(sheet\)[\s\S]*?\n\s*function findRowByKey/i)?.[0] || '';
    assert.doesNotMatch(executeBlock, /applyImportedHeaderSchema\(/);
    assert.doesNotMatch(importSource, /function buildImportedColumnDefinitions\(/);
});

test('copy Excel headers is an explicit opt-in and only updates mapped labels', () => {
    assert.match(importSource, /id="copyExcelHeaders"/);
    assert.doesNotMatch(importSource, /id="copyExcelHeaders"[^>]*checked/i);
    assert.match(importSource, /function applyMappedHeaderLabels\(sheet,\s*mapping,\s*headerCols\)/);
    assert.match(importSource, /copyExcelHeaders:\s*copyExcelHeaders/);
    assert.match(importSource, /if\s*\(info\.copyExcelHeaders\)\s*applyMappedHeaderLabels\(/);
});

test('unmapped Excel columns are retained in mapping state and shown in report', () => {
    assert.match(importSource, /unmappedColumns/);
    assert.match(importSource, /Cột Excel được bỏ qua/);
    assert.match(importSource, /getUnmappedColumns\(headerCols,\s*mapping\)/);
});

test('system columns remain protected for header copy and row writes', () => {
    assert.match(importSource, /isProtectedSheetColumn\(sheet,\s*targetColIndex\)/);
    assert.match(importSource, /isProtectedSheetColumn\(sheet,\s*colIdx\)/);
});
