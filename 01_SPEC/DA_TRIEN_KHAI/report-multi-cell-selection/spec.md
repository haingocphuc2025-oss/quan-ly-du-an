# SPEC - Report multi cell selection

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Report phai ho tro quet/chon nhieu o du lieu bang chuot, tuong tu Sheet, de nguoi dung thao tac tren nhieu doi tuong thay vi chi mot o.

## Pham vi

- Ap dung cho o du lieu co the sua trong Report.
- Keo chuot trai qua nhieu o se to vung chon.
- O bat dau quet la active cell.
- Double click van cho phep sua noi dung o.
- Khong doi selection cua Sheet.
- Dong bo VERSIONS, STAGING, BANDIAO va Apps Script Index.

## Acceptance Criteria

- Keo qua nhieu o trong Report co nhieu `.range-selected`.
- Active cell nam tai o bat dau quet.
- Double click van focus duoc o report de sua.
- `node --check work/v25_inline.js` PASS.
- Browser local khong co console error.
