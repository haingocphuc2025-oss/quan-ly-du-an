const googleSheetStage = document.getElementById('googleSheetStage');
const googleSheetSetup = document.getElementById('googleSheetSetup');
const googleSheetFrame = document.getElementById('googleSheetFrame');
const googleSheetUrlInput = document.getElementById('googleSheetUrlInput');
const saveGoogleSheetUrl = document.getElementById('saveGoogleSheetUrl');
const createGoogleSheetLink = document.getElementById('createGoogleSheetLink');
const openGoogleSheetLink = document.getElementById('openGoogleSheetLink');
const googleSheetCreateNote = document.getElementById('googleSheetCreateNote');

var SHEET_FACTORY_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwVf0ft1nCwezmG10Fy2j8bqeVyVlpJjAf__FtLvKcMXcH2KNPGvjYtt94-oP-u5ffk/exec';

let DRIVE_DIRECT_CLIENT_ID = localStorage.getItem(DRIVE_DIRECT_CLIENT_ID_KEY) || '1053895269686-6m3sqmr8n7f9kl27voblvr6p9628smip.apps.googleusercontent.com';

const DRIVE_DIRECT_ROOT_FOLDER = 'DU_AN_WEB_QUAN_LY';
const DRIVE_DIRECT_SCOPE = 'https://www.googleapis.com/auth/drive';
const DRIVE_DIRECT_RESUMABLE_THRESHOLD = 8 * 1024 * 1024;

let driveDirectTokenClient = null;
let driveDirectAccessToken = '';
let driveDirectTokenExpiresAt = 0;

function initAuth() {
  render();
  refreshWorkspaceFolderTreeIfVisible();
  loadFromDrive();
}

const GOOGLE_SHEET_TEMPLATE_ID = '';
const driveProjectFileMap = {};

function getAttachmentDriveId(file){
 const id = file && (file.driveId || file.fileId || file.id);
 return id && !String(id).startsWith('local-') ? String(id) : '';
}

function extractDriveIdFromUrl(url){
 const value = String(url || '');
 const match = value.match(/\/file\/d\/([^/]+)/) || value.match(/[?&]id=([^&]+)/);
 return match ? decodeURIComponent(match[1]) : '';
}

function normalizeGoogleSheetUrl(value){
 const raw = String(value || '').trim();
 if(!raw) return '';
 const idMatch = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/) || raw.match(/^([a-zA-Z0-9-_]{20,})$/);
 if(idMatch) return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/edit`;
 return raw;
}

function googleSheetFrameUrl(url){
 const normalized = normalizeGoogleSheetUrl(url);
 const idMatch = normalized.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
 if(!idMatch) return normalized;
 return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/edit`;
}

function renderGoogleSheetHost(sheet){
 const url = normalizeGoogleSheetUrl(sheet.googleSheetUrl || '');
 googleSheetUrlInput.value = url;
 googleSheetStage.style.display = 'none';
 googleSheetFrame.style.display = 'none';
 googleSheetFrame.removeAttribute('src');
 sheetGridWrap.style.display = 'flex';
 openGoogleSheetLink.disabled = !url;
 sheetStatus.textContent = url
 ? 'Bảng dạng lưới giống Excel · đã liên kết Google Sheet · bấm "Mở Google Sheet" để xem bản gốc'
 : 'Bảng dạng lưới giống Excel · sửa trực tiếp, bấm "⬇ Xuất Excel" để tải file .xlsx';
}

function linkExistingGoogleSheet(sheet){
 if(sheet.googleSheetUrl){
  window.open(normalizeGoogleSheetUrl(sheet.googleSheetUrl), '_blank');
  return;
 }
 const input = prompt('Dán link Google Sheet đã có (tuỳ chọn, để trống nếu không cần):', '');
 if(!input || !input.trim()) return;
 const url = normalizeGoogleSheetUrl(input);
 sheet.googleSheetUrl = url;
 sheet.updated = new Date().toLocaleDateString('vi-VN');
 renderGoogleSheetHost(sheet);
 render();
}

function setGoogleSheetCreating(isCreating){
 createGoogleSheetLink.disabled = isCreating;
 createGoogleSheetLink.textContent = isCreating ? 'Đang tạo...' : 'Tạo Google Sheet mới';
 googleSheetCreateNote.textContent = isCreating
 ? 'Đang tạo Google Sheet thật và gắn mã Apps Script hồ sơ...'
 : 'Mỗi lần tạo Grid sẽ tạo Google Sheet mới và tự gắn mã Apps Script đính kèm hồ sơ.';
}

