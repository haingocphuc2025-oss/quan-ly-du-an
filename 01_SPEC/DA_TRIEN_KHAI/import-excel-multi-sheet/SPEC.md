# SPEC - Import Excel nhiều Sheet

Trạng thái: DA_TRIEN_KHAI  
Baseline: v31  
Ngày phát hành: 17/07/2026

## Mục tiêu

Xây dựng chức năng Import Excel nhiều sheet vào Sheet hồ sơ hiện tại, hỗ
trợ xem trước, ánh xạ cột, kiểm tra dữ liệu và import an toàn.

## Phạm vi

- Hỗ trợ `.xlsx`, `.xls`
- Hỗ trợ một hoặc nhiều sheet
- Không hỗ trợ CSV, file có mật khẩu, macro VBA

------------------------------------------------------------------------

# 1. Quy tắc quan trọng

## Hai cột hệ thống phải loại trừ

Không được import vào:

1. **Cột số thứ tự dòng giao diện** (`_rowIndex`)
2. **Cột biểu tượng/Tệp đính kèm** (`_attachments`)

Hai cột này:

- Không xuất hiện trong màn hình ánh xạ.
- Không có trong danh sách cột importable.
- Không được ghi dữ liệu dù payload bị chỉnh sửa.
- Không bị ghi đè khi Update.
- Khi thêm dòng mới, `_attachments = []`.

> Cột **STT** vẫn là cột nghiệp vụ và được phép import.

------------------------------------------------------------------------

# 2. Quy trình Import

```
Chọn file
→ Đọc workbook
→ Hiển thị danh sách sheet
→ Chọn sheet
→ Chọn dòng tiêu đề
→ Xem trước dữ liệu
→ Ánh xạ cột
→ Kiểm tra dữ liệu
→ Chọn chế độ import
→ Xác nhận
→ Import
→ Báo cáo
```

------------------------------------------------------------------------

# 3. Chọn Sheet

Cho phép:

- Một sheet
- Nhiều sheet
- Tất cả sheet

Hai chế độ:

## Import từng sheet (khuyến nghị)

- Mapping riêng
- Validate riêng
- Báo cáo riêng

## Gộp các sheet cùng cấu trúc

Chỉ khi:

- Header giống nhau
- Cấu trúc giống nhau

------------------------------------------------------------------------

# 4. Mapping cột

Danh sách cột đích chỉ hiển thị các cột nghiệp vụ.

Không hiển thị:

- `_rowIndex`
- `_attachments`

Ví dụ:

```
Excel        Sheet
------------ --------------
STT          STT
Loại hồ sơ   Loại hồ sơ
Hạng mục     Hạng mục
Số VB        Số văn bản
Ngày VB      Ngày văn bản
Nội dung     Nội dung
```

------------------------------------------------------------------------

# 5. Chế độ Import

- Append
- Update
- Upsert
- Skip Duplicate

Update chỉ cập nhật cột nghiệp vụ.

------------------------------------------------------------------------

# 6. Validate

- Kiểm tra dữ liệu bắt buộc
- Kiểm tra kiểu dữ liệu
- Kiểm tra ngày tháng
- Bỏ dòng trống
- Kiểm tra khóa trùng

------------------------------------------------------------------------

# 7. Báo cáo

Theo từng sheet:

- Tổng dòng
- Thành công
- Cập nhật
- Bỏ qua
- Lỗi

Có thể tải danh sách lỗi.

------------------------------------------------------------------------

# 8. Data Model

```javascript
{
  id: "_attachments",
  isSystem: true,
  importable: false
}
```

```javascript
{
  id: "_rowIndex",
  isSystem: true,
  importable: false
}
```

Các cột hợp lệ:

```javascript
const importableColumns = columns.filter(c =>
    !c.isSystem &&
    c.importable !== false
);
```

------------------------------------------------------------------------

# 9. Bảo mật

- Không ghi vào cột hệ thống
- Không thực thi macro
- Không upload ra ngoài mặc định
- Không lưu file Excel vào Local Storage

------------------------------------------------------------------------

# 10. Acceptance Criteria

- Đọc được nhiều sheet
- Chọn nhiều sheet
- Mapping từng sheet
- Không hiển thị `_rowIndex`
- Không hiển thị `_attachments`
- Không ghi đè Attachment
- STT vẫn import bình thường
- Có Undo theo batch
- Có Progress
- Có báo cáo từng sheet

------------------------------------------------------------------------

# Kết luận

Luật quan trọng nhất:

```
Hai cột hệ thống (Row Index và Attachment)
không được phép tham gia quá trình Import
ở bất kỳ tầng nào của hệ thống.
```

Bảo vệ tại:

1. UI
2. Mapping
3. Payload
4. Backend
