# SPEC - Report delete multi selection

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Cho phep dung phim Delete/Backspace de xoa nhieu o dang duoc quet chon trong Report.

## Pham vi

- Ap dung cho vung chon `.report-editable-cell` trong Report.
- Neu co nhieu o `.range-selected`, xoa tat ca o do.
- Neu chi co `.active-cell`, xoa o active.
- Ghi nguoc gia tri rong ve sheet nguon.
- Khong canh tranh voi che do sua chu trong contenteditable.
- Khong doi logic xoa selection cua Sheet.

## Acceptance Criteria

- Quet nhieu o Report va bam Delete se xoa tat ca o da chon.
- Sheet nguon cua cac o do duoc cap nhat rong.
- Khi dang sua text trong o Report, Delete van xoa ky tu.
- `node --check work/v25_inline.js` PASS.
- Browser local test Delete/Backspace PASS.
