const reportView = document.getElementById('reportView');

const reportGridWrap = document.getElementById('reportGridWrap');

const activeReportName = document.getElementById('activeReportName');

const backFromReport = document.getElementById('backFromReport');

const rptSearchInput = document.getElementById('rptSearchInput');

const rptRowHeightSelect = document.getElementById('rptRowHeightSelect');

const rptSaveBtn = document.getElementById('rptSaveBtn');

const rptPrintBtn = document.getElementById('rptPrintBtn');

const rptUndoBtn = document.getElementById('rptUndoBtn');

const rptRedoBtn = document.getElementById('rptRedoBtn');

const rptSourceBtn = document.getElementById('rptSourceBtn');

const rptSourcePopover = document.getElementById('rptSourcePopover');

const rptSourceList = document.getElementById('rptSourceList');

const rptColumnsBtn = document.getElementById('rptColumnsBtn');

const rptColumnsPopover = document.getElementById('rptColumnsPopover');

const rptColumnsList = document.getElementById('rptColumnsList');

const rptFilterBtn = document.getElementById('rptFilterBtn');

const rptFilterPopover = document.getElementById('rptFilterPopover');

const rptFilterChips = document.getElementById('rptFilterChips');

const rptFilterEmptyLabel = document.getElementById('rptFilterEmptyLabel');

const rptFilterAddBtn = document.getElementById('rptFilterAddBtn');

const rptFilterPicker = document.getElementById('rptFilterPicker');

const rptFilterPickerSearch = document.getElementById('rptFilterPickerSearch');

const rptFilterPickerList = document.getElementById('rptFilterPickerList');

const rptFilterClearBtn = document.getElementById('rptFilterClearBtn');

const rptGroupBtn = document.getElementById('rptGroupBtn');

const rptGroupPopover = document.getElementById('rptGroupPopover');

const rptGroupChips = document.getElementById('rptGroupChips');

const rptGroupAddBtn = document.getElementById('rptGroupAddBtn');

const rptGroupPicker = document.getElementById('rptGroupPicker');

const rptGroupPickerSearch = document.getElementById('rptGroupPickerSearch');

const rptGroupPickerList = document.getElementById('rptGroupPickerList');

const rptGroupClearBtn = document.getElementById('rptGroupClearBtn');

const rptSummarizeBtn = document.getElementById('rptSummarizeBtn');

const rptSummarizePopover = document.getElementById('rptSummarizePopover');

const rptSummarizeChips = document.getElementById('rptSummarizeChips');

const rptSummarizeAddBtn = document.getElementById('rptSummarizeAddBtn');

const rptSummarizePicker = document.getElementById('rptSummarizePicker');

const rptSummarizePickerSearch = document.getElementById('rptSummarizePickerSearch');

const rptSummarizePickerList = document.getElementById('rptSummarizePickerList');

const rptSummarizeClearBtn = document.getElementById('rptSummarizeClearBtn');

const rptSortBtn = document.getElementById('rptSortBtn');

const rptSortPopover = document.getElementById('rptSortPopover');

const rptSortChips = document.getElementById('rptSortChips');

const rptSortAddBtn = document.getElementById('rptSortAddBtn');

const rptSortPicker = document.getElementById('rptSortPicker');

const rptSortPickerSearch = document.getElementById('rptSortPickerSearch');

const rptSortPickerList = document.getElementById('rptSortPickerList');

const rptSortClearBtn = document.getElementById('rptSortClearBtn');

let openReportPopover = null;

let isSelectingReportRange = false;

let reportRangeAnchor = null;

let reportRangeEnd = null;

function refreshReportAttachmentBadge(sourceContext, rowIndex){
 if(!sourceContext || !reportGridWrap) return;
 const sheet = PROJECT_FOLDERS[sourceContext.projectIndex]?.[sourceContext.folderIndex];
 if(!sheet) return;
 const files = ensureSheetAttachments(sheet)[rowIndex] || [];
 const btn = reportGridWrap.querySelector(`.report-attach-btn[data-src-project="${sourceContext.projectIndex}"][data-src-folder="${sourceContext.folderIndex}"][data-src-row="${rowIndex}"]`);
 if(!btn) return;
 btn.classList.toggle('has-files', !!files.length);
 btn.innerHTML = files.length ? `📎<span>${files.length}</span>` : '📎';
 btn.title = files.length ? `${files.length} file đính kèm` : 'Đính kèm file cho dòng này';
}

function ensureReportConfig(report){
 if(!report._config || typeof report._config !== 'object') report._config = {};
 const c = report._config;
 if(!Array.isArray(c.sources)) c.sources = [];
 if(!Array.isArray(c.filters)) c.filters = [];
 if(!Array.isArray(c.sorts)) c.sorts = [];
 if(!Array.isArray(c.summaries)) c.summaries = [];
 if(c.groupCol === undefined) c.groupCol = null;
 if(typeof c.searchTerm !== 'string') c.searchTerm = '';
 if(!Number.isFinite(Number(c.rowHeight)) || Number(c.rowHeight) > 96 || (Number(c.rowHeight) === 30 && !c.rowHeightUserSet)) c.rowHeight = 24;
 c.rowHeight = Math.max(22, Math.min(96, Number(c.rowHeight) || 24));
 return c;
}

