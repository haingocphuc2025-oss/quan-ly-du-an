const DRIVE_DIRECT_CLIENT_ID_KEY = 'qlda_drive_api_client_id';

function loadFromDrive() {
  if(!window.google?.script?.run){
    showSaveStatus('saving');
    loadProjectDiskBackup()
      .catch(err => {
        console.warn('Cannot load project disk backup:', err);
        loadProjectLocalBackup();
      })
      .finally(() => {
        projectStorageReady = true;
        normalizeAllProjectFolders();
        showSaveStatus('saved');
        render();
        refreshWorkspaceFolderTreeIfVisible();
      });
    return;
  }
  showSaveStatus('saving');
  google.script.run
    .withSuccessHandler(function(data) {
      if (data && data.projects && data.projects.length > 0) {
        DATA.length = 0;
        data.projects.forEach(function(p) { DATA.push(p); });
        if (data.folders && Array.isArray(data.folders)) {
          PROJECT_FOLDERS.length = 0;
          data.folders.forEach(function(f) { PROJECT_FOLDERS.push(f); });
        }
        normalizeAllProjectFolders();
      }
      showSaveStatus('saved');
      render();
      refreshWorkspaceFolderTreeIfVisible();
    })
    .withFailureHandler(function(err) {
      console.error('Load error:', err);
      showSaveStatus('error');
      render();
      refreshWorkspaceFolderTreeIfVisible();
    })
    .loadAppData();
}

function saveToDrive(data) {
  if(!window.google?.script?.run){
    showSaveStatus('saved');
    return;
  }
  showSaveStatus('saving');
  google.script.run
    .withSuccessHandler(function() { showSaveStatus('saved'); })
    .withFailureHandler(function(err) {
      console.error('Save error:', err);
      showSaveStatus('error');
    })
    .saveAppData(data);
}

