# SPEC: Keyboard Shortcuts — Phím tắt điều hướng & chỉnh sửa

> **TRẠNG THÁI CHÍNH THỨC:** ĐÃ TRIỂN KHAI  
> Vị trí thư mục là nguồn trạng thái chính thức. Các dòng “chưa duyệt”, đường dẫn cũ và baseline cũ bên dưới chỉ là lịch sử tại thời điểm soạn spec. Baseline hiện hành: **v25**.

> **Trạng thái:** 🟢 **Đã duyệt** — Ban QLDA ký duyệt 07/07/2026
> **Version:** v1.0
> **Ngày tạo:** 2026-07-07
> **Ngày duyệt:** 2026-07-07
> **Người viết:** Phuc (Tư vấn thiết kế)
> **Dự án:** QLDA — Sprint 2 v19 (Feature: Keyboard Shortcuts)
> **Phụ thuộc:** Copy/Cut/Paste Multiple Cells/Rows (SPEC_NEW/copy-cut-paste/) — undo stack cần cho Ctrl+Z/Y

---

## 0. Tóm tắt thay đổi (Summary)

| Mục | Nội dung |
|-----|----------|
| **Vấn đề** | Baseline v18 (5580 dòng) **CHƯA CÓ** bất kỳ phím tắt nào cho thao tác chính: di chuyển ô (Arrow), copy/cut/paste (Ctrl+C/X/V), undo/redo (Ctrl+Z/Y), tìm kiếm (Ctrl+F), điều hướng Tab/Enter/Escape. |
| **Giải pháp** | Thêm **1 global keydown handler** + **1 cell-level keydown handler** để triển khai toàn bộ phím tắt Smartsheet/Excel tiêu chuẩn. |
| **Phạm vi** | Chỉ sửa file `03_NHA_THAU_THI_CONG/FRONTEND/giao-dien-desktop-don-gian_v18_baseline.html` (baseline v18). Không đụng Apps Script backend. |
| **Baseline** | v18 — chỉ có 2 keydown handlers hiện tại: `Escape` đóng Favorites (dòng 1543-1545), `Enter/Escape` trong report cell (dòng 3458-3461). |
| **Target** | v19+ (sau khi duyệt SPEC này). |

---

## 1. Bối cảnh & Vấn đề (Context & Problem)

### 1.1 Hiện trạng baseline v18

| Phím tắt | Baseline v18 | Kết quả |
|-----------|-------------|---------|
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | ❌ Không có | Không thể di chuyển ô mềm mại |
| `Enter` | ❌ Chỉ có trong Report cell (dòng 3459) | Chuyển cell xuống? Chưa có |
| `Tab` / `Shift+Tab` | ❌ Không có | Không thể điều hướng cột |
| `Escape` | ✅ Có (dòng 1544: đóng Favorites) + dòng 3460: huỷ edit report cell | Thiếu cancel editing trong sheet |
| `F2` | ❌ Không có | Không thể enter edit mode |
| `F4` / `Ctrl+Y` | ❌ Không có | Không thể redo |
| `Ctrl+Z` / `Ctrl+Y` | ❌ Không có | Không thể undo/redo |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | ❌ Không có | Copy/cut/paste chỉ bằng context menu |
| `Ctrl+A` | ❌ Không có | Không thể chọn tất cả cells |
| `Ctrl+F` | ❌ Không có | Không thể focus search |
| `Ctrl+B` / `Ctrl+I` / `Ctrl+U` | ❌ Không có | Chỉ dùng toolbar nút |
| `Delete` / `Backspace` | ❌ Không có | Xoá cell content |
| `Home` / `End` | ❌ Không có | Về đầu/cuối dòng |

### 1.2 Keydown handlers hiện có

**Global (dòng 1543):**
```javascript
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeFavorites();
});
```

**Report cell (dòng 3458-3461):**
```javascript
cell.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){ e.preventDefault(); cell.blur(); }
  else if(e.key === 'Escape'){ e.preventDefault(); cell.textContent = cell.dataset.originalValue || ''; cell.blur(); }
});
```

### 1.3 Functions có sẵn để tái dùng

