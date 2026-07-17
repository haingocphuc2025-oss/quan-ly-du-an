const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('grid DOM elements are declared before attachment and navigation listeners bind', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const source = manifest.js
    .map(file => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n');

  for (const [name, listener] of [
    ['attachList', "attachList.addEventListener('dragover'"],
    ['backToWorkspace', "backToWorkspace.addEventListener('click'"],
    ['toggleSheetChrome', "toggleSheetChrome.addEventListener('click'"],
    ['closeSheetNav', "closeSheetNav.addEventListener('click'"]
  ]) {
    const declarationIndex = source.indexOf(`const ${name} =`);
    const listenerIndex = source.indexOf(listener);
    assert.notEqual(declarationIndex, -1, `${name} declaration must exist`);
    assert.notEqual(listenerIndex, -1, `${name} listener must exist`);
    assert.ok(declarationIndex < listenerIndex, `${name} listener must bind after declaration`);
  }
});
