# SPEC: Repost with Carry-Forward

> **TRẠNG THÁI CHÍNH THỨC:** ĐÃ TRIỂN KHAI  
> Vị trí thư mục là nguồn trạng thái chính thức. Các dòng “chưa duyệt”, đường dẫn cũ và baseline cũ bên dưới chỉ là lịch sử tại thời điểm soạn spec. Baseline hiện hành: **v25**.

**Ngày:** 09/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — lưu tại SPEC_NEW/, chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

**Vấn đề:** Báo cáo định kỳ (tuần/tháng) hiện tại cần 2 bước:
1. 🗑 Clear Data → xóa hết rows → **mất cả cấu trúc** (tên hạng mục, mã số, danh mục...)
2. Gõ lại toàn bộ danh sách hạng mục + ↻ Repost Date

→ Mất thời gian, dễ sót dữ liệu cấu trúc.

**Giải pháp:** Nút **"Repost with Carry-Forward"** — 1 click:
- Giữ nguyên **Structure columns** (text, dropdown, contact) → carry-forward dữ liệu cũ
- Xóa sạch **Data columns** (number, currency, checkbox, symbol)
- Reset **Date columns** về hôm nay
- Giữ nguyên số lượng rows, không xóa gì

**User story:**
> "Cuối tuần tôi cần báo cáo mới. Hạng mục vẫn giữ nguyên, chỉ xóa số liệu cũ và reset ngày. Làm 1 nút thôi."

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Column Classification

Hệ thống tự động phân loại cột dựa trên `type` trong `SHEET_COLUMN_CONFIG`:

| Loại | Column Types | Hành vi | Ví dụ |
|------|-------------|---------|-------|
| **🟢 Structure** (giữ) | `text`, `dropdown` (single), `contact`, `auto-number`, `system` | Giữ nguyên giá trị cũ | "Tên hạng mục", "Mã số", "Đơn vị", "Người phụ trách" |
| **🔴 Data** (xóa) | `number`, `currency`, `checkbox`, `symbol`, `rating` | Xóa → `""` (hoặc `0`/`false` tùy type) | "Khối lượng", "Đơn giá", "Thành tiền", "☑ Hoàn thành" |
| **🟡 Date** (reset) | `date` | Reset → `today` (YYYY-MM-DD) | "Ngày bắt đầu", "Ngày kết thúc", "Ngày báo cáo" |
| **⚪ Formula** | `formula` | Giữ nguyên (tự tính lại) | "=SUM({A},{B})" |
| **🔵 Dropdown Multi** | `dropdown_multi` | Có thể cấu hình: **giữ** (mặc định) hoặc **xóa** | "Tags", "Phân loại" |

### 2.2 User Flow

```
1. User click nút "Repost with Structure" (hoặc từ menu dropdown của nút Repost)
2. Dialog hiện ra:
   ┌──────────────────────────────────────────────┐
   │  📋 Repost with Carry-Forward                │
   │                                               │
   │  Sheet: "01.03 Monthly Report"               │
   │                                               │
   │  Sẽ giữ:    4 cột (Tên, Mã, Đơn vị, CĐầu tư) │
   │  Sẽ xóa:    5 cột (KL, ĐG, TT, TH, %HT)      │
   │  Sẽ reset:  2 cột (Ngày BD, Ngày KT)         │
   │                                               │
   │  ☐ Cho phép cấu hình nâng cao (tùy chọn)     │
   │                                               │
   │         [Hủy]    [Xác nhận & Repost]          │
   └──────────────────────────────────────────────┘
3. Xác nhận → thực thi:
   - Snapshot rows cho Undo
   - Duyệt từng cell: structure giữ, data xóa, date reset
   - Toast: "✅ Đã repost 12 dòng (giữ 4 cột, xóa 5 cột, reset 2 cột)"
4. Sheet re-render → dữ liệu mới
```

### 2.3 So sánh với các nút hiện có