| Function | Dòng | Mục đích | Dùng cho shortcut |
|----------|------|----------|-------------------|
| `moveActiveSheetCell(rowStep, colStep)` | 2958-2964 | Di chuyển ô active | Arrow keys |
| `setActiveSheetCell(rowIndex, colIndex, shouldFocus)` | 2932-2957 | Set & focus ô | Enter, Tab, Home, End |
| `startEditingCell(cell, initialChar)` | 2988-2999 | Bắt đầu edit mode | F2, type character |
| `commitEditingCell(cell)` | 3002-3015 | Lưu & thoát edit | Enter, Tab |
| `cancelEditingCell(cell)` | 3018-3028 | Huỷ edit | Escape |
| `getActiveSheet()` | 2091-2095 | Sheet hiện tại | Global shortcuts |
| `sheetGridWrap.querySelector('.sheet-cell.active-cell')` | 2959 | Ô active hiện tại | Arrow, Enter, Tab |
| `formulaInput` | 1570 | Formula bar focus | Navigate |

---

## 2. Yêu cầu chức năng (Functional Requirements)

### 2.1 Navigation (Điều hướng)

| ID | Phím tắt | Mô tả | Mức độ | Ghi chú |
|----|----------|-------|--------|---------|
| **KS-01** | `ArrowUp` | Di chuyển ô active lên 1 dòng | **P0 (Must)** | Gọi `moveActiveSheetCell(-1, 0)` |
| **KS-02** | `ArrowDown` | Di chuyển ô active xuống 1 dòng | **P0 (Must)** | Gọi `moveActiveSheetCell(1, 0)` |
| **KS-03** | `ArrowLeft` | Di chuyển ô active sang trái 1 cột | **P0 (Must)** | Gọi `moveActiveSheetCell(0, -1)` |
| **KS-04** | `ArrowRight` | Di chuyển ô active sang phải 1 cột | **P0 (Must)** | Gọi `moveActiveSheetCell(0, 1)` |
| **KS-05** | `Tab` | Next cell (sang phải), nếu cuối hàng → xuống hàng mới | **P0 (Must)** | Như Excel: commit edit + advance |
| **KS-06** | `Shift+Tab` | Previous cell (sang trái) | **P0 (Must)** | Như Excel |
| **KS-07** | `Enter` | Commit edit & di chuyển xuống dòng dưới | **P0 (Must)** | Như Excel |
| **KS-08** | `Shift+Enter` | Commit edit & di chuyển lên dòng trên | **P1 (Should)** | |
| **KS-09** | `Home` | Về ô đầu tiên của hàng hiện tại | **P1 (Should)** | Cột 1 (chỉ số) |
| **KS-10** | `End` | Về ô cuối cùng của hàng hiện tại | **P1 (Should)** | Cột cuối (visible) |
| **KS-11** | `Ctrl+Home` | Về ô A1 (0, 0) | **P1 (Should)** | |
| **KS-12** | `Ctrl+End` | Về ô cuối cùng của sheet | **P1 (Should)** | row=last, col=last |

### 2.2 Cell Editing (Chỉnh sửa ô)

| ID | Phím tắt | Mô tả | Mức độ | Ghi chú |
|----|----------|-------|--------|---------|
| **KS-13** | `F2` | Enter edit mode trên ô active | **P0 (Must)** | Gọi `startEditingCell(activeCell)` |
| **KS-14** | `Escape` | Cancel editing (khi đang edit); nếu không edit → đóng popover/modal | **P0 (Must)** | Gọi `cancelEditingCell()` hoặc đóng popover |
| **KS-15** | `Delete` / `Backspace` | Xoá nội dung ô active (khi không edit) | **P0 (Must)** | Set value = '' |
| **KS-16** | Any printable char | Bắt đầu edit với ký tự vừa gõ (giống Excel) | **P0 (Must)** | Gọi `startEditingCell(cell, char)` |
| **KS-17** | `Ctrl+Enter` | Fill same value vào tất cả ô đang chọn | **P2 (Nice)** | Cần multi-select range |
| **KS-18** | `Alt+Enter` | Xuống dòng trong 1 ô (newline) | **P2 (Nice)** | Contenteditable `<br>` |

### 2.3 Clipboard (Sao chép)

| ID | Phím tắt | Mô tả | Mức độ | Ghi chú |
|----|----------|-------|--------|---------|
| **KS-19** | `Ctrl+C` | Copy ô/hàng đang chọn | **P0 (Must)** | Đồng bộ với Copy/Cut/Paste SPEC |
| **KS-20** | `Ctrl+X` | Cut ô/hàng đang chọn | **P0 (Must)** | Đồng bộ với Copy/Cut/Paste SPEC |
| **KS-21** | `Ctrl+V` | Paste từ clipboard (cả trong-app & external) | **P0 (Must)** | Đồng bộ với Copy/Cut/Paste SPEC |

