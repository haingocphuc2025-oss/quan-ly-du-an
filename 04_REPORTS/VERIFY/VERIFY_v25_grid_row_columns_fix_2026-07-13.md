# VERIFY v25 - grid-row-columns-fix

Ngay: 2026-07-13
Baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v25_baseline.html`
SHA-256: `0ADFD2D17C1D18DE405E163EE8EAF903ACC52397F06EFEE7309B998A36F03F95`

## Ket qua
- PASS: Grid view khong render cot checkbox chon dong dau hang.
- PASS: Grid view an cot cham mau trang thai mac dinh bang `visibleCols` bo col index 1.
- PASS: Checkbox du lieu render bang `.sheet-checkbox-box`, checked nen xanh `#2563EB`, tick trang.
- PASS: Toggle checkbox ghi undo action truoc khi save.
- PASS: 4 ban HTML dong bo cung checksum: VERSIONS, STAGING, BANDIAO, apps-script.
- PASS: `node --check work\v25_inline_check.js`.

## Ghi chu
- Browser snapshot tab hien tai chua reload nen con thay DOM cu; can F5/mo lai file de xem UI moi.
