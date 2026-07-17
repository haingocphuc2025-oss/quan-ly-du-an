const sheetNameModal = document.getElementById('sheetNameModal');

const sheetNameInput = document.getElementById('sheetNameInput');

const sheetNameOk = document.getElementById('sheetNameOk');

const sheetNameCancel = document.getElementById('sheetNameCancel');

const sheetNameClose = document.getElementById('sheetNameClose');

const gridSheetView = document.getElementById('gridSheetView');

const sheetGridWrap = document.getElementById('sheetGridWrap');

const activeSheetName = document.getElementById('activeSheetName');

const activeCellRef = document.getElementById('activeCellRef');

const formulaInput = document.getElementById('formulaInput');

const backToWorkspace = document.getElementById('backToWorkspace');

const toggleSheetChrome = document.getElementById('toggleSheetChrome');

const sheetUndoBtn = document.getElementById('sheetUndoBtn');

const sheetRedoBtn = document.getElementById('sheetRedoBtn');

const sheetPrintBtn = document.getElementById('sheetPrintBtn');

const ssMoreBtn = document.getElementById('ssMoreBtn');

const ssMoreMenu = document.getElementById('ssMoreMenu');

const topAutomationBtn = document.getElementById('topAutomationBtn');

const topFormsBtn = document.getElementById('topFormsBtn');

const topConnectionsBtn = document.getElementById('topConnectionsBtn');

const saveProjectBtn = document.getElementById('saveProjectBtn');

const closeSheetNav = document.getElementById('closeSheetNav');

document.getElementById('attachPanel')?.remove();

const attachmentPanel = document.getElementById('attachmentPanel');

const attachTitle = document.getElementById('attachTitle');

const attachSub = document.getElementById('attachSub');

const attachList = document.getElementById('attachList');

const attachClose = document.getElementById('attachClose');

const attachUploadBtn = document.getElementById('attachUploadBtn');

const attachInput = document.getElementById('attachInput');

const selectedAttachmentIndexes = new Set();

let attachmentActionsOpen = false;

attachList.addEventListener('dragover', (e)=>{
 e.preventDefault();
 attachList.classList.add('drag-over');
});

attachList.addEventListener('dragleave', ()=>{
 attachList.classList.remove('drag-over');
});

attachList.addEventListener('drop', (e)=>{
 e.preventDefault();
 attachList.classList.remove('drag-over');
 if(activeAttachmentRow === null) return;
 addAttachmentFiles(e.dataTransfer.files);
});

attachList.addEventListener('click', (e)=>{
 const actionsBtn = e.target.closest('.attach-actions');
 if(actionsBtn){
  attachmentActionsOpen = !attachmentActionsOpen;
  renderAttachmentPanel();
  return;
 }
 const bulkAction = e.target.closest('[data-attach-bulk]');
 if(bulkAction){
  attachmentActionsOpen = false;
  if(bulkAction.dataset.attachBulk === 'download') downloadSelectedAttachments();
  if(bulkAction.dataset.attachBulk === 'delete') deleteSelectedAttachments();
  return;
 }
 const previewBtn = e.target.closest('.attach-file-preview');
 const fileLink = e.target.closest('.attach-file-name');
 if(previewBtn || fileLink){
  e.preventDefault();
  const source = previewBtn || fileLink;
  const sheet = getAttachmentSheet();
  if(!sheet || activeAttachmentRow === null) return;
  const files = ensureSheetAttachments(sheet)[activeAttachmentRow] || [];
  const file = files[Number(source.dataset.fileI)];
  if(!getAttachmentPreviewState(file).ready) return;
  const opened = openAttachmentPreview(file);
  if(!opened && fileLink?.href && fileLink.href !== '#'){
   window.open(fileLink.href, '_blank', 'noopener');
  }
  return;
 }
 const removeBtn = e.target.closest('.attach-file-remove');
 if(!removeBtn) return;
 const sheet = getAttachmentSheet();
 if(!sheet || activeAttachmentRow === null) return;
 const store = ensureSheetAttachments(sheet);
 const files = store[activeAttachmentRow] || [];
 const [removed] = files.splice(Number(removeBtn.dataset.fileI), 1);
 selectedAttachmentIndexes.clear();
 attachmentActionsOpen = false;
 store[activeAttachmentRow] = files;
 syncAttachmentCell(sheet, activeAttachmentRow);
 refreshReportAttachmentBadge(activeAttachmentSource, activeAttachmentRow);
 renderAttachmentPanel();
 scheduleSheetDataSave(sheet);
 const removedDriveId = removed && getAttachmentDriveId(removed);
 if(removedDriveId){
  deleteAttachmentFile(removedDriveId).catch(()=>{});
 }
});

attachList.addEventListener('change', (e)=>{
 const selectAll = e.target.closest('.attach-select-all');
 if(selectAll){
  const sheet = getAttachmentSheet();
  const files = sheet && activeAttachmentRow !== null
   ? (ensureSheetAttachments(sheet)[activeAttachmentRow] || [])
   : [];
  selectedAttachmentIndexes.clear();
  if(selectAll.checked) files.forEach((_, index)=>selectedAttachmentIndexes.add(index));
  attachmentActionsOpen = false;
  renderAttachmentPanel();
  return;
 }
 const fileCheck = e.target.closest('.attach-file-check');
 if(!fileCheck) return;
 const index = Number(fileCheck.dataset.fileI);
 if(fileCheck.checked) selectedAttachmentIndexes.add(index);
 else selectedAttachmentIndexes.delete(index);
 attachmentActionsOpen = false;
 renderAttachmentPanel();
});

backToWorkspace.addEventListener('click', ()=>{
 saveCurrentProjectStateSilently();
 if(activeProjectIndex !== null) openDetail(activeProjectIndex);
});

toggleSheetChrome.addEventListener('click', (e)=>{
 e.stopPropagation();
 const collapsed = appShell.classList.toggle('sheet-nav-collapsed');
 toggleSheetChrome.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
 toggleSheetChrome.title = collapsed ? 'Hien panel lam viec' : 'An panel lam viec';
});

closeSheetNav.addEventListener('click', (e)=>{
 e.stopPropagation();
 saveCurrentProjectStateSilently();
 appShell.classList.add('sheet-nav-collapsed');
 toggleSheetChrome.setAttribute('aria-pressed', 'true');
 toggleSheetChrome.title = 'Hien panel lam viec';
});

const sheetStatus = document.getElementById('sheetStatus');

let ctxProjectIndex = null;

let pendingGridProjectIndex = null;

let activeSheetContext = null;

let activeAttachmentRow = null;

let activeAttachmentSource = null;

let editingCell = null;

let isSelectingRange = false;

let selRangeAnchor = null;

let selRangeEnd = null;

let sheetColumnSelectAnchor = null;

let sheetColumnSelection = null;

function columnName(index){
 let name = '';
 let n = index + 1;
 while(n > 0){
 const remainder = (n - 1) % 26;
 name = String.fromCharCode(65 + remainder) + name;
 n = Math.floor((n - 1) / 26);
 }
 return name;
}

function cellRef(rowIndex, colIndex){
 return `${columnName(colIndex)}${rowIndex + 1}`;
}

const STATUS_CYCLE = ['', 'red', 'yellow', 'green'];

const STATUS_HEX = {'':'#D1D5DB', red:'#EF4444', yellow:'#F59E0B', green:'#10B981'};

function formatAutoNumberValue(number, config = {}){
 const digits = Number(config.digits ?? 4);
 const numeric = String(Math.max(0, Number(number) || 0)).padStart(digits, '0');
 return `${config.prefix || ''}${numeric}${config.suffix || ''}`;
}

function checkboxDisplayIcon(config = {}){
 return {check:'✓', flag:'⚑', star:'★'}[config.checkboxStyle || 'check'] || '✓';
}

const PROJECT_CONTACTS = [
 {name:'Quân Trinh', email:'quan@example.com', phone:''},
 {name:'Nguyễn Văn Hùng', email:'hung@example.com', phone:''},
 {name:'Bùi Văn Toàn', email:'toan@example.com', phone:''},
 {name:'Lê Văn Lương', email:'luong@example.com', phone:''},
 {name:'Trần Dũng', email:'dung@example.com', phone:''}
];

const Formatters = {
 number(value, config = {}){
 if(value === '' || value === null || value === undefined) return '';
 const num = Number(String(value).replace(/\\s/g, '').replace(',', '.'));
 if(Number.isNaN(num)) return value;
 const decimals = Number(config.decimals ?? 2);
 const thousands = config.thousandsSeparator ?? '.';
 const decimal = config.decimalSeparator ?? ',';
 const fixed = num.toFixed(decimals);
 const [intPart, decPart] = fixed.split('.');
 const grouped = intPart.replace(/\\B(?=(\\d{3})+(?!\\d))/g, thousands);
 return `${config.prefix || ''}${grouped}${decimals ? decimal + decPart : ''}${config.suffix || ''}`;
 },
 currency(value, config = {}){
 if(value === '' || value === null || value === undefined) return '';
 const symbols = {VND:'₫', USD:'$', EUR:'€', GBP:'£', JPY:'¥'};
 const symbol = symbols[config.currency || 'VND'] || (config.currency || '');
 const formatted = Formatters.number(value, {thousandsSeparator:'.', decimalSeparator:',', decimals:config.decimals ?? 0});
 return config.symbolPosition === 'suffix' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
 },
 percent(value, config = {}){
 if(value === '' || value === null || value === undefined) return '';
 const num = Number(value);
 if(Number.isNaN(num)) return value;
 return `${num.toFixed(Number(config.decimals ?? 1))}${config.showPercentSign === false ? '' : '%'}`;
 },
 date(value, config = {}){
 if(!value) return '';
 let date = null;
 if(/^\\d{2}\/\\d{2}\/\\d{2,4}$/.test(String(value))){
 const [a,b,c] = String(value).split('/');
 date = new Date(Number(c.length === 2 ? `20${c}` : c), Number(a) - 1, Number(b));
 } else {
 date = new Date(value);
 }
 if(!date || Number.isNaN(date.getTime())) return value;
 const dd = String(date.getDate()).padStart(2, '0');
 const mm = String(date.getMonth() + 1).padStart(2, '0');
 const yyyy = String(date.getFullYear());
 const format = config.format || 'dd/mm/yyyy';
 return format.replace('dd', dd).replace('mm', mm).replace('yyyy', yyyy);
 },
 multi_select(value){
  return String(value || '').split(',').map(v => v.trim()).filter(Boolean).map(v => '<span class="multi-select-chip">' + escapeHtml(v) + '</span>').join(' ');
 },
 contact(value){
 const contacts = parseContactValue(value);
 if(!contacts.length) return '';
 const first = contacts[0];
 const more = contacts.length > 1 ? `, +${contacts.length - 1}` : '';
 const initial = escapeHtml((first.name || first.email || '?').trim().charAt(0).toUpperCase() || '?');
 return `<span class="contact-chip"><span class="contact-avatar">${initial}</span>${escapeHtml(first.name || first.email)}${more}</span>`;
 },
 duration(value){ return formatDurationMinutes(value); },
 auto_number(value){ return value || ''; },
 created_by(value){ return value || '—'; },
 created_date(value){ return formatDateTimeVN(value); },
 modified_by(value){ return value || '—'; },
 modified_date(value){ return formatDateTimeVN(value); },
 defaultConfig(type){
 if(type === 'number') return {decimals:2, thousandsSeparator:'.', decimalSeparator:','};
 if(type === 'currency') return {currency:'VND', decimals:0, symbolPosition:'suffix'};
 if(type === 'percent') return {decimals:1, showPercentSign:true};
 if(type === 'date') return {format:'dd/mm/yyyy'};
 if(type === 'symbols') return {symbolSet:'ryg', symbols:['🔴','🟡','🟢'], restrictToSymbolValues:true};
 if(type === 'checkbox') return {checkboxStyle:'check', restrictToToggle:true};
 if(type === 'auto_number') return {prefix:'', suffix:'', digits:4, autoStart:1, autoNext:1};
 return {};
 }
};

const SHEET_COLUMN_CONFIG = [
 {key:'attach', label:'📎', type:'attachment', width:46, frozen:true},
 {key:'status', label:'●', type:'status', width:64, frozen:true},
 {key:'stt', label:'STT', type:'text', width:70},
 {key:'loaiHoSo', label:'Loại hồ sơ', type:'dropdown', width:190, options:['Hợp đồng - pháp lý','Trình duyệt vật liệu','Nghiệm thu vật liệu','CO CQ','Nghiệm thu công việc','Thanh toán','Quyết toán','Đối chiếu','Danh mục']},
 {key:'hangMuc', label:'Hạng mục', type:'text', width:180},
 {key:'soVanBan', label:'Số văn bản', type:'text', width:140},
 {key:'ngayVanBan', label:'Ngày văn bản', type:'date', width:130, dateFormat:'dd/mm/yyyy', format:Formatters.defaultConfig('date')},
 {key:'noiDung', label:'Nội dung', type:'text', width:260},
 {key:'donVi', label:'Đơn vị phát hành', type:'text', width:180},
 {key:'nguoiPhuTrach', label:'Người phụ trách', type:'contact', width:170, allowMultiple:true, maxContacts:5, knownContacts:PROJECT_CONTACTS},
 {key:'hanXuLy', label:'Hạn xử lý', type:'date', width:120, dateFormat:'dd/mm/yyyy', format:Formatters.defaultConfig('date')},
 {key:'giaTri', label:'Giá trị', type:'currency', width:130, format:Formatters.defaultConfig('currency')},
 {key:'tinhTrang', label:'Tình trạng', type:'dropdown', width:150, options:['Chưa có','Đang xử lý','Đã đủ','Thiếu hồ sơ','Cần đối chiếu','Đã nghiệm thu','Đã thanh toán']},
 {key:'ghiChu', label:'Ghi chú', type:'text', width:220}
];

const SHEET_HEADER_TEMPLATE = SHEET_COLUMN_CONFIG.map(c => c.label);

function createEmptySheetCells(rowCount = 60, sheetName = ''){
 const headers = SHEET_COLUMN_CONFIG.map(c => c.label);
 const rows = Array.from({length:rowCount}, () => Array.from({length:headers.length}, () => ''));
 rows[0] = headers;
 sampleRowsForArchiveSheet(sheetName).forEach((sample, index) => {
  rows[index + 1] = sample;
 });
 return rows;
}

function ensureSheetCells(sheet){
 const hasHeader = Array.isArray(sheet.cells?.[0]) && sheet.cells[0].some(value => String(value || '').trim());
 if(!Array.isArray(sheet.cells) || !Array.isArray(sheet.cells[0]) || !hasHeader){
 sheet.cells = createEmptySheetCells(60, sheet.name || '');
 }
 if(Array.isArray(sheet.rowMeta) && !sheet._rowMetaApplied){
  const meta = sheet.rowMeta;
  sheet._rowMetaApplied = true;
  meta.forEach((item, index) => {
   const row = sheet.cells[index];
   if(!row || !item) return;
   row._level = item.level || 0;
   row._collapsed = !!item.collapsed;
   row._createdBy = item.createdBy || null;
   row._createdAt = item.createdAt || null;
   row._modifiedBy = item.modifiedBy || null;
   row._modifiedAt = item.modifiedAt || null;
  });
 }
 return sheet.cells;
}

function ensureSheetAttachments(sheet){
 if(!sheet.attachments || typeof sheet.attachments !== 'object'){
 sheet.attachments = {};
 }
 return sheet.attachments;
}

function ensureSheetSettings(sheet){
 sheet.settings = sheet.settings || {};
 if(!sheet.settings.defaultRowHeight) sheet.settings.defaultRowHeight = 32;
 if(sheet.settings.defaultWrap === undefined) sheet.settings.defaultWrap = true;
 sheet.settings.columnWrap = sheet.settings.columnWrap || {};
 return sheet.settings;
}

function ensureSheetSelectedRows(sheet){
 if(!sheet) return new Set();
 if(sheet._selectedRows instanceof Set) return sheet._selectedRows;
 if(Array.isArray(sheet._selectedRows)){
  sheet._selectedRows = new Set(sheet._selectedRows.map(Number).filter(Number.isFinite));
 } else {
  sheet._selectedRows = new Set();
 }
 return sheet._selectedRows;
}

function ensureSheetColumnConfigs(sheet){
 if(!sheet._columnConfigs || typeof sheet._columnConfigs !== 'object') sheet._columnConfigs = {};
 return sheet._columnConfigs;
}

function applySavedRowMeta(sheet, rowMeta){
 if(!sheet || !Array.isArray(rowMeta)) return;
 const cells = ensureSheetCells(sheet);
 rowMeta.forEach((meta, index) => {
  const row = cells[index];
  if(!row || !meta) return;
  row._level = meta.level || 0;
  row._collapsed = !!meta.collapsed;
  row._createdBy = meta.createdBy || null;
  row._createdAt = meta.createdAt || null;
  row._modifiedBy = meta.modifiedBy || null;
  row._modifiedAt = meta.modifiedAt || null;
 });
}

function touchRowModified(sheet, rowIndex){
 if(!sheet || rowIndex <= 0) return;
 const row = ensureSheetCells(sheet)[rowIndex];
 if(!row) return;
 row._modifiedBy = ensureAppUserName();
 row._modifiedAt = Date.now();
}

function setSheetCellValue(sheet, row, col, value, options = {}){
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 while(cells.length <= row) cells.push(prepareNewSheetRow(sheet, false));
 while(cells[row].length <= col) cells[row].push('');
 cells[row][col] = value;
 if(row > 0 && !options.skipModified) touchRowModified(sheet, row);
}

function renderSystemColumnValue(sheet, rowIndex, type){
 const row = ensureSheetCells(sheet)[rowIndex];
 if(!row) return '';
 if(type === 'created_by') return Formatters.created_by(row._createdBy);
 if(type === 'created_date') return Formatters.created_date(row._createdAt);
 if(type === 'modified_by') return Formatters.modified_by(row._modifiedBy);
 if(type === 'modified_date') return Formatters.modified_date(row._modifiedAt);
 return '';
}

function prepareNewSheetRow(sheet, withMeta = true){
 const cells = ensureSheetCells(sheet);
 const row = Array.from({length:cells[0].length}, () => '');
 if(withMeta){
  row._createdBy = ensureAppUserName();
  row._createdAt = Date.now();
  row._modifiedBy = row._createdBy;
  row._modifiedAt = row._createdAt;
 }
 for(let col = 2; col < cells[0].length; col++){
  const cfg = getColumnConfig(col, sheet);
  if(cfg.type === 'auto_number'){
   const configs = ensureSheetColumnConfigs(sheet);
   const colCfg = configs[col] || cfg;
   const nextNumber = Number(colCfg.autoNext ?? colCfg.autoStart ?? 1) || 1;
   row[col] = formatAutoNumberValue(nextNumber, colCfg);
   configs[col] = {...colCfg, type:'auto_number', autoNext:nextNumber + 1};
  }
 }
 return row;
}

function columnTypeIcon(type){
 return {
 text:'',
 dropdown:'≡',
 'multi-select':'☷',
 date:'📅',
 duration:'⏱',
 contact:'👤',
 CONTACT_LIST:'👤',
 checkbox:'☑',
 symbols:'★',
 currency:'₫',
 number:'#',
 percent:'%',
 auto_number:'#',
 created_by:'👤+',
 created_date:'📅+',
 modified_by:'✎👤',
 modified_date:'✎📅'
 }[type] || '';
}

function parseContactValue(value){
 if(!value) return [];
 if(Array.isArray(value)) return value.filter(Boolean);
 if(typeof value === 'object') return [value];
 const text = String(value).trim();
 if(!text) return [];
 try {
 const parsed = JSON.parse(text);
 return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed];
 } catch(_err) {
 const match = text.match(/^(.*?)\\s*<([^>]+)>$/);
 if(match) return [{name:match[1].trim(), email:match[2].trim()}];
 const known = PROJECT_CONTACTS.find(c => c.name === text || c.email === text);
 return [known || {name:text, email:''}];
 }
}

function serializeContacts(contacts){
 return JSON.stringify((contacts || []).map(c => ({name:c.name || c.email || '', email:c.email || ''})));
}

function ensureCellStyles(sheet){
 if(!sheet._cellStyles || typeof sheet._cellStyles !== 'object') sheet._cellStyles = {};
 return sheet._cellStyles;
}

function getCellStyle(sheet, r, c){
 return (sheet._cellStyles && sheet._cellStyles[`${r}_${c}`]) || null;
}

function forEachSelectedCell(sheet, fn){
 const activeEl = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 const row = activeEl ? Number(activeEl.dataset.r) : 0;
 const col = activeEl ? Number(activeEl.dataset.c) : 0;
 const range = getSelectedRange(row, col);
 const selectedColumns = sheetColumnSelection?.columns;
 for(let r = range.r1; r <= range.r2; r++){
  if(r === 0) continue;
  const columns = selectedColumns?.length ? selectedColumns : Array.from({length:range.c2 - range.c1 + 1}, (_, i) => range.c1 + i);
  for(const c of columns){
   if(c === 0 || c === 1) continue;
   fn(r, c);
  }
 }
}
function setCellStyleEntry(styles, key, mutate){
 const style = Object.assign({}, styles[key]);
 mutate(style);
 if(Object.keys(style).length) styles[key] = style;
 else delete styles[key];
}

function toggleCellStyleFlag(sheet, flag){
 const before = createSheetUndoSnapshot(sheet);
 const styles = ensureCellStyles(sheet);
 let anchorOn = null;
 forEachSelectedCell(sheet, (row, col) => {
  if(anchorOn === null) anchorOn = !!styles[`${row}_${col}`]?.[flag];
 });
 const turnOn = !anchorOn;
 forEachSelectedCell(sheet, (row, col) => {
  setCellStyleEntry(styles, `${row}_${col}`, style => {
   if(turnOn) style[flag] = true;
   else delete style[flag];
  });
 });
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 pushSheetSnapshotUndo(sheet, before, createSheetUndoSnapshot(sheet), `format-${flag}`);
}
function setCellStyleValue(sheet, prop, value){
 const before = createSheetUndoSnapshot(sheet);
 const styles = ensureCellStyles(sheet);
 forEachSelectedCell(sheet, (r, c) => {
 setCellStyleEntry(styles, `${r}_${c}`, st => { if(value) st[prop] = value; else delete st[prop]; });
 });
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 pushSheetSnapshotUndo(sheet, before, createSheetUndoSnapshot(sheet), `format-${prop}`);
}

