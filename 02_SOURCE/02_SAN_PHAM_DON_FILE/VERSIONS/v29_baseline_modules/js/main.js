function render(){
  const rowsEl = document.getElementById('rows');
  if (!rowsEl) { console.error('rows element NOT FOUND'); return; }
 const projectIndexes = typeof getRailProjectIndexes === 'function'
  ? getRailProjectIndexes()
  : DATA.map((_, index)=>index);
 rowsEl.innerHTML = projectIndexes.map(i => {
 const p = DATA[i];
 const showFolderLevels = document.getElementById('screen-list')?.classList.contains('show-folder-levels');
 const childRows = (i === activeProjectIndex || showFolderLevels)
 ? PROJECT_FOLDERS[i].map((f, folderIndex) => `
 <tr class="project-child-row ${activeSheetContext && activeSheetContext.projectIndex === i && activeSheetContext.folderIndex === folderIndex ? 'active-child' : ''}" data-project-i="${i}" data-folder-i="${folderIndex}">
 <td class="col-check"></td>
 <td class="col-star"></td>
 <td>
 <div class="project-cell child-cell">
 <span class="project-icon child-icon workspace-type-wrap">${workspaceItemIconHtml(f)}</span>
 <div class="project-copy">
 <div class="proj-name">${f.label || f.name}</div>
 <div class="proj-sub">${f.name} · 1 sheet</div>
 </div>
 </div>
 </td>
 <td class="owner">Nhóm hồ sơ</td>
 <td class="owner">${p.owner}</td>
 <td class="updated">${f.updated || p.updated}</td>
 </tr>`).join('')
 : '';
 return `
 <tr data-i="${i}" class="${i === activeProjectIndex ? 'active-project' : ''}">
 <td class="col-check"><input type="checkbox" onclick="event.stopPropagation()"></td>
 <td class="col-star ${p.fav?'fav':''}" onclick="toggleFav(event, ${i})">${p.fav ? '★' : '☆'}</td>
 <td>
 <div class="project-cell">
 <span class="project-icon workspace-type-wrap">${workspaceItemIconHtml('workspace')}</span>
 <div class="project-copy">
 <div class="proj-name">${p.name}</div>
 <div class="proj-sub">${p.sub}</div>
 </div>
 </div>
 </td>
 <td>
 ${p.shared
 ? `<span class="badge shared"><span class="dot"></span>Đã chia sẻ</span>`
 : `<span class="badge private"><span class="dot"></span>Chỉ mình tôi</span>`}
 </td>
 <td class="owner">${p.owner}</td>
 <td class="updated">${p.updated}</td>
 </tr>${childRows}`;
 }).join('');
 document.getElementById('rowCount').textContent = projectIndexes.length + ' dự án';
 renderFavorites();
}

function closeContextMenu(){
 ctxMenu.classList.remove('show');
 MenuPositioning.unregister('workspace-project-menu');
 MenuPositioning.unregister('workspace-context-submenu');
 rows.querySelectorAll('tr').forEach(row => row.classList.remove('ctx-selected'));
}

function notifyAction(text){
 alert(text);
}

