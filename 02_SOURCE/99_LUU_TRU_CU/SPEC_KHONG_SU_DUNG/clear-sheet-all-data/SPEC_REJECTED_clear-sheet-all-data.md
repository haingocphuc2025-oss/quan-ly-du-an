# SPEC: Clear Sheet — Xóa toàn bộ dữ liệu sheet (kèm reset ngày tháng)

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🔴 Chưa duyệt — lưu tại SPEC_NEW/, chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

- **Vấn đề:** App QLDA hiện tại không có cách nào xóa sạch dữ liệu trong 1 sheet. Người dùng phải xóa từng ô thủ công hoặc xóa cả dự án (mất luôn cấu trúc). Đặc biệt khi làm báo cáo định kỳ (hàng tuần/tháng), cần xóa dữ liệu cũ để nhập mới — nhưng giữ nguyên cấu trúc cột, định dạng, settings.
- **Tại sao cần:** Quản lý dự án xây dựng có nhu cầu "xóa sheet để làm lại" thường xuyên: báo cáo tuần mới, reset số liệu nghiệm thu, dọn dẹp dữ liệu test.
- **User story:**
  - Là PM, tôi muốn **1 nút "Clear Sheet"** — bấm → xác nhận → xóa hết dữ liệu cả sheet (xóa hết hàng dữ liệu, không xóa cấu trúc)
  - Là kế toán, tôi muốn nó **cũng reset các cột ngày** về giá trị mặc định (hôm nay/trống) — "repost cả date"
  - Là giám sát, tôi muốn **chọn chế độ xóa:** "Xóa toàn bộ dữ liệu" hoặc "Chỉ xóa dữ liệu các cột chọn lọc" hoặc "Reset ngày tháng về hôm nay"

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Tính năng chính

| Tính năng | Mô tả | Yêu cầu UI |
|---|---|---|
| **Clear All Rows** | Xóa TẤT CẢ các hàng dữ liệu trong sheet, giữ nguyên header + cấu trúc + settings | Nút 🗑 "Clear Sheet" trên toolbar, gần nút Action |
| **Preserve Structure** | Chỉ xóa dữ liệu hàng, KHÔNG xóa cột, column config, định dạng, conditional format rules | Tự động: không chạm vào `SHEET_COLUMN_CONFIG` / `sheet.settings` |
| **Reset Date Columns** | Cột kiểu DATE được reset về: (a) để trống, hoặc (b) set về ngày hôm nay | Option trong modal xác nhận |
| **Selective Clear** | User chọn cột nào cần clear, cột nào giữ nguyên | Modal checkbox list cột |
| **Confirm Modal** | Modal xác nhận 2 bước: "Bạn có chắc?" + chọn chế độ | Modal trước khi xóa |
| **Undo Support** | Lưu snapshot dữ liệu trước khi clear → cho phép Undo (Ctrl+Z) | Nếu Undo stack đã có |
| **Audit Log** | Ghi lại sự kiện: "Đã clear sheet [tên] lúc HH:MM DD/MM" | Ghi vào `sheet.settings.lastCleared` |

### 2.2 Chi tiết các chế độ Clear

| Chế độ | Mô tả | Dùng khi nào |
|---|---|---|
| **1. Clear All (Xóa hết)** | Xóa TẤT CẢ hàng dữ liệu + reset mọi ô về trống | Làm sheet mới từ đầu, giữ cấu trúc |
| **2. Clear + Reset Dates (Mặc định)** | Xóa hết dữ liệu + reset cột ngày về hôm nay | Làm báo cáo tuần mới: ngày bắt đầu = hôm nay |
| **3. Clear Selective (Xóa chọn cột)** | Modal hiện danh sách cột, user tick cột muốn xóa | Chỉ xóa cột giá trị, giữ nguyên ghi chú |
| **4. Reset Dates Only (Chỉ reset ngày)** | KHÔNG xóa dữ liệu text/số, chỉ reset cột DATE về hôm nay | Cập nhật ngày cho đợt mới |

### 2.3 Luồng người dùng (User Flow)

