# TRẠNG THÁI THI CÔNG

Cập nhật: 17/07/2026

| Mục | Giá trị |
|---|---|
| Baseline hiện hành | **v31** |
| Staging hiện hành | v31, đồng nhất với baseline |
| Baseline file | `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline.html` |
| SHA-256 | `E395AF236831E205114A1D4D1BC440863E282401E385AF11F0D2F6184073F504` |
| Baseline modules | `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/MODULES_V31/` |
| Spec đã triển khai | `import-excel-multi-sheet` |
| Spec NEW | 2 (`sheet-active-right-toolbar-rail`, `v60-glassmorphism-dashboard`) |
| Trạng thái | PHÁT HÀNH V31 |
| Kiểm thử | 59/59 PASS + browser smoke PASS |
| Rollback | `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v30_baseline.html` |

## V31 Changelog

- Import Excel nhiều sheet: chọn sheet, chọn dòng header, mapping cột, validation và báo cáo theo sheet.
- Bốn chế độ Append, Update, Upsert và Skip Duplicate.
- Loại `_rowIndex` và `_attachments` khỏi mapping; Update không ghi đè tệp đính kèm.
- Snapshot và Undo theo batch import.
- Sửa builder single-file làm hỏng JavaScript khi gặp chuỗi `$'`.
- Thêm test release integrity và bộ hồi quy V31.
