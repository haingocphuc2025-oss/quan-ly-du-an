# SPEC - Dashboard view leaks into Report

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Khi dang mo Repost/Report hoac Sheet, Dashboard khong duoc hien de vao mep phai man hinh.

## Pham vi

- Them helper tat Dashboard view.
- Goi helper khi mo Sheet va Report.
- Khi mo Dashboard thi tat Sheet/Report nhu hien tai.

## Acceptance Criteria

- Mo Dashboard roi mo Sheet: `dashboardView` khong con class `active`.
- Mo Dashboard roi mo Report: `dashboardView` khong con class `active`.
- `node --check work/v25_inline.js` PASS.
- 4 ban HTML v25 dong bo checksum `203AAE4175F35561F492D6B850DCBC5A15238B17B20675757020397E81B1648C`.
