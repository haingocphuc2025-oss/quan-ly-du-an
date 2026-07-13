# 📋 CODE DIFF — NHÀ THẦU THI CÔNG v20 → v21

**Phiên bản:** v20 → v21
**Ngày:** 08/07/2026
**Quy tắc:** 4 mục bắt buộc.

---

## 1. Tổng quan thay đổi

| Khoản mục | Giá trị |
|:-----------|:--------|
| File gốc | `STAGING/giao-dien-desktop-don-gian_v20_quan.html` (276 KB) |
| File mới | `STAGING/giao-dien-desktop-don-gian_v21_quan.html` (281 KB) |
| Dòng code thêm | ~200 dòng (JS + CSS + HTML) |
| Dòng code sửa | ~60 dòng (Icon Fix — 58 double-encoding lỗi) |
| JS errors | 0 (đã verify console) |

---

## 2. Files thay đổi

| File | Thay đổi |
|:-----|:---------|
| `giao-dien-desktop-don-gian_v21_quan.html` | Sửa từ v20 — 1 file duy nhất (single HTML) |
| `BAN_GIAO.md` | Mới — biên bản bàn giao 5 mục |
| `CODE_DIFF.md` | Mới — file này |

---

## 3. Chi tiết code thay đổi

### A. Icon Fix (58 dòng — double-encoding UTF-8)
```
Trước:   Ã¢~Y → ☰,  Ã¢~Z → ★,  Ã¢~X → ←,  Ã¢~[ → →
Sau:     ☰, ★, ←, →, 🎨, 💾, 📂, 🔗, 🔑, 🗑, 🧹, 🖌, ✏️...
```
- Dùng Python script fix batch — không re-encode toàn file
- Giữ nguyên UTF-8 gốc

### B. CSS — Excel 365 Toolbar (thêm ~50 dòng)
```css
.toolbar-btn{height:26px;...background:#F3F2F1;border-radius:4px;}
.toolbar-btn:hover{background:#EDEBE9;}
.toolbar-btn.active,.toolbar-btn:active{background:#DEECF9;color:#1A73E8;}
.toolbar-select{height:26px;border:1px solid #D1D1D1;border-radius:4px;font:13px Segoe UI;}
.toolbar-sep{width:1px;height:20px;background:#E1DFDD;margin:0 4px;}
```

### C. HTML — Toolbar restructure (thêm ~30 dòng)
```
Thêm:    <select id="fontFamilyPicker"> (6 fonts)
         <select id="fontSizePicker"> (12 sizes: 9→48)
         <button id="ssMergeBtn">⊞ Merge
         <span class="toolbar-sep"> (5 separators)
Sắp xếp: Font▼ Size▼ │ B I U S A▼ 🪣 │ ⯇ ☰ ⯈ 🧹 🖌 │ ↩ Wrap ⊞ Merge │ ↕ Sort ▽ Filter 🎨 Format │ ▣ Forms 📫 Publish ⚡ Automation │ 32px▼
```

### D. JS — File Attachment Drive Upload (thêm ~80 dòng)
```javascript
// Direct Drive upload (OAuth token — no size limit)
async function getAttachmentInfo(projectName) { ... }
async function uploadFileToDrive(file, projectName, onProgress) { ... }
async function deleteAttachmentFile(fileId) { ... }
// Updated addAttachmentFiles — direct upload first, fallback base64
```
- `getAttachmentInfo()`: gọi Apps Script → trả về OAuth token + folderId
- `uploadFileToDrive()`: POST multipart lên Drive REST API `www.googleapis.com/upload/drive/v3/files`
- `deleteAttachmentFile()`: gọi Apps Script xóa file
- `addAttachmentFiles()`: ưu tiên direct upload → nếu lỗi thì fallback base64

---

## 4. Lưu ý khi triển khai

| # | Lưu ý | Chi tiết |
|---|-------|----------|
| 1 | **Apps Script backend** | Cần deploy lại Code.gs — đảm bảo có `getAttachmentFolder()` + `deleteAttachmentFile()` |
| 2 | **WEBAPP_URL** | Phải cập nhật URL sau khi deploy lại Apps Script |
| 3 | **OAuth scope** | Drive REST API cần scope: `https://www.googleapis.com/auth/drive.file` |
| 4 | **CORS** | Nếu dùng Drive REST API trực tiếp từ browser, cần CORS whitelist hoặc proxy qua Apps Script |
