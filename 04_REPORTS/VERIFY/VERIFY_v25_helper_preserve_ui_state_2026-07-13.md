# VERIFY v25 - Helper preserve UI state on old tab save

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Restart `BANDIAO/local_file_helper.py` tren port `8780`.
- POST `/project` bang payload khong co `uiState`: backup van giu `uiState.colWidths`.
- POST `/project` bang payload co 1 width moi: helper merge vao width cu.
- Da xoa key test `__qa_merge_width__` khoi backup sau khi kiem.

## Ky thuat

- Helper `/health`: OK.
- 4 ban HTML v25 khong doi, checksum: `240D079ECFFDBF459E83001E94EBC353EDC04725C2F6DD5E38DEA377473BC778`.
