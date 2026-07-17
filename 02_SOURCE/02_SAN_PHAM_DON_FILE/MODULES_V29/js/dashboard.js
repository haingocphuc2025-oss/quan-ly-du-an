function hideDashboardView(){
 const dashView = document.getElementById('dashboardView');
 if(!dashView) return;
 dashView.classList.remove('active');
 dashView.style.display = 'none';
}

function openDashboard(projectIndex, folderIndex){
  var dashItem = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
  if(!dashItem) return;
  rememberRecentProject(projectIndex);
  ensureDashboardConfig(dashItem);
  activeProjectIndex = projectIndex;
  activeSheetContext = {projectIndex:projectIndex, folderIndex:folderIndex};
  updateBrowseBreadcrumb(projectIndex);
  appShell.classList.remove('sheet-nav-collapsed');
  document.getElementById('detailTitle').textContent = getWorkspaceOpenTitle(dashItem);
  var dashView = document.getElementById('dashboardView');
  var gsv = document.getElementById('gridSheetView');
  var rv = document.getElementById('reportView');
  var db = document.querySelector('#screen-detail > .detail-body');
  if(db) db.style.display = 'none';
  if(gsv) gsv.style.display = 'none';
  if(rv) rv.style.display = 'none';
  if(typeof closeAllReportPopovers === 'function') closeAllReportPopovers();
  renderDashboard(dashItem, projectIndex, folderIndex);
  if(dashView){
    dashView.style.display = '';
    dashView.classList.add('active');
  }
  document.getElementById('dashTitle').textContent = getWorkspaceOpenTitle(dashItem);
  if(typeof pushNavState === 'function') pushNavState();
  document.getElementById('screen-list').style.display = 'flex';
  document.getElementById('screen-detail').style.display = 'flex';
  main.classList.add('detail-open','sheet-open');
}

function ensureDashboardConfig(dashItem){
  if(!dashItem._dashboardConfig){
    dashItem._dashboardConfig = {
      id:'dash_'+Date.now(), name:dashItem.name||'New Dashboard',
      grid:{cols:12,gap:14}, widgets:[]
    };
  }
}

function renderDashboard(dashItem, projectIndex, folderIndex){
  var config = dashItem._dashboardConfig;
  if(!config) return;
  var grid = document.getElementById('dashboardGrid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!config.widgets || config.widgets.length===0){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#9CA3AF;"><p style="font-size:16px;margin:0 0 8px;">Dashboard trống</p><p style="font-size:13px;margin:0;">Bấm "＋ Thêm" để thêm widget đầu tiên.</p></div>';
    return;
  }
  config.widgets.forEach(function(w,idx){
    var span = w.span||6; var cs = 'dash-span-'+Math.min(Math.max(1,span),12);
    var card = document.createElement('div');
    card.className = 'dash-card '+cs; card.dataset.widgetId = w.id;
    card.draggable = !!config.editMode;
    if(config.editMode) card.classList.add('dash-card-editing');
    if(w.type==='TITLE') renderDashTitle(card,w);
    else if(w.type==='METRIC') renderDashMetric(card,w,projectIndex,folderIndex);
    else if(w.type==='SHORTCUT') renderDashShortcut(card,w);
    else if(w.type==='REPORT') renderDashReport(card,w,projectIndex,folderIndex);
    else if(w.type==='CHART') renderDashChartPlaceholder(card,w);
    else card.innerHTML = '<div class="dash-card-body"><p style="color:#9CA3AF;font-size:12px;">Loại widget: '+(w.type||'?')+'</p></div>';
    if(config.editMode){ var tools=document.createElement('div'); tools.className='dash-widget-tools'; tools.innerHTML='<button type="button" data-dash-edit="'+w.id+'">⚙</button><button type="button" data-dash-remove="'+w.id+'">×</button>'; card.appendChild(tools); }
    grid.appendChild(card);
  });
}

function renderDashTitle(card,w){
  var c = w.config||{};
  if(c.style==='banner'){
    card.innerHTML = '<div class="dash-title-banner"><h2>'+escHtml(c.title||'')+'</h2>'+(c.sub?'<p>'+escHtml(c.sub)+'</p>':'')+'</div>';
  } else {
    card.innerHTML = '<div class="dash-title-plain" style="padding:14px;"><h2>'+escHtml(c.title||'')+'</h2>'+(c.sub?'<p>'+escHtml(c.sub)+'</p>':'')+'</div>';
  }
}

