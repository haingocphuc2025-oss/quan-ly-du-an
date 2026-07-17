const MICROSOFT_365_TOOLBAR_ICONS = {
 save:'<path d="M3.25 2.75h9.9l3.6 3.6v10.9H3.25V2.75Z"/><path d="M6 2.75v4.5h7V2.75M6.25 17.25v-5.5h7.5v5.5"/>',
 print:'<path d="M5.25 7V2.75h9.5V7M5.25 14.25H3.5A1.75 1.75 0 0 1 1.75 12.5V8.75A1.75 1.75 0 0 1 3.5 7h13A1.75 1.75 0 0 1 18.25 8.75v3.75a1.75 1.75 0 0 1-1.75 1.75h-1.75"/><path d="M5.25 11.75h9.5v5.5h-9.5z"/>',
 undo:'<path d="M7.25 5.25 3.5 8.5l3.75 3.25"/><path d="M4 8.5h7.1a4.4 4.4 0 0 1 4.4 4.4v1.35"/>',
 redo:'<path d="m12.75 5.25 3.75 3.25-3.75 3.25"/><path d="M16 8.5H8.9a4.4 4.4 0 0 0-4.4 4.4v1.35"/>',
 table:'<rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/><path d="M2.5 7h15M7 2.5v15"/>',
 filter:'<path d="M2.75 3.75h14.5l-5.6 6.35v4.45l-3.3 1.7V10.1L2.75 3.75Z"/>',
 indent:'<path d="M8 4h9M8 8h7M8 12h9M8 16h7M2.5 7l3 3-3 3"/>',
 outdent:'<path d="M8 4h9M8 8h7M8 12h9M8 16h7M5.5 7l-3 3 3 3"/>',
 fill:'<path d="m5 3 8.5 8.5-4.8 4.8a1.5 1.5 0 0 1-2.1 0l-3-3a1.5 1.5 0 0 1 0-2.1L10 4.8M2.5 17.25h15"/><path d="M4.8 10h8"/>',
 fontColor:'<path d="m4 14.5 5-12h2l5 12M6 10h8M3 17.25h14"/>',
 alignLeft:'<path d="M3 4h14M3 8h10M3 12h14M3 16h8"/>',
 alignCenter:'<path d="M3 4h14M5 8h10M3 12h14M6 16h8"/>',
 alignRight:'<path d="M3 4h14M7 8h10M3 12h14M9 16h8"/>',
 wrap:'<path d="M3 4h14M3 8h10.5a3.5 3.5 0 1 1 0 7H9"/><path d="m11.5 12.5-3 2.5 3 2.5"/>',
 eraser:'<path d="m4 12 7.8-8.5a1.4 1.4 0 0 1 2 0l2.7 2.7a1.4 1.4 0 0 1 0 2L9 16H6.5L3.5 13a.7.7 0 0 1 .5-1Z"/><path d="m9.5 6 5 5M9 16h8"/>',
 paint:'<path d="M4 3h10v5H4zM9 8v3M7 11h4v6H7z"/><path d="M14 4h2.5v6"/>',
 columns:'<rect x="2.5" y="3" width="15" height="14" rx="1.5"/><path d="M7.5 3v14M12.5 3v14"/>',
 highlight:'<path d="m10 2.75 6.25 6.25L10 15.25 3.75 9 10 2.75Z"/><path d="M6 16.75h8"/>',
 more:'<circle cx="4" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/>',
 share:'<path d="M12 3h4.5v4.5M16.25 3.25 9.5 10"/><path d="M9 5H4.5A1.5 1.5 0 0 0 3 6.5v9A1.5 1.5 0 0 0 4.5 17h9a1.5 1.5 0 0 0 1.5-1.5V11"/>',
 sparkle:'<path d="m10 2 .9 3.1A5.4 5.4 0 0 0 14.6 9l3.4 1-3.4 1a5.4 5.4 0 0 0-3.7 3.9L10 18l-.9-3.1A5.4 5.4 0 0 0 5.4 11L2 10l3.4-1a5.4 5.4 0 0 0 3.7-3.9L10 2Z"/>',
 chevronDown:'<path d="m5 7.5 5 5 5-5"/>',
 panel:'<rect x="2.5" y="3" width="15" height="14" rx="1.5"/><path d="M7 3v14"/>',
 attachment:'<path d="m7 10.75 5.4-5.4a2.8 2.8 0 0 1 4 4l-7.2 7.2a4 4 0 0 1-5.7-5.7l7-7"/>',
 comment:'<path d="M3 4.25h14v9.5H9l-4.5 3v-3H3V4.25Z"/>',
 clipboard:'<path d="M6 4h8v13H4V6h2M7 4a3 3 0 0 1 6 0v1H7V4Z"/><path d="M7 9h4M7 12h6"/>',
 info:'<circle cx="10" cy="10" r="7.25"/><path d="M10 9v5M10 6.25v.25"/>',
 folder:'<path d="M2.75 5.25h5l1.5 1.75h8v9.25H2.75v-11Z"/>',
 group:'<rect x="3" y="3" width="5" height="5"/><rect x="12" y="3" width="5" height="5"/><rect x="7.5" y="12" width="5" height="5"/><path d="M5.5 8v2h9V8M10 10v2"/>',
 sum:'<path d="M15.75 3.25H5l5 6.75-5 6.75h10.75"/>',
 sort:'<path d="M6 3v14M3 6l3-3 3 3M14 17V3M11 14l3 3 3-3"/>',
 plus:'<path d="M10 3v14M3 10h14"/>',
 form:'<rect x="3" y="2.75" width="14" height="14.5" rx="1.5"/><path d="M6 6h1M9 6h5M6 10h1M9 10h5M6 14h1M9 14h5"/>',
 automation:'<path d="m11.5 2.5-7 9h5l-1 6 7-9h-5l1-6Z"/>',
 merge:'<path d="M3 5h4a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h4M14 12l3 3-3 3M14 2l3 3-3 3"/><path d="M3 15h4a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3h4"/>',
 trash:'<path d="M4 5h12M7 5V3h6v2M6 7v9.5h8V7M8.5 9v5M11.5 9v5"/>',
 refresh:'<path d="M16 6V2.75L13.5 5.2A7 7 0 1 0 17 11"/>',
 copy:'<rect x="6" y="6" width="10.5" height="10.5" rx="1.5"/><path d="M13.5 6V3.5H3.5v10H6"/>',
 edit:'<path d="m4 14.5-.5 3 3-.5L16 7.5 12.5 4 4 12.5v2Z"/><path d="m11.5 5 3.5 3.5"/>',
 download:'<path d="M10 2.5v10M6 9l4 4 4-4M3 17h14"/>',
 upload:'<path d="M10 13V3M6 7l4-4 4 4M3 17h14"/>'
};

