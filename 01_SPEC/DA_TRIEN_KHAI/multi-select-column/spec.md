# SPEC — Multi-select Column

> **TRẠNG THÁI CHÍNH THỨC:** ĐÃ TRIỂN KHAI  
> Vị trí thư mục là nguồn trạng thái chính thức. Các dòng “chưa duyệt”, đường dẫn cũ và baseline cũ bên dưới chỉ là lịch sử tại thời điểm soạn spec. Baseline hiện hành: **v25**.

## Mục tiêu

Cho phép cấu hình một cột Multi-select và chọn nhiều giá trị trong một ô.

## Phạm vi

- Thêm Multi-select vào Column Type picker.
- Cấu hình danh sách option theo từng cột.
- Picker checkbox cho phép chọn nhiều option.
- Lưu tương thích ngược dưới dạng chuỗi phân cách dấu phẩy.
- Render mỗi giá trị thành chip.

## Ngoài phạm vi

- Option chứa dấu phẩy.
- Tạo option mới trực tiếp trong cell picker.

## Acceptance criteria

1. Multi-select xuất hiện trong picker và có icon riêng.
2. Column settings lưu được options.
3. Chọn nhiều mục, Apply và mở lại giữ đúng selection.
4. Giá trị hiển thị dạng chip.
5. Sheet cũ không lỗi.
6. JavaScript syntax PASS.

## Test case

- Chọn A+C trong [A,B,C], lưu thành `A, C`, mở lại A và C được tick.
- Bỏ toàn bộ lựa chọn, ô trở thành rỗng.
- Đổi cột text cũ sang Multi-select không làm ứng dụng lỗi.