# VERIFY v25 - Dashboard view leak into Report

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Mo Dashboard: `dashboardView.active = true`, display `flex`.
- Tu Dashboard mo Sheet/Repost: `dashboardView.active = false`, display `none`, `gridSheetView` hien.
- Tu Dashboard mo Report tam: `dashboardView.active = false`, display `none`, `reportView` hien.

## Ky thuat

- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML v25 dong bo checksum: `203AAE4175F35561F492D6B850DCBC5A15238B17B20675757020397E81B1648C`.
