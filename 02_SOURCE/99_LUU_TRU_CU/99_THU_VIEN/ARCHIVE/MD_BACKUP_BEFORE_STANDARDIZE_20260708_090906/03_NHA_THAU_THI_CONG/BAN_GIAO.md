# 📋 BIÊN BẢN BÀN GIAO — NHÀ THẦU THI CÔNG → BAN QLDA

**Phiên bản:** v21
**Ngày bàn giao:** 08/07/2026
**Quy tắc:** 5 mục bắt buộc. Thiếu 1 mục = không nhận bàn giao.

---

## 1. Tổng quan phiên bản

| Mục | Nội dung |
|-----|----------|
| **Phiên bản** | v21 |
| **File** | `STAGING/giao-dien-desktop-don-gian_v21_quan.html` |
| **Dung lượng** | 281 KB |
| **SPEC** | `01_BAN_QLDA/SPEC_MOI_DUYET/file-attachment/spec.md` |
| **3 tính năng** | Icon Fix + Excel 365 Toolbar + File Attachment |

---

## 2. Tóm tắt giải pháp

| Tính năng | Mô tả |
|:-----------|:------|
| **Icon Fix** | Sửa 58 lỗi double-encoding UTF-8 (☰, ←, →, ★, 🎨, 💾, 📂...) — giữ nguyên encoding gốc |
| **Excel 365 Toolbar** | Font picker (6 fonts: Inter→Courier New) + Size picker (12 sizes: 9→48) + Merge button. CSS flat style: #EDEBE9 hover, #DEECF9 active. Layout: Font▼ Size▼ │ B I U S A▼ 🪣 │ ... ║ Sort Filter Forms Publish Auto │ 32px▼ |
| **File Attachment** | Panel slide-in từ phải. Direct Drive upload (OAuth token — multipart REST API, không giới hạn size). Fallback base64 qua web app. Drag-drop + progress tracking. Xóa file đồng bộ trên Drive. |

---

## 3. Phụ thuộc

- Drive REST API (OAuth 2.0) — cần `WEBAPP_URL` đúng với Apps Script đã deploy
- Apps Script backend cần có `getAttachmentFolder()` + `deleteAttachmentFile()` — Code.gs phải cập nhật
- Baseline v20 (đã có Drive API wrapper)

---

## 4. Test case đề xuất

| # | Test case | Mô tả |
|---|-----------|-------|
| TC1 | Toolbar hiển thị | Font/Size pickers, B I U S, Merge, Wrap, Sort, Filter, Forms, Publish, Automation — đủ nút |
| TC2 | Font/Size thay đổi | Chọn font khác + size khác → áp lên ô đang chọn |
| TC3 | Formula bar | Click ô → A1 hiển thị, gõ fx → Enter |
| TC4 | Attachment panel | Click 📎 → panel slide-in từ phải |
| TC5 | Upload file | Bấm "Đính kèm file" → chọn file → upload lên Drive |
| TC6 | Drag-drop | Kéo file thả vào panel → upload |
| TC7 | Progress | File đang upload hiển thị "uploading" → "done" |
| TC8 | Drive REST API | Upload file >10MB — không base64, không giới hạn size |
| TC9 | Base64 fallback | Nếu OAuth fail → tự động fallback qua web app |
| TC10 | Xóa file | Remove file → xóa cả trên Drive |

---

## 5. Cam kết

✅ Đã code đúng SPEC_MOI_DUYET/file-attachment/spec.md — 3 tính năng đầy đủ.
✅ UTF-8 giữ nguyên, không re-encode.
✅ File sẵn sàng tại STAGING, chờ Giám sát nghiệm thu kiểm tra.

---

## 6. Drive API Backend

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 08/07/2026 |
| **Phiên bản** | v22 |
| **File** | `STAGING/giao-dien-desktop-don-gian_v22_quan.html` |
| **1. SPEC Feature** | `drive-api-backend` — file: `01_BAN_QLDA/SPEC_MOI_DUYET/drive-api-backend/spec.md` |
| **2. Tóm tắt giải pháp** | Thay thế Apps Script Web App backend bằng Drive REST API trực tiếp. Google Identity Services (GIS) 1-click Sign-In. Lưu data dạng `app_data.json` + project JSON files trên Drive. Token tự động refresh silent. |
| **3. Phụ thuộc** | OAuth Client ID từ Google Cloud Console, Drive REST API scopes, GIS library (`accounts.google.com/gsi/client`) |
| **4. Test case đề xuất** | TC1: Mở app → hiện Sign-in screen; TC2: Sign in → vào app, data load từ Drive; TC3: Nhập data → auto-save → reload → data còn; TC4: Save project → Drive có `app_data.json`; TC5: Token hết hạn → tự refresh silent; TC6: Cùng tài khoản trên máy khác → thấy data |
| **5. Cam kết** | ✅ Đã code đúng SPEC_MOI_DUYET/drive-api-backend/spec.md. 0 JS errors. Sẵn sàng nghiệm thu. |
