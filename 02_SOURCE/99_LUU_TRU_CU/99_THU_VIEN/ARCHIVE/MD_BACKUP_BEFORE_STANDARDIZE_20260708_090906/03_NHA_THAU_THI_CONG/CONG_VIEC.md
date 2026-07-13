# 📋 CÔNG VIỆC — NHÀ THẦU THI CÔNG (Codex/AI Code)

**Vai trò:** Code writer — thi công theo SPEC đã duyệt.
**KHÔNG nghiên cứu. KHÔNG đổi SPEC. Chỉ code đúng việc được giao.**

---

## 🔴 VIỆC ƯU TIÊN — v21

> ⚠️ **ĐỌC TRƯỚC:** Lấy file HTML **gốc từ nhà thầu** (staging v20), KHÔNG dùng file đã qua xử lý Ban QLDA (bị vỡ encoding).

| # | Tính năng | Ưu tiên | SPEC |
|---|-----------|---------|------|
| 1 | **Icon Fix + Excel Toolbar + File Attachment** | ✅ **v21 XONG** | `SPEC_MOI_DUYET/file-attachment/spec.md` |
| 2 | **Drive API Backend** (Google Sign-In + Drive REST API) | ✅ **v22 XONG** | `SPEC_MOI_DUYET/drive-api-backend/spec.md` |

## ✅ ĐÃ HOÀN THÀNH

| Version | Features | Trạng thái |
|---------|----------|------------|
| **v18** | Template, Duplicate, Column Visibility, CF, Symbols, Bulk Edit | ✅ ĐẠT |
| **v19** | Column Type Picker, Forms, Publish, Automation, Row Height, Clear Data, Copy/Paste, Keyboard, Auto-Save, Contact | ✅ ĐẠT |
| **v20** | Drive API wrapper, Apps Script backend | ✅ ĐẠT (encoding bị lỗi — fix trong v21) |
| **v21** | Icon Fix + Excel Toolbar + File Attachment (Drive Direct Upload) | ✅ ĐÃ NỘP STAGING |
| **v22** | Drive API Backend (Google Sign-In + Drive REST API) | ✅ ĐÃ NỘP STAGING |
| **v23** | 🔴 **ĐANG CHỜ** |

---

## 📋 QUY TRÌNH

1. Đọc SPEC tại `01_BAN_QLDA/SPEC_MOI_DUYET/<feature>/spec.md`
2. Lấy file **gốc** từ `STAGING/giao-dien-desktop-don-gian_v{base}_quan.html`
3. Code — giữ UTF-8
4. Cập nhật Code.gs → Deploy lại → URL mới (nếu cần Apps Script backend)
5. Test `localhost:8080` — Console 0 lỗi
6. Nộp `STAGING/giao-dien-desktop-don-gian_v{new}_quan.html` + `BAN_GIAO.md` (5 mục) + `CODE_DIFF.md` (4 mục)
