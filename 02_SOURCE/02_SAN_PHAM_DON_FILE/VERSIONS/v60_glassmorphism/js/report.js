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
const rptSourceCancelBtn = document.getElementById('rptSourceCancelBtn');
const rptSourceOkBtn = document.getElementById('rptSourceOkBtn');
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
let reportSourceDraft = null;
let isSelectingReportRange = false;
let reportRangeAnchor = null;
let reportRangeEnd = null;

function refreshReportAttachmentBadge(sourceContext, rowIndex){
 if(!sourceContext || !reportGridWrap) return;
 const sheet = PROJECT_FOLDERS[sourceContext.projectIndex]?.[sourceContext.folderIndex];
 if(!sheet) return;
 const files = ensureSheetAttachments(sheet)[rowIndex] || [];
 const btn = reportGridWrap.querySelector('.report-attach-btn[data-src-project="'+sourceContext.projectIndex+'"][data-src-folder="'+sourceContext.folderIndex+'"][data-src-row="'+rowIndex+'"]');
 if(!btn) return;
 btn.classList.toggle('has-files', !!files.length);
 btn.innerHTML = files.length ? '📎<span>'+files.length+'</span>' : '📎';
 btn.title = files.length ? files.length+' file đính kèm' : 'Đính kèm file cho dòng này';
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

function isReportSourceSelected(draftConfig, projectIndex, folderIndex){
 return draftConfig.sources.some(s => s.projectIndex === projectIndex && s.folderIndex === folderIndex);
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
   if(isBlankReportSourceRow(row)) continue;
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
 rememberRecentProject(projectIndex);
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
 rememberRecentProject(activeProjectIndex);
 const config = ensureReportConfig(report);
 const reportRowHeight = Math.max(22, Math.min(96, Number(config.rowHeight) || 24));
 if(rptRowHeightSelect) rptRowHeightSelect.value = String(reportRowHeight);
 updateReportToolButtonStates(report);

 if(!config.sources.length){
  reportGridWrap.innerHTML = '<div class="report-empty-state">Báo cáo chưa có nguồn dữ liệu.<br>Bấm <strong>🗂 Nguồn</strong> ở trên để chọn Sheet.</div>';
  return;
 }

 const rows = buildReportRows(report);
 const cols = getReportColumns().filter(c =>
  c.index !== 1 &&
  (!config.hiddenCols || !config.hiddenCols.includes(c.index))
 );

 if(!rows.length){
  reportGridWrap.innerHTML = '<div class="report-empty-state">Không có dòng nào khớp với Lọc/Tìm kiếm.</div>';
  return;
 }

 const groups = groupReportRows(report, rows);
 const reportColKeyPrefix = 'report:'+activeSheetContext.projectIndex+':'+activeSheetContext.folderIndex;
 const rowNoColWidth = 44;
 const attachColKey = reportColKeyPrefix+':attach';
 const attachColWidth = 34;
 const reportDataColWidths = cols.map(c => {
  const key = reportColKeyPrefix+':c'+c.index;
  return getStoredColWidth(key, getCompactReportColWidth(c));
 });
 const reportColWidths = [rowNoColWidth, attachColWidth].concat(reportDataColWidths);
 const reportTableTotalWidth = reportColWidths.reduce((sum, w) => sum + w, 0);

 let bodyHtml = '';
 const renderDataRow = (item, idx) => {
  const cellsHtml = cols.map(c => {
   const value = item.cells[c.index];
   const escaped = escapeHtml(value);
   return '<td class="sheet-data-cell"><div class="sheet-cell report-editable-cell" contenteditable="true" spellcheck="false" data-src-project="'+item.sourceProjectIndex+'" data-src-folder="'+item.sourceFolderIndex+'" data-src-row="'+item.sourceRow+'" data-col="'+c.index+'" data-original-value="'+escaped+'">'+escaped+'</div></td>';
  }).join('');
  const sourceSheet = PROJECT_FOLDERS[item.sourceProjectIndex]?.[item.sourceFolderIndex];
  const fileCount = sourceSheet ? (ensureSheetAttachments(sourceSheet)[item.sourceRow] || []).length : 0;
  const attachButton = '<button class="report-attach-btn '+(fileCount?'has-files':'')+'" type="button" title="'+(fileCount?fileCount+' file đính kèm':'Đính kèm file')+'" data-src-project="'+item.sourceProjectIndex+'" data-src-folder="'+item.sourceFolderIndex+'" data-src-row="'+item.sourceRow+'">📎'+(fileCount?'<span>'+fileCount+'</span>':'')+'</button>';
  return '<tr class="report-data-row" data-src-project="'+item.sourceProjectIndex+'" data-src-folder="'+item.sourceFolderIndex+'" data-src-row="'+item.sourceRow+'"><td class="sheet-data-cell report-row-number-cell">'+(idx+1)+'</td><td class="sheet-data-cell report-attach-cell">'+attachButton+'</td>'+cellsHtml+'</tr>';
 };

 const renderSummaryRow = (rowsInGroup, label) => {
  if(!config.summaries.length) return '';
  const cellsHtml = cols.map((c, index) => {
   const s = config.summaries.find(s => s.col === c.index);
   const value = s ? computeSummary(rowsInGroup, c.index, s.fn) : '';
   const summaryText = s && value !== '' ? SUMMARY_FN_LABEL[s.fn]+': '+value : '';
   const text = index === 0 ? [label, summaryText].filter(Boolean).join(' · ') : summaryText;
   return '<td><div>'+escapeHtml(text)+'</div></td>';
  }).join('');
  return '<tr class="report-summary-row"><td class="report-row-number-summary"></td><td class="report-attach-summary-cell"></td>'+cellsHtml+'</tr>';
 };

 if(groups.length === 1 && groups[0].value === null){
  bodyHtml = renderSummaryRow(rows, 'Tổng cộng ('+rows.length+' dòng)') + groups[0].rows.map((r, i) => renderDataRow(r, i)).join('');
 } else {
  bodyHtml = renderSummaryRow(rows, 'Tổng cộng') + groups.map(g => {
   const groupHeader = '<tr class="report-group-row"><td colspan="'+(cols.length + 2)+'">'+escapeHtml(g.value)+' — '+g.rows.length+' dòng</td></tr>';
   return groupHeader + g.rows.map((r, i) => renderDataRow(r, i)).join('') + renderSummaryRow(g.rows, 'Tổng nhóm');
  }).join('');
 }

 reportGridWrap.innerHTML = '<table class="grid-sheet-table" style="width:'+reportTableTotalWidth+'px;--report-row-height:'+reportRowHeight+'px"><colgroup><col style="width:'+rowNoColWidth+'px"><col data-col-key="'+attachColKey+'" style="width:'+attachColWidth+'px">'+
  cols.map((c, i) => '<col data-col-key="'+reportColKeyPrefix+':c'+c.index+'" style="width:'+reportDataColWidths[i]+'px">').join('')+
  '</colgroup><thead><tr><th class="sheet-col-head report-row-number-head" style="width:'+rowNoColWidth+'px">#</th><th class="sheet-col-head report-attach-head" data-col-key="'+attachColKey+'" style="width:'+attachColWidth+'px">📎</th>'+
  cols.map((c, i) => '<th class="sheet-col-head" data-col-key="'+reportColKeyPrefix+':c'+c.index+'" style="width:'+reportDataColWidths[i]+'px">'+escapeHtml(c.label)+'</th>').join('')+
  '</tr></thead><tbody>'+bodyHtml+'</tbody></table>';

 wireReportGridInteractions();
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
   if(e.button !== 0) return;
   e.preventDefault();
   const pos = getReportCellPosition(cell);
   if(pos.rowIndex < 0 || pos.cellIndex < 0) return;
   cell.classList.add('active-cell');
   cell.parentElement?.classList.add('report-active-cell');
  });
  cell.addEventListener('dblclick', () => {
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
   if(newValue !== cell.dataset.originalValue){
    updateReportSourceCell(projectIndex, folderIndex, sourceRow, colIndex, newValue);
    renderReportView();
   }
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
});

