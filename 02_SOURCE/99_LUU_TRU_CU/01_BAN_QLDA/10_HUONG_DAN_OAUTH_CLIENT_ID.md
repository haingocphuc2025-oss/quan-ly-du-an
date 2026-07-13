# HƯỚNG DẪN TẠO OAUTH CLIENT ID — Google Cloud Console

**Mục đích:** Lấy Client ID cho SPEC `drive-api-backend`
**Thời gian:** ~10 phút
**Link:** https://console.cloud.google.com/apis/credentials

---

## Bước 1 — Chọn hoặc tạo Project

Góc trên trái → dropdown project → **New Project** → đặt tên → **Create**

---

## Bước 2 — Bật Google Drive API

**APIs & Services** → **Enable APIs** → tìm `Google Drive API` → **Enable**

---

## Bước 3 — Cấu hình OAuth Consent Screen

**OAuth consent screen** → chọn **External** → điền:
- App name: `DU AN WEB QUAN LY`
- User support email: email của anh
- Developer contact: email của anh

→ **Save and Continue** (bỏ qua các bước Scopes, Test users) → **Back to Dashboard**

---

## Bước 4 — Tạo Credentials

**Credentials** → **+ Create Credentials** → **OAuth Client ID**

---

## Bước 5 — Cấu hình

- Application type: **Web application**
- Name: `DU AN WEB QUAN LY`
- Authorized JavaScript origins → **+ Add URI**:
  - `http://localhost:8000` ← dev/test
  - `http://127.0.0.1:8000` ← nếu trình duyệt tự mở IP thay vì localhost
  - Domain thật khi deploy (thêm sau)
- Authorized redirect URIs → **+ Add URI** (bắt buộc — tránh kẹt "Đang chuyển hướng"):
  - `http://localhost:8000/giao-dien-desktop-don-gian_v20_quan.html`
  - `http://localhost:8000`

→ **Create**

---

## Bước 6 — Copy Client ID ← QUAN TRỌNG

Popup hiện ra → copy dòng **Your Client ID**

Dạng: `xxxxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com`

> ⚠️ **Client Secret không cần** — web app dùng Google Identity Services không cần secret.

---

## Bước 7 — Paste vào code

Mở `SPEC_MOI_DUYET/drive-api-backend/spec.md` → mục 3.1 → sửa dòng:

```javascript
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
```

→ thay bằng Client ID vừa copy → giao nhà thầu code.

---

## Lưu ý

- Client ID có thể dùng lại cho mọi môi trường (dev/prod) — chỉ cần thêm domain vào Authorized origins
- Khi deploy production: quay lại Credentials → edit → thêm domain thật vào Authorized JavaScript origins **và** redirect URIs
- Không commit Client ID lên GitHub public repo
- Chạy local bằng `python serve.py` trong thư mục STAGING (có header COOP cho OAuth), **không** dùng `file:///` hay `python -m http.server` thường nếu popup Google kẹt "Đang chuyển hướng"