function getReportHeaderSheet(){
 return {cells: [SHEET_HEADER_TEMPLATE]};
}

function getReportColumns(){
 return getPickableColumns(getReportHeaderSheet()).filter(c => c.index !== 0);
}

function getAllReportSourceCandidates(excludeProjectIndex, excludeFolderIndex){
 return DATA
 .map((project, projectIndex) => {
 const folders = PROJECT_FOLDERS?.[projectIndex] || [];
 const items = folders
 .map((item, folderIndex) => ({item, folderIndex}))
 .filter(({item, folderIndex}) =>
 !(projectIndex === excludeProjectIndex && folderIndex === excludeFolderIndex) &&
 isWorkFile(item) && item.type !== 'report'
 );
 return {projectIndex, projectName: project.name, items};
 })
 .filter(group => group.items.length > 0);
}

function isReportSourceSelected(config, projectIndex, folderIndex){
 return config.sources.some(s => s.projectIndex === projectIndex && s.folderIndex === folderIndex);
}

function isBlankReportSourceRow(row){
 if(!Array.isArray(row)) return true;
 return row.every((value, index) => {
 if(index === 0 || index === 1) return true;
 return !String(value ?? '').trim();
 });
}

function buildReportRows(report){
 const config = ensureReportConfig(report);
 let rows = [];
 config.sources.forEach(({projectIndex, folderIndex}) => {
 const folders = PROJECT_FOLDERS?.[projectIndex] || [];
 const src = folders[folderIndex];
 if(!src || !isWorkFile(src) || src.type === 'report') return;
 const projectName = (DATA[projectIndex] && DATA[projectIndex].name) || '';
 const cells = ensureSheetCells(src);
 for(let r = 1; r < cells.length; r++){
 const row = cells[r];
 if(isBlankReportSourceRow(row)) continue; // bỏ dòng trống nghiệp vụ
 rows.push({sourceName: src.name, sourceProjectName: projectName, sourceProjectIndex: projectIndex, sourceFolderIndex: folderIndex, sourceRow: r, cells: row});
 }
 });
 rows = rows.filter(item => {
 for(const f of config.filters){
 if(!f.value) continue;
 const cellValue = String(item.cells[f.col] ?? '').toLowerCase();
 if(!cellValue.includes(f.value.toLowerCase())) return false;
 }
 return true;
 });
 const term = config.searchTerm.trim().toLowerCase();
 if(term){
 rows = rows.filter(item =>
 item.sourceName.toLowerCase().includes(term) ||
 item.sourceProjectName.toLowerCase().includes(term) ||
 item.cells.some(v => String(v ?? '').toLowerCase().includes(term))
 );
 }
 if(config.sorts.length){
 rows.sort((a, b) => {
 for(const {col, dir} of config.sorts){
 const av = a.cells[col] ?? '', bv = b.cells[col] ?? '';
 const an = parseFloat(av), bn = parseFloat(bv);
 const bothNumeric = av !== '' && bv !== '' && !isNaN(an) && !isNaN(bn);
 let cmp = bothNumeric ? (an - bn) : String(av).localeCompare(String(bv), 'vi');
 if(dir === 'desc') cmp = -cmp;
 if(cmp !== 0) return cmp;
 }
 return 0;
 });
 }
 return rows;
}

function updateReportSourceCell(projectIndex, folderIndex, sourceRow, colIndex, newValue){
 const folders = PROJECT_FOLDERS[projectIndex];
 const sheet = folders && folders[folderIndex];
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 const row = cells[sourceRow];
 if(!row) return;
 row[colIndex] = newValue;
 scheduleSheetDataSave(sheet);
}

function groupReportRows(report, rows){
 const config = ensureReportConfig(report);
 if(config.groupCol === null) return [{value: null, rows}];
 const map = new Map();
 const order = [];
 rows.forEach(item => {
 const key = String(item.cells[config.groupCol] ?? '').trim() || '(Trống)';
 if(!map.has(key)){ map.set(key, []); order.push(key); }
 map.get(key).push(item);
 });
 return order.map(key => ({value: key, rows: map.get(key)}));
}

const SUMMARY_FN_LABEL = {count:'Đếm', sum:'Tổng', avg:'Trung bình', min:'Nhỏ nhất', max:'Lớn nhất'};

function computeSummary(rows, col, fn){
 const values = rows.map(item => item.cells[col]).filter(v => String(v ?? '').trim() !== '');
 if(fn === 'count') return String(values.length);
 const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
 if(!nums.length) return '';
 if(fn === 'sum') return String(Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100);
 if(fn === 'avg') return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
 if(fn === 'min') return String(Math.min(...nums));
 if(fn === 'max') return String(Math.max(...nums));
 return '';
}