function clearSelectionFormatting(sheet){
 const before = createSheetUndoSnapshot(sheet);
 const styles = ensureCellStyles(sheet);
 forEachSelectedCell(sheet, (r, c) => { delete styles[`${r}_${c}`]; });
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 pushSheetSnapshotUndo(sheet, before, createSheetUndoSnapshot(sheet), 'clear-format');
}

function serializeSheetAttachments(sheet){
 const attachments = ensureSheetAttachments(sheet);
 return Object.fromEntries(
 Object.entries(attachments).map(([row, files]) => [
 row,
 (Array.isArray(files) ? files : [])
 .filter(file => file && (file.localOpenUrl || file.localPath || file.driveId || file.fileId || file.driveLink || file.webViewLink || file.url || file.driveDownloadUrl))
 .map(file => ({
 id: file.id,
 name: file.name,
 size: file.size,
 type: file.type,
 addedAt: file.addedAt,
 driveId: file.driveId || file.fileId || '',
 fileId: file.fileId || file.driveId || '',
 driveLink: file.driveLink || file.webViewLink || file.url || '',
 webViewLink: file.webViewLink || file.driveLink || file.url || '',
 url: file.url || file.driveLink || file.webViewLink || '',
 driveDownloadUrl: file.driveDownloadUrl || file.webContentLink || '',
 webContentLink: file.webContentLink || file.driveDownloadUrl || '',
 driveFolderId: file.driveFolderId,
 driveFolderName: file.driveFolderName,
 driveFolderPath: file.driveFolderPath,
 localOpenUrl: file.localOpenUrl || file.localUrl || '',
 localUrl: file.localUrl || file.localOpenUrl || '',
 localPath: file.localPath || '',
 localFolder: file.localFolder || '',
 localStatus: file.localStatus || '',
 localError: file.localError || '',
 rowLabel: file.rowLabel,
 uploadMode: file.uploadMode,
 driveStatus: file.driveStatus,
 driveError: file.driveError
 }))
 ])
 );
}

function getAttachmentOpenHref(file){
 if(!file) return '';
 const localLink = file.localOpenUrl || file.localUrl;
 if(localLink) return localLink;
 const driveLink = file.driveLink || file.webViewLink || file.fileUrl || file.url || file.link || file.openUrl;
 if(driveLink) return driveLink;
 const driveId = getAttachmentDriveId(file);
 if(driveId) return `https://drive.google.com/file/d/${encodeURIComponent(driveId)}/view`;
 return file.driveDownloadUrl || file.webContentLink || file.downloadUrl || file.dataUrl || '';
}

function getAttachmentPreviewHref(file){
 if(!file) return '';
 const driveId = getAttachmentDriveId(file) || extractDriveIdFromUrl(file.driveLink || file.webViewLink || file.fileUrl || file.url || file.link || file.openUrl);
 if(driveId) return `https://drive.google.com/file/d/${encodeURIComponent(driveId)}/preview`;
 return file.dataUrl || file.driveDownloadUrl || file.webContentLink || file.downloadUrl || getAttachmentOpenHref(file);
}

function getAttachmentPreviewState(file){
 if(!file) return {ready:false, pending:false, title:'File chưa có link xem'};
 const href = getAttachmentPreviewHref(file) || getAttachmentOpenHref(file);
 const pending = !href && (file.localStatus === 'saving' || file.driveStatus === 'uploading');
 if(href) return {ready:true, pending:false, title:'Xem file'};
 if(pending) return {ready:false, pending:true, title:'Đang tải lên'};
 return {ready:false, pending:false, title:'File chưa có link xem'};
}
function getAttachmentDownloadHref(file){
 if(!file) return '';
 const directLink = file.driveDownloadUrl || file.webContentLink || file.downloadUrl || file.dataUrl || file.localOpenUrl || file.localUrl;
 if(directLink) return directLink;
 const driveId = getAttachmentDriveId(file);
 if(driveId) return 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(driveId);
 return getAttachmentOpenHref(file);
}

function downloadAttachmentFile(file, delay = 0){
 const href = getAttachmentDownloadHref(file);
 if(!href) return false;
 window.setTimeout(()=>{
  const link = document.createElement('a');
  link.href = href;
  link.download = file.name || '';
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
 }, delay);
 return true;
}

function getSelectedAttachmentEntries(){
 const sheet = getAttachmentSheet();
 if(!sheet || activeAttachmentRow === null) return [];
 const files = ensureSheetAttachments(sheet)[activeAttachmentRow] || [];
 return Array.from(selectedAttachmentIndexes)
  .filter(index=>Number.isInteger(index) && index >= 0 && index < files.length)
  .sort((a, b)=>a - b)
  .map(index=>({index, file:files[index]}));
}

function downloadSelectedAttachments(){
 const entries = getSelectedAttachmentEntries();
 if(!entries.length) return;
 let downloadCount = 0;
 entries.forEach(({file}, order)=>{
  if(downloadAttachmentFile(file, order * 120)) downloadCount += 1;
 });
 if(downloadCount !== entries.length){
  alert('Có ' + (entries.length - downloadCount) + ' file chưa có link tải xuống.');
 }
 renderAttachmentPanel();
}

function deleteSelectedAttachments(){
 const entries = getSelectedAttachmentEntries();
 if(!entries.length) return;
 if(!confirm('Xóa ' + entries.length + ' file đã chọn?')){
  renderAttachmentPanel();
  return;
 }
 const sheet = getAttachmentSheet();
 if(!sheet || activeAttachmentRow === null) return;
 const store = ensureSheetAttachments(sheet);
 const files = store[activeAttachmentRow] || [];
 const removed = entries
  .map(({index})=>index)
  .sort((a, b)=>b - a)
  .map(index=>files.splice(index, 1)[0])
  .filter(Boolean);
 store[activeAttachmentRow] = files;
 selectedAttachmentIndexes.clear();
 attachmentActionsOpen = false;
 syncAttachmentCell(sheet, activeAttachmentRow);
 refreshReportAttachmentBadge(activeAttachmentSource, activeAttachmentRow);
 renderAttachmentPanel();
 scheduleSheetDataSave(sheet);
 removed.forEach(file=>{
  const driveId = getAttachmentDriveId(file);
  if(driveId) deleteAttachmentFile(driveId).catch(()=>{});
 });
}
function closeAttachmentPreview(){
 document.querySelector('.attachment-preview-backdrop')?.remove();
 document.removeEventListener('keydown', handleAttachmentPreviewKeydown);
}

function handleAttachmentPreviewKeydown(e){
 if(e.key === 'Escape') closeAttachmentPreview();
}

function openAttachmentPreview(file){
 if(!file) return false;
 if(!getAttachmentPreviewState(file).ready) return false;
 const openHref = getAttachmentOpenHref(file);
 if(file.localOpenUrl || file.localUrl){
  window.open(openHref, '_blank', 'noopener');
  return true;
 }
 const previewHref = getAttachmentPreviewHref(file);
 if(!previewHref){
  if(openHref){
   window.open(openHref, '_blank', 'noopener');
   return true;
  }
  alert('File này chưa có link để xem. Hãy upload lại hoặc kiểm tra quyền Drive.');
  return false;
 }
 closeAttachmentPreview();
 const backdrop = document.createElement('div');
 backdrop.className = 'attachment-preview-backdrop';
 const isImage = (file.type && file.type.startsWith('image/')) || /^data:image\//i.test(previewHref);
 const bodyHtml = isImage
  ? `<img src="${escapeHtml(previewHref)}" alt="${escapeHtml(file.name || 'Attachment')}">`
  : `<iframe src="${escapeHtml(previewHref)}" title="${escapeHtml(file.name || 'Attachment preview')}" allow="autoplay"></iframe>`;
 backdrop.innerHTML = `
 <div class="attachment-preview-dialog" role="dialog" aria-modal="true" aria-label="Xem file dinh kem">
  <div class="attachment-preview-head">
   <div class="attachment-preview-title">${escapeHtml(file.name || 'File dinh kem')}</div>
   <div class="attachment-preview-actions">
    ${openHref ? `<a href="${escapeHtml(openHref)}" target="_blank" rel="noopener">Mở tab</a>` : ''}
    <button type="button" class="attachment-preview-close" aria-label="Đóng">×</button>
   </div>
  </div>
  <div class="attachment-preview-body">${bodyHtml || '<div class="attachment-preview-empty">Không xem trước được file này.</div>'}</div>
 </div>`;
 backdrop.addEventListener('click', (e) => {
  if(e.target === backdrop || e.target.closest('.attachment-preview-close')) closeAttachmentPreview();
 });
 document.body.appendChild(backdrop);
 document.addEventListener('keydown', handleAttachmentPreviewKeydown);
 return true;
}

function wireColumnResize(table, skipPositions){
 if(!table) return;
 const headRow = table.querySelector('thead tr');
 if(!headRow) return;
 Array.from(headRow.children).forEach((th, pos) => {
 if(skipPositions && skipPositions.has(pos)) return;
 const key = th.dataset.colKey;
 if(!key || th.querySelector('.col-resize-handle')) return;
 const handle = document.createElement('span');
 handle.className = 'col-resize-handle';
 th.appendChild(handle);
 handle.addEventListener('mousedown', (e) => {
 e.preventDefault();
 e.stopPropagation();
 const colEl = table.querySelector(`col[data-col-key="${CSS.escape(key)}"]`);
 if(!colEl) return;
 const startX = e.clientX;
 const startWidth = colEl.getBoundingClientRect().width || 116;
 // Bảng đang được set width cố định (tổng các cột) để table-layout:fixed áp đúng độ rộng từng cột —
 // nên khi kéo rộng 1 cột phải cộng thêm đúng phần chênh lệch đó vào width của cả bảng, nếu không
 // trình duyệt sẽ ép các cột khác co lại để bảng giữ nguyên độ rộng tổng.
 const startTableWidth = table.getBoundingClientRect().width;
 document.body.classList.add('resizing-columns');
 function onMove(ev){
 const newWidth = Math.max(40, startWidth + (ev.clientX - startX));
 table.style.width = (startTableWidth + (newWidth - startWidth)) + 'px';
 colEl.style.width = newWidth + 'px';
 }
 function onUp(){
 document.removeEventListener('mousemove', onMove);
 document.removeEventListener('mouseup', onUp);
 document.body.classList.remove('resizing-columns');
 saveColWidth(key, parseFloat(colEl.style.width));
 }
 document.addEventListener('mousemove', onMove);
 document.addEventListener('mouseup', onUp);
 });
 });
}

function getActiveSheet(){
 if(!activeSheetContext) return null;
 const {projectIndex, folderIndex} = activeSheetContext;
 return PROJECT_FOLDERS[projectIndex]?.[folderIndex] || null;
}

function getAttachmentSheet(){
 if(activeAttachmentSource){
  return PROJECT_FOLDERS[activeAttachmentSource.projectIndex]?.[activeAttachmentSource.folderIndex] || null;
 }
 return getActiveSheet();
}

function getAttachmentProjectName(){
 if(activeAttachmentSource){
  return DATA[activeAttachmentSource.projectIndex]?.name || '';
 }
 return getActiveProjectName();
}

function getAttachmentPanelDefaultHost(){
 return document.querySelector('#gridSheetView .sheet-work-area') || gridSheetView;
}

function moveAttachmentPanelToHost(host){
 if(!attachmentPanel || !host) return;
 if(attachmentPanel.parentElement !== host) host.appendChild(attachmentPanel);
}

function exportSheetToExcel(sheet){
 const cells = ensureSheetCells(sheet);
 const ws = XLSX.utils.aoa_to_sheet(cells);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws, 'Data');
 XLSX.writeFile(wb, (sheet.name || 'Sheet') + '.xlsx');
}

function rowAttachmentTitle(sheet, rowIndex){
 const cells = ensureSheetCells(sheet);
 const soVanBan = String(cells[rowIndex]?.[5] || '').trim();
 const noiDung = String(cells[rowIndex]?.[7] || '').trim();
 if(soVanBan && noiDung) return `${soVanBan} - ${noiDung}`;
 return noiDung || soVanBan || `Dòng ${rowIndex + 1}`;
}

function cycleRowStatus(sheet, rowIndex){
 const cells = ensureSheetCells(sheet);
 const current = cells[rowIndex][1] || '';
 const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
 cells[rowIndex][1] = next;
 renderGridSheet(sheet);
 scheduleCellSave(sheet, rowIndex, 1, next);
}

function getActiveColIndex(){
 const cell = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 return cell ? Number(cell.dataset.c) : 3;
}

function getActiveRowIndex(){
 const cell = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 return cell ? Number(cell.dataset.r) : 0;
}

const ROW_HIERARCHY_COL = 3;

function getRowLevel(row){
 return (row && row._level) || 0;
}

function rowHasChildren(cells, rowIndex){
 const next = cells[rowIndex + 1];
 if(!next) return false;
 return getRowLevel(next) > getRowLevel(cells[rowIndex]);
}

function getDescendantEndIndex(cells, rowIndex){
 const level = getRowLevel(cells[rowIndex]);
 let end = rowIndex;
 for(let i = rowIndex + 1; i < cells.length; i++){
 if(getRowLevel(cells[i]) > level) end = i; else break;
 }
 return end;
}

function computeHierarchyHiddenRows(cells){
 const hidden = new Set();
 let hideBelowLevel = null;
 for(let r = 1; r < cells.length; r++){
 const level = getRowLevel(cells[r]);
 if(hideBelowLevel !== null && level > hideBelowLevel){
 hidden.add(r);
 continue;
 }
 hideBelowLevel = null;
 if(cells[r]._collapsed && rowHasChildren(cells, r)){
 hideBelowLevel = level;
 }
 }
 return hidden;
}

function indentRow(sheet, rowIndex){
 const cells = ensureSheetCells(sheet);
 if(rowIndex <= 1) return; // dòng dữ liệu đầu tiên không có dòng nào phía trên để làm cha
 const level = getRowLevel(cells[rowIndex]);
 const prevLevel = getRowLevel(cells[rowIndex - 1]);
 const newLevel = Math.min(level + 1, prevLevel + 1);
 if(newLevel === level) return;
 const delta = newLevel - level;
 const end = getDescendantEndIndex(cells, rowIndex);
 for(let i = rowIndex; i <= end; i++){
 cells[i]._level = getRowLevel(cells[i]) + delta;
 }
 renderGridSheet(sheet);
 setActiveSheetCell(rowIndex, ROW_HIERARCHY_COL, true);
 scheduleSheetDataSave(sheet);
}

function outdentRow(sheet, rowIndex){
 const cells = ensureSheetCells(sheet);
 const level = getRowLevel(cells[rowIndex]);
 if(level <= 0) return;
 const end = getDescendantEndIndex(cells, rowIndex);
 for(let i = rowIndex; i <= end; i++){
 cells[i]._level = Math.max(0, getRowLevel(cells[i]) - 1);
 }
 renderGridSheet(sheet);
 setActiveSheetCell(rowIndex, ROW_HIERARCHY_COL, true);
 scheduleSheetDataSave(sheet);
}

function toggleRowCollapse(sheet, rowIndex){
 const cells = ensureSheetCells(sheet);
 const row = cells[rowIndex];
 if(!row) return;
 row._collapsed = !row._collapsed;
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
}

function getPickableColumns(sheet){
 const cells = ensureSheetCells(sheet);
 const header = cells[0] || [];
 return header.map((name, i) => {
 const config = getColumnConfig(i, sheet);
 return {
  index:i,
  label:i === 1 ? 'Trang thai' : (config.label || name || columnName(i)),
  type:config.type || 'text',
  options:config.options || []
 };
 }).filter(c => c.index >= 1);
}

function applySorts(sheet){
 const sorts = sheet._sorts || [];
 if(!sorts.length) return;
 const cells = ensureSheetCells(sheet);
 const header = cells[0];
 const body = cells.slice(1);
 body.sort((a, b) => {
 for(const {col, dir} of sorts){
 const av = a[col] ?? '', bv = b[col] ?? '';
 const an = parseFloat(av), bn = parseFloat(bv);
 const bothNumeric = av !== '' && bv !== '' && !isNaN(an) && !isNaN(bn);
 let cmp = bothNumeric ? (an - bn) : String(av).localeCompare(String(bv), 'vi');
 if(dir === 'desc') cmp = -cmp;
 if(cmp !== 0) return cmp;
 }
 return 0;
 });
 sheet.cells = [header, ...body];
 scheduleSheetDataSave(sheet);
}

function addSortLevel(sheet, colIndex){
 sheet._sorts = sheet._sorts || [];
 if(sheet._sorts.some(s => s.col === colIndex)) return;
 sheet._sorts.push({col: colIndex, dir: 'asc'});
 applySorts(sheet);
 renderGridSheet(sheet);
 renderSortPopover(sheet);
}

function toggleSortDir(sheet, idx){
 const s = (sheet._sorts || [])[idx];
 if(!s) return;
 s.dir = s.dir === 'asc' ? 'desc' : 'asc';
 applySorts(sheet);
 renderGridSheet(sheet);
 renderSortPopover(sheet);
}

function removeSortLevel(sheet, idx){
 (sheet._sorts || []).splice(idx, 1);
 renderGridSheet(sheet);
 renderSortPopover(sheet);
}

function clearSorts(sheet){
 sheet._sorts = [];
 renderGridSheet(sheet);
 renderSortPopover(sheet);
}

function sortByColumnClick(colIndex){
 const sheet = getActiveSheet();
 if(!sheet) return;
 sheet._sorts = sheet._sorts || [];
 if(sheet._sorts.length === 1 && sheet._sorts[0].col === colIndex){
 sheet._sorts[0].dir = sheet._sorts[0].dir === 'asc' ? 'desc' : 'asc';
 } else {
 sheet._sorts = [{col: colIndex, dir: 'asc'}];
 }
 applySorts(sheet);
 renderGridSheet(sheet);
}

function promptSaveFilter(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const name = prompt('Đặt tên cho bộ lọc này:', '');
 if(!name || !name.trim()) return;
 saveCurrentFilter(sheet, name.trim());
 renderFilterPopover(sheet);
}

function promptLoadFilter(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const saved = getSavedFilters(sheet);
 if(!saved.length){
 alert('Chưa có bộ lọc nào được lưu.');
 return;
 }
 // Build a simple list
 const names = saved.map((s, i) => `${i+1}. ${s.name}`).join('\\n');
 const choice = prompt(`Các bộ lọc đã lưu:\\n${names}\\n\\nNhập số hoặc tên bộ lọc:`, '');
 if(!choice) return;
 const idx = parseInt(choice);
 if(!isNaN(idx) && idx > 0 && idx <= saved.length){
 loadSavedFilter(sheet, saved[idx - 1].name);
 } else {
 const byName = saved.find(s => s.name.toLowerCase() === choice.trim().toLowerCase());
 if(byName) loadSavedFilter(sheet, byName.name);
 }
}

function addFilterLevel(sheet, colIndex){
 sheet._filters = sheet._filters || [];
 if(sheet._filters.some(f => f.col === colIndex)) return;
 sheet._filters.push({col: colIndex, value: ''});
 renderGridSheet(sheet);
 renderFilterPopover(sheet);
}

function updateFilterValue(sheet, idx, value){
 const f = (sheet._filters || [])[idx];
 if(!f) return;
 f.value = value;
 renderGridSheet(sheet);
}

function removeFilterLevel(sheet, idx){
 (sheet._filters || []).splice(idx, 1);
 renderGridSheet(sheet);
 renderFilterPopover(sheet);
}

function clearFilters(sheet){
 sheet._filters = [];
 renderGridSheet(sheet);
 renderFilterPopover(sheet);
}

function rowMatchesSearchAndFilter(sheet, row){
 const filters = sheet._filters || [];
 for(const f of filters){
 if(!f.value) continue;
 const fv = String(row[f.col] ?? '').toLowerCase();
 if(!fv.includes(f.value.toLowerCase())) return false;
 }
 if(sheet._searchTerm){
 const hit = row.some(v => String(v ?? '').toLowerCase().includes(sheet._searchTerm));
 if(!hit) return false;
 }
 return true;
}

const FORMAT_RULE_OPS = {
 gt:'lớn hơn', lt:'nhỏ hơn', eq:'bằng', contains:'chứa',
 not_contains:'không chứa', starts_with:'bắt đầu bằng', ends_with:'kết thúc bằng',
 between:'trong khoảng', blank:'rỗng', not_blank:'không rỗng'
};

function ruleMatches(rule, rawValue){
 if(rule.disabled) return false;
 if(Array.isArray(rule.conditions) && rule.conditions.length){
 const results = rule.conditions.map(condition => matchSingleFormatCondition(condition, rawValue));
 return rule.logic === 'or' ? results.some(Boolean) : results.every(Boolean);
 }
 return matchSingleFormatCondition(rule, rawValue);
}

function matchSingleFormatCondition(rule, rawValue){
 const value = rawValue ?? '';
 const val = String(value).toLowerCase();
 const rv = String(rule.value || '').toLowerCase();
 if(rule.op === 'blank') return !val;
 if(rule.op === 'not_blank') return !!val;
 if(rule.op === 'eq'){
 const n = parseFloat(value), rn = parseFloat(rule.value);
 if(!isNaN(n) && !isNaN(rn)) return n === rn;
 return val === rv;
 }
 if(rule.op === 'contains') return val.includes(rv);
 if(rule.op === 'not_contains') return !val.includes(rv);
 if(rule.op === 'starts_with') return val.startsWith(rv);
 if(rule.op === 'ends_with') return val.endsWith(rv);
 if(rule.op === 'between'){
 const n = Number(value), a = Number(rule.value), b = Number(rule.value2);
 if([n, a, b].some(Number.isNaN)) return false;
 return n >= Math.min(a, b) && n <= Math.max(a, b);
 }
 const n = parseFloat(value), rn = parseFloat(rule.value);
 if(Number.isNaN(n) || Number.isNaN(rn)) return false;
 return rule.op === 'gt' ? n > rn : n < rn;
}

