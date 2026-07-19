# RELEASE V32 — Import Excel giữ nguyên mẫu Sheet

Ngày phát hành: 20/07/2026
Trạng thái: PHÁT HÀNH

## Điểm mới

- Import Excel mặc định giữ nguyên cấu trúc và định dạng Sheet đích.
- Không còn tự ánh xạ theo vị trí hoặc tự ghi dòng tiêu đề Excel lên Sheet.
- Auto-map theo tên đã chuẩn hóa và alias nghiệp vụ; người dùng luôn có thể sửa mapping thủ công.
- Cột Excel không mapping được mặc định `Bỏ qua` và xuất hiện trong báo cáo kết quả.
- Thêm tùy chọn `Sao chép tiêu đề từ Excel`, mặc định tắt; khi bật chỉ đổi nhãn cột đã mapping.
- Giữ nguyên id, type, width, format, thứ tự cột, công thức, conditional rules và attachment.
- Sửa Undo batch để lưu đúng snapshot trước/sau và khôi phục cả cấu hình nhãn/type/format cột.
- Modal có role/label truy cập, focus trap, phím Escape và trạng thái focus rõ ràng.

## Artifact

- `STAGING/giao-dien-desktop-don-gian_v32_quan.html`
- `VERSIONS/v32_baseline.html`
- `VERSIONS/MODULES_V32/giao-dien-desktop-don-gian_v32_quan.html`
- `BANDIAO/giao-dien-desktop-don-gian_v32_quan.html`
- `FRONTEND/giao-dien-desktop-don-gian_v32_quan.html`
- Launcher: `RUN_V32.bat`, `BANDIAO/RUN_V32_LOCALHOST.bat`

Năm artifact HTML byte-identical.

- Kích thước: 651.242 byte
- SHA-256: `DDAD4097079D300C7C37AF0F8F9F03705CF83C950F25DB1B51A92B1B7B912DF4`

## Kiểm thử

- TDD baseline: 0/7 RED đúng nguyên nhân trên mã V31.3.
- Regression cuối: 71/71 PASS.
- Browser full-flow: PASS (import, report, Undo).
- Desktop 1365×900: PASS.
- Mobile 320×800: PASS.
- Artifact smoke bằng Chrome profile cô lập: PASS, không có lỗi JavaScript trên stderr.

## Rollback

- Tag: `v31.3`
- Baseline: `VERSIONS/v31_baseline.html`
- Launcher: `RUN_V31.bat`