function getItemIconSVG(type, size = 22){
 const iconType = workspaceItemVisualType(type);
 if(iconType === 'folder'){
 return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.1 7.5c0-1.28 1.02-2.32 2.28-2.32h4.66c.62 0 1.2.25 1.63.69l1.3 1.32h7.65c1.26 0 2.28 1.04 2.28 2.32v.72H2.1V7.5z" fill="#FFD45C"/>
  <path d="M2.1 9.12h19.8v9.58c0 1.24-1.02 2.25-2.28 2.25H4.38c-1.26 0-2.28-1.01-2.28-2.25V9.12z" fill="#FFB900"/>
  <path d="M2.1 9.12h19.8v2.18H2.1z" fill="#E6A800" opacity=".72"/>
  <path d="M4.55 13.04h14.9M4.55 15.95h11.7M4.55 18.82h13.15" stroke="#FFE9A6" stroke-width="1.25" stroke-linecap="round" opacity=".95"/>
  <path d="M3.2 10.65h17.6" stroke="#FFF7D0" stroke-width="1" stroke-linecap="round" opacity=".7"/>
 </svg>`;
 }
 if(iconType === 'report'){
 return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <rect x="2.7" y="1.7" width="18.6" height="20.9" rx="2.2" fill="#ffffff" stroke="#D1CFCE" stroke-width=".75"/>
  <path d="M4.9 1.7h14.2c1.2 0 2.2 1 2.2 2.2v3.7H2.7V3.9c0-1.2 1-2.2 2.2-2.2z" fill="#D83B01"/>
  <text x="12" y="6.1" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="2.75" font-weight="800" fill="#fff">REPORT</text>
  <rect x="6.05" y="15.1" width="2.45" height="4.15" rx=".5" fill="#F8B18B"/>
  <rect x="10.35" y="11.45" width="2.45" height="7.8" rx=".5" fill="#E66A2C"/>
  <rect x="14.65" y="9.45" width="2.45" height="9.8" rx=".5" fill="#B83300"/>
  <path d="M5.7 19.72h12.5" stroke="#D83B01" stroke-width="1.1" stroke-linecap="round"/>
  <path d="M6 10.2h4.4M6 12.35h3.2" stroke="#F0C7B6" stroke-width=".85" stroke-linecap="round"/>
 </svg>`;
 }
 return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sheetGrad${size}" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#21A366"/>
      <stop offset="1" stop-color="#107C41"/>
    </linearGradient>
  </defs>
  <rect x="3.2" y="2.2" width="17.6" height="19.6" rx="2.35" fill="url(#sheetGrad${size})"/>
  <path d="M7.2 5.45h11.35c.62 0 1.12.5 1.12 1.12v12.08c0 .62-.5 1.12-1.12 1.12H7.2V5.45z" fill="#E7F4EC" opacity=".96"/>
  <path d="M7.2 8.75h12.47M7.2 12.05h12.47M7.2 15.35h12.47M11.4 5.45v14.32M15.55 5.45v14.32" stroke="#9FD5B5" stroke-width=".78"/>
  <rect x="2.1" y="7.1" width="9.8" height="9.8" rx="1.7" fill="#0B6A35"/>
  <path d="M4.55 9.35l1.82 2.55-1.95 2.72h1.72l1.05-1.7 1.08 1.7h1.8l-1.98-2.78 1.85-2.49H8.22l-.96 1.55-.98-1.55H4.55z" fill="#fff"/>
  <path d="M4.05 3.35h15.9" stroke="#54C785" stroke-width="1.15" stroke-linecap="round" opacity=".9"/>
 </svg>`;
}

function upgradeLegacyTypeIcons(root = document){
 root.querySelectorAll('.sm-type-icon').forEach(el => {
 const type = el.classList.contains('report') ? 'report' : (el.classList.contains('folder') ? 'folder' : 'sheet');
 const extraClass = el.classList.contains('menu') ? 'menu' : '';
 el.outerHTML = workspaceItemIconHtml(type, extraClass);
 });
}

upgradeLegacyTypeIcons();

function ensureAppUserName(){
 if(!appUserName){
  const entered = prompt('Tên của bạn là gì?', 'Quân') || 'Quân';
  appUserName = entered.trim() || 'Quân';
  localStorage.setItem(APP_USER_NAME_KEY, appUserName);
 }
 return appUserName;
}

function changeAppUserName(){
 const entered = prompt('Tên của bạn là gì?', ensureAppUserName());
 if(entered === null) return;
 appUserName = entered.trim() || 'Quân';
 localStorage.setItem(APP_USER_NAME_KEY, appUserName);
 notifyAction('Đã đổi người thao tác: ' + appUserName);
}

function formatDateTimeVN(timestamp){
 if(!timestamp) return '—';
 const d = new Date(timestamp);
 if(Number.isNaN(d.getTime())) return '—';
 return d.toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
}

function formatDurationMinutes(value){
 const minutes = Number(value);
 if(!Number.isFinite(minutes) || minutes <= 0) return '';
 const d = Math.floor(minutes / 1440);
 const h = Math.floor((minutes % 1440) / 60);
 const m = minutes % 60;
 return [d ? d + 'd' : '', h ? h + 'h' : '', m ? m + 'm' : ''].filter(Boolean).join(' ') || '0m';
}

function formatFileSize(bytes){
 if(!Number.isFinite(bytes)) return '';
 if(bytes < 1024) return `${bytes} B`;
 if(bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
 return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value){
 return String(value ?? '').replace(/[&<>"']/g, char => ({
 '&':'\&amp;',
 '<':'\&lt;',
 '>':'\&gt;',
 '"':'\&quot;',
 "'":'&#39;'
 }[char]));
}

function isStatusPill(v){ var s=String(v).toLowerCase().trim(); return s==='hoàn thành'||s==='đã xong'||s==='done'||s==='đang thực hiện'||s==='in progress'||s==='chưa bắt đầu'||s==='not started'; }

function statusPillHtml(v){
  var s=String(v).toLowerCase().trim(), cls='dash-pill-default';
  if(s==='hoàn thành'||s==='đã xong'||s==='done') cls='dash-pill-tot';
  else if(s==='đang thực hiện'||s==='in progress') cls='dash-pill-dang';
  else if(s==='chưa bắt đầu'||s==='not started') cls='dash-pill-chua';
  return '<span class="dash-pill '+cls+'">'+escHtml(v)+'</span>';
}

function escHtml(s){ if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

document.getElementById('linkGoogleSheetBtn').addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 linkExistingGoogleSheet(sheet);
});

function showV19Modal(title, bodyHtml, actions = []){
 document.querySelector('.v19-modal-overlay')?.remove();
 const overlay = document.createElement('div');
 overlay.className = 'v19-modal-overlay';
 overlay.innerHTML = `
 <div class="v19-modal" role="dialog" aria-modal="true">
 <div class="v19-modal-head"><strong>${escapeHtml(title)}</strong><button class="v19-modal-close" type="button">×</button></div>
 <div class="v19-modal-body">${bodyHtml}</div>
 <div class="v19-modal-actions">${actions.map(a => `<button class="v19-btn ${a.kind || ''}" type="button" data-action="${a.id}">${escapeHtml(a.label)}</button>`).join('')}</div>
 </div>`;
 document.body.appendChild(overlay);
 overlay.querySelector('.v19-modal-close').addEventListener('click', () => overlay.remove());
 overlay.addEventListener('click', e => { if(e.target === overlay) overlay.remove(); });
 actions.forEach(a => {
 overlay.querySelector(`[data-action="${a.id}"]`)?.addEventListener('click', () => a.onClick?.(overlay));
 });
 return overlay;
}

function openFormsModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const fields = getSheetColumnsForBuilder(sheet).filter(c => !['attachment','status'].includes(c.type));
 const overlay = showV19Modal('Forms — Form Builder', `
 <input id="formTitleInput" value="Báo cáo hiện trường">
 <div class="v19-muted">Form sinh tự động từ cấu trúc cột. Tick Required cho các trường bắt buộc.</div>
 <div>${fields.map(f => `<label class="ss-pop-chip"><input type="checkbox" class="form-field-enabled" data-col="${f.index}" checked> ${escapeHtml(f.label)} <span class="v19-muted">${escapeHtml(f.type)}</span><input type="checkbox" class="form-field-required" data-col="${f.index}"> Required</label>`).join('')}</div>
 <textarea id="formPreview" rows="7" readonly></textarea>
 `, [
 {id:'preview', label:'Preview', onClick:modal => {
 const title = modal.querySelector('#formTitleInput').value.trim() || sheet.name;
 const enabled = Array.from(modal.querySelectorAll('.form-field-enabled:checked')).map(x => Number(x.dataset.col));
 const required = new Set(Array.from(modal.querySelectorAll('.form-field-required:checked')).map(x => Number(x.dataset.col)));
 const config = {formId:`form-${Date.now()}`, sheetId:sheet.name, title, fields:fields.filter(f => enabled.includes(f.index)).map(f => ({column:f.label, type:f.type.toUpperCase(), required:required.has(f.index)})), settings:{allowPublic:false, submitMessage:'Cảm ơn!'}};
 modal.querySelector('#formPreview').value = JSON.stringify(config, null, 2);
 sheet._forms = sheet._forms || [];
 sheet._forms[0] = config;
 scheduleSheetDataSave(sheet);
 }},
 {id:'close', label:'Đóng', kind:'primary', onClick:modal => modal.remove()}
 ]);
 overlay.querySelector('[data-action="preview"]').click();
}

function openPublishModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 sheet._publish = sheet._publish || {publishId:`pub-${Date.now().toString(36)}`, active:false, settings:{password:'', showToolbar:false, showRowNumbers:true}};
 showV19Modal('Publish Report', `
 <label class="ss-pop-chip"><input id="publishActive" type="checkbox" ${sheet._publish.active ? 'checked' : ''}> Public read-only link</label>
 <input id="publishPassword" placeholder="Password tuỳ chọn" value="${escapeHtml(sheet._publish.settings.password || '')}">
 <input id="publishLink" readonly value="${location.href.split('#')[0]}#publish=${sheet._publish.publishId}">
 <div class="v19-muted">Published view là read-only tuyệt đối; nút này lưu cấu hình publish vào sheet staging.</div>
 `, [
 {id:'save', label:'Lưu publish', kind:'primary', onClick:modal => {
 sheet._publish.active = modal.querySelector('#publishActive').checked;
 sheet._publish.settings.password = modal.querySelector('#publishPassword').value.trim();
 sheet._publish.updatedAt = new Date().toISOString();
 scheduleSheetDataSave(sheet);
 alert(sheet._publish.active ? 'Đã publish report.' : 'Đã tắt publish.');
 modal.remove();
 }},
 {id:'copy', label:'Copy link', onClick:modal => navigator.clipboard?.writeText(modal.querySelector('#publishLink').value)}
 ]);
}

function openAutomationModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 showV19Modal('Automation MVP', `
 <div class="v19-modal-grid">
 <select id="wfTrigger"><option value="onNewRow">Khi thêm dòng mới</option><option value="onCellEdit">Khi sửa ô</option><option value="onSchedule">Theo lịch</option><option value="onFormSubmit">Khi form submit</option></select>
 <select id="wfAction"><option value="notify">Thông báo trong app</option><option value="sendEmail">Gửi email</option><option value="updateCell">Cập nhật ô</option><option value="webhook">Webhook</option></select>
 </div>
 <input id="wfName" value="Workflow phê duyệt">
 <textarea id="wfBody" rows="5">Hạng mục {{row.Nội dung}} cần xử lý.</textarea>
 <div class="v19-muted">MVP lưu workflow config và preview log; phần gửi email/webhook thật sẽ chạy khi có backend tương ứng.</div>
 `, [
 {id:'save', label:'Lưu workflow', kind:'primary', onClick:modal => {
 sheet._workflows = sheet._workflows || [];
 sheet._workflows.push({workflowId:`wf-${Date.now()}`, active:true, name:modal.querySelector('#wfName').value.trim(), trigger:{type:modal.querySelector('#wfTrigger').value}, actions:[{type:modal.querySelector('#wfAction').value, config:{message:modal.querySelector('#wfBody').value}}], createdAt:new Date().toISOString()});
 scheduleSheetDataSave(sheet);
 alert('Đã lưu workflow.');
 modal.remove();
 }}
 ]);
}

function selectedSheetValues(sheet){
 const cells = ensureSheetCells(sheet);
 const activeCell = sheetGridWrap?.querySelector?.('.sheet-cell.active-cell');
 const anchorRow = Number(activeCell?.dataset.r || 1);
 const anchorCol = Number(activeCell?.dataset.c || 2);
 const range = getSelectedRange(anchorRow, anchorCol);
 const values = [];
 for(let row = range.r1; row <= range.r2; row++){
  for(let col = range.c1; col <= range.c2; col++){
   if(row > 0 && col > 1){
    const value = cells[row]?.[col];
    if(value !== undefined && value !== null && String(value).trim()) values.push(String(value).trim());
   }
  }
 }
 return values;
}

function openSheetShareModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const project = DATA[activeSheetContext?.projectIndex] || {};
 const shareLink = location.href.split('#')[0] + `#sheet=${encodeURIComponent(sheet.name || 'sheet')}`;
 showV19Modal('Chia sẻ Sheet', `
  <div class="v19-muted">${escapeHtml(project.name || 'Dự án')} / ${escapeHtml(sheet.label || sheet.name || 'Sheet')}</div>
  <input id="sheetShareLink" readonly value="${escapeHtml(shareLink)}">
  <div class="v19-muted">Liên kết chỉ mở được theo quyền truy cập hiện tại.</div>
 `, [
  {id:'copy', label:'Sao chép liên kết', kind:'primary', onClick:modal => {
   const input = modal.querySelector('#sheetShareLink');
   input?.select();
   if(navigator.clipboard?.writeText) navigator.clipboard.writeText(input.value).catch(() => {});
  }},
  {id:'close', label:'Đóng', onClick:modal => modal.remove()}
 ]);
}

function openSheetAiModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const values = selectedSheetValues(sheet);
 const preview = values.length ? values.slice(0, 12).join('\n') : 'Chưa có dữ liệu trong vùng chọn.';
 showV19Modal('AI nhanh', `
  <div class="v19-muted">Vùng chọn: ${values.length} ô có dữ liệu</div>
  <textarea id="sheetAiPreview" rows="8" readonly>${escapeHtml(preview)}</textarea>
 `, [
  {id:'copy', label:'Sao chép nội dung', kind:'primary', onClick:modal => {
   const field = modal.querySelector('#sheetAiPreview');
   field?.select();
   if(navigator.clipboard?.writeText) navigator.clipboard.writeText(field.value).catch(() => {});
  }},
  {id:'close', label:'Đóng', onClick:modal => modal.remove()}
 ]);
}

function openSheetCommentModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 showV19Modal('Bình luận', '<textarea id="sheetCommentText" rows="5" placeholder="Nhập bình luận..."></textarea>', [
  {id:'save', label:'Lưu bình luận', kind:'primary', onClick:modal => {
   const text = modal.querySelector('#sheetCommentText')?.value.trim();
   if(!text) return;
   sheet._comments = sheet._comments || [];
   sheet._comments.push({text, author:ensureAppUserName(), createdAt:new Date().toISOString()});
   scheduleSheetDataSave(sheet);
   modal.remove();
  }},
  {id:'close', label:'Đóng', onClick:modal => modal.remove()}
 ]);
}

function openSheetActivityModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const comments = (sheet._comments || []).slice(-8).reverse();
 const rows = comments.length
  ? comments.map(item => `<div class="v19-muted"><strong>${escapeHtml(item.author || 'Người dùng')}</strong> · ${escapeHtml(new Date(item.createdAt).toLocaleString('vi-VN'))}<br>${escapeHtml(item.text || '')}</div>`).join('')
  : '<div class="v19-muted">Chưa có hoạt động được ghi nhận.</div>';
 showV19Modal('Hoạt động gần đây', rows, [{id:'close', label:'Đóng', kind:'primary', onClick:modal => modal.remove()}]);
}

function openSheetInfoModal(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 showV19Modal('Thông tin Sheet', `
  <div class="v19-modal-grid">
   <div><strong>Tên</strong><br>${escapeHtml(sheet.label || sheet.name || 'Sheet')}</div>
   <div><strong>Dòng dữ liệu</strong><br>${Math.max(0, cells.length - 1)}</div>
   <div><strong>Số cột</strong><br>${cells[0]?.length || 0}</div>
  </div>
 `, [{id:'close', label:'Đóng', kind:'primary', onClick:modal => modal.remove()}]);
}

function bindMicrosoft365SheetActions(){
 const bind = (id, handler) => {
  const button = document.getElementById(id);
  if(!button || button.dataset.m365ActionBound === '1') return;
  button.dataset.m365ActionBound = '1';
  button.addEventListener('click', handler);
 };
 bind('ssGridViewBtn', () => {
  closeAllToolPopovers();
  closeSheetMoreMenu();
  document.getElementById('ssGridViewBtn')?.classList.add('active');
  const sheet = getActiveSheet();
  if(sheet) renderGridSheet(sheet);
 });
 bind('ssShareBtn', openSheetShareModal);
 bind('ssAiBtn', openSheetAiModal);
 bind('ssTopMoreBtn', event => {
  event.stopPropagation();
  toggleSheetMoreMenu();
 });
 bind('tbComment', openSheetCommentModal);
 bind('tbActivity', openSheetActivityModal);
 bind('tbInfo', openSheetInfoModal);
}

