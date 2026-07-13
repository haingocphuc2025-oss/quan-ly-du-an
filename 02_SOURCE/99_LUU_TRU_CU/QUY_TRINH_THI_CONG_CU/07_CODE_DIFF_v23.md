# 📋 CODE DIFF — NHÀ THẦU THI CÔNG v22 → v23

**Phiên bản:** v22 → v23
**Ngày:** 08/07/2026

---

## 1. Tổng quan thay đổi

| Khoản mục | Giá trị |
|:-----------|:--------|
| File gốc | `STAGING/giao-dien-desktop-don-gian_v22_quan.html` (285 KB, OAuth redirect URL) |
| File mới | `STAGING/giao-dien-desktop-don-gian_v23_quan.html` (278 KB, Apps Script Web App) |
| Tính năng chính | **Apps Script Web App** — gộp UI vào Apps Script, deploy 1 URL, không cần OAuth |
| Deploy URL | `https://script.google.com/macros/s/AKfycbz0gNqKkLzp4xuVdW7BoaKuiIVltf9_AOrHml7vsLVxz7zxwT0r5hT1-ebMzUrpnnfW/exec` |

---

## 2. Files thay đổi

| File | Thay đổi |
|:-----|:---------|
| `STAGING/giao-dien-desktop-don-gian_v23_quan.html` | Sửa từ v22 — bỏ OAuth, dùng google.script.run |
| `apps-script/Code.gs` | Backend Apps Script đầy đủ (load/save JSON, upload/delete file, create sheet) |
| `apps-script/Index.html` | UI HTML cho Apps Script (tương tự v23 file) |
| `apps-script/appsscript.json` | Manifest Web App |
| `04_BAN_GIAO_CODE.md` | Thêm mục 7 — Apps Script Web App |

---

## 3. Chi tiết code thay đổi

### A. Bỏ OAuth redirect URL (v22 → v23)

| Xoá (v22) | Thay bằng (v23) |
|:----------|:----------------|
| `parseTokenFromHash()` | `initAuth()` đơn giản |
| `getAuthUrl()` + `signIn()` chuyển hướng | Không cần (Apps Script lo auth) |
| `driveTokenClient`, `driveAccessToken` | Không dùng |
| `sessionStorage` token cache | Không cần |
| GIS script `<script src="...gsi/client">` | Xoá |
| `CLIENT_ID`, `SCOPES`, `AUTH_REDIRECT_URI` | Xoá |

### B. Thay Drive REST API → google.script.run

| Hàm | Cũ (v22 - fetch Drive API) | Mới (v23 - google.script.run) |
|:----|:---------------------------|:------------------------------|
| `loadFromDrive()` | `fetch(.../app_data.json?alt=media)` | `google.script.run.loadAppData()` |
| `saveToDrive(data)` | `fetch PATCH /upload/drive/v3/files/...` | `google.script.run.saveAppData(data)` |
| `uploadFileToDrive()` | `fetch multipart /upload/drive/v3/files` | `google.script.run.uploadAttachment(...)` |
| `deleteAttachmentFile()` | `fetch Apps Script deleteAttachment` | `google.script.run.deleteAttachment(fileId)` |
| `createProjectSheet` | Gọi `WEBAPP_URL` POST | `google.script.run.createProjectSheet(...)` |

### C. Code.gs Backend mới (thêm các hàm)

| Hàm | Mô tả |
|:----|:------|
| `doGet(e)` | Serve `Index.html` nếu không có action, hoặc gọi API (`loadAppData`, `saveAppData`, etc.) |
| `loadAppData()` | Đọc `app_data.json` từ Drive folder `DU_AN_WEB_QUAN_LY` |
| `saveAppData(data)` | Ghi đè/đạo tạo `app_data.json` trên Drive |
| `uploadAttachment(projectName, sheetName, rowLabel, fileName, mimeType, base64Data)` | Tạo folder theo cấu trúc Project/Sheet/Row → upload file base64 → set sharing ANYONE_WITH_LINK |
| `deleteAttachment(fileId)` | Trash file trên Drive |
| `createProjectSheet(payload)` | Tạo Google Sheet thật, setup columns, tạo bound Apps Script cho attachment |
| `layDuLieuSheet`, `luuOSheet`, `luuDuLieuSheet`, `taiDuLieuSheet` | Giữ nguyên từ v20 (tương tác Google Sheet thật) |

### D. Index.html (Apps Script version)

- Xoá sign-in screen, OAuth code
- Thêm `var SHEET_FACTORY_WEB_APP_URL = ''` (để trống — dùng `google.script.run` thay vì fetch)
- `initAuth()` → `render(); loadFromDrive();` trực tiếp
- `loadFromDrive()`, `saveToDrive()` dùng `google.script.run.withSuccessHandler...`
- `uploadAttachmentViaGs()`, `deleteAttachmentFile()` dùng `google.script.run`
- Giữ nguyên toàn bộ UI: toolbar, sheet, attachment panel, demo data

### E. appsscript.json

```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": { "executeAs": "USER_DEPLOYING", "access": "MYSELF" },
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.projects",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

---

## 4. Lưu ý khi triển khai

| # | Lưu ý | Chi tiết |
|:---|:-------|:----------|
| 1 | **Deploy Apps Script** | Mở script.google.com → New project → Copy 3 file → Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone with Google account |
| 2 | **URL sau deploy** | Dạng `https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec` — gửi cho cả nhóm |
| 3 | **Quyền truy cập** | "Anyone with Google account" → 3 người click URL → đăng nhập Gmail → vào app |
| 4 | **Data persistence** | Data lưu trong `app_data.json` trên Drive folder `DU_AN_WEB_QUAN_LY` — reload URL vẫn còn data |
| 5 | **File attachment** | Upload qua `google.script.run.uploadAttachment` → lưu Drive theo cấu trúc Project/Sheet/Row/Dinh kem |
| 6 | **Không cần OAuth Client ID** | Apps Script tự xử lý auth bằng tài khoản user đang đăng nhập |
| 7 | **Sheet Factory (tạo Sheet thật)** | Giữ `createProjectSheet` trong Code.gs — gọi qua `google.script.run` |