function microsoft365ToolbarIcon(name){
 const body = MICROSOFT_365_TOOLBAR_ICONS[name] || MICROSOFT_365_TOOLBAR_ICONS.more;
 return `<svg class="m365-toolbar-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">${body}</svg>`;
}

function renderMicrosoft365ToolbarButton(button){
 if(!button) return;
 const iconName = button.dataset.m365Icon;
 const label = button.dataset.m365Label || '';
 button.classList.toggle('m365-icon-only', !label);
 button.classList.toggle('m365-with-label', !!label);
 button.innerHTML = `${microsoft365ToolbarIcon(iconName)}${label ? `<span class="m365-toolbar-label">${label}</span>` : ''}`;
}

function setMicrosoft365ToolbarLabel(button, label){
 if(!button) return;
 button.dataset.m365Label = label || '';
 renderMicrosoft365ToolbarButton(button);
}

function applyMicrosoft365ToolbarIcons(){
 const buttons = [
  ['saveProjectBtn','save',''], ['sheetPrintBtn','print',''], ['sheetUndoBtn','undo',''], ['sheetRedoBtn','redo',''],
  ['ssGridViewBtn','table','Grid'], ['ssFilterBtn','filter','Filter'], ['ssIndentBtn','indent',''], ['ssOutdentBtn','outdent',''],
  ['ssFillColorBtn','fill',''], ['ssTextColorBtn','fontColor',''], ['ssAlignLeftBtn','alignLeft',''], ['ssAlignCenterBtn','alignCenter',''],
  ['ssAlignRightBtn','alignRight',''], ['ssWrapBtn','wrap',''], ['ssClearFormatBtn','eraser',''], ['ssFormatPainterBtn','paint',''],
  ['ssColumnsBtn','columns','Cột'], ['ssFormatBtn','highlight','Highlight'], ['ssMoreBtn','more',''],
  ['ssSortBtn','sort','Sort'], ['ssGroupBtn','group','Group'], ['ssAddRowBtn','plus','Add row'], ['ssFormsBtn','form','Forms'],
  ['ssPublishBtn','share','Publish'], ['ssAutomationBtn','automation','Automation'], ['ssMergeBtn','merge','Merge'],
  ['ssClearDataBtn','trash','Clear data'], ['ssRepostDateBtn','refresh','Repost Date'], ['ssCarryForwardBtn','refresh','Carry Forward'],
  ['ssDuplicateBtn','copy','Duplicate'], ['ssBulkEditBtn','edit','Bulk edit'], ['exportExcelBtn','download','Export Excel'], ['importCsvBtn','upload','Import CSV'],
  ['ssShareBtn','share','Share'], ['ssAiBtn','sparkle','AI'], ['ssTopMoreBtn','chevronDown',''], ['toggleSheetChrome','panel',''],
  ['tbAttach','attachment',''], ['tbComment','comment',''], ['tbActivity','clipboard',''], ['tbInfo','info',''],
  ['rptSaveBtn','save',''], ['rptPrintBtn','print',''], ['rptUndoBtn','undo',''], ['rptRedoBtn','redo',''],
  ['rptSourceBtn','folder','Nguồn'], ['rptColumnsBtn','columns','Cột'], ['rptFilterBtn','filter','Filter Criteria'],
  ['rptGroupBtn','group','Group'], ['rptSummarizeBtn','sum','Summarize'], ['rptSortBtn','sort','Sort']
 ];
 buttons.forEach(([id, icon, label]) => {
  const button = document.getElementById(id);
  if(!button) return;
  button.dataset.m365Icon = icon;
  button.dataset.m365Label = label;
  if(!button.getAttribute('aria-label')) button.setAttribute('aria-label', button.title || label || id);
  renderMicrosoft365ToolbarButton(button);
 });
 const glyphs = {ssBoldBtn:'B', ssItalicBtn:'I', ssUnderlineBtn:'U', ssStrikeBtn:'S'};
 Object.entries(glyphs).forEach(([id, glyph]) => {
  const button = document.getElementById(id);
  if(!button) return;
  button.classList.add('m365-format-glyph-btn');
  button.innerHTML = `<span class="m365-format-glyph">${glyph}</span>`;
  if(!button.getAttribute('aria-label')) button.setAttribute('aria-label', button.title || id);
 });
}

