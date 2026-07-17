# TASK: selection-focus-bug-fix

Ngay tao: 2026-07-13
Trang thai: DONE
Spec: ../01_SPEC/DA_TRIEN_KHAI/selection-focus-bug-fix/SELECTION_FOCUS_BUG_FIX.md

## Viec can lam
- Giu active cell sau khi click checkbox va Grid re-render.
- Lam vung chon Report view lien khoi, khong bi cach do padding trong cell.
- Dong bo highlight Grid/Sheet theo kich thuoc cell sau resize cot.
- Dong bo 4 ban HTML, kiem tra JS/checksum va cap nhat ho so.

## Ket qua
- Da restore active cell sau khi toggle checkbox trong Grid view.
- Da to selection tren cap `td` cho Grid va Report de khop kich thuoc cell that.
- Da dong bo 4 ban HTML.
- SHA-256: `CC2A8EEE5E90586D454356AFE682701D650EC702272CF05E29638C38914A7A7B`.
- `node --check work\v25_inline_check.js`: PASS.