function applyCreatedGoogleSheet(sheet, result){
 const url = normalizeGoogleSheetUrl(result?.url || result?.spreadsheetUrl || result?.link || '');
 if(!url){
  throw new Error('Backend chưa trả về link Google Sheet.');
 }
 sheet.googleSheetUrl = url;
 sheet.googleSheetId = result?.id || result?.spreadsheetId || '';
 sheet.updated = new Date().toLocaleDateString('vi-VN');
 renderGoogleSheetHost(sheet);
 render();
}

function createGoogleSheetPayload(sheet){
 return {
  name:sheet.name || 'New Sheet',
  templateId:GOOGLE_SHEET_TEMPLATE_ID,
  project:activeProjectIndex !== null ? DATA[activeProjectIndex]?.name : '',
  type:'grid-with-attachments'
 };
}

function callSheetFactory_(action, payload, timeoutMs){
 return new Promise((resolve, reject)=>{
  let url;
  try{
   url = new URL(SHEET_FACTORY_WEB_APP_URL);
  }catch(err){
   reject(new Error('SHEET_FACTORY_WEB_APP_URL chưa đúng.'));
   return;
  }

  const callbackName = `__qlDaCb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement('script');
  const timer = window.setTimeout(()=>{
   cleanup();
   reject(new Error('Backend không phản hồi.'));
  }, timeoutMs || 45000);

  function cleanup(){
   window.clearTimeout(timer);
   delete window[callbackName];
   script.remove();
  }

  window[callbackName] = (result)=>{
   cleanup();
   if(result?.ok === false){
    reject(new Error(result.error || 'Backend báo lỗi.'));
    return;
   }
   resolve(result);
  };

  script.onerror = ()=>{
   cleanup();
   reject(new Error('Không gọi được Apps Script Web App.'));
  };

  url.searchParams.set('action', action);
  url.searchParams.set('payload', JSON.stringify(payload));
  url.searchParams.set('callback', callbackName);
  script.src = url.toString();
  document.body.appendChild(script);
 });
}

function createProjectSheetViaWebApp(payload){
 return callSheetFactory_('create', payload);
}

function fetchSheetDataViaWebApp(spreadsheetId){
 return callSheetFactory_('getdata', {spreadsheetId}).then(result => result.data);
}

function saveCellViaWebApp(spreadsheetId, row, col, value){
 return callSheetFactory_('setdata', {spreadsheetId, row, col, value}, 20000);
}

function callSheetFactoryPost_(action, payload){
 if(!SHEET_FACTORY_WEB_APP_URL) return Promise.reject(new Error('SHEET_FACTORY_WEB_APP_URL chưa đúng.'));
 return fetch(SHEET_FACTORY_WEB_APP_URL, {
  method:'POST',
  body: JSON.stringify(Object.assign({action}, payload))
 })
 .then(res => res.json())
 .then(result => {
  if(result && result.ok === false) throw new Error(result.error || 'Backend báo lỗi.');
  return result;
 });
}

function uploadFileToDriveViaWebApp(payload){
 return callSheetFactoryPost_('savefile', payload);
}

function deleteFileFromDriveViaWebApp(fileId){
 return new Promise(function(resolve, reject) {
   google.script.run
     .withSuccessHandler(function(result) { resolve(result); })
     .withFailureHandler(reject)
     .deleteAttachment(fileId);
 });
}

const pendingSheetDataSaveTimers = {};

function scheduleSheetDataSave(sheet){
 if(!sheet || !sheet.name) return;
 const key = sheet.name;
 if(pendingSheetDataSaveTimers[key]) window.clearTimeout(pendingSheetDataSaveTimers[key]);
 pendingSheetDataSaveTimers[key] = window.setTimeout(()=>{
  delete pendingSheetDataSaveTimers[key];
  saveSheetDataToWebApp(sheet).catch(()=>{});
 }, 1200);
}

function buildSheetSavePayload(sheet){
 const project = getActiveProjectName();
 if(!project || !sheet || !sheet.name) return null;
 const cells = ensureSheetCells(sheet);
 const rowMeta = cells.map(row => ({
  level: row._level || 0,
  collapsed: !!row._collapsed,
  createdBy: row._createdBy || null,
  createdAt: row._createdAt || null,
  modifiedBy: row._modifiedBy || null,
  modifiedAt: row._modifiedAt || null
 }));
 return {
  project,
  sheetName: sheet.name,
  cells,
  rowMeta,
  attachments: serializeSheetAttachments(sheet),
  cellStyles: ensureCellStyles(sheet),
  settings: ensureSheetSettings(sheet),
  columnConfigs: sheet._columnConfigs || {},
  columnTypes: sheet._columnTypes || {},
  columnFormats: sheet._columnFormats || {},
  forms: sheet._forms || [],
  publish: sheet._publish || null,
  workflows: sheet._workflows || []
 };
}

function saveSheetDataToWebApp(sheet){
 persistToDrive();
 const payload = buildSheetSavePayload(sheet);
 if(!payload) return Promise.resolve();
 persistToDrive(); return Promise.resolve();
}

function loadSheetDataFromWebApp(project, sheetName){
 if(!project || !sheetName) return Promise.resolve(null);
 return Promise.resolve(null);
}

const pendingCellSaveTimers = {};

function scheduleCellSave(sheet, row, col, value){
 scheduleSheetDataSave(sheet);
 if(!sheet.googleSheetId) return;
 const key = sheet.googleSheetId + ':' + row + ':' + col;
 if(pendingCellSaveTimers[key]) window.clearTimeout(pendingCellSaveTimers[key]);
 pendingCellSaveTimers[key] = window.setTimeout(()=>{
  delete pendingCellSaveTimers[key];
  saveCellViaWebApp(sheet.googleSheetId, row, col, value)
  .catch(err => { sheetStatus.textContent = 'Lưu lỗi: ' + err.message; });
 }, 600);
}

(function installAutoSaveOnExit(){
 let isFlushing = false;
 function hasPendingSave(){
  return Object.keys(pendingSheetDataSaveTimers).length > 0 || Object.keys(pendingCellSaveTimers).length > 0;
 }
 function forceFlushAllPendingSaves(){
  if(isFlushing || !hasPendingSave()) return Promise.resolve();
  isFlushing = true;
  Object.keys(pendingSheetDataSaveTimers).forEach(key => {
   window.clearTimeout(pendingSheetDataSaveTimers[key]);
   delete pendingSheetDataSaveTimers[key];
  });
  Object.keys(pendingCellSaveTimers).forEach(key => {
   window.clearTimeout(pendingCellSaveTimers[key]);
   delete pendingCellSaveTimers[key];
  });
  const sheet = getActiveSheet();
  const payload = buildSheetSavePayload(sheet);
  if(!payload){
   isFlushing = false;
   return Promise.resolve();
  }
  const project = getActiveProjectName();
  persistToDrive(); return Promise.resolve()
  .finally(() => { isFlushing = false; });
 }
 window.addEventListener('beforeunload', () => { forceFlushAllPendingSaves(); });
 document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden') forceFlushAllPendingSaves();
 });
 window.addEventListener('pagehide', () => { forceFlushAllPendingSaves(); });
})();

function reloadRealSheetData(sheet){
 if(!sheet.googleSheetId) return;
 sheetStatus.textContent = 'Đang tải dữ liệu mới nhất từ Google Sheets...';
 fetchSheetDataViaWebApp(sheet.googleSheetId)
 .then(data => {
  if(Array.isArray(data?.values) && data.values.length){
   sheet.cells = data.values;
  }
  if(getActiveSheet() === sheet) renderGridSheet(sheet);
  sheetStatus.textContent = 'Google Sheet thật · sửa ở lưới bên dưới sẽ tự lưu vào Google Sheets · bấm "Mở Google Sheet" để xem bản gốc';
 })
 .catch(err => {
  sheetStatus.textContent = 'Không tải được dữ liệu mới nhất: ' + err.message;
 });
}

function createRealGoogleSheetForActiveItem(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 if(sheet.googleSheetUrl){
  openGoogleSheetLink.click();
  return;
 }
 const payload = createGoogleSheetPayload(sheet);
 setGoogleSheetCreating(true);

 if(window.google?.script?.run){
  google.script.run
  .withSuccessHandler((result)=>{
   try{ applyCreatedGoogleSheet(sheet, result); }
   catch(err){ alert(err.message); }
   finally{ setGoogleSheetCreating(false); }
  })
  .withFailureHandler((err)=>{
   setGoogleSheetCreating(false);
   alert('Không tạo được Google Sheet: ' + (err?.message || err));
  })
  .createProjectSheet(payload);
  return;
 }

 if(SHEET_FACTORY_WEB_APP_URL){
  createProjectSheetViaWebApp(payload)
  .then(result => applyCreatedGoogleSheet(sheet, result))
  .catch(err => alert('Không tạo được Google Sheet: ' + err.message))
  .finally(()=> setGoogleSheetCreating(false));
  return;
 }

 setGoogleSheetCreating(false);
 alert('Chưa cấu hình backend tạo Google Sheet.');
}

async function requestDriveSignIn(){
 if(location.protocol === 'file:'){
  alert('Drive API OAuth cần chạy qua http://localhost.');
  return;
 }
 if(!DRIVE_DIRECT_CLIENT_ID){
  const id = prompt('Dán OAuth Client ID Web app của Google Cloud để bật upload Drive API trực tiếp:');
  if(!id || !id.trim()) return;
  DRIVE_DIRECT_CLIENT_ID = id.trim();
  localStorage.setItem(DRIVE_DIRECT_CLIENT_ID_KEY, DRIVE_DIRECT_CLIENT_ID);
 }
 try{
  await ensureDriveDirectToken(true);
  alert('Đã kết nối Drive API trực tiếp.');
 }catch(err){
  console.error('Drive API sign-in error:', err);
  alert('Chưa kết nối được Drive API: ' + (err.message || err));
 }
}

document.getElementById('driveApiSignInBtn').addEventListener('click', requestDriveSignIn);

function readFileAsDataUrl(file){
 return new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => resolve('');
  reader.readAsDataURL(file);
 });
}

function attachmentUploadConcurrency(){
 return canUseDriveDirectUpload() ? 3 : 2;
}

async function uploadAttachmentEntry(ctx){
 const {sheet, entry, file, projectName, archiveFolderName, rowLabel} = ctx;
 entry.driveStatus = 'uploading';
 entry.localStatus = 'saving';
 renderAttachmentPanel();
 try {
  const localResult = await saveAttachmentToLocalHelper(file, ctx);
  if(localResult){
   entry.localPath = localResult.localPath || '';
   entry.localOpenUrl = localResult.localOpenUrl || '';
   entry.localFolder = localResult.localFolder || '';
   entry.localStatus = 'done';
   if(ATTACHMENT_LARGE_FILE_MODE){
    entry.uploadMode = 'drive-desktop';
    entry.driveStatus = 'done';
    entry.driveFolderPath = entry.localFolder;
    entry.driveError = '';
    renderAttachmentPanel();
    scheduleSheetDataSave(sheet);
    return;
   }
   renderAttachmentPanel();
   scheduleSheetDataSave(sheet);
  }
 } catch(localErr) {
  entry.localStatus = 'error';
  entry.localError = localErr.message || String(localErr);
 }
 try {
  const result = await withTimeout(uploadAttachmentSmart(projectName, archiveFolderName, rowLabel, file), 45000, 'Drive upload quá 45 giây.');
  entry.driveId = result.id || result.fileId || '';
  entry.fileId = result.fileId || result.id || '';
  entry.driveLink = result.link || result.webViewLink || result.url || (entry.driveId ? `https://drive.google.com/file/d/${encodeURIComponent(entry.driveId)}/view` : '');
  entry.webViewLink = result.webViewLink || entry.driveLink;
  entry.url = result.url || entry.driveLink;
  entry.driveDownloadUrl = result.downloadUrl || result.webContentLink || '';
  entry.webContentLink = result.webContentLink || entry.driveDownloadUrl;
  entry.driveFolderId = result.folderId || '';
  entry.driveFolderName = result.folderName || archiveFolderName;
  entry.driveFolderPath = result.folderPath || `${projectName}/${archiveFolderName}`;
  entry.rowLabel = result.rowLabel || rowLabel;
  entry.uploadMode = result.uploadMode || (canUseDriveDirectUpload() ? 'drive-api' : 'apps-script');
  entry.driveStatus = 'done';
 } catch(err) {
  entry.driveStatus = 'error';
  entry.driveError = err.message || String(err);
 }
 renderAttachmentPanel();
 scheduleSheetDataSave(sheet);
}

function hasAppsScriptUploadBackend(){
 return !!window.google?.script?.run && typeof google.script.run.withSuccessHandler === 'function';
}

function hasWebAppUploadBackend(){
 return !!SHEET_FACTORY_WEB_APP_URL && /^https:\/\/script\.google\.com\/macros\/s\//.test(SHEET_FACTORY_WEB_APP_URL);
}

function uploadBackendUnavailableMessage(){
 if(location.protocol === 'file:'){
  return 'Chưa thể upload khi mở bằng file://. Hãy mở qua http://localhost.';
 }
 if(!DRIVE_DIRECT_CLIENT_ID && !hasWebAppUploadBackend()){
  return 'Chưa cấu hình OAuth Client ID và chưa có Web App URL.';
 }
 if(!window.google?.accounts?.oauth2){
  return 'Google Identity Services chưa sẵn sàng.';
 }
 return 'Chưa có kênh upload khả dụng.';
}

function canUseDriveDirectUpload(){
 return !!DRIVE_DIRECT_CLIENT_ID && location.protocol !== 'file:' && !!window.google?.accounts?.oauth2;
}

function waitForGoogleIdentity(){
 if(window.google?.accounts?.oauth2) return Promise.resolve();
 return new Promise((resolve, reject) => {
  const started = Date.now();
  const timer = setInterval(() => {
   if(window.google?.accounts?.oauth2){
    clearInterval(timer);
    resolve();
   }else if(Date.now() - started > 8000){
    clearInterval(timer);
    reject(new Error('Google Identity Services chưa tải xong.'));
   }
  }, 80);
 });
}

async function ensureDriveDirectToken(interactive = false){
 if(driveDirectAccessToken && Date.now() < driveDirectTokenExpiresAt - 60000){
  return driveDirectAccessToken;
 }
 if(!DRIVE_DIRECT_CLIENT_ID){
  throw new Error('Chưa cấu hình OAuth Client ID.');
 }
 if(location.protocol === 'file:'){
  throw new Error('Drive API OAuth cần chạy qua http://localhost.');
 }
 await waitForGoogleIdentity();
 return new Promise((resolve, reject) => {
  driveDirectTokenClient = driveDirectTokenClient || google.accounts.oauth2.initTokenClient({
   client_id: DRIVE_DIRECT_CLIENT_ID,
   scope: DRIVE_DIRECT_SCOPE,
   callback: '',
   error_callback: (err) => reject(err)
  });
  driveDirectTokenClient.callback = (resp) => {
   if(resp.error){
    reject(new Error(resp.error_description || resp.error));
    return;
   }
   driveDirectAccessToken = resp.access_token;
   driveDirectTokenExpiresAt = Date.now() + Number(resp.expires_in || 3600) * 1000;
   resolve(driveDirectAccessToken);
  };
  driveDirectTokenClient.requestAccessToken({prompt: interactive || !driveDirectAccessToken ? 'consent' : ''});
 });
}

function driveApiEscapeQuery(value){
 return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function driveApiFetch(url, options = {}){
 const token = await ensureDriveDirectToken(false);
 const headers = new Headers(options.headers || {});
 headers.set('Authorization', 'Bearer ' + token);
 const res = await fetch(url, {...options, headers});
 if(!res.ok){
  const txt = await res.text().catch(() => '');
  throw new Error(`Drive API lỗi ${res.status}: ${txt || res.statusText}`);
 }
 if(res.status === 204) return {};
 return res.json();
}

async function findDriveFolderByName(name, parentId = ''){
 const clauses = [
  "mimeType='application/vnd.google-apps.folder'",
  "trashed=false",
  `name='${driveApiEscapeQuery(name)}'`
 ];
 if(parentId) clauses.push(`'${driveApiEscapeQuery(parentId)}' in parents`);
 const q = encodeURIComponent(clauses.join(' and '));
 const url = `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=1`;
 const data = await driveApiFetch(url);
 return data.files?.[0] || null;
}

async function createDriveFolder(name, parentId = ''){
 const metadata = {name, mimeType:'application/vnd.google-apps.folder'};
 if(parentId) metadata.parents = [parentId];
 return driveApiFetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
  method:'POST',
  headers:{'Content-Type':'application/json; charset=UTF-8'},
  body:JSON.stringify(metadata)
 });
}

