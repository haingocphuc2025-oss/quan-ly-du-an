# SPEC: Default Row Height & Text Wrap (Mặc định độ rộng hàng + Tự động xuống dòng)

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🔴 Chưa duyệt — lưu tại SPEC_NEW/, chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

- **Vấn đề:** App QLDA hiện tại: ô dữ liệu dài (ghi chú, mô tả hạng mục, tên nhà thầu) bị cắt ngang (`white-space: nowrap`, `text-overflow: ellipsis`). Người dùng không thấy toàn bộ nội dung nội dung trừ khi click edit.
- **Tại sao cần:** Quản lý dự án xây dựng có nhiều cột mô tả dài (Ghi chú, Mô tả công việc, Địa chỉ, Lý do). Cần xem hết nội dung ngay trên grid mà không phải mở modal.
- **User story:**
  - Là PM, tôi muốn **hàng tự cao lên** khi ô có nhiều dòng văn bản → thấy hết "Ghi chú: Đối tác yêu cầu thay đổi vật liệu thép day grade 500 thay cho 400, cần báo giá lại gói thép cấu trúc tầng 3-5".
  - Là kế toán, tôi muốn **bật/tắt wrap text** cho cột Ghi chú (mặc định bật) → khi tắt thì thu gọn 1 dòng, bật thì tự xuống dòng.
  - Là giám sát, tôi muốn **set độ cao hàng tối thiểu/mặc định** (ví dụ 32px, 48px) cho dễ đọc, không bị chật.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Cấu trúc dữ liệu / Column Config (JSON)

Mở rộng `SHEET_COLUMN_CONFIG` thêm 2 thuộc tính mới:

```json
{
  "key": "ghiChu",
  "label": "Ghi chú",
  "type": "TEXT",
  "width": 200,
  "wrap": true,           // MỚI: true = cho phép xuống dòng, false = nowrap 1 dòng
  "minRowHeight": 32      // MỚI: độ cao tối thiểu của hàng (px) — áp dụng toàn sheet
}
```

**Lưu trữ settings sheet-level:**
```json
// Trong sheet metadata (data.json → sheets[sheetId].settings)
{
  "defaultRowHeight": 32,      // Mặc định 32px (hiện tại ~28px)
  "defaultWrap": true,         // Mặc định bật wrap cho toàn sheet
  "columnWrap": {              // Override per-column
    "ghiChu": true,
    "moTa": true,
    "diaChi": true
  }
}
```

### 2.2 Tính năng chính

| Tính năng | Mô tả | Yêu cầu UI |
|---|---|---|
| **Default Row Height** | Set độ cao hàng mặc định cho toàn sheet (32/40/48/60px) | Toolbar: nút "Độ cao hàng" → dropdown chọn preset |
| **Text Wrap (toàn sheet)** | Bật/tắt xuống dòng tự động cho TẤT CẢ cột text | Toolbar: nút "Wrap text" (icon ↩️) toggle on/off |
| **Column Wrap Override** | Bật/tắt wrap cho từng cột cụ thể | Context menu header cột: "Wrap text" / "Không wrap" |
| **Auto Row Height** | Hàng tự cao khi có nội dung wrap nhiều dòng | Tự động: `height: auto; min-height: defaultRowHeight` |
| **Manual Row Resize** | Kéo đường phân cách hàng để set height thủ công | Drag row divider (giống Excel) — *phase 2* |
| **Persist Settings** | Lưu `defaultRowHeight`, `defaultWrap`, `columnWrap` vào Drive | Tự lưu khi thay đổi, load khi mở sheet |

### 2.3 Luồng người dùng (User Flow)

**Flow 1: Bật Wrap Text toàn sheet**
1. User click nút "Wrap text" (icon ↩️) trên toolbar → toggle ON
2. Toàn bộ cột text type tự áp dụng `white-space: normal; word-break: break-word`
3. Các hàng có nội dung dài tự cao lên hiển thị toàn bộ text
4. Setting lưu vào `sheet.settings.defaultWrap = true`

**Flow 2: Set Default Row Height**
1. User click nút "Độ cao hàng" → chọn "48px"
2. CSS variable `--row-height: 48px` áp dụng cho `.grid-sheet-table tbody tr`
3. Hàng nào nội dung cao hơn 48px → tự mở rộng (`height: auto`)
4. Setting lưu vào `sheet.settings.defaultRowHeight = 48`

**Flow 3: Override cột cụ thể**
1. User right-click header cột "Ghi chú" → chọn "Wrap text" (tick)
2. Chỉ cột đó áp dụng wrap, các cột khác theo setting sheet
3. Lưu vào `sheet.settings.columnWrap.ghiChu = true`

---

## 3. API & BACKEND (Apps Script)

### 3.1 Lưu trữ
- Mở rộng `sheet.settings` trong `data.json` (Drive)
- Không cần migration phức tạp — default hợp lý nếu thiếu

### 3.2 Hàm Apps Script

| Hàm | Mục đích | Params | Return |
|---|---|---|---|
| `getSheetSettings(sheetId)` | Lấy settings row height/wrap | `sheetId` | `{defaultRowHeight, defaultWrap, columnWrap}` |
| `updateSheetSettings(sheetId, settings)` | Cập nhật settings | `sheetId, {defaultRowHeight?, defaultWrap?, columnWrap?}` | `{success}` |

> Frontend tự xử lý CSS render — backend chỉ lưu settings. Không cần lock phức tạp.

---

## 4. GIAO DIỆN (Frontend)

### 4.1 Component / Toolbar
Thêm 2 nút vào toolbar (giữa Format Painter và Filter):

