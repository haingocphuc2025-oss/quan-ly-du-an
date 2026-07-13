# DEVELOPER.md — Ghi chú nghiên cứu & Artifact (Tư vấn thiết kế)

> **Vai trò:** Lưu trữ artifact, ghi chú research, script tham khảo — **KHÔNG phải SPEC**  
> **File này:** Private notes của Tư vấn thiết kế, không bàn giao Nhà thầu

---

## 1. AUTO-SAVE ON EXIT — Research Notes (07/07/2026)

### 1.1 Baseline Analysis (v18_baseline.html)

**File:** `03_NHA_THAU_THI_CONG/FRONTEND/giao-dien-desktop-don-gian_v18_baseline.html` (5580 lines)

**Key functions related to save:**

| Function | Line | Purpose |
|----------|------|---------|
| `SHEET_FACTORY_WEB_APP_URL` | 1657 | Apps Script Web App endpoint |
| `pendingSheetDataSaveTimers` | 2266 | Timer registry for sheet-level saves |
| `scheduleSheetDataSave(sheet)` | 2267-2275 | Debounce 1.2s → save full sheet to Drive |
| `saveSheetDataToWebApp(sheet)` | 2277-2292 | POST `action: 'savesheet'` to Web App |
| `loadSheetDataFromWebApp(project, sheetName)` | 2295-2316 | GET `action: 'loadsheet'` from Drive |
| `pendingCellSaveTimers` | 2318 | Timer registry for cell-level saves (real Google Sheets) |
| `scheduleCellSave(sheet, row, col, value)` | 2319-2329 | Debounce 0.6s → POST `action: 'setdata'` |
| `getActiveSheet()` | 2091-2095 | Get currently opened sheet object |
| `getActiveProjectName()` | 2257-2261 | Get current project name |
| `callSheetFactoryPost_(action, payload)` | 2236-2247 | POST fetch wrapper (used by savesheet/savefile/deletefile) |
| `serializeSheetAttachments(sheet)` | 1959-1980 | Serialize attachments for JSON |
| `ensureSheetCells(sheet)` | 1778-1784 | Ensure cells array with headers |
| `ensureCellStyles(sheet)` | 1796-1799 | Ensure _cellStyles object |

### 1.2 Current Save Flow

```
User Action (edit cell, format, indent, attachment, sort, filter...)
         │
         ▼
scheduleSheetDataSave(sheet) ──1.2s debounce──▶ saveSheetDataToWebApp(sheet)
         │                                          │
         │                                          ▼
         │                              callSheetFactoryPost_('savesheet', payload)
         │                                          │
         ▼                                          ▼
scheduleCellSave(sheet, r, c, v) ──0.6s debounce──▶ saveCellViaWebApp(spreadsheetId, r, c, v)
                                                                       │
                                                                       ▼
                                                         callSheetFactory_('setdata', {...})
                                                         (JSONP, not POST)
```

### 1.3 Problem: Data Loss on Exit

| Event | Current Behavior | Data Loss? |
|-------|------------------|------------|
| Close tab (✕) | Timers cancelled, no flush | ✅ YES |
| F5 Reload | Timers cancelled, no flush | ✅ YES |
| Switch tab (hidden) | Timers keep running but may not finish | ⚠️ PARTIAL |
| Mobile lock screen | `pagehide` fires, timers cancelled | ✅ YES |
| Mobile home button | `pagehide` + bfcache, timers cancelled | ✅ YES |
| Browser crash | Process killed | ❌ UNAVOIDABLE |

**Root cause:** All saves use `setTimeout` debounce. No `beforeunload` / `visibilitychange` / `pagehide` handlers.

### 1.4 Solution Design

**3 Event Listeners:**

| Event | When Fires | Method | Reliability |
|-------|------------|--------|-------------|
| `beforeunload` | Tab close, reload, navigate away | `navigator.sendBeacon()` | ★★★★★ (best for unload) |
| `visibilitychange` → `hidden` | Tab switch, minimize, split-screen | `fetch(keepalive:true)` | ★★★★☆ |
| `pagehide` | Mobile unload, bfcache entry | `fetch(keepalive:true)` | ★★★★☆ |

**Payload:** Same as `saveSheetDataToWebApp()` — full sheet data (cells, rowMeta, attachments, cellStyles).

**Implementation location:** After `loadSheetDataFromWebApp()` (~line 2316), before `pendingCellSaveTimers`.

### 1.5 Code Refactor Needed

