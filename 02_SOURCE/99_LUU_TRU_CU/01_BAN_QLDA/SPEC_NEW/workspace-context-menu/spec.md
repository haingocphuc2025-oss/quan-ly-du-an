# SPEC: Workspace Context Menu + Tao Sheet Moi

**Ngay:** 09/07/2026
**Nguoi viet:** Ban QLDA (Claude)
**Trang thai:** Chua duyet
**Base:** v23_baseline.html
**Output:** v24_quan.html (gop voi attachment-panel-ui)

---

## 1. MUC TIEU

### 1.1 Van de hien tai
- Click vao Sheet trong workspace: khong mo duoc
- Khong co nut "+ Tao Sheet moi" trong workspace
- Khong co context menu (chuot phai) tren Sheet/Folder

### 1.2 Ket qua can dat
- Click doi Sheet → mo sheet do
- Nut "+ Tao" → tao Sheet moi trong du an
- Chuot phai (hoac click "...") → context menu voi cac thao tac

---

## 2. MO TA CHI TIET

### 2.1 Mo Sheet khi click

```
User click vao ten Sheet trong sidebar
    ↓
Mo Sheet do trong vung chinh (phai)
    ↓
Highlight item dang active trong sidebar
    ↓
Hien thi du lieu cua Sheet do
```

```javascript
// Gan su kien click vao sidebar item
document.querySelectorAll('.sidebar-item[data-type="sheet"]').forEach(item => {
  item.addEventListener('click', () => {
    const sheetId = item.dataset.sheetId;
    openSheet(sheetId);
    // Danh dau active
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});
```

### 2.2 Nut "+ Tao" trong workspace

Hien thi thanh cong cu phia tren workspace, co nut:

```html
<div class="workspace-toolbar">
  <button class="ws-btn" id="btnActions">Actions ▼</button>
  <button class="ws-btn ws-btn-icon" id="btnDeleteItem" title="Xoa">🗑</button>
  <button class="ws-btn ws-btn-primary" id="btnCreate">+ Tao</button>
  <button class="ws-btn ws-btn-share" id="btnShare">Chia se</button>
</div>
```

Click "+ Tao" → dropdown chon loai:

```html
<div class="create-dropdown" id="createDropdown">
  <div class="create-option" onclick="createNewSheet()">
    [sheet-SVG] Sheet moi
    <span class="create-desc">Bang du lieu cho nhom ho so</span>
  </div>
  <div class="create-option" onclick="createNewFolder()">
    [folder-SVG] Thu muc moi
    <span class="create-desc">Nhom cac sheet lai voi nhau</span>
  </div>
  <div class="create-option" onclick="createNewReport()">
    [report-SVG] Bao cao moi
    <span class="create-desc">Tong hop tu nhieu sheet</span>
  </div>
</div>
```

### 2.3 Context Menu (chuot phai hoac click "...")

Hien thi khi:
- Chuot phai vao bat ky item nao trong sidebar
- Click icon "⋮" o cuoi moi item

```
┌────────────────────────────────┐
│ Sheet: Ten sheet               │  ← Header
├────────────────────────────────┤
│ O  Mo                          │
│    Mo trong tab moi            │
├────────────────────────────────┤
│ S  Chia se...                  │
│ A  Doi ten...                  │
├────────────────────────────────┤
│ D  Nhan ban                    │
│ N  Luu thanh moi...            │
├────────────────────────────────┤
│ Del  Xoa...         (do)       │
├────────────────────────────────┤
│ X  Xuat Excel                  │
│ PDF Xuat PDF...                │
└────────────────────────────────┘
```

---

## 3. API & BACKEND (google.script.run)

```javascript
// Tao Sheet moi
function createNewSheet(projectId, sheetName) {
  google.script.run
    .withSuccessHandler(result => {
      addSheetToSidebar(result);
      openSheet(result.sheetId);
    })
    .withFailureHandler(err => showToast('Loi: ' + err))
    .createSheet({ projectId, name: sheetName || 'New Sheet' });
}

// Doi ten item
function renameItem(itemId, newName) {
  google.script.run
    .withSuccessHandler(() => refreshSidebar())
    .renameItem({ id: itemId, name: newName });
}

// Nhan ban Sheet
function duplicateSheet(sheetId) {
  google.script.run
    .withSuccessHandler(result => {
      addSheetToSidebar(result);
      showToast('Da nhan ban: ' + result.name);
    })
    .duplicateSheet({ sheetId });
}

// Xoa item
function deleteItem(itemId, type) {
  if (!confirm('Ban chac chan muon xoa?')) return;
  google.script.run
    .withSuccessHandler(() => {
      removeSidebarItem(itemId);
      showToast('Da xoa');
    })
    .deleteItem({ id: itemId, type });
}

// Xuat Excel
function exportToExcel(sheetId) {
  google.script.run
    .withSuccessHandler(url => window.open(url, '_blank'))
    .exportSheetToExcel({ sheetId });
}
```