| Nút | Icon | Trạng thái | Tooltip |
|---|---|---|---|
| **Wrap Text** | ↩️ | Toggle (xanh khi ON) | "Tự động xuống dòng (Wrap text)" |
| **Row Height** | ⇅ | Dropdown | "Độ cao hàng mặc định" |

**Dropdown Row Height:** 28px (compact) / 32px (mặc định) / 40px (thoáng) / 48px (rộng) / 60px (rất rộng) / "Tùy chỉnh..."

### 4.2 CSS Implementation

```css
/* CSS Variables (root hoặc .grid-sheet-table) */
:root {
  --row-height: 32px;           /* defaultRowHeight */
  --row-min-height: 32px;
}

/* Base row style */
.grid-sheet-table tbody tr {
  height: var(--row-height);
  min-height: var(--row-min-height);
  /* Quan trọng: cho phép auto height khi content cao hơn */
  height: auto;
  min-height: var(--row-height);
}

/* Wrap text cho cell */
.grid-sheet-table td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Khi sheet bật defaultWrap = true */
.grid-sheet-table.wrap-enabled td {
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  text-overflow: unset;
}

/* Khi column override wrap = true */
.grid-sheet-table td.col-wrap {
  white-space: normal;
  word-break: break-word;
}

/* Khi column override wrap = false (sheet bật wrap nhưng cột này tắt) */
.grid-sheet-table td.col-no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 4.3 Render Logic (JavaScript)

```javascript
// Trong renderGridSheet()
function applyRowHeightWrapSettings(sheetId) {
  const settings = sheetSettings[sheetId] || { defaultRowHeight: 32, defaultWrap: true, columnWrap: {} };
  const table = document.querySelector('.grid-sheet-table');
  
  // 1. Set CSS variable
  table.style.setProperty('--row-height', settings.defaultRowHeight + 'px');
  
  // 2. Toggle class wrap-enabled trên table
  table.classList.toggle('wrap-enabled', settings.defaultWrap);
  
  // 3. Apply column override classes
  Object.entries(settings.columnWrap || {}).forEach(([colKey, wrap]) => {
    const colIndex = getColIndexByKey(sheetId, colKey);
    if (colIndex >= 0) {
      // Toggle class trên từng cell của cột này
      document.querySelectorAll(`.grid-sheet-table td[data-col-index="${colIndex}"]`).forEach(td => {
        td.classList.toggle('col-wrap', wrap);
        td.classList.toggle('col-no-wrap', !wrap && settings.defaultWrap);
      });
    }
  });
}
```

### 4.4 Context Menu Header Cột
Thêm 2 mục:
- ✅ **Wrap text** (tick khi bật) → toggle `columnWrap[colKey]`
- **Độ cao hàng...** → mở modal set defaultRowHeight

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|---|---|
| 1 | Mặc định: defaultRowHeight=32, defaultWrap=true | Hàng cao 32px, text dài tự xuống dòng |
| 2 | Tắt Wrap Text (toolbar) → defaultWrap=false | Text cắt ngang (`...`), hàng cao 32px cố định |
| 3 | Bật Wrap Text → defaultWrap=true | Text tự xuống dòng, hàng tự cao |
| 4 | Set Row Height = 48px | `--row-height: 48px`, hàng cao hơn mặc định |
| 5 | Cột "Ghi chú" override wrap=true (sheet defaultWrap=false) | Chỉ cột Ghi chú xuống dòng, cột khác cắt ngang |
| 6 | Cột "Mã hàng" override wrap=false (sheet defaultWrap=true) | Chỉ cột Mã hàng cắt ngang, cột khác xuống dòng |
| 7 | Nội dung 5 dòng wrap → hàng tự cao 5 x line-height | Không bị cắt, không che hàng dưới |
| 8 | Reload trang → settings persist | defaultRowHeight, defaultWrap, columnWrap khôi phục đúng |
| 9 | Switch sheet (tab project) → settings riêng từng sheet | Sheet A wrap, Sheet B không wrap, độc lập |
| 10 | Kéo column resizer → width thay đổi, wrap tự reflow | Text xuống dòng lại đúng width mới |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `./SPEC_NEW/default-row-height-wrap/spec.md`
- ✅ Phụ thuộc: **Column Types** (đã có v17), **Column Resizer** (đã có), **Toolbar** (có sẵn)
- ✅ Sẵn sàng cho v19 code

---

## 7. PHỤ THUỘC & RÀNG BUỘC

| Phụ thuộc | Mô tả |
|---|---|
| **Column Types / SHEET_COLUMN_CONFIG** | Cần biết cột nào type TEXT/TEXTAREA để áp dụng wrap |
| **Column Resizer** (đã có v17) | Width thay đổi → wrap reflow tự động |
| **Toolbar** (có sẵn) | Thêm 2 nút Wrap Text + Row Height |
| **Sheet Settings Storage** | Mở rộng `data.json` schema thêm `settings` object |
| **OAuth Deploy** | Cần deploy Web App mới (việc #3 của Quân) |

---

## 8. ƯU TIÊN VÀ DỰ KIẾN

| Mức độ | Ghi chú |
|---|---|
| **Value: ⭐⭐⭐⭐** | Cần thiết cho cột mô tả dài, giảm click edit |
| **Effort: ⭐⭐** | CSS-driven, ít logic backend, chủ yếu frontend render |
| **Quarter: Q2** | Cùng sprint với Column Visibility, Bulk Edit |
| **Phân công:** | Nhà thầu (quan đại gia) code v19 |