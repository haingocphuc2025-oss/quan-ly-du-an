const test = require('node:test');
const assert = require('node:assert/strict');

const {
  positionRootMenu,
  positionSubmenu,
} = require('../js/menu-position.js');

test('root menu stays 8px inside 1366x768 and scrolls only when too tall', () => {
  const result = positionRootMenu({
    x: 1320,
    y: 740,
    width: 300,
    height: 900,
    viewportWidth: 1366,
    viewportHeight: 768,
    margin: 8,
  });

  assert.deepEqual(result, {
    left: 1058,
    top: 8,
    maxHeight: 752,
    needsScroll: true,
    opensUp: true,
  });
});

test('root menu shifts upward before enabling internal scrolling', () => {
  const result = positionRootMenu({
    x: 500,
    y: 740,
    width: 300,
    height: 300,
    viewportWidth: 1366,
    viewportHeight: 768,
    margin: 8,
  });

  assert.equal(result.left, 500);
  assert.equal(result.top, 460);
  assert.equal(result.needsScroll, false);
  assert.equal(result.opensUp, true);
});

test('submenu flips left and remains inside the right viewport edge', () => {
  const result = positionSubmenu({
    anchorRect: { left: 1070, right: 1350, top: 700, bottom: 740 },
    width: 260,
    height: 240,
    viewportWidth: 1366,
    viewportHeight: 768,
    margin: 8,
    gap: 4,
  });

  assert.equal(result.left, 806);
  assert.equal(result.top, 520);
  assert.equal(result.opensLeft, true);
  assert.equal(result.needsScroll, false);
});

test('positioning uses CSS viewport pixels and is stable for scaled viewports', () => {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1093, height: 614 },
    { width: 911, height: 512 },
  ]) {
    const result = positionRootMenu({
      x: viewport.width - 2,
      y: viewport.height - 2,
      width: 300,
      height: 560,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      margin: 8,
    });

    assert.ok(result.left >= 8);
    assert.ok(result.top >= 8);
    assert.ok(result.left + 300 <= viewport.width - 8);
    assert.ok(result.top + result.maxHeight <= viewport.height - 8);
  }
});
