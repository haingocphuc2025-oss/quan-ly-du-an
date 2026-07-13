# SPEC: Copy/Cut/Paste Multiple Cells/Rows (giống Excel)

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🟢 Đã duyệt — Ban QLDA ký duyệt 07/07/2026

---

## 1. MỤC TIÊU

- **Vấn đề:** App QLDA hiện chỉ có Format Painter (copy định dạng). Người dùng **KHÔNG thể** copy/cut/paste nội dung ô, nhiều ô, nhiều hàng giống Excel/Smartsheet.
- **Tại sao cần:** Quản lý dự án xây dựng thường nhập dữ liệu lặp (tên hạng mục, đơn vị, đơn giá, nhà thầu). Thao tác copy hàng mẫu → paste nhanh là bắt buộc.
- **User story:**
  - Là PM, tôi muốn **copy 1 hàng mẫu** (có cột: Hạng mục, ĐVT, SL, Đơn giá) → **paste vào 10 hàng dưới** để không nhập lại.
  - Là kế toán, tôi muốn **copy khối ô từ Excel** → **paste vào Sheet QLDA** dữ liệu tự tách cột theo tab/dòng.
  - Là giám sát, tôi muốn **cut hàng sai** → **paste sang vị trí đúng** (di chuyển hàng).

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Cấu trúc dữ liệu / Column Config (JSON)

Không thêm cột mới. Tận dụng `SHEET_COLUMN_CONFIG` hiện có để:
- Xác định kiểu ô (text/number/date/dropdown/checkbox) khi paste → validate/convert
- Biết cột nào read-only (không cho paste ghi đè)
- Biết cột Primary (bắt buộc khi paste hàng mới)

```json
// Tham chiếu: SHEET_COLUMN_CONFIG trong app
// Mỗi cột có: key, label, type, width, editable, required, options (cho dropdown)
```

### 2.2 Tính năng chính

| Tính năng | Mô tả | Yêu cầu UI |
|---|---|---|
| **Copy cells** (Ctrl+C) | Copy 1 ô hoặc khối ô liên tiếp (range) | Highlight vùng chọn, toast "Đã copy X ô" |
| **Cut cells** (Ctrl+X) | Cut 1 ô hoặc khối ô → dữ liệu gốc xóa sau khi paste thành công | Highlight khác màu (mờ/dashed), toast "Đã cut X ô" |
| **Paste cells** (Ctrl+V) | Paste vào vị trí ô active (top-left của selection) | Tự mở rộng range đích nếu paste nhiều ô hơn selection |
| **Paste từ Excel/Clipboard bên ngoài** | Dán dữ liệu tab-separated (Excel) hoặc CSV từ clipboard | Parse `clipboardData.getData('text')` → tách `\t` (cột) và `\n` (hàng) |
| **Paste nhiều hàng** | Nếu clipboard có N hàng, M cột → ghi vào N hàng từ hàng active | Tự insert hàng mới nếu vượt quá số hàng hiện có (append) |
| **Cut/Paste hàng toàn phần** | Click row number → Ctrl+X → click row number khác → Ctrl+V | Di chuyển cả hàng (giữ nguyên thứ tự cột) |
| **Paste ghi đè / Insert** | Paste vào ô đã có dữ liệu → ghi đè; Paste vào cuối sheet → insert hàng mới | Option trong context menu: "Paste ghi đè" / "Paste chèn hàng" |

### 2.3 Luồng người dùng (User Flow)

**Flow 1: Copy/Paste trong sheet (Excel-like)**
1. User chọn range ô (drag hoặc Shift+click) → highlight xanh
2. `Ctrl+C` → toast "Đã copy 6 ô (3 hàng x 2 cột)"
3. Click ô đích (top-left) → `Ctrl+V`
4. Dữ liệu ghi vào range đích, tự mở rộng nếu cần
5. Console log: "Paste: 3 rows x 2 cols at R5C2"

**Flow 2: Cut/Paste di chuyển hàng**
1. Click số hàng (row header) chọn 1-3 hàng → highlight cam
2. `Ctrl+X` → hàng mờ đi, toast "Đã cut 3 hàng"
3. Click hàng đích → `Ctrl+V`
4. Hàng cũ xóa, hàng mới chèn tại vị trí đích (các hàng dưới dồn lên/xuống)
5. Undo stack ghi nhận: "Move rows 5-7 → 12"

**Flow 3: Paste từ Excel bên ngoài**
1. User copy khối dữ liệu trong Excel (Ctrl+C)
2. Quay về QLDA, click ô B5 → `Ctrl+V`
3. App parse clipboard text → tách tab/dòng → ma trận dữ liệu
4. Validate từng ô theo column type (số, ngày, dropdown)
5. Ghi dữ liệu, highlight ô lỗi (nếu có) màu đỏ nhẹ

---

## 3. API & BACKEND (Apps Script)

### 3.1 Lưu trữ
- Dữ liệu sheet: `data.json` trên Drive (cấu trúc hiện có: `sheets[sheetId].rows[]`)
- **Không cần storage mới** — thao tác đọc/ghi dùng `luuDuLieuSheet` / `docDuLieuSheet` sẵn có

### 3.2 Hàm Apps Script mới/cần mở rộng