applyMicrosoft365ToolbarIcons();
let formatPainterSource = null;

let formatPainterLocked = false;

function startFormatPainter(sheet){
 if(formatPainterSource){
 exitFormatPainter();
 return;
 }
 const activeEl = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 if(!activeEl) return;
 const aRow = Number(activeEl.dataset.r);
 const aCol = Number(activeEl.dataset.c);
 const range = getSelectedRange(aRow, aCol);
 const styles = ensureCellStyles(sheet);
 const captured = {};
 let sampleStyle = null;
 for(let r = range.r1; r <= range.r2; r++){
 if(r === 0) continue;
 for(let c = range.c1; c <= range.c2; c++){
 if(c === 0 || c === 1) continue;
 const key = `${r}_${c}`;
 if(styles[key] && Object.keys(styles[key]).length){
 captured[key] = Object.assign({}, styles[key]);
 if(!sampleStyle) sampleStyle = captured[key];
 }
 }
 }
 if(!Object.keys(captured).length && !sampleStyle){
 // Không có định dạng nào để copy — nhưng vẫn cho phép "copy empty" (xoá định dạng ô đích)
 // Lưu 1 style rỗng để biết là có source
 captured['_empty'] = true;
 }
 formatPainterSource = {styles: captured, r1: range.r1, c1: range.c1, r2: range.r2, c2: range.c2};
 ssFormatPainterBtn.classList.add('fp-active');
 sheetGridWrap.classList.add('fp-active-cursor');
 // Tô highlight vùng nguồn
 sheetGridWrap.querySelectorAll('.sheet-cell.fp-source-highlight').forEach(el => el.classList.remove('fp-source-highlight'));
 for(let r = range.r1; r <= range.r2; r++){
 for(let c = range.c1; c <= range.c2; c++){
 if(r === 0 || c === 0 || c === 1) continue;
 const el = sheetGridWrap.querySelector(`.sheet-cell[data-r="${r}"][data-c="${c}"]`);
 if(el && styles[`${r}_${c}`]) el.classList.add('fp-source-highlight');
 }
 }
}