async function ensureDriveFolder(name, parentId = ''){
 return await findDriveFolderByName(name, parentId) || await createDriveFolder(name, parentId);
}

async function ensureDriveDirectTargetFolder(projectName, folderName){
 const root = await ensureDriveFolder(DRIVE_DIRECT_ROOT_FOLDER);
 const project = await ensureDriveFolder(projectName || 'Du an chua dat ten', root.id);
 const archiveNames = (typeof PROJECT_ARCHIVE_GROUPS !== 'undefined' ? PROJECT_ARCHIVE_GROUPS : [])
  .map(item => item.uploadFolder || item.name)
  .filter(Boolean);
 for(const name of archiveNames){
  await ensureDriveFolder(name, project.id);
 }
 const target = await ensureDriveFolder(folderName || '05_TONG_HOP_DOI_CHIEU', project.id);
 return {
  folderId: target.id,
  folderName: target.name,
  folderPath: `${DRIVE_DIRECT_ROOT_FOLDER}/${projectName}/${target.name}`
 };
}

async function prepareAttachmentFolder(projectName, folderName){
 if(hasAppsScriptUploadBackend()){
  try{
   return await prepareAttachmentFolderViaGs(projectName, folderName);
  }catch(err){
   console.warn('prepareAttachmentFolder via Apps Script failed:', err);
  }
 }
 return ensureDriveDirectTargetFolder(projectName, folderName);
}