function normalizeReportLabel(value){
 return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

function getCompactReportColWidth(col){
 const label = normalizeReportLabel(col?.label || '');
 if(col.index === 1 || label.includes('trang') || label.includes('status')) return 38;
 if(label.includes('stt')) return 46;
 if(label.includes('ngay') || label.includes('date')) return 82;
 if(label.includes('so van') || label.includes('ref') || label.includes('rev')) return 84;
 if(label.includes('loai') || label.includes('phan loai')) return 92;
 if(label.includes('don vi') || label.includes('nguoi')) return 112;
 if(label.includes('noi dung') || label.includes('hang muc')) return 148;
 return 92;
}

function getActiveReport(){
  return getActiveSheet();
}

function openReport(projectIndex, folderIndex){
 const report = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!report) return;
 ensureReportConfig(report);
 activeProjectIndex = projectIndex;
 activeSheetContext = {projectIndex, folderIndex};
 updateBrowseBreadcrumb(projectIndex);
 appShell.classList.remove('sheet-nav-collapsed');
 document.getElementById('detailTitle').textContent = getWorkspaceOpenTitle(report);
 activeReportName.textContent = getWorkspaceOpenTitle(report);
 render();
 detailBody.style.display = 'none';
 gridSheetView.style.display = 'none';
 hideDashboardView();
 reportView.style.display = 'flex';
 reportGridWrap.style.display = 'block';
 rptSearchInput.value = report._config.searchTerm || '';
 if(rptRowHeightSelect) rptRowHeightSelect.value = String(ensureReportConfig(report).rowHeight || 26);
 closeAllReportPopovers();
 renderReportView();
 if(!ensureReportConfig(report).sources.length){
  requestAnimationFrame(() => openReportSourceChooser());
 }

 main.classList.add('detail-open', 'sheet-open');
 const currentWidth = parseFloat(getComputedStyle(main).getPropertyValue('--project-column-size'));
 if(Number.isFinite(currentWidth)) setProjectColumnWidth(currentWidth);
 document.getElementById('screen-list').style.display = 'flex';
 document.getElementById('screen-detail').style.display = 'flex';
 pushNavState();
}

