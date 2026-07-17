const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'js', 'workspace-navigator.js'), 'utf8');

function loadReturnHandler(globals) {
  const match = source.match(/^function\s+returnToBrowseFromChild\([^\n]*\)\{[\s\S]*?^\}/m);
  assert.ok(match, 'Expected returnToBrowseFromChild to exist');
  const context = vm.createContext({...globals});
  vm.runInContext(`${match[0]}; globalThis.__fn = returnToBrowseFromChild;`, context);
  return context.__fn;
}

test('breadcrumb reuses navBack when the previous state is Browse', () => {
  let navBackCalls = 0;
  let fallbackCalls = 0;
  const handler = loadReturnHandler({
    navHistory: [{type: 'list'}, {type: 'sheet'}],
    navIndex: 1,
    navBack: () => { navBackCalls += 1; },
    openRailProjectList: () => { fallbackCalls += 1; }
  });

  handler({preventDefault() {}, stopImmediatePropagation() {}});
  assert.equal(navBackCalls, 1);
  assert.equal(fallbackCalls, 0);
});

test('breadcrumb falls back to the Projects Browse when no list state precedes it', () => {
  let fallbackArgs = null;
  const handler = loadReturnHandler({
    navHistory: [{type: 'detail'}, {type: 'sheet'}],
    navIndex: 1,
    navBack: () => {},
    openRailProjectList: (...args) => { fallbackArgs = args; }
  });

  handler({preventDefault() {}, stopImmediatePropagation() {}});
  assert.deepEqual(fallbackArgs, ['projects', true]);
});