function getCellRuleColor(sheet, colIndex, value){
 const rules = sheet._formatRules || [];
 for(let i = rules.length - 1; i >= 0; i--){
 const rule = rules[i];
 if(rule.value !== '' && ruleMatches(rule, value)){
 if(rule.applyToRow) return rule.color; // row-level: trả về màu cho mọi cột
 if(rule.col === colIndex) return rule.color;
 }
 }
 return '';
}

function addFormatRule(sheet, rule){
 sheet._formatRules = sheet._formatRules || [];
 sheet._formatRules.push({...rule, disabled:false});
 renderGridSheet(sheet);
 renderFormatPopover(sheet);
 scheduleSheetDataSave(sheet);
}

function removeFormatRule(sheet, idx){
 (sheet._formatRules || []).splice(idx, 1);
 renderGridSheet(sheet);
 renderFormatPopover(sheet);
 scheduleSheetDataSave(sheet);
}

function toggleFormatRule(sheet, idx){
 const rule = (sheet._formatRules || [])[idx];
 if(!rule) return;
 rule.disabled = !rule.disabled;
 renderGridSheet(sheet);
 renderFormatPopover(sheet);
 scheduleSheetDataSave(sheet);
}

function moveFormatRule(sheet, idx, direction){
 const rules = sheet._formatRules || [];
 const next = idx + direction;
 if(next < 0 || next >= rules.length) return;
 [rules[idx], rules[next]] = [rules[next], rules[idx]];
 renderGridSheet(sheet);
 renderFormatPopover(sheet);
 scheduleSheetDataSave(sheet);
}

function clearFormatRules(sheet){
 sheet._formatRules = [];
 renderGridSheet(sheet);
 renderFormatPopover(sheet);
}

function syncAttachmentCell(sheet, rowIndex){
 if(rowIndex <= 0) return;
 const cells = ensureSheetCells(sheet);
 const files = ensureSheetAttachments(sheet)[rowIndex] || [];
 cells[rowIndex][0] = files.length ? `📎 ${files.length}` : '📎';
 const cell = sheetGridWrap.querySelector(`.sheet-cell[data-r="${rowIndex}"][data-c="0"]`);
 if(cell) cell.textContent = cells[rowIndex][0];
}

function renderAttachmentPanel(){
 const sheet = getAttachmentSheet();
 if(!sheet || activeAttachmentRow === null){
  const banner = document.getElementById('attachRowBanner');
  if(banner) banner.textContent = 'Chọn dòng trong cột A';
  attachList.innerHTML = '<div class="attach-empty">Chọn biểu tượng ghim ở một dòng để xem file đính kèm.</div>';
  selectedAttachmentIndexes.clear();
  attachmentActionsOpen = false;
  attachUploadBtn.textContent = 'Attach Files';
  return;
 }
 const files = ensureSheetAttachments(sheet)[activeAttachmentRow] || [];
 Array.from(selectedAttachmentIndexes).forEach(index=>{
  if(index < 0 || index >= files.length) selectedAttachmentIndexes.delete(index);
 });
 const selectedCount = selectedAttachmentIndexes.size;
 const allSelected = files.length > 0 && selectedCount === files.length;
 const title = rowAttachmentTitle(sheet, activeAttachmentRow);
 const folderName = getActiveArchiveFolderName(sheet);
 const rowNumber = activeAttachmentRow + 1;
 const banner = document.getElementById('attachRowBanner');
 if(banner) banner.textContent = 'Row ' + rowNumber + ': ' + title;
 attachTitle.textContent = title;
 attachSub.textContent = folderName + ' · Row ' + rowNumber + ' · ' + files.length + ' file';
 attachUploadBtn.textContent = 'Attach Files to Row ' + rowNumber;
 const controlsHtml =
  '<div class="attach-controls">' +
   '<input class="attach-select-all" type="checkbox" aria-label="Chọn tất cả file" ' +
    (allSelected ? 'checked ' : '') + (files.length ? '' : 'disabled') + '>' +
   '<div class="attach-actions-wrap">' +
    '<button class="attach-actions" type="button" aria-haspopup="menu" aria-expanded="' +
     (attachmentActionsOpen ? 'true' : 'false') + '" ' + (selectedCount ? '' : 'disabled') + '>Actions ▾</button>' +
    '<div class="attach-actions-menu" role="menu" ' + (attachmentActionsOpen && selectedCount ? '' : 'hidden') + '>' +
     '<button type="button" role="menuitem" data-attach-bulk="download">Tải xuống (' + selectedCount + ')</button>' +
     '<button type="button" role="menuitem" class="danger" data-attach-bulk="delete">Xóa (' + selectedCount + ')</button>' +
    '</div>' +
   '</div>' +
   '<button class="attach-sort" type="button">↕ Uploaded (newest)⌄</button>' +
  '</div>';
 const listHtml = files.length
  ? files.map((file, index) => {
   const isPdf = /pdf/i.test(file.type || file.name || '');
   const icon = file.type && file.type.startsWith('image/') ? '▧' : (isPdf ? '⌁' : '▤');
   const openHref = getAttachmentOpenHref(file);
   const previewHref = getAttachmentPreviewHref(file);
   const previewState = getAttachmentPreviewState(file);
   const isDriveHref = !!(file.driveLink || file.webViewLink || file.fileUrl || file.url || file.link || file.openUrl || getAttachmentDriveId(file));
   const openAttrs = isDriveHref
    ? 'target="_blank" rel="noopener"'
    : 'download="' + escapeHtml(file.name) + '"';
   const nameHtml = openHref
    ? '<a class="attach-file-name" href="' + escapeHtml(openHref) + '" ' + openAttrs +
      ' data-file-i="' + index + '" data-preview-href="' + escapeHtml(previewHref) +
      '" title="' + escapeHtml(file.name) + '">' + escapeHtml(file.name) + '</a>'
    : '<span class="attach-file-name preview-disabled" data-file-i="' + index + '" title="' +
      escapeHtml(previewState.title) + '">' + escapeHtml(file.name) + '</span>';
   const rawDriveError = file.driveError ? String(file.driveError) : '';
   const cleanDriveError = /Cannot read properties/i.test(rawDriveError)
    ? uploadBackendUnavailableMessage()
    : rawDriveError;
   const localText = file.localOpenUrl
    ? 'Mở bằng máy'
    : file.localStatus === 'saving'
    ? 'Đang lưu bản local...'
    : file.localStatus === 'error'
    ? 'Chưa lưu local'
    : '';
   const statusText = file.uploadMode === 'drive-desktop'
    ? 'Đã lưu vào My Drive (sync nền)'
    : file.driveStatus === 'uploading'
    ? (file.localOpenUrl ? 'Drive đang chạy nền...' : 'Đang tải lên Drive...')
    : file.driveStatus === 'error'
    ? (file.localOpenUrl
      ? 'Drive chưa lên' + (cleanDriveError ? ': ' + cleanDriveError : '')
      : 'Lỗi tải lên' + (cleanDriveError ? ': ' + cleanDriveError : ''))
    : (file.addedAt || 'Đã đính kèm');
   const selected = selectedAttachmentIndexes.has(index);
   const accessibleName = escapeHtml(file.name || ('file ' + (index + 1)));
   return '<div class="attach-file' + (selected ? ' selected' : '') + '">' +
    '<input class="attach-file-check" type="checkbox" data-file-i="' + index +
     '" aria-label="Chọn ' + accessibleName + '" ' + (selected ? 'checked' : '') + '>' +
    '<span class="attach-file-icon">' + icon + '</span>' +
    '<div class="attach-file-main">' +
     nameHtml +
     '<span class="attach-row-badge">Row ' + rowNumber + '</span>' +
     '<span class="attach-file-meta">' +
      escapeHtml([localText, statusText].filter(Boolean).join(' · ')) +
      (file.size ? ' · ' + formatFileSize(file.size) : '') +
     '</span>' +
    '</div>' +
    '<button class="attach-file-preview" type="button" data-file-i="' + index +
     '" title="' + escapeHtml(previewState.title) + '" aria-label="Xem ' + accessibleName + '"' +
     (previewState.ready ? '>' : ' disabled>') +
     '<span class="attach-eye-icon" aria-hidden="true"></span>' +
    '</button>' +
    '<button class="attach-file-remove" type="button" data-file-i="' + index + '" title="Xóa">×</button>' +
   '</div>';
  }).join('')
  : '<div class="attach-empty">Chưa có file đính kèm cho dòng này.</div>';
 attachList.innerHTML = controlsHtml + listHtml;
 const selectAll = attachList.querySelector('.attach-select-all');
 if(selectAll) selectAll.indeterminate = selectedCount > 0 && selectedCount < files.length;
}
function openAttachmentPanel(rowIndex, sourceContext = null){
 if(rowIndex <= 0) return;
 selectedAttachmentIndexes.clear();
 attachmentActionsOpen = false;
 activeAttachmentSource = sourceContext ? {
  projectIndex:Number(sourceContext.projectIndex),
  folderIndex:Number(sourceContext.folderIndex)
 } : null;
 const sheet = getAttachmentSheet();
 if(!sheet) return;
 activeAttachmentRow = rowIndex;
 ensureSheetAttachments(sheet);
 syncAttachmentCell(sheet, rowIndex);
 if(activeAttachmentSource){
  moveAttachmentPanelToHost(reportView);
  reportView.classList.add('attachments-open');
  gridSheetView.classList.remove('attachments-open');
 }else{
  moveAttachmentPanelToHost(getAttachmentPanelDefaultHost());
  gridSheetView.classList.add('attachments-open');
  reportView.classList.remove('attachments-open');
 }
 attachmentPanel.setAttribute('aria-hidden', 'false');
 const legacyPanel = document.getElementById('attachPanel');
 const toolbarBtn = document.getElementById('tbAttach');
 if(legacyPanel) legacyPanel.classList.remove('open');
 if(toolbarBtn) toolbarBtn.classList.add('active');
 renderAttachmentPanel();
 refreshReportAttachmentBadge(activeAttachmentSource, rowIndex);
 if(!activeAttachmentSource) setActiveSheetCell(rowIndex, 0, false);
}

function openAttachmentPickerForRow(rowIndex){
 if(rowIndex <= 0) return;
 openAttachmentPanel(rowIndex);
 attachInput.click();
}

function closeAttachmentPanel(){
 selectedAttachmentIndexes.clear();
 attachmentActionsOpen = false;
 activeAttachmentRow = null;
 activeAttachmentSource = null;
 gridSheetView.classList.remove('attachments-open');
 reportView.classList.remove('attachments-open');
 reportGridWrap?.querySelectorAll?.('.report-attach-btn.active').forEach(btn => btn.classList.remove('active'));
 attachmentPanel.setAttribute('aria-hidden', 'true');
 moveAttachmentPanelToHost(getAttachmentPanelDefaultHost());
 const toolbarBtn = document.getElementById('tbAttach');
 if(toolbarBtn) toolbarBtn.classList.remove('active');
}

function updateActiveCellGuides(rowIndex, colIndex){
 if(!sheetGridWrap) return;
 sheetGridWrap.querySelectorAll('.active-row-guide').forEach(el => el.classList.remove('active-row-guide'));
 sheetGridWrap.querySelectorAll('.active-col-guide').forEach(el => el.classList.remove('active-col-guide'));
 const rowEl = sheetGridWrap.querySelector(`tr[data-row-index="${rowIndex}"]`);
 if(rowEl) rowEl.classList.add('active-row-guide');
 sheetGridWrap.querySelectorAll(`.sheet-cell[data-c="${colIndex}"]`).forEach(el => el.classList.add('active-col-guide'));
 sheetGridWrap.querySelectorAll(`thead .sheet-col-head[data-col-index="${colIndex}"]`).forEach(el => el.classList.add('active-col-guide'));
}

function getSelectedColumnIndexes(fallbackCol = null){
 if(Array.isArray(sheetColumnSelection?.columns) && sheetColumnSelection.columns.length){
  return [...new Set(sheetColumnSelection.columns)].filter(c => c > 1).sort((a,b) => a - b);
 }
 if(sheetColumnSelection){
  return Array.from({length:sheetColumnSelection.c2 - sheetColumnSelection.c1 + 1}, (_, i) => sheetColumnSelection.c1 + i).filter(c => c > 1);
 }
 if(Number.isFinite(fallbackCol) && fallbackCol > 1) return [fallbackCol];
 return [];
}

function selectSheetColumnRange(colIndex, extend = false, toggle = false){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 closeSheetColumnMenu();
 const cells = ensureSheetCells(sheet);
 const lastRow = Math.max(1, cells.length - 1);
 if(toggle){
  const selected = new Set(getSelectedColumnIndexes(colIndex));
  if(selected.has(colIndex) && selected.size > 1) selected.delete(colIndex);
  else selected.add(colIndex);
  const columns = [...selected].filter(c => c > 1).sort((a,b) => a - b);
  const c1 = Math.min(...columns);
  const c2 = Math.max(...columns);
  setActiveSheetCell(1, colIndex, false);
  sheetColumnSelectAnchor = colIndex;
  sheetColumnSelection = {c1, c2, columns};
  selRangeAnchor = {row:1, col:c1};
  selRangeEnd = {row:lastRow, col:c2};
  updateRangeHighlight();
  activeCellRef.textContent = columns.map(columnName).join(', ');
  formulaInput.value = '';
  return;
 }
 if(!extend || !Number.isFinite(sheetColumnSelectAnchor)) sheetColumnSelectAnchor = colIndex;
 const anchorCol = sheetColumnSelectAnchor;
 const c1 = Math.min(anchorCol, colIndex);
 const c2 = Math.max(anchorCol, colIndex);
 const columns = Array.from({length:c2 - c1 + 1}, (_, i) => c1 + i);
 setActiveSheetCell(1, colIndex, false);
 sheetColumnSelection = {c1, c2, columns};
 selRangeAnchor = {row:1, col:anchorCol};
 selRangeEnd = {row:lastRow, col:colIndex};
 updateRangeHighlight();
 activeCellRef.textContent = c1 === c2 ? columnName(colIndex) : `${columnName(c1)}:${columnName(c2)}`;
 formulaInput.value = '';
}
function setActiveSheetCell(rowIndex, colIndex, shouldFocus = true){
 const cell = sheetGridWrap.querySelector(`.sheet-cell[data-r="${rowIndex}"][data-c="${colIndex}"]`);
 if(!cell) return;
 sheetGridWrap.querySelectorAll('.sheet-data-cell.sheet-active-cell-td').forEach(el => el.classList.remove('sheet-active-cell-td'));
 sheetGridWrap.querySelectorAll('.sheet-cell.active-cell').forEach(el => el.classList.remove('active-cell'));
 cell.classList.add('active-cell');
 cell.parentElement?.classList.add('sheet-active-cell-td');
 activeCellRef.textContent = cellRef(rowIndex, colIndex);
 formulaInput.value = cell.textContent;
 if(!isSelectingRange){
 sheetColumnSelection = null;
 selRangeAnchor = {row:rowIndex, col:colIndex};
 selRangeEnd = selRangeAnchor;
 updateRangeHighlight();
 }
 updateTextFormatButtonStates(rowIndex, colIndex);
 updateActiveCellGuides(rowIndex, colIndex);
 if(shouldFocus) cell.focus();
}

function restoreActiveSheetCell(rowIndex, colIndex, shouldFocus = false){
 const cell = sheetGridWrap.querySelector(`.sheet-cell[data-r="${rowIndex}"][data-c="${colIndex}"]`);
 if(!cell) return;
 setActiveSheetCell(rowIndex, colIndex, shouldFocus);
 cell.scrollIntoView({block:'nearest', inline:'nearest'});
}

function moveActiveSheetCell(rowStep, colStep){
 const current = sheetGridWrap.querySelector('.sheet-cell.active-cell') || sheetGridWrap.querySelector('.sheet-cell');
 if(!current) return;
 const row = Math.max(1, Number(current.dataset.r) + rowStep);
 const col = Math.max(0, Number(current.dataset.c) + colStep);
 setActiveSheetCell(row, col);
}

function getColumnConfig(col, sheet = getActiveSheet()){
 const base = SHEET_COLUMN_CONFIG[col] || {type:'text', label:columnName(col), width:116};
 const runtime = sheet?._columnConfigs?.[col] || {};
 const legacyType = sheet?._columnTypes?.[col];
 const cells = sheet ? ensureSheetCells(sheet) : null;
 const label = runtime.label || cells?.[0]?.[col] || base.label || columnName(col);
 const type = runtime.type || legacyType || base.type || 'text';
 return {
 ...base,
 ...runtime,
 label,
 type,
 format: runtime.format || sheet?._columnFormats?.[col] || base.format || Formatters.defaultConfig(type),
 options: runtime.options || base.options || [],
 knownContacts: runtime.knownContacts || base.knownContacts || PROJECT_CONTACTS
 };
}

function isEditableSheetCell(row, col){
 if(row <= 0 || col <= 1) return false;
 const activeSheet = getActiveSheet();
 if(activeSheet?._lockedCols?.[col]) return false;
 const colType = getColumnConfig(col).type;
 // Dropdown cells are editable via click-selection, not contenteditable
 // Date cells use a date picker instead of free text
 // Number cells only allow numeric input
 return !['dropdown','date','status','attachment','contact','CONTACT_LIST','checkbox','symbols','multi-select','duration','auto_number','created_by','created_date','modified_by','modified_date'].includes(colType);
}

function placeCursorAtEnd(cell){
 const range = document.createRange();
 range.selectNodeContents(cell);
 range.collapse(false);
 const sel = window.getSelection();
 sel.removeAllRanges();
 sel.addRange(range);
}

function startEditingCell(cell, initialChar){
 if(!cell) return;
 const row = Number(cell.dataset.r), col = Number(cell.dataset.c);
 if(!isEditableSheetCell(row, col)) return;
 if(editingCell && editingCell !== cell) commitEditingCell(editingCell);
 editingCell = cell;
 cell.contentEditable = 'true';
 cell.classList.add('editing-cell');
 if(initialChar !== undefined) cell.textContent = initialChar;
 cell.focus();
 placeCursorAtEnd(cell);
}

function commitEditingCell(cell){
 if(!cell) return;
 const sheet = getActiveSheet();
 const row = Number(cell.dataset.r), col = Number(cell.dataset.c);
 if(sheet && isEditableSheetCell(row, col)){
 const value = cell.textContent;
 const cells = ensureSheetCells(sheet);
 const oldValue = cells[row] ? (cells[row][col] || '') : '';
 if(activeSheetContext) pushSheetUndo({projectIndex:activeSheetContext.projectIndex, folderIndex:activeSheetContext.folderIndex, row, col, oldValue, newValue:value});
 setSheetCellValue(sheet, row, col, value);
 if(sheetGridWrap.querySelector('.sheet-cell.active-cell') === cell) formulaInput.value = value;
 scheduleCellSave(sheet, row, col, value);
 }
 cell.contentEditable = 'false';
 cell.classList.remove('editing-cell');
 if(editingCell === cell) editingCell = null;
}

function cancelEditingCell(cell){
 if(!cell) return;
 const sheet = getActiveSheet();
 const row = Number(cell.dataset.r), col = Number(cell.dataset.c);
 const original = sheet ? (ensureSheetCells(sheet)[row]?.[col] ?? '') : '';
 cell.textContent = original;
 cell.contentEditable = 'false';
 cell.classList.remove('editing-cell');
 if(editingCell === cell) editingCell = null;
 formulaInput.value = original;
}

function expandAncestorsForRow(sheet, rowIndex){
 const cells = ensureSheetCells(sheet);
 for(let i = 1; i < rowIndex; i++){
 const row = cells[i];
 if(row && row._collapsed && rowHasChildren(cells, i)){
 const end = getDescendantEndIndex(cells, i);
 if(rowIndex <= end) row._collapsed = false;
 }
 }
}

