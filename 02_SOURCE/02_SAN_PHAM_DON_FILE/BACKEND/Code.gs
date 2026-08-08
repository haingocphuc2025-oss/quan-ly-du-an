/**
 * QLDA Google Sheet factory.
 *
 * Deploy this Apps Script as a Web App, or serve the HTML UI from the same
 * Apps Script project so the frontend can call google.script.run.createProjectSheet.
 *
 * Flow:
 * 1. Create a real Google Sheet.
 * 2. Read ma.txt from Google Drive.
 * 3. Create a container-bound Apps Script project for that Sheet.
 * 4. Push ma.txt into the new script as Code.gs.
 */

const FACTORY_ROOT_FOLDER = 'DU_AN_WEB_QUAN_LY';
const CREATED_SHEETS_FOLDER = 'Google Sheets';
const PROJECT_ARCHIVE_FOLDER_NAMES = [
  '01_HOP_DONG_PHAP_LY',
  '02_VAT_LIEU_CO_CQ',
  '03_THI_CONG_NGHIEM_THU',
  '04_THANH_TOAN_QUYET_TOAN',
  '05_TONG_HOP_DOI_CHIEU'
];
const ATTACHMENT_CODE_FILE_ID = '';
const ATTACHMENT_CODE_FILE_NAME = 'ma.txt';

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'create' || action === 'getdata' || action === 'setdata' || action === 'loadsheet') {
    return xuLyHanhDong_(e, action);
  }

  return HtmlService
    .createHtmlOutput('QLDA Sheet Factory is running.')
    .setTitle('QLDA Sheet Factory');
}

function xuLyHanhDong_(e, action) {
  try {
    const payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : {};
    let result;
    if (action === 'create') {
      result = createProjectSheet(payload);
    } else if (action === 'getdata') {
      result = { ok: true, data: layDuLieuSheet(payload.spreadsheetId) };
    } else if (action === 'setdata') {
      luuOSheet(payload.spreadsheetId, payload.row, payload.col, payload.value);
      result = { ok: true };
    } else if (action === 'loadsheet') {
      result = taiDuLieuSheet(payload);
    } else {
      result = { ok: false, error: 'Hanh dong khong ho tro: ' + action };
    }
    return e.parameter.callback
      ? jsonp_(e.parameter.callback, result)
      : json_(result);
  } catch (err) {
    const result = {
      ok: false,
      error: err && err.message ? err.message : String(err)
    };
    return e.parameter.callback
      ? jsonp_(e.parameter.callback, result)
      : json_(result);
  }
}

/** Doc toan bo du lieu (dong 1..lastRow, cot 1..lastCol) cua sheet dau tien trong 1 spreadsheet. */
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

/** Ghi 1 o (row, col la chi so 0-based tu luoi tren giao dien) vao sheet dau tien cua spreadsheet. */
function luuOSheet(spreadsheetId, row, col, value) {
  if (!spreadsheetId) throw new Error('Thieu spreadsheetId.');
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheets()[0];
  sheet.getRange(Number(row) + 1, Number(col) + 1).setValue(value);
  return true;
}

