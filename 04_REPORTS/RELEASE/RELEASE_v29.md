# RELEASE V29

Ngày phát hành: 2026-07-16

V29 sửa triệt để việc menu Workspace/Create bị che ở cạnh màn hình và giảm thời gian chờ khởi động cảm nhận.

## Thay đổi

- Menu/root/submenu luôn cách viewport tối thiểu 8px.
- Tự dịch lên, lật trái và cuộn nội bộ khi cần.
- Định vị lại khi resize/zoom; điều hướng bàn phím giữ focus nhìn thấy.
- File menu bỏ polling `setInterval`.
- Google Fonts không còn chặn CSS; SheetJS tải `defer`.
- Thêm mốc đo `fileMenuReadyMs` và `uiReadyMs`.

## Chạy

Dùng `02_SOURCE/02_SAN_PHAM_DON_FILE/RUN_V29.bat`.

## Artifact

- Baseline: `VERSIONS/v29_baseline.html`
- Module khóa: `VERSIONS/v29_baseline_modules/`
- SHA-256: `CCCA43066CFD7A054F8FBAFD2167C16998BEA2708CD212D2E50D1DFD5D85D19E`
- Rollback: V28