function renderGridSheet(sheet, options){
 const previousActive = getActiveSheetCellPosition();
 const previousSelection = {
  active: previousActive ? {row: previousActive.row, col: previousActive.col} : null,
  anchor: selRangeAnchor ? {...selRangeAnchor} : null,
  end: selRangeEnd ? {...selRangeEnd} : null,
  columnAnchor: sheetColumnSelectAnchor,
  columnSelection: sheetColumnSelection ? {...sheetColumnSelection} : null,
  selecting: isSelectingRange
 };
 const cells = ensureSheetCells(sheet);
 const attachments = ensureSheetAttachments(sheet);
 cells.forEach((row, rowIndex) => {
 if(rowIndex > 0){
 const files = attachments[rowIndex] || [];
 row[0] = files.length ? `📎 ${files.length}` : '📎';
 }
 });
 const colCount = cells[0].length;
 const hiddenCols = sheet._config?.hiddenCols || [];
 const visibleCols = Array.from({length:colCount}, (_, i) => i).filter(i => i !== 1 && !hiddenCols.includes(i));
 const sheetSettings = ensureSheetSettings(sheet);
 const selectedRowsSet = ensureSheetSelectedRows(sheet);
 const hierarchyHiddenRows = computeHierarchyHiddenRows(cells);
 const colKeyPrefix = `sheet:${activeSheetContext.projectIndex}:${activeSheetContext.folderIndex}`;
 const searchTerm = String(sheet._searchTerm || '').trim().toLowerCase();
 let firstSearchHit = null;
 // Cột A (đính kèm) đã bị đóng băng/sticky bằng CSS riêng (thead th:nth-child(2)) — giữ nguyên độ rộng cố định,
 // KHÔNG cho kéo đổi để tránh xung đột với CSS đó. Các cột còn lại kéo được như Excel, độ rộng lưu localStorage.
 const colWidths = [34].concat(visibleCols.map(colIndex => {
 if(colIndex === 0) return 44;
 const colConfig = getColumnConfig(colIndex, sheet);
  const defaultWidth = colConfig?.width || 116;
  return getStoredColWidth(`${colKeyPrefix}:c${colIndex}`, defaultWidth);
  }));
  const frozenCol = Number(sheet._frozenCol);
  const hasUserFrozenCols = Number.isFinite(frozenCol) && frozenCol > 1;
  const frozenLeftByCol = {};
  if(hasUserFrozenCols){
  let frozenLeft = 34;
  visibleCols.forEach(colIndex => {
   const colWidth = colIndex === 0 ? 44 : getStoredColWidth(`${colKeyPrefix}:c${colIndex}`, getColumnConfig(colIndex, sheet)?.width || 116);
   if(colIndex <= frozenCol){
    frozenLeftByCol[colIndex] = frozenLeft;
    frozenLeft += colWidth;
   }
  });
  }
  const tableTotalWidth = colWidths.reduce((sum, w) => sum + w, 0);
  const colGroupHtml = `<colgroup><col style="width:34px">` +
  visibleCols.concat(0).map((colIndex, _, arr) => {
  if(colIndex === 0 && arr.length > 1 && arr[0] === 0) return `<col style="width:44px">`;
  if(colIndex === 0) return '';
  const key = `${colKeyPrefix}:c${colIndex}`;
  const colConfig = getColumnConfig(colIndex, sheet);
  const defaultWidth = colConfig?.width || 116;
  return `<col data-col-key="${key}" style="width:${getStoredColWidth(key, defaultWidth)}px">`;
  }).join('') + `</colgroup>`;
  const header = visibleCols.map(colIndex => {
 const sortEntry = (sheet._sorts || []).find(s => s.col === colIndex);
 const caret = colIndex <= 1 ? '' : `<span class="sort-caret">${sortEntry ? (sortEntry.dir === 'asc' ? '▲' : '▼') : '↕'}</span>`;
 const colConfig = getColumnConfig(colIndex, sheet);
 const colLabel = colConfig.label || columnName(colIndex);
 const colDescription = String(colConfig.description || '').trim();
 const titleText = colIndex > 1 ? (colDescription ? `Mo ta: ${colDescription}` : 'Bam de doi ten/kieu cot') : '';
 const clickAttr = colIndex > 1 ? `data-col-index="${colIndex}" title="${escapeHtml(titleText)}"` : '';
 const typeBadge = colIndex > 1 ? `<span class="col-type-badge">${escapeHtml(columnTypeIcon(colConfig.type))}</span>` : '';
 const descIcon = colDescription ? `<span class="col-desc-icon" title="${escapeHtml(colDescription)}">i</span>` : '';
 const lockIcon = sheet._lockedCols?.[colIndex] ? `<span class="col-lock-icon" title="Cot dang khoa">L</span>` : '';
 const freezeIcon = hasUserFrozenCols && colIndex <= frozenCol && colIndex > 1 ? `<span class="col-freeze-icon" title="Cot dang freeze">|</span>` : '';
 const frozenHeadClass = hasUserFrozenCols && frozenLeftByCol[colIndex] !== undefined ? ' frozen-user-col-head' : '';
 const frozenHeadStyle = hasUserFrozenCols && frozenLeftByCol[colIndex] !== undefined ? `left:${frozenLeftByCol[colIndex]}px;` : '';
 if(colIndex === 0){
 return `<th class="sheet-col-head${frozenHeadClass}" style="${frozenHeadStyle}" ${clickAttr}>${typeBadge}<span class="col-type-name">${escapeHtml(colLabel)}</span>${descIcon}${lockIcon}${freezeIcon}${caret}${colIndex > 1 ? '<button type="button" class="col-header-actions" title="Column actions" aria-label="Column actions">...</button>' : ''}</th>`;
 }
 const key = `${colKeyPrefix}:c${colIndex}`;
 const defaultWidth = colConfig?.width || 116;
 return `<th class="sheet-col-head ${colIndex === 1 ? 'status-col' : ''}${frozenHeadClass}" data-col-key="${key}" style="width:${getStoredColWidth(key, defaultWidth)}px;${frozenHeadStyle}" ${clickAttr}>${typeBadge}<span class="col-type-name">${escapeHtml(colLabel)}</span>${descIcon}${lockIcon}${freezeIcon}${caret}${colIndex > 1 ? '<button type="button" class="col-header-actions" title="Column actions" aria-label="Column actions">...</button>' : ''}</th>`;
 }).join('');
 const body = cells.map((row, rowIndex) => {
 if(rowIndex === 0) return '';
 const hidden = rowIndex > 0 && (!rowMatchesSearchAndFilter(sheet, row) || hierarchyHiddenRows.has(rowIndex));
 const cellsHtml = visibleCols.map(colIndex => {
 const value = row[colIndex];
 const isStatusCell = colIndex === 1 && rowIndex > 0;
 const isHierarchyCell = colIndex === ROW_HIERARCHY_COL && rowIndex > 0;
 const isAttachmentCell = colIndex === 0 && rowIndex > 0;
 const locked = rowIndex === 0 || colIndex === 0 || colIndex === 1;
 const colConfig = getColumnConfig(colIndex, sheet);
 const type = colConfig.type || 'text';
 const columnFormat = sheet._columnFormats?.[colIndex] || colConfig.format || Formatters.defaultConfig(type);
 let inner = '';
 if(isStatusCell){
 inner = `<span class="status-dot" style="background:${STATUS_HEX[value] || STATUS_HEX['']}"></span>`;
 } else if(rowIndex > 0 && ['created_by','created_date','modified_by','modified_date'].includes(type)){
 inner = escapeHtml(renderSystemColumnValue(sheet, rowIndex, type));
 } else if(rowIndex > 0 && type === 'multi-select'){
 inner = Formatters.multi_select(value);
 } else if(rowIndex > 0 && type === 'contact'){
 inner = Formatters.contact(value);
 } else if(rowIndex > 0 && type === 'checkbox'){
 const checked = !!value && String(value).toLowerCase() !== 'false' && String(value) !== '0';
 inner = `<span class="sheet-checkbox-box ${checked ? 'checked' : ''}" aria-hidden="true">✓</span>`;
 } else if(rowIndex > 0 && Formatters[type]){
 inner = escapeHtml(Formatters[type](value, columnFormat));
 } else {
 inner = escapeHtml(value);
 }
 const isSearchHit = !!(searchTerm && rowIndex > 0 && String(value ?? '').toLowerCase().includes(searchTerm));
 if(isSearchHit && !firstSearchHit) firstSearchHit = {row: rowIndex, col: colIndex};
 const ruleColor = rowIndex > 0 ? getCellRuleColor(sheet, colIndex, value) : '';
 const manualStyle = rowIndex > 0 ? getCellStyle(sheet, rowIndex, colIndex) : null;
 const styleParts = [];
 if(manualStyle){
 if(manualStyle.bold) styleParts.push('font-weight:700');
 if(manualStyle.italic) styleParts.push('font-style:italic');
 if(manualStyle.underline || manualStyle.strike){
 const decos = [];
 if(manualStyle.underline) decos.push('underline');
 if(manualStyle.strike) decos.push('line-through');
 styleParts.push(`text-decoration:${decos.join(' ')}`);
 }
 if(manualStyle.color) styleParts.push(`color:${manualStyle.color}`);
 if(manualStyle.align) styleParts.push(`text-align:${manualStyle.align}`);
 }
 const bgColor = (manualStyle && manualStyle.bg) || ruleColor;
 if(bgColor && !isStatusCell) styleParts.push(`background:${bgColor}`);
 const cellStyle = styleParts.length ? ` style="${styleParts.join(';')}"` : '';
 const wrapMode = sheetSettings.columnWrap?.[colIndex];
 const wrapClass = wrapMode === true ? 'col-wrap' : wrapMode === false ? 'col-no-wrap' : '';
 const cellTitle = isAttachmentCell ? 'Bấm để đính kèm file lên Google Drive'
 : isStatusCell ? 'Bấm để đổi trạng thái'
 : '';
 const cellDiv = `<div class="sheet-cell ${locked ? 'locked-cell' : ''} ${isStatusCell ? 'status-cell' : ''} ${isHierarchyCell ? 'hierarchy-cell' : ''} ${isAttachmentCell ? 'attachment-cell' : ''} ${wrapClass} ${isSearchHit ? 'sheet-search-hit' : ''}"${cellStyle} contenteditable="false" tabindex="-1" spellcheck="false" data-r="${rowIndex}" data-c="${colIndex}" title="${cellTitle}">${inner}</div>`;
 const cellContent = isHierarchyCell
 ? (() => {
 const level = getRowLevel(row);
 const hasChildren = rowHasChildren(cells, rowIndex);
 const toggle = hasChildren
 ? `<button type="button" class="row-collapse-toggle" data-toggle-row="${rowIndex}" title="${row._collapsed ? 'Mở rộng dòng con' : 'Thu gọn dòng con'}">${row._collapsed ? '▸' : '▾'}</button>`
 : `<span class="row-collapse-spacer"></span>`;
 return `<div class="hierarchy-cell-wrap"><span class="row-indent" style="width:${level * 18}px"></span>${toggle}${cellDiv}</div>`;
 })()
 : cellDiv;
  const userFrozen = hasUserFrozenCols && frozenLeftByCol[colIndex] !== undefined;
  const frozenCellStyle = userFrozen ? ` style="left:${frozenLeftByCol[colIndex]}px"` : '';
  return `
  <td class="sheet-data-cell ${colIndex === 0 ? 'frozen-col-cell' : ''} ${userFrozen ? 'frozen-user-col-cell' : ''} ${rowIndex === 0 ? 'frozen-row-cell' : ''} ${rowIndex === 0 && colIndex === 0 ? 'frozen-corner-cell' : ''}"${frozenCellStyle}>
  ${cellContent}
  </td>
  `;
 }).join('');
  return `<tr data-row-index="${rowIndex}" ${hidden ? 'style="display:none"' : ''}><th class="sheet-row-head">${rowIndex}</th>${cellsHtml}</tr>`;
 }).join('');

 sheetGridWrap.innerHTML = `
 <table class="grid-sheet-table ${sheetSettings.defaultWrap ? 'wrap-enabled' : ''}" style="width:${tableTotalWidth}px;--row-height:${sheetSettings.defaultRowHeight}px">
 ${colGroupHtml}
 <thead><tr><th class="sheet-corner"></th>${header}</tr></thead>
 <tbody>${body}</tbody>
 </table>
 `;
 sheetGridWrap.querySelectorAll('thead .sheet-col-head[data-col-index]').forEach(head => {
 head.addEventListener('click', (e) => {
 if(e.target.closest('.col-resize-handle') || e.target.closest('input')) return;
 e.preventDefault();
 e.stopPropagation();
 const colIndex = Number(head.dataset.colIndex);
 if(e.target.closest('.col-header-actions')){
  selectSheetColumnRange(colIndex, e.shiftKey, e.ctrlKey || e.metaKey);
  openSheetColumnMenu(colIndex, head);
  return;
 }
 selectSheetColumnRange(colIndex, e.shiftKey, e.ctrlKey || e.metaKey);
 });
 head.addEventListener('dblclick', (e) => {
  if(e.target.closest('.col-resize-handle') || e.target.closest('input')) return;
  e.preventDefault();
  e.stopPropagation();
  openColumnTypePicker(Number(head.dataset.colIndex), head);
 });
 head.addEventListener('contextmenu', (e) => {
  if(e.target.closest('.col-resize-handle') || e.target.closest('input')) return;
  e.preventDefault();
  e.stopPropagation();
  selectSheetColumnRange(Number(head.dataset.colIndex), e.shiftKey, e.ctrlKey || e.metaKey);
  openSheetColumnMenu(Number(head.dataset.colIndex), head);
 });
 });
 wireColumnResize(sheetGridWrap.querySelector('table'), new Set([1]));
 if(firstSearchHit){
 setActiveSheetCell(firstSearchHit.row, firstSearchHit.col, false);
 const hitCell = sheetGridWrap.querySelector(`.sheet-cell[data-r="${firstSearchHit.row}"][data-c="${firstSearchHit.col}"]`);
 if(hitCell) requestAnimationFrame(() => hitCell.scrollIntoView({block:'center', inline:'center'}));
 } else if(previousSelection.active && cells.length > 1){
  const maxRow = Math.max(1, cells.length - 1);
  const maxCol = Math.max(0, colCount - 1);
  const row = Math.max(1, Math.min(previousSelection.active.row, maxRow));
  const col = Math.max(0, Math.min(previousSelection.active.col, maxCol));
  const wasSelectingRange = previousSelection.selecting;
  isSelectingRange = true;
  selRangeAnchor = previousSelection.anchor
   ? {
    row: Math.max(1, Math.min(previousSelection.anchor.row, maxRow)),
    col: Math.max(0, Math.min(previousSelection.anchor.col, maxCol))
   }
   : {row, col};
  selRangeEnd = previousSelection.end
   ? {
    row: Math.max(1, Math.min(previousSelection.end.row, maxRow)),
    col: Math.max(0, Math.min(previousSelection.end.col, maxCol))
   }
   : selRangeAnchor;
  sheetColumnSelectAnchor = Number.isFinite(previousSelection.columnAnchor)
   ? Math.max(0, Math.min(previousSelection.columnAnchor, maxCol))
   : null;
  sheetColumnSelection = previousSelection.columnSelection
   ? {
    c1: Math.max(0, Math.min(previousSelection.columnSelection.c1, maxCol)),
    c2: Math.max(0, Math.min(previousSelection.columnSelection.c2, maxCol)),
    columns: Array.isArray(previousSelection.columnSelection.columns)
     ? previousSelection.columnSelection.columns.filter(c => c > 1 && c <= maxCol)
     : null
   }
   : null;
  setActiveSheetCell(row, col, false);
  isSelectingRange = wasSelectingRange;
  updateRangeHighlight();
 } else if(cells.length > 1) setActiveSheetCell(1, Math.max(0, Math.min(2, colCount - 1)), false);
 updateToolButtonStates(sheet);

 if(options && options.scrollToRow != null){
 const rowEl = sheetGridWrap.querySelector(`tr[data-row-index="${options.scrollToRow}"]`);
 if(rowEl){
 rowEl.scrollIntoView({block:'center'});
 rowEl.classList.add('row-flash-highlight');
 setTimeout(() => rowEl.classList.remove('row-flash-highlight'), 1600);
 }
 }
}

function resetSheetViewportPosition(){
 window.scrollTo(0, 0);
 document.documentElement.scrollLeft = 0;
 document.body.scrollLeft = 0;
 if(sheetGridWrap) sheetGridWrap.scrollLeft = 0;
 if(smartsheetToolbar) smartsheetToolbar.scrollLeft = 0;
 if(gridSheetView) gridSheetView.scrollLeft = 0;
}

function renderSheetColumnsPopover(sheet){
 if(!sheet) sheet = getActiveSheet();
 if(!sheet) return;
 if(!sheet._config || typeof sheet._config !== 'object') sheet._config = {};
 if(!Array.isArray(sheet._config.hiddenCols)) sheet._config.hiddenCols = [];
 const cols = SHEET_COLUMN_CONFIG;
 ssColumnsList.innerHTML = cols.map((c, i) => {
 // Không cho ẩn cột 0 (đính kèm) và 1 (trạng thái)
 if(i === 0 || i === 1) return '';
 return `
 <label class="ss-pop-list-item checkbox-row">
 <input type="checkbox" data-col="${i}" ${!sheet._config.hiddenCols.includes(i) ? 'checked' : ''}>
 <span>${escapeHtml(c.label)}</span>
 </label>
 `;
 }).join('');
 ssColumnsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
 cb.addEventListener('change', () => {
 const colIndex = Number(cb.dataset.col);
 sheet._config.hiddenCols = sheet._config.hiddenCols.filter(x => x !== colIndex);
 if(!cb.checked) sheet._config.hiddenCols.push(colIndex);
 updateSheetColumnsBtn(sheet);
 renderGridSheet(sheet);
 });
 });
}

function openSheetNameModal(projectIndex){
 pendingGridProjectIndex = projectIndex;
 sheetNameInput.value = 'New Sheet';
 sheetNameModal.classList.add('show');
 sheetNameModal.setAttribute('aria-hidden', 'false');
 requestAnimationFrame(()=>{
 sheetNameInput.focus();
 sheetNameInput.select();
 });
}

function closeSheetNameModal(){
 sheetNameModal.classList.remove('show');
 sheetNameModal.setAttribute('aria-hidden', 'true');
 pendingGridProjectIndex = null;
}

function createGridSheet(){
 const projectIndex = pendingGridProjectIndex ?? ctxProjectIndex ?? activeProjectIndex;
 if(projectIndex === null || !PROJECT_FOLDERS[projectIndex]) return;

 const sheetName = sheetNameInput.value.trim() || 'New Sheet';
 const item = buildWorkspaceItem('grid', sheetName);
 PROJECT_FOLDERS[projectIndex].push(item);
 const sheetIndex = PROJECT_FOLDERS[projectIndex].length - 1;
 closeSheetNameModal();
 saveCurrentProjectStateSilently();
 persistToDrive();
 openSheet(projectIndex, sheetIndex);
}

const importCsvBtn = document.getElementById('importCsvBtn');

const importCsvModal = document.getElementById('importCsvModal');

const importCsvClose = document.getElementById('importCsvClose');

const importCsvCancel = document.getElementById('importCsvCancel');

const importCsvFile = document.getElementById('importCsvFile');

const importCsvImport = document.getElementById('importCsvImport');

const importPreviewWrap = document.getElementById('importPreviewWrap');

const importPreviewHead = document.getElementById('importPreviewHead');

const importPreviewBody = document.getElementById('importPreviewBody');

const importMapping = document.getElementById('importMapping');

const importMapRows = document.getElementById('importMapRows');

const importMergeCol = document.getElementById('importMergeCol');

const importKeyCol = document.getElementById('importKeyCol');

let parsedCsvRows = [];

let parsedCsvHeaders = [];

let skipFirstRow = true;

function openImportModal(){
 parsedCsvRows = [];
 parsedCsvHeaders = [];
 skipFirstRow = true;
 importCsvFile.value = '';
 importPreviewWrap.style.display = 'none';
 importMapping.style.display = 'none';
 importMergeCol.style.display = 'none';
 importCsvImport.disabled = true;
 importCsvModal.style.display = 'flex';
 importCsvModal.setAttribute('aria-hidden', 'false');
}

function closeImportModal(){
 importCsvModal.setAttribute('aria-hidden', 'true');
 importCsvModal.style.display = 'none';
}

importCsvBtn.addEventListener('click', openImportModal);

importCsvCancel.addEventListener('click', closeImportModal);

importCsvClose.addEventListener('click', closeImportModal);

importCsvModal.addEventListener('click', (e)=>{
 if(e.target === importCsvModal) closeImportModal();
});

importCsvFile.addEventListener('change', ()=>{
 const file = importCsvFile.files?.[0];
 if(!file) return;
 const reader = new FileReader();
 reader.onload = (e)=>{
 const text = e.target.result;
 const lines = text.split(/\\r?\\n/).filter((l, i, a) => i < a.length - 1 || l.trim() !== '');
 if(lines.length === 0){ alert('File rỗng.'); return; }

// Detect delimiter
 const commaCount = (lines[0].match(/,/g) || []).length;
 const tabCount = (lines[0].match(/\\t/g) || []).length;
 const semiCount = (lines[0].match(/;/g) || []).length;
 let delim = ',';
 if(semiCount > commaCount && semiCount > tabCount) delim = ';';
 else if(tabCount > commaCount) delim = '\\t';

parsedCsvHeaders = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''));
 parsedCsvRows = lines.slice(1).map(l => {
 const vals = [];
 let current = '', inQuote = false;
 for(let i = 0; i < l.length; i++){
 const ch = l[i];
 if(ch === '"'){ inQuote = !inQuote; continue; }
 if(ch === delim && !inQuote){ vals.push(current.trim()); current = ''; continue; }
 current += ch;
 }
 vals.push(current.trim());
 return vals;
 });

// Show preview
 const headHtml = '<tr>' + parsedCsvHeaders.map(h => '<th style="border:1px solid #ccc;padding:2px 4px;background:#f5f5f5;text-align:left;white-space:nowrap">' + escapeHtml(h) + '</th>').join('') + '</tr>';
 const maxPreview = Math.min(parsedCsvRows.length, 10);
 const bodyHtml = parsedCsvRows.slice(0, maxPreview).map(row =>
 '<tr>' + parsedCsvHeaders.map((_, ci) => '<td style="border:1px solid #ddd;padding:2px 4px;white-space:nowrap">' + escapeHtml(row[ci] || '') + '</td>').join('') + '</tr>'
 ).join('');
 importPreviewHead.innerHTML = headHtml;
 importPreviewBody.innerHTML = bodyHtml;
 importPreviewWrap.style.display = 'block';

// Build column mapping
 const sheetConfig = SHEET_COLUMN_CONFIG;
 let mapHtml = '';
 parsedCsvHeaders.forEach((h, i) => {
 // Try auto-match
 const matchIdx = sheetConfig.findIndex(c =>
c.label.toLowerCase().trim() === h.toLowerCase().trim() ||
c.key.toLowerCase().trim() === h.toLowerCase().trim()
 );
 const matchedLabel = matchIdx >= 0 ? sheetConfig[matchIdx].label : '(bỏ qua)';
 mapHtml += '<div style="margin:2px 0;display:flex;gap:4px;align-items:center">' +
 '<span style="min-width:100px;font-weight:500">' + escapeHtml(h) + '</span> → ' +
 '<select data-csv-col="' + i + '" style="flex:1">' +
 '<option value="">(bỏ qua)</option>' +
 sheetConfig.map((c, ci) => '<option value="' + ci + '"' + (ci === matchIdx ? ' selected' : '') + '>' + escapeHtml(c.label) + '</option>').join('') +
 '</select></div>';
 });
 importMapRows.innerHTML = mapHtml;
 importMapping.style.display = 'block';

// Populate key column selector for merge
 importKeyCol.innerHTML = sheetConfig.map((c, i) => '<option value="' + i + '">' + escapeHtml(c.label) + '</option>').join('');
 importMergeCol.style.display = 'flex';

importCsvImport.disabled = false;
 };
 reader.readAsText(file);
});

document.querySelectorAll('input[name="importMode"]').forEach(radio => {
 radio.addEventListener('change', ()=>{
 importMergeCol.style.display = radio.value === 'merge' ? 'block' : 'none';
 });
});

importCsvImport.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 const mode = document.querySelector('input[name="importMode"]:checked')?.value || 'append';