### 2.4 Undo/Redo

| ID | Phím tắt | Mô tả | Mức độ | Ghi chú |
|----|----------|-------|--------|---------|
| **KS-22** | `Ctrl+Z` | Undo thao tác cuối | **P1 (Should)** | Cần Undo/Redo stack (SPEC riêng) |
| **KS-23** | `Ctrl+Y` | Redo thao tác đã undo | **P1 (Should)** | Cần Undo/Redo stack (SPEC riêng) |

### 2.5 Selection & Navigation toàn cục

| ID | Phím tắt | Mô tả | Mức độ | Ghi chú |
|----|----------|-------|--------|---------|
| **KS-24** | `Ctrl+A` | Chọn tất cả cells (hoặc toàn bộ sheet) | **P1 (Should)** | |
| **KS-25** | `Ctrl+F` | Focus vào search input (`ssSearchInput`) | **P1 (Should)** | |
| **KS-26** | `Ctrl+B` | Toggle bold trên ô active | **P1 (Should)** | Gọi `toggleCellStyleFlag(sheet, 'bold')` |
| **KS-27** | `Ctrl+I` | Toggle italic trên ô active | **P1 (Should)** | |
| **KS-28** | `Ctrl+U` | Toggle underline trên ô active | **P1 (Should)** | |
| **KS-29** | `PageUp` / `PageDown` | Cuộn lên/xuống 1 trang | **P2 (Nice)** | |
| **KS-30** | `Alt+ArrowLeft/Right` | Back/Forward navigation (navBack/navForward) | **P2 (Nice)** | Giống browser history |

### 2.6 Row operations (Thao tác dòng)

| ID | Phím tắt | Mô tả | Mức độ | Ghi chú |
|----|----------|-------|--------|---------|
| **KS-31** | `Ctrl+Shift+=` | Thêm dòng mới (phía dưới) | **P2 (Nice)** | |
| **KS-32** | `Ctrl+Shift+-` | Xoá dòng đang chọn | **P2 (Nice)** | |
| **KS-33** | `Ctrl+Shift+Right` | Thụt dòng vào (indent) | **P2 (Nice)** | `indentRow()` |
| **KS-34** | `Ctrl+Shift+Left` | Thụt dòng ra (outdent) | **P2 (Nice)** | `outdentRow()` |

---

## 3. Yêu cầu phi chức năng (Non-Functional Requirements)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| **NFR-01** | **Responsive** | Shortcut không có độ trễ (callback < 2ms) |
| **NFR-02** | **Không conflict** | Không chặn phím tắt trình duyệt mặc định (Ctrl+R, Ctrl+W, Ctrl+T, Ctrl+N) |
| **NFR-03** | **Không override** | Nếu input/textarea/contenteditable được focus, ưu tiên phím tắt native của nó |
| **NFR-04** | **Modular** | Tất cả shortcuts gom trong 1 IIFE `installKeyboardShortcuts()`, dễ maintain |
| **NFR-05** | **Accessible** | Có `event.preventDefault()` đúng chỗ, không chặn screen reader |
| **NFR-06** | **Backward compatible** | Không phá vỡ các keydown handler hiện có (Escape, Enter) |

---

## 4. Kiến trúc & Thiết kế (Design)

### 4.1 Shortcut Controller Architecture