function renderReportView(){
 const report = getActiveReport();
 if(!report) return;
 const config = ensureReportConfig(report);
 const reportRowHeight = Math.max(22, Math.min(96, Number(config.rowHeight) || 24));
 if(rptRowHeightSelect) rptRowHeightSelect.value = String(reportRowHeight);
 updateReportToolButtonStates(report);

 if(!config.sources.length){
 reportGridWrap.innerHTML = `<div class="report-empty-state">Báo cáo chưa có nguồn dữ liệu.<br>Bấm <strong>🗂 Nguồn</strong> ở trên để chọn Sheet — có thể chọn từ nhiều dự án khác nhau.</div>`;
 return;
 }

 const rows = buildReportRows(report);
 const cols = getReportColumns().filter(c =>
 c.index !== 1 &&
 (!config.hiddenCols || !config.hiddenCols.includes(c.index))
 );

 if(!rows.length){
 reportGridWrap.innerHTML = `<div class="report-empty-state">Không có dòng nào khớp với Lọc/Tìm kiếm hiện tại.</div>`;
 return;
 }

 const groups = groupReportRows(report, rows);
 const reportColKeyPrefix = `report:${activeSheetContext.projectIndex}:${activeSheetContext.folderIndex}`;
 const rowNoColWidth = 44;
 const attachColKey = `${reportColKeyPrefix}:attach`;
 const attachColWidth = 34;
 const reportDataColWidths = cols.map(c => {
 const key = `${reportColKeyPrefix}:c${c.index}`;
 return getStoredColWidth(key, getCompactReportColWidth(c));
 });
 const reportColWidths = [rowNoColWidth, attachColWidth].concat(reportDataColWidths);
 const reportTableTotalWidth = reportColWidths.reduce((sum, w) => sum + w, 0);
 const colGroupHtml = `<colgroup><col style="width:${rowNoColWidth}px"><col data-col-key="${attachColKey}" style="width:${attachColWidth}px">` +
 cols.map((c, index) => `<col data-col-key="${reportColKeyPrefix}:c${c.index}" style="width:${reportDataColWidths[index]}px">`).join('') + `</colgroup>`;
 const headerHtml = `<th class="sheet-col-head report-row-number-head" style="width:${rowNoColWidth}px">#</th><th class="sheet-col-head report-attach-head" data-col-key="${attachColKey}" style="width:${attachColWidth}px">📎</th>` +
 cols.map((c, index) => {
 const key = `${reportColKeyPrefix}:c${c.index}`;
 return `<th class="sheet-col-head" data-col-key="${key}" style="width:${reportDataColWidths[index]}px">${escapeHtml(c.label)}</th>`;
 }).join('');

 let reportDisplayRowNo = 0;
 const renderDataRow = (item) => {
 reportDisplayRowNo += 1;
 const cellsHtml = cols.map(c => {
 const value = item.cells[c.index];
 const escaped = escapeHtml(value);
 return `<td class="sheet-data-cell"><div class="sheet-cell report-editable-cell" contenteditable="true" spellcheck="false"
 data-src-project="${item.sourceProjectIndex}" data-src-folder="${item.sourceFolderIndex}" data-src-row="${item.sourceRow}"
 data-col="${c.index}" data-original-value="${escaped}">${escaped}</div></td>`;
 }).join('');
 const sourceSheet = PROJECT_FOLDERS[item.sourceProjectIndex]?.[item.sourceFolderIndex];
 const fileCount = sourceSheet ? (ensureSheetAttachments(sourceSheet)[item.sourceRow] || []).length : 0;
 const attachButton = `<button class="report-attach-btn ${fileCount ? 'has-files' : ''}" type="button"
  title="${fileCount ? `${fileCount} file đính kèm` : 'Đính kèm file cho dòng này'}"
  data-src-project="${item.sourceProjectIndex}" data-src-folder="${item.sourceFolderIndex}" data-src-row="${item.sourceRow}">📎${fileCount ? `<span>${fileCount}</span>` : ''}</button>`;
 return `<tr class="report-data-row" data-src-project="${item.sourceProjectIndex}" data-src-folder="${item.sourceFolderIndex}" data-src-row="${item.sourceRow}"><td class="sheet-data-cell report-row-number-cell">${reportDisplayRowNo}</td><td class="sheet-data-cell report-attach-cell">${attachButton}</td>${cellsHtml}</tr>`;
 };

 const renderSummaryRow = (rowsInGroup, label) => {
 if(!config.summaries.length) return '';
 const cellsHtml = cols.map((c, index) => {
 const s = config.summaries.find(s => s.col === c.index);
 const value = s ? computeSummary(rowsInGroup, c.index, s.fn) : '';
 const summaryText = s && value !== '' ? `${SUMMARY_FN_LABEL[s.fn]}: ${value}` : '';
 const text = index === 0 ? [label, summaryText].filter(Boolean).join(' · ') : summaryText;
 return `<td><div>${escapeHtml(text)}</div></td>`;
 }).join('');
 return `<tr class="report-summary-row"><td class="report-row-number-summary"></td><td class="report-attach-summary-cell"></td>${cellsHtml}</tr>`;
 };

 // Giống Smartsheet: dòng "Tổng cộng" luôn ghim ngay dưới hàng tiêu đề, không phải ở cuối bảng.
 const overallSummaryHtml = renderSummaryRow(rows, `Tổng cộng toàn báo cáo (${rows.length} dòng)`).replace(
 'class="report-summary-row"', 'class="report-summary-row report-overall-summary-row"'
 );

 let bodyHtml = '';
 if(groups.length === 1 && groups[0].value === null){
 bodyHtml = overallSummaryHtml + groups[0].rows.map(renderDataRow).join('');
 } else {
 bodyHtml = overallSummaryHtml + groups.map(g => {
 const groupHeader = `<tr class="report-group-row"><td colspan="${cols.length + 2}">${escapeHtml(g.value)} — ${g.rows.length} dòng</td></tr>`;
 return groupHeader + g.rows.map(renderDataRow).join('') + renderSummaryRow(g.rows, `Tổng hợp nhóm "${g.value}"`);
 }).join('');
 }

 reportGridWrap.innerHTML = `
 <table class="grid-sheet-table" style="width:${reportTableTotalWidth}px;--report-row-height:${reportRowHeight}px">
 ${colGroupHtml}
 <thead><tr>${headerHtml}</tr></thead>
 <tbody>${bodyHtml}</tbody>
 </table>
 `;

 wireColumnResize(reportGridWrap.querySelector('table'), new Set([0, 1]));
 wireReportGridInteractions();
}

function activateReportAttachmentRow(projectIndex, folderIndex, sourceRow){
 const selector = `.report-attach-btn[data-src-project="${projectIndex}"][data-src-folder="${folderIndex}"][data-src-row="${sourceRow}"]`;
 reportGridWrap.querySelectorAll('.report-attach-btn.active').forEach(active => active.classList.remove('active'));
 const btn = reportGridWrap.querySelector(selector);
 if(btn) btn.classList.add('active');
 return btn;
}

function clearReportRangeSelection(){
 reportGridWrap.querySelectorAll('td.report-range-selected, td.report-active-cell').forEach(el => {
 el.classList.remove('report-range-selected', 'report-active-cell');
 });
 reportGridWrap.querySelectorAll('.report-editable-cell.range-selected, .report-editable-cell.active-cell').forEach(el => {
 el.classList.remove('range-selected', 'active-cell');
 });
}

