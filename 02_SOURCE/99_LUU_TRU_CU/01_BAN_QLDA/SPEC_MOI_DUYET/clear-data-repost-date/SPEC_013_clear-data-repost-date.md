# SPEC: Clear Data & Repost Date (2 nút đơn giản)

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🔴 Chưa duyệt — lưu tại SPEC_NEW/, chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

- **Vấn đề:** Cần 2 hành động nhanh trên toolbar cho báo cáo định kỳ:
  - **Clear Data:** Xóa toàn bộ dữ liệu nhập (text, số, checkbox, dropdown) → sheet về trắng sạch, giữ cột/định dạng
  - **Repost Date:** Reset tất cả cột kiểu DATE về ngày hôm nay — dùng khi bắt đầu báo cáo tuần mới
- **Khác biệt với SPEC trước:** Không modal phức tạp, không chọn chế độ, không selective clear. Chỉ 2 nút, 1 click = thực thi ngay (có confirm nhỏ).

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Nút trên Toolbar

Thêm 2 nút cạnh nhau (bên cạnh Actions):

```
[ Actions ▾ ] [ 🗑 Clear Data ] [ 🔄 Repost Date ] [ ＋ Tạo dự án mới ]
```

| Nút | Icon | Màu | Tooltip |
|---|---|---|---|
| **Clear Data** | 🗑 | Đỏ (danger) | "Xóa toàn bộ dữ liệu sheet" |
| **Repost Date** | 🔄 | Xanh (primary) | "Reset ngày tháng về hôm nay" |

### 2.2 Clear Data (🗑)

| Hành vi | Chi tiết |
|---|---|
| **Xóa gì** | Tất cả giá trị trong `sheet.rows` (mọi cột: text, number, date, dropdown, checkbox) |
| **Giữ gì** | Header, `SHEET_COLUMN_CONFIG`, column width, conditional format rules, sheet settings |
| **Kết quả** | `sheet.rows = []` (sheet trống hoàn toàn) |
| **Confirm** | `confirm('Xóa toàn bộ dữ liệu sheet này?')` — OK thì xóa |
| **Undo** | Snapshot `rows` trước khi xóa → cho phép Ctrl+Z khôi phục |
| **Toast** | "✅ Đã xóa toàn bộ dữ liệu (24 dòng)" |

### 2.3 Repost Date (🔄)

| Hành vi | Chi tiết |
|---|---|
| **Đối tượng** | Chỉ các cột `type === 'DATE'` trong `SHEET_COLUMN_CONFIG` |
| **Giá trị mới** | `today = new Date().toISOString().split('T')[0]` (YYYY-MM-DD) |
| **Áp dụng cho** | Tất cả hàng hiện có trong `sheet.rows` |
| **Nếu sheet trống** | Tự tạo 1 hàng mẫu với các cột DATE = today |
| **Confirm** | `confirm('Reset tất cả ngày tháng về hôm nay?')` |
| **Toast** | "✅ Đã reset 3 cột ngày về 07/07/2026" |

---

## 3. LUỒNG NGƯỜI DÙNG

### Flow 1: Clear Data
1. User click 🗑 **Clear Data**
2. `confirm('Xóa toàn bộ dữ liệu sheet "[tên]"?')` → OK
3. Snapshot `rows` vào `_snapshot`
4. `sheet.rows = []`
5. Ghi log: `settings.lastCleared = '07/07/2026 15:30'`
6. Re-render grid → toast xanh

### Flow 2: Repost Date
1. User click 🔄 **Repost Date**
2. `confirm('Reset tất cả cột ngày về hôm nay (07/07/2026)?')` → OK
3. Duyệt `sheet.rows`, mỗi cột DATE set = today
4. Nếu `rows.length === 0` → tạo 1 row mới chỉ có DATE = today
5. Ghi log: `settings.lastRepostDate = '07/07/2026 15:30'`
6. Re-render grid → toast xanh

---

## 4. API & BACKEND (Apps Script)

### 4.1 Hàm mới

| Hàm | Mục đích | Params | Return |
|---|---|---|---|
| `clearSheetData(sheetId)` | Xóa toàn bộ rows | `sheetId` | `{success, rowsDeleted, snapshotId}` |
| `repostSheetDates(sheetId)` | Reset cột DATE về today | `sheetId` | `{success, rowsUpdated, dateColumns[]}` |

> Cả 2 đều cần `LockService` — tránh race condition.

### 4.2 Logic Repost Date (backend)

