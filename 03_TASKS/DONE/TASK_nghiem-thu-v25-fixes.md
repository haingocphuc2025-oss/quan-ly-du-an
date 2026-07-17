# TASK — Nghiệm thu v25 fixes

- Trạng thái: DONE
- Ngày: 2026-07-13
- Spec: `01_SPEC/NEW/nghiem-thu-v25-fixes/spec.md`

## Việc làm

- Sửa lỗi nhãn version, favicon, log debug.
- Bổ sung search highlight và jump first match trong sheet.
- Kiểm tra syntax/browser.
- Đồng bộ baseline, staging, bàn giao.

## Kết quả

- PASS `node --check`.
- PASS browser: không còn console error/log khi load.
- PASS browser: sidebar hiển thị v25.
- PASS browser: search `DM-01` tô sáng ô khớp và active cell nhảy tới `F2`.
- Checksum VERSIONS/STAGING/BANDIAO cùng `9A2E8DF34ECF3F60E08ACFAE69FA0BF7DE811F8788DDD9A3EBC6AC136BC556CD`.