---

## 4. GIAO DIEN

### 4.1 Context menu CSS

```css
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #D1CFCE;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,.14);
  min-width: 220px;
  z-index: 500;
  padding: 4px 0;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
}

.ctx-header {
  padding: 8px 12px 6px;
  font-weight: 600;
  font-size: 12px;
  color: #605E5C;
  border-bottom: 1px solid #F3F2F1;
}

.ctx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  cursor: pointer;
  color: #201F1E;
}
.ctx-item:hover { background: #F3F2F1; }
.ctx-item.danger { color: #D83B01; }
.ctx-item .ctx-key {
  width: 16px;
  font-size: 11px;
  color: #A19F9D;
  flex-shrink: 0;
}

.ctx-sep { height: 1px; background: #F3F2F1; margin: 4px 0; }
```

### 4.2 Item "..." button

```html
<!-- Trong moi sidebar-item, them nut "..." -->
<div class="sidebar-item" data-item-id="${id}" data-type="${type}">
  <span class="sidebar-icon">${getItemIconSVG(type, 20)}</span>
  <div class="sidebar-item-info">
    <div class="sidebar-item-name">${name}</div>
    <div class="sidebar-item-meta">${subName} · 1 sheet</div>
  </div>
  <button class="sidebar-more-btn" onclick="showContextMenu(event, '${id}', '${type}', '${name}')">⋮</button>
</div>
```

```css
.sidebar-more-btn {
  display: none;
  width: 24px; height: 24px;
  border: none; background: none;
  border-radius: 3px; cursor: pointer;
  font-size: 14px; color: #605E5C;
  flex-shrink: 0;
}
.sidebar-item:hover .sidebar-more-btn { display: flex; align-items: center; justify-content: center; }
.sidebar-more-btn:hover { background: #EDEBE9; }
```

### 4.3 Doi ten inline

```javascript
function startRename(itemId, currentName) {
  const nameEl = document.querySelector(`.sidebar-item[data-item-id="${itemId}"] .sidebar-item-name`);
  nameEl.contentEditable = 'true';
  nameEl.focus();
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(nameEl);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  nameEl.addEventListener('blur', () => {
    nameEl.contentEditable = 'false';
    renameItem(itemId, nameEl.textContent.trim());
  }, { once: true });

  nameEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
    if (e.key === 'Escape') { nameEl.textContent = currentName; nameEl.blur(); }
  }, { once: true });
}
```

---

## 5. TEST CASES

| # | Test | Ky vong |
|---|------|---------|
| 1 | Click ten Sheet trong sidebar | Mo sheet, highlight item |
| 2 | Click "+ Tao" | Dropdown hien: Sheet / Thu muc / Bao cao |
| 3 | Chon "Sheet moi" | Them vao sidebar, tu dong mo, focus vao ten de doi |
| 4 | Chuot phai vao Sheet | Context menu hien dung vi tri |
| 5 | Context menu: "Mo" | Mo sheet trong vung chinh |
| 6 | Context menu: "Doi ten" | Cho phep sua ten inline |
| 7 | Context menu: "Nhan ban" | Tao ban copy, them vao sidebar |
| 8 | Context menu: "Xoa" | Confirm dialog → xoa → bien khoi sidebar |
| 9 | Context menu: "Xuat Excel" | Tai file .xlsx ve may |
| 10 | Click ngoai context menu | Menu tu dong dong lai |

---

## 6. BAN GIAO

- ✅ Base: `VERSIONS/v23_baseline.html`
- ✅ Sua ham render sidebar: them nut "...", click de mo sheet
- ✅ Them nut "+ Tao" + dropdown trong workspace toolbar
- ✅ Context menu: hien dung vi tri con tro, dong khi click ngoai
- ✅ Apps Script: them cac ham createSheet, renameItem, duplicateSheet, deleteItem, exportSheetToExcel
- ✅ Deploy lai Apps Script neu Code.gs thay doi
- ✅ Nop CODE_DIFF.md du 4 muc
- ✅ Test het 10 test cases truoc khi nop
