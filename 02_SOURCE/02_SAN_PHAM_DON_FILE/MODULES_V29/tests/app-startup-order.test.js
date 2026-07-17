const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('application starts only after every manifest module is initialized', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const startupModules = manifest.js.filter(file =>
    fs.readFileSync(path.join(root, file), 'utf8').includes('window.__QLDA_APP_STARTED__')
  );

  assert.deepEqual(startupModules, [manifest.js.at(-1)], 'startup guard must exist only in the final module');
});
