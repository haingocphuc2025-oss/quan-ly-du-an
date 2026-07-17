# SPEC - Report apply stored column widths

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Sau khi dan/chinh do rong cot trong Repost/Report va Save, mo lai Report phai ap dung dung do rong da luu.

## Pham vi

- Sua `renderReportView()` de dung `getStoredColWidth()` cho cot Report.
- Ap dung dong bo cho table width, `<col>` va `<th>`.
- Khong doi key luu width hien co: `report:<projectIndex>:<folderIndex>:c<colIndex>`.

## Acceptance Criteria

- Doi width cot Report, render lai Report van giu width moi.
- Save/load backup co `uiState.colWidths` va Report doc lai width do.
- `node --check work/v25_inline.js` PASS.
- 4 ban HTML v25 dong bo checksum `EC7A477ED757F8397EAF734E90F889AC0221F6493D896EDB84ED500515212172`.
