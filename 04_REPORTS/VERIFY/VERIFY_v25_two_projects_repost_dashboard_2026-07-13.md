# VERIFY — v25 two projects + Repost/Dashboard

Ngày: 2026-07-13
Baseline: v25
SHA-256: `981A6786203E9156A4C8C2A9C39824243B4AAE49571EBAAE2902F531C1CD1A70`

## PASS

- `node --check work/v25_inline.js`: PASS.
- VERSIONS, STAGING, BANDIAO và Apps Script `Index.html` cùng checksum.
- Browser local: danh sách chính hiển thị `2 dự án`.
- Dự án 1 có đủ `Repost` và `Dashboard`.
- Dự án 2 có đủ `Repost` và `Dashboard`.
- Click `Repost`: mở sheet `Repost / Repost`, có nút `Carry Forward` và dữ liệu mẫu.
- Click `Dashboard`: mở Dashboard, có 3 widget mặc định.
- Console browser: 0 error, 0 warning.
- Local backup `_PROJECT_DATA/qlda_project_backup.json`: còn 2 dự án, mỗi dự án 7 mục.
