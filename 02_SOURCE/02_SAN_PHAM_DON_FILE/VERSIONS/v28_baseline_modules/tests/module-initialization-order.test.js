const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('APP_USER_NAME_KEY is declared before the first module uses it', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const source = manifest.js
    .map(file => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n');
  const declarationIndex = source.indexOf("const APP_USER_NAME_KEY = 'appUserName'");
  const useIndex = source.indexOf('localStorage.getItem(APP_USER_NAME_KEY)');

  assert.notEqual(declarationIndex, -1, 'APP_USER_NAME_KEY declaration must exist');
  assert.notEqual(useIndex, -1, 'APP_USER_NAME_KEY must still be used by app initialization');
  assert.ok(declarationIndex < useIndex, 'manifest order must not trigger a temporal dead zone');
});
