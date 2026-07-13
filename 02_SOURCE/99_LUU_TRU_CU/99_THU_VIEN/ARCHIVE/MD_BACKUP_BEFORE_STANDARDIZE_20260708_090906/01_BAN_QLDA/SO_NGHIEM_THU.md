# 📋 SỔ NGHIỆM THU — BAN QLDA (Claude quản lý)

**Người nghiệm thu:** Claude
**Trách nhiệm:** Kiểm tra sản phẩm từ nhà thầu, đánh giá ✅ hoặc 🔄 yêu cầu sửa

---

## Sổ nghiệm thu tổng hợp

| # | Sản phẩm | Nhà thầu | Ngày nộp | File kiểm tra | Kết quả | Ghi chú |
|---|----------|----------|----------|---------------|---------|---------|
|| 1 | **v18 — 6 tính năng: Template, Duplicate, Column Vis, Cond Formatting, Symbols/Multi, Bulk Edit** | Quan đại gia | 07/07/2026 | `03_NHA_THAU_THI_CONG/STAGING/giao-dien-desktop-don-gian_v18_quan.html` | ✅ ĐẠT | Đã copy đè BASELINE. |
|| 2 | **v19 — 3 tính năng: Publish Report Builder, Column Types (format engine), Conditional Formatting + Saved Filter** | Quan | 07/07/2026 | `03_NHA_THAU_THI_CONG/STAGING/giao-dien-desktop-don-gian_v19_quan.html` | ✅ ĐẠT (có điều kiện) | 5.946 dòng, 0 lỗi, 192 hàm. Forms + Automation chưa code — để v19.5/v20. |

## Lịch sử đã nghiệm thu

| # | Sản phẩm | Nhà thầu | Ngày | Kết quả |
|---|----------|----------|------|---------|
| Cũ | Fix stray backtick v16 + Format Painter | Phuc (cũ) | 04/07/2026 | ✅ ĐẠT |
| Cũ | Import CSV v17 (lần 3) | Phuc (cũ) | 04/07/2026 | ✅ ĐẠT |
| Cũ | Format Painter lock mode v17 | Phuc (cũ) | 04/07/2026 | ✅ ĐẠT |

## Tiêu chí nghiệm thu

### Nhà thầu phụ (Phuc — nghiên cứu)
- ✅ Đủ 3 mục: Nguồn + Nội dung chính + Nhận xét
- ✅ Thông tin chính xác, có link dẫn
- ✅ Đánh giá rõ ràng: khả thi / không khả thi cho App QLDA

### Nhà thầu chính (Quan — code)
- ✅ vN + số dòng (bump version)
- ✅ Hàm/đoạn thêm/sửa — nêu cụ thể
- ✅ Test localhost:8000 — test case cụ thể
- ✅ Console sạch — không lỗi JS
- ✅ Cam kết phạm vi — không phá vỡ tính năng cũ
- ✅ File staging đúng đường dẫn `05_THI_CONG/STAGING/`
