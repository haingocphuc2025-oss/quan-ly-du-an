# Kế hoạch triển khai V32

Mục tiêu: nâng V31.3 lên V32 với chế độ import Excel mặc định giữ nguyên cấu trúc và định dạng Sheet đích.

## Pha 1 — Khóa baseline và test đỏ

- Sao chép `MODULES_V31` thành `MODULES_V32` và tạo builder V32.
- Viết regression test cho hợp đồng giữ mẫu Sheet.
- Xác nhận test V32 thất bại trên logic V31.3 hiện tại.

## Pha 2 — Logic import giữ mẫu

- Ánh xạ cột theo tên đã chuẩn hóa/alias; không fallback âm thầm theo vị trí.
- Không tự thêm, xóa, đổi thứ tự, đổi kiểu, đổi độ rộng hoặc ghi đè header Sheet.
- Bỏ qua cột Excel chưa ánh xạ và đưa vào báo cáo.
- Giữ nguyên Append, Update, Upsert, Skip, validation, tiến độ và undo.

## Pha 3 — UI và tùy chọn header

- Mở bước ánh xạ sau khi chọn dòng tiêu đề.
- Thêm tùy chọn `Sao chép tiêu đề từ Excel`, mặc định tắt.
- Khi bật, chỉ đổi nhãn cột nghiệp vụ đã ánh xạ; không đổi id/type/width/style/order.

## Pha 4 — Đóng gói và nghiệm thu

- Build/sync artifact V32 và launcher liên quan.
- Chạy toàn bộ regression cùng browser acceptance (chuột + bàn phím).
- Cập nhật release notes, trạng thái dự án và task; commit/tag V32.

## Rủi ro cần kiểm soát

- Header trùng hoặc alias mơ hồ phải để người dùng chọn thủ công.
- Nhiều Sheet Excel phải giữ mapping độc lập.
- Sao chép header phải nằm trong cùng undo snapshot của lần import.
- Không làm thay đổi hành vi hoặc artifact V31.3.