// Get column mapping
 const mapSelects = importMapRows.querySelectorAll('select');
 const colMap = {}; // csvColIndex -> sheetColIndex
 mapSelects.forEach(sel => {
 const csvCol = parseInt(sel.dataset.csvCol);
 const sheetCol = sel.value !== '' ? parseInt(sel.value) : -1;
 if(sheetCol >= 0) colMap[csvCol] = sheetCol;
 });

// Filter out unmapped columns from parsed rows
 const mappedRows = parsedCsvRows.map(row => {
 const newRow = Array(sheet.cells[0]?.length || SHEET_COLUMN_CONFIG.length).fill('');
 Object.entries(colMap).forEach(([csvIdx, sheetIdx]) => {
 newRow[sheetIdx] = row[parseInt(csvIdx)] || '';
 });
 return newRow;
 });

if(mode === 'replace'){
 // Keep header row, replace everything else
 const headerRow = Array.isArray(cells[0]) ? [...cells[0]] : SHEET_COLUMN_CONFIG.map(c => c.label);
 sheet.cells = [headerRow, ...mappedRows];
 // Ensure minimum rows
 while(sheet.cells.length < 3) sheet.cells.push(Array(sheet.cells[0].length).fill(''));
 }
 else if(mode === 'append'){
 // Append after data rows (skip header)
 let dataStart = 0;
 if(cells.length > 0 && cells[0].some(v => String(v||'').trim())) dataStart = 1;
 sheet.cells.splice(sheet.cells.length, 0, ...mappedRows);
 }
 else if(mode === 'merge'){
 const keyCol = parseInt(importKeyCol.value);
 // Build lookup of existing rows by key column value
 const existingMap = new Map();
 for(let r = 1; r < cells.length; r++){
 const key = String(cells[r][keyCol] || '').trim().toLowerCase();
 if(key) existingMap.set(key, r);
 }
 mappedRows.forEach(newRow => {
 const key = String(newRow[keyCol] || '').trim().toLowerCase();
 if(key && existingMap.has(key)){
 // Update existing row (non-empty cells overwrite)
 const rowIdx = existingMap.get(key);
 newRow.forEach((val, ci) => {
 if(val !== '') cells[rowIdx][ci] = val;
 });
 } else {
 // Append as new row
 cells.push([...newRow]);
 }
 });
 }

sheet.updated = new Date().toLocaleDateString('vi-VN');
 renderGridSheet(sheet);
 closeImportModal();
});

const ssSortBtn = document.getElementById('ssSortBtn');

const ssFilterBtn = document.getElementById('ssFilterBtn');

const ssFormatBtn = document.getElementById('ssFormatBtn');

const ssGroupBtn = document.getElementById('ssGroupBtn');

const ssIndentBtn = document.getElementById('ssIndentBtn');

const ssOutdentBtn = document.getElementById('ssOutdentBtn');

const ssSearchInput = document.getElementById('ssSearchInput');

const ssAddRowBtn = document.getElementById('ssAddRowBtn');

const ssFormsBtn = document.getElementById('ssFormsBtn');

const ssPublishBtn = document.getElementById('ssPublishBtn');

const ssAutomationBtn = document.getElementById('ssAutomationBtn');

const ssWrapBtn = document.getElementById('ssWrapBtn');

const ssRowHeightSelect = document.getElementById('ssRowHeightSelect');

const ssClearDataBtn = document.getElementById('ssClearDataBtn');

const ssRepostDateBtn = document.getElementById('ssRepostDateBtn');

const ssCarryForwardBtn = document.getElementById('ssCarryForwardBtn');

const ssDuplicateBtn = document.getElementById('ssDuplicateBtn');

const ssBulkEditBtn = document.getElementById('ssBulkEditBtn');

const ssColumnsBtn = document.getElementById('ssColumnsBtn');

const ssColumnsPopover = document.getElementById('ssColumnsPopover');

const ssColumnsList = document.getElementById('ssColumnsList');

const sortPopover = document.getElementById('sortPopover');

const sortChips = document.getElementById('sortChips');

const sortAddBtn = document.getElementById('sortAddBtn');

const sortPicker = document.getElementById('sortPicker');

const sortPickerSearch = document.getElementById('sortPickerSearch');

const sortPickerList = document.getElementById('sortPickerList');

const sortClearBtn = document.getElementById('sortClearBtn');

const filterPopover = document.getElementById('filterPopover');

const filterChips = document.getElementById('filterChips');

const filterEmptyLabel = document.getElementById('filterEmptyLabel');

const filterAddBtn = document.getElementById('filterAddBtn');

const filterPicker = document.getElementById('filterPicker');

const filterPickerSearch = document.getElementById('filterPickerSearch');

const filterPickerList = document.getElementById('filterPickerList');

const filterClearBtn = document.getElementById('filterClearBtn');

const filterSaveBtn = document.getElementById('filterSaveBtn');

const filterLoadBtn = document.getElementById('filterLoadBtn');

const formatPopover = document.getElementById('formatPopover');

const formatChips = document.getElementById('formatChips');

const formatAddBtn = document.getElementById('formatAddBtn');

const formatPicker = document.getElementById('formatPicker');

const formatClearBtn = document.getElementById('formatClearBtn');

const ssBoldBtn = document.getElementById('ssBoldBtn');

const ssItalicBtn = document.getElementById('ssItalicBtn');

const ssUnderlineBtn = document.getElementById('ssUnderlineBtn');

const ssStrikeBtn = document.getElementById('ssStrikeBtn');

const ssTextColorBtn = document.getElementById('ssTextColorBtn');

const ssFillColorBtn = document.getElementById('ssFillColorBtn');

const ssAlignLeftBtn = document.getElementById('ssAlignLeftBtn');

const ssAlignCenterBtn = document.getElementById('ssAlignCenterBtn');

const ssAlignRightBtn = document.getElementById('ssAlignRightBtn');

const ssClearFormatBtn = document.getElementById('ssClearFormatBtn');

const ssFormatPainterBtn = document.getElementById('ssFormatPainterBtn');

function closeSheetMoreMenu(){
 if(ssMoreMenu) ssMoreMenu.hidden = true;
}

function toggleSheetMoreMenu(){
 if(!ssMoreMenu) return;
 ssMoreMenu.hidden = !ssMoreMenu.hidden;
}

if(ssMoreBtn) ssMoreBtn.addEventListener('click', (event) => {
 event.stopPropagation();
 toggleSheetMoreMenu();
});

function renderColumnPickerList(container, sheet, excludeCols, onPick, searchTerm){
 const term = (searchTerm || '').toLowerCase();
 const cols = getPickableColumns(sheet).filter(c => !excludeCols.includes(c.index) && c.label.toLowerCase().includes(term));
 container.innerHTML = cols.length
 ? cols.map(c => `<div class="ss-pop-list-item" data-col="${c.index}">${escapeHtml(c.label)}</div>`).join('')
 : '<div class="ss-pop-empty" style="padding:8px;">Không tìm thấy cột.</div>';
 container.querySelectorAll('.ss-pop-list-item').forEach(el => {
 el.addEventListener('click', () => onPick(Number(el.dataset.col)));
 });
}

function renderSortPopover(sheet){
 const sorts = sheet._sorts || [];
 const cols = getPickableColumns(sheet);
 sortChips.innerHTML = sorts.map((s, i) => {
 const col = cols.find(c => c.index === s.col);
 const label = col ? col.label : columnName(s.col);
 const prefix = i === 0 ? 'Sắp theo' : 'Sau đó theo';
 return `
 <div class="ss-pop-chip">
 <span class="ss-chip-label">${prefix}: <strong>${escapeHtml(label)}</strong></span>
 <button class="ss-dir-btn" data-act="dir" data-i="${i}" title="Đổi chiều sắp xếp">${s.dir === 'asc' ? '▲' : '▼'}</button>
 <button data-act="remove" data-i="${i}" title="Xoá">✕</button>
 </div>
 `;
 }).join('');
 sortChips.querySelectorAll('button').forEach(btn => {
 const i = Number(btn.dataset.i);
 btn.addEventListener('click', () => {
 if(btn.dataset.act === 'dir') toggleSortDir(sheet, i); else removeSortLevel(sheet, i);
 });
 });
 sortClearBtn.style.display = sorts.length ? '' : 'none';
 sortPicker.hidden = true;
}

function renderFilterPopover(sheet){
 const filters = sheet._filters || [];
 const cols = getPickableColumns(sheet);
 filterEmptyLabel.style.display = filters.length ? 'none' : '';
 filterClearBtn.style.display = filters.length ? '' : 'none';
 filterChips.innerHTML = filters.map((f, i) => {
 const col = cols.find(c => c.index === f.col);
 const label = col ? col.label : columnName(f.col);
 return `
 <div class="ss-pop-chip">
 <span class="ss-chip-label">${escapeHtml(label)}:</span>
 <input type="text" data-i="${i}" placeholder="Nhập giá trị..." value="${escapeHtml(f.value)}">
 <button data-act="remove" data-i="${i}" title="Xoá">✕</button>
 </div>
 `;
 }).join('');
 filterChips.querySelectorAll('input').forEach(inp => {
 inp.addEventListener('input', () => updateFilterValue(sheet, Number(inp.dataset.i), inp.value));
 });
 filterChips.querySelectorAll('button[data-act="remove"]').forEach(btn => {
 btn.addEventListener('click', () => removeFilterLevel(sheet, Number(btn.dataset.i)));
 });
 filterPicker.hidden = true;
}

function renderFormatPopover(sheet){
 const rules = sheet._formatRules || [];
 const cols = getPickableColumns(sheet);
 formatChips.innerHTML = rules.length
 ? rules.map((r, i) => {
 const col = cols.find(c => c.index === r.col);
 const label = col ? col.label : columnName(r.col);
 const opText = r.op === 'between'
 ? `${FORMAT_RULE_OPS[r.op]} "${escapeHtml(r.value)}" - "${escapeHtml(r.value2 || '')}"`
 : ['blank','not_blank'].includes(r.op)
 ? FORMAT_RULE_OPS[r.op]
 : `${FORMAT_RULE_OPS[r.op] || r.op} "${escapeHtml(r.value || '')}"`;
 return `
 <div class="ss-pop-chip ${r.disabled ? 'disabled' : ''}">
 <span class="ss-color-swatch" style="background:${r.color}"></span>
 <span class="ss-chip-label">${escapeHtml(label)} ${opText}</span>
 <button class="ss-dir-btn" data-act="toggle" data-i="${i}" title="${r.disabled ? 'Bật quy tắc' : 'Tắt quy tắc'}">${r.disabled ? '⏸' : '▶'}</button>
 <button class="ss-dir-btn" data-act="up" data-i="${i}" title="Ưu tiên lên">▲</button>
 <button class="ss-dir-btn" data-act="down" data-i="${i}" title="Ưu tiên xuống">▼</button>
 <button data-act="remove" data-i="${i}" title="Xoá">✕</button>
 </div>
 `;
 }).join('')
 : '<div class="ss-pop-empty">Chưa có quy tắc nào.</div>';
 formatChips.querySelectorAll('button[data-act="remove"]').forEach(btn => {
 btn.addEventListener('click', () => removeFormatRule(sheet, Number(btn.dataset.i)));
 });
 formatChips.querySelectorAll('button[data-act="toggle"]').forEach(btn => {
 btn.addEventListener('click', () => toggleFormatRule(sheet, Number(btn.dataset.i)));
 });
 formatChips.querySelectorAll('button[data-act="up"]').forEach(btn => {
 btn.addEventListener('click', () => moveFormatRule(sheet, Number(btn.dataset.i), -1));
 });
 formatChips.querySelectorAll('button[data-act="down"]').forEach(btn => {
 btn.addEventListener('click', () => moveFormatRule(sheet, Number(btn.dataset.i), 1));
 });
 formatClearBtn.style.display = rules.length ? '' : 'none';
 formatPicker.hidden = true;
}

function renderFormatPickerColumnStep(){
 const sheet = getActiveSheet();
 formatPicker.innerHTML = `
 <input class="ss-pop-search" id="formatPickerSearch" placeholder="Tìm cột...">
 <div class="ss-pop-list" id="formatPickerList"></div>
 `;
 const searchEl = document.getElementById('formatPickerSearch');
 const listEl = document.getElementById('formatPickerList');
 const renderList = (term) => renderColumnPickerList(listEl, sheet, [], (col) => {
 formatDraft = {col};
 renderFormatPickerRuleStep();
 }, term);
 renderList('');
 searchEl.addEventListener('input', () => renderList(searchEl.value));
 searchEl.focus();
}

function renderFormatPickerRuleStep(){
 const sheet = getActiveSheet();
 const col = getPickableColumns(sheet).find(c => c.index === formatDraft.col);
 const label = col ? col.label : columnName(formatDraft.col);
 formatPicker.innerHTML = `
 <div class="ss-pop-empty">Cột: <strong>${escapeHtml(label)}</strong></div>
 <select id="formatRuleOp">
 <option value="gt">Lớn hơn</option>
 <option value="lt">Nhỏ hơn</option>
 <option value="eq">Bằng</option>
 <option value="contains">Chứa</option>
 <option value="not_contains">Không chứa</option>
 <option value="starts_with">Bắt đầu bằng</option>
 <option value="ends_with">Kết thúc bằng</option>
 <option value="between">Trong khoảng</option>
 <option value="blank">Rỗng</option>
 <option value="not_blank">Không rỗng</option>
 </select>
 <input type="text" id="formatRuleValue" placeholder="Giá trị so sánh...">
 <input type="text" id="formatRuleValue2" placeholder="Đến..." style="display:none">
 <div id="formatRuleColors">${FORMAT_RULE_COLORS.map((c, i) => `<span class="ss-color-swatch ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c}"></span>`).join('')}</div>
 <button class="ss-pop-addbtn" id="formatRuleApplyBtn" type="button">Áp dụng</button>
 `;
 let selectedColor = FORMAT_RULE_COLORS[0];
 formatPicker.querySelectorAll('.ss-color-swatch').forEach(sw => {
 sw.addEventListener('click', () => {
 formatPicker.querySelectorAll('.ss-color-swatch').forEach(s => s.classList.remove('selected'));
 sw.classList.add('selected');
 selectedColor = sw.dataset.color;
 });
 });
 const opEl = document.getElementById('formatRuleOp');
 const valueEl = document.getElementById('formatRuleValue');
 const value2El = document.getElementById('formatRuleValue2');
 function updateFormatValueInputs(){
 const op = opEl.value;
 valueEl.style.display = ['blank','not_blank'].includes(op) ? 'none' : '';
 value2El.style.display = op === 'between' ? '' : 'none';
 }
 opEl.addEventListener('change', updateFormatValueInputs);
 updateFormatValueInputs();
 document.getElementById('formatRuleApplyBtn').addEventListener('click', () => {
 const op = opEl.value;
 const value = valueEl.value.trim();
 const value2 = value2El.value.trim();
 if(!['blank','not_blank'].includes(op) && !value) return;
 if(op === 'between' && !value2) return;
 addFormatRule(sheet, {col: formatDraft.col, op, value, value2, color: selectedColor});
 formatPicker.hidden = true;
 formatDraft = null;
 });
 document.getElementById('formatRuleValue').focus();
}

function getSheetColumnsForBuilder(sheet){
 const cells = ensureSheetCells(sheet);
 return SHEET_COLUMN_CONFIG.map((col, i) => ({
 index:i,
 key:getColumnConfig(i, sheet).key || col.key,
 label:getColumnConfig(i, sheet).label || cells[0]?.[i] || col.label || columnName(i),
 type:getColumnConfig(i, sheet).type || 'text'
 })).filter(c => c.index > 1);
}