function getReportCellPosition(cell){
 const row = cell.closest('.report-data-row');
 const rows = Array.from(reportGridWrap.querySelectorAll('.report-data-row'));
 return {
  rowIndex: rows.indexOf(row),
  cellIndex: cell.parentElement ? cell.parentElement.cellIndex : -1
 };
}

function updateReportRangeHighlight(){
 reportGridWrap.querySelectorAll('td.report-range-selected, td.report-active-cell').forEach(el => {
 el.classList.remove('report-range-selected', 'report-active-cell');
 });
 reportGridWrap.querySelectorAll('.report-editable-cell.range-selected').forEach(el => el.classList.remove('range-selected'));
 const activeCell = reportGridWrap.querySelector('.report-editable-cell.active-cell');
 if(activeCell?.parentElement) activeCell.parentElement.classList.add('report-active-cell');
 if(!reportRangeAnchor || !reportRangeEnd) return;
 const r1 = Math.min(reportRangeAnchor.rowIndex, reportRangeEnd.rowIndex);
 const r2 = Math.max(reportRangeAnchor.rowIndex, reportRangeEnd.rowIndex);
 const c1 = Math.min(reportRangeAnchor.cellIndex, reportRangeEnd.cellIndex);
 const c2 = Math.max(reportRangeAnchor.cellIndex, reportRangeEnd.cellIndex);
 const rows = Array.from(reportGridWrap.querySelectorAll('.report-data-row'));
 for(let r = r1; r <= r2; r++){
  const row = rows[r];
  if(!row) continue;
  row.querySelectorAll('.report-editable-cell').forEach(cell => {
   const pos = getReportCellPosition(cell);
   if(pos.cellIndex >= c1 && pos.cellIndex <= c2){
    cell.classList.add('range-selected');
    cell.parentElement?.classList.add('report-range-selected');
   }
  });
 }
 if(activeCell?.parentElement) activeCell.parentElement.classList.add('report-active-cell');
}

function clearSelectedReportCells(){
 if(!reportView || reportView.style.display === 'none') return false;
 const selectedCells = Array.from(reportGridWrap.querySelectorAll('.report-editable-cell.range-selected'));
 const activeCell = reportGridWrap.querySelector('.report-editable-cell.active-cell');
 const targets = selectedCells.length ? selectedCells : (activeCell ? [activeCell] : []);
 if(!targets.length) return false;
 const seen = new Set();
 let changed = false;
 targets.forEach(cell => {
  const projectIndex = Number(cell.dataset.srcProject);
  const folderIndex = Number(cell.dataset.srcFolder);
  const sourceRow = Number(cell.dataset.srcRow);
  const colIndex = Number(cell.dataset.col);
  const key = `${projectIndex}:${folderIndex}:${sourceRow}:${colIndex}`;
  if(seen.has(key)) return;
  seen.add(key);
  const oldValue = cell.dataset.originalValue ?? cell.textContent ?? '';
  if(String(oldValue) === '') return;
  pushReportUndo({projectIndex, folderIndex, sourceRow, colIndex, oldValue, newValue:''});
  updateReportSourceCell(projectIndex, folderIndex, sourceRow, colIndex, '');
  changed = true;
 });
 if(!changed) return false;
 saveProjectLocalBackup();
 reportRangeAnchor = null;
 reportRangeEnd = null;
 isSelectingReportRange = false;
 renderReportView();
 return true;
}

