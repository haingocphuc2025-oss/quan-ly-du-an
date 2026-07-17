# SPEC 001 - Report source chooser with Cancel and OK

- Revision: 1
- Date: 2026-07-15
- Status: DA_TRIEN_KHAI

## Mục tiêu

Khôi phục hộp chọn nguồn của Report và bổ sung hành vi xác nhận rõ ràng bằng nút Hủy và OK.

## Phạm vi

- Sửa lỗi runtime khi bấm nút Nguồn.
- Popover hiển thị danh sách Sheet theo dự án.
- Thay đổi checkbox chỉ nằm trong bản nháp.
- Hủy/đóng ngoài popover không cập nhật nguồn Report.
- OK áp dụng nguồn đã chọn và render lại Report.

## Ngoài phạm vi

- Không thay đổi cách Report tổng hợp, lọc, nhóm hoặc sắp xếp dữ liệu.
- Không thay đổi cấu trúc dữ liệu nguồn đã lưu.

## Acceptance criteria

1. Bấm Nguồn không phát sinh ReferenceError và mở được popover.
2. Popover có nút Hủy và OK, dùng thẻ button có accessible name.
3. Hủy đóng popover mà không sửa `config.sources`.
4. OK sao chép bản nháp vào `config.sources`, render và lưu trạng thái cục bộ.
5. Checkbox chọn dự án/Sheet không render Report trước khi bấm OK.
6. Regression hiện hành vẫn PASS.
