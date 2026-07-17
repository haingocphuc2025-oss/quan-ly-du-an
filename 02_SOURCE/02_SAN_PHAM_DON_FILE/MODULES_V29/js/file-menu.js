/* ========== FILE MENU - V28 ========== */
(function () {
  'use strict';

  if (window.__fileMenuInitialized) return;
  window.__fileMenuInitialized = true;

  var menuOpen = false;
  var exportOpen = false;
  var importOpen = false;
  var menuEl = null;
  var fileButton = null;
  var focusIndex = -1;
  var importInput = null;

  var FILE_MENU_ITEMS = [
    { id: 'file-new', label: 'Create New...' },
    { id: 'file-import', label: 'Import', arrow: true },
    { id: 'file-open', label: 'Open...', shortcut: 'Ctrl + O' },
    { divider: true },
    { id: 'file-save', label: 'Save', shortcut: 'Ctrl + S' },
    { id: 'file-save-as', label: 'Save as New...' },
    { id: 'file-save-template', label: 'Save as Template...' },
    { id: 'file-rename', label: 'Rename...' },
    { id: 'file-refresh', label: 'Refresh' },
    { divider: true },
    { id: 'file-share', label: 'Share...' },
    { id: 'file-send', label: 'Send as Attachment...' },
    { id: 'file-email', label: 'Email Shared Users...' },
    { id: 'file-export', label: 'Export', arrow: true },
    { id: 'file-print', label: 'Print...' },
    { divider: true },
    { id: 'file-delete', label: 'Delete...' },
    { divider: true },
    { id: 'file-activity', label: 'View Activity Log...' },
    { id: 'file-properties', label: 'Properties...' }
  ];

  var EXPORT_ITEMS = [
    { id: 'export-smartsheet', label: 'Smartsheet Attachment' },
    { id: 'export-onedrive', label: 'OneDrive & SharePoint' },
    { id: 'export-google', label: 'Google Drive' },
    { id: 'export-box', label: 'Box' },
    { divider: true },
    { id: 'export-excel', label: 'Export to Microsoft Excel' },
    { id: 'export-pdf', label: 'Export to PDF' },
    { id: 'export-png', label: 'Export Gantt to Image (PNG)' },
    { id: 'export-msproject', label: 'Export to Microsoft Project' }
  ];

  var IMPORT_ITEMS = [
    { id: 'import-csv', label: 'Import CSV' },
    { id: 'import-excel', label: 'Import from Excel' }
  ];

  function activeContext() {
    try {
      if (typeof activeSheetContext !== 'undefined' && activeSheetContext) return activeSheetContext;
    } catch (ignore) {}
    return { projectIndex: typeof activeProjectIndex === 'number' ? activeProjectIndex : 0, folderIndex: null };
  }

  function activeItem() {
    var ctx = activeContext();
    try {
      if (ctx.folderIndex !== null && PROJECT_FOLDERS[ctx.projectIndex]) {
        return PROJECT_FOLDERS[ctx.projectIndex][ctx.folderIndex] || null;
      }
    } catch (ignore) {}
    return null;
  }

  function projectItems(projectIndex) {
    try { return PROJECT_FOLDERS[projectIndex] || []; } catch (ignore) { return []; }
  }

  function htmlEscape(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value == null ? '' : value));
    var box = document.createElement('div');
    box.textContent = String(value == null ? '' : value);
    return box.innerHTML;
  }

  function toast(message, kind) {
    var el = document.getElementById('fmToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fmToast';
      el.className = 'fm-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.dataset.kind = kind || 'info';
    el.classList.add('is-visible');
    clearTimeout(window.__fmToastTimer);
    window.__fmToastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2800);
  }

  function persistProject() {
    try { if (typeof flushCurrentUiEditsBeforeSave === 'function') flushCurrentUiEditsBeforeSave(); } catch (ignore) {}
    try { if (typeof forceFlushAllPendingSaves === 'function') forceFlushAllPendingSaves(); } catch (ignore) {}
    try { if (typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently(); } catch (ignore) {}
    try { if (typeof persistToDrive === 'function') persistToDrive(); } catch (ignore) {}
  }

  function logActivity(item, action, detail) {
    if (!item) return;
    if (!Array.isArray(item._activityLog)) item._activityLog = [];
    item._activityLog.unshift({
      action: action,
      detail: detail || '',
      at: new Date().toLocaleString('vi-VN'),
      user: window.APP_USER_NAME || 'Local user'
    });
    item._activityLog = item._activityLog.slice(0, 100);
  }

  function refreshWorkspace() {
    try { if (typeof render === 'function') render(); } catch (ignore) {}
    try { if (typeof renderFolderRows === 'function') renderFolderRows(); } catch (ignore) {}
    try { if (typeof refreshActiveWorkspaceTitle === 'function') refreshActiveWorkspaceTitle(); } catch (ignore) {}
  }

  function closeFileMenu() {
    menuOpen = false;
    exportOpen = false;
    importOpen = false;
    if (menuEl) menuEl.classList.remove('is-open');
    if (fileButton) fileButton.classList.remove('is-active');
    document.querySelectorAll('.file-submenu').forEach(function (el) { el.classList.remove('is-open'); });
    MenuPositioning.unregister('file-menu-root');
    MenuPositioning.unregister('file-menu-submenu');
  }

  function modal(title, body, setup, actions) {
    if (typeof showV19Modal === 'function') {
      var overlay = showV19Modal(title, body, actions || []);
      if (setup) setup(overlay);
      return overlay;
    }
    var overlayFallback = document.createElement('div');
    overlayFallback.className = 'fm-modal-overlay';
    overlayFallback.innerHTML = '<div class="fm-modal"><button class="fm-modal-close" type="button" aria-label="Close">x</button><h2>' + htmlEscape(title) + '</h2><div class="fm-modal-body">' + body + '</div></div>';
    document.body.appendChild(overlayFallback);
    overlayFallback.querySelector('.fm-modal-close').addEventListener('click', function () { overlayFallback.remove(); });
    overlayFallback.addEventListener('click', function (event) { if (event.target === overlayFallback) overlayFallback.remove(); });
    if (setup) setup(overlayFallback);
    return overlayFallback;
  }

  function closeModal(overlay) { if (overlay && overlay.remove) overlay.remove(); }

  function showCreateModal() {
    var body = '<div class="fm-create-grid">' +
      [['grid', 'Grid'], ['report', 'Report'], ['dashboard', 'Dashboard / Portal'], ['folder', 'Folder'], ['workspace', 'Workspace']].map(function (pair) {
        return '<button type="button" class="fm-choice" data-fm-create="' + pair[0] + '">' + pair[1] + '</button>';
      }).join('') + '</div>';
    var overlay = modal('Create New', body, function (root) {
      root.querySelectorAll('[data-fm-create]').forEach(function (button) {
        button.addEventListener('click', function () {
          var type = button.dataset.fmCreate;
          closeModal(overlay);
          createNewItem(type);
        });
      });
    });
  }

  function createNewItem(type) {
    var ctx = activeContext();
    var projectIndex = ctx.projectIndex;
    if (projectIndex === null || !projectItems(projectIndex)) {
      toast('Chua chon du an', 'error');
      return;
    }
    var labels = { grid: ['New Sheet', 'Grid'], report: ['New Report', 'Report'], dashboard: ['New Dashboard', 'Dashboard'], folder: ['New Folder', 'Folder'], workspace: ['New Workspace', 'Workspace'] };
    var spec = labels[type] || labels.grid;
    if (typeof createWorkspaceItem === 'function') {
      createWorkspaceItem(projectIndex, type, spec[0], spec[1]);
      return;
    }
    var name = window.prompt('Name Your ' + spec[1] + ':', spec[0]);
    if (!name) return;
    var item = typeof buildWorkspaceItem === 'function' ? buildWorkspaceItem(type, name) : { name: name, label: name, type: type };
    projectItems(projectIndex).push(item);
    persistProject();
    refreshWorkspace();
    toast(spec[1] + ' created');
  }

  function showOpenModal() {
    var ctx = activeContext();
    var rows = projectItems(ctx.projectIndex).map(function (item, index) {
      return '<button type="button" class="fm-open-row" data-fm-open="' + index + '"><span>' + htmlEscape(item.name || item.label || 'Untitled') + '</span><small>' + htmlEscape(item.type || 'sheet') + '</small></button>';
    }).join('');
    var body = '<div class="fm-open-list">' + (rows || '<p class="fm-muted">No files in this project.</p>') + '</div>';
    var overlay = modal('Open', body, function (root) {
      root.querySelectorAll('[data-fm-open]').forEach(function (button) {
        button.addEventListener('click', function () {
          var index = Number(button.dataset.fmOpen);
          var item = projectItems(ctx.projectIndex)[index];
          closeModal(overlay);
          if (!item) return;
          if (item.type === 'report' && typeof openReport === 'function') openReport(ctx.projectIndex, index);
          else if (item.type === 'dashboard' && typeof openDashboard === 'function') openDashboard(ctx.projectIndex, index);
          else if (typeof openSheet === 'function') openSheet(ctx.projectIndex, index);
        });
      });
    });
  }

  function saveCurrent() {
    var item = activeItem();
    persistProject();
    logActivity(item, 'Saved');
    persistProject();
    toast('Saved');
  }

  function saveAsNew() {
    var item = activeItem();
    var ctx = activeContext();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var name = window.prompt('Save as New:', (item.name || 'Untitled') + ' - copy');
    if (!name || !name.trim()) return;
    var copy = typeof cloneWorkspaceItem === 'function' ? cloneWorkspaceItem(item) : JSON.parse(JSON.stringify(item));
    copy.name = name.trim();
    copy.label = copy.name;
    copy.updated = new Date().toLocaleDateString('vi-VN');
    logActivity(copy, 'Created', 'Saved as new file');
    projectItems(ctx.projectIndex).splice(Number(ctx.folderIndex) + 1, 0, copy);
    persistProject();
    refreshWorkspace();
    var newIndex = Number(ctx.folderIndex) + 1;
    if (typeof openSheet === 'function' && copy.type !== 'report' && copy.type !== 'dashboard') openSheet(ctx.projectIndex, newIndex);
    else if (copy.type === 'report' && typeof openReport === 'function') openReport(ctx.projectIndex, newIndex);
    else if (copy.type === 'dashboard' && typeof openDashboard === 'function') openDashboard(ctx.projectIndex, newIndex);
    toast('Saved as ' + copy.name);
  }

  function saveAsTemplate() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var name = window.prompt('Template name:', (item.name || 'Untitled') + ' template');
    if (!name || !name.trim()) return;
    var templates;
    try { templates = JSON.parse(localStorage.getItem('fileTemplatesV28') || '[]'); } catch (ignore) { templates = []; }
    templates.push({ name: name.trim(), saved: new Date().toISOString(), item: typeof cloneWorkspaceItem === 'function' ? cloneWorkspaceItem(item) : JSON.parse(JSON.stringify(item)) });
    localStorage.setItem('fileTemplatesV28', JSON.stringify(templates));
    logActivity(item, 'Saved as template', name.trim());
    persistProject();
    toast('Template saved');
  }

  function renameCurrent() {
    var item = activeItem();
    var ctx = activeContext();
    if (!item) { toast('Chua mo file', 'error'); return; }
    if (typeof renameWorkspaceItem === 'function') {
      renameWorkspaceItem(ctx.projectIndex, ctx.folderIndex);
      logActivity(item, 'Renamed');
      persistProject();
      return;
    }
    var name = window.prompt('Rename:', item.name || 'Untitled');
    if (!name || !name.trim()) return;
    item.name = item.label = name.trim();
    item.updated = new Date().toLocaleDateString('vi-VN');
    logActivity(item, 'Renamed', item.name);
    persistProject();
    refreshWorkspace();
    toast('Renamed');
  }

  function shareCurrent() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var link = location.href.split('#')[0] + '#file=' + encodeURIComponent(item.name || 'Untitled');
    var body = '<p>Link xem file hien tai:</p><input class="fm-input" id="fmShareLink" readonly value="' + htmlEscape(link) + '"><div class="fm-modal-actions"><button type="button" class="fm-primary" id="fmCopyLink">Copy link</button></div>';
    var overlay = modal('Share', body, function (root) {
      var input = root.querySelector('#fmShareLink');
      root.querySelector('#fmCopyLink').addEventListener('click', function () {
        var done = function () { toast('Link copied'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done).catch(function () { input.select(); document.execCommand('copy'); done(); });
        else { input.select(); document.execCommand('copy'); done(); }
      });
    });
    logActivity(item, 'Shared link');
    persistProject();
  }

  function sendAttachment() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    if (item.type === 'grid' || !item.type) {
      if (typeof exportSheetToExcel === 'function') exportSheetToExcel(item);
    } else {
      downloadBlob(JSON.stringify(item, null, 2), (item.name || 'file') + '.json', 'application/json');
    }
    logActivity(item, 'Sent as attachment');
    persistProject();
    toast('Attachment downloaded');
  }

  function emailUsers() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var body = '<label class="fm-label" for="fmEmail">Email nguoi nhan</label><input class="fm-input" id="fmEmail" placeholder="name@example.com"><label class="fm-label" for="fmEmailMessage">Message</label><textarea class="fm-textarea" id="fmEmailMessage" rows="4" placeholder="Message"></textarea><div class="fm-modal-actions"><button type="button" class="fm-primary" id="fmSendEmail">Send</button></div>';
    var overlay = modal('Email Shared Users', body, function (root) {
      root.querySelector('#fmSendEmail').addEventListener('click', function () {
        var email = root.querySelector('#fmEmail').value.trim();
        if (!email) { toast('Nhap email nguoi nhan', 'error'); return; }
        if (!Array.isArray(item._emailDrafts)) item._emailDrafts = [];
        item._emailDrafts.unshift({ email: email, message: root.querySelector('#fmEmailMessage').value, at: new Date().toLocaleString('vi-VN') });
        logActivity(item, 'Email shared users', email);
        persistProject();
        closeModal(overlay);
        toast('Email draft saved locally');
      });
    });
  }

  function deleteCurrent() {
    var item = activeItem();
    var ctx = activeContext();
    if (!item) { toast('Chua mo file', 'error'); return; }
    if (!window.confirm('Delete "' + (item.name || 'Untitled') + '"?')) return;
    var items = projectItems(ctx.projectIndex);
    items.splice(Number(ctx.folderIndex), 1);
    persistProject();
    closeCurrentView();
    refreshWorkspace();
    toast('Deleted');
  }

  function closeCurrentView() {
    try {
      if (typeof showFolderListView === 'function') {
        showFolderListView();
        return;
      }
    } catch (ignore) {}
    try { if (typeof closeAttachmentPanel === 'function') closeAttachmentPanel(); } catch (ignore) {}
    try { activeSheetContext = null; } catch (ignore) {}
    try { if (typeof hideWorkspaceBrowsePage === 'function') hideWorkspaceBrowsePage(); } catch (ignore) {}
    ['sheet-open', 'sheet-nav-collapsed'].forEach(function (name) {
      var main = document.querySelector('main');
      var shell = document.querySelector('.app-shell');
      if (main) main.classList.remove(name);
      if (shell) shell.classList.remove(name);
    });
    var detail = document.getElementById('detailBody');
    var grid = document.getElementById('gridSheetView');
    var report = document.getElementById('reportView');
    if (detail) detail.style.display = 'flex';
    if (grid) grid.style.display = 'none';
    if (report) report.style.display = 'none';
  }

  function showActivity() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var entries = Array.isArray(item._activityLog) ? item._activityLog : [];
    var body = entries.length ? '<div class="fm-activity-list">' + entries.map(function (entry) {
      return '<div class="fm-activity-row"><strong>' + htmlEscape(entry.action) + '</strong><span>' + htmlEscape(entry.at) + ' - ' + htmlEscape(entry.user || '') + '</span><small>' + htmlEscape(entry.detail || '') + '</small></div>';
    }).join('') + '</div>' : '<p class="fm-muted">No activity recorded yet.</p>';
    modal('Activity Log', body);
  }

  function showProperties() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var cells = Array.isArray(item.cells) ? item.cells : [];
    var columns = cells.reduce(function (max, row) { return Math.max(max, Array.isArray(row) ? row.length : 0); }, 0);
    var bytes = 0;
    try { bytes = JSON.stringify(item).length; } catch (ignore) {}
    var body = '<dl class="fm-properties"><dt>Name</dt><dd>' + htmlEscape(item.name || '') + '</dd><dt>Type</dt><dd>' + htmlEscape(item.type || 'grid') + '</dd><dt>Last update</dt><dd>' + htmlEscape(item.updated || '') + '</dd><dt>Rows</dt><dd>' + cells.length + '</dd><dt>Columns</dt><dd>' + columns + '</dd><dt>Local size</dt><dd>' + bytes.toLocaleString('en-US') + ' bytes</dd></dl>';
    modal('Properties', body);
  }

  function downloadBlob(data, name, type) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function exportExcel() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    if (item.type === 'grid' || !item.type) {
      if (typeof exportSheetToExcel === 'function') exportSheetToExcel(item);
      else toast('Excel export unavailable', 'error');
    } else {
      var table = document.querySelector('#reportGridWrap table, #gridSheetView table');
      if (window.XLSX && table) {
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(table), 'Data');
        XLSX.writeFile(wb, (item.name || 'Report') + '.xlsx');
      } else downloadBlob(JSON.stringify(item, null, 2), (item.name || 'Report') + '.json', 'application/json');
    }
    logActivity(item, 'Exported', 'Microsoft Excel');
    persistProject();
    toast('Excel export started');
  }

  function exportPDF() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    logActivity(item, 'Exported', 'PDF');
    persistProject();
    window.print();
  }

  function exportPNG() {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var cells = Array.isArray(item.cells) ? item.cells : [];
    var rows = cells.slice(0, 40);
    var cols = rows.reduce(function (max, row) { return Math.max(max, Array.isArray(row) ? row.length : 0); }, 0);
    var width = Math.max(640, Math.min(2200, cols * 150));
    var height = Math.max(160, rows.length * 28 + 70);
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(item.name || 'Sheet', 20, 30);
    ctx.font = '12px Arial';
    rows.forEach(function (row, r) {
      var values = Array.isArray(row) ? row : [];
      values.forEach(function (value, c) {
        var x = c * 150;
        var y = r * 28 + 48;
        ctx.strokeStyle = '#d1d5db';
        ctx.strokeRect(x, y, 150, 28);
        ctx.fillStyle = '#111827';
        ctx.fillText(String(value == null ? '' : value).slice(0, 23), x + 6, y + 18);
      });
    });
    canvas.toBlob(function (blob) { downloadBlob(blob, (item.name || 'Sheet') + '.png', 'image/png'); });
    logActivity(item, 'Exported', 'PNG');
    persistProject();
    toast('PNG export started');
  }

  function handleExternalExport(id) {
    var item = activeItem();
    if (!item) { toast('Chua mo file', 'error'); return; }
    var names = { 'export-smartsheet': 'Smartsheet Attachment', 'export-onedrive': 'OneDrive & SharePoint', 'export-google': 'Google Drive', 'export-box': 'Box', 'export-msproject': 'Microsoft Project' };
    if (id === 'export-smartsheet') sendAttachment();
    else {
      downloadBlob(JSON.stringify(item, null, 2), (item.name || 'file') + '-' + id + '.json', 'application/json');
      logActivity(item, 'Exported', names[id] || id);
      persistProject();
      toast((names[id] || id) + ' export prepared locally');
    }
  }

  function openImportPicker(kind) {
    if (!importInput) {
      importInput = document.createElement('input');
      importInput.type = 'file';
      importInput.accept = kind === 'csv' ? '.csv,text/csv' : '.xlsx,.xls,.csv';
      importInput.style.display = 'none';
      document.body.appendChild(importInput);
      importInput.addEventListener('change', function () {
        var file = importInput.files && importInput.files[0];
        if (file) readImportFile(file, importInput.dataset.importKind || 'csv');
        importInput.value = '';
      });
    }
    importInput.dataset.importKind = kind;
    importInput.accept = kind === 'csv' ? '.csv,text/csv' : '.xlsx,.xls,.csv';
    importInput.click();
  }

  function parseCSV(text) {
    var first = String(text || '').split(/\r?\n/)[0] || '';
    var delimiter = (first.split(';').length > first.split(',').length) ? ';' : ',';
    var rows = [];
    var row = [];
    var cell = '';
    var quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '"') {
        if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = !quoted;
      } else if (ch === delimiter && !quoted) { row.push(cell); cell = ''; }
      else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (values) { return values.some(function (value) { return String(value).trim() !== ''; }); });
  }

  function readImportFile(file, kind) {
    if (kind === 'excel' && /\.(xlsx|xls)$/i.test(file.name) && !window.XLSX) {
      toast('Excel library is unavailable. Try CSV or reconnect to the internet.', 'error');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var rows;
        if (kind === 'excel' && window.XLSX && /\.(xlsx|xls)$/i.test(file.name)) {
          var workbook = XLSX.read(reader.result, { type: 'array' });
          var sheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
        } else rows = parseCSV(String(reader.result || ''));
        showImportPreview(rows, file.name);
      } catch (error) { toast('Import failed: ' + error.message, 'error'); }
    };
    if (kind === 'excel' && /\.(xlsx|xls)$/i.test(file.name)) reader.readAsArrayBuffer(file);
    else reader.readAsText(file, 'utf-8');
  }

  function showImportPreview(rows, fileName) {
    var preview = rows.slice(0, 8).map(function (row) {
      return '<tr>' + row.slice(0, 10).map(function (value) { return '<td>' + htmlEscape(value) + '</td>'; }).join('') + '</tr>';
    }).join('');
    var body = '<p>File: <strong>' + htmlEscape(fileName) + '</strong> (' + rows.length + ' rows)</p><label class="fm-label" for="fmImportMode">Import mode</label><select class="fm-input" id="fmImportMode"><option value="append">Append</option><option value="replace">Replace</option></select><div class="fm-import-preview"><table><tbody>' + preview + '</tbody></table></div><div class="fm-modal-actions"><button type="button" class="fm-primary" id="fmApplyImport">Import</button></div>';
    var overlay = modal('Import Preview', body, function (root) {
      root.querySelector('#fmApplyImport').addEventListener('click', function () {
        applyImportedRows(rows, root.querySelector('#fmImportMode').value);
        closeModal(overlay);
      });
    });
  }

  function applyImportedRows(rows, mode) {
    var item = activeItem();
    if (!item || (item.type && item.type !== 'grid')) { toast('Import chi ap dung cho Grid Sheet', 'error'); return; }
    var cleanRows = rows.map(function (row) { return Array.isArray(row) ? row.slice() : [row]; });
    if (mode === 'replace') item.cells = cleanRows;
    else {
      var target = typeof ensureSheetCells === 'function' ? ensureSheetCells(item) : (item.cells || (item.cells = []));
      var incoming = cleanRows;
      if (target.length && incoming.length && JSON.stringify(target[0]) === JSON.stringify(incoming[0])) incoming = incoming.slice(1);
      incoming.forEach(function (row) { target.push(row); });
    }
    logActivity(item, 'Imported data', mode);
    try { if (typeof scheduleSheetDataSave === 'function') scheduleSheetDataSave(item); } catch (ignore) {}
    persistProject();
    try { if (typeof renderGridSheet === 'function') renderGridSheet(); } catch (ignore) {}
    refreshWorkspace();
    toast('Imported ' + cleanRows.length + ' rows');
  }

  function buildMenu() {
    menuEl = document.createElement('div');
    menuEl.className = 'file-dropdown';
    menuEl.id = 'fileDropdown';
    FILE_MENU_ITEMS.forEach(function (item) {
      if (item.divider) {
        var divider = document.createElement('div');
        divider.className = 'menu-divider';
        menuEl.appendChild(divider);
        return;
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-item';
      button.dataset.menuId = item.id;
      button.innerHTML = '<span class="menu-label">' + item.label + '</span>' + (item.arrow ? '<span class="menu-arrow">&#9654;</span>' : '') + (item.shortcut ? '<span class="menu-shortcut">' + item.shortcut + '</span>' : '');
      button.addEventListener('click', handleMenuClick);
      button.addEventListener('mouseenter', function () { focusIndex = getMenuItemIndex(button); });
      menuEl.appendChild(button);
    });
    document.body.appendChild(menuEl);
    document.body.appendChild(buildSubmenu('export', EXPORT_ITEMS));
    document.body.appendChild(buildSubmenu('import', IMPORT_ITEMS));
    fileButton = document.querySelector('.sheet-menu-link');
    if (!fileButton) return;
    fileButton.addEventListener('click', toggleMenu);
    fileButton.style.cursor = 'pointer';
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.file-dropdown') && !event.target.closest('.file-submenu') && !event.target.closest('.sheet-menu-link')) closeFileMenu();
    });
    document.addEventListener('keydown', handleKeyboard);
    menuEl.addEventListener('focusin', function (event) { MenuPositioning.keepFocusedVisible(event.target); });
    document.querySelectorAll('.file-submenu').forEach(function (submenu) {
      submenu.addEventListener('focusin', function (event) { MenuPositioning.keepFocusedVisible(event.target); });
    });
    window.__QLDA_PERF__ = window.__QLDA_PERF__ || {};
    window.__QLDA_PERF__.fileMenuReadyMs = performance.now();
    performance.mark?.('qlda-file-menu-ready');
  }

  function buildSubmenu(type, items) {
    var submenu = document.createElement('div');
    submenu.className = 'file-submenu file-submenu-' + type;
    submenu.id = type + 'Submenu';
    items.forEach(function (item) {
      if (item.divider) {
        var divider = document.createElement('div');
        divider.className = 'menu-divider';
        submenu.appendChild(divider);
        return;
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-item';
      button.dataset.menuId = item.id;
      button.textContent = item.label;
      button.addEventListener('click', handleSubmenuClick);
      submenu.appendChild(button);
    });
    return submenu;
  }

  function getMenuItemIndex(button) { return Array.from(menuEl.querySelectorAll('.menu-item')).indexOf(button); }

  function handleKeyboard(event) {
    if (!menuOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); closeFileMenu(); fileButton?.focus(); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); navigate(event.key === 'ArrowDown' ? 1 : -1); }
    else if (event.key === 'ArrowRight') {
      var items = menuEl.querySelectorAll('.menu-item');
      var active = items[focusIndex];
      var id = active?.dataset.menuId;
      if(id === 'file-import' || id === 'file-export'){
        event.preventDefault();
        toggleSubmenu(id === 'file-import' ? 'import' : 'export', active);
        document.getElementById((id === 'file-import' ? 'import' : 'export') + 'Submenu')?.querySelector('.menu-item')?.focus();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      var items = menuEl.querySelectorAll('.menu-item');
      if (items[focusIndex]) items[focusIndex].click();
    }
  }

  function navigate(direction) {
    var items = menuEl.querySelectorAll('.menu-item');
    if (!items.length) return;
    focusIndex = Math.max(0, Math.min(items.length - 1, focusIndex + direction));
    items[focusIndex].focus();
    MenuPositioning.keepFocusedVisible(items[focusIndex]);
  }

  function toggleMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    if (menuOpen) closeFileMenu();
    else {
      menuOpen = true;
      menuEl.classList.add('is-open');
      fileButton.classList.add('is-active');
      var reposition = function () {
        var rect = fileButton.getBoundingClientRect();
        MenuPositioning.positionRootElement(menuEl, rect.left, rect.bottom + 4, {margin:8});
      };
      reposition();
      MenuPositioning.register('file-menu-root', reposition);
      focusIndex = 0;
      setTimeout(function () { menuEl.querySelector('.menu-item')?.focus(); }, 20);
    }
  }

  function handleMenuClick(event) {
    var id = event.currentTarget.dataset.menuId;
    if (id === 'file-import') return toggleSubmenu('import', event.currentTarget);
    if (id === 'file-export') return toggleSubmenu('export', event.currentTarget);
    closeFileMenu();
    var handlers = {
      'file-new': showCreateModal,
      'file-open': showOpenModal,
      'file-save': saveCurrent,
      'file-save-as': saveAsNew,
      'file-save-template': saveAsTemplate,
      'file-rename': renameCurrent,
      'file-refresh': function () { persistProject(); location.reload(); },
      'file-share': shareCurrent,
      'file-send': sendAttachment,
      'file-email': emailUsers,
      'file-print': exportPDF,
      'file-delete': deleteCurrent,
      'file-activity': showActivity,
      'file-properties': showProperties
    };
    if (handlers[id]) handlers[id]();
  }

  function handleSubmenuClick(event) {
    var id = event.currentTarget.dataset.menuId;
    closeFileMenu();
    if (id === 'import-csv') openImportPicker('csv');
    else if (id === 'import-excel') openImportPicker('excel');
    else if (id === 'export-excel') exportExcel();
    else if (id === 'export-pdf') exportPDF();
    else if (id === 'export-png') exportPNG();
    else handleExternalExport(id);
  }

  function toggleSubmenu(type, anchor) {
    var submenu = document.getElementById(type + 'Submenu');
    if (!submenu) return;
    var isOpen = type === 'export' ? exportOpen : importOpen;
    document.querySelectorAll('.file-submenu').forEach(function (el) { el.classList.remove('is-open'); });
    exportOpen = false;
    importOpen = false;
    if (isOpen) return;
    submenu.classList.add('is-open');
    var reposition = function () {
      MenuPositioning.positionSubmenuElement(submenu, anchor, {margin:8, gap:4});
    };
    reposition();
    MenuPositioning.register('file-menu-submenu', reposition);
    if (type === 'export') exportOpen = true;
    else importOpen = true;
  }

  function init() {
    if (document.querySelector('.sheet-menu-link')) {
      buildMenu();
      return;
    }
    document.addEventListener('DOMContentLoaded', buildMenu, {once:true});
  }

  window.__v28FileMenu = {
    FILE_MENU_ITEMS: FILE_MENU_ITEMS,
    EXPORT_ITEMS: EXPORT_ITEMS,
    IMPORT_ITEMS: IMPORT_ITEMS,
    parseCSV: parseCSV,
    applyImportedRows: applyImportedRows,
    activeItem: activeItem
  };

  init();
}());