| Nút | Hành vi | Khi nào dùng |
|-----|---------|-------------|
| 🗑 **Clear Data** (có sẵn) | Xóa toàn bộ rows | Muốn sheet trắng hoàn toàn, làm lại từ đầu |
| ↻ **Repost Date** (có sẵn) | Reset date columns | Chỉ cần sửa ngày, giữ nguyên số liệu |
| 🔄 **Repost with Carry-Forward** (mới) | Giữ structure, xóa data, reset date | **Mặc định cho báo cáo định kỳ** |

### 2.4 Cấu hình nâng cao (Advanced Config)

Khi user tick **"Cho phép cấu hình nâng cao"**, dialog mở rộng cho phép:

```
┌──────────────────────────────────────────────────────────┐
│  📋 Repost — Cấu hình nâng cao                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Tên cột              | Kiểu   | Hành vi          │   │
│  │──────────────────────|────────|──────────────────│   │
│  │ Tên hạng mục         | text   | 🔄 Giữ nguyên    │   │
│  │ Mã số                | text   | 🔄 Giữ nguyên    │   │
│  │ Đơn vị               | text   | 🔄 Giữ nguyên    │   │
│  │ Khối lượng           | number | 🗑 Xóa            │   │
│  │ Đơn giá              | number | 🗑 Xóa            │   │
│  │ Thành tiền           | number | 🗑 Xóa            │   │
│  │ Ngày bắt đầu         | date   | 📅 Reset hôm nay  │   │
│  │ Ngày kết thúc        | date   | 📅 Reset hôm nay  │   │
│  │ Trạng thái           | dropdown| 🔄 Giữ nguyên    │   │
│  │ Ghi chú              | text   | 🗑 Xóa            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Phục hồi mặc định]          [Hủy]    [Xác nhận]       │
└──────────────────────────────────────────────────────────┘
```

- Mỗi dòng có thể click toggle hành vi: **Giữ** ↔ **Xóa** ↔ **Reset date**
- Double-click header cột để đổi tên filter
- **"Phục hồi mặc định"** → reset về phân loại tự động (2.1)

### 2.5 Data Model

```javascript
// Config mở rộng trong SHEET_COLUMN_CONFIG
{
  key: "khoi_luong",
  label: "Khối lượng",
  type: "number",
  // Thêm field mới:
  carryForward: false,    // true = giữ, false = xóa/reset
  carryForwardAction: "clear"  // "keep" | "clear" | "reset-today"
}

// Mặc định tự động gán dựa trên type:
const CARRY_FORWARD_DEFAULTS = {
  // Structure — giữ
  text:             { carryForward: true,  action: "keep" },
  dropdown:         { carryForward: true,  action: "keep" },
  dropdown_multi:   { carryForward: true,  action: "keep" },
  contact:          { carryForward: true,  action: "keep" },
  auto_number:      { carryForward: true,  action: "keep" },
  system:           { carryForward: true,  action: "keep" },
  formula:          { carryForward: true,  action: "keep" },
  // Data — xóa
  number:           { carryForward: false, action: "clear" },
  currency:         { carryForward: false, action: "clear" },
  checkbox:         { carryForward: false, action: "clear" },
  symbol:           { carryForward: false, action: "clear" },
  rating:           { carryForward: false, action: "clear" },
  // Date — reset
  date:             { carryForward: false, action: "reset-today" }
};
```

### 2.6 Logic xóa theo type

| Type | Giá trị sau khi xóa |
|------|-------------------|
| `number` / `currency` | `""` (empty string) |
| `checkbox` | `false` |
| `symbol` | `""` (về trạng thái mặc định) |
| `rating` | `0` |
| `date` (reset) | `todayIso` (`YYYY-MM-DD`) |

---

## 3. API & BACKEND (Apps Script)

### 3.1 Hàm mới

| Hàm | Mục đích | Params | Return |
|-----|----------|--------|--------|
| `repostWithCarryForward(sheetId, overrides)` | Repost có carry-forward | `sheetId: string`, `overrides: {columnKey: action}[]` (tùy chọn) | `{success, rowsProcessed, kept, cleared, reset}` |

### 3.2 Logic backend