function prepareAttachmentFolderViaGs(projectName, folderName){
 return new Promise(function(resolve, reject) {
  google.script.run
   .withSuccessHandler(function(result) {
    if(result && result.ok) resolve(result);
    else reject(result && result.error || 'Prepare folder failed');
   })
   .withFailureHandler(reject)
   .prepareAttachmentFolder(projectName, folderName);
 });
}

async function uploadAttachmentSmart(projectName, folderName, rowLabel, file){
 if(canUseDriveDirectUpload()){
  try{
   return await uploadAttachmentViaDriveApi(projectName, folderName, rowLabel, file);
  }catch(err){
   console.warn('Drive API direct upload failed:', err);
  }
 }
 const dataUrl = await readFileAsDataUrl(file);
 const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
 if(hasAppsScriptUploadBackend()){
  return uploadAttachmentViaGs(projectName, folderName, rowLabel, file.name, file.type, base64Data);
 }
 if(hasWebAppUploadBackend()){
  return uploadAttachmentViaWebApp(projectName, folderName, rowLabel, file.name, file.type, base64Data);
 }
 throw new Error(uploadBackendUnavailableMessage());
}

async function uploadAttachmentViaDriveApi(projectName, folderName, rowLabel, file){
 await ensureDriveDirectToken(false);
 const folder = await prepareAttachmentFolder(projectName, folderName);
 const uploaded = file.size >= DRIVE_DIRECT_RESUMABLE_THRESHOLD
  ? await driveApiResumableUpload(file, folder.folderId, rowLabel)
  : await driveApiMultipartUpload(file, folder.folderId, rowLabel);
 await driveApiShareAnyone(uploaded.id).catch(err => console.warn('Cannot share uploaded file:', err));
 const meta = await driveApiFetch(`https://www.googleapis.com/drive/v3/files/${uploaded.id}?fields=id,name,mimeType,size,webViewLink,webContentLink`);
 return {
  ok:true,
  id: meta.id,
  name: meta.name,
  mimeType: meta.mimeType,
  size: Number(meta.size || file.size || 0),
  link: meta.webViewLink,
  url: meta.webViewLink,
  downloadUrl: meta.webContentLink || meta.webViewLink,
  folderId: folder.folderId,
  folderName: folder.folderName || folderName,
  folderPath: folder.folderPath || `${DRIVE_DIRECT_ROOT_FOLDER}/${projectName}/${folderName}`,
  rowLabel,
  uploadMode:'drive-api'
 };
}

