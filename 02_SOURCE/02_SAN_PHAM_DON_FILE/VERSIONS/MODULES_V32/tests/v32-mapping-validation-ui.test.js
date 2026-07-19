const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const moduleDir = path.resolve(__dirname, '..');
const importSource = fs.readFileSync(path.join(moduleDir, 'js', 'import-excel.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(moduleDir, 'css', 'import-excel.css'), 'utf8');

test('direct normalized header matches take priority over aliases', () => {
    assert.match(importSource, /const directMatches = availableColumns\.filter/);
    assert.match(importSource, /const matches = directMatches\.length > 0 \? directMatches : aliasMatches/);
});

test('invalid or duplicate mappings disable confirmation and announce the reason', () => {
    assert.match(importSource, /id="mappingValidationMessage" role="status" aria-live="polite"/);
    assert.match(importSource, /mappingNextButton\.disabled = !hasMapping \|\| hasDuplicates/);
    assert.match(importSource, /select\.addEventListener\('change', updateMappingValidity\)/);
    assert.match(cssSource, /\.import-btn:disabled/);
    assert.match(cssSource, /\.import-mapping-validation\.is-error/);
});