function activateReportAttachmentRow(projectIndex, folderIndex, sourceRow){
 reportGridWrap.querySelectorAll('.report-attach-btn.active').forEach(active => active.classList.remove('active'));
 const btn = reportGridWrap.querySelector('.report-attach-btn[data-src-project="'+projectIndex+'"][data-src-folder="'+folderIndex+'"][data-src-row="'+sourceRow+'"]');
 if(btn) btn.classList.add('active');
}

function getReportCellPosition(cell){
 const row = cell.closest('.report-data-row');
 const rows = Array.from(reportGridWrap.querySelectorAll('.report-data-row'));
 return {rowIndex: rows.indexOf(row), cellIndex: cell.parentElement ? cell.parentElement.cellIndex : -1};
}

function updateReportToolButtonStates(report){
 const config = ensureReportConfig(report);
 const sourceCount = config.sources.length;
 rptSourceBtn.classList.toggle('active', sourceCount > 0);
 rptSourceBtn.innerHTML = '▣ '+sourceCount+' Sheet'+(sourceCount !== 1 ? 's' : '');
 rptFilterBtn.classList.toggle('active', !!config.filters.length);
 rptGroupBtn.classList.toggle('active', config.groupCol !== null);
 rptSummarizeBtn.classList.toggle('active', !!config.summaries.length);
 rptSortBtn.classList.toggle('active', !!config.sorts.length);
}