function applyFormatPainter(sheet, row, col){
 if(!formatPainterSource) return;
 const styles = ensureCellStyles(sheet);
 const src = formatPainterSource;
 // Tinh bounding box cua vung nguon da copy, gom ca o khong co style.
 const srcKeys = Object.keys(src.styles).filter(k => k !== '_empty');
 const srcR1 = Number.isFinite(src.r1) ? src.r1 : row;
 const srcC1 = Number.isFinite(src.c1) ? src.c1 : col;
 const srcR2 = Number.isFinite(src.r2) ? src.r2 : srcR1;
 const srcC2 = Number.isFinite(src.c2) ? src.c2 : srcC1;
 const srcW = Math.max(1, srcC2 - srcC1 + 1);
 const srcH = Math.max(1, srcR2 - srcR1 + 1);
 if(srcKeys.length || src.styles._empty){
 // Lay vung dich dang boi den; neu chi bam 1 o thi vung dich la 1 o.
 const range = getSelectedRange(row, col);
 for(let r = range.r1; r <= range.r2; r++){
 if(r === 0) continue;
 for(let c = range.c1; c <= range.c2; c++){
 if(c === 0 || c === 1) continue;
 const relR = r - range.r1;
 const relC = c - range.c1;
 // Wrap quanh bounding box nguồn
 const srcR = srcR1 + (relR % srcH);
 const srcC = srcC1 + (relC % srcW);
 const srcKey = `${srcR}_${srcC}`;
 const destKey = `${r}_${c}`;
 if(src.styles[srcKey]){
 if(Object.keys(src.styles[srcKey]).length) styles[destKey] = Object.assign({}, src.styles[srcKey]);
 else delete styles[destKey];
 } else {
 // Nếu ô nguồn không có style, xoá style ô đích
 delete styles[destKey];
 }
 }
 }
 } else {
 // Nguồn rỗng — chỉ copy "empty" (xoá style ô đích)
 const range = getSelectedRange(row, col);
 for(let r = range.r1; r <= range.r2; r++){
 if(r === 0) continue;
 for(let c = range.c1; c <= range.c2; c++){
 if(c === 0 || c === 1) continue;
 delete styles[`${r}_${c}`];
 }
 }
 }
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 if(!formatPainterLocked) exitFormatPainter();
}

function exitFormatPainter(){
 formatPainterSource = null;
 formatPainterLocked = false;
 ssFormatPainterBtn.classList.remove('fp-active', 'fp-locked');
 sheetGridWrap.classList.remove('fp-active-cursor');
 sheetGridWrap.querySelectorAll('.sheet-cell.fp-source-highlight').forEach(el => el.classList.remove('fp-source-highlight'));
}