function openColumnTypePicker(colIndex, anchorEl){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 document.querySelector('.column-type-popover')?.remove();
 const cells = ensureSheetCells(sheet);
 const currentConfig = getColumnConfig(colIndex, sheet);
 const currentType = currentConfig.type || 'text';
 const pop = document.createElement('div');
 pop.className = 'column-type-popover';
 const rect = anchorEl.getBoundingClientRect();
 pop.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
 pop.style.top = `${Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 540))}px`;
 pop.style.width = '280px';
 const types = [
 ['text','A1 Text/Number'], ['dropdown','≡ Dropdown list'], ['multi-select','☷ Multi-select'], ['date','📅 Date'],
 ['duration','⏱ Duration'], ['contact','👤 Contact list'], ['checkbox','☑ Checkbox'],
 ['symbols','★ Symbols'], ['currency','₫ Currency'], ['number','# Number'], ['percent','% Percentage'],
 ['auto_number','# Auto number'], ['created_by','👤+ Created by'], ['created_date','📅+ Created date'],
 ['modified_by','✎👤 Modified by'], ['modified_date','✎📅 Modified date']
 ];

 function renderExtraConfig(type, cfg){
  if(type === 'dropdown'){
   return `<textarea id="v19ColumnOptionsInput" rows="3" placeholder="Tùy chọn dropdown, mỗi dòng một giá trị">${escapeHtml((cfg.options || []).join('\n'))}</textarea>`;
  }
  if(type === 'duration'){
   return `<div class="v19-muted">Bấm vào ô để nhập số ngày + giờ. Dữ liệu lưu bằng phút và hiển thị dạng 2d 4h.</div>`;
  }
  if(type === 'contact'){
   const max = Number(cfg.maxContacts || 1);
   return `<label class="ss-pop-toggle-row"><input type="checkbox" id="ctAllowMultiple" ${max > 1 ? 'checked' : ''}> Cho phép nhiều contact/ô</label>
   <input id="ctMaxContacts" type="number" min="1" max="20" value="${max > 1 ? max : 5}" style="${max > 1 ? '' : 'display:none'}">
   <label class="ss-pop-toggle-row"><input type="checkbox" id="ctRestrictList" ${cfg.restrictToList ? 'checked' : ''}> Chỉ chọn trong danh sách</label>
   <textarea id="ctKnownContacts" rows="3" placeholder="Danh sách contact riêng, mỗi dòng: Tên <email>">${escapeHtml((cfg.knownContacts && cfg.knownContacts !== PROJECT_CONTACTS ? cfg.knownContacts : []).map(c => `${c.name || c.email}${c.email ? ` <${c.email}>` : ''}`).join('\n'))}</textarea>`;
  }
  if(type === 'checkbox'){
   const style = cfg.checkboxStyle || 'check';
   return `<div class="v19-muted">Style</div>
   <div class="column-type-list" style="max-height:none">
    <button class="column-type-item ${style === 'check' ? 'selected' : ''}" type="button" data-checkbox-style="check">✓ Check</button>
    <button class="column-type-item ${style === 'flag' ? 'selected' : ''}" type="button" data-checkbox-style="flag">⚑ Flag</button>
    <button class="column-type-item ${style === 'star' ? 'selected' : ''}" type="button" data-checkbox-style="star">★ Star</button>
   </div>
   <label class="ss-pop-toggle-row"><input type="checkbox" id="cbRestrict" ${cfg.restrictToToggle !== false ? 'checked' : ''}> Restrict to checkbox use only</label>`;
  }
  if(type === 'symbols'){
   return `<div class="v19-muted">Bộ symbol: RYG</div>
   <div class="column-type-symbol-preview">🔴 🟡 🟢</div>
   <label class="ss-pop-toggle-row"><input type="checkbox" id="symRestrict" ${cfg.restrictToSymbolValues !== false ? 'checked' : ''}> Restrict to symbol values only</label>`;
  }
  if(type === 'auto_number'){
   const digits = Number(cfg.digits ?? 4);
   return `<div class="column-type-mini-grid">
    <input id="anPrefix" placeholder="Prefix" value="${escapeHtml(cfg.prefix || '')}">
    <input id="anSuffix" placeholder="Suffix" value="${escapeHtml(cfg.suffix || '')}">
   </div>
   <div class="column-type-mini-grid">
    <select id="anDigits">${[0,1,2,3,4,5,6].map(d => `<option value="${d}" ${digits === d ? 'selected' : ''}>${d} chữ số</option>`).join('')}</select>
    <input id="anStart" type="number" min="1" placeholder="Bắt đầu" value="${Number(cfg.autoStart ?? 1)}">
   </div>
   <div class="v19-muted">Preview: <b id="anPreview"></b></div>`;
  }
  if(['created_by','created_date','modified_by','modified_date'].includes(type)){
   return `<div class="v19-muted">Cột hệ thống tự điền, không sửa tay. Row cũ chưa có metadata sẽ hiện “—”.</div>`;
  }
  return '';
 }

 function updateAutoNumberPreview(){
  if(selectedType !== 'auto_number') return;
  const prefix = extraEl.querySelector('#anPrefix')?.value || '';
  const suffix = extraEl.querySelector('#anSuffix')?.value || '';
  const digits = Number(extraEl.querySelector('#anDigits')?.value ?? 4);
  const start = Number(extraEl.querySelector('#anStart')?.value || 1);
  const preview = extraEl.querySelector('#anPreview');
  if(preview) preview.textContent = formatAutoNumberValue(start, {prefix, suffix, digits});
 }

 pop.innerHTML = `
 <input id="v19ColNameInput" value="${escapeHtml(currentConfig.label || cells[0][colIndex] || '')}" placeholder="Tên cột">
 <div class="column-type-current" id="v19SelectedTypeLabel">Đang chọn: ${escapeHtml(types.find(([type]) => type === currentType)?.[1] || currentType)}</div>
 <div class="column-type-list">${types.map(([type, label]) => `<button class="column-type-item ${type === currentType ? 'selected' : ''}" type="button" data-type="${type}">${label}</button>`).join('')}</div>
 <div id="v19ExtraConfig" class="column-type-extra">${renderExtraConfig(currentType, currentConfig)}</div>
 <div class="v19-modal-actions" style="padding:8px 0 0;border-top:1px solid var(--line)">
 <button class="v19-btn" type="button" data-act="cancel">Hủy</button>
 <button class="v19-btn primary" type="button" data-act="ok">Ok</button>
 </div>`;
 document.body.appendChild(pop);
 let selectedType = currentType;
 const extraEl = pop.querySelector('#v19ExtraConfig');
 updateAutoNumberPreview();
 extraEl.addEventListener('input', () => {
  extraEl.querySelector('#ctMaxContacts')?.style && (extraEl.querySelector('#ctMaxContacts').style.display = extraEl.querySelector('#ctAllowMultiple')?.checked ? '' : 'none');
  updateAutoNumberPreview();
 });
 extraEl.addEventListener('change', () => updateAutoNumberPreview());
 extraEl.addEventListener('click', (e) => {
  const styleBtn = e.target.closest('[data-checkbox-style]');
  if(!styleBtn) return;
  e.preventDefault();
  extraEl.querySelectorAll('[data-checkbox-style]').forEach(b => b.classList.remove('selected'));
  styleBtn.classList.add('selected');
 });

 function parseKnownContacts(text){
  return String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
   const match = line.match(/^(.*?)\s*<([^>]+)>$/);
   if(match) return {name:match[1].trim() || match[2].trim(), email:match[2].trim(), phone:''};
   return {name:line, email:line.includes('@') ? line : '', phone:''};
  });
 }

 function commitColumnTypeChange(closeAfter = true){
  const name = pop.querySelector('#v19ColNameInput').value.trim() || currentConfig.label || columnName(colIndex);
  const configs = ensureSheetColumnConfigs(sheet);
  let next = {...currentConfig, label:name, type:selectedType};
  cells[0][colIndex] = name;
  if(selectedType === 'dropdown' || selectedType === 'multi-select'){
   const optionsText = extraEl.querySelector('#v19ColumnOptionsInput')?.value || '';
   const options = optionsText.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
   next.options = options.length ? options : ['Tùy chọn 1','Tùy chọn 2','Tùy chọn 3'];
  }else if(selectedType === 'contact'){
   const allowMultiple = !!extraEl.querySelector('#ctAllowMultiple')?.checked;
   next.maxContacts = allowMultiple ? (Number(extraEl.querySelector('#ctMaxContacts')?.value) || 5) : 1;
   next.restrictToList = !!extraEl.querySelector('#ctRestrictList')?.checked;
   const known = parseKnownContacts(extraEl.querySelector('#ctKnownContacts')?.value || '');
   next.knownContacts = known.length ? known : PROJECT_CONTACTS;
  }else if(selectedType === 'checkbox'){
   next.checkboxStyle = extraEl.querySelector('.column-type-item.selected[data-checkbox-style]')?.dataset.checkboxStyle || 'check';
   next.restrictToToggle = !!extraEl.querySelector('#cbRestrict')?.checked;
  }else if(selectedType === 'symbols'){
   next.symbolSet = 'ryg';
   next.symbols = ['🔴','🟡','🟢'];
   next.restrictToSymbolValues = !!extraEl.querySelector('#symRestrict')?.checked;
  }else if(selectedType === 'auto_number'){
   next.prefix = extraEl.querySelector('#anPrefix')?.value || '';
   next.suffix = extraEl.querySelector('#anSuffix')?.value || '';
   next.digits = Number(extraEl.querySelector('#anDigits')?.value ?? 4);
   next.autoStart = Number(extraEl.querySelector('#anStart')?.value) || 1;
   if(next.autoNext === undefined) next.autoNext = next.autoStart;
  }
  next.format = ['number','currency','percent','date'].includes(selectedType)
   ? (currentConfig.format || Formatters.defaultConfig(selectedType))
   : currentConfig.format;
  configs[colIndex] = next;
  sheet._columnTypes = sheet._columnTypes || {};
  sheet._columnTypes[colIndex] = selectedType;
  if(['number','currency','percent','date'].includes(selectedType)){
   sheet._columnFormats = sheet._columnFormats || {};
   sheet._columnFormats[colIndex] = next.format;
  }
  renderGridSheet(sheet);
  scheduleSheetDataSave(sheet);
  if(closeAfter) pop.remove();
 }
 pop.querySelectorAll('.column-type-item[data-type]').forEach(btn => {
  btn.addEventListener('click', (e) => {
   e.preventDefault();
   e.stopPropagation();
   pop.querySelectorAll('.column-type-item[data-type]').forEach(x => x.classList.remove('selected'));
   btn.classList.add('selected');
   selectedType = btn.dataset.type;
   pop.querySelector('#v19SelectedTypeLabel').textContent = `Đang chọn: ${types.find(([type]) => type === selectedType)?.[1] || selectedType}`;
   extraEl.innerHTML = renderExtraConfig(selectedType, selectedType === currentType ? currentConfig : Formatters.defaultConfig(selectedType));
   updateAutoNumberPreview();
  });
 });
 pop.querySelector('[data-act="cancel"]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); pop.remove(); });
 pop.querySelector('[data-act="ok"]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); commitColumnTypeChange(true); });
 setTimeout(() => {
  const close = e => {
   if(!pop.contains(e.target) && e.target !== anchorEl){
    pop.remove();
    document.removeEventListener('mousedown', close, true);
   }
  };
 document.addEventListener('mousedown', close, true);
 }, 0);
}

function shiftIndexedObjectKeys(source, pivot, delta, removePivot = false){
 const next = {};
 Object.entries(source || {}).forEach(([key, value]) => {
  const index = Number(key);
  if(!Number.isFinite(index)) return;
  if(removePivot && index === pivot) return;
  const shifted = index >= pivot ? index + delta : index;
  if(shifted >= 0) next[shifted] = value;
 });
 return next;
}

function shiftCellStyleKeys(source, pivot, delta, removePivot = false){
 const next = {};
 Object.entries(source || {}).forEach(([key, value]) => {
  const parts = String(key).split('_');
  const row = Number(parts[0]);
  const col = Number(parts[1]);
  if(!Number.isFinite(row) || !Number.isFinite(col)) return;
  if(removePivot && col === pivot) return;
  const shiftedCol = col >= pivot ? col + delta : col;
  if(shiftedCol >= 0) next[`${row}_${shiftedCol}`] = value;
 });
 return next;
}

function shiftColumnList(list, pivot, delta, removePivot = false){
 if(!Array.isArray(list)) return list;
 return list
  .map(value => Number(value))
  .filter(Number.isFinite)
  .filter(value => !(removePivot && value === pivot))
  .map(value => value >= pivot ? value + delta : value)
  .filter(value => value >= 0);
}

function shiftColumnRules(list, pivot, delta, removePivot = false){
 if(!Array.isArray(list)) return list;
 return list
  .map(item => {
   if(!item || typeof item !== 'object') return item;
   if(removePivot && Number(item.col) === pivot) return null;
   const next = {...item};
   if(Number.isFinite(Number(next.col)) && Number(next.col) >= pivot) next.col = Number(next.col) + delta;
   return next;
  })
  .filter(Boolean);
}

function shiftSheetColumnReferences(sheet, pivot, delta, removePivot = false){
 if(!sheet) return;
 sheet._columnConfigs = shiftIndexedObjectKeys(sheet._columnConfigs, pivot, delta, removePivot);
 sheet._columnTypes = shiftIndexedObjectKeys(sheet._columnTypes, pivot, delta, removePivot);
 sheet._columnFormats = shiftIndexedObjectKeys(sheet._columnFormats, pivot, delta, removePivot);
 if(sheet.settings?.columnWrap) sheet.settings.columnWrap = shiftIndexedObjectKeys(sheet.settings.columnWrap, pivot, delta, removePivot);
 if(sheet._cellStyles) sheet._cellStyles = shiftCellStyleKeys(sheet._cellStyles, pivot, delta, removePivot);
 if(sheet._config?.hiddenCols) sheet._config.hiddenCols = shiftColumnList(sheet._config.hiddenCols, pivot, delta, removePivot);
 if(sheet._lockedCols) sheet._lockedCols = shiftIndexedObjectKeys(sheet._lockedCols, pivot, delta, removePivot);
 if(Number.isFinite(Number(sheet._frozenCol))){
  if(removePivot && Number(sheet._frozenCol) === pivot) sheet._frozenCol = null;
  else if(Number(sheet._frozenCol) >= pivot) sheet._frozenCol = Number(sheet._frozenCol) + delta;
 }
 sheet._filters = shiftColumnRules(sheet._filters, pivot, delta, removePivot);
 sheet._sorts = shiftColumnRules(sheet._sorts, pivot, delta, removePivot);
}

function shiftColumnReferencesAfterInsert(sheet, insertAt){
 shiftSheetColumnReferences(sheet, insertAt, 1, false);
}

function shiftColumnReferencesAfterDelete(sheet, colIndex){
 shiftSheetColumnReferences(sheet, colIndex, -1, true);
}

function insertSheetColumn(colIndex, side){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 const cells = ensureSheetCells(sheet);
 const insertAt = side === 'right' ? colIndex + 1 : colIndex;
 cells.forEach((row, rowIndex) => row.splice(insertAt, 0, rowIndex === 0 ? 'Cot moi' : ''));
 shiftColumnReferencesAfterInsert(sheet, insertAt);
 renderGridSheet(sheet);
 setActiveSheetCell(1, insertAt, false);
 scheduleSheetDataSave(sheet);
 saveProjectLocalBackup();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
}

function deleteSelectedSheetColumns(fallbackCol){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 const selectedColumns = getSelectedColumnIndexes(fallbackCol).filter(c => c > 1 && c < cells[0].length);
 const columns = [...new Set(selectedColumns)].sort((a,b) => b - a);
 if(!columns.length) return;
 const dataColumnCount = Math.max(0, cells[0].length - 2);
 if(columns.length >= dataColumnCount){
  alert('Can giu lai it nhat mot cot du lieu.');
  return;
 }
 const labels = columns.slice().sort((a,b) => a - b).map(col => getColumnConfig(col, sheet).label || cells[0][col] || columnName(col));
 const suffix = labels.length === 1 ? `"${labels[0]}"` : `${labels.length} cot: ${labels.join(', ')}`;
 if(!confirm(`Xoa ${suffix}?`)) return;
 const nextActiveCol = Math.max(2, Math.min(columns[columns.length - 1], cells[0].length - columns.length - 1));
 for(const col of columns){
  cells.forEach(row => row.splice(col, 1));
  shiftColumnReferencesAfterDelete(sheet, col);
 }
 sheetColumnSelection = null;
 sheetColumnSelectAnchor = null;
 selRangeAnchor = null;
 selRangeEnd = null;
 isSelectingRange = false;
 renderGridSheet(sheet);
 setActiveSheetCell(1, nextActiveCol, false);
 scheduleSheetDataSave(sheet);
 saveProjectLocalBackup();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
}
function saveSheetColumnConfigValue(sheet, colIndex, patch){
 if(!sheet || colIndex <= 1) return;
 const cells = ensureSheetCells(sheet);
 const configs = ensureSheetColumnConfigs(sheet);
 const current = getColumnConfig(colIndex, sheet);
 const next = {...current, ...patch};
 configs[colIndex] = next;
 if(Object.prototype.hasOwnProperty.call(patch, 'label')){
  cells[0][colIndex] = String(patch.label || '').trim() || current.label || columnName(colIndex);
 }
 scheduleSheetDataSave(sheet);
 saveProjectLocalBackup();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
}

function renameSheetColumnInline(colIndex, anchorEl){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1 || !anchorEl) return;
 closeSheetColumnMenu();
 const nameEl = anchorEl.querySelector('.col-type-name');
 if(!nameEl) return;
 const currentName = getColumnConfig(colIndex, sheet).label || columnName(colIndex);
 const input = document.createElement('input');
 input.className = 'sheet-col-rename-input';
 input.value = currentName;
 input.style.width = `${Math.max(90, anchorEl.clientWidth - 36)}px`;
 input.addEventListener('click', e => e.stopPropagation());
 input.addEventListener('mousedown', e => e.stopPropagation());
 const commit = () => {
  const value = input.value.trim() || currentName;
  saveSheetColumnConfigValue(sheet, colIndex, {label:value});
  renderGridSheet(sheet);
 };
 const cancel = () => renderGridSheet(sheet);
 input.addEventListener('keydown', e => {
  if(e.key === 'Enter'){ e.preventDefault(); commit(); }
  if(e.key === 'Escape'){ e.preventDefault(); cancel(); }
 });
 input.addEventListener('blur', commit, {once:true});
 nameEl.replaceWith(input);
 input.focus();
 input.select();
}

function openSheetColumnDescriptionDialog(colIndex, anchorEl){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 closeSheetColumnMenu();
 document.querySelector('.column-type-popover')?.remove();
 const cfg = getColumnConfig(colIndex, sheet);
 const pop = document.createElement('div');
 pop.className = 'column-type-popover';
 const rect = anchorEl?.getBoundingClientRect?.() || {left:120, bottom:120};
 pop.style.left = `${Math.min(rect.left, window.innerWidth - 320)}px`;
 pop.style.top = `${Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 300))}px`;
 pop.style.width = '300px';
 pop.innerHTML = `
 <div class="column-type-current">Mo ta cot: ${escapeHtml(cfg.label || columnName(colIndex))}</div>
 <textarea id="sheetColDescInput" rows="5" placeholder="Nhap mo ta cot...">${escapeHtml(cfg.description || '')}</textarea>
 <div class="v19-modal-actions" style="padding:8px 0 0;border-top:1px solid var(--line)">
  <button class="v19-btn" type="button" data-act="clear">Xoa mo ta</button>
  <button class="v19-btn" type="button" data-act="cancel">Huy</button>
  <button class="v19-btn primary" type="button" data-act="ok">Ok</button>
 </div>`;
 document.body.appendChild(pop);
 const textarea = pop.querySelector('#sheetColDescInput');
 const commit = (value) => {
  saveSheetColumnConfigValue(sheet, colIndex, {description:String(value || '').trim()});
  pop.remove();
  renderGridSheet(sheet);
 };
 pop.querySelector('[data-act="ok"]').addEventListener('click', e => { e.preventDefault(); commit(textarea.value); });
 pop.querySelector('[data-act="clear"]').addEventListener('click', e => { e.preventDefault(); commit(''); });
 pop.querySelector('[data-act="cancel"]').addEventListener('click', e => { e.preventDefault(); pop.remove(); });
 setTimeout(() => {
  const close = e => {
   if(!pop.contains(e.target) && e.target !== anchorEl){
    pop.remove();
    document.removeEventListener('mousedown', close, true);
   }
  };
  document.addEventListener('mousedown', close, true);
 }, 0);
 textarea.focus();
 textarea.select();
}

function persistSheetColumnVisibility(sheet){
 updateSheetColumnsBtn(sheet);
 scheduleSheetDataSave(sheet);
 saveProjectLocalBackup();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
}

function hideSheetColumn(colIndex){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 sheet._config = sheet._config || {};
 sheet._config.hiddenCols = sheet._config.hiddenCols || [];
 if(!sheet._config.hiddenCols.includes(colIndex)) sheet._config.hiddenCols.push(colIndex);
 renderGridSheet(sheet);
 persistSheetColumnVisibility(sheet);
}

function unhideSheetColumn(colIndex){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 sheet._config = sheet._config || {};
 sheet._config.hiddenCols = (sheet._config.hiddenCols || []).filter(x => Number(x) !== Number(colIndex));
 renderGridSheet(sheet);
 persistSheetColumnVisibility(sheet);
}

function unhideAllSheetColumns(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 sheet._config = sheet._config || {};
 sheet._config.hiddenCols = [];
 renderGridSheet(sheet);
 persistSheetColumnVisibility(sheet);
}

function getHiddenSheetColumnsForMenu(sheet){
 const cells = ensureSheetCells(sheet);
 const colCount = cells[0]?.length || SHEET_COLUMN_CONFIG.length;
 const hiddenCols = Array.isArray(sheet?._config?.hiddenCols) ? sheet._config.hiddenCols : [];
 return hiddenCols
  .map(Number)
  .filter(i => Number.isFinite(i) && i > 1 && i < colCount)
  .map(i => ({index:i, label:getColumnConfig(i, sheet).label || cells[0]?.[i] || columnName(i)}));
}

function lockSheetColumn(colIndex){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 sheet._lockedCols = sheet._lockedCols || {};
 sheet._lockedCols[colIndex] = !sheet._lockedCols[colIndex];
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 saveProjectLocalBackup();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
}

function freezeSheetColumn(colIndex){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 sheet._frozenCol = sheet._frozenCol === colIndex ? null : colIndex;
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 saveProjectLocalBackup();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
}

function openColumnFilterFromMenu(colIndex){
 const sheet = getActiveSheet();
 if(!sheet) return;
 addFilterLevel(sheet, colIndex);
 closeSheetColumnMenu();
 toggleToolPopover('filter');
 renderFilterPopover(sheet);
}

function openColumnSortFromMenu(colIndex){
 const sheet = getActiveSheet();
 if(!sheet) return;
 sortByColumnClick(colIndex);
 closeSheetColumnMenu();
 toggleToolPopover('sort');
 renderSortPopover(sheet);
}

function closeSheetColumnMenu(){
 document.querySelector('.sheet-column-menu')?.remove();
}

function showColumnTodo(message){
 alert(message);
}

function openSheetColumnMenu(colIndex, anchorEl, position){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 closeSheetColumnMenu();
 document.querySelector('.column-type-popover')?.remove();
 const label = getColumnConfig(colIndex, sheet).label || ensureSheetCells(sheet)[0]?.[colIndex] || columnName(colIndex);
 const hiddenSheetCols = getHiddenSheetColumnsForMenu(sheet);
 const hiddenSheetMenu = hiddenSheetCols.length
  ? hiddenSheetCols.map(c => `<button type="button" data-act="unhide-one" data-col="${c.index}"><span class="menu-ic">✓</span>${escapeHtml(c.label)}</button>`).join('')
  : '<button type="button" disabled><span class="menu-ic">-</span>No hidden columns</button>';
 const menu = document.createElement('div');
 menu.className = 'sheet-column-menu';
 const menuWidth = 280;
 const rect = anchorEl?.getBoundingClientRect?.() || {left:position?.x || 120, bottom:position?.y || 120};
 const menuX = Number.isFinite(position?.x) ? position.x : rect.left;
 const menuY = Number.isFinite(position?.y) ? position.y : rect.bottom + 4;
 const left = Math.min(Math.max(8, menuX), Math.max(8, window.innerWidth - menuWidth - 8));
 const top = Math.min(Math.max(8, menuY), Math.max(8, window.innerHeight - 520));
 menu.style.left = `${left}px`;
 menu.style.top = `${top}px`;
 menu.innerHTML = `
  <div class="menu-title">${escapeHtml(label)}</div>
  <button type="button" data-act="insert-left"><span class="menu-ic">&larr;</span>Insert Column Left</button>
  <button type="button" data-act="insert-right"><span class="menu-ic">&rarr;</span>Insert Column Right</button>
  <button type="button" data-act="delete"><span class="menu-ic">Del</span>Delete Column</button>
  <button type="button" data-act="rename"><span class="menu-ic">A</span>Rename Column...</button>
  <button type="button" data-act="description"><span class="menu-ic">i</span>Edit Column Description...</button>
  <div class="menu-sep"></div>
  <button type="button" data-act="filter"><span class="menu-ic">F</span>Filter...</button>
  <button type="button" data-act="sort"><span class="menu-ic">S</span>Sort Rows...</button>
  <button type="button" data-act="lock"><span class="menu-ic">L</span>${sheet._lockedCols?.[colIndex] ? 'Unlock Column' : 'Lock Column'}</button>
  <button type="button" data-act="freeze"><span class="menu-ic">|</span>${sheet._frozenCol === colIndex ? 'Unfreeze Column' : 'Freeze Column'}</button>
  <button type="button" data-act="hide"><span class="menu-ic">H</span>Hide Column</button>
  <div class="menu-sep"></div>
  <button type="button" data-act="unhide-all" ${hiddenSheetCols.length ? '' : 'disabled'}><span class="menu-ic">S</span>Show all columns</button>
  <div class="menu-title">Show Columns</div>
  ${hiddenSheetMenu}
  <div class="menu-sep"></div>
  <button type="button" data-act="gantt"><span class="menu-ic">G</span>Show Gantt</button>
  <button type="button" data-act="settings"><span class="menu-ic">*</span>Edit Project Settings...</button>
  <div class="menu-sep"></div>
  <button type="button" data-act="properties"><span class="menu-ic">P</span>Edit Column Properties...</button>
 `;
 menu.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const act = btn.dataset.act;
  if(act === 'insert-left') insertSheetColumn(colIndex, 'left');
  else if(act === 'insert-right') insertSheetColumn(colIndex, 'right');
  else if(act === 'delete') deleteSelectedSheetColumns(colIndex);
  else if(act === 'rename'){ renameSheetColumnInline(colIndex, anchorEl); return; }
  else if(act === 'properties'){ closeSheetColumnMenu(); openColumnTypePicker(colIndex, anchorEl); return; }
  else if(act === 'description'){ openSheetColumnDescriptionDialog(colIndex, anchorEl); return; }
  else if(act === 'filter'){ openColumnFilterFromMenu(colIndex); return; }
  else if(act === 'sort'){ openColumnSortFromMenu(colIndex); return; }
  else if(act === 'lock') lockSheetColumn(colIndex);
  else if(act === 'freeze') freezeSheetColumn(colIndex);
  else if(act === 'hide') hideSheetColumn(colIndex);
  else if(act === 'unhide-all') unhideAllSheetColumns();
  else if(act === 'unhide-one') unhideSheetColumn(Number(btn.dataset.col));
  else if(act === 'gantt') showColumnTodo('Gantt can cau hinh cot ngay bat dau/ket thuc, se tach thanh module rieng.');
  else if(act === 'settings') showColumnTodo('Project Settings se mo thanh hop cau hinh rieng o buoc sau.');
  closeSheetColumnMenu();
 });
 document.body.appendChild(menu);
 setTimeout(() => {
  const close = (e) => {
   if(!menu.contains(e.target) && e.target !== anchorEl){
    closeSheetColumnMenu();
    document.removeEventListener('mousedown', close, true);
   }
  };
 document.addEventListener('mousedown', close, true);
 }, 0);
}

