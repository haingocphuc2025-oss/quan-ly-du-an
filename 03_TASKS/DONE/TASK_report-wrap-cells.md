# TASK - Report wrap cells

Ngay: 2026-07-13
Trang thai: DONE

## Viec can lam

- Bo ep `nowrap` tren `.report-editable-cell`.
- Cho cell Report wrap theo `pre-wrap` va line-height phu hop.
- Noi gioi han row height Report de co the hien nhieu dong.
- Dong bo baseline, staging, ban giao va apps-script.
- Kiem tra browser va checksum.

## Ket qua

- `.report-editable-cell` da dung `pre-wrap` va `overflow-wrap:anywhere`.
- Row height Report 48/60 khong con bi reset ve 24.
- Browser test wrap row height 60 PASS.
- Regression Delete nhieu o Report PASS.
