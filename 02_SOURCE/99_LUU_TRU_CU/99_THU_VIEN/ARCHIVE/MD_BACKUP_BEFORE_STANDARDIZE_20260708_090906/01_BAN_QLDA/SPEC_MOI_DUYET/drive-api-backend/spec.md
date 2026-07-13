# SPEC: Drive API Backend (Nền tảng lưu trữ)

**Ngày:** 07/07/2026
**Người viết:** Ban QLDA (Claude) — thay mặt Tư vấn thiết kế
**Trạng thái:** 🔴 Chưa duyệt — lưu tại SPEC_NEW/, chờ Ban QLDA duyệt
**Ưu tiên:** 🔴 CAO NHẤT — SPEC nền, tất cả SPEC khác phụ thuộc

---

## 1. MỤC TIÊU

Thay thế toàn bộ Apps Script Web App backend bằng **Google Drive REST API trực tiếp từ browser**.

**Vấn đề hiện tại:**
- Apps Script cold start: 2-4 giây mỗi lần save/load
- Deploy Web App phức tạp, OAuth lằng nhằng
- User phải đăng nhập nhiều bước

**Giải pháp:**
- Browser gọi Drive REST API thẳng — không qua Apps Script
- Auth: Google Sign-In 1 click (Google Identity Services)
- Data: JSON file trên Drive (~300ms save/load)
- Tương lai: đổi sang bất kỳ DB nào vì data là JSON chuẩn

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Kiến trúc mới

```
TRƯỚC:  Browser → Apps Script Web App → Google Sheets
SAU:    Browser → Google Drive REST API → Drive JSON files
```

### 2.2 Cấu trúc file trên Drive

```
My Drive/
└── DU_AN_WEB_QUAN_LY/          ← Thư mục gốc app
    ├── app_config.json          ← Cấu hình app (danh sách dự án)
    └── projects/
        ├── {projectId}.json     ← Data từng dự án
        └── {projectId}.json
```

### 2.3 Cấu trúc JSON mỗi dự án

```json
{
  "projectId": "proj_abc123",
  "name": "Tên dự án",
  "createdAt": "2026-07-07T00:00:00Z",
  "updatedAt": "2026-07-07T00:00:00Z",
  "sheets": [
    {
      "sheetId": "sheet_001",
      "name": "Sheet 1",
      "columns": [...],
      "rows": [...]
    }
  ]
}
```

### 2.4 Auth flow

```
1. App load → kiểm tra token trong memory
2. Không có token → hiện nút "Sign in with Google"
3. User click → Google popup → chọn tài khoản → Done
4. Nhận access_token → lưu vào JS variable (không lưu localStorage)
5. Token hết hạn (1h) → tự động refresh silent
```

---

## 3. API & BACKEND (Drive REST API)

### 3.1 Khởi tạo Google Sign-In

```html
<!-- Thêm vào <head> -->
<script src="https://accounts.google.com/gsi/client" async></script>
```

```javascript
const CLIENT_ID = '1053895269686-6m3sqmr8n7f9kl27voblvr6p9628smip.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let accessToken = null;
let tokenClient = null;

function initAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      accessToken = response.access_token;
      onSignedIn();
    }
  });
}

function signIn() {
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

function signInSilent() {
  tokenClient.requestAccessToken({ prompt: '' }); // silent refresh
}
```

### 3.2 Tìm hoặc tạo thư mục gốc

```javascript
async function getOrCreateAppFolder() {
  // Tìm thư mục đã có
  const res = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=name='DU_AN_WEB_QUAN_LY' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`
  );
  if (res.files.length > 0) return res.files[0].id;

  // Tạo mới nếu chưa có
  const folder = await driveRequest(
    'https://www.googleapis.com/drive/v3/files',
    'POST',
    { name: 'DU_AN_WEB_QUAN_LY', mimeType: 'application/vnd.google-apps.folder' }
  );
  return folder.id;
}
```

### 3.3 Save data (create hoặc update)

```javascript
async function saveProject(projectId, data) {
  const content = JSON.stringify(data);
  const fileId = projectFileMap[projectId]; // cache fileId

  if (fileId) {
    // Update existing
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: content
    });
  } else {
    // Create new
    const meta = { name: projectId + '.json', parents: [projectsFolderId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + accessToken },
      body: form
    });
    const file = await res.json();
    projectFileMap[projectId] = file.id; // cache
  }
}
```

### 3.4 Load data

```javascript
async function loadProject(fileId) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { 'Authorization': 'Bearer ' + accessToken } }
  );
  return await res.json();
}
```

### 3.5 List projects

```javascript
async function listProjects(folderId) {
  const res = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,modifiedTime)`
  );
  return res.files;
}
```

### 3.6 Helper chung

```javascript
async function driveRequest(url, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  // Token hết hạn → refresh
  if (res.status === 401) {
    await signInSilent();
    return driveRequest(url, method, body); // retry
  }
  return res.json();
}
```

---

## 4. GIAO DIỆN

### 4.1 Màn hình chưa đăng nhập

```html
<div id="signInScreen" style="display:flex; align-items:center; justify-content:center; height:100vh">
  <div style="text-align:center">
    <h2>DU AN WEB QUAN LY</h2>
    <p>Đăng nhập để tiếp tục</p>
    <button id="signInBtn" onclick="signIn()">
      🔑 Sign in with Google
    </button>
  </div>
</div>
```

### 4.2 Trạng thái save (UI feedback)

```javascript
function showSaveStatus(status) {
  // status: 'saving' | 'saved' | 'error'
  const el = document.getElementById('saveStatus');
  const map = {
    saving: '⏳ Đang lưu...',
    saved:  '✅ Đã lưu',
    error:  '❌ Lỗi lưu'
  };
  el.textContent = map[status];
}
```

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|-----------|---------|
| 1 | Mở app lần đầu | Hiện màn hình Sign in |
| 2 | Click Sign in với Gmail | Popup Google → chọn tài khoản → vào app |
| 3 | Nhập data → thoát tab | Auto-save, mở lại vẫn còn data |
| 4 | Save 1 dự án | Drive có file `{projectId}.json`, size > 0 |
| 5 | Load lại trang | Data hiển thị đúng như trước khi reload |
| 6 | Token hết hạn (1h) | Tự refresh silent, user không bị logout |
| 7 | Mở trên máy khác cùng tài khoản | Thấy đúng data |
| 8 | Save 10 lần liên tiếp | Không tạo 10 file mới — update đúng 1 file |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC đầy đủ, đủ code mẫu để implement
- ✅ Không cần Apps Script Web App — xóa `doPost/doGet` cũ
- ✅ Không cần deploy — chỉ cần Google Cloud Console tạo OAuth Client ID
- ✅ Tất cả SPEC khác giữ nguyên Section 1/2/4/5/6 — chỉ thay Section 3 theo pattern này
- ⚠️ **Cần tạo OAuth Client ID** tại console.cloud.google.com trước khi code:
  - Application type: Web application
  - Authorized JavaScript origins: `http://localhost:8000` (dev) + domain thật (prod)