function doPost(e) {
  try {
    const payload = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};
    const action = payload.action || 'create';
    let result;
    if (action === 'create') {
      result = createProjectSheet(payload);
    } else if (action === 'savefile') {
      result = luuFileDinhKem(payload);
    } else if (action === 'deletefile') {
      result = xoaFileDinhKem(payload);
    } else if (action === 'savesheet') {
      result = luuDuLieuSheet(payload);
    } else if (action === 'aichat') {
      result = aiChatForWebApp(payload);
    } else {
      result = { ok: false, error: 'Hanh dong khong ho tro: ' + action };
    }
    return json_(result);
  } catch (err) {
    return json_({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

/** Luu 1 file dinh kem (base64) vao Drive theo Du an / Folder ho so. */

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

/** Xoa (dua vao thung rac) 1 file dinh kem tren Drive theo fileId. */
function xoaFileDinhKem(payload) {
  if (!payload || !payload.fileId) throw new Error('Thieu fileId.');
  const file = DriveApp.getFileById(payload.fileId);
  file.setTrashed(true);
  return { ok: true };
}

function createProjectSheet(payload) {
  payload = payload || {};

  const name = safeFileName_(payload.name || 'New Sheet');
  const projectName = safeFileName_(payload.project || 'Du an chua dat ten');
  const folder = getCreatedSheetsFolder_(projectName);

  const spreadsheet = SpreadsheetApp.create(name);
  const file = DriveApp.getFileById(spreadsheet.getId());
  folder.addFile(file);
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (err) {
    // Shared Drives may not allow removing from root; the sheet is still usable.
  }

  setupBlankProjectSheet_(spreadsheet);
  setupCommonSheetRules_(spreadsheet);
  const scriptId = createBoundAttachmentScript_(spreadsheet.getId(), name);

  return {
    ok: true,
    id: spreadsheet.getId(),
    spreadsheetId: spreadsheet.getId(),
    scriptId: scriptId,
    name: spreadsheet.getName(),
    url: spreadsheet.getUrl(),
    project: projectName
  };
}

function testCreateProjectSheet() {
  return createProjectSheet({
    name: 'TEST_Q LDA Auto Sheet',
    project: 'Codex Test',
    type: 'grid-with-attachments'
  });
}

function setupBlankProjectSheet_(spreadsheet) {
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName('Data');
  sheet.getRange(1, 1, 1, 12).setValues([[
    '',
    'Stt',
    'Noi dung',
    'Date',
    'Nhan su quan ly',
    'To be tong',
    'To thep',
    'To cong nhat',
    'Lai may',
    'Tho dien',
    'Cong nhan lam cong',
    'Ghi chu'
  ]]);
  sheet.getRange('A1:L1').setFontWeight('bold').setBackground('#e6f4ea');
  sheet.setColumnWidth(1, 44);
  sheet.setColumnWidth(2, 70);
  sheet.setColumnWidth(3, 300);
}

function createBoundAttachmentScript_(spreadsheetId, sheetName) {
  const project = callAppsScriptApi_(
    'https://script.googleapis.com/v1/projects',
    'post',
    {
      title: sheetName + ' - Ho so dinh kem',
      parentId: spreadsheetId
    },
    'tao Apps Script bound'
  );

  const scriptId = project.scriptId;
  const source = prepareAttachmentCode_(readAttachmentCode_());
  callAppsScriptApi_(
    'https://script.googleapis.com/v1/projects/' + encodeURIComponent(scriptId) + '/content',
    'put',
    {
      files: [
        {
          name: 'Code',
          type: 'SERVER_JS',
          source: source
        },
        {
          name: 'appsscript',
          type: 'JSON',
          source: JSON.stringify(boundScriptManifest_(), null, 2)
        }
      ]
    },
    'ghi ma Apps Script vao sheet moi'
  );

  return scriptId;
}

function readAttachmentCode_() {
  if (ATTACHMENT_CODE_FILE_ID) {
    return DriveApp.getFileById(ATTACHMENT_CODE_FILE_ID)
      .getBlob()
      .getDataAsString('UTF-8');
  }

  const files = DriveApp.getFilesByName(ATTACHMENT_CODE_FILE_NAME);
  let newest = null;
  while (files.hasNext()) {
    const file = files.next();
    if (!newest || file.getLastUpdated() > newest.getLastUpdated()) {
      newest = file;
    }
  }
  if (!newest) {
    throw new Error('Khong tim thay file ma Apps Script: ' + ATTACHMENT_CODE_FILE_NAME);
  }
  return newest.getBlob().getDataAsString('UTF-8');
}

function prepareAttachmentCode_(source) {
  let code = String(source || '').trim();
  if (!code) throw new Error('File ma Apps Script dang rong.');

  if (!/\bfunction\s+onEdit\s*\(/.test(code)) {
    code += '\n\nfunction onEdit(e) {\n' +
      '  try {\n' +
      '    if (typeof xuLyCheckbox === "function") xuLyCheckbox(e);\n' +
      '  } catch (err) {}\n' +
      '}\n';
  }

  return code + '\n';
}

function boundScriptManifest_() {
  return {
    timeZone: 'Asia/Ho_Chi_Minh',
    exceptionLogging: 'STACKDRIVER',
    runtimeVersion: 'V8',
    oauthScopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/script.container.ui',
      'https://www.googleapis.com/auth/script.scriptapp'
    ]
  };
}

function callAppsScriptApi_(url, method, body, label) {
  const response = UrlFetchApp.fetch(url, {
    method: method,
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  const text = response.getContentText();
  const status = response.getResponseCode();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(label + ' loi phan hoi: ' + text);
  }

  if (status < 200 || status >= 300) {
    throw new Error(label + ' that bai: ' + (data.error && data.error.message ? data.error.message : text));
  }

  return data;
}

function setupCommonSheetRules_(spreadsheet) {
  spreadsheet.getSheets().forEach(function(sheet) {
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);
    ensureFilesJsonColumn_(sheet);
    protectPinColumn_(sheet);
  });
}

function ensureFilesJsonColumn_(sheet) {
  const maxCols = Math.max(sheet.getLastColumn(), 30);
  const headers = sheet.getRange(1, 1, 1, maxCols).getValues()[0];
  const found = headers.indexOf('_files_json');
  if (found >= 0) {
    sheet.hideColumns(found + 1);
    return found + 1;
  }
  const col = sheet.getLastColumn() + 1;
  sheet.getRange(1, col).setValue('_files_json');
  sheet.hideColumns(col);
  return col;
}

function protectPinColumn_(sheet) {
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  const hasProtection = protections.some(function(p) {
    const range = p.getRange();
    return range.getColumn() === 1 && range.getNumColumns() === 1;
  });
  if (hasProtection) return;

  const protection = sheet.getRange('A:A').protect();
  protection.setDescription('Cot ghim ho so - chi script duoc sua');
  try {
    protection.removeEditors(protection.getEditors());
    if (protection.canDomainEdit()) protection.setDomainEdit(false);
  } catch (err) {
    // Keep the sheet creation flow from failing if protection permissions differ.
  }
}

/** Luu toan bo du lieu 1 Sheet (mang cells 2 chieu) thanh 1 file JSON tren Drive, ghi de moi lan luu. */
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

/** Doc lai du lieu Sheet da luu tren Drive (neu co) - dung khi mo lai 1 Sheet. */
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

function getCreatedSheetsFolder_(projectName) {
  const root = getOrCreateFolder_(DriveApp, FACTORY_ROOT_FOLDER);
  const projectFolder = getOrCreateFolder_(root, projectName);
  return getOrCreateFolder_(projectFolder, CREATED_SHEETS_FOLDER);
}

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

function jsonp_(callback, data) {
  const safeCallback = String(callback || 'callback').replace(/[^\w.$]/g, '');
  return ContentService
    .createTextOutput(safeCallback + '(' + JSON.stringify(data) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

