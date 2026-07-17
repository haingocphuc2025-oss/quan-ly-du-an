# SPEC - Persist column widths in project save

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Luu trang thai dan/chinh do rong cot Sheet va Repost/Report vao file du an, khong chi luu tam trong localStorage cua trinh duyet.

## Pham vi

- Dua `qlda_colWidths_v1` vao snapshot save du an.
- Restore column widths khi load project backup.
- Khi keo cot xong, cap nhat snapshot local de nut Save ghi du trang thai.
- Khong doi logic du lieu o, report source, filter/group/sort.

## Acceptance Criteria

- Keo gian cot, bam Save, file `qlda_project_backup.json` co `uiState.colWidths`.
- Xoa localStorage width tam va apply snapshot thi width duoc restore.
- Sheet/Repost van render dung width da luu.
- `node --check work/v25_inline.js` PASS.
- 4 ban HTML v25 dong bo checksum `240D079ECFFDBF459E83001E94EBC353EDC04725C2F6DD5E38DEA377473BC778`.
