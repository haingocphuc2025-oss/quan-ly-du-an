# SPEC - Report hide source and status columns

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Sua giao dien Report de khong hien thi cot `Nguon` va `Trang thai`. Cot trang thai tren Sheet van giu nguyen.

## Pham vi

- Chi ap dung cho render Report.
- Bo cot Report `Nguon`.
- Bo cot Report `Trang thai` (cot index 1 cua sheet nguon).
- Van giu cot dinh kem trong Report.
- Khong doi du lieu nguon va khong doi Sheet.
- Dong bo VERSIONS, STAGING, BANDIAO va Apps Script Index.

## Acceptance Criteria

- Header Report khong con `Nguon`.
- Header Report khong con `Trang thai`.
- Header/dong dau tien sau cot dinh kem bat dau tu `STT`.
- Sheet van con cot trang thai.
- `node --check work/v25_inline.js` PASS.
- Browser local khong co console error.