**Flow 1: Clear + Reset Dates (mặc định — "repost cả date")**
1. User click nút **🗑 Clear Sheet** trên toolbar
2. Modal hiện: "Xóa toàn bộ dữ liệu sheet [tên]?"
3. Radio chọn: `◎ Xóa hết dữ liệu + Reset ngày về hôm nay (mặc định)`
4. User click **"Xác nhận"** (nút đỏ) hoặc **"Hủy"**
5. (a) Dữ liệu cũ snapshot vào undo stack
6. (b) Gọi API `clearSheetData(sheetId, {resetDateColumns: true, dateValue: 'today'})`
7. (c) Tất cả hàng trong `data.json` xóa
8. (d) Cột DATE set về ngày hôm nay
9. (e) Toast: "✅ Đã clear sheet + reset ngày (🎉)"
10. (f) Ghi log: `sheet.settings.lastCleared = '07/07/2026 15:30'`

**Flow 2: Clear All (không reset ngày)**
1. Click nút → modal → chọn `○ Xóa hết dữ liệu (giữ nguyên ngày tháng)`
2. Xóa hàng, không động đến giá trị ngày

**Flow 3: Undo sau Clear**
1. User clear nhầm → `Ctrl+Z`
2. Undo stack restore snapshot dữ liệu
3. Toast: "↩ Đã khôi phục dữ liệu sheet"

---

## 3. API & BACKEND (Apps Script)

### 3.1 Lưu trữ
- Dữ liệu: `data.json` → `sheets[sheetId].rows = []` (xóa hết)
- Snapshot trước khi clear: `sheets[sheetId]._snapshot = {rows, timestamp}` (cho undo)
- Settings: `sheets[sheetId].settings.lastCleared = timestamp`

### 3.2 Hàm Apps Script

| Hàm | Mục đích | Params | Return |
|---|---|---|---|
| `clearSheetData(sheetId, options)` | Xóa dữ liệu sheet theo chế độ | `sheetId, {mode: 'all'\|'datesOnly'\|'selective', resetDates: bool, dateValue: 'today'\|'empty'\|'custom', selectedColumns: []}` | `{success, rowsDeleted, datesReset, snapshotId}` |
| `undoClearSheet(sheetId, snapshotId)` | Khôi phục dữ liệu từ snapshot | `sheetId, snapshotId` | `{success, rowsRestored}` |
| `selectiveClearColumns(sheetId, columns, options)` | Xóa dữ liệu theo cột chọn | `sheetId, columns[], {clearDates: bool}` | `{success, cellsCleared}` |

> Cần `LockService` — tránh clear nhầm khi 2 người dùng cùng lúc

### 3.3 Xử lý đặc biệt — "Repost date"

```javascript
// Logic reset date columns
function resetDateColumns(sheetId, mode) {
  const sheet = getSheet(sheetId);
  const config = SHEET_COLUMN_CONFIG;
  
  sheet.rows.forEach(row => {
    config.forEach(col => {
      if (col.type === 'DATE') {
        if (mode === 'today') {
          row[col.key] = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (mode === 'empty') {
          delete row[col.key];
        }
      }
    });
  });
}
```

---

## 4. GIAO DIỆN (Frontend)

### 4.1 Nút Clear Sheet trên Toolbar

Thêm nút mới vào toolbar (bên cạnh nút Actions):

```
[ Actions ▾ ] [ 🗑 Clear Sheet ] [ ＋ Tạo dự án mới ]
```

- **Icon:** 🗑 (hoặc 🧹)
- **Màu:** Đỏ khi hover (danger)
- **Tooltip:** "Xóa toàn bộ dữ liệu sheet"

### 4.2 Modal Xác Nhận (3 bước)

```
╔════════════════════════════════════════════╗
║  🗑 Clear Sheet                            ║
║                                            ║
║  Sheet: "Báo cáo tuần 27"                 ║
║  Hàng hiện tại: 24 dòng                    ║
║                                            ║
║  Chọn chế độ xóa:                         ║
║                                            ║
║  ◎ Xóa hết dữ liệu + Reset ngày về hôm nay ║
║  ○ Xóa hết dữ liệu (giữ nguyên ngày)       ║
║  ○ Reset ngày tháng (giữ dữ liệu khác)     ║
║  ○ Xóa chọn cột...                         ║
║                                            ║
║  ⚠ Hành động này không thể hoàn tác        ║
║  (trừ khi Undo được bật)                   ║
║                                            ║
║  [ Hủy ]         [ 🗑 Xác nhận xóa ]       ║
╚════════════════════════════════════════════╝
```

