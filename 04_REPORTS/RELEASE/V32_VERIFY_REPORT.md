# V32 VERIFY REPORT

Ngày nghiệm thu: 20/07/2026
Kết quả: PASS

## Bằng chứng tự động

| Hạng mục | Kết quả |
|---|---|
| JavaScript syntax (`import-excel.js`, `toolbar.js`) | PASS |
| Regression MODULES_V32 | 71/71 PASS |
| Bundle single-file parse | PASS |
| Năm artifact byte-identical | PASS |
| SHA-256 baseline | `DDAD4097079D300C7C37AF0F8F9F03705CF83C950F25DB1B51A92B1B7B912DF4` |
| Browser full import/report/Undo | PASS |
| Desktop 1365×900 | PASS |
| Mobile 320×800 | PASS |
| Artifact smoke | PASS |

## Acceptance Criteria

| AC | Xác nhận | Kết quả |
|---|---|---|
| AC1 | Mặc định không thay đổi header/cấu trúc Sheet | PASS |
| AC2 | Không tự mở rộng cột theo Excel | PASS |
| AC3 | Dữ liệu bắt đầu sau dòng header | PASS |
| AC4 | Auto-map theo tên/alias, không positional fallback | PASS |
| AC5 | Có mapping thủ công và chặn mapping trùng | PASS |
| AC6 | Cột không mapping bị bỏ qua và có báo cáo | PASS |
| AC7 | Checkbox sao chép tiêu đề mặc định tắt | PASS |
| AC8 | Khi bật chỉ đổi nhãn; Undo khôi phục toàn bộ | PASS |
| AC9 | Type/width/format/rule/attachment được giữ nguyên | PASS |
| AC10 | Regression V31.3 kế thừa + V32 đều PASS | PASS |
| AC11 | Browser và điều hướng bàn phím PASS | PASS |
| AC12 | Artifact/release note/verify/rollback đầy đủ | PASS |

## Browser checks đã lưu

- Mapping dialog có `role="dialog"`, `aria-modal="true"` và accessible name.
- Header `Số VB` tự map vào `Số văn bản`; cột ngoài mẫu mặc định `Bỏ qua`.
- Checkbox, mapping dropdown và nút xác nhận nằm trong thứ tự focus.
- Modal nằm trong viewport ở 1365×900 và 320×800; mapping xếp một cột ở mobile.
- Sau import: header id, column config, type, format và chiều dài dòng không đổi.
- Báo cáo liệt kê `Cột ngoài mẫu`; giá trị cột này không được ghi vào Sheet.
- Snapshot Undo có đủ before/after và nút Undo khôi phục toàn bộ trạng thái ban đầu.

Ảnh bằng chứng:

- `V32_BROWSER_MAPPING_DESKTOP.png`
- `V32_BROWSER_MAPPING_MOBILE.png`
- `V32_ARTIFACT_SMOKE.png`

## Lệnh tái kiểm tra

```powershell
node --check VERSIONS\MODULES_V32\js\import-excel.js
node --check VERSIONS\MODULES_V32\js\toolbar.js
node --test VERSIONS\MODULES_V32\tests\*.test.js
node build_v32.js
```
