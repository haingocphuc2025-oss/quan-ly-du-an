# VERIFY v25 - Persist column widths in project save

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Tao width mau cho Sheet va Report bang `saveColWidth`.
- `saveProjectDiskBackup()` ghi `uiState.colWidths` vao `/project`.
- Xoa localStorage width tam, apply snapshot, width duoc restore lai.
- File `qlda_project_backup.json` co `uiState.colWidths` va `projectColumnWidth`.

## Ky thuat

- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML v25 dong bo checksum: `240D079ECFFDBF459E83001E94EBC353EDC04725C2F6DD5E38DEA377473BC778`.