const sheetUndoStack = [];

const sheetRedoStack = [];

const reportUndoStack = [];

const reportRedoStack = [];

function setUndoRedoButtonState(btn, enabled){
 if(!btn) return;
 btn.disabled = !enabled;
 btn.classList.toggle('is-available', !!enabled);
}

function updateSheetUndoRedoButtons(){
 setUndoRedoButtonState(sheetUndoBtn, sheetUndoStack.length > 0);
 setUndoRedoButtonState(sheetRedoBtn, sheetRedoStack.length > 0);
}

function updateReportUndoRedoButtons(){
 setUndoRedoButtonState(rptUndoBtn, reportUndoStack.length > 0);
 setUndoRedoButtonState(rptRedoBtn, reportRedoStack.length > 0);
}

function pushBoundedHistory(stack, action){
 stack.push(action);
 if(stack.length > 100) stack.shift();
}

function cloneForHistory(value){
 return JSON.parse(JSON.stringify(value ?? null));
}

function cloneSheetCellsForHistory(cells){
 return (cells || []).map(row => {
  const next = Array.isArray(row) ? [...row] : row;
  if(Array.isArray(next) && row && typeof row === 'object'){
   ['_level','_collapsed','_createdBy','_createdAt','_modifiedBy','_modifiedAt'].forEach(key => {
    if(Object.prototype.hasOwnProperty.call(row, key)) next[key] = cloneForHistory(row[key]);
   });
  }
  return next;
 });
}

function createSheetUndoSnapshot(sheet){
 return {
  cells: cloneSheetCellsForHistory(ensureSheetCells(sheet)),
  cellStyles: cloneForHistory(sheet._cellStyles || {}),
  settings: cloneForHistory(sheet.settings || {}),
  config: cloneForHistory(sheet._config || {}),
  filters: cloneForHistory(sheet._filters || []),
  sorts: cloneForHistory(sheet._sorts || [])
 };
}

function restoreSheetUndoSnapshot(sheet, snapshot){
 if(!sheet || !snapshot) return;
 sheet.cells = cloneSheetCellsForHistory(snapshot.cells || []);
 sheet._cellStyles = cloneForHistory(snapshot.cellStyles || {});
 sheet.settings = cloneForHistory(snapshot.settings || {});
 sheet._config = cloneForHistory(snapshot.config || {});
 sheet._filters = cloneForHistory(snapshot.filters || []);
 sheet._sorts = cloneForHistory(snapshot.sorts || []);
}

function pushSheetSnapshotUndo(sheet, before, after, label){
 if(!sheet || !activeSheetContext) return;
 if(JSON.stringify(before) === JSON.stringify(after)) return;
 pushSheetUndo({
  type:'snapshot',
  label:label || 'sheet-change',
  projectIndex:activeSheetContext.projectIndex,
  folderIndex:activeSheetContext.folderIndex,
  before,
  after
 });
}

function pushSheetUndo(action){
 if(!action) return;
 if(action.type === 'snapshot'){
  if(JSON.stringify(action.before) === JSON.stringify(action.after)) return;
 }else if(action.oldValue === action.newValue) return;
 pushBoundedHistory(sheetUndoStack, action);
 sheetRedoStack.length = 0;
 updateSheetUndoRedoButtons();
}

function pushReportUndo(action){
 if(!action || action.oldValue === action.newValue) return;
 pushBoundedHistory(reportUndoStack, action);
 reportRedoStack.length = 0;
 updateReportUndoRedoButtons();
}

