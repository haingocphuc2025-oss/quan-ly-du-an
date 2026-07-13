# SPEC: File Attachment + Icon Fix + Excel 365 Toolbar Style

> **TRẠNG THÁI CHÍNH THỨC:** ĐÃ TRIỂN KHAI  
> Vị trí thư mục là nguồn trạng thái chính thức. Các dòng “chưa duyệt”, đường dẫn cũ và baseline cũ bên dưới chỉ là lịch sử tại thời điểm soạn spec. Baseline hiện hành: **v25**.

**Ngày:** 08/07/2026
**Người viết:** Ban QLDA (Claude)
**Trạng thái:** 🔴 Chưa duyệt
**Ưu tiên:** 🔴 CAO

---

## 1. MỤC TIÊU

3 việc trong 1 SPEC:
1. **Icon fix** — khôi phục ký tự Unicode bị vỡ
2. **Excel 365 Toolbar** — sắp xếp nhóm nút format giống Excel, giữ nguyên app buttons
3. **File Attachment** — upload thẳng Drive qua OAuth token (không giới hạn size, không base64)

---

## 2. FILE ATTACHMENT — APPROACH MỚI (dùng code cũ)

### Tại sao khác với SPEC trước?

Code cũ (`Code.gs`) dùng `ScriptApp.getOAuthToken()` → trả token về frontend → frontend upload thẳng lên Drive REST API.

**Ưu điểm:**
- Không giới hạn size (upload trực tiếp, không qua Apps Script body)
- Không cần chunked upload
- Code đã hoạt động tốt trong Sheets sidebar

### 2.1 Luồng upload

```
User click 📎 → chọn file
    ↓
Gọi Apps Script: getUploadInfo(projectName)
    ↓
Apps Script: tạo folder Drive nếu chưa có → trả { token, folderId }
    ↓
Frontend: fetch Drive REST API trực tiếp với token
POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart
    ↓
Drive tạo file → trả { id, name, webViewLink }
    ↓
Lưu metadata vào row attachments[]
    ↓
persistToDrive()
```

### 2.2 Apps Script — thêm vào Code.gs

```javascript
// Tạo/lấy folder cho dự án, trả về token + folderId
function getAttachmentFolder(projectName) {
  var rootName = 'DU_AN_WEB_QUAN_LY';
  var roots = DriveApp.getFoldersByName(rootName);
  var root = roots.hasNext() ? roots.next() : DriveApp.createFolder(rootName);

  var subName = projectName || 'attachments';
  var subs = root.getFoldersByName(subName);
  var folder = subs.hasNext() ? subs.next() : root.createFolder(subName);

  return {
    token: ScriptApp.getOAuthToken(),
    folderId: folder.getId()
  };
}

// Xóa file
function deleteAttachmentFile(fileId) {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.toString() };
  }
}
```

Thêm routing vào `doPost`:
```javascript
if (params.action === 'getAttachmentFolder') {
  var info = getAttachmentFolder(params.projectName);
  return ContentService.createTextOutput(JSON.stringify(info))
    .setMimeType(ContentService.MimeType.JSON);
}
if (params.action === 'deleteAttachment') {
  var result = deleteAttachmentFile(params.fileId);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2.3 Frontend — upload function

```javascript
// Lấy token + folderId từ Apps Script
async function getAttachmentInfo(projectName) {
  const res = await fetch(WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'getAttachmentFolder', projectName })
  });
  return res.json(); // { token, folderId }
}

// Upload file thẳng lên Drive — không giới hạn size
async function uploadFileToDrive(file, projectName, onProgress) {
  const { token, folderId } = await getAttachmentInfo(projectName);

  const metadata = {
    name: file.name,
    parents: [folderId]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
    {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form
    }
  );
  const data = await res.json();
  return {
    fileId: data.id,
    fileName: data.name,
    fileUrl: data.webViewLink,
    size: data.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString()
  };
}

// Xóa file
async function deleteAttachment(fileId) {
  await fetch(WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'deleteAttachment', fileId })
  });
}
```

### 2.4 UI Attachment Panel

```html
<!-- Panel đính kèm — slide in từ phải -->
<div id="attachPanel" style="display:none; position:fixed; right:0; top:0;
  width:300px; height:100vh; background:#fff; border-left:1px solid #e0e0e0;
  box-shadow:-4px 0 16px rgba(0,0,0,.1); z-index:200; display:flex; flex-direction:column;">

  <div style="padding:12px; border-bottom:1px solid #e8eaed; display:flex; justify-content:space-between;">
    <b id="attachPanelTitle">📎 Đính kèm</b>
    <button id="attachPanelClose">✕</button>
  </div>

  <!-- Upload zone -->
  <div id="attachDropZone" style="margin:12px; border:2px dashed #dadce0; border-radius:8px;
    padding:20px; text-align:center; cursor:pointer;">
    <div>📎 Kéo thả hoặc click để chọn file</div>
    <div style="font-size:11px; color:#666; margin-top:4px;">Mọi loại file · Không giới hạn dung lượng</div>
    <input type="file" id="attachFileInput" multiple style="display:none;">
  </div>

  <!-- Progress -->
  <div id="attachProgress" style="display:none; margin:0 12px; font-size:12px; color:#555;"></div>

  <!-- File list -->
  <div id="attachFileList" style="flex:1; overflow-y:auto; padding:0 12px;"></div>
</div>
```

```javascript
// Mở panel khi click 📎
async function openAttachPanel(rowIndex, projectName) {
  const panel = document.getElementById('attachPanel');
  panel.dataset.rowIndex = rowIndex;
  panel.dataset.projectName = projectName;
  panel.style.display = 'flex';
  renderAttachList(rowIndex);
}