```javascript
// 1. Extract payload builder (NEW)
function buildSheetSavePayload(sheet) { ... }

// 2. Refactor saveSheetDataToWebApp to use builder
function saveSheetDataToWebApp(sheet) {
  const payload = buildSheetSavePayload(sheet);
  if (!payload) return Promise.resolve();
  return callSheetFactoryPost_('savesheet', payload);
}

// 3. IIFE Auto-Save Controller (NEW)
(function installAutoSaveOnExit() { ... })();
```

### 1.6 Backend Compatibility

**Apps Script (`Code.gs`) — NO CHANGES NEEDED:**

- `luuDuLieuSheet(payload)` already handles `action: 'savesheet'`
- Writes to `XayDung-QLDA/<Project>/Du lieu bang/<Sheet>/data.json`
- Idempotent: overwrite same file name
- Timeout: 30s (payload ~5-15KB, well within limits)

### 1.7 Payload Size Estimate

| Component | Est. Size |
|-----------|-----------|
| `cells` (60 rows × 19 cols × ~20 chars) | ~23 KB |
| `rowMeta` (60 rows × 2 fields) | ~2 KB |
| `attachments` (metadata only, no binary) | ~1-5 KB |
| `cellStyles` (sparse, only formatted cells) | ~1-3 KB |
| **Total JSON** | **~30-35 KB** |

✅ Well under `sendBeacon` 64KB limit.

### 1.8 Test Plan (from SPEC)

| Priority | Test Case |
|----------|-----------|
| P0 | TC-01: Edit → Close tab immediately (<500ms) |
| P0 | TC-02: Edit → F5 Reload |
| P0 | TC-03: Edit → Switch tab (hidden) → Return |
| P0 | TC-04: Mobile: Edit → Lock screen → Unlock |
| P1 | TC-05: Multiple rapid edits (5 in 1s) → Close |
| P1 | TC-06: No edits → Close (no spurious request) |
| P1 | TC-07: Hidden → Visible → Edit → Close |
| P2 | TC-08: bfcache restore (mobile Safari) |
| P2 | TC-09: Offline → Edit → Close → Online sync |
| P2 | TC-10: Cell-level save (googleSheetId) flush |

---

## 2. COLUMN TYPE SELECTOR — Smartsheet UI Reference (07/07/2026)

**Nguồn:** Smartsheet Column Settings modal — tài liệu tham khảo chuẩn cho `SPEC_QL_DA_DUYET/column-types/spec.md`

### 2.1 UI Display (Column Settings Modal)

```
+-----------------------------------+
| Column Settings                    |  ← Modal Dialog
|------------------------------------|
| Column Name                        |
| [ Request ID                ]     |
|                                     |
| Column Type                        |
| ┌────────────────────────────────┐  |
| │ Text/Number                   │  |
| │ Dropdown list                 │  |
| │ Date                          │  |
| │ Duration                      │  |  ← Scrollable Selection List
| │ Contact list                  │  |
| │ Checkbox                      │  |
| │ Symbols                       │  |
| │ ...                           │  |
| └────────────────────────────────┘  |
|                                     |
|          Cancel            OK       |
+-----------------------------------+
```

### 2.2 Mapping Smartsheet → Tên chuẩn trong dự án

| Smartsheet UI Label | Tên chuẩn trong SPEC | Type enum value |
|---------------------|---------------------|------------------------|
| `Text/Number` | Text Column | `TEXT` |
| `Dropdown list` | Dropdown Column | `DROPDOWN` |
| `Date` | Date Column | `DATE` |
| `Duration` | Duration Column | `DURATION` |
| `Contact list` | Contact Column | `CONTACT` |
| `Checkbox` | Checkbox Column | `CHECKBOX` |
| `Symbols` | Symbol Column | `SYMBOL` |
| `Auto Number` | Auto Number Col | `AUTO_NUMBER` |
| `Created By` | Created By Col | `CREATED_BY` |
| `Created Date` | Created Date Col | `CREATED_DATE` |
| `Modified By` | Modified By Col | `MODIFIED_BY` |
| `Modified Date` | Modified Date Col | `MODIFIED_DATE` |
| `Currency` (VNĐ) | Currency Column | `CURRENCY` |
| `Percentage` | Percentage Column | `PERCENTAGE` |

### 2.3 Frontend Implementation

Nhà thầu (Quân) cần triển khai **ColumnSettingsModal** gồm:

1. **Column Name input** — text field
2. **Column Type Selector** — scrollable list
3. **Config section** — thay đổi tuỳ theo type đã chọn
4. **OK / Cancel** buttons

### 2.4 Backend Storage