function renderDashMetric(card,w,projectIndex,folderIndex){
  var c = w.config||{}; var tone = c.tone||'info';
  var label = c.label||''; var unit = c.unit||'';
  card.innerHTML = '<div class="dash-metric dash-metric-tone-'+tone+'"><div class="dash-metric-value">--</div>'+(label?'<div class="dash-metric-label">'+escHtml(label)+'</div>':'')+'</div>';
  if(w.source && typeof getActiveProjectName==='function'){
    var pn = getActiveProjectName();
    loadSheetDataFromWebApp(pn,w.source).then(function(saved){
      if(saved&&saved.cells){
        var val = computeAggregate(saved.cells,c.col,c.agg||'count');
        card.innerHTML = '<div class="dash-metric dash-metric-tone-'+tone+'"><div class="dash-metric-value">'+escHtml(String(val))+(unit?'<span class="dash-metric-unit">'+escHtml(unit)+'</span>':'')+'</div>'+(label?'<div class="dash-metric-label">'+escHtml(label)+'</div>':'')+'</div>';
      }
    }).catch(function(){});
  }
}

function computeAggregate(cells,colKey,agg){
  if(!cells||cells.length<2) return 0;
  var h = cells[0], ci = -1;
  if(colKey!=null){
    for(var i=0;i<h.length;i++){ if(String(h[i])===String(colKey)||String(i)===String(colKey)){ci=i;break;} }
  }
  if(ci<0) return cells.length-1;
  var vals = [];
  for(var r=1;r<cells.length;r++){
    var v = cells[r][ci]; if(v===''||v==null) continue;
    var n = parseFloat(String(v).replace(/[^0-9.-]/g,''));
    if(!isNaN(n)) vals.push(n);
  }
  if(!vals.length) return 0;
  if(agg==='sum') return vals.reduce(function(a,b){return a+b;},0);
  if(agg==='avg') return Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length*100)/100;
  if(agg==='min') return Math.min.apply(null,vals);
  if(agg==='max') return Math.max.apply(null,vals);
  return vals.length;
}

function renderDashShortcut(card,w){
  var links = (w.config&&w.config.links)||[];
  if(!links.length){
    card.innerHTML = '<div class="dash-card-header">Shortcuts</div><div class="dash-card-body"><p style="color:#9CA3AF;font-size:12px;">Chưa có shortcut.</p></div>';
    return;
  }
  var html = '<div class="dash-card-header">Shortcuts</div><div class="dash-card-body"><ul class="dash-shortcut-list">';
  links.forEach(function(lk){
    html += '<li class="dash-shortcut-item" data-target="'+escHtml(lk.target||'')+'" data-type="'+escHtml(lk.type||'')+'"><span class="dash-shortcut-icon">'+(lk.icon||'📄')+'</span>'+escHtml(lk.label||'')+'</li>';
  });
  html += '</ul></div>';
  card.innerHTML = html;
  card.querySelectorAll('.dash-shortcut-item').forEach(function(el){
    el.addEventListener('click',function(){
      var t=el.dataset.target, tp=el.dataset.type;
      if(tp==='url'&&t) window.open(t,'_blank');
      else if(t){ /* try opening as sheet - future */ }
    });
  });
}

function renderDashReport(card,w,projectIndex,folderIndex){
  var c = w.config||{}; var src = w.source; var limit = c.limit||10; var cols = c.columns||['all'];
  card.innerHTML = '<div class="dash-card-header">'+escHtml(c.title||'Report')+'</div><div class="dash-card-body"><p style="color:#9CA3AF;font-size:12px;">Đang tải...</p></div>';
  if(src&&typeof getActiveProjectName==='function'){
    var pn = getActiveProjectName();
    loadSheetDataFromWebApp(pn,src).then(function(saved){
      if(saved&&saved.cells) renderDashReportTable(card,saved.cells,limit,cols);
      else card.querySelector('.dash-card-body').innerHTML = '<p style="color:#9CA3AF;font-size:12px;">Không có dữ liệu.</p>';
    }).catch(function(){ card.querySelector('.dash-card-body').innerHTML='<p style="color:#D64545;font-size:12px;">Lỗi tải.</p>'; });
  }
}

