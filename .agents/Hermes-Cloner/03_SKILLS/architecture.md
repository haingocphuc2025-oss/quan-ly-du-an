# /architecture

## Purpose

Thiết kế kiến trúc.

## When to Use

Dùng khi workflow gọi skill này hoặc khi đầu vào cho thấy cần thực hiện đúng năng lực trên.

## Inputs

Spec, codebase.

## Outputs

`ARCHITECTURE.md`

## Required Plugins

Sequential Thinking, Context7.

## Workflow

1. Đọc input và tài liệu liên quan.
2. Không suy đoán nội dung có thể kiểm tra.
3. Thực hiện đúng phạm vi.
4. Ghi kết quả theo template tương ứng.
5. Đánh dấu `CẦN XÁC NHẬN` cho điểm chưa chắc chắn.
6. Báo blocker, bằng chứng và bước tiếp theo.

## Checklist

- [ ] Đã đọc context cần thiết.
- [ ] Không sửa ngoài phạm vi.
- [ ] Output tồn tại và phản ánh trạng thái thật.
- [ ] Có bằng chứng hoặc nguồn cho kết luận.
- [ ] Đã xác định điều kiện chuyển sang skill tiếp theo.

## Common Mistakes

- Làm trước khi đọc context.
- Tự thêm yêu cầu.
- Báo pass khi chưa chạy kiểm tra.
- Viết output quá chung chung, không thể giao cho agent khác.

## Example

`Dùng /architecture, tạo ARCHITECTURE.md, rồi dừng để workflow đánh giá bước tiếp theo.`