function openSheetCellContextMenu(event){
 const cell = event.target.closest('.sheet-cell[data-c]');
 if(!cell || !sheetGridWrap.contains(cell)) return;
 if(event.target.closest('input, textarea, select, button, .report-view')) return;
 const colIndex = Number(cell.dataset.c);
 const rowIndex = Number(cell.dataset.r);
 if(!Number.isFinite(colIndex) || colIndex <= 1) return;
 event.preventDefault();
 event.stopPropagation();
 closeAllToolPopovers?.();
 document.querySelector('.column-type-popover')?.remove();
 setActiveSheetCell(Number.isFinite(rowIndex) ? rowIndex : 1, colIndex, false);
 selectSheetColumnRange(colIndex, event.shiftKey, event.ctrlKey || event.metaKey);
 openSheetColumnMenu(colIndex, cell, {x:event.clientX, y:event.clientY});
}

function showContactPicker(cell, row, col){
 const sheet = getActiveSheet();
 if(!sheet) return;
 document.querySelector('.contact-popover')?.remove();
 const rect = cell.getBoundingClientRect();
 const colConfig = getColumnConfig(col, sheet);
 const maxContacts = colConfig.maxContacts || 1;
 const restrictToList = !!colConfig.restrictToList;
 let selected = parseContactValue(ensureSheetCells(sheet)[row][col]);
 const pop = document.createElement('div');
 pop.className = 'contact-popover';
 pop.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
 pop.style.top = `${rect.bottom + 4}px`;
 pop.style.width = '280px';
 pop.style.padding = '10px';
 pop.innerHTML = `
 <input id="contactSearchInput" placeholder="Tìm tên hoặc email...">
 <div class="contact-list"></div>
 <div class="v19-muted">Có thể chọn tối đa ${maxContacts} người. Email được validate trước khi lưu.</div>
 ${restrictToList ? '' : `<div class="v19-modal-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">
 <input id="newContactName" placeholder="Tên mới">
 <input id="newContactEmail" placeholder="email@domain.com">
 </div>`}
 <div class="v19-modal-actions" style="padding:8px 0 0;border-top:1px solid var(--line)">
 ${restrictToList ? '' : '<button class="v19-btn" type="button" data-act="add">Thêm mới</button>'}
 <button class="v19-btn primary" type="button" data-act="save">Lưu</button>
 </div>`;
 document.body.appendChild(pop);
 const listEl = pop.querySelector('.contact-list');
 function render(term = ''){
 const q = term.trim().toLowerCase();
 const contacts = (colConfig.knownContacts || PROJECT_CONTACTS).filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
 listEl.innerHTML = contacts.map(c => {
 const checked = selected.some(s => s.email === c.email || s.name === c.name);
 return `<button class="contact-option" type="button" data-email="${escapeHtml(c.email)}"><span class="contact-avatar">${escapeHtml(c.name.charAt(0))}</span> ${escapeHtml(c.name)} <span class="v19-muted">${escapeHtml(c.email)}</span>${checked ? ' ✓' : ''}</button>`;
 }).join('');
 listEl.querySelectorAll('.contact-option').forEach(btn => {
 btn.addEventListener('click', () => {
 const contact = (colConfig.knownContacts || PROJECT_CONTACTS).find(c => c.email === btn.dataset.email);
 if(!contact) return;
 const idx = selected.findIndex(s => s.email === contact.email);
 if(idx >= 0) selected.splice(idx, 1);
 else if(selected.length < maxContacts) selected.push(contact);
 render(pop.querySelector('#contactSearchInput').value);
 });
 });
 }
 pop.querySelector('#contactSearchInput').addEventListener('input', e => render(e.target.value));
 const contactAddBtn = pop.querySelector('[data-act="add"]');
 if(contactAddBtn) contactAddBtn.addEventListener('click', () => {
 const name = pop.querySelector('#newContactName').value.trim();
 const email = pop.querySelector('#newContactEmail').value.trim();
 if(!name || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)){ alert('Tên/email không hợp lệ.'); return; }
 const contact = {name, email};
 PROJECT_CONTACTS.push(contact);
 selected = selected.filter(c => c.email !== email).concat(contact).slice(0, maxContacts);
 render(pop.querySelector('#contactSearchInput').value);
 });
 pop.querySelector('[data-act="save"]').addEventListener('click', () => {
 const serialized = serializeContacts(selected);
 setSheetCellValue(sheet, row, col, serialized);
 renderGridSheet(sheet);
 scheduleCellSave(sheet, row, col, serialized);
 pop.remove();
 });
 render();
}

function toggleSheetWrap(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const settings = ensureSheetSettings(sheet);
 settings.defaultWrap = !settings.defaultWrap;
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
}

function setSheetRowHeight(value){
 const sheet = getActiveSheet();
 if(!sheet) return;
 ensureSheetSettings(sheet).defaultRowHeight = Number(value) || 32;
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
}

function clearActiveSheetData(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 if(!confirm(`Xóa toàn bộ dữ liệu sheet "${sheet.name || 'Không tên'}"?`)) return;
 const before = createSheetUndoSnapshot(sheet);
 sheet._undoSnapshot = {cells:JSON.parse(JSON.stringify(cells)), timestamp:Date.now(), action:'clear-data'};
 const header = cells[0] ? [...cells[0]] : SHEET_COLUMN_CONFIG.map(c => c.label);
 sheet.cells = [header];
 sheet.settings = {...ensureSheetSettings(sheet), lastCleared:new Date().toLocaleString('vi-VN')};
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 pushSheetSnapshotUndo(sheet, before, createSheetUndoSnapshot(sheet), 'clear-data');
 alert(`Đã xóa ${Math.max(0, cells.length - 1)} dòng dữ liệu.`);
}

const fontFamilyPicker = document.getElementById('fontFamilyPicker');

const fontSizePicker = document.getElementById('fontSizePicker');

const ssMergeBtn = document.getElementById('ssMergeBtn');

fontFamilyPicker.addEventListener('change', () => {
  const s = getActiveSheet(); if(!s) return;
  const val = fontFamilyPicker.value;
  s.selection.forEach(addr => { const cell = getCellByAddr(s, addr); if(cell) cell.fontFamily = val; });
  renderGridSheet(s); saveActiveSheet();
});

fontSizePicker.addEventListener('change', () => {
  const s = getActiveSheet(); if(!s) return;
  const val = fontSizePicker.value;
  s.selection.forEach(addr => { const cell = getCellByAddr(s, addr); if(cell) cell.fontSize = val; });
  renderGridSheet(s); saveActiveSheet();
});

if(ssMergeBtn) ssMergeBtn.addEventListener('click', () => {
  const s = getActiveSheet(); if(!s || !s.selection || s.selection.length < 2) return alert('Chọn ít nhất 2 ô để gộp.');
  alert('Tính năng Merge đang phát triển. Sẽ có trong bản cập nhật sau.');
});

function updateBulkEditBtn(sheet){
 const count = ensureSheetSelectedRows(sheet).size;
 ssBulkEditBtn.style.display = count > 0 ? '' : 'none';
 setMicrosoft365ToolbarLabel(ssBulkEditBtn, count > 0 ? `Sửa ${count} dòng` : 'Sửa hàng loạt');
}

ssBulkEditBtn.addEventListener('click', () => {
 const sheet = getActiveSheet();
 if(!sheet) return;
 const selectedRowsSet = ensureSheetSelectedRows(sheet);
 if(!selectedRowsSet.size) return;
 const selectedRows = [...selectedRowsSet].sort();
 const cols = getPickableColumns(sheet);
 // Build a prompt-based bulk editor
 const colList = cols.filter(c => c.index > 1).map(c => `${c.index}. ${c.label}`).join('\\n');
 const colChoice = prompt(`Chọn cột cần sửa (nhập số):\\n${colList}`, '');
 if(!colChoice) return;
 const colIdx = parseInt(colChoice);
 if(isNaN(colIdx) || !cols.some(c => c.index === colIdx)) return;
 const newValue = prompt(`Nhập giá trị mới cho cột "${(cols.find(c => c.index === colIdx)?.label || '')}":`, '');
 if(newValue === null) return;
 const cells = ensureSheetCells(sheet);
 selectedRows.forEach(row => {
 if(row < cells.length){
 cells[row][colIdx] = newValue;
 scheduleCellSave(sheet, row, colIdx, newValue);
 }
 });
 renderGridSheet(sheet);
});

ssFormatBtn.addEventListener('click', () => toggleToolPopover('format'));

ssBoldBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) toggleCellStyleFlag(s, 'bold'); });

ssItalicBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) toggleCellStyleFlag(s, 'italic'); });

ssUnderlineBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) toggleCellStyleFlag(s, 'underline'); });

ssStrikeBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) toggleCellStyleFlag(s, 'strike'); });

ssTextColorBtn.addEventListener('click', () => toggleToolPopover('textColor'));

ssFillColorBtn.addEventListener('click', () => toggleToolPopover('fillColor'));

textColorResetBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) setCellStyleValue(s, 'color', ''); closeAllToolPopovers(); });

fillColorResetBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) setCellStyleValue(s, 'bg', ''); closeAllToolPopovers(); });

ssAlignLeftBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) setCellStyleValue(s, 'align', 'left'); });

ssAlignCenterBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) setCellStyleValue(s, 'align', 'center'); });

ssAlignRightBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) setCellStyleValue(s, 'align', 'right'); });

ssClearFormatBtn.addEventListener('click', () => { const s = getActiveSheet(); if(s) clearSelectionFormatting(s); });

let fpDblClickTimer = null;

ssFormatPainterBtn.addEventListener('click', () => {
 if(formatPainterLocked){ exitFormatPainter(); return; }
 if(formatPainterSource){
 // Đang active (chưa locked) → lần click thứ 2 = khoá
 formatPainterLocked = true;
 ssFormatPainterBtn.classList.add('fp-locked');
 return;
 }
 const s = getActiveSheet();
 if(s) startFormatPainter(s);
});

sortAddBtn.addEventListener('click', () => {
 const sheet = getActiveSheet();
 if(!sheet) return;
 sortPicker.hidden = !sortPicker.hidden;
 if(!sortPicker.hidden){
 sortPickerSearch.value = '';
 renderColumnPickerList(sortPickerList, sheet, (sheet._sorts || []).map(s => s.col), (col) => addSortLevel(sheet, col), '');
 sortPickerSearch.focus();
 }
});

sortPickerSearch.addEventListener('input', () => {
 const sheet = getActiveSheet();
 if(!sheet) return;
 renderColumnPickerList(sortPickerList, sheet, (sheet._sorts || []).map(s => s.col), (col) => addSortLevel(sheet, col), sortPickerSearch.value);
});

sortClearBtn.addEventListener('click', () => { const sheet = getActiveSheet(); if(sheet) clearSorts(sheet); });

filterAddBtn.addEventListener('click', () => {
 const sheet = getActiveSheet();
 if(!sheet) return;
 filterPicker.hidden = !filterPicker.hidden;
 if(!filterPicker.hidden){
 filterPickerSearch.value = '';
 renderColumnPickerList(filterPickerList, sheet, (sheet._filters || []).map(f => f.col), (col) => addFilterLevel(sheet, col), '');
 filterPickerSearch.focus();
 }
});

filterPickerSearch.addEventListener('input', () => {
 const sheet = getActiveSheet();
 if(!sheet) return;
 renderColumnPickerList(filterPickerList, sheet, (sheet._filters || []).map(f => f.col), (col) => addFilterLevel(sheet, col), filterPickerSearch.value);
});

filterClearBtn.addEventListener('click', () => { const sheet = getActiveSheet(); if(sheet) clearFilters(sheet); });

filterSaveBtn.addEventListener('click', () => promptSaveFilter());

filterLoadBtn.addEventListener('click', () => promptLoadFilter());

formatAddBtn.addEventListener('click', () => {
 const sheet = getActiveSheet();
 if(!sheet) return;
 const willShow = formatPicker.hidden;
 formatPicker.hidden = !formatPicker.hidden;
 formatDraft = null;
 if(willShow) renderFormatPickerColumnStep();
});

formatClearBtn.addEventListener('click', () => { const sheet = getActiveSheet(); if(sheet) clearFormatRules(sheet); });

document.addEventListener('click', (e) => {
 const wraps = document.querySelectorAll('.ss-tool-wrap');
 const inside = Array.from(wraps).some(w => w.contains(e.target));
 if(ssMoreMenu && !ssMoreMenu.hidden && !inside) closeSheetMoreMenu();
 if(!openToolPopover) return;
 if(!inside) closeAllToolPopovers();
});

document.addEventListener('keydown', (e) => {
 if(e.key === 'Escape' && openToolPopover) closeAllToolPopovers();
 if(e.key === 'Escape') closeSheetMoreMenu();
 if(e.key === 'Escape' && formatPainterSource) exitFormatPainter();
});

function updateRangeHighlight(){
 sheetGridWrap.querySelectorAll('.sheet-data-cell.sheet-range-selected').forEach(el => el.classList.remove('sheet-range-selected'));
 sheetGridWrap.querySelectorAll('.sheet-cell.range-selected').forEach(el => el.classList.remove('range-selected'));
 sheetGridWrap.querySelectorAll('thead .sheet-col-head.range-col-selected').forEach(el => el.classList.remove('range-col-selected'));
 if(!selRangeAnchor || !selRangeEnd) return;
 const r1 = Math.min(selRangeAnchor.row, selRangeEnd.row), r2 = Math.max(selRangeAnchor.row, selRangeEnd.row);
 const c1 = Math.min(selRangeAnchor.col, selRangeEnd.col), c2 = Math.max(selRangeAnchor.col, selRangeEnd.col);
 const selectedColumns = sheetColumnSelection?.columns?.length ? sheetColumnSelection.columns : null;
 if(sheetColumnSelection){
  const columns = selectedColumns || Array.from({length:c2 - c1 + 1}, (_, i) => c1 + i);
  for(const c of columns){
   sheetGridWrap.querySelectorAll(`thead .sheet-col-head[data-col-index="${c}"]`).forEach(el => el.classList.add('range-col-selected'));
  }
 }
 if(r1 === r2 && c1 === c2 && !sheetColumnSelection) return;
 for(let r = r1; r <= r2; r++){
  for(let c = c1; c <= c2; c++){
   if(selectedColumns && !selectedColumns.includes(c)) continue;
   const el = sheetGridWrap.querySelector(`.sheet-cell[data-r="${r}"][data-c="${c}"]`);
   if(el){
    el.classList.add('range-selected');
    el.parentElement?.classList.add('sheet-range-selected');
   }
  }
 }
}
function getSelectedRange(row, col){
 if(!selRangeAnchor || !selRangeEnd) return {r1:row, r2:row, c1:col, c2:col};
 return {
 r1: Math.min(selRangeAnchor.row, selRangeEnd.row),
 r2: Math.max(selRangeAnchor.row, selRangeEnd.row),
 c1: Math.min(selRangeAnchor.col, selRangeEnd.col),
 c2: Math.max(selRangeAnchor.col, selRangeEnd.col)
 };
}

let sheetClipboard = null;

function getActiveSheetCellPosition(){
 const cell = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 if(!cell) return null;
 return {row:Number(cell.dataset.r), col:Number(cell.dataset.c), cell};
}

function selectedRangeToTsv(sheet, range){
 const cells = ensureSheetCells(sheet);
 const rows = [];
 for(let r = range.r1; r <= range.r2; r++){
 const row = [];
 for(let c = range.c1; c <= range.c2; c++) row.push(cells[r]?.[c] ?? '');
 rows.push(row.join('\\t'));
 }
 return rows.join('\\n');
}

function writeClipboardText(text){
 sheetClipboard = text;
 if(navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).catch(() => {});
 return Promise.resolve();
}

async function readClipboardText(){
 if(navigator.clipboard?.readText){
 try {
 const text = await navigator.clipboard.readText();
 if(text) return text;
 } catch(_err) {}
 }
 return sheetClipboard || '';
}

function clearSelectedSheetCells(){
 const sheet = getActiveSheet();
 const pos = getActiveSheetCellPosition();
 if(!sheet || !pos || editingCell) return false;
 const cells = ensureSheetCells(sheet);
 const range = getSelectedRange(pos.row, pos.col);
 let changed = false;
 for(let r = range.r1; r <= range.r2; r++){
  for(let c = range.c1; c <= range.c2; c++){
   if(!isEditableSheetCell(r, c)) continue;
   if(!cells[r]) continue;
   if(cells[r][c] !== '') changed = true;
   cells[r][c] = '';
   const el = sheetGridWrap.querySelector(`.sheet-cell[data-r="${r}"][data-c="${c}"]`);
   if(el) el.textContent = '';
  }
 }
 if(changed){
  const active = sheetGridWrap.querySelector('.sheet-cell.active-cell');
  if(active){
   const ar = Number(active.dataset.r);
   const ac = Number(active.dataset.c);
   if(ar >= range.r1 && ar <= range.r2 && ac >= range.c1 && ac <= range.c2) formulaInput.value = '';
  }
  scheduleSheetDataSave(sheet);
 }
 return changed;
}

