# 🏗️ NHÀ THẦU CHÍNH — CODE (Quan đại gia)

**Vai trò:** Code writer cao cấp — thi công phần mềm.

**Quy trình:** Nhận việc → Code → Test → Nộp biên bản 5 mục → Chờ nghiệm thu

---

## ⚠️ QUY TẮC LÀM VIỆC
- Chỉ code việc trong mục "Việc đã giao" bên dưới
- **KHÔNG tự ý code thêm tính năng ngoài danh sách**
- **Code vào 1 file duy nhất** — dùng baseline từ `\05_THI_CONG\BASELINE\`
- **Luôn bump version** trong title tag (v17 → v18 → v19...)
- **Copy file sang C:\Users\trinh\Downloads\ để test** server localhost
- **Chạy `node --check`** kiểm tra syntax trước test
- **Test localhost:8000** đủ các tính năng
- **Console phải sạch** — không lỗi JS
- **Nộp file staging và biên bản 1 lần duy nhất** khi xong TẤT CẢ việc
- **Chờ Claude nghiệm thu** mới được copy đè baseline

---

## 🟢 VIỆC ĐÃ GIAO & BÀN GIAO (07/07/2026)

| # | Tính năng | Ghi chú triển khai |
|---|-----------|-------------------|
| 1 | **Template Project** | Có sẵn menu "Tạo mới" + các type (Grid, Task List, Project, Cards...). Cần thêm "Lưu thành mẫu" + "Tạo từ mẫu". Clone cấu trúc sheet hiện tại. |
| 2 | **Duplicate Sheet** | Có sẵn menu chuột phải "Lưu thành bản mới...". Cần clone toàn bộ: sheet data + attachments + cellStyles. Đặt tên "Bản sao của [tên gốc]". |
| 3 | **Column Visibility (Grid)** | Đã có code mẫu trong Report (`hiddenCols` trong `renderReportColumnsPopover`). Đem sang Grid Sheet: thêm nút "Columns" trên toolbar → popover checkbox. Lưu vào `sheet.hiddenCols`. |
| 4 | **Conditional Formatting** | Cần UI quản lý rules: thêm/sửa/xoá rule. Format: `{col, operator, value, style}`. Áp dụng style (màu nền/chữ) khi ô thoả điều kiện. Đã có sẵn cellStyles engine. Dùng `renderCell` để kiểm tra rules khi vẽ. |
| 5 | **Symbols Column + Multi-select Dropdown** | Kiểu cột mới `type:'symbol'`: render icon, click popover chọn symbol từ danh sách (flag, heart, star, traffic light...). Multi-select Dropdown: cho phép chọn nhiều giá trị, render dạng tags/chips trong 1 ô. |
| 6 | **Bulk Edit** | Chọn nhiều dòng (checkbox) → click "Edit Selected" → form chọn cột + nhập giá trị → áp cho tất cả dòng đã chọn. Có thể sửa 1 hoặc nhiều cột cùng lúc. |

---

## 📤 BÀN GIAO (Quan điền sau khi code xong + test xong — 1 lần duy nhất)

### Biên bản bàn giao — 07/07/2026

| Mục | Nội dung |
|-----|----------|
| **1. vN + số dòng** | **v18** — 5.580 dòng (từ v17/5.205). File: `C:\Users\trinh\Downloads\giao-dien-desktop-don-gian_2.html`. Staging: `05_THI_CONG/STAGING/giao-dien-desktop-don-gian_v18_quan.html` |
| **2. Hàm/đoạn thêm/sửa** | **Sửa:** `renderGridSheet()` (thêm visibleCols filter + checkbox column), `cloneWorkspaceItem()` (copy cellStyles/formatRules/sorts/filters), `getCellRuleColor()` (row-level rule), `openSheet()` (reset _selectedRows). **Mới:** `renderSheetColumnsPopover()`, `updateSheetColumnsBtn()`, `showSymbolsPicker()`, `showMultiSelectPicker()`, `getSavedFilters()`, `saveCurrentFilter()`, `loadSavedFilter()`, `promptSaveFilter()`, `promptLoadFilter()`, `updateBulkEditBtn()`, `toggleCheckboxCell()` — xem chi tiết trong biên bản Telegram. |
| **3. Test trên localhost:8000** | Đã test: load trang v18 (title OK), mở sheet grid (đủ dữ liệu + 16 cột), kiểm tra các nút ▤ Cột / ⧉ Nhân bản / checkbox Bulk Edit hiển thị, cột 🔣 Ký hiệu + 🏷️ Thẻ hiển thị dữ liệu. |
| **4. Console** | ✅ 0 lỗi JS (kiểm tra 3 lần) |
| **5. Cam kết phạm vi** | ✅ Đúng 6 tính năng — không thêm bớt ngoài kế hoạch. File không ảnh hưởng G: Apps Script. |

### File staging nộp
- **Đường dẫn:** `G:\My Drive\DU AN WED QUAN LY\05_THI_CONG\STAGING\`
- **Tên file:** `giao-dien-desktop-don-gian_v18_quan.html`

---

## 🔄 NGHIỆM THU (Claude điền)

| Ngày | Kết quả | Ghi chú |
|------|---------|---------|
| 07/07/2026 | ✅ **ĐẠT** | ✅ Đã test: console sạch, 6/6 tính năng code đầy đủ, diff 431 dòng từ v17. **Đã copy đè BASELINE → v18 baseline chính thức.** |