function wireReportGridInteractions(){
 reportGridWrap.querySelectorAll('.report-data-row').forEach(row => {
 row.addEventListener('click', () => {
 const projectIndex = Number(row.dataset.srcProject);
 const folderIndex = Number(row.dataset.srcFolder);
 const sourceRow = Number(row.dataset.srcRow);
 activateReportAttachmentRow(projectIndex, folderIndex, sourceRow);
 });
 });

 reportGridWrap.querySelectorAll('.report-editable-cell').forEach(cell => {
 cell.addEventListener('mousedown', (e) => {
 if(e.button !== 0 || e.detail > 1) return;
 e.preventDefault();
 e.stopPropagation();
 const pos = getReportCellPosition(cell);
 if(pos.rowIndex < 0 || pos.cellIndex < 0) return;
 clearReportRangeSelection();
 cell.classList.add('active-cell');
 cell.parentElement?.classList.add('report-active-cell');
 isSelectingReportRange = true;
 reportRangeAnchor = pos;
 reportRangeEnd = pos;
 updateReportRangeHighlight();
 });
 cell.addEventListener('mouseover', () => {
 if(!isSelectingReportRange) return;
 const pos = getReportCellPosition(cell);
 if(pos.rowIndex < 0 || pos.cellIndex < 0) return;
 reportRangeEnd = pos;
 updateReportRangeHighlight();
 });
 cell.addEventListener('dblclick', () => {
 clearReportRangeSelection();
 cell.classList.add('active-cell');
 cell.parentElement?.classList.add('report-active-cell');
 cell.focus();
 });
 cell.addEventListener('blur', () => {
 const projectIndex = Number(cell.dataset.srcProject);
 const folderIndex = Number(cell.dataset.srcFolder);
 const sourceRow = Number(cell.dataset.srcRow);
 const colIndex = Number(cell.dataset.col);
 const newValue = cell.textContent;
 if(newValue === cell.dataset.originalValue) return; // không đổi gì thì khỏi lưu/vẽ lại
 pushReportUndo({projectIndex, folderIndex, sourceRow, colIndex, oldValue:cell.dataset.originalValue || '', newValue});
 updateReportSourceCell(projectIndex, folderIndex, sourceRow, colIndex, newValue);
 renderReportView();
 });
 cell.addEventListener('keydown', (e) => {
 if(e.key === 'Enter'){ e.preventDefault(); cell.blur(); }
 else if(e.key === 'Escape'){ e.preventDefault(); cell.textContent = cell.dataset.originalValue || ''; cell.blur(); }
 });
 });

 reportGridWrap.querySelectorAll('.report-attach-btn').forEach(btn => {
 btn.addEventListener('click', (e) => {
 e.stopPropagation();
 const projectIndex = Number(btn.dataset.srcProject);
 const folderIndex = Number(btn.dataset.srcFolder);
 const sourceRow = Number(btn.dataset.srcRow);
 activateReportAttachmentRow(projectIndex, folderIndex, sourceRow);
 openAttachmentPanel(sourceRow, {projectIndex, folderIndex});
 });
 });

 reportGridWrap.querySelectorAll('.report-source-col').forEach(el => {
 el.addEventListener('click', () => {
 const projectIndex = Number(el.dataset.srcProject);
 const folderIndex = Number(el.dataset.srcFolder);
 const sourceRow = Number(el.dataset.srcRow);
 openSheet(projectIndex, folderIndex, {scrollToRow: sourceRow});
 });
 });
}

function updateReportToolButtonStates(report){
 const config = ensureReportConfig(report);

 // Smartsheet-style report pills: show the active source-sheet count and visible report-column count directly.
 const sourceCount = config.sources.length;
 const hiddenCols = Array.isArray(config.hiddenCols) ? config.hiddenCols : [];
 const visibleColumnCount = getReportColumns().filter(c => !hiddenCols.includes(c.index)).length;
 const sheetLabel = sourceCount === 1 ? 'Sheet' : 'Sheets';
 const columnLabel = visibleColumnCount === 1 ? 'Column' : 'Columns';

 rptSourceBtn.classList.toggle('active', sourceCount > 0);
 rptSourceBtn.textContent = `▣ ${sourceCount} ${sheetLabel}`;

 rptColumnsBtn.classList.toggle('active', visibleColumnCount > 0);
 rptColumnsBtn.textContent = `▦ ${visibleColumnCount} ${columnLabel}`;

 rptFilterBtn.classList.toggle('active', !!config.filters.length);
 rptFilterBtn.textContent = config.filters.length ? `▽ Filter Criteria (${config.filters.length})` : '▽ Filter Criteria';

 rptGroupBtn.classList.toggle('active', config.groupCol !== null);
 rptGroupBtn.textContent = config.groupCol !== null ? '⊞ Group (1)' : '⊞ Group';

 rptSummarizeBtn.classList.toggle('active', !!config.summaries.length);
 rptSummarizeBtn.textContent = config.summaries.length ? `Σ Summarize (${config.summaries.length})` : 'Σ Summarize';

 rptSortBtn.classList.toggle('active', !!config.sorts.length);
 rptSortBtn.textContent = config.sorts.length ? `↕ Sort (${config.sorts.length})` : '↕ Sort';
}

function closeAllReportPopovers(){
 openReportPopover = null;
 [rptSourcePopover, rptColumnsPopover, rptFilterPopover, rptGroupPopover, rptSummarizePopover, rptSortPopover].forEach(p => {
  p.hidden = true;
  p.classList.remove('pop-fixed');
  p.style.left = '';
  p.style.top = '';
 });
}

function positionReportPopover(popover, anchor){
 if(!popover || !anchor) return;
 const rect = anchor.getBoundingClientRect();
 popover.classList.add('pop-fixed');
 const width = Math.max(320, Math.min(420, window.innerWidth - 24));
 popover.style.minWidth = width + 'px';
 popover.style.maxWidth = width + 'px';
 const left = Math.max(10, Math.min(rect.left, window.innerWidth - width - 10));
 const top = Math.max(10, Math.min(rect.bottom + 6, window.innerHeight - 420));
 popover.style.left = left + 'px';
 popover.style.top = top + 'px';
}

