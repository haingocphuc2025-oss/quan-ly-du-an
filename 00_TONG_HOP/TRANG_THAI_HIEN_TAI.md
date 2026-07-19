# TRẠNG THÁI THI CÔNG

Cập nhật: 20/07/2026

| Mục | Giá trị |
|---|---|
| Baseline hiện hành | **v32** |
| Staging hiện hành | v32, đồng nhất với baseline |
| Baseline file | `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v32_baseline.html` |
| SHA-256 | `DDAD4097079D300C7C37AF0F8F9F03705CF83C950F25DB1B51A92B1B7B912DF4` |
| Baseline modules | `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/MODULES_V32/` |
| Spec đã triển khai | `import-excel-preserve-sheet-template-v32` |
| Trạng thái | PHÁT HÀNH V32 |
| Kiểm thử | 71/71 PASS + browser full-flow/desktop/mobile PASS |
| Rollback | `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline.html` / tag `v31.3` |

## V32 Changelog

- Import Excel mặc định giữ nguyên header, cấu trúc và format Sheet hiện tại.
- Auto-map theo tên/alias; không fallback âm thầm theo vị trí.
- Luôn hiển thị bước mapping thủ công trước import.
- Cột Excel không mapping được bỏ qua và liệt kê trong báo cáo.
- Checkbox `Sao chép tiêu đề từ Excel` mặc định tắt, chỉ thay nhãn cột đã mapping.
- Undo batch khôi phục dữ liệu cùng cấu hình nhãn/type/format cột.
- Năm artifact V32 byte-identical, có launcher và rollback V31.3.