```json
{
  "columnId": "col-xyz",
  "label": "Request ID",
  "type": "TEXT",
  "config": {}
}
```

### 2.5 Reference file
- `99_THU_VIEN/SMARTSHEET/column-types-ui.png` (nếu có)
- SPEC đã duyệt: `SPEC_QL_DA_DUYET/column-types/spec.md`

---

### 2.6 Column Header Dropdown Menu (Compact)

**Nguồn:** Header cell dropdown (▼ menu trên header cột)

```
Dropdown Menu (Column Type ▼
┌────────────────────┐
│ Text/Number        │
│ Dropdown List      │
│ Date               │
│ Checkbox           │
│ Contact            │
└────────────────────┘
```

**Khác với Column Settings Modal:**
| Đặc điểm | Column Settings Modal | Header Dropdown Menu |
|----------|----------------------|---------------------|
| Trigger | Right-click → "Edit Column Properties" | Click ▼ icon |
| Purpose | Full config | Quick type change + sort/filter |
| Fields | Name + Type + Config | Type list only |
| Size | Large modal (400×500px) | Small (200×300px) |

**Implementation hint:** Dropdown dùng chung `COLUMN_TYPE_OPTIONS` với Modal.

```javascript
const COLUMN_TYPE_OPTIONS = [
  { value: 'TEXT', label: 'Text/Number', icon: '📝' },
  { value: 'DROPDOWN', label: 'Dropdown List', icon: '▼' },
  { value: 'DATE', label: 'Date', icon: '📅' },
  { value: 'DURATION', label: 'Duration', icon: '⏱' },
  { value: 'CONTACT', label: 'Contact', icon: '👤' },
  { value: 'CHECKBOX', label: 'Checkbox', icon: '☑' },
  { value: 'SYMBOL', label: 'Symbols', icon: '⭐' },
  { value: 'CURRENCY', label: 'Currency (VNĐ)', icon: '₫' },
  { value: 'PERCENTAGE', label: 'Percentage', icon: '%' },
  { value: 'AUTO_NUMBER', label: 'Auto Number', icon: '#' },
  { value: 'CREATED_BY', label: 'Created By', icon: '👤' },
  { value: 'CREATED_DATE', label: 'Created Date', icon: '📅' },
  { value: 'MODIFIED_BY', label: 'Modified By', icon: '👤' },
  { value: 'MODIFIED_DATE', label: 'Modified Date', icon: '📅' },
];
```

### 2.7 ColumnSettingsDialog — Component Tree

```
ColumnSettingsDialog (Modal Dialog)
│
├── DialogOverlay
│
├── DialogContainer
│   │
│   ├── DialogHeader
│   │      └── Title ("Request ID")
│   │
│   ├── DialogBody
│   │   │
│   │   ├── Form
│   │   │
│   │   ├── FormField (Name)
│   │   │      ├── Label
│   │   │      └── TextInput
│   │   │
│   │   ├── FormField (Column Type)
│   │   │      ├── Label
│   │   │      └── SelectList (scrollable)
│   │   │             ├── ListItem x15
│   │   │             └── Scrollbar
│   │   │
│   │   └── ValidationMessage
│   │
│   ├── DialogFooter
│   │      ├── SecondaryButton (Cancel)
│   │      └── PrimaryButton (OK)
│   │
│   └── CloseButton (optional)
│
└── FocusTrap (a11y)
```

### 2.8 Implementation Hint

| Component | HTML | CSS Class | JS Logic |
|-----------|------|-----------|----------|
| `DialogOverlay` | `<div>` | `.overlay` | click → close |
| `DialogContainer` | `<div>` | `.modal-container` | — |
| `DialogHeader` | `<div>` | `.modal-header` | — |
| `Title` | `<h2>` | `.modal-title` | text = current column name |
| `Form` | `<form>` | `.column-settings-form` | onSubmit → OK |
| `SelectList` | `<ul>` | `.select-list` | max-h:300px, scroll |
| `ListItem` | `<li>` | `.list-item` | click → select + highlight |
| `DialogFooter` | `<div>` | `.modal-footer` | flex: space-between |
| `PrimaryButton` | `<button>` | `.btn-primary` | OK → save config |
| `FocusTrap` | JS | — | Tab loop |

### 2.9 State Management

```javascript
const columnSettingsState = {
  isOpen: false,
  mode: 'edit',          // 'edit' | 'create'
  columnId: null,
  originalName: '',
  currentName: '',
  originalType: 'TEXT',
  currentType: 'TEXT',
  originalConfig: {},
  currentConfig: {},
  isValid: true,
  validationMessage: '',
  onSave: null            // callback khi OK
};
```