function openReportSourceChooser(){
 const report = getActiveReport();
 if(!report) return;
 closeAllReportPopovers();
 openReportPopover = 'source';
 rptSourcePopover.hidden = false;
 renderReportSourcePopover(report);
 positionReportPopover(rptSourcePopover, rptSourceBtn);
}

function toggleReportPopover(name){
 const report = getActiveReport();
 if(!report) return;
 if(openReportPopover === name){ closeAllReportPopovers(); return; }
 closeAllReportPopovers();
 openReportPopover = name;
 if(name === 'source'){
  openReportSourceChooser();
  return;
 }
 if(name === 'columns'){ rptColumnsPopover.hidden = false; renderReportColumnsPopover(report); positionReportPopover(rptColumnsPopover, rptColumnsBtn); }
 if(name === 'filter'){ rptFilterPopover.hidden = false; renderReportFilterPopover(report); positionReportPopover(rptFilterPopover, rptFilterBtn); }
 if(name === 'group'){ rptGroupPopover.hidden = false; renderReportGroupPopover(report); positionReportPopover(rptGroupPopover, rptGroupBtn); }
 if(name === 'summarize'){ rptSummarizePopover.hidden = false; renderReportSummarizePopover(report); positionReportPopover(rptSummarizePopover, rptSummarizeBtn); }
 if(name === 'sort'){ rptSortPopover.hidden = false; renderReportSortPopover(report); positionReportPopover(rptSortPopover, rptSortBtn); }
}

function renderReportSourcePopover(report){
 const config = ensureReportConfig(report);
 const groups = getAllReportSourceCandidates(activeProjectIndex, activeSheetContext.folderIndex);

 if(!groups.length){
 rptSourceList.innerHTML = '<div class="ss-pop-empty" style="padding:8px;">Chưa có Sheet nào khác để làm nguồn.</div>';
 return;
 }

 rptSourceList.innerHTML = groups.map(({projectIndex, projectName, items}) => {
 const allChecked = items.every(({folderIndex}) => isReportSourceSelected(config, projectIndex, folderIndex));
 const itemsHtml = items.map(({item, folderIndex}) => `
 <label class="ss-pop-list-item checkbox-row indent">
 <input type="checkbox" data-project-i="${projectIndex}" data-folder-i="${folderIndex}"
 ${isReportSourceSelected(config, projectIndex, folderIndex) ? 'checked' : ''}>
 <span>${escapeHtml(item.name)}</span>
 </label>
 `).join('');
 return `
 <div class="ss-pop-source-group">
 <label class="ss-pop-source-group-header">
 <input type="checkbox" data-select-all-project="${projectIndex}" ${allChecked ? 'checked' : ''}>
 <span>${escapeHtml(projectName)}</span>
 <span class="ss-pop-group-count">(${items.length} sheet)</span>
 </label>
 ${itemsHtml}
 </div>
 `;
 }).join('');

 rptSourceList.querySelectorAll('input[data-select-all-project]').forEach(cb => {
 cb.addEventListener('change', () => {
 const projectIndex = Number(cb.dataset.selectAllProject);
 const group = groups.find(g => g.projectIndex === projectIndex);
 if(!group) return;
 group.items.forEach(({folderIndex}) => {
 const already = isReportSourceSelected(config, projectIndex, folderIndex);
 if(cb.checked && !already){
 config.sources.push({projectIndex, folderIndex});
 } else if(!cb.checked && already){
 config.sources = config.sources.filter(s => !(s.projectIndex === projectIndex && s.folderIndex === folderIndex));
 }
 });
 renderReportSourcePopover(report);
 renderReportView();
 });
 });

 rptSourceList.querySelectorAll('input[data-folder-i]').forEach(cb => {
 cb.addEventListener('change', () => {
 const projectIndex = Number(cb.dataset.projectI);
 const folderIndex = Number(cb.dataset.folderI);
 if(cb.checked){
 if(!isReportSourceSelected(config, projectIndex, folderIndex)) config.sources.push({projectIndex, folderIndex});
 } else {
 config.sources = config.sources.filter(s => !(s.projectIndex === projectIndex && s.folderIndex === folderIndex));
 }
 renderReportSourcePopover(report);
 renderReportView();
 });
 });
}

function renderReportColumnsPopover(report){
 const config = ensureReportConfig(report);
 if(!Array.isArray(config.hiddenCols)) config.hiddenCols = [];
 const cols = getReportColumns();
 rptColumnsList.innerHTML = cols.map(c => `
 <label class="ss-pop-list-item checkbox-row">
 <input type="checkbox" data-col="${c.index}" ${!config.hiddenCols.includes(c.index) ? 'checked' : ''}>
 <span>${escapeHtml(c.label)}</span>
 </label>
 `).join('');
 rptColumnsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
 cb.addEventListener('change', () => {
 const colIndex = Number(cb.dataset.col);
 config.hiddenCols = config.hiddenCols.filter(x => x !== colIndex);
 if(!cb.checked) config.hiddenCols.push(colIndex);
 renderReportView();
 });
 });
}

