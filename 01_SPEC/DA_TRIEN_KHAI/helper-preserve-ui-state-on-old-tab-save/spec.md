# SPEC - Helper preserve UI state on old tab save

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Khong de tab cu chua refresh ghi de mat trang thai UI da luu, dac biet la do rong cot Sheet/Repost.

## Pham vi

- Ap dung cho `BANDIAO/local_file_helper.py` endpoint `POST /project`.
- Khi payload khong co `uiState`, giu lai `uiState` dang co trong `qlda_project_backup.json`.
- Khi payload co `uiState.colWidths` mot phan, merge voi width cu va uu tien gia tri moi.
- Khong doi du lieu projects/folders.

## Acceptance Criteria

- POST `/project` khong co `uiState` khong lam mat `uiState.colWidths` cu.
- POST `/project` co width moi se merge vao width cu.
- Helper `/health` OK sau khi restart.
- 4 ban HTML v25 giu checksum `240D079ECFFDBF459E83001E94EBC353EDC04725C2F6DD5E38DEA377473BC778`.
