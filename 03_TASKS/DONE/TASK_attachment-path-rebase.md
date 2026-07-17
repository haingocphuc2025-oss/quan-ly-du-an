# TASK - Attachment path rebase

- Nguồn yêu cầu: lỗi `File not found or outside local attachments folder` từ ảnh người dùng
- Trạng thái: DONE
- Owner: Codex
- Attempt: 1
- Max attempts: 5

## Mục tiêu

Sửa Local File Helper để mở được attachment sau khi dự án chuyển từ đường dẫn persisted cũ sang root hiện hành.

## File được phép sửa

- `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/local_file_helper.py`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/tests/test_local_file_helper.py`
- Hồ sơ spec/task/report liên quan.

## Acceptance criteria

Theo `01_SPEC/NEW/attachment-path-rebase/SPEC_001_attachment-path-rebase.md` revision 1.

## Test bắt buộc

- Python unit tests cho resolver: PASS 5/5.
- Python syntax/compile check: PASS.
- Regression ứng dụng hiện hành: PASS 35/35.
- Đường dẫn stale thực tế `E:\\...\\3.1 LIST.pdf` rebase tới root `G:\\...`: PASS.
- Helper health sau reload: PASS.

## Kết quả

Resolver ưu tiên file hợp lệ trong root hiện hành; chỉ rebase đường dẫn tuyệt đối cũ bằng basename tới file có thật trong root. Input rỗng, thư mục, file thiếu và malformed path đều bị từ chối.