```javascript
function repostWithCarryForward(sheetId, overrides = {}) {
  const sheet = getSheet(sheetId);
  if (!sheet) return { success: false, error: "Sheet not found" };
  
  const cells = ensureSheetCells(sheet);
  const headers = cells[0] || [];
  
  // Phân loại hành vi cho từng cột
  const colActions = SHEET_COLUMN_CONFIG.map((col, idx) => {
    const defaultAction = CARRY_FORWARD_DEFAULTS[col.type]?.action || "keep";
    const overrideAction = overrides[col.key];
    return {
      index: idx,
      key: col.key,
      label: col.label,
      type: col.type,
      action: overrideAction || defaultAction
    };
  });
  
  // Snapshot cho undo
  sheet._undoSnapshot = {
    cells: JSON.parse(JSON.stringify(cells)),
    timestamp: Date.now(),
    action: 'repost-carry-forward'
  };
  
  const today = new Date().toISOString().split('T')[0];
  let kept = 0, cleared = 0, reset = 0;
  
  // Xử lý từng row (bỏ qua header)
  for (let r = 1; r < cells.length; r++) {
    colActions.forEach(col => {
      switch (col.action) {
        case "keep":
          kept++;
          break; // giữ nguyên
        case "clear":
          cells[r][col.index] = getEmptyValue(col.type);
          cleared++;
          break;
        case "reset-today":
          cells[r][col.index] = today;
          reset++;
          break;
      }
    });
  }
  
  // Nếu sheet trống → tạo 1 row mẫu
  if (cells.length <= 1) {
    const sampleRow = headers.map((h, idx) => {
      const action = colActions[idx]?.action || "keep";
      if (action === "reset-today") return today;
      return "";
    });
    cells.push(sampleRow);
  }
  
  sheet.settings = sheet.settings || {};
  sheet.settings.lastRepostCarryForward = new Date().toLocaleString('vi-VN');
  
  saveData();
  return {
    success: true,
    rowsProcessed: Math.max(0, cells.length - 1),
    kept: kept,
    cleared: cleared,
    reset: reset
  };
}

function getEmptyValue(type) {
  switch (type) {
    case "checkbox": return false;
    case "number":
    case "currency":
    case "symbol":
    case "rating": return "";
    default: return "";
  }
}
```

### 3.3 Hàm hỗ trợ cho frontend

```javascript
// Phân loại cột để hiển thị trong dialog preview
function classifyColumnsForRepost(sheetId) {
  const sheet = getSheet(sheetId);
  if (!sheet) return null;
  
  const cols = SHEET_COLUMN_CONFIG.map((col, idx) => {
    const defaults = CARRY_FORWARD_DEFAULTS[col.type] || { carryForward: true, action: "keep" };
    return {
      key: col.key,
      label: col.label,
      type: col.type,
      defaultAction: defaults.action,
      currentAction: col.carryForwardAction || defaults.action
    };
  });
  
  return {
    sheetName: sheet.name,
    columns: cols,
    summary: {
      keep: cols.filter(c => (c.currentAction || c.defaultAction) === "keep").length,
      clear: cols.filter(c => (c.currentAction || c.defaultAction) === "clear").length,
      reset: cols.filter(c => (c.currentAction || c.defaultAction) === "reset-today").length
    }
  };
}
```

---

## 4. GIAO DIỆN

### 4.1 Toolbar

Sửa nút **↻ Repost Date** thành **dropdown menu**:

```html
<!-- Hiện tại -->
<button class="ss-tool-btn" id="ssRepostDateBtn">↻ Repost</button>

<!-- Mới: nhóm nút -->
<div class="ss-btn-group" id="ssRepostGroup">
  <button class="ss-tool-btn" id="ssRepostMainBtn">↻ Repost</button>
  <button class="ss-tool-btn ss-dropdown-arrow" id="ssRepostDropdownBtn">▼</button>
</div>
```

**Menu dropdown khi click ▼:**

```
┌─────────────────────────────┐
│ ↻ Repost Date (chỉ ngày)    │ ← cũ
│ 🔄 Repost with Structure    │ ← MỚI — mặc định chính
│ 🔧 Cấu hình nâng cao...     │ ← MỞ dialog advanced
├─────────────────────────────┤
│ 🗑 Clear Data               │ ← ref nhanh đến clear
└─────────────────────────────┘
```