function applySheetHistory(action, direction){
 const folders = PROJECT_FOLDERS[action.projectIndex];
 const sheet = folders && folders[action.folderIndex];
 if(!sheet) return;
 if(action.type === 'snapshot'){
  restoreSheetUndoSnapshot(sheet, direction === 'undo' ? action.before : action.after);
  scheduleSheetDataSave(sheet);
  saveProjectLocalBackup();
  if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
  if(activeSheetContext && activeSheetContext.projectIndex === action.projectIndex && activeSheetContext.folderIndex === action.folderIndex){
   renderGridSheet(sheet);
  }
  return;
 }
 const value = direction === 'undo' ? action.oldValue : action.newValue;
 const cells = ensureSheetCells(sheet);
 if(!cells[action.row]) return;
 cells[action.row][action.col] = value;
 scheduleCellSave(sheet, action.row, action.col, value);
 saveProjectLocalBackup();
 if(activeSheetContext && activeSheetContext.projectIndex === action.projectIndex && activeSheetContext.folderIndex === action.folderIndex){
  renderGridSheet(sheet);
  requestAnimationFrame(() => {
   const selector = `.sheet-cell[data-r="${action.row}"][data-c="${action.col}"]`;
   const cell = sheetGridWrap && sheetGridWrap.querySelector(selector);
   if(cell){
    setActiveSheetCell(action.row, action.col, true);
    if(typeof cell.focus === 'function') cell.focus();
   }
  });
 }
}

function undoSheetEdit(){
 const action = sheetUndoStack.pop();
 if(!action) return;
 applySheetHistory(action, 'undo');
 pushBoundedHistory(sheetRedoStack, action);
 updateSheetUndoRedoButtons();
}

function redoSheetEdit(){
 const action = sheetRedoStack.pop();
 if(!action) return;
 applySheetHistory(action, 'redo');
 pushBoundedHistory(sheetUndoStack, action);
 updateSheetUndoRedoButtons();
}

function applyReportCellHistory(action, value){
 updateReportSourceCell(action.projectIndex, action.folderIndex, action.sourceRow, action.colIndex, value);
 saveProjectLocalBackup();
 if(reportView && reportView.style.display !== 'none'){
  renderReportView();
  requestAnimationFrame(() => activateReportAttachmentRow(action.projectIndex, action.folderIndex, action.sourceRow));
 }
}

function undoReportEdit(){
 const action = reportUndoStack.pop();
 if(!action) return;
 applyReportCellHistory(action, action.oldValue);
 pushBoundedHistory(reportRedoStack, action);
 updateReportUndoRedoButtons();
}

function redoReportEdit(){
 const action = reportRedoStack.pop();
 if(!action) return;
 applyReportCellHistory(action, action.newValue);
 pushBoundedHistory(reportUndoStack, action);
 updateReportUndoRedoButtons();
}

function updateToolButtonStates(sheet){
 ssSortBtn.classList.toggle('active', !!(sheet._sorts && sheet._sorts.length));
 ssFilterBtn.classList.toggle('active', !!(sheet._filters && sheet._filters.length));
 ssFormatBtn.classList.toggle('active', !!(sheet._formatRules && sheet._formatRules.length));
 updateSheetColumnsBtn(sheet);
}

function updateSheetColumnsBtn(sheet){
 const hiddenCount = sheet._config?.hiddenCols?.length || 0;
 ssColumnsBtn.classList.toggle('active', !!hiddenCount);
 setMicrosoft365ToolbarLabel(ssColumnsBtn, hiddenCount ? `Cột (ẩn ${hiddenCount})` : 'Cột');
}

function updateTextFormatButtonStates(rowIndex, colIndex){
 const sheet = getActiveSheet();
 const st = sheet ? getCellStyle(sheet, rowIndex, colIndex) : null;
 ssBoldBtn.classList.toggle('active', !!(st && st.bold));
 ssItalicBtn.classList.toggle('active', !!(st && st.italic));
 ssUnderlineBtn.classList.toggle('active', !!(st && st.underline));
 ssStrikeBtn.classList.toggle('active', !!(st && st.strike));
}

const textColorPopover = document.getElementById('textColorPopover');

const textColorSwatches = document.getElementById('textColorSwatches');

const textColorResetBtn = document.getElementById('textColorResetBtn');

const fillColorPopover = document.getElementById('fillColorPopover');