| Hàm | Mục đích | Params | Return |
|---|---|---|---|
| `pasteCells(sheetId, targetRow, targetCol, matrix, mode)` | Ghi ma trận dữ liệu vào sheet | `sheetId, targetRow, targetCol, matrix[][], mode: 'overwrite'\|'insert'` | `{success, rowsAffected, errors[]}` |
| `cutRows(sheetId, sourceRow, count)` | Xóa hàng nguồn (sau khi paste thành công) | `sheetId, sourceRow, count` | `{success, deletedRows[]}` |
| `insertRows(sheetId, atRow, count)` | Chèn hàng trống (cho paste insert) | `sheetId, atRow, count` | `{success, newRowIndices[]}` |
| `validatePasteMatrix(sheetId, matrix, startCol)` | Kiểm tra từng giá trị theo column type | `sheetId, matrix[][], startCol` | `{valid: bool, errors[{row,col,msg}]}` |

> **Lưu ý:** Apps Script chạy server-side. UI frontend sẽ batch gọi `google.script.run` — cần `LockService` chống race condition khi nhiều user paste cùng lúc.

### 3.3 OAuth / Web App / Trigger yêu cầu
- **Không cần OAuth mới** — dùng Web App hiện có (`/exec`)
- **Không cần Trigger mới** — paste là hành động user immediate

---

## 4. GIAO DIỆN (Frontend)

### 4.1 Component / Modal / Picker
- **Không có modal mới** — toàn bộ bằng keyboard shortcut + context menu
- **Context menu chuột phải** trên grid: thêm mục "Copy", "Cut", "Paste", "Paste chèn hàng"
- **Toast notification** (góc trên phải): "Đã copy 6 ô", "Đã paste 3 hàng", "Lỗi: 2 ô không hợp lệ"

### 4.2 Hiển thị trong Sheet / Grid
| Trạng thái | Hiển thị |
|---|---|
| Vùng chọn copy (Ctrl+C) | Viền xanh đậm `2px solid var(--primary)` |
| Vùng chọn cut (Ctrl+X) | Viền cam nét đứt `2px dashed #f97316` + opacity 0.5 |
| Ô đích paste (focus) | Viền xanh mảnh `2px solid var(--primary)` |
| Ô paste lỗi validate | Background `#fef2f2` + border đỏ + tooltip "Giá trị không hợp lệ cho cột Số" |

### 4.3 Tương tác (Keyboard + Mouse)
| Phím | Hành động |
|---|---|
| `Ctrl+C` | Copy range đang chọn (ô hoặc hàng) |
| `Ctrl+X` | Cut range đang chọn |
| `Ctrl+V` | Paste tại ô active (hoặc top-left của selection) |
| `Ctrl+Shift+V` | Paste chỉ giá trị (bỏ format) — *tùy chọn phase 2* |
| `Delete` | Xóa nội dung ô đã chọn (giữ hàng) |
| `Right-click` | Context menu: Copy / Cut / Paste / Paste chèn hàng |
| `Drag row header` | Di chuyển hàng (phase 2) |

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|---|---|
| 1 | Copy 1 ô (A1) → Paste vào B1 | B1 = giá trị A1 |
| 2 | Copy range A1:C3 (3x3) → Paste vào D5 | D5:F7 = dữ liệu A1:C3 |
| 3 | Copy 2 hàng (row 2-3) → Paste vào row 10 | Row 10-11 = dữ liệu row 2-3 |
| 4 | Cut row 5 → Paste vào row 12 | Row 5 xóa, row 12-... dồn, dữ liệu xuất hiện ở row 12 |
| 5 | Paste từ Excel (3 hàng x 4 cột, có tab) vào ô B2 | Dữ liệu tách đúng cột, validate số/ngày/dropdown |
| 6 | Paste vào cột Dropdown giá trị không có trong options | Ô highlight đỏ, toast "Giá trị 'X' không hợp lệ cho cột Trạng thái" |
| 7 | Paste vượt số hàng hiện có (sheet 10 hàng, paste 5 hàng từ hàng 9) | Tự append 4 hàng mới, tổng 14 hàng |
| 8 | Paste vào cột read-only (cột Primary đã khoá) | Bỏ qua cột đó, paste các cột khác, toast cảnh báo |
| 9 | Undo sau Paste (Ctrl+Z) | Quay lại trạng thái trước paste |
| 10 | Copy/Paste giữa 2 sheet khác nhau (tab project) | Dữ liệu chuyển đúng, column mapping theo key |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `./SPEC_NEW/copy-cut-paste/spec.md`
- ✅ Phụ thuộc: **Column Types** (đã có trong v17), **Format Painter** (có sẵn làm mẫu cho clipboard handling)
- ✅ Sẵn sàng cho v19 code

---

## 7. PHỤ THUỘC & RÀNG BUỘC

| Phụ thuộc | Mô tả |
|---|---|
| **Column Types** (v17) | Cần `SHEET_COLUMN_CONFIG` để validate paste theo type |
| **Undo/Redo stack** | Chưa có → cần implement song song (hoặc phase 2) |
| **Row insert/delete** | Cần hàm `insertRows`/`deleteRows` ở backend |
| **LockService** | Bắt buộc bọc `pasteCells` chống race condition |
| **OAuth Deploy** | Cần deploy Web App mới (việc #3 của Quân) |

---

## 8. ƯU TIÊN VÀ DỰ KIẾN

| Mức độ | Ghi chú |
|---|---|
| **Value: ⭐⭐⭐⭐⭐** | Tính năng cốt lõi spreadsheet, dùng mỗi ngày |
| **Effort: ⭐⭐⭐** | Frontend clipboard + backend matrix ops + validation |
| **Quarter: Q2** | Sau khi Column Types ổn định + OAuth deploy xong |
| **Phân công:** | Nhà thầu (quan đại gia) code v19 |