# SPEC 001 - Khôi phục đường dẫn attachment sau khi di chuyển thư mục dự án

- Revision: 1
- Date: 2026-07-15
- Status: DA_TRIEN_KHAI

## Mục tiêu

Cho phép Local File Helper mở attachment đã lưu khi thư mục dự án/Google Drive đổi ổ đĩa hoặc vị trí, mà không làm yếu ràng buộc attachment chỉ được mở bên trong `_LOCAL_ATTACHMENTS` hiện hành.

## Phạm vi

- Endpoint `GET /open` của `BANDIAO/local_file_helper.py`.
- Tự động thử lại file cùng tên trong `_LOCAL_ATTACHMENTS` hiện hành khi đường dẫn persisted cũ không còn hợp lệ.
- Kiểm thử hồi quy cho đường dẫn hợp lệ, đường dẫn cũ, file không tồn tại và giá trị không hợp lệ.

## Ngoài phạm vi

- Không di chuyển, xóa hoặc đổi tên attachment.
- Không sửa dữ liệu Drive hay file backup của người dùng.
- Không cho phép mở file tùy ý ngoài `_LOCAL_ATTACHMENTS`.

## Acceptance criteria

1. Đường dẫn tồn tại và nằm trong attachment root vẫn được mở như cũ.
2. Đường dẫn tuyệt đối cũ bên ngoài root được rebase bằng basename nếu file đó tồn tại trực tiếp trong attachment root hiện hành.
3. Không tìm thấy file tương ứng thì trả 404 hiện tại.
4. Giá trị rỗng, thư mục, và tên không hợp lệ không được chấp nhận.
5. Không thay đổi dữ liệu attachment persisted.

## Test case

- `resolve_attachment_path(current_file)` trả về file hiện hành.
- `resolve_attachment_path(old_drive/file.pdf)` trả về `ROOT/file.pdf` khi file tồn tại.
- File ngoài root không có basename tương ứng trả về `None`.
- Target rỗng/thư mục trả về `None`.