async function driveApiMultipartUpload(file, folderId, rowLabel){
 const boundary = 'qlda_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
 const metadata = {
  name: file.name,
  parents: [folderId],
  description: 'Row: ' + rowLabel
 };
 const body = new Blob([
  `--${boundary}\r\n`,
  'Content-Type: application/json; charset=UTF-8\r\n\r\n',
  JSON.stringify(metadata),
  `\r\n--${boundary}\r\n`,
  `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
  file,
  `\r\n--${boundary}--`
 ], {type:`multipart/related; boundary=${boundary}`});
 return driveApiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size,mimeType', {
  method:'POST',
  headers:{'Content-Type':`multipart/related; boundary=${boundary}`},
  body
 });
}

async function driveApiResumableUpload(file, folderId, rowLabel){
 const token = await ensureDriveDirectToken(false);
 const metadata = {
  name: file.name,
  parents: [folderId],
  description: 'Row: ' + rowLabel
 };
 const init = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink,webContentLink,size,mimeType', {
  method:'POST',
  headers:{
   'Authorization':'Bearer ' + token,
   'Content-Type':'application/json; charset=UTF-8',
   'X-Upload-Content-Type': file.type || 'application/octet-stream',
   'X-Upload-Content-Length': String(file.size)
  },
  body:JSON.stringify(metadata)
 });
 if(!init.ok){
  const txt = await init.text().catch(() => '');
  throw new Error(`Drive resumable init lỗi ${init.status}: ${txt || init.statusText}`);
 }
 const uploadUrl = init.headers.get('Location');
 if(!uploadUrl) throw new Error('Drive API không trả resumable upload URL.');
 const res = await fetch(uploadUrl, {
  method:'PUT',
  headers:{'Content-Type': file.type || 'application/octet-stream'},
  body:file
 });
 if(!res.ok){
  const txt = await res.text().catch(() => '');
  throw new Error(`Drive resumable upload lỗi ${res.status}: ${txt || res.statusText}`);
 }
 return res.json();
}

async function driveApiShareAnyone(fileId){
 return driveApiFetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?fields=id`, {
  method:'POST',
  headers:{'Content-Type':'application/json; charset=UTF-8'},
  body:JSON.stringify({role:'reader', type:'anyone'})
 });
}

function uploadAttachmentViaGs(projectName, sheetName, rowLabel, fileName, mimeType, base64Data) {
 if(!hasAppsScriptUploadBackend()){
   return Promise.reject(new Error(uploadBackendUnavailableMessage()));
 }
 return new Promise(function(resolve, reject) {
   google.script.run
     .withSuccessHandler(function(result) {
       if (result && result.ok) resolve(result);
       else reject(result && result.error || 'Upload failed');
     })
     .withFailureHandler(reject)
     .uploadAttachment(projectName, sheetName, rowLabel, fileName, mimeType, base64Data);
 });
}

async function callAppsScriptWebApp(payload){
 if(!hasWebAppUploadBackend()) throw new Error(uploadBackendUnavailableMessage());
 const res = await fetch(SHEET_FACTORY_WEB_APP_URL, {
   method:'POST',
   body:JSON.stringify(payload),
   redirect:'follow'
 });
 const text = await res.text();
 let data;
 try {
   data = JSON.parse(text);
 } catch(err) {
   throw new Error('Web App không trả JSON hợp lệ.');
 }
 if(!data || !data.ok) throw new Error(data && data.error ? data.error : 'Web App upload failed');
 return data;
}

function uploadAttachmentViaWebApp(projectName, sheetName, rowLabel, fileName, mimeType, base64Data){
 return callAppsScriptWebApp({
   action:'savefile',
   project: projectName,
   sheetName,
   rowLabel,
   fileName,
   mimeType,
   base64Data
 });
}

async function deleteAttachmentFile(fileId) {
 if(hasAppsScriptUploadBackend()){
   return new Promise(function(resolve, reject) {
     google.script.run
       .withSuccessHandler(function(result) {
         if (result && result.ok) resolve(result);
         else reject(result && result.error || 'Delete failed');
       })
       .withFailureHandler(reject)
       .deleteAttachment(fileId);
   });
 }
 if(hasWebAppUploadBackend()){
   return callAppsScriptWebApp({action:'deletefile', fileId});
 }
 return Promise.reject(new Error(uploadBackendUnavailableMessage()));
}

document.addEventListener('click', ()=>{
 closeContextMenu();
 closeLayoutMenu();
 closeFavorites();
});

document.addEventListener('keydown', (e)=>{
 if(e.key === 'Escape'){
  closeContextMenu();
  closeLayoutMenu();
  closeSheetNameModal();
  closeWorkspaceItemMenu();
  closeWorkspaceNavigator();
 }
});
