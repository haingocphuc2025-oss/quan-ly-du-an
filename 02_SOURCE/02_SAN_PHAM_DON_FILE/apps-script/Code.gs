/**
 * QLDA — Web App serve HTML UI + API backend.
 * Deploy: Deploy > New deployment > Web app
 * Execute as: Me, Who has access: Anyone (hoặc Anyone with Google account)
 */

const FACTORY_ROOT_FOLDER = 'DU_AN_WEB_QUAN_LY';
const PROJECT_ARCHIVE_FOLDER_NAMES = [
  '01_HOP_DONG_PHAP_LY',
  '02_VAT_LIEU_CO_CQ',
  '03_THI_CONG_NGHIEM_THU',
  '04_THANH_TOAN_QUYET_TOAN',
  '05_TONG_HOP_DOI_CHIEU'
];

function doGet(e) {
  // Nếu có action param → API call (getdata, setdata, loadsheet...)
  const action = e && e.parameter && e.parameter.action;
  if (action) {
    return xuLyHanhDong_(e, action);
  }
  // Không có action → serve HTML UI
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('DU AN WEB QUAN LY')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ===== API endpoints cho google.script.run =====

/** Load toàn bộ dữ liệu app từ Drive JSON */
function loadAppData() {
  const root = getOrCreateFolder_(DriveApp, FACTORY_ROOT_FOLDER);
  const files = root.getFilesByName('app_data.json');
  if (!files.hasNext()) return { projects: [], folders: [] };
  const raw = files.next().getBlob().getDataAsString();
  try { return JSON.parse(raw); } catch(e) { return { projects: [], folders: [] }; }
}

/** Lưu toàn bộ dữ liệu app xuống Drive JSON */
function saveAppData(data) {
  const root = getOrCreateFolder_(DriveApp, FACTORY_ROOT_FOLDER);
  const json = JSON.stringify(data);
  const files = root.getFilesByName('app_data.json');
  if (files.hasNext()) {
    files.next().setContent(json);
  } else {
    root.createFile('app_data.json', json, MimeType.PLAIN_TEXT);
  }
  return { ok: true };
}

/** Upload file đính kèm → Drive, trả về thông tin file */
function uploadAttachment(projectName, sheetName, rowLabel, fileName, mimeType, base64Data) {
  return luuFileDinhKem({
    project: projectName,
    sheetName: sheetName,
    rowLabel: rowLabel,
    fileName: fileName,
    mimeType: mimeType,
    base64Data: base64Data
  });
}

/** Xoá file đính kèm trên Drive */
function deleteAttachment(fileId) {
  return xoaFileDinhKem({ fileId: fileId });
}

// ===== Các hàm xử lý API cũ (giữ nguyên) =====

function xuLyHanhDong_(e, action) {
  try {
    const payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : {};
    let result;
    if (action === 'getdata') {
      result = { ok: true, data: layDuLieuSheet(payload.spreadsheetId) };
    } else if (action === 'setdata') {
      luuOSheet(payload.spreadsheetId, payload.row, payload.col, payload.value);
      result = { ok: true };
    } else if (action === 'loadsheet') {
      result = taiDuLieuSheet(payload);
    } else if (action === 'savesheet') {
      result = luuDuLieuSheet(payload);
    } else {
      result = { ok: false, error: 'Hanh dong khong ho tro: ' + action };
    }
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function doPost(e) {
  try {
    const payload = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};
    const action = payload.action || 'savefile';
    let result;
    if (action === 'savefile') {
      result = luuFileDinhKem(payload);
    } else if (action === 'deletefile') {
      result = xoaFileDinhKem(payload);
    } else if (action === 'savesheet') {
      result = luuDuLieuSheet(payload);
    } else {
      result = { ok: false, error: 'Hanh dong khong ho tro: ' + action };
    }
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

// ===== Sheet operations =====

function layDuLieuSheet(spreadsheetId) {
  if (!spreadsheetId) throw new Error('Thieu spreadsheetId.');
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheets()[0];
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  return {
    name: ss.getName(),
    values: sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues()
  };
}

function luuOSheet(spreadsheetId, row, col, value) {
  if (!spreadsheetId) throw new Error('Thieu spreadsheetId.');
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheets()[0];
  sheet.getRange(Number(row) + 1, Number(col) + 1).setValue(value);
  return true;
}

function luuDuLieuSheet(payload) {
  payload = payload || {};
  if (!payload.cells) throw new Error('Thieu du lieu cells.');
  const root = getOrCreateFolder_(DriveApp, FACTORY_ROOT_FOLDER);
  const projectFolder = getOrCreateFolder_(root, payload.project || 'Du an chua dat ten');
  const dataRoot = getOrCreateFolder_(projectFolder, 'Du lieu bang');
  const sheetFolder = getOrCreateFolder_(dataRoot, payload.sheetName || 'Sheet');
  const fileName = 'data.json';
  const json = JSON.stringify({
    cells: payload.cells,
    rowMeta: payload.rowMeta || null,
    attachments: payload.attachments || {},
    cellStyles: payload.cellStyles || {},
    savedAt: new Date().toISOString()
  });
  const existing = sheetFolder.getFilesByName(fileName);
  if (existing.hasNext()) {
    existing.next().setContent(json);
  } else {
    sheetFolder.createFile(fileName, json, MimeType.PLAIN_TEXT);
  }
  return { ok: true };
}

function taiDuLieuSheet(payload) {
  payload = payload || {};
  const root = getOrCreateFolder_(DriveApp, FACTORY_ROOT_FOLDER);
  const projectFolder = getOrCreateFolder_(root, payload.project || 'Du an chua dat ten');
  const dataRoot = getOrCreateFolder_(projectFolder, 'Du lieu bang');
  const sheetFolder = getOrCreateFolder_(dataRoot, payload.sheetName || 'Sheet');
  const existing = sheetFolder.getFilesByName('data.json');
  if (!existing.hasNext()) return { ok: true, cells: null };
  const parsed = JSON.parse(existing.next().getBlob().getDataAsString());
  return {
    ok: true,
    cells: parsed.cells || null,
    rowMeta: parsed.rowMeta || null,
    attachments: parsed.attachments || {},
    cellStyles: parsed.cellStyles || {},
    savedAt: parsed.savedAt || null
  };
}

// ===== File attachment operations =====


function prepareAttachmentFolder(projectName, sheetName) {
  const project = projectName || 'Du an chua dat ten';
  const folderName = safeFileName_(sheetName || '05_TONG_HOP_DOI_CHIEU');
  const root = getOrCreateFolder_(DriveApp, FACTORY_ROOT_FOLDER);
  const projectFolder = getOrCreateFolder_(root, project);
  ensureProjectArchiveFolders_(projectFolder);
  const targetFolder = getOrCreateFolder_(projectFolder, folderName);
  return {
    ok: true,
    folderId: targetFolder.getId(),
    folderName: folderName,
    folderPath: FACTORY_ROOT_FOLDER + '/' + project + '/' + folderName
  };
}

function luuFileDinhKem(payload) {
  payload = payload || {};
  if (!payload.base64Data) throw new Error('Thieu du lieu file.');
  if (!payload.fileName) throw new Error('Thieu ten file.');

  const projectName = safeFileName_(payload.project || 'Du an chua dat ten');
  const folderName = safeFileName_(payload.sheetName || payload.folderName || '05_TONG_HOP_DOI_CHIEU');
  const rowLabel = safeFileName_(
    payload.rowLabel || ('Dong ' + (payload.row != null ? Number(payload.row) + 1 : ''))
  );

  const root = getOrCreateFolder_(DriveApp, FACTORY_ROOT_FOLDER);
  const projectFolder = getOrCreateFolder_(root, projectName);
  ensureProjectArchiveFolders_(projectFolder);
  const targetFolder = getOrCreateFolder_(projectFolder, folderName);

  const decoded = Utilities.base64Decode(payload.base64Data);
  const blob = Utilities.newBlob(decoded, payload.mimeType || 'application/octet-stream', payload.fileName);
  const file = targetFolder.createFile(blob);
  file.setDescription('Row: ' + rowLabel);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    ok: true,
    id: file.getId(),
    name: payload.fileName,
    link: file.getUrl(),
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
    size: blob.getBytes().length,
    folderId: targetFolder.getId(),
    folderName: folderName,
    folderPath: FACTORY_ROOT_FOLDER + '/' + projectName + '/' + folderName,
    rowLabel: rowLabel
  };
}

function xoaFileDinhKem(payload) {
  if (!payload || !payload.fileId) throw new Error('Thieu fileId.');
  const file = DriveApp.getFileById(payload.fileId);
  file.setTrashed(true);
  return { ok: true };
}

// ===== Helpers =====

function ensureProjectArchiveFolders_(projectFolder) {
  PROJECT_ARCHIVE_FOLDER_NAMES.forEach(function(name) {
    getOrCreateFolder_(projectFolder, name);
  });
}

function getOrCreateFolder_(parent, name) {
  const safeName = safeFileName_(name);
  const folders = parent.getFoldersByName(safeName);
  return folders.hasNext() ? folders.next() : parent.createFolder(safeName);
}

function safeFileName_(value) {
  return String(value || 'Khong ten')
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 160) || 'Khong ten';
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
