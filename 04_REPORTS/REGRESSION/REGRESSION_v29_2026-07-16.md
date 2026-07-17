# REGRESSION V29

- Ngày: 2026-07-16
- Kết quả sản phẩm: PASS

## Tự động

- Node: 64/64 test nghiệp vụ và integrity PASS.
- Hai file Playwright cũ không nạp được trong Node runner do `node_modules/@playwright/test/package.json` trên Google Drive không hợp lệ; không phải lỗi source V29.
- Các ca Playwright tương ứng được chạy trực tiếp bằng browser runtime và PASS.
- Unit định vị: 6/6 PASS.
- Bundle tái tạo từ manifest: PASS.
- Ký tự dollar trong source/bundle: PASS.
- 5 artifact MODULES/STAGING/BANDIAO/VERSIONS/apps-script giống hệt nhau: PASS.

## Smoke trình duyệt

- Khởi động ứng dụng, `__QLDA_APP_STARTED__ = true`: PASS.
- `qlda-ui-ready = 1`: PASS.
- File menu khởi tạo không polling: PASS.
- Workspace context menu sát cạnh dưới/phải: PASS.
- Create submenu lật trái và hiển thị Workspace: PASS.
- Resize 1366×768 → 911×512: PASS.
- ArrowDown giữ focus nhìn thấy: PASS.
- Escape/click ngoài đóng: PASS.
- Không cuộn trang chính: PASS.

Không thay đổi backend, OAuth, định dạng dữ liệu hoặc hành vi lệnh menu V28.
