/* ========== FILE MENU JS (v27) — Codex rewrite + icons/bridge/keyboard ========== */
(function() {
  'use strict';

  if (window.__fileMenuInitialized) return;
  window.__fileMenuInitialized = true;

  /* ---- SVG Icons ---- */
  const FM_ICONS = {
    'upload': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    'printer': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    'users': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'mail': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    'mail-plus': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="M19 16v6"/><path d="M16 19h6"/></svg>',
    'activity': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'smartsheet': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#F06445"/><path d="M8 8h8v2H8zm0 6h8v2H8zm0-3h5v2H8z" fill="#fff"/></svg>',
    'onedrive': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M12 4C9.5 4 7.5 5.5 6.5 7.5 4.5 7.5 3 9 3 11c0 1.5 1 2.8 2.4 3.3-.1.2-.4.4-.4.7 0 .6.4 1 1 1h14c1.7 0 3-1.3 3-3 0-1.5-1.1-2.7-2.5-2.9C20.5 8.5 19 6 16.5 5.5 15.5 4.5 14 4 12 4z" fill="#0078D4"/></svg>',
    'google-drive': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M10.5 2L3 15.5l3.5 6.5L14 8.5z" fill="#4285F4"/><path d="M14 8.5l-3.5 6.5h10L21 15z" fill="#34A853"/><path d="M6.5 22H17l3.5-6.5H10.5z" fill="#FBBC05"/><path d="M10 2l4 6.5 3.5-6H10z" fill="#EA4335"/></svg>',
    'box': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#2084E5"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'help': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006dcc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'excel': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="2" width="18" height="20" rx="2" fill="#10793F"/><path d="M8 7h8M8 10.5h8M8 14h8M8 17.5h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'pdf': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="2" width="18" height="20" rx="2" fill="#DC3545"/><path d="M7 7h10M7 11h10M7 15h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'image': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    'msproject': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="2" width="18" height="20" rx="2" fill="#147B5B"/><path d="M7 7h10M7 11h10M7 15h10M7 19h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'sheets': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="2" width="18" height="20" rx="2" fill="#0F9D58"/><path d="M8 7h8v2H8zm0 4h8v2H8zm0 4h5v2H8z" fill="#fff"/></svg>',
  };

  function icon(name) {
    return FM_ICONS[name] ? `<span class="menu-icon">${FM_ICONS[name]}</span>` : '<span class="menu-icon"></span>';
  }

  /* ---- State ---- */
  let fileMenuOpen = false;
  let exportSubmenuOpen = false;
  let menuEl = null;
  let exportMenuEl = null;
  let fileBtn = null;
  let bridgeEl = null;
  let focusIndex = -1;
  let exportFocusIndex = -1;
  let closeTimer = null;
  let openTimer = null;

  /* ---- Data ---- */
  const FILE_MENU = [
    { id: 'file-new', label: 'Create New...' },
    { id: 'file-import', label: 'Import', arrow: true },
    { id: 'file-open', label: 'Open...', shortcut: 'Ctrl + /' },
    { type: 'divider' },
    { id: 'file-save', label: 'Save', shortcut: 'Ctrl + S', disabled: true },
    { id: 'file-save-as', label: 'Save as New...' },
    { id: 'file-save-template', label: 'Save as Template...' },
    { id: 'file-rename', label: 'Rename...' },
    { id: 'file-refresh', label: 'Refresh' },
    { type: 'divider' },
    { id: 'file-share', label: 'Share...', icon: 'users' },
    { id: 'file-send', label: 'Send as Attachment...', icon: 'mail-plus' },
    { id: 'file-email', label: 'Email Shared Users...', icon: 'mail' },
    { id: 'file-export', label: 'Export', icon: 'upload', arrow: true, submenu: true },
    { id: 'file-print', label: 'Print...', icon: 'printer' },
    { type: 'divider' },
    { id: 'file-delete', label: 'Delete...' },
    { type: 'divider' },
    { id: 'file-activity', label: 'View Activity Log...', icon: 'activity' },
    { id: 'file-properties', label: 'Properties...' },
  ];

  const EXPORT_MENU = [
    { type: 'section', label: 'Automate offloads with Data Shuttle' },
    { id: 'export-smartsheet', label: 'Smartsheet Attachment', icon: 'smartsheet' },
    { id: 'export-onedrive', label: 'OneDrive & Sharepoint', icon: 'onedrive' },
    { id: 'export-google', label: 'Google Drive', icon: 'google-drive' },
    { id: 'export-box', label: 'Box', icon: 'box' },
    { id: 'export-learn', label: 'Learn more', icon: 'help', isLink: true },
    { type: 'divider' },
    { type: 'section', label: 'Export file' },
    { id: 'export-excel', label: 'Export to Microsoft Excel', icon: 'excel' },
    { id: 'export-pdf', label: 'Export to PDF ...', icon: 'pdf' },
    { id: 'export-png', label: 'Export Gantt to Image (PNG)', icon: 'image' },
    { id: 'export-msproject', label: 'Export to Microsoft Project (XML)', icon: 'msproject' },
    { id: 'export-sheets', label: 'Export to Google Sheets...', icon: 'sheets' },
  ];

  /* ========== BUILD ========== */
  function buildMenu() {
    if (menuEl) return;

    // Main dropdown
    menuEl = document.createElement('div');
    menuEl.className = 'file-dropdown';
    menuEl.id = 'fileMenu';
    menuEl.setAttribute('role', 'menu');

    FILE_MENU.forEach((item, idx) => {
      if (item.type === 'divider') {
        const d = document.createElement('div');
        d.className = 'menu-divider';
        menuEl.appendChild(d);
        return;
      }
      const btn = document.createElement('button');
      btn.className = 'menu-item' + (item.disabled ? ' is-disabled' : '') + (item.submenu ? ' has-submenu' : '');
      btn.dataset.idx = idx;
      btn.setAttribute('role', 'menuitem');
      if (item.disabled) btn.setAttribute('aria-disabled', 'true');
      if (item.submenu) btn.setAttribute('aria-haspopup', 'menu');

      btn.innerHTML = icon(item.icon) +
        `<span class="menu-label">${item.label}</span>` +
        (item.shortcut ? `<span class="menu-shortcut">${item.shortcut}</span>` : '') +
        (item.arrow ? `<span class="menu-arrow">›</span>` : '');

      if (!item.disabled) {
        btn.addEventListener('click', (e) => { e.stopPropagation(); handleItemClick(item); });
        btn.addEventListener('mouseenter', () => handleHover(idx));
      }
      menuEl.appendChild(btn);
    });

    // Export submenu
    exportMenuEl = document.createElement('div');
    exportMenuEl.className = 'export-submenu';
    exportMenuEl.id = 'exportSubmenu';
    exportMenuEl.setAttribute('role', 'menu');

    EXPORT_MENU.forEach((item, idx) => {
      if (item.type === 'divider') {
        const d = document.createElement('div');
        d.className = 'menu-divider';
        exportMenuEl.appendChild(d);
        return;
      }
      if (item.type === 'section') {
        const s = document.createElement('div');
        s.className = 'menu-section-label';
        s.textContent = item.label;
        exportMenuEl.appendChild(s);
        return;
      }
      const btn = document.createElement('button');
      btn.className = 'menu-item submenu-item';
      btn.dataset.idx = idx;
      btn.setAttribute('role', 'menuitem');
      btn.innerHTML = icon(item.icon) + `<span class="menu-label"${item.isLink ? ' style="color:#006dcc"' : ''}>${item.label}</span>`;
      btn.addEventListener('click', () => handleExportClick(item));
      btn.addEventListener('mouseenter', () => { if (closeTimer) clearTimeout(closeTimer); });
      exportMenuEl.appendChild(btn);
    });

    // Submenu mouseleave
    exportMenuEl.addEventListener('mouseleave', () => {
      if (!menuEl?.matches(':hover') && !bridgeEl?.matches(':hover')) {
        closeTimer = setTimeout(() => toggleExport(false), 300);
      }
    });
    exportMenuEl.addEventListener('mouseenter', () => { if (closeTimer) clearTimeout(closeTimer); });

    // Bridge
    bridgeEl = document.createElement('div');
    bridgeEl.className = 'menu-bridge';
    bridgeEl.addEventListener('mouseenter', () => { if (closeTimer) clearTimeout(closeTimer); });
    bridgeEl.addEventListener('mouseleave', () => {
      if (!menuEl?.matches(':hover') && !exportMenuEl?.matches(':hover')) {
        closeTimer = setTimeout(() => toggleExport(false), 300);
      }
    });

    // Append to body
    document.body.appendChild(menuEl);
    document.body.appendChild(exportMenuEl);
    document.body.appendChild(bridgeEl);

    // Hook File button
    fileBtn = document.querySelector('.sheet-menu-link');
    if (fileBtn) {
      fileBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    }

    // Click outside
    document.addEventListener('click', (e) => {
      if (fileMenuOpen && !e.target.closest('#fileMenu') && !e.target.closest('#exportSubmenu') && !e.target.closest('.menu-bridge') && !e.target.closest('.sheet-menu-link')) {
        closeAll();
      }
    });

    // Keyboard
    document.addEventListener('keydown', handleKey);
  }

  /* ========== TOGGLE ========== */
  function toggleMenu() {
    if (fileMenuOpen) { closeAll(); return; }
    closeAll();
    fileMenuOpen = true;
    menuEl.classList.add('is-open');
    fileBtn.classList.add('is-active');

    const r = fileBtn.getBoundingClientRect();
    menuEl.style.position = 'fixed';
    menuEl.style.top = (r.bottom + 2) + 'px';
    menuEl.style.left = r.left + 'px';

    focusIndex = 0;
    setTimeout(() => focusItem(0), 30);
  }

  function toggleExport(open, anchorIdx) {
    if (closeTimer) clearTimeout(closeTimer);
    if (openTimer) clearTimeout(openTimer);

    if (open && !exportSubmenuOpen) {
      exportSubmenuOpen = true;
      const anchor = anchorIdx !== undefined
        ? menuEl.querySelector(`[data-idx="${anchorIdx}"]`)
        : menuEl.querySelector('.has-submenu');
      if (anchor) {
        anchor.classList.add('is-open');
        const r = anchor.getBoundingClientRect();
        exportMenuEl.style.position = 'fixed';
        exportMenuEl.style.top = r.top + 'px';
        exportMenuEl.style.left = (r.right + 4) + 'px';
        // Bridge
        bridgeEl.style.position = 'fixed';
        bridgeEl.style.top = r.top + 'px';
        bridgeEl.style.left = r.right + 'px';
        bridgeEl.style.width = '4px';
        bridgeEl.style.height = r.height + 'px';
        bridgeEl.classList.add('active');
      }
      exportMenuEl.classList.add('is-open');
      exportFocusIndex = -1;
    } else if (!open && exportSubmenuOpen) {
      exportSubmenuOpen = false;
      const openItem = menuEl.querySelector('.has-submenu.is-open');
      if (openItem) openItem.classList.remove('is-open');
      exportMenuEl.classList.remove('is-open');
      bridgeEl.classList.remove('active');
    }
  }

  function closeAll() {
    fileMenuOpen = false;
    exportSubmenuOpen = false;
    menuEl?.classList.remove('is-open');
    exportMenuEl?.classList.remove('is-open');
    fileBtn?.classList.remove('is-active');
    bridgeEl?.classList.remove('active');
    const oi = menuEl?.querySelector('.has-submenu.is-open');
    if (oi) oi.classList.remove('is-open');
    if (closeTimer) clearTimeout(closeTimer);
    if (openTimer) clearTimeout(openTimer);
    focusIndex = -1;
    exportFocusIndex = -1;
    clearHighlights();
  }

  /* ========== HANDLERS ========== */
  function handleItemClick(item) {
    if (item.submenu) { toggleExport(true); return; }
    closeAll();
    if (item.id === 'file-print') { window.print(); return; }
    showToast(`"${item.label}" — đang phát triển`);
  }

  function handleHover(idx) {
    const item = FILE_MENU[idx];
    if (!item) return;
    clearHighlights();
    const btn = menuEl.querySelector(`[data-idx="${idx}"]`);
    if (btn) btn.classList.add('highlighted');

    if (item.submenu) {
      if (openTimer) clearTimeout(openTimer);
      openTimer = setTimeout(() => toggleExport(true, idx), 120);
    } else if (exportSubmenuOpen) {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (!bridgeEl?.matches(':hover') && !exportMenuEl?.matches(':hover')) toggleExport(false);
      }, 300);
    }
  }

  function handleExportClick(item) {
    closeAll();
    if (item.id === 'export-learn') { window.open('https://help.smartsheet.com/', '_blank'); return; }
    if (item.id === 'export-excel') { showToast('Đang xuất Excel...'); return; }
    if (item.id === 'export-pdf') { showToast('Đang xuất PDF...'); return; }
    if (item.id === 'export-png') { showToast('Đang xuất PNG...'); return; }
    showToast(`"${item.label}" — đang phát triển`);
  }

  /* ========== KEYBOARD ========== */
  function handleKey(e) {
    if (!fileMenuOpen) return;
    const key = e.key;
    const items = getEnabledItems();
    const expItems = getEnabledExportItems();
    const isFileFocused = menuEl?.contains(document.activeElement);
    const isExportFocused = exportMenuEl?.contains(document.activeElement);

    if (key === 'Escape') {
      e.preventDefault();
      if (exportSubmenuOpen) { toggleExport(false); focusItem(focusIndex); }
      else { closeAll(); fileBtn?.focus(); }
      return;
    }

    if (!isFileFocused && !isExportFocused) return;

    // Export submenu keyboard
    if (isExportFocused && exportSubmenuOpen) {
      if (key === 'ArrowLeft') { e.preventDefault(); toggleExport(false); focusItem(focusIndex); return; }
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        e.preventDefault();
        exportFocusIndex = cycle(exportFocusIndex, expItems.length, key === 'ArrowDown' ? 1 : -1);
        focusExportItem(exportFocusIndex);
        return;
      }
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        const el = expItems[exportFocusIndex];
        if (el) el.click();
        return;
      }
      if (key === 'Home') { e.preventDefault(); exportFocusIndex = 0; focusExportItem(0); return; }
      if (key === 'End') { e.preventDefault(); exportFocusIndex = expItems.length - 1; focusExportItem(expItems.length - 1); return; }
    }

    // File menu keyboard
    if (isFileFocused) {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        e.preventDefault();
        focusIndex = cycle(focusIndex, items.length, key === 'ArrowDown' ? 1 : -1);
        focusItem(focusIndex);
        return;
      }
      if (key === 'ArrowRight') {
        e.preventDefault();
        // Find focused item by DOM, not by focusIndex
        let el = null;
        const allItems = getEnabledItems();
        for (let i = 0; i < allItems.length; i++) {
          if (allItems[i] === document.activeElement) { el = allItems[i]; focusIndex = i; break; }
        }
        if (!el && focusIndex >= 0 && focusIndex < allItems.length) el = allItems[focusIndex];
        if (el) {
          const idx = parseInt(el.dataset.idx);
          const data = FILE_MENU[idx];
          if (data?.submenu) {
            toggleExport(true, idx);
            setTimeout(() => {
              const exp = getEnabledExportItems();
              if (exp.length > 0) { exp[0].focus(); exp[0].classList.add('highlighted'); exportFocusIndex = 0; }
            }, 50);
          }
        }
        return;
      }
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        const el = items[focusIndex];
        if (el && !el.disabled) el.click();
        return;
      }
      if (key === 'Home') { e.preventDefault(); focusIndex = 0; focusItem(0); return; }
      if (key === 'End') { e.preventDefault(); focusIndex = items.length - 1; focusItem(items.length - 1); return; }
    }
  }

  /* ========== HELPERS ========== */
  function getEnabledItems() { return Array.from(menuEl?.querySelectorAll('.menu-item:not([aria-disabled="true"])') || []); }
  function getEnabledExportItems() { return Array.from(exportMenuEl?.querySelectorAll('.menu-item') || []); }
  function cycle(cur, len, dir) { return len === 0 ? -1 : ((cur + dir) % len + len) % len; }

  function focusItem(idx) {
    clearHighlights();
    const items = getEnabledItems();
    if (idx >= 0 && idx < items.length) { items[idx].classList.add('highlighted'); items[idx].focus(); }
  }

  function focusExportItem(idx) {
    const items = getEnabledExportItems();
    items.forEach(el => el.classList.remove('highlighted'));
    if (idx >= 0 && idx < items.length) { items[idx].classList.add('highlighted'); items[idx].focus(); }
  }

  function clearHighlights() {
    menuEl?.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
    exportMenuEl?.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
  }

  /* ========== TOAST ========== */
  function showToast(msg) {
    let t = document.getElementById('fmToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'fmToast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;background:#333;color:#fff;padding:12px 24px;border-radius:8px;font:14px Arial,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:0;transition:opacity .25s;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    if (window._fmTimer) clearTimeout(window._fmTimer);
    window._fmTimer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
  }

  /* ========== INIT ========== */
  function init() {
    const check = setInterval(() => {
      const btn = document.querySelector('.sheet-menu-link');
      if (btn) { clearInterval(check); buildMenu(); console.log('[FileMenu] Ready'); }
    }, 100);
    setTimeout(() => clearInterval(check), 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