function renderDashReportTable(card,cells,limit,columns){
  if(!cells||cells.length<2){ card.querySelector('.dash-card-body').innerHTML='<p style="color:#9CA3AF;font-size:12px;">Không có dữ liệu.</p>'; return; }
  var h=cells[0], rows=cells.slice(1,Math.min(1+limit,cells.length)), ci=[];
  if(columns[0]==='all'){ for(var i=0;i<h.length;i++) ci.push(i); }
  else{
    columns.forEach(function(c){
      for(var i=0;i<h.length;i++){ if(String(h[i])===String(c)){ci.push(i);break;} }
    });
    if(!ci.length){ for(var i=0;i<Math.min(4,h.length);i++) ci.push(i); }
  }
  var html='<table class="dash-report-table"><thead><tr>';
  ci.forEach(function(i){ html+='<th>'+escHtml(String(h[i]||''))+'</th>'; });
  html+='</tr></thead><tbody>';
  rows.forEach(function(row){
    html+='<tr>';
    ci.forEach(function(i){
      var v=row[i]!=null?String(row[i]):'';
      html+='<td>'+(isStatusPill(v)?statusPillHtml(v):escHtml(v))+'</td>';
    });
    html+='</tr>';
  });
  html+='</tbody></table>';
  card.querySelector('.dash-card-body').innerHTML=html;
}

function renderDashChartPlaceholder(card,w){
  var t = (w.config&&w.config.title&&w.config.title.text)||'Chart';
  card.innerHTML = '<div class="dash-card-header">'+escHtml(t)+'</div><div class="dash-card-body"><div class="dash-chart-placeholder">📊 Chart engine D2</div></div>';
}

var dashBackBtn = document.getElementById('dashBackBtn');

var dashRefreshBtn = document.getElementById('dashRefreshBtn');

var dashAddWidgetBtn = document.getElementById('dashAddWidgetBtn');

var dashEditBtn = document.getElementById('dashEditBtn');

if(dashBackBtn){
  dashBackBtn.addEventListener('click', function(){
    if(activeProjectIndex !== null) openDetail(activeProjectIndex);
  });
}

if(dashRefreshBtn){
  dashRefreshBtn.addEventListener('click', function(){
    var dashItem = getDashboardItem();
    if(dashItem) renderDashboard(dashItem, activeProjectIndex, activeSheetContext?.folderIndex);
  });
}

if(dashAddWidgetBtn){
  dashAddWidgetBtn.addEventListener('click', function(){
    showAddWidgetDialog();
  });
}

function getDashboardItem(){
  var ctx = activeSheetContext;
  if(!ctx) return null;
  return PROJECT_FOLDERS[ctx.projectIndex]?.[ctx.folderIndex] || null;
}

function closeDashboardDialog(){ document.querySelector('.dashboard-config-backdrop')?.remove(); }

function showAddWidgetDialog(){
 var dashItem=getDashboardItem(); if(!dashItem) return; ensureDashboardConfig(dashItem);
 closeDashboardDialog(); var back=document.createElement('div'); back.className='attachment-preview-backdrop dashboard-config-backdrop';
 var types=[['TITLE','Tiêu đề'],['METRIC','Chỉ số'],['SHORTCUT','Lối tắt'],['REPORT','Báo cáo'],['CHART','Biểu đồ']];
 back.innerHTML=`<div class="attachment-preview-dialog" role="dialog" aria-modal="true" aria-label="Chọn widget" style="max-width:640px;height:auto"><div class="attachment-preview-head"><strong>Thêm widget</strong><button class="attachment-preview-close" type="button">×</button></div><div class="attachment-preview-body" style="padding:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${types.map(t=>`<button type="button" class="dash-widget-choice" data-widget-type="${t[0]}" style="padding:18px;text-align:left"><strong>${t[1]}</strong><br><small>${t[0]}</small></button>`).join('')}</div></div>`;
 document.body.appendChild(back); back.querySelector('.attachment-preview-close').onclick=closeDashboardDialog;
 back.querySelectorAll('[data-widget-type]').forEach(btn=>btn.onclick=()=>{ var type=btn.dataset.widgetType,cfg=dashItem._dashboardConfig; var w={id:'w_'+Date.now(),type,span:type==='TITLE'?12:(type==='METRIC'?3:(type==='SHORTCUT'?4:6)),config:buildDefaultWidgetConfig(type),source:null}; cfg.widgets.push(w); saveDashboardConfig(dashItem); closeDashboardDialog(); renderDashboard(dashItem,activeProjectIndex,activeSheetContext?.folderIndex); showWidgetConfigDialog(w.id); });
}

function saveDashboardConfig(dashItem){ saveProjectLocalBackup(); if(typeof saveCurrentProjectStateSilently==='function') saveCurrentProjectStateSilently(); }

