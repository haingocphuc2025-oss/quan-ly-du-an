# SPEC: Attachment Panel UI v2

**Ngày:** 08/07/2026
**Người viết:** Ban QLDA (Claude)
**Trạng thái:** 🔴 Chưa duyệt
**Base:** v23_baseline.html
**Output:** v24_quan.html

---

## 1. MỤC TIÊU

Nâng cấp attachment panel thành sidebar cố định bên phải giống Smartsheet:
- Panel đè lên layout, không đẩy content
- Upload nhiều file cùng lúc, không giới hạn dung lượng
- Nút xem / xóa / actions trên từng file
- Thanh icon toolbar dọc bên phải để mở panel

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Right Toolbar (thanh icon dọc bên phải)

Thanh icon cố định bên phải màn hình — giống Smartsheet sidebar icons.

```
│ 📎 │  ← Attachments (active khi panel mở)
│ 💬 │  ← Comments (placeholder)
│ 📋 │  ← Activity log (placeholder)
│ ℹ️  │  ← Info (placeholder)
```

```css
.right-toolbar {
  position: fixed;
  right: 0; top: 48px; /* dưới ribbon */
  width: 40px;
  height: calc(100vh - 48px);
  background: #F3F2F1;
  border-left: 1px solid #D1CFCE;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 4px;
  z-index: 100;
}

.right-toolbar-btn {
  width: 32px; height: 32px;
  border: none; border-radius: 4px;
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}
.right-toolbar-btn:hover { background: #EDEBE9; }
.right-toolbar-btn.active {
  background: #DEECF9;
  color: #0078D4;
}
```

```html
<div class="right-toolbar" id="rightToolbar">
  <button class="right-toolbar-btn" id="tbAttach" title="Đính kèm" onclick="toggleAttachPanel()">📎</button>
  <button class="right-toolbar-btn" id="tbComment" title="Bình luận">💬</button>
  <button class="right-toolbar-btn" id="tbActivity" title="Lịch sử">📋</button>
  <button class="right-toolbar-btn" id="tbInfo" title="Thông tin">ℹ️</button>
</div>
```

### 2.2 Attachment Panel — cố định bên phải, đè lên layout

```css
.attach-panel {
  position: fixed;
  right: 40px; /* ngay bên trái right-toolbar */
  top: 48px;
  width: 320px;
  height: calc(100vh - 48px);
  background: #fff;
  border-left: 1px solid #D1CFCE;
  box-shadow: -4px 0 12px rgba(0,0,0,.08);
  display: flex;
  flex-direction: column;
  z-index: 99;
  transform: translateX(360px); /* ẩn mặc định */
  transition: transform 0.2s ease;
}
.attach-panel.open {
  transform: translateX(0); /* hiện */
}
```

### 2.3 Layout Panel

```
┌─────────────────────────────┐
│ Attachments          [✕]    │  ← Header + nút đóng
├──────────────────────────────┤
│ Row │ Sheet │ All            │  ← Tab bar
├──────────────────────────────┤
│                              │
│  [ Kéo thả file vào đây ]   │  ← Drop zone
│  [ hoặc Chọn file... ]      │
│                              │
├──────────────────────────────┤
│ Uploaded (newest ▼)   [⊞]   │  ← Sort + Actions
│──────────────────────────────│
│ 📄 DAP608_Rev04.pdf    Row 7 │
│    05/23/26 · Hieu     ·· ▾ │  ← Nút actions
│──────────────────────────────│
│ 📄 DAP608_Rev03.pdf    Row 7 │
│    05/11/26 · Hieu     ·· ▾ │
└──────────────────────────────┘
```

### 2.4 File Item — nút xem / xóa / actions

```html
<div class="attach-item" data-file-id="${fileId}">
  <div class="attach-item-icon">📄</div>
  <div class="attach-item-info">
    <a class="attach-item-name" href="${fileUrl}" target="_blank">${fileName}</a>
    <div class="attach-item-meta">Row ${rowLabel} · ${date} · ${uploader}</div>
  </div>
  <div class="attach-item-actions">
    <button class="attach-action-btn" title="Xem" onclick="viewAttachment('${fileUrl}')">👁</button>
    <button class="attach-action-btn" title="Xóa" onclick="deleteAttachment('${fileId}', '${rowId}')">🗑</button>
    <button class="attach-action-btn attach-more-btn" title="Actions" onclick="showAttachMenu(this, '${fileId}')">⋯</button>
  </div>
</div>
```

```css
.attach-item {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #F3F2F1;
  position: relative;
}
.attach-item:hover { background: #F9F8F7; }
.attach-item-icon { font-size: 24px; flex-shrink: 0; }
.attach-item-info { flex: 1; min-width: 0; }
.attach-item-name {
  display: block; font-size: 13px; font-weight: 500;
  color: #201F1E; text-decoration: none;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.attach-item-name:hover { text-decoration: underline; color: #0078D4; }
.attach-item-meta { font-size: 11px; color: #605E5C; margin-top: 2px; }
.attach-item-actions {
  display: flex; gap: 2px;
  opacity: 0; transition: opacity 0.15s;
}
.attach-item:hover .attach-item-actions { opacity: 1; }
.attach-action-btn {
  width: 26px; height: 26px; border: none;
  background: transparent; border-radius: 3px;
  cursor: pointer; font-size: 14px;
}
.attach-action-btn:hover { background: #EDEBE9; }
```

### 2.5 Actions dropdown menu