bindMicrosoft365SheetActions();
function withTimeout(promise, ms, message){
 let timeoutId = null;
 const timeout = new Promise((_, reject) => {
  timeoutId = setTimeout(() => reject(new Error(message)), ms);
 });
 return Promise.race([promise, timeout]).finally(() => {
  if(timeoutId) clearTimeout(timeoutId);
 });
}

async function runLimitedConcurrency(items, limit, worker){
 const queue = Array.from(items);
 const workers = Array.from({length:Math.max(1, Math.min(limit, queue.length))}, async () => {
  while(queue.length){
   const item = queue.shift();
   await worker(item);
  }
 });
 await Promise.all(workers);
}

function initials(name){
 const parts = name.trim().split(' ');
 return (parts[parts.length-1][0] || '').toUpperCase();
}

document.getElementById('rows').addEventListener('contextmenu', (e)=>{
 const childRow = e.target.closest('.project-child-row');
 if(childRow) openWorkspaceItemMenuFromRow(childRow, e);
});

document.getElementById('rows').addEventListener('click', (e)=>{
 const childRow = e.target.closest('.project-child-row');
 if(childRow){
 const projectIndex = Number(childRow.dataset.projectI);
 const folderIndex = Number(childRow.dataset.folderI);
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(isWorkFile(item)){
 openSheet(projectIndex, folderIndex);
 return;
 }
 openDetail(projectIndex);
 requestAnimationFrame(()=>{
 rows.querySelectorAll('.project-child-row').forEach(row => row.classList.remove('active-child'));
 childRow.classList.add('active-child');
 const detailRow = document.querySelector(`#folderRows tr[data-folder-i="${folderIndex}"]`);
 detailRow?.scrollIntoView({block:'center'});
 detailRow?.classList.add('ctx-selected');
 setTimeout(()=> detailRow?.classList.remove('ctx-selected'), 1000);
 });
 return;
 }

 const tr = e.target.closest('tr[data-i]');
 if(!tr) return;
 openDetail(Number(tr.dataset.i));
});

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📈', pptx: '📈', jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', txt: '📃', zip: '📦', rar: '📦' };
  return icons[ext] || '📄';
}

if(!window.__QLDA_APP_STARTED__){
  window.__QLDA_APP_STARTED__ = true;
  initAuth();
  window.__QLDA_PERF__ = window.__QLDA_PERF__ || {};
  window.__QLDA_PERF__.uiReadyMs = performance.now();
  document.documentElement.dataset.qldaUiReady = '1';
  performance.mark?.('qlda-ui-ready');
}