function showWidgetConfigDialog(widgetId){
 var dashItem=getDashboardItem(); if(!dashItem) return; var w=dashItem._dashboardConfig.widgets.find(x=>x.id===widgetId); if(!w)return; var c=w.config||{}; closeDashboardDialog();
 var back=document.createElement('div'); back.className='attachment-preview-backdrop dashboard-config-backdrop';
 back.innerHTML=`<div class="attachment-preview-dialog" role="dialog" aria-modal="true" aria-label="Cấu hình widget" style="max-width:680px;height:auto;max-height:90vh"><div class="attachment-preview-head"><strong>Cấu hình ${w.type}</strong><button class="attachment-preview-close" type="button">×</button></div><div class="attachment-preview-body" style="padding:18px;overflow:auto"><label>Tiêu đề<input data-cfg="title" value="${escHtml(c.title?.text||c.title||c.label||'')}" style="width:100%"></label><label>Độ rộng (1–12)<input data-cfg="span" type="number" min="1" max="12" value="${w.span||6}" style="width:100%"></label><label>Nguồn dữ liệu<input data-cfg="source" value="${escHtml(w.source||'')}" style="width:100%"></label>${w.type==='CHART'?`<label>Loại biểu đồ<select data-cfg="chartType"><option value="bar">Bar</option><option value="column">Column</option><option value="line">Line</option><option value="donut">Donut</option></select></label><label>Cột category<input data-cfg="category" value="${escHtml(c.categoryColumn||'')}"></label><label>Cột series (phân cách dấu phẩy)<input data-cfg="series" value="${escHtml((c.seriesColumns||[]).join(','))}"></label><label>Legend<select data-cfg="legend"><option value="right">Right</option><option value="bottom">Bottom</option><option value="none">Ẩn</option></select></label><label>Hành vi click<select data-cfg="onClick"><option value="none">Không làm gì</option><option value="openSource">Mở nguồn</option><option value="url">Mở URL</option></select></label>`:''}<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px"><button type="button" class="ss-tool-btn dash-cancel">Hủy</button><button type="button" class="ss-tool-btn dash-save">Lưu</button></div></div></div>`;
 document.body.appendChild(back); back.querySelector('.attachment-preview-close').onclick=closeDashboardDialog; back.querySelector('.dash-cancel').onclick=closeDashboardDialog;
 back.querySelector('.dash-save').onclick=()=>{ var get=k=>back.querySelector(`[data-cfg="${k}"]`)?.value; w.span=Math.max(1,Math.min(12,Number(get('span'))||6)); w.source=get('source')||null; var title=get('title')||''; if(w.type==='CHART'){c.title={text:title,show:true};c.type=get('chartType')||'bar';c.categoryColumn=get('category')||null;c.seriesColumns=(get('series')||'').split(',').map(s=>s.trim()).filter(Boolean);c.legend={position:get('legend')||'right'};c.onClick=get('onClick')||'none';} else if(w.type==='TITLE')c.title=title;else c.label=title; w.config=c; saveDashboardConfig(dashItem); closeDashboardDialog(); renderDashboard(dashItem,activeProjectIndex,activeSheetContext?.folderIndex); };
}

function buildDefaultWidgetConfig(type){
  if(type==='TITLE') return {title:'Tiêu đề', sub:'Mô tả', style:'default'};
  if(type==='METRIC') return {label:'Số lượng', agg:'count', tone:'info', col:null, unit:''};
  if(type==='SHORTCUT') return {links:[]};
  if(type==='REPORT') return {title:'Report', limit:10, columns:['all']};
  if(type==='CHART') return {title:{text:'Chart'}, type:'bar', source:null};
  return {};
}

if(dashEditBtn) dashEditBtn.addEventListener('click',function(){ var d=getDashboardItem(); if(!d)return; ensureDashboardConfig(d); d._dashboardConfig.editMode=!d._dashboardConfig.editMode; dashEditBtn.classList.toggle('active',d._dashboardConfig.editMode); saveDashboardConfig(d); renderDashboard(d,activeProjectIndex,activeSheetContext?.folderIndex); });

var dashboardGridEl=document.getElementById('dashboardGrid');

var draggedDashWidget=null;

