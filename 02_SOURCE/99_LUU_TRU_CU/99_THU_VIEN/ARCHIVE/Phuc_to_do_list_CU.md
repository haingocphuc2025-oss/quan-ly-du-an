# PHUC — Danh sách việc NGHIÊN CỨU

**Vai trò mới (07/07/2026 theo yêu cầu Quân):** Tìm kiếm thông tin → Nghiên cứu → Tổng hợp → Nộp cho Claude duyệt.

**KHÔNG được code file app.** Chỉ làm việc nghiên cứu.

---

## 🔄 QUY TRÌNH LÀM VIỆC

1. **Nhận việc** từ Claude qua file này (mục "Việc đang giao" dưới đây)
2. **Nghiên cứu chủ đề** — tìm tài liệu chính thức, forum, source code tham khảo
3. **Nộp "Biên bản nghiên cứu" 3 mục**:
   - **Nguồn**: URL/file/document tham khảo
   - **Nội dung**: Tóm tắt thông tin tìm được (cô đọng, đúng trọng tâm)
   - **Nhận xét**: Ảnh hưởng cho dự án QLDA — có thể dùng được không, cần điều chỉnh gì, rủi ro gì
4. **Chờ Claude duyệt** info → Claude sẽ giao việc code cho quan đại gia

---

## Việc đang giao

| # | Chủ đề nghiên cứu | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | **Column Types – Symbols Column**: Smartsheet có Symbols Column không? Cách hoạt động? Có thể implement trong QLDA? | ⏳ **CHỜ GIAO** | Việc đầu tiên trong hàng đợi |
| 2 | **Column Types – Multi-select Dropdown**: Smartsheet hỗ trợ multi-select không? Giới hạn? Ảnh hưởng nhập liệu? | ⏳ **CHỜ** | Cần info chính xác trước khi code |
| 3 | **Conditional Formatting**: Rules engine, operators (lớn hơn, chứa, empty...), render giao diện, lưu trữ (Google Sheets conditional format rules?) | ⏳ **CHỜ** | Việc #1-2 xong |
| ... | (xem hàng đợi đầy đủ: `DIEU_PHOI.md` mục 2.1) | | |

---

## Hướng dẫn nghiên cứu

### Định dạng Biên bản nghiên cứu (điền vào mục "Biên bản nộp" bên dưới)

```markdown
### Biên bản nghiên cứu — [chủ đề]

| Mục | Nội dung |
|-----|----------|
| **Ngày** | dd/mm/2026 |
| **Nguồn** | URL / document / source tham khảo |
| **Nội dung** | Tóm tắt 3-5 ý chính |
| **Nhận xét cho QLDA** | ✅ Có thể dùng được / ⚠️ Cần điều chỉnh / ❌ Không phù hợp |
```

### Công cụ
- Web search (tài liệu Smartsheet chính thức, forum)
- Đọc file spec có sẵn (`Planning.md`, `specs/test-kit/`, ...)
- Đọc code hiện tại (`giao-dien-desktop-don-gian_2.html`) để hiện trạng
- Ghi chú kỹ thuật chi tiết để Claude/quan đại gia dựa vào đó code

---

## Biên bản nộp

*(Phuc điền vào đây sau mỗi lần nghiên cứu xong)*