```javascript
function repostSheetDates(sheetId) {
  const sheet = getSheet(sheetId);
  const dateCols = SHEET_COLUMN_CONFIG.filter(c => c.type === 'DATE').map(c => c.key);
  const today = new Date().toISOString().split('T')[0];
  
  if (sheet.rows.length === 0) {
    // Tạo 1 row mẫu chỉ có date = today
    const sampleRow = {};
    dateCols.forEach(key => { sampleRow[key] = today; });
    sheet.rows.push(sampleRow);
  } else {
    sheet.rows.forEach(row => {
      dateCols.forEach(key => { row[key] = today; });
    });
  }
  
  sheet.settings = sheet.settings || {};
  sheet.settings.lastRepostDate = new Date().toLocaleString('vi-VN');
  saveData();
  return { success: true, rowsUpdated: sheet.rows.length, dateColumns: dateCols };
}
```

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|---|---|
| 1 | Click Clear Data → Confirm OK | `rows = []`, grid trắng, toast "Đã xóa toàn bộ dữ liệu" |
| 2 | Click Clear Data → Hủy | Không thay đổi gì |
| 3 | Ctrl+Z sau Clear Data | Khôi phục đúng `rows` cũ |
| 4 | Click Repost Date → Confirm OK | Tất cả cột DATE = today, toast "Đã reset 3 cột ngày" |
| 5 | Click Repost Date → Hủy | Không thay đổi |
| 6 | Sheet trống → Repost Date | Tạo 1 row mới với DATE = today |
| 7 | Clear Data → Repost Date ngay | Sheet trống → tạo 1 row DATE = today |
| 8 | Repost Date → Clear Data | Sheet trắng sạch |
| 9 | Reload sau Clear/Repost | Trạng thái đúng (trống / có date today) |
| 10 | Multi-sheet: clear sheet A → sheet B không ảnh hưởng | Cô lập đúng |

---

## 6. CODE MẪU (Frontend)

### 6.1 Toolbar buttons (thêm vào HTML)

```html
<!-- Trong toolbar, sau nút Actions -->
<button class="btn btn-ghost btn-icon" id="clearDataBtn" title="Xóa toàn bộ dữ liệu sheet" style="color:#DC2626">🗑</button>
<button class="btn btn-ghost btn-icon" id="repostDateBtn" title="Reset ngày tháng về hôm nay" style="color:#1A73E8">🔄</button>
```

### 6.2 JS Handlers

```javascript
// === CLEAR DATA ===
document.getElementById('clearDataBtn').addEventListener('click', () => {
  if (!activeSheetContext) { alert('Chưa mở sheet nào.'); return; }
  if (!confirm('Xóa toàn bộ dữ liệu sheet "' + (activeSheetContext.name || 'Không tên') + '"?')) return;
  
  // Snapshot cho undo
  activeSheetContext._snapshot = {
    rows: JSON.parse(JSON.stringify(activeSheetContext.rows)),
    timestamp: Date.now()
  };
  
  // Xóa
  const deleted = activeSheetContext.rows.length;
  activeSheetContext.rows = [];
  activeSheetContext.settings = activeSheetContext.settings || {};
  activeSheetContext.settings.lastCleared = new Date().toLocaleString('vi-VN');
  
  renderGridSheet(activeSheetContext);
  showToast('✅ Đã xóa toàn bộ dữ liệu (' + deleted + ' dòng)');
});

// === REPOST DATE ===
document.getElementById('repostDateBtn').addEventListener('click', () => {
  if (!activeSheetContext) { alert('Chưa mở sheet nào.'); return; }
  const todayStr = new Date().toLocaleDateString('vi-VN');
  if (!confirm('Reset tất cả cột ngày về hôm nay (' + todayStr + ')?')) return;
  
  const dateCols = SHEET_COLUMN_CONFIG.filter(c => c.type === 'DATE').map(c => c.key);
  const today = new Date().toISOString().split('T')[0];
  
  if (activeSheetContext.rows.length === 0) {
    const sampleRow = {};
    dateCols.forEach(key => { sampleRow[key] = today; });
    activeSheetContext.rows.push(sampleRow);
  } else {
    activeSheetContext.rows.forEach(row => {
      dateCols.forEach(key => { row[key] = today; });
    });
  }
  
  activeSheetContext.settings = activeSheetContext.settings || {};
  activeSheetContext.settings.lastRepostDate = new Date().toLocaleString('vi-VN');
  
  renderGridSheet(activeSheetContext);
  showToast('✅ Đã reset ' + dateCols.length + ' cột ngày về ' + todayStr);
});
```

---

## 7. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC đơn giản, 2 nút, 2 hàm backend
- ✅ File tham chiếu: `./SPEC_NEW/clear-data-repost-date/spec.md`
- ✅ Phụ thuộc: Toolbar (có sẵn), Toast (có sẵn), SHEET_COLUMN_CONFIG (v17)
- ✅ Sẵn sàng cho v19 code

---

## 8. ƯU TIÊN

| Mức độ | Ghi chú |
|---|---|
| **Value: ⭐⭐⭐⭐** | Cần thiết cho báo cáo tuần: clear data → repost date → nhập mới |
| **Effort: ⭐** | Rất nhẹ: 2 nút + 2 confirm + 2 hàm backend đơn giản |
| **Quarter: Q2** | Làm ngay sau Column Visibility |
| **Phân công:** | Nhà thầu (quan đại gia) code v19 |