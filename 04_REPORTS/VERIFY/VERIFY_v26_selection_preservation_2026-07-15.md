# VERIFY v26 - Selection preservation after grid re-render

Ngay: 15/07/2026
Pham vi: Grid/Sheet view trong `02_SAN_PHAM_DON_FILE`

## Ket qua

- Da sua nguyen nhan selection bi mat sau thao tac toolbar: `renderGridSheet()` khong con tu dong dat active cell ve hang 1/cot 2 khi da co selection hien tai.
- Da luu va khoi phuc active cell, anchor/end cua vung chon, trang thai chon cot va highlight sau khi render lai DOM.
- Ap dung cho cac thao tac dung chung `setCellStyleValue()` va `toggleCellStyleFlag()`: to dam, nghieng, gach chan, gach ngang, mau chu, mau nen, can trai/giua/phai.
- Khong lam thay doi selection khi render lai do checkbox, edit cell, resize/search hoac undo/redo; truong hop chu dong tim kiem van uu tien nhay den ket qua tim thay.

## Kiem tra

- Node test: **21/21 PASS**.
- Kiem tra syntax tat ca module JavaScript: **PASS**.
- Kiem tra syntax JavaScript inline trong `v26_baseline.html`: **PASS**.
- Cac artifact v26 da dong bo cung noi dung.
- Kiem tra Chromium runtime khong thuc hien duoc trong luot nay do Windows sandbox khong khoi tao duoc browser backend.

## Artifact

SHA-256 cac file HTML v26:

`6AB9354A83D6B7BF27CBC3B8F223845364D6B40B8919EC29DD1689E22CEA2AA6`

## Files

- `02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V26/js/grid.js`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V26/tests/selection-preservation.test.js`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v26_baseline.html`