### 2.10 Flow

1. User right-click header → "Edit Column Properties" → `openColumnSettings(colId)`
2. Dialog mở, populate state từ `SHEET_COLUMN_CONFIG`
3. User sửa Name / chọn Type → update `currentType`
4. Nếu type có config kèm, show thêm FormField
5. User bấm **OK** → validate → `onSave(...)` → close
6. User bấm **Cancel** / ✕ / overlay → close, không save

---

## 3. KEYBOARD SHORTCUTS — Research Notes (07/07/2026)

**SPEC location:** `SPEC_QL_DA_DUYET/keyboard-shortcuts/spec.md` (ĐÃ DUYỆT v1.0)

### 3.1 Baseline Analysis

Baseline v18 **CHỈ có 2 keydown handlers:**
1. **Global** (dòng 1543-1545): `Escape` → đóng Favorites popover
2. **Report cell** (dòng 3458-3461): `Enter` commit edit, `Escape` cancel edit

**Không có:**
- Arrow navigation (moveActiveSheetCell đã có function nhưng chưa gọi qua keyboard)
- Tab/Enter trong sheet grid (cell editor)
- Ctrl+C/V/X/Z/Y/A/F/B/I/U
- F2 edit mode, Delete clear
- Home/End page navigation
- Printable char → start editing (giống Excel)

### 3.2 Shortcuts Designed in SPEC (34 total)

| Nhóm | Shortcuts | Count | Priority |
|------|-----------|-------|----------|
| Navigation | Arrow keys, Tab/Shift+Tab, Enter/Shift+Enter, Home/End/Ctrl+Home/Ctrl+End | 12 | P0/P1 |
| Cell Editing | F2, Escape, Delete/Backspace, printable char, Ctrl+Enter, Alt+Enter | 6 | P0/P1 |
| Clipboard | Ctrl+C, Ctrl+X, Ctrl+V | 3 | P0 |
| Undo/Redo | Ctrl+Z, Ctrl+Y | 2 | P1 |
| Selection | Ctrl+A | 1 | P1 |
| Global | Ctrl+F, Ctrl+B, Ctrl+I, Ctrl+U | 4 | P1 |
| Page | PageUp, PageDown | 2 | P2 |
| Nav History | Alt+ArrowLeft, Alt+ArrowRight | 2 | P2 |
| Row Ops | Ctrl+Shift+=/-, indent/outdent | 4 | P2 |

### 3.3 Architecture

```javascript
(function installKeyboardShortcuts() {
  // 1. Guards: isEditingInSheet() / isNativeInputFocused()
  // 2. handleKeyDown() — Arrow, Tab, Enter, Esc, F2, Delete, printable
  // 3. handleCtrlShortcut() — Ctrl+C/X/V/Z/Y/A/F/B/I/U, Alt+Arrow
  // 4. Handler functions: handleEscape, handleF2, handleDelete, handleTab, handleEnter
})();
```

Vị trí chèn: sau `updateNavButtons()` (dòng ~3248), trước `showFolderListView()` (dòng 3252).

### 3.4 Key Functions Reused

| Baseline Function | Line | Used By |
|-------------------|------|---------|
| `moveActiveSheetCell(rowStep, colStep)` | 2958 | Arrow keys |
| `setActiveSheetCell(rowIndex, colIndex, shouldFocus)` | 2932 | Enter, Tab, Home, End |
| `startEditingCell(cell, initialChar)` | 2988 | F2, printable char |
| `commitEditingCell(cell)` | 3002 | Enter, Tab |
| `cancelEditingCell(cell)` | 3018 | Escape |
| `toggleCellStyleFlag(sheet, flag)` | 1824 | Ctrl+B/I/U |
| `getActiveSheet()` | 2091 | All sheet shortcuts |

### 3.5 Dependencies

- **Copy/Cut/Paste SPEC** (BẮT BUỘC cho Ctrl+C/X/V) — **ĐÃ DUYỆT** tại `SPEC_QL_DA_DUYET/copy-cut-paste/spec.md`
- **Undo/Redo Stack SPEC** (KHUYẾN NGHỊ cho Ctrl+Z/Y) — chưa viết

---

## 4. COPY/CUT/PASTE — Research Notes (07/07/2026)

**SPEC location:** `SPEC_QL_DA_DUYET/copy-cut-paste/spec.md` (ĐÃ DUYỆT v1.0, 166 dòng, 10 test cases)