const fillColorSwatches = document.getElementById('fillColorSwatches');

const fillColorResetBtn = document.getElementById('fillColorResetBtn');

const TEXT_COLOR_SWATCHES = ['#1A1A1A', '#D93025', '#1A73E8', '#188038', '#B9472D'];

const FORMAT_RULE_COLORS = ['#FCE8E6', '#FEF7E0', '#E6F4EA', '#E8F0FE', '#F3E8FD'];

const FILL_COLOR_SWATCHES = FORMAT_RULE_COLORS;

let openToolPopover = null;

let formatDraft = null;

function closeAllToolPopovers(){
 openToolPopover = null;
 formatDraft = null;
 [sortPopover, filterPopover, formatPopover, textColorPopover, fillColorPopover, ssColumnsPopover].forEach(p => { p.hidden = true; });
}

function renderColorSwatchPicker(container, colors, onPick){
 container.innerHTML = colors.map(c => `<span class="ss-color-swatch" data-color="${c}" style="background:${c}"></span>`).join('');
 container.querySelectorAll('.ss-color-swatch').forEach(sw => {
 sw.addEventListener('click', () => { onPick(sw.dataset.color); closeAllToolPopovers(); });
 });
}

function toggleToolPopover(name){
 const sheet = getActiveSheet();
 if(!sheet) return;
 if(openToolPopover === name){
  closeAllToolPopovers();
  return;
  }
  closeAllToolPopovers();
  const popoverByName = {sort:sortPopover, filter:filterPopover, format:formatPopover, columns:ssColumnsPopover, textColor:textColorPopover, fillColor:fillColorPopover};
  const targetPopover = popoverByName[name];
  if(ssMoreMenu && targetPopover && !ssMoreMenu.contains(targetPopover)) closeSheetMoreMenu();
  openToolPopover = name;
 if(name === 'sort'){ sortPopover.hidden = false; renderSortPopover(sheet); }
 if(name === 'filter'){ filterPopover.hidden = false; renderFilterPopover(sheet); }
 if(name === 'format'){ formatPopover.hidden = false; renderFormatPopover(sheet); }
 if(name === 'columns'){ ssColumnsPopover.hidden = false; renderSheetColumnsPopover(sheet); }
 if(name === 'textColor'){
 textColorPopover.hidden = false;
 renderColorSwatchPicker(textColorSwatches, TEXT_COLOR_SWATCHES, color => setCellStyleValue(sheet, 'color', color));
 }
 if(name === 'fillColor'){
 fillColorPopover.hidden = false;
 renderColorSwatchPicker(fillColorSwatches, FILL_COLOR_SWATCHES, color => setCellStyleValue(sheet, 'bg', color));
 }
}

function openAttachmentPanelFromToolbar() {
  if(reportView && reportView.style.display !== 'none'){
    const activeReportBtn = reportGridWrap?.querySelector?.('.report-attach-btn.active') || reportGridWrap?.querySelector?.('.report-attach-btn');
    if(activeReportBtn){
      const projectIndex = Number(activeReportBtn.dataset.srcProject);
      const folderIndex = Number(activeReportBtn.dataset.srcFolder);
      const sourceRow = Number(activeReportBtn.dataset.srcRow);
      activateReportAttachmentRow(projectIndex, folderIndex, sourceRow);
      openAttachmentPanel(sourceRow, {projectIndex, folderIndex});
      return;
    }
  }
  const activeCell = sheetGridWrap?.querySelector?.('.sheet-cell.active-cell');
  const selectedRow = activeCell ? Number(activeCell.dataset.r) : 0;
  const row = selectedRow > 0 ? selectedRow : (activeAttachmentRow || 1);
  openAttachmentPanel(row);
}

function toggleAttachPanel() {
  openAttachmentPanelFromToolbar();
}

function closeAttachPanel() {
  closeAttachmentPanel();
}

function switchAttachTab(tab) {
  currentAttachTab = tab;
  renderAttachmentPanel();
}
