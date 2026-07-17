# VERIFY - Attachment path rebase

Date: 2026-07-15
Status: PASS

## Root cause

Dữ liệu attachment còn lưu `localPath` và `localOpenUrl` trên ổ `E:`, trong khi dự án và các file hiện nằm dưới attachment root trên ổ `G:`. Helper cũ từ chối đúng theo boundary nhưng không phục hồi được đường dẫn sau khi thư mục dự án di chuyển.

## Fix

- Thêm `resolve_attachment_path`.
- Giữ nguyên đường dẫn hợp lệ trong root.
- Khi gặp đường dẫn tuyệt đối stale, chỉ rebase basename tới file có thật trực tiếp trong root hiện hành.
- Từ chối path tương đối, file thiếu, thư mục và malformed/NUL path.
- Endpoint `/open` tiếp tục trả lỗi cũ nếu resolver không tìm được file an toàn.

## Verification

- Unit tests: 5/5 PASS.
- Python compile: PASS.
- App regression: 35/35 PASS.
- Actual stale-path mapping for `3.1 LIST.pdf`: PASS.
- Helper restarted and `/health`: PASS.
- Review axes: correctness, readability, architecture, security, performance — APPROVE.

## Scope

Không sửa backup dữ liệu người dùng, không đổi tên/di chuyển file và không nới quyền mở file ngoài `_LOCAL_ATTACHMENTS`. Baseline HTML không đổi vì đây là patch của Local File Helper.
