# PROMPT_CODEX — Giao việc: Column Types mở rộng (theo SPEC_010)

## Vai trò
Bạn là nhà thầu lập trình. Ban QLDA giao việc theo gói. Chỉ làm đúng phạm vi SPEC_010, không tự mở rộng.

## Hồ sơ đầu vào (đọc theo thứ tự)
1. `giao-dien-desktop-don-gian_v23_quan.html` — baseline v23 (9403 dòng), MỌI thay đổi ghép vào file này
2. `SPEC_010_column-types-moi_1.md` — spec chính thức, đầy đủ code đề xuất ở §6.2. Đây là nguồn duy nhất, làm đúng theo nó.

## Ràng buộc cứng
- HTML + Vanilla JS + Apps Script; KHÔNG React/TypeScript/thư viện ngoài/CDN
- KHÔNG Gantt, KHÔNG tính năng % tiến độ
- KHÔNG đổi các tính năng đang chạy của v23 ngoài phạm vi column types
- Bám đúng convention v23: field đặc thù để phẳng trên `colConfig` (không lồng `options` phụ), theo §4 của SPEC_010
- Target: v24

## Phạm vi (14 FR trong SPEC_010)
FR-00 định danh người dùng nhẹ · FR-01 Duration · FR-02 Auto Number · FR-03/04 Created by/date · FR-05/06 Modified by/date · FR-07 cập nhật picker · FR-08 khoá edit read-only · FR-09 Formatters+icon · FR-10/11/12 Contact list cấu hình · FR-13 Checkbox style · FR-14 Symbols RYG

## Ngoài phạm vi (KHÔNG làm)
- Latest Comment (hoãn — chờ tính năng Comment per-row, xem §1.3 SPEC_010)
- Multi-select (chưa có trong picker, không thuộc SPEC này)

## 4 câu hỏi mở trong SPEC_010 — dùng đề xuất mặc định, trừ khi Ban QLDA đổi
1. Auto Number khi xoá/sắp xếp row → GIỮ NGUYÊN số (mã hồ sơ cố định)
2. Duration → chỉ nhập số dương
3. Latest Comment → hoãn
4. Contact "Restrict to list" → giữ dữ liệu ad-hoc cũ, chỉ chặn nhập thêm

## Sản phẩm giao nộp
`CODE_DIFF.md` — chỉ phần thay đổi + mô tả 1 dòng/khối, kèm bảng checklist dưới đã điền.

## CHECKLIST NGHIỆM THU (lấy từ §6.3 SPEC_010 + bổ sung) — điền XONG / CHƯA + lý do
| # | Hạng mục | Tiêu chí đạt | Kết quả |
|---|---|---|---|
| 1 | `node --check` cú pháp `<script>` | Pass | |
| 2 | FR-00 định danh | Popup hỏi tên lần đầu, lưu localStorage, đổi tên được | |
| 3 | FR-02 Auto Number tăng số | Thêm dòng → số tăng đúng prefix/suffix/digits | |
| 4 | FR-02 xoá row giữa | Row còn lại KHÔNG bị đánh số lại (NFR-03) | |
| 5 | FR-03/04 Created by/date | Row mới hiện tên+thời gian; row cũ hiện "—", không lỗi | |
| 6 | FR-05/06 Modified by/date | Sửa cell → cập nhật ngay | |
| 7 | FR-08 khoá read-only | Double-click 5 cột hệ thống KHÔNG mở editor | |
| 8 | FR-01 Duration | Popover ngày/giờ, lưu số phút, hiện "2d 4h" | |
| 9 | FR-13 Checkbox style | Đổi ✓/🚩/⭐ → cell hiện đúng icon | |
| 10 | FR-14 Symbols RYG | Chỉ 1 bộ RYG, không có 8 bộ khác | |
| 11 | FR-10/11/12 Contact | Cấu hình maxContacts/restrictToList/knownContacts; cột cũ vẫn chạy | |
| 12 | FR-07 picker thứ tự | 15 type đúng thứ tự Smartsheet §1.2 | |
| 13 | NFR-01 tương thích ngược | Sheet cũ (chưa có rowMeta.createdBy) load không throw | |
| 14 | NFR-02 không tăng save | Modified by/date cập nhật cùng scheduleCellSave hiện có | |

## Khi vướng
Không tự quyết ngoài spec — ghi mục "CÂU HỎI" cuối CODE_DIFF.md, Ban QLDA trả lời vòng sau.
