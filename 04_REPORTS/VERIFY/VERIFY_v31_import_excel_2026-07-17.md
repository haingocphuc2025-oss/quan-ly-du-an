# VERIFY V31 - IMPORT EXCEL MULTI-SHEET

Ngày kiểm tra: 17/07/2026  
Kết quả: **PASS**

## Kết quả tự động

| Nhóm | Kết quả |
|---|---|
| Regression Node | 59/59 PASS |
| Cú pháp 13 module JavaScript | PASS |
| Parse JavaScript trong single-file | PASS |
| Bảo toàn `USD:'$'` | PASS |
| Manifest có CSS/JS Import Excel | PASS |
| Artifact STAGING/VERSIONS/BANDIAO/FRONTEND/module | Đồng nhất từng byte |

## Browser smoke

| Luồng | Kết quả |
|---|---|
| Mở single-file V31 qua localhost | PASS |
| `qldaUiReady=1` | PASS |
| Grid và Import API khởi tạo | PASS |
| Mở `File → Import → Import from Excel` | PASS |
| Đọc workbook thử nghiệm 3 sheet | PASS |
| Hiện đủ tên 3 sheet trong selector | PASS |

Lỗi kết nối `127.0.0.1:8780/project` chỉ xuất hiện khi chạy web server kiểm tra mà không bật file helper. File `RUN_V31.bat` bật cả hai dịch vụ.