**Hoặc giữ nguyên nút cũ, thêm nút mới cạnh nhau:**

```html
<button class="ss-tool-btn" id="ssRepostDateBtn" title="Reset các cột ngày về hôm nay">↻ Repost Date</button>
<button class="ss-tool-btn" id="ssRepostCarryBtn" title="Giữ cấu trúc, xóa số liệu, reset ngày">🔄 Repost Structure</button>
```

→ **Khuyến nghị:** thêm nút mới cạnh nút cũ, không phá vỡ UI hiện tại.

### 4.2 CSS

```css
/* Nút repost carry-forward */
#ssRepostCarryBtn {
  color: #0B8043; /* xanh lá — khác biệt với Repost Date xanh dương #1A73E8 */
}
#ssRepostCarryBtn:hover {
  background: #E6F4EA;
}

/* Advanced config dialog */
.repost-advanced-dialog {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  padding: 24px;
  width: 680px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
}
.repost-advanced-dialog table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}
.repost-advanced-dialog th,
.repost-advanced-dialog td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #E0E0E0;
}
.repost-advanced-dialog .action-toggle {
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #D0D0D0;
  background: #F5F5F5;
  font-size: 12px;
}
.repost-advanced-dialog .action-toggle.keep { background: #E6F4EA; border-color: #0B8043; color: #0B8043; }
.repost-advanced-dialog .action-toggle.clear { background: #FCE8E6; border-color: #D93025; color: #D93025; }
.repost-advanced-dialog .action-toggle.reset { background: #E8F0FE; border-color: #1A73E8; color: #1A73E8; }
```

### 4.3 JS Handlers

```javascript
// === REPOST WITH CARRY-FORWARD ===
document.getElementById('ssRepostCarryBtn').addEventListener('click', () => {
  const sheet = getActiveSheet();
  if (!sheet) return;
  
  // Phân loại cột
  const colClassification = classifyColumnsForRepost(sheet);
  if (!colClassification) return;
  
  const { keep, clear, reset } = colClassification.summary;
  const rowsCount = Math.max(0, (ensureSheetCells(sheet).length - 1));
  
  // Dialog summary
  const msg = `Sheet: "${sheet.name}" (${rowsCount} dòng)\n\n` +
    `🟢 Giữ nguyên: ${keep} cột (tên, mã, đơn vị...)\n` +
    `🔴 Xóa dữ liệu: ${clear} cột (số liệu, checkbox...)\n` +
    `🟡 Reset về hôm nay: ${reset} cột (ngày tháng)\n\n` +
    `Xác nhận repost?`;
  
  if (!confirm(msg)) return;
  
  // Gọi hàm backend
  const result = repostWithCarryForward(sheet.id || sheet._id);
  
  renderGridSheet(sheet);
  scheduleSheetDataSave(sheet);
  
  showToast(`✅ Đã repost ${result.rowsProcessed} dòng ` +
    `(giữ ${result.kept} ô, xóa ${result.cleared} ô, reset ${result.reset} ô)`);
});

// === ADVANCED CONFIG ===
document.getElementById('ssRepostAdvancedBtn').addEventListener('click', openAdvancedRepostDialog);

function openAdvancedRepostDialog() {
  const sheet = getActiveSheet();
  if (!sheet) return;
  
  const cols = classifyColumnsForRepost(sheet).columns;
  
  let html = `<div class="repost-advanced-dialog">
    <h3>🔧 Cấu hình nâng cao — Repost with Carry-Forward</h3>
    <p>Click vào từng cột để đổi hành vi:</p>
    <table>
      <tr><th>Tên cột</th><th>Kiểu</th><th>Hành vi</th></tr>`;
  
  cols.forEach(col => {
    const action = col.currentAction || col.defaultAction;
    const label = action === 'keep' ? '🔄 Giữ nguyên' :
                  action === 'clear' ? '🗑 Xóa' : '📅 Reset hôm nay';
    const cls = action === 'keep' ? 'keep' : action === 'clear' ? 'clear' : 'reset';
    html += `<tr>
      <td>${col.label}</td>
      <td><code>${col.type}</code></td>
      <td><span class="action-toggle ${cls}" data-key="${col.key}" data-action="${action}">${label}</span></td>
    </tr>`;
  });
  
  html += `</table>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn" onclick="resetColumnDefaults()">Phục hồi mặc định</button>
      <button class="btn btn-ghost" onclick="this.closest('.repost-advanced-dialog').remove()">Hủy</button>
      <button class="btn btn-primary" onclick="applyAdvancedRepost()">Xác nhận</button>
    </div>
  </div>`;
  
  // Render dialog
  const div = document.createElement('div');
  div.innerHTML = html;
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);z-index:999;display:flex;align-items:center;justify-content:center';
  div.addEventListener('click', e => { if (e.target === div) div.remove(); });
  document.body.appendChild(div);
}

// Toggle hành vi khi click
document.addEventListener('click', e => {
  const toggle = e.target.closest('.action-toggle');
  if (!toggle) return;
  
  const actions = ['keep', 'clear', 'reset-today'];
  const current = toggle.dataset.action;
  const next = actions[(actions.indexOf(current) + 1) % actions.length];
  
  toggle.dataset.action = next;
  toggle.className = `action-toggle ${next === 'keep' ? 'keep' : next === 'clear' ? 'clear' : 'reset'}`;
  toggle.textContent = next === 'keep' ? '🔄 Giữ nguyên' :
                       next === 'clear' ? '🗑 Xóa' : '📅 Reset hôm nay';
  
  // Lưu override tạm
  if (!window._repostOverrides) window._repostOverrides = {};
  window._repostOverrides[toggle.dataset.key] = next;
});
```