function addReportFilterLevel(report, colIndex){
 const config = ensureReportConfig(report);
 if(config.filters.some(f => f.col === colIndex)) return;
 config.filters.push({col: colIndex, value: ''});
 renderReportView();
 renderReportFilterPopover(report);
}

function renderReportFilterPopover(report){
 const config = ensureReportConfig(report);
 const cols = getReportColumns();
 rptFilterEmptyLabel.style.display = config.filters.length ? 'none' : '';
 rptFilterClearBtn.style.display = config.filters.length ? '' : 'none';
 rptFilterChips.innerHTML = config.filters.map((f, i) => {
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
 rptFilterChips.querySelectorAll('input').forEach(inp => {
 inp.addEventListener('input', () => {
 config.filters[Number(inp.dataset.i)].value = inp.value;
 renderReportView();
 });
 });
 rptFilterChips.querySelectorAll('button[data-act="remove"]').forEach(btn => {
 btn.addEventListener('click', () => {
 config.filters.splice(Number(btn.dataset.i), 1);
 renderReportView();
 renderReportFilterPopover(report);
 });
 });
 rptFilterPicker.hidden = true;
}

function renderReportGroupPopover(report){
 const config = ensureReportConfig(report);
 const cols = getReportColumns();
 if(config.groupCol !== null){
 const col = cols.find(c => c.index === config.groupCol);
 const label = col ? col.label : columnName(config.groupCol);
 rptGroupChips.innerHTML = `
 <div class="ss-pop-chip">
 <span class="ss-chip-label">Nhóm theo: <strong>${escapeHtml(label)}</strong></span>
 <button data-act="remove" title="Xoá">✕</button>
 </div>
 `;
 rptGroupChips.querySelector('button[data-act="remove"]').addEventListener('click', () => {
 config.groupCol = null;
 renderReportView();
 renderReportGroupPopover(report);
 });
 rptGroupAddBtn.style.display = 'none';
 } else {
 rptGroupChips.innerHTML = '';
 rptGroupAddBtn.style.display = '';
 }
 rptGroupClearBtn.style.display = config.groupCol !== null ? '' : 'none';
 rptGroupPicker.hidden = true;
}

function renderReportSummarizePopover(report){
 const config = ensureReportConfig(report);
 const cols = getReportColumns();
 rptSummarizeChips.innerHTML = config.summaries.map((s, i) => {
 const col = cols.find(c => c.index === s.col);
 const label = col ? col.label : columnName(s.col);
 const options = Object.keys(SUMMARY_FN_LABEL).map(fn =>
 `<option value="${fn}" ${fn === s.fn ? 'selected' : ''}>${SUMMARY_FN_LABEL[fn]}</option>`
 ).join('');
 return `
 <div class="ss-pop-chip">
 <span class="ss-chip-label">${escapeHtml(label)}:</span>
 <select class="ss-chip-fn" data-i="${i}">${options}</select>
 <button data-act="remove" data-i="${i}" title="Xoá">✕</button>
 </div>
 `;
 }).join('');
 rptSummarizeChips.querySelectorAll('select').forEach(sel => {
 sel.addEventListener('change', () => {
 config.summaries[Number(sel.dataset.i)].fn = sel.value;
 renderReportView();
 });
 });
 rptSummarizeChips.querySelectorAll('button[data-act="remove"]').forEach(btn => {
 btn.addEventListener('click', () => {
 config.summaries.splice(Number(btn.dataset.i), 1);
 renderReportView();
 renderReportSummarizePopover(report);
 });
 });
 rptSummarizeClearBtn.style.display = config.summaries.length ? '' : 'none';
 rptSummarizePicker.hidden = true;
}

function renderReportSortPopover(report){
 const config = ensureReportConfig(report);
 const cols = getReportColumns();
 rptSortChips.innerHTML = config.sorts.map((s, i) => {
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
 rptSortChips.querySelectorAll('button').forEach(btn => {
 const i = Number(btn.dataset.i);
 btn.addEventListener('click', () => {
 if(btn.dataset.act === 'dir'){
 config.sorts[i].dir = config.sorts[i].dir === 'asc' ? 'desc' : 'asc';
 renderReportView();
 renderReportSortPopover(report);
 } else {
 config.sorts.splice(i, 1);
 renderReportView();
 renderReportSortPopover(report);
 }
 });
 });
 rptSortClearBtn.style.display = config.sorts.length ? '' : 'none';
 rptSortPicker.hidden = true;
}

function setReportRowHeight(value){
 const report = getActiveReport();
 if(!report) return;
 const height = Math.max(22, Math.min(96, Number(value) || 24));
 const config = ensureReportConfig(report);
 config.rowHeight = height;
 config.rowHeightUserSet = true;
 if(rptRowHeightSelect) rptRowHeightSelect.value = String(height);
 renderReportView();
 saveProjectLocalBackup();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
}
