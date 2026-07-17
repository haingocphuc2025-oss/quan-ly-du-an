/* ========== FILE MENU JS (v27) ========== */
(function() {
  'use strict';
  
  // Guard: prevent multiple initialization
  if (window.__fileMenuInitialized) return;
  window.__fileMenuInitialized = true;
  
  /* ---- State ---- */
  let fileMenuOpen = false;
  let exportSubmenuOpen = false;
  let importSubmenuOpen = false;
  let menuEl = null;
  let fileBtn = null;
  let focusIndex = -1;
  
  /* ---- Menu Items ---- */
  const FILE_MENU_ITEMS = [
    { id: 'file-new', label: 'Create New...', shortcut: '' },
    { id: 'file-import', label: 'Import', hasArrow: true },
    { id: 'file-open', label: 'Open...', shortcut: 'Ctrl + O' },
    { id: 'divider' },
    { id: 'file-save', label: 'Save', shortcut: 'Ctrl + S', disabled: true },
    { id: 'file-save-as', label: 'Save as New...' },
    { id: 'file-save-template', label: 'Save as Template...' },
    { id: 'file-rename', label: 'Rename...' },
    { id: 'file-refresh', label: 'Refresh' },
    { id: 'divider' },
    { id: 'file-share', label: 'Share...' },
    { id: 'file-send', label: 'Send as Attachment...' },
    { id: 'file-email', label: 'Email Shared Users...' },
    { id: 'file-export', label: 'Export', hasArrow: true },
    { id: 'file-print', label: 'Print...' },
    { id: 'divider' },
    { id: 'file-delete', label: 'Delete...' },
    { id: 'divider' },
    { id: 'file-activity', label: 'View Activity Log...' },
    { id: 'file-properties', label: 'Properties...' },
  ];

  /* ---- Export Items ---- */
  const EXPORT_ITEMS = [
    { id: 'export-smartsheet', label: 'Smartsheet Attachment' },
    { id: 'export-onedrive', label: 'OneDrive & Sharepoint' },
    { id: 'export-google', label: 'Google Drive' },
    { id: 'export-box', label: 'Box' },
    { id: 'divider' },
    { id: 'export-excel', label: 'Export to Microsoft Excel' },
    { id: 'export-pdf', label: 'Export to PDF' },
    { id: 'export-png', label: 'Export Gantt to Image (PNG)' },
    { id: 'export-msproject', label: 'Export to Microsoft Project' },
  ];

  /* ---- Import Items ---- */
  const IMPORT_ITEMS = [
    { id: 'import-csv', label: 'Import CSV' },
    { id: 'import-excel', label: 'Import from Excel' },
  ];

  /* ========== BUILD MENU ========== */
  function buildMenu() {
    // Create main dropdown
    menuEl = document.createElement('div');
    menuEl.className = 'file-dropdown';
    menuEl.id = 'fileDropdown';
    
    // Build items
    FILE_MENU_ITEMS.forEach(item => {
      if (item.id === 'divider') {
        const div = document.createElement('div');
        div.className = 'menu-divider';
        menuEl.appendChild(div);
      } else {
        const btn = document.createElement('button');
        btn.className = 'menu-item' + (item.disabled ? ' is-disabled' : '');
        btn.dataset.menuId = item.id;
        
        let html = `<span class="menu-label">${item.label}</span>`;
        if (item.hasArrow) html += `<span class="menu-arrow">▶</span>`;
        if (item.shortcut) html += `<span class="menu-shortcut">${item.shortcut}</span>`;
        
        btn.innerHTML = html;
        
        if (!item.disabled) {
          btn.addEventListener('click', handleMenuClick);
          btn.addEventListener('mouseenter', () => { focusIndex = getMenuItemIndex(btn); });
        }
        
        menuEl.appendChild(btn);
      }
    });
    
    // Create export submenu
    const exportMenu = createSubmenu('export', EXPORT_ITEMS);
    
    // Create import submenu
    const importMenu = createSubmenu('import', IMPORT_ITEMS);
    
    // Insert after file button
    fileBtn = document.querySelector('.sheet-menu-link');
    if (fileBtn) {
      // Append to body for proper positioning
      document.body.appendChild(menuEl);
      document.body.appendChild(exportMenu);
      document.body.appendChild(importMenu);
      
      // Add click listener
      fileBtn.addEventListener('click', toggleMenu);
      fileBtn.style.cursor = 'pointer';
    }
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.file-dropdown') && !e.target.closest('.sheet-menu-link')) {
        closeAllMenus();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!fileMenuOpen) return;
      
      if (e.key === 'Escape') {
        closeAllMenus();
        fileBtn?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateMenu(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateMenu(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        activateCurrentItem();
      }
    });
  }

  function createSubmenu(type, items) {
    const submenu = document.createElement('div');
    submenu.className = `file-submenu file-submenu-${type}`;
    submenu.id = `${type}Submenu`;
    
    items.forEach(item => {
      if (item.id === 'divider') {
        const div = document.createElement('div');
        div.className = 'menu-divider';
        submenu.appendChild(div);
      } else {
        const btn = document.createElement('button');
        btn.className = 'menu-item';
        btn.dataset.menuId = item.id;
        btn.textContent = item.label;
        btn.addEventListener('click', handleSubmenuClick);
        submenu.appendChild(btn);
      }
    });
    
    return submenu;
  }

  function getMenuItemIndex(btn) {
    const items = menuEl?.querySelectorAll('.menu-item') || [];
    return Array.from(items).indexOf(btn);
  }

  function navigateMenu(dir) {
    const items = menuEl?.querySelectorAll('.menu-item:not(.is-disabled)') || [];
    if (items.length === 0) return;
    
    focusIndex = Math.max(0, Math.min(items.length - 1, focusIndex + dir));
    items[focusIndex]?.focus();
  }

  function activateCurrentItem() {
    const items = menuEl?.querySelectorAll('.menu-item:not(.is-disabled)') || [];
    items[focusIndex]?.click();
  }

  /* ========== TOGGLE ========== */
  function toggleMenu(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (fileMenuOpen) {
      closeAllMenus();
    } else {
      openFileMenu();
    }
  }

  function openFileMenu() {
    closeAllMenus();
    fileMenuOpen = true;
    menuEl.classList.add('is-open');
    fileBtn.classList.add('is-active');
    
    // Position menu directly below button
    const rect = fileBtn.getBoundingClientRect();
    menuEl.style.position = 'fixed';
    menuEl.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    menuEl.style.left = (rect.left + window.scrollX) + 'px';
    menuEl.style.zIndex = '10000';
    
    // Focus first item
    focusIndex = 0;
    const firstItem = menuEl.querySelector('.menu-item');
    setTimeout(() => firstItem?.focus(), 50);
  }

  function closeAllMenus() {
    fileMenuOpen = false;
    exportSubmenuOpen = false;
    importSubmenuOpen = false;
    
    menuEl?.classList.remove('is-open');
    fileBtn?.classList.remove('is-active');
    
    document.querySelectorAll('.file-submenu').forEach(el => {
      el.classList.remove('is-open');
    });
  }

  /* ========== HANDLERS ========== */
  function handleMenuClick(e) {
    const id = e.currentTarget.dataset.menuId;
    
    if (id === 'file-export') {
      toggleExportSubmenu(e.currentTarget);
    } else if (id === 'file-import') {
      toggleImportSubmenu(e.currentTarget);
    } else if (id === 'file-print') {
      window.print();
      closeAllMenus();
    } else if (id === 'file-refresh') {
      location.reload();
    } else if (id === 'file-new') {
      showToast('Create New - Coming soon');
      closeAllMenus();
    } else if (id === 'file-save') {
      showToast('Save - Coming soon');
      closeAllMenus();
    } else if (id === 'file-save-as') {
      showToast('Save as New - Coming soon');
      closeAllMenus();
    } else if (id === 'file-save-template') {
      showToast('Save as Template - Coming soon');
      closeAllMenus();
    } else if (id === 'file-rename') {
      showToast('Rename - Coming soon');
      closeAllMenus();
    } else if (id === 'file-share') {
      showToast('Share - Coming soon');
      closeAllMenus();
    } else if (id === 'file-send') {
      showToast('Send as Attachment - Coming soon');
      closeAllMenus();
    } else if (id === 'file-email') {
      showToast('Email Shared Users - Coming soon');
      closeAllMenus();
    } else if (id === 'file-delete') {
      showToast('Delete - Coming soon');
      closeAllMenus();
    } else if (id === 'file-activity') {
      showToast('Activity Log - Coming soon');
      closeAllMenus();
    } else if (id === 'file-properties') {
      showToast('Properties - Coming soon');
      closeAllMenus();
    } else if (id === 'file-open') {
      showToast('Open - Coming soon');
      closeAllMenus();
    }
  }

  function handleSubmenuClick(e) {
    const id = e.currentTarget.dataset.menuId;
    
    if (id.startsWith('export-')) {
      if (id === 'export-excel') {
        showToast('Export to Excel - Coming soon');
      } else if (id === 'export-pdf') {
        showToast('Export to PDF - Coming soon');
      } else if (id === 'export-png') {
        showToast('Export to PNG - Coming soon');
      } else {
        showToast(id + ' - Coming soon');
      }
    } else if (id.startsWith('import-')) {
      if (id === 'import-csv') {
        showToast('Import CSV - Coming soon');
      } else if (id === 'import-excel') {
        showToast('Import Excel - Coming soon');
      } else {
        showToast(id + ' - Coming soon');
      }
    }
    
    closeAllMenus();
  }

  function toggleExportSubmenu(anchor) {
    const submenu = document.getElementById('exportSubmenu');
    if (!submenu) return;
    
    if (exportSubmenuOpen) {
      submenu.classList.remove('is-open');
      exportSubmenuOpen = false;
    } else {
      // Close import if open
      document.getElementById('importSubmenu')?.classList.remove('is-open');
      importSubmenuOpen = false;
      
      // Position relative to the anchor (Export menu item)
      const anchorRect = anchor.getBoundingClientRect();
      
      submenu.style.position = 'fixed';
      submenu.style.top = anchorRect.top + 'px';
      submenu.style.left = (anchorRect.right + 4) + 'px';
      submenu.style.zIndex = '10001';
      submenu.classList.add('is-open');
      exportSubmenuOpen = true;
    }
  }

  function toggleImportSubmenu(anchor) {
    const submenu = document.getElementById('importSubmenu');
    if (!submenu) return;
    
    if (importSubmenuOpen) {
      submenu.classList.remove('is-open');
      importSubmenuOpen = false;
    } else {
      // Close export if open
      document.getElementById('exportSubmenu')?.classList.remove('is-open');
      exportSubmenuOpen = false;
      
      // Position relative to the anchor (Import menu item)
      const anchorRect = anchor.getBoundingClientRect();
      
      submenu.style.position = 'fixed';
      submenu.style.top = anchorRect.top + 'px';
      submenu.style.left = (anchorRect.right + 4) + 'px';
      submenu.style.zIndex = '10001';
      submenu.classList.add('is-open');
      importSubmenuOpen = true;
    }
  }

  /* ========== TOAST ========== */
  function showToast(message) {
    let toast = document.getElementById('fmToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'fmToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 99999;
        transition: opacity 0.3s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    
    if (window.fmToastTimer) clearTimeout(window.fmToastTimer);
    window.fmToastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2500);
  }

  /* ========== INIT ========== */
  function init() {
    console.log('[FileMenu] Initializing...');
    
    // Wait for file button to exist
    const checkInterval = setInterval(() => {
      const btn = document.querySelector('.sheet-menu-link');
      if (btn) {
        clearInterval(checkInterval);
        buildMenu();
        console.log('[FileMenu] Ready!');
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
