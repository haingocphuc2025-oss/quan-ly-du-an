# TASK - Report source chooser actions

- Nguồn yêu cầu: ảnh người dùng ngày 2026-07-15
- Trạng thái: DONE
- Owner: Codex
- Attempt: 1
- Max attempts: 5

## Mục tiêu

Sửa nút Nguồn không phản hồi và thêm Hủy/OK theo SPEC revision 1.

## File được phép sửa

- `MODULES_V27/index.html`
- `MODULES_V27/css/main.css`
- `MODULES_V27/js/report.js`
- `MODULES_V27/js/dashboard.js`
- Test, bản build/handover và hồ sơ liên quan.

## Kết quả

- Sửa ba vị trí Report dùng nhầm `projectIndex` ngoài phạm vi thành `activeProjectIndex`.
- Popover Nguồn có Hủy và OK.
- Checkbox cập nhật bản nháp; Hủy bỏ bản nháp; OK mới áp dụng và lưu local backup.
- Test riêng: 3/3 PASS.
- Regression v27: 38/38 PASS.
- Cú pháp module và packaged inline JavaScript: PASS.
- Browser isolated: artifact tải sạch 0 error/0 warning; DOM Hủy/OK đúng accessible button.
- SHA-256 artifact: `c1cd04d32b28d80c49b5f293566cf1c5f5d932dbbf963379b625768cf92fc463`.
