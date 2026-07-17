# RELEASE V31

Ngày phát hành: 17/07/2026

## Phạm vi

- Import workbook Excel có một hoặc nhiều sheet.
- Chọn một, nhiều hoặc toàn bộ sheet cần nhập.
- Chọn dòng header riêng cho từng sheet.
- Mapping cột tự động và thủ công.
- Append, Update, Upsert và Skip Duplicate.
- Validation dữ liệu, tiến độ, báo cáo theo sheet và Undo batch.
- Không cho mapping `_rowIndex` và `_attachments`.

## Sửa lỗi phát hành

Builder V31 cũ dùng replacement string khi nhúng JavaScript. Chuỗi `USD:'$'` tạo token `$'`, làm nội dung sau `</body>` bị chèn vào mã JavaScript và khiến file đơn báo `Invalid or unexpected token`.

Builder mới chèn CSS/JavaScript theo vị trí, bảo toàn ký tự `$`, kiểm tra marker bắt buộc và cho phép test build vào thư mục tạm.

## Kiểm thử

- Node regression: **59/59 PASS**.
- Bundle JavaScript parse: PASS.
- Năm artifact phát hành đồng nhất từng byte: PASS.
- Browser smoke: `uiReady=1`, Grid và Import khởi tạo: PASS.
- `File → Import → Import from Excel` mở file chooser: PASS.
- Workbook thử nghiệm 3 sheet hiển thị đủ `Hop dong`, `Vat lieu`, `Nghiem thu`: PASS.
- Console chỉ có lỗi helper `127.0.0.1:8780` khi helper chưa chạy; `RUN_V31.bat` khởi động helper cùng ứng dụng.

## Artifact

- Baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline.html`
- Module nguồn: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline_modules/`
- Module khóa: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/MODULES_V31/`
- Bản giao: `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v31_quan.html`
- File chạy: `02_SOURCE/02_SAN_PHAM_DON_FILE/RUN_V31.bat`
- SHA-256: `E395AF236831E205114A1D4D1BC440863E282401E385AF11F0D2F6184073F504`
- Rollback: V30.
