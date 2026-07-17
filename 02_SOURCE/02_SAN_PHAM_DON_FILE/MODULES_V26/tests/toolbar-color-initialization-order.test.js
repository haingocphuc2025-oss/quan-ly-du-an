const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('format rule colors are declared before toolbar aliases them', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const source = manifest.js
    .map(file => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n');
  const declarationIndex = source.indexOf('const FORMAT_RULE_COLORS = [');
  const aliasIndex = source.indexOf('const FILL_COLOR_SWATCHES = FORMAT_RULE_COLORS');

  assert.notEqual(declarationIndex, -1);
  assert.notEqual(aliasIndex, -1);
  assert.ok(declarationIndex < aliasIndex, 'toolbar must not read FORMAT_RULE_COLORS while it is in TDZ');
});
