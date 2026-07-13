# 📋 CODE DIFF — NHÀ THẦU THI CÔNG v21 → v22

**Phiên bản:** v21 → v22
**Ngày:** 08/07/2026

---

## 1. Tổng quan thay đổi

| Khoản mục | Giá trị |
|:-----------|:--------|
| File gốc | `STAGING/giao-dien-desktop-don-gian_v21_quan.html` (281 KB) |
| File mới | `STAGING/giao-dien-desktop-don-gian_v22_quan.html` (284 KB) |
| Tính năng | **Drive API Backend** — thay thế Apps Script Web App backend |

---

## 2. Files thay đổi

| File | Thay đổi |
|:-----|:---------|
| `giao-dien-desktop-don-gian_v22_quan.html` | Sửa từ v21 — 1 file duy nhất (single HTML) |

---

## 3. Chi tiết code thay đổi

### A. Google Identity Services (thêm 1 dòng `<head>`)
```html
<script src="https://accounts.google.com/gsi/client" async></script>
```

### B. Biến cấu hình mới
```javascript
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';  // ← cần tạo OAuth Client ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const APP_FOLDER_NAME = 'DU_AN_WEB_QUAN_LY';
const DATA_FILE_NAME = 'app_data.json';
```

### C. Auth flow mới (Google Sign-In)

| Hàm | Mô tả |
|:----|:------|
| `initDriveAuth()` | Khởi tạo `google.accounts.oauth2.initTokenClient()` |
| `signIn()` | Gọi popup Google consent |
| `signInSilent()` | Refresh token silent (không popup) |
| `onSignedIn()` | Token OK → ẩn sign-in screen → init folder → load data |
| `initAuth()` | Tự động silent sign-in khi GIS sẵn sàng (có polling fallback 10s) |

### D. Drive REST API helpers

| Hàm | Mô tả |
|:----|:------|
| `driveRequest(url, method, body)` | Helper chung — GET/POST/DELETE Drive API, auto retry khi 401 |
| `findFileByName(name, parentId)` | Tìm file trên Drive theo tên |
| `getOrCreateFolder(name, parentId)` | Tìm hoặc tạo thư mục |
| `initAppFolder()` | Tạo cây thư mục: `DU_AN_WEB_QUAN_LY/projects/`, cache project file IDs |
| `saveJsonFile(fileId, content, fileName, parentId)` | Tạo mới hoặc update JSON file trên Drive (multipart upload) |
| `readJsonFile(fileId)` | Đọc JSON file từ Drive |

### E. Save/Load — thay Apps Script → Drive REST API

| Hàm | Cũ (v21) | Mới (v22) |
|:----|:---------|:----------|
| `loadFromDrive()` | `fetch(WEBAPP_URL + '?t=...')` → Apps Script | `readJsonFile(app_data.json)` → Drive REST API |
| `saveToDrive(data)` | `fetch(WEBAPP_URL, POST)` → Apps Script | `saveJsonFile(app_data.json)` → Drive REST API |
| `WEBAPP_URL` | Dùng cho save/load + attachment | **Chỉ giữ cho attachment fallback** |

### F. Xoá code cũ
- `initAuth()` stub (chỉ ẩn sign-in screen + render demo)
- `onSignedIn()` cũ (duplicate)
- `driveRequest()` cũ (duplicate — khác format)
- `requestDriveSignIn()` cũ (duplicate)

---

## 4. Lưu ý khi triển khai

| # | Lưu ý | Chi tiết |
|---|-------|----------|
| 1 | **OAuth Client ID** | Cần tạo tại Google Cloud Console: APIs & Services → Credentials → OAuth Client ID (Web application). Authorized JS origins: `http://localhost:8080` (dev) + domain thật (prod) |
| 2 | **Cập nhật CLIENT_ID** | Sửa `YOUR_CLIENT_ID.apps.googleusercontent.com` → ID thật |
| 3 | **App Scripts vẫn cần** | `WEBAPP_URL` giữ lại cho attachment upload fallback (`getAttachmentInfo`, `deleteAttachmentFile`) |
| 4 | **CORS** | Drive REST API hoạt động trực tiếp từ browser với OAuth token — không cần CORS config |
| 5 | **Token tự refresh** | Token hết hạn (1h) → `signInSilent()` tự refresh, user không bị logout |
