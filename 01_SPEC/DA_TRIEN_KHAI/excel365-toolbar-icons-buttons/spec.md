# SPEC - Excel 365 toolbar icons and button recovery V27

Ngay: 2026-07-16
Trang thai: DA_TRIEN_KHAI

## Muc tieu

- Thay icon tam/emoji tren Sheet toolbar bang icon SVG outline don sac theo phong cach Microsoft Excel 365.
- Khoi phuc cac nut dinh dang bi loi sau khi tach module V27.
- Dam bao cac nut top bar hien co phan hoi khi bam.

## Pham vi

- Sheet top bar va Sheet formatting toolbar.
- Save, Print, Undo, Redo, Grid, Filter, indent/outdent, font style, mau, can le, wrap, clear format, format painter, Columns, Highlight va More.
- File, Forms, Automation, Connections, Share, AI va top More.
- Khong thay doi data model, Report logic, Dashboard logic hoac project save conflict protocol.

## Tieu chi chap nhan

1. Khong con emoji/ky tu hop dung lam icon tren Sheet toolbar chinh.
2. Icon cung he 16-18px, outline don sac, co tooltip va aria-label.
3. Bold, Italic, Underline, Strike va ba nut can le khong con ReferenceError.
4. Dinh dang ap dung cho cell/vung dang chon, giu selection sau render va co Undo/Redo.
5. Fill color, text color, wrap, indent/outdent, clear format, format painter, Columns va Highlight mo/hoat dong dung.
6. Forms, Automation, Connections, Share, AI va top More co phan hoi ro rang khi bam.
7. Toolbar khong vo layout o viewport desktop 1366px.
8. Node regression va Chrome runtime smoke test PASS, khong co JavaScript error.

## Test case

- Chon mot cell, bam Bold/Italic/Underline/Strike va can trai/giua/phai.
- Chon vung nhieu cell, ap dung mau, clear format va Undo/Redo.
- Bam tung nut popover va xac nhan popover/menu tuong ung hien.
- Bam Forms, Automation, Connections, Share, AI, More va xac nhan co modal/menu/phan hoi.
- Mo ban package v27 bang Chrome, quet console error va kiem tra toolbar o 1366x768.