const PROJECT_LOCAL_SAVE_KEY = 'qlda_project_local_backup_v1';
const projectStorageSessionId = globalThis.crypto?.randomUUID?.()
 || `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
let projectStorageRevision = 0;
let projectStorageSessionSequence = 0;
let projectStorageReady = false;

function nextProjectStorageSequence(){ return ++projectStorageSessionSequence; }


function cloneJsonForProjectSave(value){
 return JSON.parse(JSON.stringify(value));
}

function syncVisibleSheetDomToData(){
 const sheet = getActiveSheet();
 if(!sheet || !sheetGridWrap) return false;
 const cells = ensureSheetCells(sheet);
 let changed = false;
 sheetGridWrap.querySelectorAll('.sheet-cell[data-r][data-c]').forEach(cell => {
  const row = Number(cell.dataset.r);
  const col = Number(cell.dataset.c);
  if(!Number.isFinite(row) || !Number.isFinite(col)) return;
  if(row <= 0 || col <= 1) return;
  if(!isEditableSheetCell(row, col)) return;
  while(cells.length <= row) cells.push(Array.from({length:cells[0].length}, () => ''));
  while(cells[row].length <= col) cells[row].push('');
  const value = cell.textContent;
  if(cells[row][col] !== value){
   cells[row][col] = value;
   changed = true;
  }
 });
 return changed;
}

function buildProjectSaveSnapshot(){
 flushCurrentUiEditsBeforeSave();
 syncVisibleSheetDomToData();
 return {
  savedAt: new Date().toISOString(),
  projects: cloneJsonForProjectSave(DATA),
  folders: cloneJsonForProjectSave(PROJECT_FOLDERS),
  uiState: collectProjectUiState(),
  _storageMeta: {
   baseRevision: projectStorageRevision,
   sessionId: projectStorageSessionId,
   sessionSequence: nextProjectStorageSequence()
  }
 };
}

function saveProjectLocalBackup(){
 localStorage.setItem(PROJECT_LOCAL_SAVE_KEY, JSON.stringify(buildProjectSaveSnapshot()));
}

function loadProjectLocalBackup(){
 try{
  const raw = localStorage.getItem(PROJECT_LOCAL_SAVE_KEY);
  if(!raw) return false;
  const saved = JSON.parse(raw);
  return applyProjectSnapshot(saved);
 }catch(err){
  console.warn('Cannot load local project backup:', err);
  return false;
 }
}

function applyProjectSnapshot(saved){
 if(!saved || !Array.isArray(saved.projects) || !Array.isArray(saved.folders)) return false;
 const meta = saved._storageMeta;
 if(meta && Number.isFinite(Number(meta.revision))){
  projectStorageRevision = Math.max(0, Number(meta.revision));
 }
 projectStorageReady = true;
 DATA.length = 0;
 saved.projects.forEach(item => DATA.push(item));
 PROJECT_FOLDERS.length = 0;
 saved.folders.forEach(item => PROJECT_FOLDERS.push(item));
 applyProjectUiState(saved.uiState);
 return true;
}

async function saveProjectDiskBackup(){
 if(location.hostname !== '127.0.0.1' && location.hostname !== 'localhost') return null;
 const response = await fetch(`${LOCAL_FILE_HELPER_URL}/project`, {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify(buildProjectSaveSnapshot())
 });
 const result = await response.json();
 if(!response.ok || !result.ok){
  const error = new Error(result.error || 'Project save failed.');
  error.code = result.conflict ? 'PROJECT_SAVE_CONFLICT' : 'PROJECT_SAVE_FAILED';
  error.conflictFile = result.conflictFile || '';
  throw error;
 }
 if(Number.isFinite(Number(result.revision))){
  projectStorageRevision = Math.max(projectStorageRevision, Number(result.revision));
 }
 if(!response.ok || !result.ok) throw new Error(result.error || 'Không lưu được file dự án.');
 return result;
}

async function loadProjectDiskBackup(){
 if(location.hostname !== '127.0.0.1' && location.hostname !== 'localhost') return false;
 const response = await fetch(`${LOCAL_FILE_HELPER_URL}/project`);
 const result = await response.json();
 if(!response.ok) throw new Error(result.error || 'Không đọc được file dự án.');
 if(!result.ok || !result.data) return loadProjectLocalBackup();
 const ok = applyProjectSnapshot(result.data);
 if(ok) saveProjectLocalBackup();
 return ok;
}

function persistToDrive() {
  saveProjectLocalBackup();
  saveProjectDiskBackup().catch(err => console.warn('Disk project save failed:', err));
  saveToDrive({ projects: DATA, folders: PROJECT_FOLDERS });
}

function flushCurrentUiEditsBeforeSave(){
 if(editingCell) commitEditingCell(editingCell);
 const reportEditing = reportGridWrap?.querySelector?.('.report-editable-cell:focus');
 if(reportEditing) reportEditing.blur();
 const sheet = getActiveSheet();
 const activeCell = sheetGridWrap?.querySelector?.('.sheet-cell.active-cell');
 if(sheet && activeCell && document.activeElement === formulaInput){
  const row = Number(activeCell.dataset.r);
  const col = Number(activeCell.dataset.c);
  if(isEditableSheetCell(row, col)){
   setSheetCellValue(sheet, row, col, formulaInput.value);
   activeCell.textContent = formulaInput.value;
  }
 }
 if(syncVisibleSheetDomToData() && sheet) scheduleSheetDataSave(sheet);
}

async function saveProjectNow(){
  flushCurrentUiEditsBeforeSave();
  showSaveStatus('saving');
  try{
   saveProjectLocalBackup();
   await saveProjectDiskBackup();
   saveToDrive({ projects: DATA, folders: PROJECT_FOLDERS });
   showSaveStatus('saved');
  }catch(err){
   console.error('Save project error:', err);
   showSaveStatus('error');
   alert('Không lưu được file dự án: ' + (err?.message || err));
  }
}

async function saveCurrentProjectStateSilently(){
 try{
  flushCurrentUiEditsBeforeSave();
  saveProjectLocalBackup();
  await saveProjectDiskBackup();
  saveToDrive({ projects: DATA, folders: PROJECT_FOLDERS });
  showSaveStatus('saved');
 }catch(err){
  console.warn('Silent project save failed:', err);
  showSaveStatus('error');
 }
}

function saveProjectBeforeUnload(){
 if(!projectStorageReady) return;
 try{
  const snapshot = buildProjectSaveSnapshot();
  const body = JSON.stringify(snapshot);
  localStorage.setItem(PROJECT_LOCAL_SAVE_KEY, body);
  if((location.hostname === '127.0.0.1' || location.hostname === 'localhost') && navigator.sendBeacon){
   const blob = new Blob([body], {type:'application/json'});
   navigator.sendBeacon(`${LOCAL_FILE_HELPER_URL}/project`, blob);
  }
 }catch(err){
  console.warn('Before unload save failed:', err);
 }
}

window.addEventListener('beforeunload', saveProjectBeforeUnload);

function showSaveStatus(status) {
  const el = document.getElementById('saveStatus');
  if (!el) return;
  const map = { saving: '⏳ Đang lưu...', saved: '✅ Đã lưu', error: '❌ Lỗi lưu' };
  el.textContent = map[status] || '';
  if (status === 'saved') setTimeout(function() { el.textContent = ''; }, 2000);
}

async function saveProjectData(projectId, projectData) {
  persistToDrive();
  return Promise.resolve();
}

async function loadProjectData(projectId) {
  return Promise.resolve(null);
}

const COL_WIDTH_STORAGE_KEY = 'qlda_colWidths_v1';

function loadColWidths(){
 try{
  const parsed = JSON.parse(localStorage.getItem(COL_WIDTH_STORAGE_KEY) || '{}');
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
 }catch(e){ return {}; }
}

function sanitizeColWidths(widths){
 const clean = {};
 if(!widths || typeof widths !== 'object' || Array.isArray(widths)) return clean;
 Object.entries(widths).forEach(([key, value]) => {
  const width = Number(value);
  if(typeof key === 'string' && key && Number.isFinite(width) && width >= 40 && width <= 1200){
   clean[key] = Math.round(width);
  }
 });
 return clean;
}

function saveColWidthsStore(widths){
 localStorage.setItem(COL_WIDTH_STORAGE_KEY, JSON.stringify(sanitizeColWidths(widths)));
}

function getStoredColWidth(key, fallback){
 const w = loadColWidths()[key];
 return (typeof w === 'number' && w >= 40) ? w : fallback;
}

function saveColWidth(key, width){
 const store = loadColWidths();
 store[key] = Math.round(width);
 saveColWidthsStore(store);
 saveProjectLocalBackup();
}

function collectProjectUiState(){
 return {
  colWidths: sanitizeColWidths(loadColWidths()),
  projectColumnWidth: Number(localStorage.getItem('projectColumnWidth')) || null
 };
}

function applyProjectUiState(uiState){
 if(!uiState || typeof uiState !== 'object') return;
 if(uiState.colWidths) saveColWidthsStore(uiState.colWidths);
 const projectColumnWidth = Number(uiState.projectColumnWidth);
 if(Number.isFinite(projectColumnWidth) && projectColumnWidth > 0){
  localStorage.setItem('projectColumnWidth', String(Math.round(projectColumnWidth)));
 }
}

function getSavedFilters(sheet){
 if(!sheet._config || typeof sheet._config !== 'object') sheet._config = {};
 if(!Array.isArray(sheet._config.savedFilters)) sheet._config.savedFilters = [];
 return sheet._config.savedFilters;
}

function saveCurrentFilter(sheet, name){
 const saved = getSavedFilters(sheet);
 const filters = sheet._filters || [];
 if(!filters.length && !name) return;
 const label = name || `Bộ lọc ${saved.length + 1}`;
 const existing = saved.findIndex(s => s.name === label);
 const entry = {name: label, filters: filters.map(f => ({...f})), timestamp: Date.now()};
 if(existing >= 0) saved[existing] = entry;
 else saved.push(entry);
 sheet._config.savedFilters = saved;
 scheduleSheetDataSave(sheet);
}

function loadSavedFilter(sheet, name){
 const saved = getSavedFilters(sheet);
 const entry = saved.find(s => s.name === name);
 if(!entry) return;
 sheet._filters = entry.filters.map(f => ({...f}));
 renderGridSheet(sheet);
 renderFilterPopover(sheet);
 scheduleSheetDataSave(sheet);
}

const RAIL_COLLAPSED_STORAGE_KEY = 'qlda_railCollapsed';

const LOCAL_FILE_HELPER_URL = 'http://127.0.0.1:8780';

const ATTACHMENT_LARGE_FILE_MODE = true;

async function saveAttachmentToLocalHelper(file, ctx){
 if(location.hostname !== '127.0.0.1' && location.hostname !== 'localhost') return null;
 const dataUrl = await readFileAsDataUrl(file);
 if(!dataUrl) return null;
 const response = await fetch(`${LOCAL_FILE_HELPER_URL}/save`, {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
   projectName:ctx.projectName,
   folderName:ctx.archiveFolderName,
   rowLabel:ctx.rowLabel,
   fileName:file.name,
   mimeType:file.type,
   dataUrl
  })
 });
 const result = await response.json();
 if(!response.ok || !result.ok) throw new Error(result.error || 'Local helper save failed');
 return result;
}
