# SPEC — Nghiệm thu v25 fixes

Ngày: 2026-07-13
Trạng thái: DA_TRIEN_KHAI

## Mục tiêu

Sửa các lỗi nghiệm thu nhỏ trên bản v25 sau kiểm thử browser.

## Phạm vi

- Hiển thị đúng nhãn phiên bản v25 trong sidebar.
- Loại bỏ log debug khi render danh sách dự án.
- Tránh lỗi console 404 favicon khi chạy local.
- Search trong sheet phải tô sáng các ô khớp và tự nhảy tới ô khớp đầu tiên.

## Ngoài phạm vi

- Không đổi quyền chia sẻ file Drive `ANYONE_WITH_LINK` nếu chưa có quyết định nghiệp vụ.
- Không tối ưu mobile vì desktop là chính.

## Acceptance Criteria

- Mở v25 local không còn console error favicon và không còn log debug render.
- Sidebar hiển thị `v25`.
- Nhập từ khóa trong `Tìm trong bảng...` làm các ô khớp được tô sáng, active cell nhảy tới ô khớp đầu tiên.
- VERSIONS, STAGING và BANDIAO có cùng checksum sau khi bàn giao.
