# Staging — nơi AI code nộp bản candidate để Claude nghiệm thu

Quy tắc (xem `HUONG_DAN.md` mục NGHIỆM THU): AI code không cùng máy với Admin C: (không mở được `localhost:8000` của Claude/Quân) thì copy file app đã sửa vào đây, đặt tên:

```
staging/<tên-AI>_<vN>_candidate.html
```

Ví dụ: `staging/phuc_v17_candidate.html`, `staging/quandaigia_v17_candidate.html`.

**KHÔNG ghi đè `giao-dien-desktop-don-gian_2.html` (file app chính) trên G:** — chỉ Claude mới đồng bộ vào đó, và chỉ sau khi nghiệm thu ✅.

Sau khi nghiệm thu xong (đạt hoặc trả lại), Claude sẽ dọn file candidate cũ khỏi đây.