### 4.1 Baseline Analysis

Baseline v18 **CHỈ có** Format Painter (copy định dạng) — **KHÔNG CÓ** copy/cut/paste nội dung ô/hàng.

### 4.2 Core Features

| Feature | Description | Keyboard |
|---------|-------------|----------|
| Copy cells | Copy 1 ô hoặc range ô liên tiếp | Ctrl+C |
| Cut cells | Cut range, xóa sau khi paste thành công | Ctrl+X |
| Paste cells | Paste tại ô active, tự mở rộng range | Ctrl+V |
| Paste từ Excel/External | Parse tab-separated/CSV từ clipboard | Ctrl+V |
| Paste nhiều hàng | Auto insert hàng mới nếu vượt sheet | — |
| Cut/Paste hàng toàn phần | Di chuyển hàng (click row header) | Ctrl+X → Ctrl+V |

### 4.3 Architecture

```javascript
// Frontend clipboard handling
async function handlePaste(e) {
  const text = await navigator.clipboard.readText();
  const matrix = parseClipboardMatrix(text); // split \t and \n
  const validated = await validatePasteMatrix(sheet, matrix, targetCol);
  if (validated.valid) {
    await pasteCells(sheetId, targetRow, targetCol, matrix, 'overwrite');
  } else {
    highlightInvalidCells(validated.errors);
  }
}

// Backend Apps Script functions
function pasteCells(sheetId, targetRow, targetCol, matrix, mode) { ... }
function cutRows(sheetId, sourceRow, count) { ... }
function insertRows(sheetId, atRow, count) { ... }
function validatePasteMatrix(sheetId, matrix, startCol) { ... }
```

### 4.4 Key Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `SHEET_COLUMN_CONFIG` | ✅ Ready (v17) | Validate paste theo type |
| Undo/Redo Stack | ❌ Chưa có | Cần implement song song (phase 2) |
| Row insert/delete | ❌ Chưa có | Cần `insertRows`/`deleteRows` backend |
| LockService | ⚠️ Required | Bọc `pasteCells` chống race condition |
| OAuth Deploy | ⚠️ Required | Deploy Web App mới |

### 4.5 Test Cases (10 cases)

| ID | Scenario | Priority |
|----|----------|----------|
| TC-01 | Copy 1 ô → Paste | P0 |
| TC-02 | Copy range 3×3 → Paste | P0 |
| TC-03 | Copy 2 hàng → Paste hàng khác | P0 |
| TC-04 | Cut row → Paste move | P0 |
| TC-05 | Paste từ Excel (tab-separated) | P0 |
| TC-06 | Paste vào Dropdown invalid | P1 |
| TC-07 | Paste vượt hàng → auto append | P1 |
| TC-08 | Paste vào cột read-only | P1 |
| TC-09 | Undo sau Paste (Ctrl+Z) | P1 |
| TC-10 | Cross-sheet copy/paste | P2 |

---

## 5. LINKS & REFERENCES

| Resource | Path / URL |
|----------|------------|
| SPEC Auto-Save On Exit | `./SPEC_QL_DA_DUYET/auto-save-on-exit/spec.md` |
| SPEC Keyboard Shortcuts | `./SPEC_QL_DA_DUYET/keyboard-shortcuts/spec.md` |
| SPEC Copy/Cut/Paste | `./SPEC_QL_DA_DUYET/copy-cut-paste/spec.md` |
| Baseline v18 HTML | `../03_NHA_THAU_THI_CONG/FRONTEND/giao-dien-desktop-don-gian_v18_baseline.html` |
| Apps Script Backend | `G:\My Drive\AutoCAD-Knowledge\Scripts\ql_da_sheet_factory.gs` |
| Smartsheet Save Behavior | `99_THU_VIEN/SMARTSHEET/` |
| Apps Script Patterns | `99_THU_VIEN/APPSSCRIPT/` |

---

## 6. NEXT RESEARCH CANDIDATES (Queue)

Sau khi xong Copy/Cut/Paste, tiếp tục research theo ưu tiên:

1. **Undo/Redo Stack** — Chưa có trong baseline, cần thiết cho Ctrl+Z/Y
2. **Row Hierarchy Drag-Drop** — Kéo thả thụt dòng (indent/outdent visual)
3. **Filter Views (Saved Filters per User)** — Mở rộng `_config.savedFilters`
4. **Column Settings Dialog** — Modal Column Type Selector (đã research UI reference)

---

*Cập nhật: 07/07/2026 — Phuc (Tư vấn thiết kế)*