### 4.3 Toast + Animation

| Sự kiện | Toast |
|---|---|
| Clear + Reset Dates | "✅ Đã xóa 24 dòng + reset 3 cột ngày về hôm nay" |
| Clear All | "✅ Đã xóa 24 dòng (giữ nguyên ngày)" |
| Reset Dates Only | "✅ Đã reset 3 cột ngày về hôm nay" |
| Selective Clear | "✅ Đã xóa 2 cột (Ghi chú, Địa chỉ)" |
| Undo Clear | "↩ Đã khôi phục 24 dòng dữ liệu" |

Animation: Hàng cũ mờ dần (fadeOut) + hàng trống/shimmers hiện lên.

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|---|---|
| 1 | Click Clear Sheet → chọn "Xóa hết + Reset ngày" → Xác nhận | 24 dòng xóa, 3 cột DATE set về hôm nay, toast xanh |
| 2 | Click Clear Sheet → Hủy | Không có gì thay đổi |
| 3 | Clear All (không reset ngày) | Dữ liệu xóa, cột DATE giữ nguyên giá trị cũ |
| 4 | Reset Dates Only | Dữ liệu text/số giữ nguyên, cột DATE set về hôm nay |
| 5 | Selective Clear: tick cột "Ghi chú" + "Địa chỉ" | Chỉ 2 cột đó xóa dữ liệu, cột khác giữ |
| 6 | Ctrl+Z sau Clear | Dữ liệu khôi phục chính xác |
| 7 | Sheet trống sẵn → Clear | Toast "Sheet đã trống", không lỗi |
| 8 | Reload page sau Clear | Sheet trống, settings giữ nguyên |
| 9 | Clear sheet A → switch sang sheet B → quay lại sheet A | Sheet A vẫn trống, sheet B bình thường |
| 10 | Mở snapshot trong console → kiểm tra backup | `_snapshot.rows` đúng 24 dòng, có timestamp |

---

## 6. GIAO DIỆN (CODE MẪU)

### 6.1 Modal HTML (thêm vào `<div id="app">`)

```html
<div id="clearSheetModal" class="modal-overlay" style="display:none">
  <div class="modal" style="max-width:420px">
    <div class="modal-header">
      <span class="modal-icon">🗑</span>
      <span class="modal-title">Clear Sheet</span>
      <button class="modal-close" id="clearSheetClose">&times;</button>
    </div>
    <div class="modal-body">
      <p>Sheet: <strong id="clearSheetName"></strong></p>
      <p id="clearSheetRowCount"></p>
      <hr>
      <label><input type="radio" name="clearMode" value="resetDates" checked>
        Xóa hết dữ liệu + Reset ngày về hôm nay</label><br>
      <label><input type="radio" name="clearMode" value="all">
        Xóa hết dữ liệu (giữ nguyên ngày)</label><br>
      <label><input type="radio" name="clearMode" value="datesOnly">
        Reset ngày tháng (giữ dữ liệu khác)</label><br>
      <hr>
      <p class="text-danger">⚠ Hành động này không thể hoàn tác</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="clearSheetCancel">Hủy</button>
      <button class="btn btn-danger" id="clearSheetConfirm">🗑 Xác nhận xóa</button>
    </div>
  </div>
</div>
```

### 6.2 JS Handler

