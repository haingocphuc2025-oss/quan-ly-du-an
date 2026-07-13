# SPEC: Delete Key + Repost Date (Xóa dữ liệu + Reset ngày)

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🔴 Chưa duyệt — lưu tại SPEC_NEW/, chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

- **Delete/Backspace:** Đã có code xóa dữ liệu ô đang chọn (1 ô hoặc range). Cần verify hoạt động đúng + hỗ trợ "Clear Data" toàn sheet.
- **Repost Date:** Reset cột ngày về hôm nay — đã có trong yêu cầu, cần thêm nhanh.

---

## 2. TÍNH NĂNG CHÍNH

| Tính năng | Mô tả | Code hiện tại |
|---|---|---|
| **Delete key** (⌦) | Xóa dữ liệu ô/range đang chọn | ✅ **Đã có** — dòng 16790-16810 |
| **Backspace key** (⌫) | Xóa dữ liệu ô/range đang chọn (khi không editing) | ✅ **Đã có** — cùng handler với Delete |
| **Clear Data** 🗑 | Xóa TOÀN BỘ dữ liệu sheet (confirm 1 bước) | ❌ Chưa có |
| **Repost Date** 🔄 | Reset tất cả cột DATE về hôm nay | ❌ Chưa có |

---

## 3. GIẢI PHÁP

### 3.1 Delete Key — Đã có, chỉ verify

Code hiện tại:
```javascript
if((e.key === 'Delete' || e.key === 'Backspace') && !isEditing){
    e.preventDefault();
    const cellsData = ensureSheetCells(sheet);
    const {r1, r2, c1, c2} = getSelectedRange(row, col);
    for(let r = r1; r <= r2; r++){
      for(let c = c1; c <= c2; c++){
        if(!isEditableSheetCell(r, c)) continue;
        cellsData[r][c] = '';
        scheduleCellSave(sheet, r, c, '');
      }
    }
}
```

**Cần verify:** `getSelectedRange()` trả về đúng range khi chọn nhiều ô (Shift+click, drag).

### 3.2 Clear Data — Nút toolbar

Thêm nút **🗑 Clear Data** trên toolbar:
- Click → `confirm('Xóa hết dữ liệu sheet?')` → OK → `rows = []` → re-render

### 3.3 Repost Date — Nút toolbar

Thêm nút **🔄 Repost Date** trên toolbar:
- Click → `confirm('Reset ngày về hôm nay?')` → OK → Duyệt rows, cột DATE set = today

---

## 4. TEST CASES

| # | Test case | Kỳ vọng |
|---|---|---|
| 1 | Chọn 1 ô → Delete | Nội dung ô = rỗng |
| 2 | Chọn range (Shift+click) → Delete | Tất cả ô trong range = rỗng |
| 3 | Click Clear Data → OK | Toàn bộ sheet trống, giữ cấu trúc |
| 4 | Click Clear Data → Hủy | Không thay đổi |
| 5 | Click Repost Date → OK | Tất cả cột DATE = hôm nay |
| 6 | Repost Date khi sheet trống | Tự tạo 1 hàng mẫu DATE = hôm nay |

---

## 5. CODE MẪU (thêm vào JS)

```javascript
// === CLEAR DATA ===
document.getElementById('clearDataBtn').addEventListener('click', () => {
  if (!activeSheetContext) return alert('Chưa mở sheet.');
  if (!confirm('Xóa toàn bộ dữ liệu sheet "' + (activeSheetContext.name || '') + '"?')) return;
  activeSheetContext.rows = [];
  renderGridSheet(activeSheetContext);
  showToast('✅ Đã xóa all dữ liệu');
});

// === REPOST DATE ===
document.getElementById('repostDateBtn').addEventListener('click', () => {
  if (!activeSheetContext) return alert('Chưa mở sheet.');
  if (!confirm('Reset cột ngày về hôm nay?')) return;
  const dateCols = SHEET_COLUMN_CONFIG.filter(c => c.type === 'DATE').map(c => c.key);
  const today = new Date().toISOString().split('T')[0];
  if (activeSheetContext.rows.length === 0) {
    const row = {}; dateCols.forEach(k => row[k] = today); activeSheetContext.rows.push(row);
  } else {
    activeSheetContext.rows.forEach(r => dateCols.forEach(k => r[k] = today));
  }
  renderGridSheet(activeSheetContext);
  showToast('✅ Đã reset ' + dateCols.length + ' cột ngày');
});
```

---

## 6. BÀN GIAO NHÀ THẦU

- ✅ 2 nút toolbar + logic đơn giản
- ✅ File: `SPEC_NEW/delete-key-repost-date/spec.md`
- ✅ Phụ thuộc: `SHEET_COLUMN_CONFIG`, `renderGridSheet()`, `showToast()`
- ✅ Sẵn sàng v19