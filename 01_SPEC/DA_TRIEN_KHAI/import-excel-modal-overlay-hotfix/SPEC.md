# SPEC - Import Excel Modal Overlay Hotfix

Trang thai: DA_TRIEN_KHAI
Baseline: v31.1
Ngay: 17/07/2026

## Muc tieu

Sau khi chon file Excel, hop thoai import phai hien ro tren lop nen mo va nam trong man hinh.

## Nguyen nhan

`createModal()` nhan `overlay` nhung gan modal vao `document.body`. CSS chi can giua phan tu con cua overlay, trong khi modal ben ngoai lai dung `position: relative` va transform, nen hop thoai bi day khoi viewport va chi con lop nen toi.

## Pham vi

- Gan modal import vao overlay dang so huu no.
- Neu khong co overlay, modal dung vi tri fixed giua viewport lam fallback.
- Ap dung cho selector sheet, header picker, mapping, progress va import report.
- Khong thay doi du lieu, mapping hay cac che do import.

## Tieu chi chap nhan

1. Import workbook mot hoac nhieu sheet khong con man hinh toi trong.
2. Modal co parent `.import-overlay`.
3. Modal nam tron viewport laptop 1366 x 768.
4. Dong modal xoa ca modal va overlay.
5. Toan bo regression V31 PASS.

## Ket qua

- Node regression: 59/59 PASS.
- Browser: parent `.import-overlay`, modal 720 x 592.6 px trong viewport 1366 x 768.
- Console: 0 error.