function closeAllReportPopovers(){
 openReportPopover = null;
 [rptSourcePopover, rptColumnsPopover, rptFilterPopover, rptGroupPopover, rptSummarizePopover, rptSortPopover].forEach(p => { p.hidden = true; });
}

function openReportSourceChooser(){
 const report = getActiveReport();
 if(!report) return;
 closeAllReportPopovers();
 const config = ensureReportConfig(report);
 reportSourceDraft = config.sources.map(source => ({...source}));
 openReportPopover = 'source';
 rptSourcePopover.hidden = false;
 renderReportSourcePopover(report);
}

function toggleReportPopover(name){
 const report = getActiveReport();
 if(!report) return;
 if(openReportPopover === name){ closeAllReportPopovers(); return; }
 closeAllReportPopovers();
 openReportPopover = name;
 if(name === 'source') openReportSourceChooser();
 if(name === 'columns'){ rptColumnsPopover.hidden = false; renderReportColumnsPopover(report); }
 if(name === 'filter'){ rptFilterPopover.hidden = false; renderReportFilterPopover(report); }
 if(name === 'group'){ rptGroupPopover.hidden = false; renderReportGroupPopover(report); }
 if(name === 'summarize'){ rptSummarizePopover.hidden = false; renderReportSummarizePopover(report); }
 if(name === 'sort'){ rptSortPopover.hidden = false; renderReportSortPopover(report); }
}

function renderReportSourcePopover(report){
 const draftConfig = {sources:reportSourceDraft || []};
 const groups = getAllReportSourceCandidates(activeProjectIndex, activeSheetContext.folderIndex);
 if(!groups.length){
  rptSourceList.innerHTML = '<div class="ss-pop-empty">Chưa có Sheet nào khác để làm nguồn.</div>';
  return;
 }
 rptSourceList.innerHTML = groups.map(({projectIndex, projectName, items}) => {
  const allChecked = items.every(({folderIndex}) => isReportSourceSelected(draftConfig, projectIndex, folderIndex));
  return '<div class="ss-pop-source-group"><label class="ss-pop-source-group-header"><input type="checkbox" data-select-all-project="'+projectIndex+'" '+(allChecked?'checked':'')+'> '+escapeHtml(projectName)+' <span>('+items.length+' sheet)</span></label>'+
   items.map(({item, folderIndex}) => '<label class="ss-pop-list-item"><input type="checkbox" data-project-i="'+projectIndex+'" data-folder-i="'+folderIndex+'" '+(isReportSourceSelected(draftConfig, projectIndex, folderIndex)?'checked':'')+'> '+escapeHtml(item.name)+'</label>').join('')+
   '</div>';
 }).join('');
}

