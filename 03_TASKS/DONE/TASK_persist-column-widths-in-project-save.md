# TASK - Persist column widths in project save

Ngay: 2026-07-13
Trang thai: DONE

## Viec can lam

- Them helper doc/ghi column width store an toan.
- Them `uiState.colWidths` vao project snapshot.
- Restore `uiState.colWidths` khi load backup.
- Luu local snapshot sau khi mouseup resize cot.
- Dong bo 4 ban HTML va test browser.

## Ket qua

- `buildProjectSaveSnapshot()` da co `uiState.colWidths`.
- `applyProjectSnapshot()` va local backup restore lai column widths.
- `saveColWidth()` cap nhat local snapshot ngay sau khi keo cot.
- Browser test save/restore width PASS.
