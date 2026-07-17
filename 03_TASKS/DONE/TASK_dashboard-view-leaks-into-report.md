# TASK - Dashboard view leaks into Report

Ngay: 2026-07-13
Trang thai: DONE

## Viec can lam

- Them `hideDashboardView`.
- Goi trong `openSheet` va `openReport`.
- Dong bo 4 ban HTML v25.
- Test browser chuyen Dashboard -> Sheet/Report.

## Ket qua

- `hideDashboardView()` da xoa class `active` va an inline dashboard view.
- `openSheet()` va `openReport()` deu tat Dashboard view truoc khi hien view moi.
- `openDashboard()` xoa inline display none de Dashboard van mo binh thuong.
- Browser test Dashboard -> Sheet/Report PASS.
