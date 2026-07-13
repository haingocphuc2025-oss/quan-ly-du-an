# SPEC: Column Types

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🟢 Đã duyệt — Ban QLDA ký duyệt 07/07/2026
**Cập nhật:** v1.1 — 07/07/2026 (bổ sung UX: click header cột → mở picker)

---

## 1. MỤC TIÊU

Mở rộng hệ thống Column Types với các kiểu dữ liệu mới và format chi tiết: số/ngày/tiền tệ, validation, tuỳ chọn hiển thị.

**UX chuẩn (giống Smartsheet):** Click thẳng vào **header cột** → mở Column Type Picker ngay.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Các kiểu cột

| Kiểu cột | Format | Validation |
|----------|--------|-----------|
| **Text/Number** | Plain text | Max length, regex |
| **Currency (VNĐ)** | `1.234.567 ₫` | Số dương, tối đa 15 số |
| **Number** | `1,234.56` | Min/max, số thập phân |
| **Date** | `DD/MM/YYYY` | Ngày hợp lệ |
| **Percentage** | `85%` | 0-100 |
| **Dropdown list** | List chọn | Giá trị trong list, multi-select |
| **Checkbox** | ☑/☐ | Boolean |
| **Symbols** | ⭐🏆✅ | Symbol set |
| **Contact list** | Tên + email | Email valid |

### 2.2 Column Config
```json
{
  "columnId": "col-xyz",
  "type": "CURRENCY",
  "config": {
    "symbol": "₫",
    "decimalPlaces": 0,
    "minValue": 0,
    "allowNegative": false
  }
}
```

---

## 3. API & BACKEND (Apps Script)

```javascript
function getColumnConfig(sheetId) {
  return JSON.parse(cache.get(`col_config_${sheetId}`));
}

function setColumnType(sheetId, columnId, type, config) {
  // Validate + lưu config vào SHEET_COLUMN_CONFIG
}

function formatCellValue(value, type, config) {
  // Format theo loại cột — không đổi giá trị gốc
}
```

---

## 4. GIAO DIỆN (Frontend) ← CẬP NHẬT v1.1

### 4.1 Trigger — Click header cột (UX chuẩn Smartsheet)

**Hành vi:**
- User click vào **tên header cột** (ví dụ: "Nhân sự quản lý")
- Mở ngay **Column Type Picker** (popover dưới header)
- **Không** dùng toolbar button riêng

```javascript
// Gắn sự kiện vào từng header cell
headerCell.addEventListener('click', (e) => {
  e.stopPropagation();
  openColumnTypePicker(colIndex, headerCell);
});

function openColumnTypePicker(colIndex, anchorEl) {
  const picker = document.getElementById('columnTypePicker');
  // Định vị picker ngay dưới header vừa click
  const rect = anchorEl.getBoundingClientRect();
  picker.style.top  = (rect.bottom + window.scrollY) + 'px';
  picker.style.left = (rect.left  + window.scrollX) + 'px';
  picker.style.display = 'block';
  currentEditingCol = colIndex;
}
```

### 4.2 Column Type Picker UI

```
┌─────────────────────┐
│ Nhân sự quản lý     │  ← Tên cột (editable)
│ Column Type         │
├─────────────────────┤
│ A1 Text/Number      │
│ ≡  Dropdown list    │
│ 📅 Date             │
│ ⏱  Duration        │
│ 👤 Contact list     │
│ ☑  Checkbox         │
│ ★  Symbols          │
│ #  Auto number      │
├─────────────────────┤
│    [Cancel] [Ok]    │
└─────────────────────┘
```

```html
<div id="columnTypePicker" class="popover" style="display:none">
  <div class="picker-header">
    <input id="colNameInput" type="text" placeholder="Tên cột">
    <span>Column Type</span>
  </div>
  <ul class="type-list">
    <li data-type="TEXT">A1 Text/Number</li>
    <li data-type="DROPDOWN">≡ Dropdown list</li>
    <li data-type="DATE">📅 Date</li>
    <li data-type="CONTACT">👤 Contact list</li>
    <li data-type="CHECKBOX">☑ Checkbox</li>
    <li data-type="SYMBOLS">★ Symbols</li>
    <li data-type="CURRENCY">₫ Currency</li>
    <li data-type="NUMBER"># Number</li>
    <li data-type="PERCENTAGE">% Percentage</li>
  </ul>
  <div class="picker-footer">
    <button id="colPickerCancel">Cancel</button>
    <button id="colPickerOk">Ok</button>
  </div>
</div>
```

### 4.3 Sau khi chọn type → Ok

```javascript
document.getElementById('colPickerOk').addEventListener('click', () => {
  const selectedType = document.querySelector('.type-list li.selected')?.dataset.type;
  const newName = document.getElementById('colNameInput').value.trim();
  if (!selectedType) return;

  // Cập nhật SHEET_COLUMN_CONFIG
  const col = SHEET_COLUMN_CONFIG[currentEditingCol];
  if (newName) col.label = newName;
  col.type = selectedType;

  // Re-render header + cells
  renderSheetHeader();
  renderGridSheet(activeSheetContext);
  document.getElementById('columnTypePicker').style.display = 'none';
});
```

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|-----------|---------|
| 1 | Click header "Nhân sự quản lý" | Picker mở ngay dưới header đó |
| 2 | Chọn "Date" → Ok | Cột đổi sang Date, cells hiện date picker |
| 3 | Chọn "Currency" → Ok | Cells hiển thị format `1.234.567 ₫` |
| 4 | Đổi tên cột trong picker → Ok | Header cập nhật tên mới |
| 5 | Click Cancel | Không thay đổi gì |
| 6 | Click ngoài picker | Picker đóng lại |
| 7 | Đổi type → dữ liệu gốc giữ nguyên | Không mất data |
| 8 | Toolbar button cũ (nếu có) | Xóa hoặc ẩn — dùng header click thay thế |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC v1.1 — bổ sung UX click header
- ✅ Phụ thuộc: SHEET_COLUMN_CONFIG (có sẵn), `renderSheetHeader()`, `renderGridSheet()`
- ✅ Sửa v19: thay `ssColumnTypeBtn` toolbar → header click trigger
- ✅ Sẵn sàng code ngay
