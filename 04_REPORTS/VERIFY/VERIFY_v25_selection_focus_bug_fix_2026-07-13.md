# VERIFY v25 - selection-focus-bug-fix

Ngay: 2026-07-13
Baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v25_baseline.html`
SHA-256: `CC2A8EEE5E90586D454356AFE682701D650EC702272CF05E29638C38914A7A7B`

## Ket qua
- PASS: Checkbox Grid toggle xong goi `restoreActiveSheetCell(row, col, false)` de giu focus/selection tai cell vua thao tac.
- PASS: Grid range highlight gan them class tren `td.sheet-data-cell`, phu dung width/height cell container sau resize.
- PASS: Report range highlight gan class tren `td.report-range-selected`, vung boi den lien khoi hon va khong bi dut do padding cua `.report-editable-cell`.
- PASS: 4 ban HTML dong bo cung checksum: VERSIONS, STAGING, BANDIAO, apps-script.
- PASS: `node --check work\v25_inline_check.js`.

## Ghi chu
- Can refresh tab dang mo de nap HTML moi truoc khi test thu cong tren browser.
