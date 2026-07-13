# QUAN ĐẠI GIA — Danh sách việc CODE

**Vai trò (07/07/2026):** Code writer cao cấp. Code tất cả các việc dưới đây, tự kiểm tra, nộp 1 lần duy nhất.

---

## 🔄 NHIỆM VỤ (GIAO 1 LẦN — 07/07/2026)

### LỆNH TỪ QUÂN: "Đẩy hết cho Quan, bảo nó tự kiểm tra và bàn giao 1 lần"

Code TẤT CẢ các việc sau vào 1 file duy nhất (dùng `giao-dien-desktop-don-gian_2.html` baseline v17 trên G:\My Drive\DU AN WED QUAN LY). Test trên localhost:8000. Nộp biên bản bàn giao 5 mục **1 lần duy nhất** sau khi hoàn thành tất cả.

---

## Việc đang giao

| # | Tính năng | Ghi chú triển khai | Điều kiện |
|---|---|---|---|
| 1 | **Template Project** — tạo mới dự án từ mẫu có sẵn | Có sẵn menu "Tạo mới" + các type (Grid, Task List, Project, Cards...). Cần thêm chức năng "Lưu thành mẫu" + "Tạo từ mẫu". Xem `Planning.md` mục 4. | ✅ Code luôn |
| 2 | **Duplicate Sheet** — nhân bản Sheet trong dự án | Có sẵn menu chuột phải "Lưu thành bản mới...". Cần clone sheet data + attachments + cellStyles. Xem `Planning.md` mục 4. | ✅ Code luôn |
| 3 | **Column Visibility (ẩn/hiện cột) cho Grid Sheet** | Đã có mẫu trong Report (`hiddenCols` logic ở `renderReportColumnsPopover`). Đem sang Grid: thêm nút "Columns" trên toolbar → popover checkbox chọn cột. Xem `Planning.md` mục 4. | ✅ Code luôn |
| 4 | **Conditional Formatting** | Cần UI quản lý rules (màu nền/chữ theo điều kiện). Đã có sẵn cellStyles. Xem `Planning.md` mục 4 + link help ở cuối. | ✅ Code luôn |

| 5 | **Symbols Column + Multi-select Dropdown** — giống Status/Dropdown sẵn có, thêm type mới + popover chọn | ✅ Code luôn — không cần research |
| 6 | **Bulk Edit** — sửa hàng loạt: chọn nhiều dòng → sửa 1 hoặc nhiều cột cùng lúc | ✅ Code luôn — triển khai theo pattern sẵn có |

### ⏳ Đang chờ — KHÔNG giao kèm (1 mục)

| # | Tính năng | Lý do giữ lại |
|---|---|---|
| — | Forms / Publish Report / Automation MVP | Chờ Quân deploy OAuth Apps Script |
| — | Định dạng số/ngày/tiền tệ | Có thể làm sau, effort nhỏ |

---

## ⚠️ YÊU CẦU KHI CODE

1. **Code vào 1 file duy nhất** — dùng `giao-dien-desktop-don-gian_2.html` baseline v17 trên G:\\
2. **Bump version lên v18** — sửa title tag thành `(v18)`
3. **Copy file sang C:\Users\trinh\Downloads\ để test** — server localhost chạy từ thư mục Downloads
4. **Giữ nguyên các tính năng cũ** — không phá vỡ Sort/Filter/Format/Import CSV/Reports
5. **Chạy `node --check` kiểm tra syntax** trước khi test
6. **Test trên localhost:8000** — chạy `chay-web-local.bat`, mở http://localhost:8000, test từng tính năng
7. **Console sạch** — không lỗi JS

---

## NỘP SẢN PHẨM

Sau khi hoàn thành TẤT CẢ 4 việc, nộp:

1. **File staging**: copy file đã code lên `G:\My Drive\DU AN WED QUAN LY\staging\giao-dien-desktop-don-gian_v18_quan.html`
2. **Biên bản bàn giao 5 mục** (điền vào bảng dưới đây)

---

## Biên bản bàn giao

*(Điền sau khi code xong + test xong)*

| Mục | Nội dung |
|-----|----------|
| **1. vN + số dòng** | ... |
| **2. Hàm/đoạn thêm/sửa** | ... |
| **3. Test trên localhost:8000** | ... |
| **4. Console** | ... |
| **5. Cam kết phạm vi** | ... |