```javascript
(function installKeyboardShortcuts() {
  const SHEET_TAG = '.grid-sheet-table';
  const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']);

  /** Check if an editable element is focused */
  function isEditingInSheet() {
    const cell = sheetGridWrap.querySelector('.sheet-cell.editing-cell');
    return !!cell;
  }

  function isNativeInputFocused() {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    return EDITABLE_TAGS.has(el.tagName) || el.isContentEditable;
  }

  /** Main keydown router */
  function handleKeyDown(e) {
    // Phase 1: Always-active global shortcuts
    switch (e.key) {
      case 'Escape':   handleEscape(e); return;
      case 'F2':       handleF2(e); return;
      case 'Delete':
      case 'Backspace': handleDelete(e); return;
    }

    // Phase 2: Shortcuts when a native input is focused (let browser handle)
    if (isNativeInputFocused()) return;

    // Phase 3: Sheet-only shortcuts (Arrow, Tab, Enter, Home, End)
    const activeCell = sheetGridWrap.querySelector('.sheet-cell.active-cell');
    if (!activeCell) return;

    const isEditing = isEditingInSheet();

    // Navigation when NOT editing
    if (!isEditing) {
      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); moveActiveSheetCell(-1, 0); return;
        case 'ArrowDown':  e.preventDefault(); moveActiveSheetCell(1, 0); return;
        case 'ArrowLeft':  e.preventDefault(); moveActiveSheetCell(0, -1); return;
        case 'ArrowRight': e.preventDefault(); moveActiveSheetCell(0, 1); return;
        case 'Tab':        e.preventDefault(); handleTab(e); return;
        case 'Enter':      e.preventDefault(); handleEnter(e); return;
        case 'Home':       e.preventDefault(); handleHome(e); return;
        case 'End':        e.preventDefault(); handleEnd(e); return;
      }

      // If a printable char is typed → start editing
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        startEditingCell(activeCell, e.key);
        return;
      }
    }
  }

  function handleCtrlShortcut(e) {
    if (!e.ctrlKey && !e.metaKey) return;
    // These work even if editing
    switch (e.key.toLowerCase()) {
      case 'c': handleCopy(e); return;
      case 'x': handleCut(e); return;
      case 'v': handlePaste(e); return;
      case 'z': handleUndo(e); return;  // Ctrl+Z
      case 'y': handleRedo(e); return;  // Ctrl+Y (or Ctrl+Shift+Z)
      case 'a': handleSelectAll(e); return;
      case 'f': e.preventDefault(); ssSearchInput.focus(); ssSearchInput.select(); return;
      case 'b': e.preventDefault(); handleBold(e); return;
      case 'i': e.preventDefault(); handleItalic(e); return;
      case 'u': e.preventDefault(); handleUnderline(e); return;
    }
    // Alt+Arrow for nav
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); navBack(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); navForward(); return; }
    }
  }

  // Register
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', handleCtrlShortcut);
})();
```

### 4.2 Handler Functions Detail

| Handler | Logic |
|---------|-------|
| `handleEscape(e)` | Nếu đang edit → `cancelEditingCell(activeCell)`. Nếu có popover/modal đang mở → close. Nếu Favorites → `closeFavorites()`. |
| `handleF2(e)` | `e.preventDefault()`. Nếu không edit → `startEditingCell(activeCell)`. |
| `handleDelete(e)` | Nếu không edit → set cell value = '', gọi `scheduleSheetDataSave(getActiveSheet())`. |
| `handleTab(e)` | Commit current edit (nếu đang edit). `e.shiftKey` → di chuyển trái, else → phải. Nếu cuối hàng → xuống hàng mới + cột đầu. |
| `handleEnter(e)` | Commit current edit (nếu đang edit). `e.shiftKey` → lên, else → xuống. |
| `handleHome(e)` | `e.shiftKey` → cột 0; `e.ctrlKey` → row=0, col=0. |
| `handleEnd(e)` | `e.shiftKey` → cột cuối visible; `e.ctrlKey` → row cuối, col cuối. |
| `handleCopy(e)` | Gọi `copySelectionToClipboard()` (từ SPEC Copy/Cut/Paste) |
| `handleCut(e)` | Gọi `cutSelectionToClipboard()` |
| `handlePaste(e)` | Gọi `pasteFromClipboard()` |
| `handleUndo(e)` | Gọi `undoStack.undo()` (cần SPEC Undo/Redo) |
| `handleRedo(e)` | Gọi `undoStack.redo()` (cần SPEC Undo/Redo) |
| `handleSelectAll(e)` | Chọn tất cả cells từ (1,2) đến (lastRow, lastCol) |
| `handleBold(e)` | `toggleCellStyleFlag(getActiveSheet(), 'bold')` |
| `handleItalic(e)` | `toggleCellStyleFlag(getActiveSheet(), 'italic')` |
| `handleUnderline(e)` | `toggleCellStyleFlag(getActiveSheet(), 'underline')` |

### 4.3 Vị trí chèn code

**Vị trí:** Sau function `updateNavButtons()` (dòng ~3248), trước `showFolderListView()` (dòng 3252).

```javascript
// ===== KEYBOARD SHORTCUTS — thêm v19 =====
(function installKeyboardShortcuts() {
  // ... (code ở trên)
})();
```

### 4.4 Logic ưu tiên keyboard shortcut

```
User presses key
        │
        ▼
Native input (INPUT/TEXTAREA/SELECT) focused?
  YES → Let browser handle (except Ctrl+Z/Y/C/V)
  NO  → Sheet active?
         YES → Dispatch to Arrow / Tab / Enter / Home / End / F2 / Delete / printable char
         NO  → Global shortcuts only (Ctrl+F, Ctrl+A, Alt+Arrow)
```