### 4.4 Summary Preview (tùy chọn)

Khi hover vào nút **Repost Structure**, hiển thị tooltip thông minh:

```
🔄 Repost with Carry-Forward
──────────────────────────
Sẽ giữ:    Tên hạng mục, Mã số, Đơn vị
Sẽ xóa:   Khối lượng, Đơn giá, Thành tiền
Sẽ reset: Ngày bắt đầu, Ngày kết thúc
```

Code:
```javascript
ssRepostCarryBtn.title = ''; // bỏ tooltip cũ

ssRepostCarryBtn.addEventListener('mouseenter', () => {
  const sheet = getActiveSheet();
  if (!sheet) return;
  const cols = classifyColumnsForRepost(sheet);
  if (!cols) return;
  
  const keep = cols.columns.filter(c => (c.currentAction || c.defaultAction) === 'keep').map(c => c.label).join(', ');
  const clear = cols.columns.filter(c => (c.currentAction || c.defaultAction) === 'clear').map(c => c.label).join(', ');
  const reset = cols.columns.filter(c => (c.currentAction || c.defaultAction) === 'reset-today').map(c => c.label).join(', ');
  
  const lines = [
    '🔄 Repost with Carry-Forward',
    '──────────────────────────',
    `Sẽ giữ:    ${keep || '(không)'}`,
    `Sẽ xóa:   ${clear || '(không)'}`,
    `Sẽ reset: ${reset || '(không)'}`
  ];
  
  // Tạo tooltip tạm
  // (có thể dùng title attribute hoặc custom tooltip div)
  ssRepostCarryBtn.dataset.tooltip = lines.join('\n');
});
```

---

