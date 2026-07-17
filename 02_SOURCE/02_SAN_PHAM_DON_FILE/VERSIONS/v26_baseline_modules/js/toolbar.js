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
 ssColumnsBtn.textContent = hiddenCount ? `▤ Cột (ẩn ${hiddenCount})` : '▤ Cột';
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