---

## 5. Kịch bản test (Test Scenarios)

| ID | Scenario | Steps | Expected | Priority |
|----|----------|-------|----------|----------|
| **TC-01** | **Arrow down 3 rows** | 1. Mở sheet<br>2. Bấm ArrowDown 3 lần | Ô active di chuyển từ A2 → A5 | **P0** |
| **TC-02** | **Arrow right + Tab** | 1. A2 active<br>2. Bấm ArrowRight 3 lần<br>3. Bấm Tab | Đến C2 → D2 | **P0** |
| **TC-03** | **Enter commit + down** | 1. Edit ô B3 (gõ "Test")<br>2. Bấm Enter | B3 = "Test", active → B4 | **P0** |
| **TC-04** | **Escape cancel edit** | 1. Edit ô C5<br>2. Bấm Escape | C5 trở về giá trị cũ, thoát edit | **P0** |
| **TC-05** | **F2 enter edit mode** | 1. Chọn ô D7 (không edit)<br>2. Bấm F2 | D7 vào edit mode, cursor cuối | **P0** |
| **TC-06** | **Delete clears cell** | 1. Chọn ô E9 (có giá trị "ABC")<br>2. Bấm Delete | E9 rỗng | **P0** |
| **TC-07** | **Printable char starts edit** | 1. Chọn ô F11<br>2. Gõ "Hello" | F11 vào edit mode, text = "Hello" | **P0** |
| **TC-08** | **Ctrl+F focuses search** | 1. Bấm Ctrl+F | Search input được focus | **P1** |
| **TC-09** | **Ctrl+B toggles bold** | 1. Chọn ô G13<br>2. Bấm Ctrl+B | G13 bold (kiểm tra style) | **P1** |
| **TC-10** | **Home/End navigation** | 1. Active ô ở giữa sheet<br>2. Bấm Home → End | Đến cột đầu → cột cuối | **P1** |
| **TC-11** | **Tab wrap to next row** | 1. Active ô cuối cùng của hàng 2<br>2. Bấm Tab | Commit, active → cột 2 hàng 3 | **P1** |
| **TC-12** | **Printable char typed when editing** | 1. Đang edit ô H15<br>2. Gõ "X" | "X" được chèn vào text, không start edit mới | **P1** |
| **TC-13** | **Ctrl+Arrow for nav** | 1. Focus ở browser address bar<br>2. Bấm Ctrl+Arrow | Không bị chặn, browser xử lý | **P2** |
| **TC-14** | **Ctrl+B / I / U** | 1. Chọn ô J17<br>2. Ctrl+B, Ctrl+I, Ctrl+U | Cả bold + italic + underline | **P1** |
| **TC-15** | **Printable char không chặn input** | 1. Focus vào search input<br>2. Gõ "keyword" | Search hoạt động bình thường | **P1** |

---

## 6. Rủi ro & Mitigation (Risks & Mitigations)

| Rủi ro | Xác suất | Tác động | Mitigation |
|--------|----------|----------|------------|
| Conflict với browser shortcuts (Ctrl+T, Ctrl+W, Ctrl+R) | Trung bình | Mất chức năng browser | Chỉ override Ctrl+C/X/V/Z/Y/A/F/B/I/U. Bỏ qua Ctrl+T/W/R/N. |
| Keyboard shortcut kích hoạt khi đang gõ trong input/textarea | Cao | Gõ sai | Check `isNativeInputFocused()` → bỏ qua |
| Arrow key di chuyển selection khi đang edit | Cao | Mất vị trí cursor | Arrow chỉ hoạt động khi không edit |
| Enter trong cell bị xử lý sai vs Enter submit form | Thấp | Submit form | `e.preventDefault()` + không có form submit trong sheet |
| Screen reader bị chặn | Thấp | Accessibility | Không dùng `preventDefault` trên Tab/Escape nếu không cần; dùng `role` attributes |

---

## 7. Phụ thuộc (Dependencies)

| SPEC | Phụ thuộc | Lý do |
|------|-----------|-------|
| **Copy/Cut/Paste** (`SPEC_NEW/copy-cut-paste/`) | **Bắt buộc** | Ctrl+C/X/V cần function copy/cut/paste |
| **Undo/Redo Stack** (chưa có SPEC) | **Khuyến nghị** | Ctrl+Z/Y không hoạt động nếu không có undo stack |
| Auto-Save On Exit (đã duyệt) | Không bắt buộc | Không conflict |

