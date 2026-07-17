# VERIFY — v25 nghiệm thu fixes

Ngày: 2026-07-13
Baseline: v25
SHA-256: `9A2E8DF34ECF3F60E08ACFAE69FA0BF7DE811F8788DDD9A3EBC6AC136BC556CD`

## PASS

- `node --check work/v25_inline.js`: PASS.
- VERSIONS, STAGING, BANDIAO cùng checksum.
- Browser load local `giao-dien-desktop-don-gian_v25_quan.html`: PASS, không console error/warning/log.
- Sidebar version: PASS, hiển thị `v25`.
- Favicon local: PASS, không còn 404 `favicon.ico`.
- Sheet search `DM-01`: PASS, tô sáng 1 ô khớp, active cell nhảy tới `F2`.
- Apps Script `Index.html` đã đồng bộ theo baseline v25 fix.

## Chưa đổi

- Quyền file đính kèm `ANYONE_WITH_LINK` chưa đổi vì cần quyết định nghiệp vụ rõ ràng.
- Mobile không tối ưu thêm vì người dùng xác nhận desktop là chính.
