# SPEC — Report view (màn tổng hợp: nguồn + cột + lọc + nhóm + tóm tắt)

> **TRẠNG THÁI CHÍNH THỨC:** ĐÃ TRIỂN KHAI  
> Vị trí thư mục là nguồn trạng thái chính thức. Các dòng “chưa duyệt”, đường dẫn cũ và baseline cũ bên dưới chỉ là lịch sử tại thời điểm soạn spec. Baseline hiện hành: **v25**.

> Trạng thái: NEW — chờ duyệt. Thay thế report-configuration (đã bị từ chối, viết lại từ đầu).
> Nguồn khảo sát: report "0.1 Danh sách phát hành bản vẽ" của Smartsheet (khảo sát DOM 11/07/2026).
> Baseline: giao-dien-desktop-don-gian_v23_quan.html. Target: v24+ (làm sau attachment-panel-ui).
> Stack: HTML + Vanilla JS + Apps Script + Drive JSON. KHÔNG React/thư viện ngoài. KHÔNG Gantt/% tiến độ.

## 1. Mục tiêu
Thêm loại màn hình "Report" — tổng hợp hàng từ 1+ sheet nguồn theo bộ lọc, rồi nhóm/tóm tắt để xem. Khác Grid (nhập liệu 1 sheet), Report là màn tổng hợp read-mostly; sửa ô ghi ngược về sheet gốc.

## 2. Ngoài phạm vi
- Không Gantt, không % tiến độ tự động.
- Không tự tạo sheet nguồn — chỉ đọc sheet đã có.
- "Tô thay đổi" (highlight) để phase sau (cần cột MODIFIED_* của column-types).

## 3. Mô hình dữ liệu (JSON định nghĩa report — KHÔNG chứa dữ liệu)
```json
{
  "id": "rpt001",
  "name": "0.1 Danh sách phát hành bản vẽ",
  "sources": ["sheetId_A"],
  "columns": ["primary","noidung","banhanh","ngay"],
  "filter": { "logic": "AND", "rules": [ { "col":"banhanh", "op":"in", "value":["FTC","IFC","IFA"] } ] },
  "group": [ { "col":"banhanh", "collapsed": false } ],
  "summarize": [ { "col":"__count__", "fn":"count" }, { "col":"ngay", "fn":"max" } ],
  "sort": [ { "col":"ngay", "dir":"asc" } ]
}
```
Report đọc dữ liệu từ sheet nguồn khi mở, áp định nghĩa này rồi render.

## 4. Toolbar Report — 8 chức năng (khảo sát DOM)
| # | Nút | Chức năng | Ưu tiên |
|---|---|---|---|
| 1 | Chế độ xem (Lưới) | Hiển thị dạng bảng | P1 |
| 2 | Sheet nguồn | Popup checkbox chọn (các) sheet cấp dữ liệu | P1 |
| 3 | Cột | Popup checkbox chọn cột nào của nguồn được hiện | P1 |
| 4 | Điều kiện lọc | Builder nhiều dòng rule (cột/phép so/giá trị) + AND/OR; op: =, ≠, chứa, in, khoảng ngày | P2 |
| 5 | Nhóm | Nhiều dòng nhóm (đa cấp) + thu/mở từng nhóm | P1 |
| 6 | Tóm tắt | Nhiều dòng: chọn cột + hàm (count/sum/avg/min/max) | P2 |
| 7 | Sắp xếp | 1+ tiêu chí, theo kiểu dữ liệu (DATE theo ISO, số theo number) | P1 |
| 8 | Tô thay đổi | Highlight hàng đổi trong X ngày | P3 (phase sau) |

## 5. Nhóm (Group)
- Popup "Nhóm theo": mỗi dòng chọn 1 cột; Thêm/Xóa dòng → đa cấp.
- Thu tất cả / Mở tất cả; từng nhóm có mũi tên thu/mở riêng (lưu `collapsed`).
- Render: hàng nhóm nền tím nhạt, in đậm, đếm số hàng con "(n)". Cấp 2 thụt lề.

## 6. Tóm tắt (Summarize)
- Popup: mỗi dòng chọn cột + hàm; Thêm/Xóa dòng.
- Hàm: count, sum, avg, min, max (max/min dùng cho ngày: muộn/sớm nhất).
- Render: 1 hàng tóm tắt cuối mỗi nhóm; không nhóm thì 1 hàng ở chân bảng.

## 7. Ghi ngược sheet nguồn
- Sửa ô → xác định hàng gốc (sheetId + rowId lưu ẩn mỗi hàng) → ghi về đúng ô qua google.script.run.
- Cột không thuộc nguồn: read-only. Banner vàng nhắc "sửa sẽ ghi ngược về sheet gốc".

## 8. Tiêu chí chấp nhận
- Tạo report từ 1 sheet nguồn, chọn tập cột → hiện đúng dữ liệu.
- Nhóm theo 1 cột → hàng gom nhóm, thu/mở được, đếm đúng số con.
- Tóm tắt count + max ngày → hiện đúng ở mỗi nhóm.
- Sắp xếp theo ngày → đúng thứ tự thời gian (không sort chuỗi).
- Sửa 1 ô trong report → sheet nguồn cập nhật đúng ô đó.
- Lưu định nghĩa report vào JSON, mở lại không mất cấu hình.

## 9. Test case
1. Happy: report 4 cột, nhóm theo "Ban hành cho", tóm tắt count → 3 nhóm FTC/IFC/IFA đếm đúng.
2. Lọc: rule banhanh in [FTC] → chỉ hiện hàng FTC.
3. Sắp xếp ngày dạng dd/mm/yyyy → đúng theo ISO, không theo chuỗi.
4. Biên: sheet nguồn rỗng → hiện "không có dữ liệu", không lỗi.
5. Lỗi: sửa ô khi mất mạng → báo lỗi lưu, không mất dữ liệu đang xem.
6. Ghi ngược: sửa "Nội dung" hàng 3 → mở sheet gốc thấy đúng ô đã đổi.

## 10. Phụ thuộc
- column-types (đã triển khai) — để render đúng loại cột nguồn.
- Cơ chế đọc/ghi sheet qua google.script.run (drive-api-backend, đã triển khai).
- "Tô thay đổi" phụ thuộc MODIFIED_* trong SPEC_010 (chưa giao) — tách phase sau.

## 11. Baseline & output
Baseline v23. Thêm màn Report tách riêng khỏi Grid. Output: v24+ sau attachment-panel-ui. Giao nộp: CODE_DIFF.md + checklist §8/§9.
