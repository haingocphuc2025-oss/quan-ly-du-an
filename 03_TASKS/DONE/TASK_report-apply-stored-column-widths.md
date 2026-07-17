# TASK - Report apply stored column widths

Ngay: 2026-07-13
Trang thai: DONE

## Viec can lam

- Sua `renderReportView()` doc width da luu.
- Dong bo 4 ban HTML.
- Test render/save/restore width Report.
- Cap nhat checksum va bao cao verify.

## Ket qua

- `renderReportView()` da dung `getStoredColWidth()` cho Report `<col>` va `<th>`.
- Repost grid save/restore width PASS.
- Report tam trong browser doc width da luu PASS.
- Runtime `_selectedRows` duoc normalize ve `Set` sau load backup.