```javascript
// === Nút Clear Sheet ===
const clearSheetBtn = document.getElementById('clearSheetBtn'); // Thêm vào toolbar

clearSheetBtn.addEventListener('click', () => {
  if (!activeSheetContext) { alert('Chưa mở sheet nào.'); return; }
  const sheet = activeSheetContext;
  document.getElementById('clearSheetName').textContent = sheet.name || 'Không tên';
  document.getElementById('clearSheetRowCount').textContent =
    `Hàng hiện tại: ${(sheet.rows || []).length} dòng`;
  document.getElementById('clearSheetModal').style.display = 'flex';
});

document.getElementById('clearSheetCancel').addEventListener('click', () => {
  document.getElementById('clearSheetModal').style.display = 'none';
});
document.getElementById('clearSheetClose').addEventListener('click', () => {
  document.getElementById('clearSheetModal').style.display = 'none';
});

document.getElementById('clearSheetConfirm').addEventListener('click', () => {
  const mode = document.querySelector('input[name="clearMode"]:checked').value;
  if (!confirm('Xác nhận lần cuối: Xóa dữ liệu sheet này?')) return;
  
  // 1. Snapshot cho undo
  const snapshot = JSON.parse(JSON.stringify(activeSheetContext.rows));
  activeSheetContext._snapshot = { rows: snapshot, timestamp: Date.now() };
  
  // 2. Xử lý theo mode
  if (mode === 'all' || mode === 'resetDates') {
    activeSheetContext.rows = [];
  }
  
  // 3. Reset dates nếu cần
  if (mode === 'resetDates' || mode === 'datesOnly') {
    const dateColKeys = SHEET_COLUMN_CONFIG
      .filter(c => c.type === 'DATE')
      .map(c => c.key);
    
    if (mode === 'datesOnly') {
      // Chỉ reset dates, giữ rows
      activeSheetContext.rows.forEach(row => {
        dateColKeys.forEach(key => { row[key] = new Date().toISOString().split('T')[0]; });
      });
    } else {
      // resetDates: tạo 1 row mẫu với dates = today
      const sampleRow = {};
      SHEET_COLUMN_CONFIG.forEach(c => {
        if (c.type === 'DATE') sampleRow[c.key] = new Date().toISOString().split('T')[0];
      });
      activeSheetContext.rows.push(sampleRow); // giữ 1 row mẫu
    }
  }
  
  // 4. Ghi log
  activeSheetContext.settings = activeSheetContext.settings || {};
  activeSheetContext.settings.lastCleared = new Date().toLocaleString('vi-VN');
  
  // 5. Re-render + toast
  renderGridSheet(activeSheetContext);
  showToast('✅ Đã clear sheet' + (mode === 'resetDates' ? ' + reset ngày' : '') + '.');
  
  // 6. Đóng modal
  document.getElementById('clearSheetModal').style.display = 'none';
});
```

---

## 7. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `./SPEC_NEW/clear-sheet-all-data/spec.md`
- ✅ Phụ thuộc: Modal system (có sẵn sheetNameModal làm mẫu), Toolbar button
- ✅ Sẵn sàng cho v19 code

---

## 8. PHỤ THUỘC & RÀNG BUỘC

| Phụ thuộc | Mô tả |
|---|---|
| **Modal system** (có sẵn `sheetNameModal`) | Làm mẫu cho `clearSheetModal` |
| **Toolbar** (có sẵn) | Thêm nút 🗑 Clear Sheet |
| **Toast notification** (có sẵn) | Hiển thị kết quả |
| **Undo/Redo stack** | Nếu đã có → snapshot + restore; nếu chưa → alert "Không thể undo" |
| **LockService** | Chống clear race condition |

---

## 9. ƯU TIÊN VÀ DỰ KIẾN

| Mức độ | Ghi chú |
|---|---|
| **Value: ⭐⭐⭐⭐** | Cần thiết cho reset báo cáo định kỳ, dọn dẹp test |
| **Effort: ⭐⭐** | Chủ yếu modal + modal logic + 1 backend function |
| **Quarter: Q2** | Cùng sprint với Row Height, Column Visibility |
| **Phân công:** | Nhà thầu (quan đại gia) code v19 |

---

## 10. LƯU Ý ĐẶC BIỆT — "Repost cả date"

Theo yêu cầu của Quân, chế độ **mặc định** (mặc định chọn sẵn) là:

> **Xóa hết dữ liệu + Reset ngày về hôm nay**

Tức là:
- Xóa sạch các hàng dữ liệu cũ
- Các cột kiểu DATE (Ngày bắt đầu, Ngày kết thúc, Ngày nghiệm thu, ...) được set về **ngày hôm nay** (hoặc ngày đầu kỳ)
- Nếu sheet trống → tự động tạo 1 hàng mẫu với các cột DATE đã set ngày hôm nay

Đây là flow phổ biến nhất cho báo cáo tuần: "xóa số liệu cũ, để ngày mới, nhập tiếp".