function renderReportColumnsPopover(report){
 const config = ensureReportConfig(report);
 if(!Array.isArray(config.hiddenCols)) config.hiddenCols = [];
 const cols = getReportColumns();
 rptColumnsList.innerHTML = cols.map(c => '<label class="ss-pop-list-item"><input type="checkbox" data-col="'+c.index+'" '+(config.hiddenCols.includes(c.index)?'':'checked')+'> '+escapeHtml(c.label)+'</label>').join('');
 rptColumnsList.querySelectorAll('input').forEach(cb => {
  cb.addEventListener('change', () => {
   const colIndex = Number(cb.dataset.col);
   config.hiddenCols = config.hiddenCols.filter(x => x !== colIndex);
   if(!cb.checked) config.hiddenCols.push(colIndex);
   renderReportView();
  });
 });
}

function renderReportFilterPopover(report){
 const config = ensureReportConfig(report);
 rptFilterEmptyLabel.style.display = config.filters.length ? 'none' : '';
 rptFilterClearBtn.style.display = config.filters.length ? '' : 'none';
 const cols = getReportColumns();
 rptFilterChips.innerHTML = config.filters.map((f, i) => {
  const col = cols.find(c => c.index === f.col);
  const label = col ? col.label : columnName(f.col);
  return '<div class="ss-pop-chip"><span>'+escapeHtml(label)+':</span> <input type="text" data-i="'+i+'" value="'+escapeHtml(f.value)+'"> <button data-remove="'+i+'">✕</button></div>';
 }).join('');
 rptFilterChips.querySelectorAll('input').forEach(inp => {
  inp.addEventListener('input', () => {
   config.filters[Number(inp.dataset.i)].value = inp.value;
   renderReportView();
  });
 });
 rptFilterChips.querySelectorAll('button[data-remove]').forEach(btn => {
  btn.addEventListener('click', () => {
   config.filters.splice(Number(btn.dataset.remove), 1);
   renderReportView();
   renderReportFilterPopover(report);
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

rptFilterAddBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 addReportFilterLevel(report, 2);
});

rptFilterClearBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 ensureReportConfig(report).filters = [];
 renderReportView();
 renderReportFilterPopover(report);
});

rptFilterPickerSearch.addEventListener('input', () => {
 const report = getActiveReport();
 if(!report) return;
});

rptSourceCancelBtn.addEventListener('click', () => closeAllReportPopovers());

rptSourceOkBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 const config = ensureReportConfig(report);
 config.sources = (reportSourceDraft || []).map(source => ({...source}));
 closeAllReportPopovers();
 renderReportView();
 saveProjectLocalBackup();
});

rptColumnsBtn.addEventListener('click', () => toggleReportPopover('columns'));
rptFilterBtn.addEventListener('click', () => toggleReportPopover('filter'));
rptGroupBtn.addEventListener('click', () => toggleReportPopover('group'));
rptSummarizeBtn.addEventListener('click', () => toggleReportPopover('summarize'));
rptSortBtn.addEventListener('click', () => toggleReportPopover('sort'));

rptSearchInput.addEventListener('input', () => {
 const report = getActiveReport();
 if(!report) return;
 ensureReportConfig(report).searchTerm = rptSearchInput.value;
 renderReportView();
});

if(rptRowHeightSelect) rptRowHeightSelect.addEventListener('change', () => {
 const report = getActiveReport();
 if(!report) return;
 const height = Math.max(22, Math.min(96, Number(rptRowHeightSelect.value) || 24));
 ensureReportConfig(report).rowHeight = height;
 renderReportView();
 saveProjectLocalBackup();
});

document.addEventListener('keydown', (e) => {
 if(e.key === 'Escape' && openReportPopover) closeAllReportPopovers();
});
