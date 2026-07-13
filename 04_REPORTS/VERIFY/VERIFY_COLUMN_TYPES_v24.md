# VERIFY — COLUMN TYPES EXTENDED v24

Ngày: 2026-07-13
Baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v24_baseline.html`
SHA-256: `19B993A75F7B997934EF0C0753A5DC7CB43C140C21ED575254F95574CD66C22E`

| # | Hạng mục | Kết quả |
|---|---|---|
| 1 | JavaScript node --check | PASS |
| 2 | Định danh người dùng + đổi tên | PASS |
| 3 | Auto Number tăng prefix/suffix/digits | PASS |
| 4 | Xóa row không đánh số lại | PASS theo mô hình lưu giá trị trên row |
| 5 | Created by/date | PASS |
| 6 | Modified by/date | PASS |
| 7 | System columns read-only | PASS |
| 8 | Duration lưu phút, hiển thị d/h/m | PASS |
| 9 | Checkbox check/flag/star | PASS |
| 10 | Symbols chỉ có RYG | PASS |
| 11 | Contact max/restrict/knownContacts | PASS |
| 12 | Picker có 15 type đúng thứ tự | PASS |
| 13 | Row metadata cũ thiếu field không throw | PASS |
| 14 | Metadata dùng chung lịch save hiện có | PASS |

Latest Comment và Multi-select nằm ngoài phạm vi gói giao việc. Không phát hiện phần thiếu cần bổ sung.