document.addEventListener('keydown', (e) => {
 if(e.key !== 'Delete' && e.key !== 'Backspace') return;
 if(editingCell) return;
 const tag = document.activeElement?.tagName;
 if(tag && ['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
 if(document.activeElement?.isContentEditable) return;
 if(reportView && reportView.style.display !== 'none'){
  if(clearSelectedReportCells()){
   e.preventDefault();
   e.stopPropagation();
  }
  return;
 }
 if(!sheetGridWrap?.querySelector?.('.sheet-cell.active-cell')) return;
 if(clearSelectedSheetCells()){
  e.preventDefault();
  e.stopPropagation();
 }
}, true);

async function copySelectionToClipboard(cut = false){
 const sheet = getActiveSheet();
 const pos = getActiveSheetCellPosition();
 if(!sheet || !pos) return;
 const range = getSelectedRange(pos.row, pos.col);
 const text = selectedRangeToTsv(sheet, range);
 await writeClipboardText(text);
 if(cut){
 const cells = ensureSheetCells(sheet);
 for(let r = range.r1; r <= range.r2; r++){
 for(let c = range.c1; c <= range.c2; c++){
 if(isEditableSheetCell(r, c)) cells[r][c] = '';
 }
 }
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 }
}

async function pasteClipboardToSelection(){
 const sheet = getActiveSheet();
 const pos = getActiveSheetCellPosition();
 if(!sheet || !pos) return;
 const text = await readClipboardText();
 if(!text) return;
 const parsed = text.replace(/\\r/g, '').split('\\n').map(line => line.split('\\t'));
 const cells = ensureSheetCells(sheet);
 const startRow = Math.max(1, pos.row);
 const startCol = Math.max(2, pos.col);
 parsed.forEach((rowValues, rOffset) => {
 const targetRow = startRow + rOffset;
 while(cells.length <= targetRow) cells.push(Array.from({length:cells[0].length}, () => ''));
 rowValues.forEach((value, cOffset) => {
 const targetCol = startCol + cOffset;
 if(targetCol < cells[0].length && isEditableSheetCell(targetRow, targetCol)) cells[targetRow][targetCol] = value;
 });
 });
 renderGridSheet(sheet);
 setActiveSheetCell(startRow, startCol, true);
 scheduleSheetDataSave(sheet);
}

document.addEventListener('keydown', e => {
 const pos = getActiveSheetCellPosition();
 if(pos && !editingCell && (e.key === 'Home' || e.key === 'End')){
 e.preventDefault();
 setActiveSheetCell(pos.row, e.key === 'Home' ? 2 : SHEET_COLUMN_CONFIG.length - 1, true);
 return;
 }
 if(!(e.ctrlKey || e.metaKey)) return;
 const key = e.key.toLowerCase();
 if(!['c','x','v','f','b','i','u','a'].includes(key)) return;
 if(document.activeElement && ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
 if(!sheetGridWrap.querySelector('.sheet-cell.active-cell')) return;
 e.preventDefault();
 if(key === 'c') copySelectionToClipboard(false);
 if(key === 'x') copySelectionToClipboard(true);
 if(key === 'v') pasteClipboardToSelection();
 if(key === 'f'){ ssSearchInput.focus(); ssSearchInput.select(); }
 if(key === 'b') toggleCellStyleFlag(getActiveSheet(), 'bold');
 if(key === 'i') toggleCellStyleFlag(getActiveSheet(), 'italic');
 if(key === 'u') toggleCellStyleFlag(getActiveSheet(), 'underline');
 if(key === 'a'){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 sheetColumnSelection = null;
 sheetColumnSelectAnchor = null;
 selRangeAnchor = {row:1, col:2};
 selRangeEnd = {row:Math.max(1, cells.length - 1), col:cells[0].length - 1};
 updateRangeHighlight();
 }
});

sheetGridWrap.addEventListener('mousedown', (e)=>{
 const cell = e.target.closest('.sheet-cell');
 if(!cell) return;
 if(e.button !== 0) return;
 e.preventDefault(); // tranh trinh duyet bam chon text khi keo chuot
 const row = Number(cell.dataset.r);
 const col = Number(cell.dataset.c);
 if(editingCell && editingCell !== cell) commitEditingCell(editingCell);
 if(!isSelectingRange) setActiveSheetCell(row, col, true);
 isSelectingRange = true;
 sheetColumnSelection = null;
 sheetColumnSelectAnchor = null;
 selRangeAnchor = {row, col};
 selRangeEnd = selRangeAnchor;
 updateRangeHighlight();
});

sheetGridWrap.addEventListener('mouseover', (e)=>{
 if(!isSelectingRange) return;
 const cell = e.target.closest('.sheet-cell');
 if(!cell) return;
 selRangeEnd = {row:Number(cell.dataset.r), col:Number(cell.dataset.c)};
 updateRangeHighlight();
});

document.addEventListener('mouseup', (e)=>{
 const wasSelecting = isSelectingRange;
 isSelectingRange = false;
 isSelectingReportRange = false;
 if(formatPainterSource && wasSelecting){
  const fpCell = e.target.closest && e.target.closest('.sheet-cell');
  if(fpCell && sheetGridWrap.contains(fpCell)){
   const fpSheet = getActiveSheet();
   if(fpSheet) applyFormatPainter(fpSheet, Number(fpCell.dataset.r), Number(fpCell.dataset.c));
  }
 }
});

let activeDropdown = null;

function showDropdownPicker(cell, row, col, options){
 if(activeDropdown) closeDropdownPicker();
 activeDropdown = {cell, row, col};
 const rect = cell.getBoundingClientRect();
 const popover = document.createElement('div');
 popover.className = 'dropdown-popover';
 popover.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.bottom+2}px; z-index:200; background:#fff; border:1px solid var(--line); border-radius:8px; box-shadow:0 10px 28px rgba(17,24,39,.16); min-width:160px; max-height:240px; overflow:auto;`;
 popover.innerHTML = options.map(opt => `<div class="dropdown-option" data-value="${escapeHtml(opt)}" style="padding:8px 12px; cursor:pointer; font-size:13px; color:#3c4043;">${escapeHtml(opt)}</div>`).join('');
 popover.addEventListener('click', (e) => {
 const opt = e.target.closest('.dropdown-option');
 if(opt){
 const value = opt.dataset.value;
 const sheet = getActiveSheet();
 if(sheet){
 setSheetCellValue(sheet, row, col, value);
 cell.textContent = value;
 formulaInput.value = value;
 scheduleCellSave(sheet, row, col, value);
 }
 closeDropdownPicker();
 }
 });
 document.body.appendChild(popover);
 // Close on outside click
 setTimeout(() => document.addEventListener('click', closeDropdownPicker, {once:true}), 0);
}

function closeDropdownPicker(){
 if(activeDropdown){
 const popover = document.querySelector('.dropdown-popover');
 if(popover) popover.remove();
 activeDropdown = null;
 }
}

function showDatePicker(cell, row, col){
 const rect = cell.getBoundingClientRect();
 const input = document.createElement('input');
 input.type = 'date';
 input.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top}px; width:${rect.width}px; height:${rect.height}px; z-index:200; font:13px 'Inter',sans-serif; border:2px solid #2F62FF; border-radius:4px; outline:none;`;
 const sheet = getActiveSheet();
 if(sheet){
 const currentValue = ensureSheetCells(sheet)[row][col];
 // Convert MM/DD/YY to YYYY-MM-DD for input
 if(currentValue && /^\\d{2}\/\\d{2}\/\\d{2}$/.test(currentValue)){
 const [m,d,y] = currentValue.split('/');
 input.value = `20${y}-${m}-${d}`;
 }
 }
 input.addEventListener('blur', () => {
 const sheet = getActiveSheet();
 if(sheet && input.value){
 const [y,m,d] = input.value.split('-');
 const formatted = `${m}/${d}/${y.slice(-2)}`;
 setSheetCellValue(sheet, row, col, formatted);
 cell.textContent = formatted;
 formulaInput.value = formatted;
 scheduleCellSave(sheet, row, col, formatted);
 }
 input.remove();
 });
 input.addEventListener('keydown', (e) => {
 if(e.key === 'Escape') input.blur();
 });
 document.body.appendChild(input);
 input.focus();
 input.showPicker?.();
}

function showDurationPicker(cell, row, col){
 const sheet = getActiveSheet();
 if(!sheet) return;
 document.querySelector('.duration-popover')?.remove();
 const rect = cell.getBoundingClientRect();
 const current = Number(ensureSheetCells(sheet)[row][col] || 0);
 const days = Math.floor(current / 1440);
 const hours = Math.floor((current % 1440) / 60);
 const minutes = current % 60;
 const pop = document.createElement('div');
 pop.className = 'duration-popover ss-popover';
 pop.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.bottom + 4}px; z-index:300; display:block; padding:10px; min-width:220px;`;
 pop.innerHTML = `<div class="column-type-mini-grid"><input id="durationDays" type="number" min="0" placeholder="Ngày" value="${days}"><input id="durationHours" type="number" min="0" placeholder="Giờ" value="${hours}"></div><input id="durationMinutes" type="number" min="0" max="59" placeholder="Phút" value="${minutes}" style="margin-top:8px"><div class="v19-modal-actions" style="padding:8px 0 0;border-top:1px solid var(--line)"><button class="v19-btn" type="button" data-act="cancel">Hủy</button><button class="v19-btn primary" type="button" data-act="save">Lưu</button></div>`;
 pop.querySelector('[data-act="cancel"]').addEventListener('click', () => pop.remove());
 pop.querySelector('[data-act="save"]').addEventListener('click', () => {
  const d = Number(pop.querySelector('#durationDays').value || 0);
  const h = Number(pop.querySelector('#durationHours').value || 0);
  const m = Number(pop.querySelector('#durationMinutes').value || 0);
  const total = Math.max(0, Math.round(d * 1440 + h * 60 + m));
  setSheetCellValue(sheet, row, col, total ? String(total) : '');
  cell.textContent = Formatters.duration(total);
  formulaInput.value = total ? String(total) : '';
  scheduleCellSave(sheet, row, col, total ? String(total) : '');
  pop.remove();
 });
 document.body.appendChild(pop);
 pop.querySelector('#durationDays')?.focus();
}

function toggleCheckboxCell(row, col){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 const oldValue = cells[row] ? (cells[row][col] || '') : '';
 const currentChecked = !!oldValue && String(oldValue).toLowerCase() !== 'false' && String(oldValue) !== '0';
 const next = currentChecked ? '' : 'true';
 if(activeSheetContext) pushSheetUndo({projectIndex:activeSheetContext.projectIndex, folderIndex:activeSheetContext.folderIndex, row, col, oldValue, newValue:next});
 setSheetCellValue(sheet, row, col, next);
 renderGridSheet(sheet);
 restoreActiveSheetCell(row, col, false);
 scheduleCellSave(sheet, row, col, next);
}

function showSymbolsPicker(cell, row, col, symbols){
 const rect = cell.getBoundingClientRect();
 const gridRect = sheetGridWrap.getBoundingClientRect();
 // Remove existing picker
 const existing = document.querySelector('.symbols-popover');
 if(existing) existing.remove();
 const popover = document.createElement('div');
 popover.className = 'symbols-popover ss-popover';
 popover.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.bottom + 4}px; z-index:300; display:block;`;
 const grid = document.createElement('div');
 grid.style.cssText = 'display:grid; grid-template-columns:repeat(4,36px); gap:4px; padding:8px;';
 symbols.forEach(sym => {
 const btn = document.createElement('button');
 btn.type = 'button';
 btn.textContent = sym;
 btn.style.cssText = 'width:36px;height:36px;font-size:18px;border:1px solid var(--line);border-radius:4px;background:var(--paper);cursor:pointer;display:flex;align-items:center;justify-content:center;';
 btn.addEventListener('click', (e) => {
 e.stopPropagation();
 const sheet = getActiveSheet();
 if(sheet){
 setSheetCellValue(sheet, row, col, sym);
 cell.textContent = sym;
 formulaInput.value = sym;
 scheduleCellSave(sheet, row, col, sym);
 }
 popover.remove();
 });
 grid.appendChild(btn);
 });
 popover.appendChild(grid);
 document.body.appendChild(popover);
 setTimeout(() => {
 const close = (e2) => {
 if(!popover.contains(e2.target) && e2.target !== cell){
 popover.remove();
 document.removeEventListener('click', close, true);
 }
 };
 document.addEventListener('click', close, true);
 }, 0);
}

function showMultiSelectPicker(cell, row, col, options){
 const rect = cell.getBoundingClientRect();
 const existing = document.querySelector('.multi-select-popover');
 if(existing) existing.remove();
 const popover = document.createElement('div');
 popover.className = 'multi-select-popover ss-popover';
 popover.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.bottom + 4}px; z-index:300; display:block; min-width:180px;`;
 const sheet = getActiveSheet();
 const current = sheet ? (ensureSheetCells(sheet)[row][col] || '').split(',').filter(Boolean).map(s => s.trim()) : [];
 const list = document.createElement('div');
 list.className = 'ss-pop-list';
 list.style.cssText = 'padding:4px 0;';
 options.forEach(opt => {
 const checked = current.includes(opt);
 const label = document.createElement('label');
 label.className = 'ss-pop-list-item checkbox-row';
 label.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 12px;cursor:pointer;';
 label.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''}><span>${escapeHtml(opt)}</span>`;
 label.querySelector('input').addEventListener('change', () => {
 // Recalc after change
 });
 list.appendChild(label);
 });
 // Apply button
 const applyBtn = document.createElement('button');
 applyBtn.type = 'button';
 applyBtn.textContent = '✓ Áp dụng';
 applyBtn.style.cssText = 'display:block;width:100%;padding:6px 12px;background:var(--blueprint);color:#fff;border:none;border-radius:0 0 8px 8px;cursor:pointer;font:500 12px Inter,sans-serif;';
 applyBtn.addEventListener('click', (e) => {
 e.stopPropagation();
 const sheet = getActiveSheet();
 if(!sheet) return;
 const checks = list.querySelectorAll('input[type="checkbox"]');
 const selected = [];
 checks.forEach((cb, i) => {
 if(cb.checked) selected.push(options[i]);
 });
 const val = selected.join(', ');
 setSheetCellValue(sheet, row, col, val);
 cell.textContent = val || '';
 formulaInput.value = val;
 scheduleCellSave(sheet, row, col, val);
 popover.remove();
 });
 popover.appendChild(list);
 popover.appendChild(applyBtn);
 document.body.appendChild(popover);
 setTimeout(() => {
 const close = (e2) => {
 if(!popover.contains(e2.target) && e2.target !== cell){
 popover.remove();
 document.removeEventListener('click', close, true);
 }
 };
 document.addEventListener('click', close, true);
 }, 0);
}

sheetGridWrap.addEventListener('click', (e)=>{
 const toggleBtn = e.target.closest('.row-collapse-toggle');
 if(toggleBtn){
 e.stopPropagation();
 const sheet = getActiveSheet();
 if(sheet) toggleRowCollapse(sheet, Number(toggleBtn.dataset.toggleRow));
 return;
 }
 // Format Painter mode: click ô đích để dán định dạng
 if(formatPainterSource){
 const fpCell = e.target.closest('.sheet-cell');
 if(fpCell){
 e.preventDefault();
 e.stopPropagation();
 const fpRow = Number(fpCell.dataset.r);
 const fpCol = Number(fpCell.dataset.c);
 if(fpRow > 0 && fpCol > 1){
 const fpSheet = getActiveSheet();
 if(fpSheet) applyFormatPainter(fpSheet, fpRow, fpCol);
 }
 return;
 }
 }
 const cell = e.target.closest('.sheet-cell');
 if(!cell) return;
 const row = Number(cell.dataset.r);
 const col = Number(cell.dataset.c);
 if(editingCell && editingCell !== cell) commitEditingCell(editingCell);
 setActiveSheetCell(row, col, true);
 if(col === 0 && row > 0){
 openAttachmentPanel(row);
 return;
 }
 if(col === 1 && row > 0){
 const sheet = getActiveSheet();
 if(sheet) cycleRowStatus(sheet, row);
 return;
 }
 // Handle dropdown column
 const sheetForType = getActiveSheet();
 const colConfig = getColumnConfig(col, sheetForType);
 const runtimeType = colConfig.type;
 if(runtimeType === 'dropdown' && row > 0){
 e.stopPropagation();
 showDropdownPicker(cell, row, col, colConfig.options || []);
 return;
 }
 if((runtimeType === 'contact' || runtimeType === 'CONTACT_LIST') && row > 0){
 e.stopPropagation();
 showContactPicker(cell, row, col);
 return;
 }
 // Handle date column
 if(runtimeType === 'date' && row > 0){
 e.stopPropagation();
 showDatePicker(cell, row, col);
 return;
 }
 if(runtimeType === 'duration' && row > 0){
 e.stopPropagation();
 showDurationPicker(cell, row, col);
 return;
 }
 // Handle checkbox column
 if(runtimeType === 'checkbox' && row > 0){
 e.stopPropagation();
 toggleCheckboxCell(row, col);
 return;
 }
 // Handle symbols column
 if(runtimeType === 'symbols' && row > 0){
 e.stopPropagation();
 showSymbolsPicker(cell, row, col, colConfig.symbols || ['🔴','🟡','🟢']);
 return;
 }
 // Handle multi-select column
 if(runtimeType === 'multi-select' && row > 0){
 e.stopPropagation();
 showMultiSelectPicker(cell, row, col, colConfig.options || []);
 return;
 }
});

sheetGridWrap.addEventListener('dblclick', (e)=>{
 const cell = e.target.closest('.sheet-cell');
 if(!cell) return;
 startEditingCell(cell);
});

sheetGridWrap.addEventListener('focusout', (e)=>{
 if(editingCell && !sheetGridWrap.contains(e.relatedTarget)) commitEditingCell(editingCell);
});

sheetGridWrap.addEventListener('input', (e)=>{
 const cell = e.target.closest('.sheet-cell');
 const sheet = getActiveSheet();
 if(!cell || !sheet || cell !== editingCell) return;
 const row = Number(cell.dataset.r);
 const col = Number(cell.dataset.c);
 if(!isEditableSheetCell(row, col)) return;
 ensureSheetCells(sheet)[row][col] = cell.textContent;
 formulaInput.value = cell.textContent;
 scheduleCellSave(sheet, row, col, cell.textContent);
});

const ARROW_STEP = {ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1]};

sheetGridWrap.addEventListener('keydown', (e)=>{
 const activeCellEl = e.target.closest('.sheet-cell');
 if(!activeCellEl) return;
 const row = Number(activeCellEl.dataset.r);
 const col = Number(activeCellEl.dataset.c);
 const isEditing = editingCell === activeCellEl;
 const isEditable = isEditableSheetCell(row, col);

 if(e.key === 'Enter'){
 e.preventDefault();
 if(isEditing) commitEditingCell(activeCellEl);
 moveActiveSheetCell(e.shiftKey ? -1 : 1, 0);
 return;
 }
 if(e.key === 'Tab'){
 e.preventDefault();
 if(isEditing) commitEditingCell(activeCellEl);
 moveActiveSheetCell(0, e.shiftKey ? -1 : 1);
 return;
 }
 if(e.key === 'Escape'){
 if(isEditing){
 e.preventDefault();
 cancelEditingCell(activeCellEl);
 activeCellEl.focus();
 }
 return;
 }
 if(e.key === 'F2'){
 e.preventDefault();
 if(isEditable) startEditingCell(activeCellEl);
 return;
 }
 if(ARROW_STEP[e.key]){
 if(isEditing) return; // dang go: de con tro chay trong noi dung o
 e.preventDefault();
 moveActiveSheetCell(...ARROW_STEP[e.key]);
 return;
 }
 if((e.key === 'Delete' || e.key === 'Backspace') && !isEditing){
 e.preventDefault();
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cellsData = ensureSheetCells(sheet);
 const {r1, r2, c1, c2} = getSelectedRange(row, col);
 for(let r = r1; r <= r2; r++){
 for(let c = c1; c <= c2; c++){
 if(!isEditableSheetCell(r, c)) continue;
 cellsData[r][c] = '';
 const el = sheetGridWrap.querySelector(`.sheet-cell[data-r="${r}"][data-c="${c}"]`);
 if(el) el.textContent = '';
 scheduleCellSave(sheet, r, c, '');
 }
 }
 formulaInput.value = '';
 return;
 }
 if(!isEditing && isEditable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey){
 e.preventDefault();
 startEditingCell(activeCellEl, e.key);
 }
});

formulaInput.addEventListener('input', ()=>{
 const sheet = getActiveSheet();
 const cell = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 if(!sheet || !cell) return;
 const row = Number(cell.dataset.r);
 const col = Number(cell.dataset.c);
 if(!isEditableSheetCell(row, col)) return;
 setSheetCellValue(sheet, row, col, formulaInput.value);
 cell.textContent = formulaInput.value;
 scheduleCellSave(sheet, row, col, formulaInput.value);
});

formulaInput.addEventListener('keydown', (e)=>{
 const cell = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 if(!cell) return;
 if(e.key === 'Enter'){
 e.preventDefault();
 if(editingCell === cell) commitEditingCell(cell);
 moveActiveSheetCell(1, 0);
 } else if(e.key === 'Escape'){
 e.preventDefault();
 if(editingCell === cell) cancelEditingCell(cell);
 formulaInput.value = cell.textContent;
 }
});

attachClose.addEventListener('click', closeAttachmentPanel);

attachUploadBtn.addEventListener('click', ()=>{
 if(activeAttachmentRow === null){
 openAttachmentPanel(1);
 }
 attachInput.click();
});

async function addAttachmentFiles(fileList){
 const sheet = getAttachmentSheet();
 if(!sheet || activeAttachmentRow === null || !fileList || !fileList.length) return;
 const pickedFiles = Array.from(fileList);
 const store = ensureSheetAttachments(sheet);
 const files = store[activeAttachmentRow] || [];
 const rowLabel = rowAttachmentTitle(sheet, activeAttachmentRow);
 const projectName = getAttachmentProjectName();
 const archiveFolderName = getActiveArchiveFolderName(sheet);
 const row = activeAttachmentRow;

 const jobs = pickedFiles.map(file => {
  const entry = {
   id:`local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
   name:file.name,
   size:file.size,
   type:file.type,
   addedAt:new Date().toLocaleString('vi-VN'),
   driveStatus:'queued'
  };
  files.push(entry);
  return {sheet, entry, file, projectName, archiveFolderName, rowLabel};
 });
 store[row] = files;
 syncAttachmentCell(sheet, row);
 refreshReportAttachmentBadge(activeAttachmentSource, row);
 renderAttachmentPanel();
 await runLimitedConcurrency(jobs, attachmentUploadConcurrency(), uploadAttachmentEntry);
 scheduleSheetDataSave(sheet);
}

attachInput.addEventListener('change', ()=>{
 addAttachmentFiles(attachInput.files);
 attachInput.value = '';
});

let currentAttachTab = 'row';

let currentAttachDropdownFile = null;

let currentAttachFileUrl = null;

let currentAttachFileId = null;

function renderAttachPanel() {
  renderAttachmentPanel();
}

async function addAttachmentFilesLegacy(fileList) {
  const sheet = getActiveSheet();
  if (!sheet || activeAttachmentRow === null || !fileList || !fileList.length) return;
  
  const store = ensureSheetAttachments(sheet);
  const files = store[activeAttachmentRow] || [];
  const projectName = getActiveProjectName();
  const rowLabel = rowAttachmentTitle(sheet, activeAttachmentRow);
  
  const queue = document.getElementById('uploadQueue');
  if(queue) queue.style.display = 'block';
  
  for (const file of Array.from(fileList)) {
    const entry = { id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`, name: file.name, size: file.size, type: file.type, addedAt: new Date().toLocaleString('vi-VN'), driveStatus: '' };
    files.push(entry);
    store[activeAttachmentRow] = files;
    syncAttachmentCell(sheet, activeAttachmentRow);
    renderAttachPanel();
    
    // Create queue item UI
    const qItem = document.createElement('div');
    qItem.className = 'upload-queue-item';
    qItem.id = `q_${entry.id}`;
    qItem.innerHTML = `
      <div class="upload-queue-header">
        <span class="upload-queue-name">${file.name}</span>
        <span class="upload-queue-status">⏳ Đang chờ...</span>
      </div>
      <div class="upload-bar"><div class="upload-fill" style="width:0%"></div></div>
    `;
    if(queue) queue.appendChild(qItem);
    
    // Upload
    qItem.querySelector('.upload-queue-status').textContent = '⬆ Đang tải...';
    qItem.querySelector('.upload-fill').style.width = '50%';
    
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
      
      qItem.querySelector('.upload-queue-status').textContent = '⬆ Đang xử lý...';
      qItem.querySelector('.upload-fill').style.width = '80%';
      
      const result = await uploadAttachmentViaGs(projectName, sheet.name, rowAttachmentTitle(sheet, activeAttachmentRow), file.name, file.type, base64Data);
      
      entry.fileId = result.id;
      entry.fileUrl = result.link;
      entry.driveStatus = 'done';
      entry.driveLink = result.link;
      
      qItem.querySelector('.upload-queue-status').textContent = '✅ Xong';
      qItem.querySelector('.upload-fill').style.width = '100%';
      qItem.querySelector('.upload-fill').style.background = '#10B981';
      
    } catch (err) {
      entry.driveStatus = 'error';
      entry.driveError = err.message;
      qItem.querySelector('.upload-queue-status').textContent = '❌ Lỗi: ' + err.message;
      qItem.querySelector('.upload-fill').style.background = '#EF4444';
    }
    
    renderAttachPanel();
    scheduleSheetDataSave(sheet);
  }
  
  // Hide queue after delay
  setTimeout(() => { if(queue){ queue.style.display = 'none'; queue.innerHTML = ''; } }, 5000);
}

const dropzone = document.getElementById('attachDropzone');

const input = document.getElementById('attachFileInput');

if (dropzone && input) {
  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); if (e.dataTransfer.files.length) addAttachmentFiles(e.dataTransfer.files); });
  input.addEventListener('change', () => { if (input.files.length) addAttachmentFiles(input.files); input.value = ''; });
}

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('attachDropdown');
  if (dropdown && !e.target.closest('.attach-more-btn') && !e.target.closest('.attach-dropdown')) {
    dropdown.style.display = 'none';
  }
});

function showAttachMenu(btn, fileId, fileUrl) {
  currentAttachFileId = fileId;
  currentAttachFileUrl = fileUrl;
  const dropdown = document.getElementById('attachDropdown');
  const rect = btn.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom + 4}px`;
  dropdown.style.left = `${rect.left - 140}px`;
  dropdown.style.display = 'block';
}

function viewAttachment(url) {
  if (url) window.open(url, '_blank');
}

function downloadAttachment(url) {
  if (url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
  }
}

function copyAttachLink(url) {
  if (url) {
    navigator.clipboard.writeText(url).then(() => showToast('✅ Đã sao chép link'));
  }
}

function deleteAttachFile(fileId, fileIndex) {
  if (!confirm('Xóa file này?')) return;
  const sheet = getActiveSheet();
  if (!sheet || activeAttachmentRow === null) return;
  
  const store = ensureSheetAttachments(sheet);
  const files = store[activeAttachmentRow] || [];
  const [removed] = files.splice(fileIndex, 1);
  store[activeAttachmentRow] = files;
  syncAttachmentCell(sheet, activeAttachmentRow);
  renderAttachPanel();
  scheduleSheetDataSave(sheet);
  
  if (removed && removed.fileId) {
    deleteAttachmentFile(removed.fileId).catch(() => {});
  }
  if (removed && removed.driveId) {
    deleteFileFromDriveViaWebApp(removed.driveId).catch(() => {});
  }
}