if(dashboardGridEl){
 dashboardGridEl.addEventListener('click',e=>{var edit=e.target.closest('[data-dash-edit]'),remove=e.target.closest('[data-dash-remove]');if(edit)showWidgetConfigDialog(edit.dataset.dashEdit);if(remove){var d=getDashboardItem();if(d&&confirm('Xóa widget này?')){d._dashboardConfig.widgets=d._dashboardConfig.widgets.filter(w=>w.id!==remove.dataset.dashRemove);saveDashboardConfig(d);renderDashboard(d,activeProjectIndex,activeSheetContext?.folderIndex);}}});
 dashboardGridEl.addEventListener('dragstart',e=>{var card=e.target.closest('.dash-card[draggable="true"]');if(card){draggedDashWidget=card.dataset.widgetId;e.dataTransfer.effectAllowed='move';}});
 dashboardGridEl.addEventListener('dragover',e=>{if(draggedDashWidget)e.preventDefault();});
 dashboardGridEl.addEventListener('drop',e=>{e.preventDefault();var target=e.target.closest('.dash-card');var d=getDashboardItem();if(!target||!d||target.dataset.widgetId===draggedDashWidget)return;var ws=d._dashboardConfig.widgets,a=ws.findIndex(w=>w.id===draggedDashWidget),b=ws.findIndex(w=>w.id===target.dataset.widgetId);if(a<0||b<0)return;var moved=ws.splice(a,1)[0];ws.splice(b,0,moved);saveDashboardConfig(d);renderDashboard(d,activeProjectIndex,activeSheetContext?.folderIndex);draggedDashWidget=null;});
}

backFromReport.addEventListener('click', () => {
 if(activeProjectIndex !== null) openDetail(activeProjectIndex);
});

rptSourceBtn.addEventListener('click', (e) => {
 e.preventDefault();
 e.stopPropagation();
 openReportSourceChooser();
});

rptSourceCancelBtn.addEventListener('click', () => {
 closeAllReportPopovers();
});

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

rptFilterAddBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 rptFilterPicker.hidden = !rptFilterPicker.hidden;
 if(!rptFilterPicker.hidden){
 rptFilterPickerSearch.value = '';
 renderColumnPickerList(rptFilterPickerList, getReportHeaderSheet(), ensureReportConfig(report).filters.map(f => f.col), (col) => addReportFilterLevel(report, col), '');
 rptFilterPickerSearch.focus();
 }
});

rptFilterPickerSearch.addEventListener('input', () => {
 const report = getActiveReport();
 if(!report) return;
 renderColumnPickerList(rptFilterPickerList, getReportHeaderSheet(), ensureReportConfig(report).filters.map(f => f.col), (col) => addReportFilterLevel(report, col), rptFilterPickerSearch.value);
});

rptFilterClearBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 ensureReportConfig(report).filters = [];
 renderReportView();
 renderReportFilterPopover(report);
});

rptGroupAddBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 rptGroupPicker.hidden = !rptGroupPicker.hidden;
 if(!rptGroupPicker.hidden){
 rptGroupPickerSearch.value = '';
 renderColumnPickerList(rptGroupPickerList, getReportHeaderSheet(), [], (col) => {
 ensureReportConfig(report).groupCol = col;
 renderReportView();
 renderReportGroupPopover(report);
 }, '');
 rptGroupPickerSearch.focus();
 }
});

rptGroupPickerSearch.addEventListener('input', () => {
 const report = getActiveReport();
 if(!report) return;
 renderColumnPickerList(rptGroupPickerList, getReportHeaderSheet(), [], (col) => {
 ensureReportConfig(report).groupCol = col;
 renderReportView();
 renderReportGroupPopover(report);
 }, rptGroupPickerSearch.value);
});

rptGroupClearBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 ensureReportConfig(report).groupCol = null;
 renderReportView();
 renderReportGroupPopover(report);
});

rptSummarizeAddBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 rptSummarizePicker.hidden = !rptSummarizePicker.hidden;
 if(!rptSummarizePicker.hidden){
 rptSummarizePickerSearch.value = '';
 renderColumnPickerList(rptSummarizePickerList, getReportHeaderSheet(), ensureReportConfig(report).summaries.map(s => s.col), (col) => {
 ensureReportConfig(report).summaries.push({col, fn:'count'});
 renderReportView();
 renderReportSummarizePopover(report);
 }, '');
 rptSummarizePickerSearch.focus();
 }
});

rptSummarizePickerSearch.addEventListener('input', () => {
 const report = getActiveReport();
 if(!report) return;
 renderColumnPickerList(rptSummarizePickerList, getReportHeaderSheet(), ensureReportConfig(report).summaries.map(s => s.col), (col) => {
 ensureReportConfig(report).summaries.push({col, fn:'count'});
 renderReportView();
 renderReportSummarizePopover(report);
 }, rptSummarizePickerSearch.value);
});

rptSummarizeClearBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 ensureReportConfig(report).summaries = [];
 renderReportView();
 renderReportSummarizePopover(report);
});

rptSortAddBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 rptSortPicker.hidden = !rptSortPicker.hidden;
 if(!rptSortPicker.hidden){
 rptSortPickerSearch.value = '';
 renderColumnPickerList(rptSortPickerList, getReportHeaderSheet(), ensureReportConfig(report).sorts.map(s => s.col), (col) => {
 ensureReportConfig(report).sorts.push({col, dir:'asc'});
 renderReportView();
 renderReportSortPopover(report);
 }, '');
 rptSortPickerSearch.focus();
 }
});

rptSortPickerSearch.addEventListener('input', () => {
 const report = getActiveReport();
 if(!report) return;
 renderColumnPickerList(rptSortPickerList, getReportHeaderSheet(), ensureReportConfig(report).sorts.map(s => s.col), (col) => {
 ensureReportConfig(report).sorts.push({col, dir:'asc'});
 renderReportView();
 renderReportSortPopover(report);
 }, rptSortPickerSearch.value);
});

rptSortClearBtn.addEventListener('click', () => {
 const report = getActiveReport();
 if(!report) return;
 ensureReportConfig(report).sorts = [];
 renderReportView();
 renderReportSortPopover(report);
});

if(rptRowHeightSelect) rptRowHeightSelect.addEventListener('change', () => setReportRowHeight(rptRowHeightSelect.value));

rptSearchInput.addEventListener('input', () => {
 const report = getActiveReport();
 if(!report) return;
 ensureReportConfig(report).searchTerm = rptSearchInput.value;
 renderReportView();
});

document.addEventListener('click', (e) => {
 if(!openReportPopover) return;
 const wraps = document.querySelectorAll('.ss-tool-wrap');
 const inside = Array.from(wraps).some(w => w.contains(e.target));
 if(!inside) closeAllReportPopovers();
});

document.addEventListener('keydown', (e) => {
 if(e.key === 'Escape' && openReportPopover) closeAllReportPopovers();
});

ssGroupBtn.addEventListener('click', ()=>{
 alert('Tính năng Nhóm dòng theo cột sẽ được bổ sung sau — hiện chưa hoạt động.');
});

if(topFormsBtn) topFormsBtn.addEventListener('click', () => ssFormsBtn?.click());

if(topAutomationBtn) topAutomationBtn.addEventListener('click', () => ssAutomationBtn?.click());

if(topConnectionsBtn) topConnectionsBtn.addEventListener('click', () => document.getElementById('linkGoogleSheetBtn')?.click());

ssIndentBtn.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 const row = getActiveRowIndex();
 if(row > 0) indentRow(sheet, row);
});

ssOutdentBtn.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 const row = getActiveRowIndex();
 if(row > 0) outdentRow(sheet, row);
});

ssSearchInput.addEventListener('input', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 sheet._searchTerm = ssSearchInput.value.trim().toLowerCase();
 renderGridSheet(sheet);
});

ssAddRowBtn.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 const before = createSheetUndoSnapshot(sheet);
 const cells = ensureSheetCells(sheet);
 cells.push(prepareNewSheetRow(sheet, true));
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 pushSheetSnapshotUndo(sheet, before, createSheetUndoSnapshot(sheet), 'add-row');
});

openGoogleSheetLink.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 const url = normalizeGoogleSheetUrl(sheet?.googleSheetUrl || googleSheetUrlInput.value);
 window.open(url || 'https://sheets.new', '_blank');
});

sheetGridWrap.addEventListener('focusin', (e)=>{
 const cell = e.target.closest('.sheet-cell');
 if(!cell || cell === editingCell) return;
 setActiveSheetCell(Number(cell.dataset.r), Number(cell.dataset.c), false);
});

sheetGridWrap.addEventListener('contextmenu', openSheetCellContextMenu);

function createDefaultDashboardConfig(name){
 return {
  id:'dash_default_' + String(name || 'dashboard').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
  name:name || 'Dashboard',
  grid:{cols:12, gap:14},
  editMode:false,
  widgets:[
   {id:'w_title', type:'TITLE', span:12, config:{title:'Dashboard dự án'}},
   {id:'w_metric', type:'METRIC', span:3, config:{label:'Dự án mẫu'}},
   {id:'w_shortcut', type:'SHORTCUT', span:4, config:{label:'Mở Repost', links:[{label:'Repost', target:'REPOST_CARRY_FORWARD'}]}}
  ]
 };
}