## 5. TEST CASES

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | **Repost basic** | Click "Repost Structure" → Confirm OK | Text columns giữ nguyên, number columns = "", date columns = hôm nay |
| 2 | **Sheet trống** | Sheet 0 rows → Repost Structure | Tạo 1 row mẫu với date = today, các cột khác trống |
| 3 | **Checkbox column** | Cột checkbox có tick → Repost | Checkbox = false (bỏ tick) |
| 4 | **Symbol column** | Cột symbol đang 🔴 → Repost | Symbol = "" (về trống) |
| 5 | **Formula column** | Cột formula `=SUM({A},{B})` → Repost | Formula giữ nguyên, tự tính lại |
| 6 | **Auto-number column** | Cột auto-number có DA-001, DA-002 → Repost | Giữ nguyên giá trị cũ |
| 7 | **Dropdown column** | Cột dropdown đang "In Progress" → Repost | Giữ nguyên "In Progress" |
| 8 | **Dropdown Multi** | Cột multi-dropdown có ["A","B"] → Repost | Giữ nguyên ["A","B"] |
| 9 | **Advanced config** | Mở advanced dialog → đổi 1 cột từ "giữ"→"xóa" → Confirm | Cột đó bị xóa |
| 10 | **Advanced: phục hồi** | Advanced dialog → click "Phục hồi mặc định" | Tất cả cột về action mặc định |
| 11 | **Undo** | Repost → Ctrl+Z | Khôi phục dữ liệu cũ đầy đủ |
| 12 | **Hủy giữa chừng** | Click Repost → Cancel | Không thay đổi gì |
| 13 | **Multi-sheet** | Repost sheet A → sheet B không ảnh hưởng | Cô lập đúng |
| 14 | **Reload persist** | Repost → reload → mở lại sheet | Dữ liệu đã repost đúng |
| 15 | **Edge: không có date** | Sheet không có cột DATE → Repost | Vẫn giữ text, xóa number, toast không nhắc date |
| 16 | **Edge: chỉ có structure** | Sheet chỉ có text columns → Repost | Không thay đổi gì (toast: "0 ô bị xóa") |
| 17 | **Edge: 100 rows** | Sheet 100 rows + 20 columns → Repost | Xử lý nhanh (< 1s), không lag |
| 18 | **Tooltip preview** | Hover vào nút Repost Structure | Tooltip hiển thị đúng danh sách cột giữ/xóa/reset |
| 19 | **Dropdown menu** | Click ▼ bên cạnh nút Repost | Menu xổ xuống: Repost Date, Repost Structure, Advanced |
| 20 | **Kết hợp Clear + Repost** | Clear Data → Repost Structure | Sheet trống → tạo 1 row mẫu date = today |

---

## 6. BÀN GIAO CHO NHÀ THẦU

### 6.1 Phụ thuộc

| Phụ thuộc | Lý do |
|-----------|-------|
| `clear-data-repost-date` (SPEC_013) | Kế thừa logic, code base hiện tại |
| `SHEET_COLUMN_CONFIG` (có sẵn v19-v24) | Dùng `col.type` để phân loại carry-forward |
| `ensureSheetCells()`, `renderGridSheet()`, `scheduleSheetDataSave()` | Có sẵn trong code base |
| Toast system (`showToast`) | Đã có sẵn |
| Modal/Dialog system | Cho advanced config dialog |
| Undo snapshot pattern | Đã có sẵn từ `clearActiveSheetData()` |

### 6.2 File cần sửa

| File | Sửa |
|------|-----|
| `giao-dien-desktop-don-gian_v24_quan.html` | + Thêm nút `ssRepostCarryBtn` (hoặc nhóm dropdown) |
| (cùng file) | + Thêm `CARRY_FORWARD_DEFAULTS` config |
| (cùng file) | + Thêm `repostWithCarryForward()` function |
| (cùng file) | + Thêm `classifyColumnsForRepost()` helper |
| (cùng file) | + Thêm `openAdvancedRepostDialog()` |
| (cùng file) | + CSS cho dialog và action-toggle |
| (cùng file) | + Tooltip preview cho nút |

### 6.3 Checklist cho nhà thầu

- [ ] Nút "Repost Structure" xuất hiện trên toolbar
- [ ] Click → confirm → thực thi đúng column classification
- [ ] Advanced dialog: toggle được hành vi từng cột
- [ ] Undo hoạt động sau repost
- [ ] Date reset về hôm nay (theo giờ Việt Nam)
- [ ] Number/Currency/Checkbox/Symbol bị xóa đúng
- [ ] Text/Dropdown/Auto-Number/Contact giữ nguyên
- [ ] Formula tự tính lại
- [ ] Tooltip preview hoạt động
- [ ] Load lại trang → dữ liệu persist đúng

### 6.4 Cam kết

- ✅ SPEC đầy đủ 20 test cases, code mẫu frontend + backend
- ✅ Tuân thủ stack: HTML + Vanilla JS + Apps Script
- ✅ Kế thừa code base v24 (không phá vỡ nút Clear/Repost cũ)
- ✅ Sẵn sàng cho nhà thầu code v25