// Render danh sách file
function renderAttachList(rowIndex) {
  const row = getRowData(rowIndex);
  const attachments = row.attachments || [];
  const list = document.getElementById('attachFileList');

  if (!attachments.length) {
    list.innerHTML = '<p style="color:#999;text-align:center;font-size:12px;">Chưa có file đính kèm</p>';
    return;
  }

  list.innerHTML = attachments.map((a, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #e8eaed;">
      <span style="font-size:18px;">${getFileIcon(a.mimeType)}</span>
      <a href="${a.fileUrl}" target="_blank" style="flex:1;font-size:12px;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap;">${a.fileName}</a>
      <button onclick="removeAttachment(${rowIndex}, ${i})"
        style="border:none;background:none;cursor:pointer;color:#d93025;">🗑</button>
    </div>
  `).join('');
}

function getFileIcon(mimeType) {
  if (!mimeType) return '📎';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  return '📎';
}

// Upload handler
document.getElementById('attachFileInput').addEventListener('change', async (e) => {
  const panel = document.getElementById('attachPanel');
  const rowIndex = parseInt(panel.dataset.rowIndex);
  const projectName = panel.dataset.projectName;
  const prog = document.getElementById('attachProgress');

  for (const file of e.target.files) {
    prog.style.display = 'block';
    prog.textContent = `⏳ Đang upload ${file.name}...`;
    try {
      const attachment = await uploadFileToDrive(file, projectName);
      // Lưu vào row data
      const row = getRowData(rowIndex);
      row.attachments = row.attachments || [];
      row.attachments.push(attachment);
      persistToDrive();
      renderAttachList(rowIndex);
      prog.textContent = `✅ ${file.name} đã upload`;
    } catch(err) {
      prog.textContent = `❌ Lỗi: ${err.message}`;
    }
  }
  setTimeout(() => { prog.style.display = 'none'; }, 3000);
});
```

---

## 3. EXCEL 365 TOOLBAR

### Layout toolbar mới

```
[Font▼][Size▼] │ B I U S │ [A▼][🎨▼] │ ≡ ≡ ≡ │ [Wrap][Merge] ║ [Sort][Filter][Định dạng][Forms][Publish][Auto] │ [32px▼] │ [Cột][Nhóm] │ ...
```

### CSS thêm

```css
body, .sheet-table, .smartsheet-toolbar {
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.smartsheet-toolbar {
  background: #F3F2F1;
  border-bottom: 1px solid #D1CFCE;
  padding: 2px 4px;
}
.toolbar-btn {
  height: 26px; min-width: 26px; padding: 0 5px;
  border: 1px solid transparent; border-radius: 2px;
  background: transparent; font-size: 13px; cursor: pointer;
}
.toolbar-btn:hover { background: #EDEBE9; border-color: #C8C6C4; }
.toolbar-btn.active { background: #DEECF9; border-color: #0078D4; }
.toolbar-select {
  height: 26px; padding: 0 4px;
  border: 1px solid #C8C6C4; border-radius: 2px;
  font-family: 'Segoe UI', sans-serif; font-size: 12px;
}
.toolbar-sep { width: 1px; height: 20px; background: #C8C6C4; margin: 0 4px; }
```

### HTML thêm trước nhóm B I U S

```html
<!-- Font picker -->
<select id="fontFamilyPicker" class="toolbar-select" style="width:90px" title="Font chữ">
  <option value="Inter">Inter</option>
  <option value="Segoe UI">Segoe UI</option>
  <option value="Arial">Arial</option>
  <option value="Times New Roman">Times New Roman</option>
</select>

<!-- Size picker -->
<select id="fontSizePicker" class="toolbar-select" style="width:46px" title="Cỡ chữ">
  <option>9</option><option>10</option><option selected>11</option>
  <option>12</option><option>14</option><option>16</option>
  <option>18</option><option>20</option><option>24</option>
</select>

<div class="toolbar-sep"></div>

<!-- B I U S giữ nguyên id/handler cũ -->
```

---

## 4. ICON FIX

Lấy file HTML **gốc từ STAGING** — không qua xử lý Ban QLDA. Giữ UTF-8.
Các ký tự cần đúng: ☰ ← → ★ ☆ ▦ ▤ ↑ ↓ ▽ ● ○ ☑ ☐

---

## 5. TEST CASES

| # | Test | Kỳ vọng |
|---|------|---------|
| 1 | Icon ☰ ← → ★ | Hiển thị đúng ký tự Unicode |
| 2 | Font picker | Chọn Arial → cell text đổi font |
| 3 | Size picker | Chọn 14 → cell text to hơn |
| 4 | Hover toolbar btn | Background #EDEBE9 |
| 5 | Click 📎 trên hàng | Panel mở, hiện tên dự án |
| 6 | Upload PDF 20MB | Upload thành công, không timeout |
| 7 | Upload ảnh JPG | Hiện icon 🖼️ trong list |
| 8 | Click link file | Mở file trên Drive |
| 9 | Xóa đính kèm | File vào Trash Drive |
| 10 | App buttons Sort/Filter | Vẫn hoạt động bình thường |

---

## 6. BÀN GIAO

- ✅ Lấy file HTML **gốc STAGING v20** — không dùng bản Ban QLDA xử lý
- ✅ Code.gs: thêm `getAttachmentFolder()` + `deleteAttachmentFile()` + doPost routing
- ✅ **Deploy lại Apps Script** → URL mới → paste WEBAPP_URL vào HTML
- ✅ Giữ UTF-8 encoding khi thêm code
- ✅ Test upload file thật > 10MB trước khi nộp
- ✅ Nộp CODE_DIFF.md đủ 4 mục (đặc biệt mục 4: đoạn ảnh hưởng persistToDrive)
