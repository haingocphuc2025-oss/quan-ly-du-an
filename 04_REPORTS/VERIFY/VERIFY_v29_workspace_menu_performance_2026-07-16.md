# VERIFY V29 — Workspace menu viewport-safe và hiệu năng

- Ngày: 2026-07-16
- Kết quả: PASS
- Baseline vào: V28
- Baseline ra: V29
- Artifact: `giao-dien-desktop-don-gian_v29_quan.html`
- Kích thước UTF-8: 578,020 bytes
- SHA-256: `CCCA43066CFD7A054F8FBAFD2167C16998BEA2708CD212D2E50D1DFD5D85D19E`

## Kết quả chức năng

- Menu Workspace/Create/File dùng chung helper định vị theo CSS viewport.
- Root menu dịch lên/trái trước; chỉ dùng `overflow-y:auto` khi chiều cao vượt vùng khả dụng.
- Submenu Create lật trái khi thiếu chỗ phải.
- Menu mở được tới mục Workspace; focus bằng Arrow Up/Down luôn nằm trong vùng nhìn thấy.
- Resize/zoom đăng ký định vị lại; Escape và click ngoài vẫn đóng.
- Trang chính giữ `scrollY = 0` trong toàn bộ ca kiểm thử.

## Browser matrix

| Viewport tương đương | Root trong biên 8px | Submenu trong biên 8px | Workspace | Lật trái |
|---|---:|---:|---:|---:|
| 1366×768 (100%) | PASS | PASS | PASS | PASS |
| 1093×614 (125%) | PASS | PASS | PASS | PASS |
| 911×512 (150%) | PASS | PASS | PASS | PASS |

Tại 911×512: root và submenu có chiều cao 496px, cuộn nội bộ; ArrowDown đưa focus tới mục cuối và giữ nhìn thấy; body không cuộn.

## Hiệu năng trước/sau

| Chỉ số | V28 | V29 |
|---|---:|---:|
| Cold-ish DOMContentLoaded | 563.6 ms | 298.9 ms |
| Cold-ish load | 566.5 ms | 319.1 ms |
| V29 UI-ready mark | — | 255.5 ms |
| V29 File-menu-ready mark | File menu trễ khoảng 107 ms do polling | 244.5 ms cold-ish; 45.4 ms hot |
| Hot DOMContentLoaded | 74.4–93.2 ms | 88.9 ms |
| Hot load | 103.5–114 ms | 93.7 ms |

Thay đổi chính: bỏ polling 100 ms của File menu, preload font không chặn CSS, SheetJS dùng `defer`, thêm mốc `qlda-ui-ready`.

## Lưu ý môi trường

Console không có lỗi JavaScript của bundle. Có một lỗi mạng dự kiến vì local file helper cổng 8780 không chạy trong phiên test; đây là dịch vụ phụ trợ ngoài artifact và cũng xuất hiện khi test baseline không bật helper.