**Lưu ý:** Nếu Copy/Cut/Paste chưa code kịp, Ctrl+C/X/V có thể tạm thời log console warning + không làm gì. Undo/Redo có thể defer sang sprint sau.

---

## 8. Checklist triển khai (Implementation Checklist)

| Task | Status | Ghi chú |
|------|--------|---------|
| [ ] Tạo file SPEC này tại `SPEC_NEW/keyboard-shortcuts/spec.md` | ✅ Done | |
| [ ] Review SPEC với PM / Tech Lead | ⏳ Pending | |
| [ ] Duyệt SPEC → move to `SPEC_QL_DA_DUYET/keyboard-shortcuts/spec.md` | ⏳ Pending | |
| [ ] Implement: `installKeyboardShortcuts()` IIFE | ⏳ Pending | Dòng ~3249, sau `updateNavButtons()` |
| [ ] Implement: `handleKeyDown` router (Arrow, Tab, Enter, Esc, F2, Delete, printable) | ⏳ Pending | |
| [ ] Implement: `handleCtrlShortcut` (Ctrl+C/X/V/Z/Y/A/F/B/I/U) | ⏳ Pending | |
| [ ] Implement: `handleTab` with wrap logic (cuối hàng → hàng mới) | ⏳ Pending | |
| [ ] Implement: `handleEnter` with commit logic | ⏳ Pending | |
| [ ] Test manual: TC-01 → TC-07 (P0) | ⏳ Pending | |
| [ ] Test manual: TC-08 → TC-15 (P1/P2) | ⏳ Pending | |
| [ ] Fix bugs nếu có | ⏳ Pending | |
| [ ] Move SPEC to `SPEC_DA_HOAN_THANH/` | ⏳ Pending | |

---

## 9. Phụ lục: File & Dòng code tham chiếu (baseline v18)

| Hàm / Biến | Dòng | Ghi chú |
|------------|------|---------|
| `document.addEventListener('keydown', (e)=>{if(e.key==='Escape') closeFavorites();})` | 1543-1545 | Global Escape hiện tại |
| `cell.addEventListener('keydown', ...)` | 3458-3461 | Report cell Enter/Escape |
| `moveActiveSheetCell(rowStep, colStep)` | 2958-2964 | Arrow navigation |
| `setActiveSheetCell(rowIndex, colIndex, shouldFocus)` | 2932-2957 | Set & focus cell |
| `startEditingCell(cell, initialChar)` | 2988-2999 | Start edit mode |
| `commitEditingCell(cell)` | 3002-3015 | Commit & exit edit |
| `cancelEditingCell(cell)` | 3018-3028 | Cancel edit |
| `sheetGridWrap.querySelector('.sheet-cell.active-cell')` | 2959 | Get active cell DOM |
| `getActiveSheet()` | 2091-2095 | Get sheet object |
| `toggleCellStyleFlag(sheet, flag)` | 1824 | Toggle bold/italic/underline |
| `ssSearchInput` | 1076 (HTML) | Search input element |
| `navBack()` / `navForward()` | 3235-3244 | Nav history back/forward |

---

## 10. Lưu ý triển khai (Dev Notes)

1. **Không dùng `e.which`/`e.keyCode`** — dùng `e.key` thuần (deprecated-free).
2. **`handleReduce()`** — Nếu sheet rỗng (không có rows), Arrow key không crash.
3. **Ctrl+Shift+Z** (redo alternative) — Một số app dùng `Ctrl+Y`, một số dùng `Ctrl+Shift+Z`. Support cả 2.
4. **Edge case: Tab ở ô cuối cùng sheet** — Nếu không còn hàng nào để xuống, thêm hàng mới tự động (mở rộng `ensureSheetCells`).
5. **Edge case: Arrow khi sheet chưa render** — `sheetGridWrap` rỗng → Arrow key bỏ qua im lặng.
6. **Printable char trên dropdown/date cell** — Nếu cell type là `dropdown` hoặc `date`, printable char không start edit (vì dùng picker).
7. **Test trên mobile** — Keyboard shortcuts chỉ dùng cho desktop; mobile dùng touch, không ảnh hưởng.

---

**END OF SPEC v1.0**

> **Next step:** Review & duyệt SPEC → Move to `SPEC_QL_DA_DUYET/keyboard-shortcuts/spec.md` → Assign dev implement.
