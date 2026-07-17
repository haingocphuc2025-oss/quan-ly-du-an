# TASK - Helper preserve UI state on old tab save

Ngay: 2026-07-13
Trang thai: DONE

## Viec can lam

- Them ham merge `uiState` trong local helper.
- Goi merge truoc khi ghi `qlda_project_backup.json`.
- Restart helper dang chay.
- Test POST cu/partial width khong lam mat width da luu.

## Ket qua

- Helper da merge `uiState` tu backup cu khi payload khong co `uiState`.
- Payload co `uiState.colWidths` mot phan se merge voi width cu.
- Helper da restart, port `8780` dang chay code moi.
- Test POST tab cu/partial width PASS.
