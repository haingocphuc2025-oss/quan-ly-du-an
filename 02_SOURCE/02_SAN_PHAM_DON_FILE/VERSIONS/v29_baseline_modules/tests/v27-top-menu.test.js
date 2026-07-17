const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('v27 removes Dynamic View from the sheet top menu', () => {
  assert.doesNotMatch(indexSource, /Dynamic\s+View/i);
  assert.match(indexSource, /Automation/);
  assert.match(indexSource, /Forms/);
  assert.match(indexSource, /Connections/);
});