# BAN GIAO v24 - 2026-07-09

## Kiem tra sau sua

- Browser test localhost:8080 — 0 JS errors.
- Rail nav SVG icons: Trang chủ (home), Tìm (search), Dự án (sheet), Gần đây (clock), Yêu thích (star) — hiển thị đúng.
- Project list: icon SVG Sheet trắng trên nền xanh.
- Workspace view: sidebar trái hiển thị SVG Sheet/Folder/Report đúng màu SPEC.
- Attachment panel: slide-in/out, 3 tab, upload queue, file actions dropdown.
- File type icons (PDF, XLS, DOC, ZIP, JPG, TXT...) là SVG có màu riêng.
- Google Sheet card: SVG lưới xanh #107C41.
- Context/Layout menus: SVG icon 16px thay cho sm-type-icon CSS cũ.
- Columns buttons: SVG bảng tính + chữ "Cột".
- Search icons: SVG kính lúp.

## Noi dung ban giao

- File: `STAGING/giao-dien-desktop-don-gian_v24_quan.html` (398 KB)
- Chuc nang: giao dien quan ly ho so du an cap xa + attachment panel UI v2 + SVG icons Microsoft 365.
- Attachment panel: 3 tab (Row / Sheet / All), drop zone, upload queue, progress, Drive upload, xóa đồng bộ.
- Icons: Sheet #107C41, Folder #FFB900, Report #D83B01 — inline SVG.
- Baseline: `VERSIONS/v24_baseline.html`

---

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

---

## 7. Apps Script Web App (Deploy sản phẩm)

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 08/07/2026 |
| **Phiên bản** | v23 |
| **URL Deploy** | `https://script.google.com/macros/s/AKfycbz0gNqKkLzp4xuVdW7BoaKuiIVltf9_AOrHml7vsLVxz7zxwT0r5hT1-ebMzUrpnnfW/exec` |
| **File STAGING** | `STAGING/giao-dien-desktop-don-gian_v23_quan.html` (278 KB) |
| **1. SPEC Feature** | `drive-api-backend` — thực thi bằng Apps Script Web App thay vì OAuth browser |
| **2. Tóm tắt giải pháp** | Gộp toàn bộ UI vào Apps Script project. Deploy 1 lần → 1 URL. Cả nhóm click vào → đăng nhập Google → dùng app. Backend dùng `google.script.run` gọi Code.gs: `loadAppData`, `saveAppData`, `uploadAttachment`, `deleteAttachment`, `createProjectSheet`. Không cần OAuth Client ID, không cần Cloud Console. |
| **3. Phụ thuộc** | Apps Script project (Code.gs + Index.html + appsscript.json). Scopes: Drive, Sheets, Script.projects. |
| **4. Test case đề xuất** | TC1: Click URL → hiện UI; TC2: Tạo dự án → nhập tên → OK; TC3: Mở Sheet dữ liệu gốc → gõ ô → Enter; TC4: Toolbar Font/Size/B I U S/Wrap/Merge hoạt động; TC5: Click 📎 → panel slide-in → upload file → progress done; TC6: Xóa file → xóa trên Drive; TC7: Reload URL → data vẫn còn (lưu Drive JSON) |
| **5. Cam kết** | ✅ Deploy thành công. 0 JS errors. 1 URL cho cả nhóm 3 người. Sẵn sàng nghiệm thu. |

## Update attachment panel

- Bam vao o ghim chi mo panel `Attachments`, khong tu bat hop thoai chon file.
- Panel co tab `Row / Sheet / All`, banner dong dang chon, khu Actions/sort va nut `Attach Files to Row X`.
- File van upload theo folder/sheet dang mo, vi du `02_VAT_LIEU_CO_CQ`.

## Update docked attachments + upload path

- Panel `Attachments` da duoc dock vao layout man hinh ben phai; grid tu chua khoang trong, panel khong nam trong vung scroll cua bang.
- Bam ghim chi mo panel; nut upload nam trong panel.
- Duong upload moi:
  `DU_AN_WEB_QUAN_LY/<Ten du an>/<Folder ho so dang mo>/<file>`
- Da bo tang trung gian cu:
  `Dinh kem/<Sheet>/<Dong>`
- Backend tao san 5 folder ho so trong folder du an:
  `01_HOP_DONG_PHAP_LY`, `02_VAT_LIEU_CO_CQ`, `03_THI_CONG_NGHIEM_THU`, `04_THANH_TOAN_QUYET_TOAN`, `05_TONG_HOP_DOI_CHIEU`.



## Update Drive API direct upload

- Da them co che upload truc tiep bang Google Drive API sau khi cau hinh OAuth Client ID.
- File nho dung multipart upload; file tu 8 MB tro len dung resumable upload.
- Duong luu van theo folder du an: `DU_AN_WEB_QUAN_LY/<Ten du an>/<Folder ho so>/<file>`.
- Neu chua cau hinh OAuth hoac dang mo bang `file://`, app fallback ve upload Apps Script/base64.
- Huong dan cau hinh chi tiet: `10_DRIVE_API_DIRECT_UPLOAD.md`.

|---

## 8. Attachment Panel UI v2

| Mục | Nội dung |
|-----|----------|
| **Ngày bàn giao** | 09/07/2026 |
| **Phiên bản** | v24 |
| **File STAGING** | `STAGING/giao-dien-desktop-don-gian_v24_quan.html` (398 KB) |
| **File Baseline** | `VERSIONS/v24_baseline.html` |
| **1. SPEC Feature** | `attachment-panel-ui` — file: `01_BAN_QLDA/SPEC_MOI_DUYET/attachment-panel-ui/spec.md` (chính) + `spec_icon.md` (phụ) |
| **2. Tóm tắt giải pháp** | **Attachment Panel UI v2**: panel slide-in từ phải, 3 tab (Row / Sheet / All), drop zone (kéo thả), upload queue với progress (⏳→⬆→✅/❌), upload tuần tự qua Google Apps Script, file actions dropdown (Mở/Tải/Sao chép link/Xóa), xóa đồng bộ local+Drive. **SVG Icons**: thay thế toàn bộ emoji/Unicode/CSS-pseudo icons bằng inline SVG chất lượng cao — Sheet (#107C41), Folder (#FFB900), Report (#D83B01). File type icons (PDF, XLS, DOC, PPT, ZIP, JPG, TXT...) có màu sắc riêng biệt. Rail nav icons (home, search, projects, recents, favorites) dùng SVG stroke. |
| **3. Phụ thuộc** | Giữ nguyên Apps Script Web App backend như v23. SPEC spec_icon.md yêu cầu thiết kế theo Microsoft 365 color palette. |
| **4. Test case đề xuất** | ✅ Browser test localhost:8080 — 0 JS errors. 10 mục kiểm tra đều PASS (xem đầu tài liệu). |
| **5. Cam kết** | ✅ Code đúng SPEC. ✅ SVG render đúng mọi vị trí. ✅ Baseline đã lưu. Sẵn sàng nghiệm thu. |