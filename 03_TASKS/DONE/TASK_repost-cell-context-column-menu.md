# TASK - Repost cell right-click column menu

Ngay: 2026-07-13
Trang thai: DONE
Spec: `01_SPEC/DA_TRIEN_KHAI/repost-cell-context-column-menu/spec.md`

## Viec da lam

- Cho `openSheetColumnMenu` nhan toa do chuot tuy chon.
- Them `openSheetCellContextMenu` cho cell grid sheet.
- Gan `contextmenu` tren `sheetGridWrap` de mo menu cot khi chuot phai o du lieu.
- Dong bo cac ban v25.
- Kiem tra syntax va browser local.

## Ket qua

- PASS `node --check work/v25_inline.js`.
- PASS checksum: VERSIONS, STAGING, BANDIAO va Apps Script cung SHA-256 `17D3CDB91440570CF79BE2940897A587927183CD52538125E28B6AC6AF1B471C`.
- PASS browser: chuot phai vao Repost cot `Noi dung` mo menu cot.
- PASS browser: active cell va header cot duoc chon dung cot `7`.
- PASS console: 0 error, 0 warning.