```html
<div class="attach-dropdown" id="attachDropdown" style="display:none;">
  <button onclick="viewAttachment(currentFileUrl)">👁 Mở file</button>
  <button onclick="downloadAttachment(currentFileUrl)">⬇ Tải xuống</button>
  <button onclick="copyLink(currentFileUrl)">🔗 Sao chép link</button>
  <hr>
  <button onclick="deleteAttachment(currentFileId)" style="color:red">🗑 Xóa</button>
</div>
```

### 2.6 Tab Row / Sheet / All

```javascript
// Row tab: chỉ hiện file của hàng đang chọn
// Sheet tab: tất cả file trong sheet hiện tại
// All tab: tất cả file của dự án

function renderAttachTab(tab) {
  let files = [];
  if (tab === 'row') files = getAttachments(selectedRowId);
  if (tab === 'sheet') files = getAllSheetAttachments();
  if (tab === 'all') files = getAllProjectAttachments();
  renderAttachList(files);
}
```

---

## 3. UPLOAD — NHIỀU FILE, KHÔNG GIỚI HẠN

### 3.1 Input cho phép multiple

```html
<input type="file" id="attachFileInput" multiple>
```

### 3.2 Upload queue — nhiều file song song

```javascript
async function uploadMultipleFiles(files, rowId, projectName) {
  const queue = Array.from(files);
  // Upload tuần tự (tránh rate limit Apps Script)
  for (const file of queue) {
    addToUploadQueue(file);
    await uploadSingleFile(file, rowId, projectName);
  }
}

function addToUploadQueue(file) {
  const item = document.createElement('div');
  item.className = 'upload-queue-item';
  item.id = 'q_' + file.name;
  item.innerHTML = `
    <span>📎 ${file.name}</span>
    <span class="upload-status">⏳ Đang chờ...</span>
    <div class="upload-bar"><div class="upload-fill" style="width:0%"></div></div>
  `;
  document.getElementById('uploadQueue').appendChild(item);
}
```

### 3.3 Upload không giới hạn (google.script.run + DriveApp)

```javascript
async function uploadSingleFile(file, rowId, projectName) {
  // Đọc file thành base64
  const base64 = await readFileAsBase64(file);
  
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((result) => {
        updateQueueItem(file.name, '✅ Xong', 100);
        saveAttachmentToRow(rowId, result);
        resolve(result);
      })
      .withFailureHandler((err) => {
        updateQueueItem(file.name, '❌ Lỗi', 0);
        reject(err);
      })
      .uploadAttachment({
        base64: base64,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        projectName: projectName,
        rowLabel: getRowLabel(rowId)
      });
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
}
```

### 3.4 Upload progress UI

```css
.upload-queue { padding: 8px 12px; border-bottom: 1px solid #F3F2F1; }
.upload-queue-item { margin-bottom: 6px; font-size: 12px; }
.upload-bar { height: 3px; background: #F3F2F1; border-radius: 2px; margin-top: 3px; }
.upload-fill { height: 100%; background: #0078D4; border-radius: 2px; transition: width 0.3s; }
```

---

## 4. APPS SCRIPT (Code.gs) — uploadAttachment

```javascript
function uploadAttachment(params) {
  // params: { base64, fileName, mimeType, projectName, rowLabel }
  var bytes = Utilities.base64Decode(params.base64);
  var blob = Utilities.newBlob(bytes, params.mimeType, params.fileName);
  
  var root = getOrCreateFolder_('DU_AN_WEB_QUAN_LY');
  var proj = getOrCreateFolder_(params.projectName || 'attachments', root);
  
  var file = proj.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return {
    fileId: file.getId(),
    fileName: file.getName(),
    fileUrl: file.getUrl(),
    mimeType: params.mimeType,
    size: file.getSize(),
    uploadedAt: new Date().toISOString(),
    rowLabel: params.rowLabel || ''
  };
}

function deleteAttachment(fileId) {
  try { DriveApp.getFileById(fileId).setTrashed(true); return { ok: true }; }
  catch(e) { return { ok: false, error: e.toString() }; }
}

function getOrCreateFolder_(name, parent) {
  var root = parent || DriveApp;
  var iter = root.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : root.createFolder(name);
}
```

---

## 5. TEST CASES

| # | Test | Kỳ vọng |
|---|------|---------|
| 1 | Click 📎 trên right toolbar | Panel slide in từ phải, đè lên content |
| 2 | Click 📎 lần 2 | Panel đóng lại |
| 3 | Chọn 5 file cùng lúc | Upload tuần tự, hiện progress từng file |
| 4 | Upload file 50MB | Thành công, không timeout |
| 5 | Hover lên file trong list | Nút 👁 🗑 ⋯ hiện ra |
| 6 | Click 👁 | Mở file trên Drive tab mới |
| 7 | Click 🗑 | Xóa file, biến khỏi list |
| 8 | Click ⋯ | Dropdown: Mở / Tải xuống / Sao chép link / Xóa |
| 9 | Tab Row / Sheet / All | Filter đúng file theo scope |
| 10 | Right toolbar: icon active | 📎 bôi xanh khi panel đang mở |

---

## 6. BÀN GIAO

- ✅ Base: `VERSIONS/v23_baseline.html`
- ✅ Output: `STAGING/giao-dien-desktop-don-gian_v24_quan.html`
- ✅ Cập nhật `Code.gs`: thêm/sửa `uploadAttachment()`, `deleteAttachment()`
- ✅ Deploy lại Apps Script nếu Code.gs thay đổi
- ✅ Right toolbar không che sheet grid (z-index đúng)
- ✅ Panel đè lên layout, KHÔNG đẩy layout sang trái
- ✅ Test upload nhiều file trước khi nộp
- ✅ Nộp CODE_DIFF.md đủ 4 mục
