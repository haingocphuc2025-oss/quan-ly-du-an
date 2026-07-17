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
     id:'dash_'+Date.now(),
     name:dashItem.name||'New Dashboard',
     grid:{cols:12,gap:14},
     widgets:[],
     editMode:false
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
   grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;"><p style="font-size:16px;color:#fff;margin:0 0 8px;">Dashboard trống</p><p style="font-size:13px;color:rgba(255,255,255,0.6);margin:0;">Bấm "＋ Thêm" để thêm widget đầu tiên.</p></div>';
   return;
 }
 config.widgets.forEach(function(w,idx){
   var span = w.span||6;
   var cs = 'dash-span-'+Math.min(Math.max(1,span),12);
   var card = document.createElement('div');
   card.className = 'dash-card '+cs;
   card.dataset.widgetId = w.id;
   if(config.editMode) card.classList.add('dash-card-editing');
   if(w.type==='TITLE') renderDashTitle(card,w);
   else if(w.type==='METRIC') renderDashMetric(card,w,projectIndex,folderIndex);
   else if(w.type==='SHORTCUT') renderDashShortcut(card,w);
   else if(w.type==='REPORT') renderDashReport(card,w,projectIndex,folderIndex);
   else if(w.type==='CHART') renderDashChartPlaceholder(card,w);
   else card.innerHTML = '<div class="dash-card-body"><p style="color:#9CA3AF;font-size:12px;">Loại: '+(w.type||'?')+'</p></div>';
   if(config.editMode){
     var tools=document.createElement('div');
     tools.className='dash-widget-tools';
     tools.innerHTML='<button type="button" data-dash-edit="'+w.id+'">⚙</button><button type="button" data-dash-remove="'+w.id+'">×</button>';
     card.appendChild(tools);
   }
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
 var c = w.config||{};
 var tone = c.tone||'info';
 var label = c.label||'';
 var unit = c.unit||'';
 card.innerHTML = '<div class="dash-metric dash-metric-tone-'+tone+'"><div class="dash-metric-value">--</div>'+(label?'<div class="dash-metric-label">'+escHtml(label)+'</div>':'')+'</div>';
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
   html += '<li class="dash-shortcut-item" data-target="'+escHtml(lk.target||'')+'"><span class="dash-shortcut-icon">'+(lk.icon||'📄')+'</span>'+escHtml(lk.label||'')+'</li>';
 });
 html += '</ul></div>';
 card.innerHTML = html;
}

function renderDashReport(card,w,projectIndex,folderIndex){
 var c = w.config||{};
 var limit = c.limit||10;
 card.innerHTML = '<div class="dash-card-header">'+escHtml(c.title||'Report')+'</div><div class="dash-card-body"><p style="color:#9CA3AF;font-size:12px;">Đang tải...</p></div>';
}

function renderDashReportTable(card,cells,limit,columns){
 if(!cells||cells.length<2){ card.querySelector('.dash-card-body').innerHTML='<p style="color:#9CA3AF;font-size:12px;">Không có dữ liệu.</p>'; return; }
 var h=cells[0], rows=cells.slice(1,Math.min(1+limit,cells.length)), ci=[];
 if(columns[0]==='all'){ for(var i=0;i<h.length;i++) ci.push(i); }
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
 var t = (w.config&&w.config.title)||'Chart';
 card.innerHTML = '<div class="dash-card-header">'+escHtml(t)+'</div><div class="dash-card-body"><div class="dash-chart-placeholder">📊 Chart placeholder</div></div>';
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

function closeDashboardDialog(){
  document.querySelector('.dashboard-config-backdrop')?.remove();
}

function showAddWidgetDialog(){
  var dashItem=getDashboardItem();
  if(!dashItem) return;
  ensureDashboardConfig(dashItem);
  closeDashboardDialog();
  var back=document.createElement('div');
  back.className='attachment-preview-backdrop dashboard-config-backdrop';
  var types=[['TITLE','Tiêu đề'],['METRIC','Chỉ số'],['SHORTCUT','Lối tắt'],['REPORT','Báo cáo']];
  back.innerHTML='<div class="attachment-preview-dialog" role="dialog" aria-modal="true" style="max-width:480px;height:auto;padding:24px"><strong style="font-size:18px">Thêm widget</strong><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:16px">'+
    types.map(t=>'<button type="button" class="dash-widget-choice" data-widget-type="'+t[0]+'" style="padding:18px;text-align:left;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);border-radius:12px;color:#fff;cursor:pointer"><strong>'+t[1]+'</strong><br><small>'+t[0]+'</small></button>').join('')+
    '</div></div>';
  document.body.appendChild(back);
  back.querySelectorAll('[data-widget-type]').forEach(function(btn){
    btn.onclick=function(){
      var type=btn.dataset.widgetType;
      var cfg=dashItem._dashboardConfig;
      var w={id:'w_'+Date.now(),type:type,span:type==='TITLE'?12:3,config:buildDefaultWidgetConfig(type),source:null};
      cfg.widgets.push(w);
      closeDashboardDialog();
      renderDashboard(dashItem,activeProjectIndex,activeSheetContext?.folderIndex);
    };
  });
}

function buildDefaultWidgetConfig(type){
  if(type==='TITLE') return {title:'Tiêu đề', sub:'Mô tả', style:'default'};
  if(type==='METRIC') return {label:'Số lượng', agg:'count', tone:'info', col:null, unit:''};
  if(type==='SHORTCUT') return {links:[]};
  if(type==='REPORT') return {title:'Report', limit:10, columns:['all']};
  return {};
}

if(dashEditBtn){
  dashEditBtn.addEventListener('click',function(){
    var d=getDashboardItem();
    if(!d)return;
    ensureDashboardConfig(d);
    d._dashboardConfig.editMode=!d._dashboardConfig.editMode;
    this.classList.toggle('active',d._dashboardConfig.editMode);
    renderDashboard(d,activeProjectIndex,activeSheetContext?.folderIndex);
  });
}

var dashboardGridEl=document.getElementById('dashboardGrid');

if(dashboardGridEl){
  dashboardGridEl.addEventListener('click',function(e){
    var edit=e.target.closest('[data-dash-edit]');
    var remove=e.target.closest('[data-dash-remove]');
    if(remove){
      var d=getDashboardItem();
      if(d&&confirm('Xóa widget này?')){
        d._dashboardConfig.widgets=d._dashboardConfig.widgets.filter(w=>w.id!==remove.dataset.dashRemove);
        renderDashboard(d,activeProjectIndex,activeSheetContext?.folderIndex);
      }
    }
  });
}
