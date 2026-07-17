/* V29 viewport-safe floating menu utilities. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MenuPositioning = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var tracked = new Map();
  var resizeFrame = 0;
  var keyboardRoots = new WeakSet();

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function positionRootMenu(options) {
    var margin = Number.isFinite(options.margin) ? options.margin : 8;
    var viewportWidth = Math.max(0, options.viewportWidth);
    var viewportHeight = Math.max(0, options.viewportHeight);
    var availableWidth = Math.max(0, viewportWidth - margin * 2);
    var availableHeight = Math.max(0, viewportHeight - margin * 2);
    var width = Math.min(Math.max(0, options.width), availableWidth);
    var naturalHeight = Math.max(0, options.height);
    var maxHeight = Math.min(naturalHeight, availableHeight);
    var left = clamp(options.x, margin, viewportWidth - margin - width);
    var bottomAlignedTop = viewportHeight - margin - maxHeight;
    var top = clamp(options.y, margin, bottomAlignedTop);
    var opensUp = top < options.y;

    return {
      left: left,
      top: top,
      maxHeight: maxHeight,
      needsScroll: naturalHeight > availableHeight,
      opensUp: opensUp,
    };
  }

  function positionSubmenu(options) {
    var margin = Number.isFinite(options.margin) ? options.margin : 8;
    var gap = Number.isFinite(options.gap) ? options.gap : 4;
    var viewportWidth = Math.max(0, options.viewportWidth);
    var viewportHeight = Math.max(0, options.viewportHeight);
    var availableWidth = Math.max(0, viewportWidth - margin * 2);
    var availableHeight = Math.max(0, viewportHeight - margin * 2);
    var width = Math.min(Math.max(0, options.width), availableWidth);
    var naturalHeight = Math.max(0, options.height);
    var maxHeight = Math.min(naturalHeight, availableHeight);
    var rect = options.anchorRect;
    var rightLeft = rect.right + gap;
    var opensLeft = rightLeft + width > viewportWidth - margin;
    var proposedLeft = opensLeft ? rect.left - gap - width : rightLeft;
    var left = clamp(proposedLeft, margin, viewportWidth - margin - width);
    var top = clamp(rect.top, margin, viewportHeight - margin - maxHeight);

    return {
      left: left,
      top: top,
      maxHeight: maxHeight,
      needsScroll: naturalHeight > availableHeight,
      opensLeft: opensLeft,
    };
  }

  function naturalSize(element) {
    var properties = ['width', 'max-height', 'max-width', 'overflow-y'];
    var previous = properties.map(function (name) {
      return { name: name, value: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name) };
    });
    element.style.setProperty('width', 'auto', 'important');
    element.style.setProperty('max-height', 'none', 'important');
    element.style.setProperty('max-width', 'none', 'important');
    // Measure with a stable scrollbar gutter so overflow:auto cannot widen the final box.
    element.style.setProperty('overflow-y', 'auto', 'important');
    var rect = element.getBoundingClientRect();
    var result = {
      width: Math.max(rect.width, element.scrollWidth || 0),
      height: Math.max(rect.height, element.scrollHeight || 0),
    };
    previous.forEach(function (entry) {
      if (entry.value) element.style.setProperty(entry.name, entry.value, entry.priority);
      else element.style.removeProperty(entry.name);
    });
    return result;
  }

  function applyResult(element, result, viewportWidth, viewportHeight, margin) {
    element.style.setProperty('position', 'fixed', 'important');
    element.style.setProperty('left', result.left + 'px', 'important');
    element.style.setProperty('top', result.top + 'px', 'important');
    element.style.setProperty('max-width', Math.max(0, viewportWidth - margin * 2) + 'px', 'important');
    element.style.setProperty('max-height', result.maxHeight + 'px', 'important');
    element.style.setProperty('overflow-y', result.needsScroll ? 'auto' : 'visible', 'important');
    element.style.overscrollBehavior = 'contain';
    // Overflow scrollbars can change intrinsic width after measurement; clamp the rendered box once more.
    var rendered = element.getBoundingClientRect();
    element.style.setProperty('width', Math.min(rendered.width, Math.max(0, viewportWidth - margin * 2)) + 'px', 'important');
    rendered = element.getBoundingClientRect();
    result.left = clamp(result.left, margin, viewportWidth - margin - rendered.width);
    result.top = clamp(result.top, margin, viewportHeight - margin - rendered.height);
    element.style.setProperty('left', result.left + 'px', 'important');
    element.style.setProperty('top', result.top + 'px', 'important');
    element.dataset.opensUp = result.opensUp ? '1' : '0';
    element.dataset.opensLeft = result.opensLeft ? '1' : '0';
    return result;
  }

  function positionRootElement(element, x, y, options) {
    if (!element) return null;
    var settings = options || {};
    var margin = Number.isFinite(settings.margin) ? settings.margin : 8;
    var size = naturalSize(element);
    var result = positionRootMenu({
      x: x,
      y: y,
      width: size.width,
      height: size.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      margin: margin,
    });
    return applyResult(element, result, window.innerWidth, window.innerHeight, margin);
  }

  function positionSubmenuElement(element, anchor, options) {
    if (!element || !anchor) return null;
    var settings = options || {};
    var margin = Number.isFinite(settings.margin) ? settings.margin : 8;
    var size = naturalSize(element);
    var result = positionSubmenu({
      anchorRect: anchor.getBoundingClientRect(),
      width: size.width,
      height: size.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      margin: margin,
      gap: Number.isFinite(settings.gap) ? settings.gap : 4,
    });
    return applyResult(element, result, window.innerWidth, window.innerHeight, margin);
  }

  function register(id, reposition) {
    if (!id || typeof reposition !== 'function') return;
    tracked.set(id, reposition);
  }

  function unregister(id) {
    tracked.delete(id);
  }

  function repositionTracked() {
    resizeFrame = 0;
    tracked.forEach(function (reposition) {
      try { reposition(); } catch (error) { console.warn('[MenuPositioning]', error); }
    });
  }

  function scheduleReposition() {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(repositionTracked);
  }

  function keepFocusedVisible(element) {
    if (!element || typeof element.scrollIntoView !== 'function') return;
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function enableKeyboardNavigation(rootElement, itemSelector) {
    if (!rootElement || keyboardRoots.has(rootElement)) return;
    keyboardRoots.add(rootElement);
    var selector = itemSelector || 'button:not(:disabled), [role="menuitem"]:not([aria-disabled="true"])';
    rootElement.addEventListener('focusin', function (event) {
      if (event.target.matches && event.target.matches(selector)) keepFocusedVisible(event.target);
    });
    rootElement.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      var items = Array.from(rootElement.querySelectorAll(selector)).filter(function (item) {
        return item.offsetParent !== null;
      });
      if (!items.length) return;
      event.preventDefault();
      var current = items.indexOf(document.activeElement);
      var next = event.key === 'ArrowDown'
        ? Math.min(items.length - 1, Math.max(0, current + 1))
        : Math.max(0, current < 0 ? items.length - 1 : current - 1);
      items[next].focus();
      keepFocusedVisible(items[next]);
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', scheduleReposition, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleReposition, { passive: true });
    }
  }

  return {
    positionRootMenu: positionRootMenu,
    positionSubmenu: positionSubmenu,
    positionRootElement: positionRootElement,
    positionSubmenuElement: positionSubmenuElement,
    register: register,
    unregister: unregister,
    repositionTracked: repositionTracked,
    keepFocusedVisible: keepFocusedVisible,
    enableKeyboardNavigation: enableKeyboardNavigation,
  };
}));
