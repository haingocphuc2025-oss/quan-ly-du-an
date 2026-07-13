# 📋 BIÊN BẢN BÀN GIAO — Tư vấn thiết kế → Ban QLDA

## 11. Repost with Carry-Forward

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 09/07/2026 |
| **1. SPEC Feature** | `repost-carry-forward` — file: `../02_TU_VAN_THIET_KE/SPEC_NEW/repost-carry-forward/spec.md` |
| **2. Tóm tắt giải pháp** | Nút "Repost with Carry-Forward" bổ sung cạnh nút Repost Date hiện có. Tự động phân loại cột: **Structure** (text/dropdown/contact → giữ), **Data** (number/checkbox/symbol → xóa), **Date** (reset hôm nay). 1 click thực thi, có dialog preview, có cấu hình nâng cao (toggle từng cột), snapshot undo, tooltip preview khi hover. |
| **3. Phụ thuộc** | SPEC_013 clear-data-repost-date (kế thừa code), SHEET_COLUMN_CONFIG (có sẵn), undo snapshot pattern (có sẵn từ clearActiveSheetData), code base v24. Không cần OAuth/API mới. |
| **4. Test case đề xuất** | (1) Repost basic: text giữ, number xóa, date reset; (2) Advanced config: đổi hành vi 1 cột, confirm đúng; (3) Undo: Ctrl+Z khôi phục; (4) Edge: sheet 100 rows + 20 columns, không lag; (5) Kết hợp Clear → Repost: sheet trống tạo row mẫu. |
| **5. Cam kết** | ✅ SPEC đầy đủ 20 test cases, code mẫu frontend + backend, tuân thủ stack HTML + Vanilla JS + Apps Script, sẵn sàng cho nhà thầu code v25. |
