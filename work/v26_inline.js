
;

;

let DATA = [
 {name:'Đường điện chiếu sáng — Xã Liên Sơn', sub:'Đà Bắc, Phú Thọ', shared:true, owner:'Quân', updated:'30/06/2026', fav:true},
 {name:'Nhà văn hoá thôn 5 — Xã Đông Thành', sub:'Phú Thọ', shared:true, owner:'Quân', updated:'27/06/2026', fav:false},
];

const rows = document.getElementById('rows');
const main = document.querySelector('.main');
const columnResizer = document.getElementById('columnResizer');
const savedProjectColumnWidth = Number(localStorage.getItem('projectColumnWidth'));

if(Number.isFinite(savedProjectColumnWidth) && savedProjectColumnWidth > 0){
 setProjectColumnWidth(savedProjectColumnWidth);
}

function clampProjectColumnWidth(width){
 const mainWidth = main.getBoundingClientRect().width || window.innerWidth;
 const min = 300;
 const maxLikeSmartsheet = 460;
 const detailMin = 560;
 const resizerWidth = 12;
 const availableMax = mainWidth - detailMin - resizerWidth;
 const max = Math.max(min, Math.min(maxLikeSmartsheet, availableMax));
 return Math.min(Math.max(width, min), max);
}

function setProjectColumnWidth(width, shouldSave = false){
 const clamped = clampProjectColumnWidth(width);
 main.style.setProperty('--project-column-size', clamped + 'px');
 if(shouldSave) localStorage.setItem('projectColumnWidth', String(Math.round(clamped)));
}

function render(){
  const rowsEl = document.getElementById('rows');
  if (!rowsEl) { console.error('rows element NOT FOUND'); return; }
 rowsEl.innerHTML = DATA.map((p, i) => {
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
 document.getElementById('rowCount').textContent = DATA.length + ' dự án';
 renderFavorites();
}

function toggleFav(e, i){
 e.stopPropagation();
 DATA[i].fav = !DATA[i].fav;
 render();
 persistToDrive();
}

const workspaceNavigator = document.getElementById('workspaceNavigator');
const workspaceNavTrigger = document.getElementById('workspaceNavTrigger');
const workspaceNavigatorClose = document.getElementById('workspaceNavigatorClose');
const workspaceNavigatorRows = document.getElementById('workspaceNavigatorRows');
const workspaceNavigatorTitle = document.getElementById('workspaceNavigatorTitle');
const workspaceNavTree = document.getElementById('workspaceNavTree');
const workspaceNavigatorHeadRow = document.querySelector('.workspace-navigator-table thead tr');
const workspaceNavigatorColumns = [
 {key:'name', label:'Name', locked:true},
 {key:'updated', label:'Last Update'}
];
let workspaceNavigatorSection = 'workspaces';
const workspaceNavigatorHiddenCols = new Set();

function workspaceNavigatorItems(section = workspaceNavigatorSection){
 const items = [];
 DATA.forEach((project, projectIndex) => {
  const folders = PROJECT_FOLDERS?.[projectIndex] || [];
  const projectRow = {
   kind:'project',
   projectIndex,
   folderIndex:null,
   name:project.name,
   updated:project.updated || '',
   icon:workspaceItemIconHtml('workspace'),
   className:'workspace-navigator-project'
  };
  if(section === 'workspaces' || section === 'portfolios') items.push(projectRow);
  folders.forEach((item, folderIndex) => {
   const type = workspaceItemVisualType(item);
   const isSheetLike = isWorkFile(item) && item.type !== 'report' && item.type !== 'dashboard';
   const include = section === 'workspaces'
    || (section === 'sheets' && isSheetLike)
    || (section === 'workapps' && item.type === 'dashboard')
    || (section === 'scenarios' && item.type === 'report');
   if(!include) return;
   items.push({
    kind:item.type === 'report' ? 'report' : (item.type === 'dashboard' ? 'dashboard' : (isWorkFile(item) ? 'sheet' : 'folder')),
    projectIndex,
    folderIndex,
    name:`${project.name} / ${getWorkspaceItemLabel(item)}`,
    updated:item.updated || project.updated || '',
    icon:workspaceItemIconHtml(type),
    className:''
   });
  });
 });
 return items;
}

function getVisibleWorkspaceNavigatorColumns(){
 return workspaceNavigatorColumns.filter(col => col.locked || !workspaceNavigatorHiddenCols.has(col.key));
}

function renderWorkspaceNavigator(section = workspaceNavigatorSection){
 workspaceNavigatorSection = section;
 const labels = {workspaces:'Workspaces'};
 if(workspaceNavigatorTitle) workspaceNavigatorTitle.textContent = labels[section] || 'Workspaces';
 workspaceNavTree?.querySelectorAll('button[data-nav-section]').forEach(btn => btn.classList.toggle('active', btn.dataset.navSection === section));
 const visibleCols = getVisibleWorkspaceNavigatorColumns();
 if(workspaceNavigatorHeadRow){
  workspaceNavigatorHeadRow.innerHTML = visibleCols.map(col => `<th data-nav-col="${col.key}" ${col.key === 'updated' ? 'style="width:150px"' : ''}>${escapeHtml(col.label)}<button type="button" class="workspace-nav-head-actions" title="Column actions" aria-label="Column actions" data-nav-col-menu="${col.key}">...</button></th>`).join('');
 }
 if(!workspaceNavigatorRows) return;
 const items = workspaceNavigatorItems(section);
 workspaceNavigatorRows.innerHTML = items.map(item => {
  const cells = visibleCols.map(col => {
   if(col.key === 'name') return `<td><div class="workspace-navigator-name"><span class="workspace-type-wrap">${item.icon}</span><span>${escapeHtml(item.name)}</span></div></td>`;
   if(col.key === 'updated') return `<td>${escapeHtml(item.updated)}</td>`;
   return '<td></td>';
  }).join('');
  return `<tr class="${item.className}" data-kind="${item.kind}" data-project-i="${item.projectIndex}" data-folder-i="${item.folderIndex ?? ''}">${cells}</tr>`;
 }).join('');
}

function refreshWorkspaceFolderTreeIfVisible(){
 const screenList = document.getElementById('screen-list');
 if(screenList?.classList.contains('show-folder-levels')) renderWorkspaceFolderTree();
}

function getWorkspaceBrowseFocusContext(){
 return workspaceBrowseFocusContext || activeSheetContext || null;
}

function getWorkspaceBrowseProjectIndex(){
 const focusContext = getWorkspaceBrowseFocusContext();
 if(Number.isInteger(focusContext?.projectIndex)) return focusContext.projectIndex;
 if(Number.isInteger(activeProjectIndex)) return activeProjectIndex;
 return DATA.length ? 0 : null;
}

function renderWorkspaceBrowseProjectRows(){
 if(!workspaceBrowseRows) return;
 const projectIndex = getWorkspaceBrowseProjectIndex();
 const project = Number.isInteger(projectIndex) ? DATA[projectIndex] : null;
 if(workspaceBrowseTitle) workspaceBrowseTitle.textContent = project ? project.name : 'Workspaces';
 if(!project){
  workspaceBrowseRows.innerHTML = '';
  return;
 }
 const rows = (PROJECT_FOLDERS?.[projectIndex] || []).map((item, folderIndex) => {
  const type = workspaceItemVisualType(item);
  const kind = item.type === 'report' ? 'report' : (item.type === 'dashboard' ? 'dashboard' : (isWorkFile(item) ? 'sheet' : 'folder'));
  return `
  <tr data-kind="${kind}" data-project-i="${projectIndex}" data-folder-i="${folderIndex}">
   <td><div class="workspace-navigator-name"><span class="workspace-type-wrap">${workspaceItemIconHtml(item)}</span><span>${escapeHtml(getWorkspaceItemLabel(item))}</span></div></td>
   <td>${escapeHtml(item.updated || project.updated || '')}</td>
  </tr>`;
 }).join('');
 workspaceBrowseRows.innerHTML = rows;
}

function renderWorkspaceFolderTree(){
 if(!workspaceBrowseTree) return;
 const focusContext = getWorkspaceBrowseFocusContext();
 const focusProjectIndex = getWorkspaceBrowseProjectIndex();
 const focusFolderIndex = Number.isInteger(focusContext?.folderIndex) ? focusContext.folderIndex : null;
 const projectNodes = DATA.map((project, projectIndex) => {
  const children = (PROJECT_FOLDERS?.[projectIndex] || []).map((item, folderIndex) => {
   const isActiveChild = projectIndex === focusProjectIndex && folderIndex === focusFolderIndex;
   return `
   <button type="button" class="browse-tree-child ${isActiveChild ? 'active' : ''}" data-browse-project-i="${projectIndex}" data-browse-folder-i="${folderIndex}" title="${escapeHtml(getWorkspaceItemLabel(item))}">
    <span class="workspace-type-wrap">${workspaceItemIconHtml(item)}</span><span>${escapeHtml(getWorkspaceItemLabel(item))}</span>
   </button>`;
  }).join('');
  return `
   <button type="button" class="browse-tree-project ${projectIndex === focusProjectIndex ? 'active' : ''}" data-browse-project-i="${projectIndex}">▾ ${escapeHtml(project.name)}</button>
   ${children}`;
 }).join('');
 workspaceBrowseTree.innerHTML = `
  <button type="button" class="active" data-browse-section="workspaces">▥ Workspaces</button>
  ${projectNodes}`;
 renderWorkspaceBrowseProjectRows();
 requestAnimationFrame(() => workspaceBrowseTree.querySelector('.browse-tree-child.active, .browse-tree-project.active')?.scrollIntoView({block:'nearest'}));
}

function renderWorkspaceBrowsePage(section = 'workspaces'){
 workspaceBrowseTree?.querySelectorAll('button[data-browse-section]').forEach(btn => btn.classList.toggle('active', btn.dataset.browseSection === section));
 if(section === 'workspaces') renderWorkspaceFolderTree();
}

function showWorkspaceBrowsePage(section = 'workspaces'){
 closeWorkspaceNavigator();
 const screenList = document.getElementById('screen-list');
 screenList?.classList.remove('browse-mode');
 screenList?.classList.add('show-folder-levels');
 if(workspaceBrowsePage) workspaceBrowsePage.hidden = false;
 renderWorkspaceFolderTree();
}

function hideWorkspaceBrowsePage(){
 const screenList = document.getElementById('screen-list');
 screenList?.classList.remove('browse-mode');
 screenList?.classList.remove('show-folder-levels');
 if(workspaceBrowsePage) workspaceBrowsePage.hidden = true;
}

function openWorkspaceNavigator(section = 'workspaces'){
 renderWorkspaceNavigator(section);
 if(workspaceNavigator) workspaceNavigator.hidden = false;
}

function closeWorkspaceNavigator(){
 if(workspaceNavigator) workspaceNavigator.hidden = true;
}

function closeWorkspaceNavigatorColumnMenu(){
 document.querySelector('.workspace-nav-column-menu')?.remove();
}

function openWorkspaceNavigatorColumnMenu(colKey, anchorEl, position){
 closeWorkspaceNavigatorColumnMenu();
 const col = workspaceNavigatorColumns.find(c => c.key === colKey) || workspaceNavigatorColumns[0];
 const hiddenCols = workspaceNavigatorColumns.filter(c => !c.locked && workspaceNavigatorHiddenCols.has(c.key));
 const menu = document.createElement('div');
 menu.className = 'sheet-column-menu workspace-nav-column-menu';
 const rect = anchorEl?.getBoundingClientRect?.() || {left:position?.x || 120, bottom:position?.y || 120};
 const left = Math.min(Math.max(8, Number.isFinite(position?.x) ? position.x : rect.left), Math.max(8, window.innerWidth - 260));
 const top = Math.min(Math.max(8, Number.isFinite(position?.y) ? position.y : rect.bottom + 4), Math.max(8, window.innerHeight - 260));
 menu.style.left = `${left}px`;
 menu.style.top = `${top}px`;
 const hideButton = col.locked ? '' : `<button type="button" data-act="hide"><span class="menu-ic">H</span>Hide Column</button>`;
 const showButtons = hiddenCols.length
  ? hiddenCols.map(c => `<button type="button" data-show-col="${c.key}"><span class="menu-ic">✓</span>${escapeHtml(c.label)}</button>`).join('')
  : '<button type="button" disabled><span class="menu-ic">-</span>No hidden columns</button>';
 menu.innerHTML = `
  <div class="menu-title">${escapeHtml(col.label)}</div>
  ${hideButton}
  <div class="menu-sep"></div>
  <button type="button" data-act="show-all" ${hiddenCols.length ? '' : 'disabled'}><span class="menu-ic">S</span>Show all columns</button>
  <div class="menu-title">Show Columns</div>
  ${showButtons}
 `;
 menu.addEventListener('click', (e) => {
  const hide = e.target.closest('button[data-act="hide"]');
  const showAll = e.target.closest('button[data-act="show-all"]');
  const showCol = e.target.closest('button[data-show-col]');
  if(!hide && !showAll && !showCol) return;
  e.preventDefault();
  e.stopPropagation();
  if(hide && !col.locked) workspaceNavigatorHiddenCols.add(col.key);
  if(showAll) workspaceNavigatorHiddenCols.clear();
  if(showCol) workspaceNavigatorHiddenCols.delete(showCol.dataset.showCol);
  renderWorkspaceNavigator(workspaceNavigatorSection);
  closeWorkspaceNavigatorColumnMenu();
 });
 document.body.appendChild(menu);
 setTimeout(() => {
  const close = (e) => {
   if(!menu.contains(e.target) && e.target !== anchorEl){
    closeWorkspaceNavigatorColumnMenu();
    document.removeEventListener('mousedown', close, true);
   }
  };
  document.addEventListener('mousedown', close, true);
 }, 0);
}

function openWorkspaceNavigatorItem(row){
 const projectIndex = Number(row.dataset.projectI);
 const folderRaw = row.dataset.folderI;
 const folderIndex = folderRaw === '' ? null : Number(folderRaw);
 const kind = row.dataset.kind;
 closeWorkspaceNavigator();
 if(kind === 'project' || folderIndex === null){
  openDetail(projectIndex);
  return;
 }
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 if(item.type === 'report') openReport(projectIndex, folderIndex);
 else if(item.type === 'dashboard') openDashboard(projectIndex, folderIndex);
 else if(isWorkFile(item)) openSheet(projectIndex, folderIndex);
 else openDetail(projectIndex);
}

function openProjectListFromWorkspaceTrigger(){
 if(activeSheetContext && Number.isInteger(activeSheetContext.projectIndex)){
  if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
  const ctx = {...activeSheetContext};
  workspaceBrowseFocusContext = {projectIndex: ctx.projectIndex, folderIndex: Number.isInteger(ctx.folderIndex) ? ctx.folderIndex : null};
  closeWorkspaceItemMenu?.();
  closeContextMenu?.();
  closeLayoutMenu?.();
  closeWorkspaceBrowseCreateMenu?.();
  closeFavorites?.();
  setRailActive('projects');
  updateProjectListHeader('projects');
  openDetail(ctx.projectIndex);
  requestAnimationFrame(() => {
   const row = document.querySelector(`#folderRows tr[data-folder-i="${ctx.folderIndex}"]`);
   row?.scrollIntoView({block:'center'});
  });
  return;
 }
 openRailProjectList('projects', true);
}

workspaceNavTrigger?.addEventListener('click', openProjectListFromWorkspaceTrigger);
workspaceNavigatorClose?.addEventListener('click', closeWorkspaceNavigator);
workspaceNavigator?.addEventListener('mousedown', (e) => {
 if(e.target === workspaceNavigator) closeWorkspaceNavigator();
});
workspaceNavTree?.addEventListener('click', (e) => {
 const btn = e.target.closest('button[data-nav-section]');
 if(btn) renderWorkspaceNavigator(btn.dataset.navSection);
});
workspaceNavigatorRows?.addEventListener('click', (e) => {
 const row = e.target.closest('tr[data-project-i]');
 if(row) openWorkspaceNavigatorItem(row);
});
function closeWorkspaceBrowseCreateMenu(){
 workspaceBrowseCreateMenu?.classList.remove('show');
}

function openWorkspaceBrowseCreateMenu(anchorEl){
 if(!workspaceBrowseCreateMenu || !anchorEl) return;
 closeContextMenu();
 closeLayoutMenu();
 closeFavorites?.();
 const rect = anchorEl.getBoundingClientRect();
 const left = Math.max(10, Math.min(rect.left, window.innerWidth - 282));
 const top = Math.max(10, Math.min(rect.bottom + 8, window.innerHeight - 300));
 workspaceBrowseCreateMenu.style.left = left + 'px';
 workspaceBrowseCreateMenu.style.top = top + 'px';
 workspaceBrowseCreateMenu.classList.add('show');
}

function handleWorkspaceBrowseCreate(action){
 const projectIndex = getWorkspaceBrowseProjectIndex();
 if(action === 'workspace'){
  closeWorkspaceBrowseCreateMenu();
  createProjectFromButton();
  workspaceBrowseFocusContext = {projectIndex: activeProjectIndex, folderIndex:null};
  renderWorkspaceFolderTree();
  return;
 }
 if(projectIndex === null || !PROJECT_FOLDERS[projectIndex]){
  alert('Chọn một dự án trước khi tạo file/folder.');
  return;
 }
 closeWorkspaceBrowseCreateMenu();
 if(action === 'sheet'){
  workspaceBrowseFocusContext = {projectIndex, folderIndex:null};
  activeProjectIndex = projectIndex;
  openSheetNameModal(projectIndex);
  return;
 }
 const createActions = {
  report: {type:'report', name:'New Report', label:'Report'},
  dashboard: {type:'dashboard', name:'New Dashboard', label:'Dashboard'},
  folder: {type:'folder', name:'New Folder', label:'Folder'}
 };
 const config = createActions[action];
 if(config){
  workspaceBrowseFocusContext = {projectIndex, folderIndex:null};
  activeProjectIndex = projectIndex;
  createWorkspaceItem(projectIndex, config.type, config.name, config.label);
  refreshWorkspaceFolderTreeIfVisible();
 }
}

workspaceBrowseCreateBtn?.addEventListener('click', (e) => {
 e.preventDefault();
 e.stopPropagation();
 openWorkspaceBrowseCreateMenu(workspaceBrowseCreateBtn);
});

workspaceBrowseCreateMenu?.addEventListener('click', (e) => {
 e.stopPropagation();
 const btn = e.target.closest('[data-browse-create]');
 if(!btn) return;
 handleWorkspaceBrowseCreate(btn.dataset.browseCreate);
});
workspaceBrowseRows?.addEventListener('click', (e) => {
 const row = e.target.closest('tr[data-project-i]');
 if(row) openWorkspaceNavigatorItem(row);
});
workspaceBrowseTree?.addEventListener('click', (e) => {
 const folderBtn = e.target.closest('button[data-browse-folder-i]');
 if(folderBtn){
  const projectIndex = Number(folderBtn.dataset.browseProjectI);
  const folderIndex = Number(folderBtn.dataset.browseFolderI);
  const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
  if(!item) return;
  if(item.type === 'report') openReport(projectIndex, folderIndex);
  else if(item.type === 'dashboard') openDashboard(projectIndex, folderIndex);
  else if(isWorkFile(item)) openSheet(projectIndex, folderIndex);
  else openDetail(projectIndex);
  return;
 }
 const projectBtn = e.target.closest('button[data-browse-project-i]');
 if(projectBtn){
  const projectIndex = Number(projectBtn.dataset.browseProjectI);
  if(Number.isInteger(projectIndex)){
   workspaceBrowseFocusContext = {projectIndex, folderIndex:null};
   activeProjectIndex = projectIndex;
   renderWorkspaceFolderTree();
  }
  return;
 }
 const btn = e.target.closest('button[data-browse-section]');
 if(btn) renderWorkspaceBrowsePage(btn.dataset.browseSection);
});
workspaceNavigatorHeadRow?.addEventListener('contextmenu', (e) => {
 const head = e.target.closest('th[data-nav-col]');
 if(!head) return;
 e.preventDefault();
 e.stopPropagation();
 openWorkspaceNavigatorColumnMenu(head.dataset.navCol, head, {x:e.clientX, y:e.clientY});
});
workspaceNavigatorHeadRow?.addEventListener('click', (e) => {
 const btn = e.target.closest('[data-nav-col-menu]');
 if(!btn) return;
 e.preventDefault();
 e.stopPropagation();
 openWorkspaceNavigatorColumnMenu(btn.dataset.navColMenu, btn);
});

function createProjectFromButton(){
 closeContextMenu();
 closeLayoutMenu();
 closeFavorites?.();
 const defaultIndex = DATA.length + 1;
 const name = prompt('Tên dự án mới:', `Dự án mới ${defaultIndex}`);
 if(!name || !name.trim()) return;
 const cleanName = name.trim();
 const today = new Date().toLocaleDateString('vi-VN');
 const project = {
  name: cleanName,
  sub: 'Chưa cập nhật địa điểm',
  shared: false,
  owner: 'Quân',
  updated: today,
  fav: false
 };
 DATA.push(project);
 PROJECT_FOLDERS.push(normalizeProjectFolderSet([]));
 activeProjectIndex = DATA.length - 1;
 render();
 persistToDrive();
 requestAnimationFrame(() => {
  const row = rows.querySelector(`tr[data-i="${activeProjectIndex}"]`);
  row?.scrollIntoView({block:'center'});
  row?.classList.add('ctx-selected');
  setTimeout(() => row?.classList.remove('ctx-selected'), 1400);
 });
}

document.querySelectorAll('.create-project-btn').forEach(btn => {
 btn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  createProjectFromButton();
 });
});

function updateActiveProjectRows(){
 rows.querySelectorAll('tr').forEach(row => {
 row.classList.toggle('active-project', Number(row.dataset.i) === activeProjectIndex);
 });
}

let isColumnResizing = false;

function resizeProjectColumn(e){
 if(!isColumnResizing) return;
 const mainLeft = main.getBoundingClientRect().left;
 setProjectColumnWidth(e.clientX - mainLeft);
}

function finishColumnResize(e){
 if(!isColumnResizing) return;
 isColumnResizing = false;
 document.body.classList.remove('resizing-columns');
 columnResizer.releasePointerCapture?.(e.pointerId);
 const currentWidth = parseFloat(getComputedStyle(main).getPropertyValue('--project-column-size'));
 if(Number.isFinite(currentWidth)) setProjectColumnWidth(currentWidth, true);
}

columnResizer.addEventListener('pointerdown', (e)=>{
 if(window.innerWidth <= 760 || !main.classList.contains('detail-open')) return;
 e.preventDefault();
 isColumnResizing = true;
 document.body.classList.add('resizing-columns');
 columnResizer.setPointerCapture?.(e.pointerId);
 resizeProjectColumn(e);
});
columnResizer.addEventListener('pointermove', resizeProjectColumn);
columnResizer.addEventListener('pointerup', finishColumnResize);
columnResizer.addEventListener('pointercancel', finishColumnResize);

window.addEventListener('resize', ()=>{
 if(window.innerWidth <= 760) return;
 const currentWidth = parseFloat(getComputedStyle(main).getPropertyValue('--project-column-size'));
 if(Number.isFinite(currentWidth)) setProjectColumnWidth(currentWidth, true);
});

// ---------- popover yêu thích ----------
const favoritesRail = document.getElementById('favoritesRail');
const favoritesPopover = document.getElementById('favoritesPopover');
const favoritesSearch = document.getElementById('favoritesSearch');
const favoriteList = document.getElementById('favoriteList');
const favoritesTitle = document.getElementById('favoritesTitle');

function favoriteMatches(p){
 const q = favoritesSearch.value.trim().toLowerCase();
 return !q || p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q);
}

function renderFavorites(){
 if(!favoriteList) return;
 const projectFavorites = DATA.map((p, i) => ({
 type:'project',
 name:p.name,
 sub:p.sub,
 projectIndex:i,
 icon:'▱',
 fav:p.fav
 })).filter(p => p.fav);
 const folderFavorites = PROJECT_FOLDERS.flatMap((folders, projectIndex) =>
 folders.map((f, folderIndex) => ({
 type:'folder',
 name:f.name,
 sub:DATA[projectIndex].name,
 projectIndex,
 folderIndex,
 itemType:f.type,
 iconItem:f,
 fav:f.fav
 }))
 ).filter(f => f.fav);
 const favorites = [...projectFavorites, ...folderFavorites];
 const visible = favorites.filter(favoriteMatches);
 favoritesTitle.textContent = `Yêu thích (${favorites.length})`;
 favoriteList.innerHTML = visible.length
 ? visible.map(p => `
 <div class="favorite-item" data-type="${p.type}" data-project-i="${p.projectIndex}" data-folder-i="${p.folderIndex ?? ''}">
 <span class="favorite-doc workspace-type-wrap">${workspaceItemIconHtml(p.iconItem || p.itemType || p.type)}</span>
 <span class="favorite-text">
 <span class="favorite-name">${p.name}</span>
 <span class="favorite-meta">${p.sub}</span>
 </span>
 </div>`).join('')
 : '<div class="favorite-empty">Chưa có mục yêu thích phù hợp.</div>';
}

function openFavorites(){
 renderFavorites();
 favoritesPopover.classList.add('show');
 favoritesRail.classList.add('fav-open');
 if(window.innerWidth > 760) favoritesSearch.focus();
}

function closeFavorites(){
 favoritesPopover.classList.remove('show');
 favoritesRail.classList.remove('fav-open');
}

favoritesRail.addEventListener('click', (e)=>{
 e.stopPropagation();
 setRailActive('favorites');
 favoritesPopover.classList.contains('show') ? closeFavorites() : openFavorites();
});

favoritesPopover.addEventListener('click', (e)=> e.stopPropagation());
favoritesSearch.addEventListener('input', renderFavorites);
favoriteList.addEventListener('click', (e)=>{
 const item = e.target.closest('.favorite-item');
 if(!item) return;
 closeFavorites();
 const projectIndex = Number(item.dataset.projectI);
 openDetail(projectIndex);
 if(item.dataset.type === 'folder'){
 const folderIndex = Number(item.dataset.folderI);
 const folderItem = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(isWorkFile(folderItem)){
 openSheet(projectIndex, folderIndex);
 return;
 }
 const row = document.querySelector(`#folderRows tr[data-folder-i="${folderIndex}"]`);
 row?.scrollIntoView({block:'center'});
 }
});

document.addEventListener('keydown', (e)=>{
 if(e.key === 'Escape') closeFavorites();
 closeWorkspaceItemMenu();
});

// ---------- menu chuột phải ----------
const ctxMenu = document.getElementById('ctxMenu');
const ctxTitle = document.getElementById('ctxTitle');
const ctxFavoriteText = document.getElementById('ctxFavoriteText');
const tableWrap = document.querySelector('.table-wrap');
const sheetNameModal = document.getElementById('sheetNameModal');
const sheetNameInput = document.getElementById('sheetNameInput');
const sheetNameOk = document.getElementById('sheetNameOk');
const sheetNameCancel = document.getElementById('sheetNameCancel');
const sheetNameClose = document.getElementById('sheetNameClose');
const topActionButtons = document.querySelectorAll('.top-actions-btn');
const topDeleteButtons = document.querySelectorAll('.top-delete-btn');
const quickGridButtons = document.querySelectorAll('.quick-grid-btn');
const layoutMenu = document.getElementById('layoutMenu');
const appShell = document.querySelector('.app');
const railToggleBtn = document.getElementById('railToggleBtn');
const navBackBtn = document.getElementById('navBackBtn');
const navForwardBtn = document.getElementById('navForwardBtn');
const appUserNameBtn = document.getElementById('appUserNameBtn');
const detailBody = document.querySelector('.detail-body');
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
const googleSheetStage = document.getElementById('googleSheetStage');
const googleSheetSetup = document.getElementById('googleSheetSetup');
const googleSheetFrame = document.getElementById('googleSheetFrame');
const googleSheetUrlInput = document.getElementById('googleSheetUrlInput');
const saveGoogleSheetUrl = document.getElementById('saveGoogleSheetUrl');
const createGoogleSheetLink = document.getElementById('createGoogleSheetLink');
const openGoogleSheetLink = document.getElementById('openGoogleSheetLink');
const googleSheetCreateNote = document.getElementById('googleSheetCreateNote');
const sheetStatus = document.getElementById('sheetStatus');
let ctxProjectIndex = null;
let pendingGridProjectIndex = null;
let activeSheetContext = null;
var workspaceBrowseFocusContext = null;
let activeAttachmentRow = null;
let activeAttachmentSource = null;
let editingCell = null;
let isSelectingRange = false;
let selRangeAnchor = null;
let selRangeEnd = null;
let isSelectingReportRange = false;
let reportRangeAnchor = null;
let reportRangeEnd = null;
let sheetColumnSelectAnchor = null;
let sheetColumnSelection = null;
let formatPainterSource = null; // {styles:{'r_c':{...}}, sampleStyle:{...}} — cọ định dạng
let formatPainterLocked = false;
// Biến tạm để phân biệt click vs dblclick trên nút cọ
// Dan URL /exec sau khi Deploy > New deployment > Web app cho project "QLDA Sheet Factory Test"
// (Execute as: Me, Who has access: tuy ban). URL nay dung cho ca tao Sheet, doc du lieu (getdata)
// va luu tung o (setdata). De trong neu UI chay trong Apps Script va dung google.script.run.
// ===== APPS SCRIPT BACKEND (google.script.run) =====
// Khi serve HTML từ Apps Script, dùng google.script.run thay vì fetch

// URL cho Sheet Factory (tạo Google Sheet thật — để trống nếu không dùng)
var SHEET_FACTORY_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwVf0ft1nCwezmG10Fy2j8bqeVyVlpJjAf__FtLvKcMXcH2KNPGvjYtt94-oP-u5ffk/exec';

// ===== GOOGLE DRIVE API DIRECT UPLOAD =====
// Dán OAuth Client ID Web app vào đây, hoặc bấm nút Drive API trong giao diện để lưu tạm vào trình duyệt.
// Khi chạy local, mở qua http://localhost hoặc http://127.0.0.1; OAuth web không ổn định với file://.
const DRIVE_DIRECT_CLIENT_ID_KEY = 'qlda_drive_api_client_id';
let DRIVE_DIRECT_CLIENT_ID = localStorage.getItem(DRIVE_DIRECT_CLIENT_ID_KEY) || '1053895269686-6m3sqmr8n7f9kl27voblvr6p9628smip.apps.googleusercontent.com';
const DRIVE_DIRECT_ROOT_FOLDER = 'DU_AN_WEB_QUAN_LY';
const DRIVE_DIRECT_SCOPE = 'https://www.googleapis.com/auth/drive';
const DRIVE_DIRECT_RESUMABLE_THRESHOLD = 8 * 1024 * 1024;
let driveDirectTokenClient = null;
let driveDirectAccessToken = '';
let driveDirectTokenExpiresAt = 0;

/** Load data từ Drive JSON qua Apps Script backend */
function loadFromDrive() {
  if(!window.google?.script?.run){
    showSaveStatus('saving');
    loadProjectDiskBackup()
      .catch(err => {
        console.warn('Cannot load project disk backup:', err);
        loadProjectLocalBackup();
      })
      .finally(() => {
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

/** Save data xuống Drive JSON qua Apps Script backend */
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
  uiState: collectProjectUiState()
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
  if(!saved || !Array.isArray(saved.projects) || !Array.isArray(saved.folders)) return false;
  DATA.length = 0;
  saved.projects.forEach(item => DATA.push(item));
  PROJECT_FOLDERS.length = 0;
  saved.folders.forEach(item => PROJECT_FOLDERS.push(item));
  applyProjectUiState(saved.uiState);
  return true;
 }catch(err){
  console.warn('Cannot load local project backup:', err);
  return false;
 }
}

function applyProjectSnapshot(saved){
 if(!saved || !Array.isArray(saved.projects) || !Array.isArray(saved.folders)) return false;
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

// ===== Khởi tạo khi app load =====
function initAuth() {
  render();
  refreshWorkspaceFolderTreeIfVisible();
  loadFromDrive();
}











// ===== Khởi tạo khi app load =====
// ===== Drive API stubs — data lưu qua persistToDrive() =====
async function saveProjectData(projectId, projectData) {
  persistToDrive();
  return Promise.resolve();
}

async function loadProjectData(projectId) {
  return Promise.resolve(null);
}

const GOOGLE_SHEET_TEMPLATE_ID = '';

function getActionProjectIndex(){
 if(activeProjectIndex !== null && DATA[activeProjectIndex]) return activeProjectIndex;
 const selectedRow = rows.querySelector('.active-project') || rows.querySelector('tr');
 return selectedRow ? Number(selectedRow.dataset.i) : null;
}

function prepareProjectActionMenu(projectIndex){
 if(projectIndex === null || !DATA[projectIndex]) return false;
 ctxProjectIndex = projectIndex;
 const p = DATA[ctxProjectIndex];
 ctxTitle.textContent = p.name;
 ctxFavoriteText.textContent = p.fav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích';
 rows.querySelectorAll('tr').forEach(row => {
 row.classList.toggle('ctx-selected', Number(row.dataset.i) === ctxProjectIndex);
 });
 return true;
}

function showProjectActionMenu(projectIndex, x, y){
 if(!prepareProjectActionMenu(projectIndex)) return;
 closeFavorites();
 const menuWidth = 600;
 const menuHeight = 520;
 ctxMenu.style.left = Math.max(10, Math.min(x, window.innerWidth - menuWidth)) + 'px';
 ctxMenu.style.top = Math.max(10, Math.min(y, window.innerHeight - menuHeight)) + 'px';
 ctxMenu.classList.add('show');
}

tableWrap.addEventListener('contextmenu', (e)=>{
 const tr = e.target.closest('#rows tr');
 if(!tr){
  e.preventDefault();
  e.stopPropagation();
  showWorkspaceLayoutMenuAt(e.clientX, e.clientY);
  return;
 }
 e.preventDefault();
 showProjectActionMenu(Number(tr.dataset.i), e.clientX, e.clientY);
});

const projectBlankTarget = document.getElementById('projectBlankTarget');
if(projectBlankTarget){
 const openProjectBlankCreateMenu = (e) => {
  if(activeProjectIndex === null && DATA.length) activeProjectIndex = 0;
  e.preventDefault();
  e.stopPropagation();
  showWorkspaceLayoutMenuAt(e.clientX, e.clientY);
 };
 projectBlankTarget.addEventListener('contextmenu', openProjectBlankCreateMenu);
}

function closeContextMenu(){
 ctxMenu.classList.remove('show');
 rows.querySelectorAll('tr').forEach(row => row.classList.remove('ctx-selected'));
}

function closeLayoutMenu(){
 layoutMenu.classList.remove('show');
}

function showWorkspaceLayoutMenuAt(x, y){
 closeWorkspaceItemMenu?.();
 closeContextMenu();
 closeFavorites?.();
 const left = Math.max(10, Math.min(x, window.innerWidth - 282));
 const top = Math.max(10, Math.min(y, window.innerHeight - 340));
 layoutMenu.style.left = left + 'px';
 layoutMenu.style.top = top + 'px';
 layoutMenu.classList.add('show');
}

function notifyAction(text){
 alert(text);
}

function workspaceItemIconType(type){
 const raw = String(type || '').toLowerCase();
 if(raw.includes('report')) return 'report';
 if(raw.includes('folder') || raw.includes('workspace')) return 'folder';
 return 'sheet';
}

function workspaceItemVisualType(item){
 if(item && typeof item === 'object'){
  const rawType = String(item.type || item.itemType || '').toLowerCase();
  const rawKind = String(item.kind || '').toLowerCase();
  if(rawKind === 'folder-sheet') return 'sheet';
  if(rawKind.includes('folder') || rawType.includes('folder') || rawType.includes('workspace')) return 'folder';
  if(rawType.includes('report')) return 'report';
  return workspaceItemIconType(rawType);
 }
 return workspaceItemIconType(item);
}

function isWorkspaceFolderLike(item){
 if(!item || typeof item !== 'object') return false;
 const rawType = String(item.type || '').toLowerCase();
 const rawKind = String(item.kind || '').toLowerCase();
 return rawKind.includes('folder') || rawType.includes('folder') || rawType.includes('workspace');
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

function workspaceItemIconHtml(type, extraClass = ''){
 const iconType = workspaceItemVisualType(type);
 const size = extraClass.includes('menu') ? 20 : 28;
 const className = `m365-type-icon ${iconType} ${extraClass}`.trim();
 return `<span class="${className}" aria-hidden="true">${getItemIconSVG(iconType, size)}</span>`;
}

function workspaceItemIcon(type){
 return workspaceItemIconHtml(type);
}

function setActiveSheetIcon(itemOrType = 'sheet'){
 const iconWrap = document.querySelector('#gridSheetView .grid-sheet-icon');
 if(!iconWrap) return;
 iconWrap.innerHTML = workspaceItemIconHtml(itemOrType);
}

function upgradeLegacyTypeIcons(root = document){
 root.querySelectorAll('.sm-type-icon').forEach(el => {
 const type = el.classList.contains('report') ? 'report' : (el.classList.contains('folder') ? 'folder' : 'sheet');
 const extraClass = el.classList.contains('menu') ? 'menu' : '';
 el.outerHTML = workspaceItemIconHtml(type, extraClass);
 });
}

upgradeLegacyTypeIcons();

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

const driveProjectFileMap = {};

const APP_USER_NAME_KEY = 'appUserName';
let appUserName = localStorage.getItem(APP_USER_NAME_KEY) || '';

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

// Backward compat: extract labels for existing code
const SHEET_HEADER_TEMPLATE = SHEET_COLUMN_CONFIG.map(c => c.label);

function sampleRowsForArchiveSheet(sheetName){
 const samples = {
  '01_HOP_DONG_PHAP_LY': [
   ['📎','green','1','Hợp đồng - pháp lý','Gói thầu xây lắp','01/HĐ-XL','08/07/2026','Hợp đồng thi công xây dựng công trình','UBND xã','Quân Trinh','15/07/2026','250000000','Đã đủ','Lưu hợp đồng, phụ lục, bảo lãnh'],
   ['📎','yellow','2','Hợp đồng - pháp lý','Bảo lãnh thực hiện hợp đồng','BL-01','09/07/2026','Bảo lãnh thực hiện hợp đồng của nhà thầu','Ngân hàng','Quân Trinh','16/07/2026','12500000','Đang xử lý','Chờ bản gốc']
  ],
  '02_VAT_LIEU_CO_CQ': [
   ['📎','yellow','1','Trình duyệt vật liệu','Xi măng','TDVL-01','08/07/2026','Trình duyệt vật liệu xi măng PCB40','Nhà thầu','Nguyễn Văn Hùng','12/07/2026','','Đang xử lý','Đính kèm catalogue, CO CQ'],
   ['📎','green','2','CO CQ','Thép D10-D16','COCQ-02','09/07/2026','CO CQ thép xây dựng đợt 1','Nhà cung cấp','Nguyễn Văn Hùng','13/07/2026','','Đã đủ','Đã đối chiếu lô hàng']
  ],
  '03_THI_CONG_NGHIEM_THU': [
   ['📎','green','1','Nghiệm thu công việc','Móng tuyến chính','NTCV-01','10/07/2026','Nghiệm thu đào móng và đổ bê tông lót','Tư vấn giám sát','Bùi Văn Toàn','10/07/2026','','Đã nghiệm thu','Có biên bản và ảnh hiện trường'],
   ['📎','yellow','2','Nghiệm thu công việc','Lắp dựng cốt thép','NTCV-02','11/07/2026','Nghiệm thu cốt thép trước khi đổ bê tông','Tư vấn giám sát','Bùi Văn Toàn','11/07/2026','','Cần đối chiếu','Chờ ảnh bổ sung']
  ],
  '04_THANH_TOAN_QUYET_TOAN': [
   ['📎','yellow','1','Thanh toán','Đợt 1','TT-01','15/07/2026','Hồ sơ thanh toán khối lượng hoàn thành đợt 1','Nhà thầu','Quân Trinh','20/07/2026','80000000','Đang xử lý','Đối chiếu bảng khối lượng'],
   ['📎','','2','Quyết toán','Hoàn công','QT-01','','Hồ sơ quyết toán hoàn thành công trình','Nhà thầu','Quân Trinh','','','Chưa có','Tạo sau khi nghiệm thu hoàn thành']
  ],
  '05_TONG_HOP_DOI_CHIEU': [
   ['📎','green','1','Danh mục','Tổng hợp hồ sơ','DM-01','08/07/2026','Danh mục hồ sơ toàn dự án','Ban QLDA','Quân Trinh','15/07/2026','','Đang xử lý','Dùng để kiểm tra thiếu/đủ'],
   ['📎','yellow','2','Đối chiếu','Vật liệu - thanh toán','DC-01','12/07/2026','Đối chiếu vật liệu đã nghiệm thu với hồ sơ thanh toán','Ban QLDA','Quân Trinh','18/07/2026','','Cần đối chiếu','Lọc theo nhóm hồ sơ']
  ],
  'REPOST_CARRY_FORWARD': [
   ['📎','green','1','Báo cáo định kỳ','Cấu trúc giữ lại','RP-01','13/07/2026','Dòng mẫu để thử Repost Carry Forward','Ban QLDA','Quân Trinh','20/07/2026','12500000','Đang xử lý','Dùng nút Carry Forward để giữ cấu trúc'],
   ['📎','yellow','2','Báo cáo định kỳ','Số liệu kỳ này','RP-02','13/07/2026','Dòng mẫu có số liệu sẽ được xử lý khi repost','Nhà thầu','Trần Dũng','20/07/2026','8500000','Cần đối chiếu','Kiểm tra trước khi repost']
  ]
 };
 return samples[sheetName] || samples['05_TONG_HOP_DOI_CHIEU'];
}

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
 text:'A1',
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
 }[type] || 'A1';
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

/** ===== Định dạng chữ thủ công theo ô kiểu Word/Excel cơ bản (Bold/Italic/Underline/Strike, màu chữ, màu nền, căn lề) =====
 * Lưu vào sheet._cellStyles theo key "r_c", chỉ giữ field khác mặc định để JSON gọn nhẹ.
 * Áp dụng cho CẢ VÙNG đang bôi đen (selRangeAnchor→selRangeEnd), không chỉ 1 ô — giống thao tác Excel thật. */
function ensureCellStyles(sheet){
 if(!sheet._cellStyles || typeof sheet._cellStyles !== 'object') sheet._cellStyles = {};
 return sheet._cellStyles;
}
function getCellStyle(sheet, r, c){
 return (sheet._cellStyles && sheet._cellStyles[`${r}_${c}`]) || null;
}
/** Chạy fn(r,c) cho từng ô trong vùng đang chọn, bỏ qua dòng tiêu đề (0) và cột đính kèm/trạng thái (0,1) vì có giao diện riêng. */
function forEachSelectedCell(sheet, fn){
 const activeEl = sheetGridWrap.querySelector('.sheet-cell.active-cell');
 const row = activeEl ? Number(activeEl.dataset.r) : 0;
 const col = activeEl ? Number(activeEl.dataset.c) : 0;
 const range = getSelectedRange(row, col);
 for(let r = range.r1; r <= range.r2; r++){
 if(r === 0) continue;
 for(let c = range.c1; c <= range.c2; c++){
 if(c === 0 || c === 1) continue;
 fn(r, c);
 }
 }
}
function setCellStyleEntry(styles, key, mutate){
 const st = Object.assign({}, styles[key]);
 mutate(st);
 if(Object.keys(st).length) styles[key] = st; else delete styles[key];
}
/** Bật/tắt 1 thuộc tính boolean (bold/italic/underline/strike) cho cả vùng chọn.
 * Nếu ô đầu vùng đang bật thì tắt hết vùng, ngược lại bật hết vùng — giống Word/Excel. */
function toggleCellStyleFlag(sheet, flag){
 const before = createSheetUndoSnapshot(sheet);
 const styles = ensureCellStyles(sheet);
 let anchorOn = null;
 forEachSelectedCell(sheet, (r, c) => {
 if(anchorOn === null) anchorOn = !!(styles[`${r}_${c}`] && styles[`${r}_${c}`][flag]);
 });
 const turnOn = !anchorOn;
 forEachSelectedCell(sheet, (r, c) => {
 setCellStyleEntry(styles, `${r}_${c}`, st => { if(turnOn) st[flag] = true; else delete st[flag]; });
 });
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 pushSheetSnapshotUndo(sheet, before, createSheetUndoSnapshot(sheet), `format-${flag}`);
}
/** Gán 1 giá trị (màu chữ/màu nền/căn lề) cho cả vùng chọn. value rỗng nghĩa là xoá field đó (về mặc định). */
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

/* ===== Format Painter (Cọ định dạng) — chọn ô mẫu → bấm cọ → bấm ô đích ===== */
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

function formatFileSize(bytes){
 if(!Number.isFinite(bytes)) return '';
 if(bytes < 1024) return `${bytes} B`;
 if(bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
 return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}


function getAttachmentDriveId(file){
 const id = file && (file.driveId || file.fileId || file.id);
 return id && !String(id).startsWith('local-') ? String(id) : '';
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


function extractDriveIdFromUrl(url){
 const value = String(url || '');
 const match = value.match(/\/file\/d\/([^/]+)/) || value.match(/[?&]id=([^&]+)/);
 return match ? decodeURIComponent(match[1]) : '';
}

function getAttachmentPreviewHref(file){
 if(!file) return '';
 const driveId = getAttachmentDriveId(file) || extractDriveIdFromUrl(file.driveLink || file.webViewLink || file.fileUrl || file.url || file.link || file.openUrl);
 if(driveId) return `https://drive.google.com/file/d/${encodeURIComponent(driveId)}/preview`;
 return file.dataUrl || file.driveDownloadUrl || file.webContentLink || file.downloadUrl || getAttachmentOpenHref(file);
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

function cloneWorkspaceItem(item){
 const copy = {...item};
 if(Array.isArray(item.cells)){
 copy.cells = item.cells.map(row => {
 const clonedRow = [...row];
 if(row._level) clonedRow._level = row._level;
 if(row._collapsed) clonedRow._collapsed = row._collapsed;
 if(row._createdBy) clonedRow._createdBy = row._createdBy;
 if(row._createdAt) clonedRow._createdAt = row._createdAt;
 if(row._modifiedBy) clonedRow._modifiedBy = row._modifiedBy;
 if(row._modifiedAt) clonedRow._modifiedAt = row._modifiedAt;
 return clonedRow;
 });
 }
 if(item.attachments){
 copy.attachments = Object.fromEntries(
 Object.entries(item.attachments).map(([key, files]) => [key, files.map(file => ({...file}))])
 );
 }
 if(item._cellStyles && typeof item._cellStyles === 'object'){
 copy._cellStyles = JSON.parse(JSON.stringify(item._cellStyles));
 }
 if(item._formatRules && Array.isArray(item._formatRules)){
 copy._formatRules = item._formatRules.map(r => ({...r}));
 }
 if(item._sorts && Array.isArray(item._sorts)){
 copy._sorts = item._sorts.map(s => ({...s}));
 }
 if(item._filters && Array.isArray(item._filters)){
 copy._filters = item._filters.map(f => ({...f}));
 }
 if(item._config && typeof item._config === 'object'){
 copy._config = JSON.parse(JSON.stringify(item._config));
 }
 return copy;
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

/** ===== Kéo-đổi-độ-rộng-cột kiểu Excel, áp dụng cho cả Sheet (Grid) và Report =====
 * Độ rộng lưu vào localStorage nên giữ được lâu dài trên máy này, theo từng cột cụ thể của từng Sheet/Report. */
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
/** Gắn tay kéo đổi độ rộng vào mỗi <th data-col-key> của 1 bảng .grid-sheet-table.
 * skipPositions: Set các vị trí cột (0-based, tính theo thứ tự <th> trong <tr> đầu) không cho kéo —
 * dùng cho cột có CSS cố định riêng (ví dụ cột ghim/đóng băng) để tránh xung đột layout. */
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
 // Bảng dạng lưới, giống Excel — luôn hiện lưới tự vẽ, sửa trực tiếp trong trình duyệt.
 // Việc liên kết Google Sheet thật là tuỳ chọn, không bắt buộc và không cần backend.
 googleSheetStage.style.display = 'none';
 googleSheetFrame.style.display = 'none';
 googleSheetFrame.removeAttribute('src');
 sheetGridWrap.style.display = 'flex';
 openGoogleSheetLink.disabled = !url;
 sheetStatus.textContent = url
 ? 'Bảng dạng lưới giống Excel · đã liên kết Google Sheet · bấm "Mở Google Sheet" để xem bản gốc'
 : 'Bảng dạng lưới giống Excel · sửa trực tiếp, bấm "⬇ Xuất Excel" để tải file .xlsx';
}

function exportSheetToExcel(sheet){
 const cells = ensureSheetCells(sheet);
 const ws = XLSX.utils.aoa_to_sheet(cells);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws, 'Data');
 XLSX.writeFile(wb, (sheet.name || 'Sheet') + '.xlsx');
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

/** Goi Apps Script Web App bang POST (dung cho payload lon nhu file dinh kem, tranh gioi han do dai URL cua JSONP). */
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

function getActiveProjectName(){
 return activeSheetContext && DATA[activeSheetContext.projectIndex]
 ? DATA[activeSheetContext.projectIndex].name
 : '';
}

function getActiveArchiveFolderName(sheet){
 return sheet?.uploadFolder || sheet?.name || '';
}

/** ===== Luu/tai toan bo du lieu 1 Sheet len Google Drive (khong can lien ket Google Sheet thật) =====
 * Giai quyet han che: du lieu luoi truoc gio chi nam trong bo nho JS trinh duyet, mat khi tai lai trang.
 */
const pendingSheetDataSaveTimers = {};
function scheduleSheetDataSave(sheet){
 if(!sheet || !sheet.name) return;
 const key = sheet.name;
 if(pendingSheetDataSaveTimers[key]) window.clearTimeout(pendingSheetDataSaveTimers[key]);
 pendingSheetDataSaveTimers[key] = window.setTimeout(()=>{
 delete pendingSheetDataSaveTimers[key];
 saveSheetDataToWebApp(sheet).catch(()=>{ /* im lang, khong lam gian doan thao tac cua nguoi dung */ });
 }, 1200);
}

function buildSheetSavePayload(sheet){
 const project = getActiveProjectName();
 if(!project || !sheet || !sheet.name) return null;
 const cells = ensureSheetCells(sheet);
 // _level/_collapsed la thuoc tinh gan them tren mang (khong phai chi so) nen JSON.stringify se bo qua ->
 // phai tach rieng ra thanh mang rowMeta de luu, roi gan lai khi tai ve (xem loadSheetDataFromWebApp).
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
  persistToDrive(); // sync toàn bộ data lên Drive
 const payload = buildSheetSavePayload(sheet);
 if(!payload) return Promise.resolve();
 // Use new Drive API backend
 persistToDrive(); return Promise.resolve();
}

/** Tai lai du lieu da luu tren Drive (neu co) cho 1 Sheet. Tra ve null neu chua tung luu. */
function loadSheetDataFromWebApp(project, sheetName){
 if(!project || !sheetName) return Promise.resolve(null);
 // Use new Drive API backend
  return Promise.resolve(null); // data loaded via loadFromDrive()
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
 // Use new Drive API backend - save all pending sheets
 // For now, we just save the active sheet. In a full implementation, we'd iterate all pending sheets.
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
 alert('Chưa cấu hình backend tạo Google Sheet. Hãy deploy ql_da_sheet_factory.gs rồi điền SHEET_FACTORY_WEB_APP_URL, hoặc chạy UI trong Apps Script để dùng createProjectSheet().');
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

/** ===== Thụt dòng (row hierarchy) kiểu Smartsheet =====
 * Cấp thụt dòng lưu trực tiếp trên chính mảng của dòng đó (row._level),
 * nên khi Sort/Filter đổi vị trí dòng thì cấp vẫn "dính" theo đúng dòng.
 */
const ROW_HIERARCHY_COL = 3;

function getRowLevel(row){
 return (row && row._level) || 0;
}

function rowHasChildren(cells, rowIndex){
 const next = cells[rowIndex + 1];
 if(!next) return false;
 return getRowLevel(next) > getRowLevel(cells[rowIndex]);
}

/** Trả về chỉ số dòng cuối cùng trong "nhánh con" của dòng rowIndex (dùng để kéo cả nhánh con theo khi thụt vào/ra). */
function getDescendantEndIndex(cells, rowIndex){
 const level = getRowLevel(cells[rowIndex]);
 let end = rowIndex;
 for(let i = rowIndex + 1; i < cells.length; i++){
 if(getRowLevel(cells[i]) > level) end = i; else break;
 }
 return end;
}

/** Tính tập hợp các dòng đang bị ẩn vì dòng cha của chúng đang Thu gọn. */
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

/** Danh sach cot co the chon de sap xep / loc / dinh dang (bo qua cot 0 la icon dinh kem). */
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


/** ===== Báo cáo (Report) — gộp dòng dữ liệu từ nhiều Sheet trong cùng 1 dự án, kiểu Smartsheet Report =====
 * Report không có dữ liệu riêng: nó chỉ lưu 1 "công thức" (_config) rồi mỗi lần mở sẽ quét
 * các Sheet nguồn trong PROJECT_FOLDERS[projectIndex] và gộp dòng lại theo Lọc/Nhóm/Tổng hợp/Sắp xếp.
 */
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

/** "Sheet" giả chỉ có header, dùng để tái sử dụng getPickableColumns()/renderColumnPickerList() cho Report. */
function getReportHeaderSheet(){
 return {cells: [SHEET_HEADER_TEMPLATE]};
}

function getReportColumns(){
 return getPickableColumns(getReportHeaderSheet()).filter(c => c.index !== 0);
}

/** Tất cả Sheet có thể chọn làm nguồn cho Report, gộp theo TỪNG dự án — giống Smartsheet nhóm nguồn theo Workspace.
 * Cho phép chọn Sheet ở BẤT KỲ dự án nào (không chỉ dự án đang chứa Report), vì mọi Sheet dùng chung 1 bộ cột
 * (SHEET_HEADER_TEMPLATE) nên gộp xuyên dự án không bị lỗi lệch cột như Smartsheet thật hay gặp.
 */
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

/** true nếu {projectIndex, folderIndex} đã có trong config.sources. */
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

/** Gộp toàn bộ dòng dữ liệu từ các Sheet nguồn đã chọn (có thể ở nhiều dự án khác nhau), áp Lọc + Tìm kiếm + Sắp xếp. */
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

/** Ghi 1 giá trị đã sửa trong Report ngược về đúng ô, đúng dòng ở Sheet nguồn (có thể ở dự án khác dự án đang mở Report). */

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

/** Chia danh sách dòng (đã lọc/sắp xếp) thành từng nhóm theo 1 cột, giữ nguyên thứ tự xuất hiện. */
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

// ===== Saved Filters =====
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

const FORMAT_RULE_COLORS = ['#FCE8E6', '#FEF7E0', '#E6F4EA', '#E8F0FE', '#F3E8FD'];
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
 attachUploadBtn.textContent = 'Attach Files';
 return;
 }
 const files = ensureSheetAttachments(sheet)[activeAttachmentRow] || [];
 const title = rowAttachmentTitle(sheet, activeAttachmentRow);
 const folderName = getActiveArchiveFolderName(sheet);
 const rowNumber = activeAttachmentRow + 1;
 const banner = document.getElementById('attachRowBanner');
 if(banner) banner.textContent = `Row ${rowNumber}: ${title}`;
 attachTitle.textContent = title;
 attachSub.textContent = `${folderName} · Row ${rowNumber} · ${files.length} file`;
 attachUploadBtn.textContent = `Attach Files to Row ${rowNumber}`;
 const controlsHtml = `
 <div class="attach-controls">
 <span class="attach-selectbox" aria-hidden="true"></span>
 <button class="attach-actions" type="button">Actions ▾</button>
 <button class="attach-sort" type="button">↕ Uploaded (newest)⌄</button>
 </div>`;
 const listHtml = files.length
 ? files.map((file, index) => {
 const isPdf = /pdf/i.test(file.type || file.name || '');
 const icon = file.type && file.type.startsWith('image/') ? '▧' : (isPdf ? '⌁' : '▤');
 const openHref = getAttachmentOpenHref(file);
 const previewHref = getAttachmentPreviewHref(file);
 const isDriveHref = !!(file.driveLink || file.webViewLink || file.fileUrl || file.url || file.link || file.openUrl || getAttachmentDriveId(file));
 const openAttrs = isDriveHref
 ? 'target="_blank" rel="noopener"'
 : `download="${escapeHtml(file.name)}"`;
 const nameHtml = openHref
 ? `<a class="attach-file-name" href="${escapeHtml(openHref)}" ${openAttrs} data-file-i="${index}" data-preview-href="${escapeHtml(previewHref)}" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</a>`
 : `<span class="attach-file-name" data-file-i="${index}" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>`;
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
 ? (file.localOpenUrl ? `Drive chưa lên${cleanDriveError ? ': ' + cleanDriveError : ''}` : `Lỗi tải lên${cleanDriveError ? ': ' + cleanDriveError : ''}`)
 : (file.addedAt || 'Đã đính kèm');
 return `
 <div class="attach-file">
 <span class="attach-file-icon">${icon}</span>
 <div class="attach-file-main">
 ${nameHtml}
 <span class="attach-row-badge">Row ${rowNumber}</span>
 <span class="attach-file-meta">${escapeHtml([localText, statusText].filter(Boolean).join(' · '))}${file.size ? ' · ' + formatFileSize(file.size) : ''}</span>
 </div>
 <button class="attach-file-remove" type="button" data-file-i="${index}" title="Xóa">×</button>
 </div>
 `;
 }).join('')
 : '<div class="attach-empty">Chưa có file đính kèm cho dòng này.</div>';
 attachList.innerHTML = controlsHtml + listHtml;
}

function openAttachmentPanel(rowIndex, sourceContext = null){
 if(rowIndex <= 0) return;
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


function selectSheetColumnRange(colIndex, extend = false){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 closeSheetColumnMenu();
 const cells = ensureSheetCells(sheet);
 const lastRow = Math.max(1, cells.length - 1);
 if(!extend || !sheetColumnSelectAnchor) sheetColumnSelectAnchor = colIndex;
 const anchorCol = sheetColumnSelectAnchor;
 const c1 = Math.min(anchorCol, colIndex);
 const c2 = Math.max(anchorCol, colIndex);
 setActiveSheetCell(1, colIndex, false);
 sheetColumnSelection = {c1, c2};
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

/** Bôi sáng nút B/I/U/S trên toolbar theo đúng định dạng của ô đang chọn (giống Word/Excel). */
function updateTextFormatButtonStates(rowIndex, colIndex){
 const sheet = getActiveSheet();
 const st = sheet ? getCellStyle(sheet, rowIndex, colIndex) : null;
 ssBoldBtn.classList.toggle('active', !!(st && st.bold));
 ssItalicBtn.classList.toggle('active', !!(st && st.italic));
 ssUnderlineBtn.classList.toggle('active', !!(st && st.underline));
 ssStrikeBtn.classList.toggle('active', !!(st && st.strike));
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

/** Bat che do go noi dung cho 1 o (giong bam F2 / go ky tu trong Excel). */
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

/** Luu gia tri dang go vao du lieu va thoat che do go. */
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

/** Huy go, tra o ve gia tri cu (giong bam Esc trong Excel). */
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

/** Mở các dòng cha đang Thu gọn nếu chúng đang che dòng rowIndex — dùng khi nhảy tới 1 dòng cụ thể từ Report. */
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
  selectSheetColumnRange(colIndex, e.shiftKey);
  openSheetColumnMenu(colIndex, head);
  return;
 }
 selectSheetColumnRange(colIndex, e.shiftKey);
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
  selectSheetColumnRange(Number(head.dataset.colIndex), e.shiftKey);
  openSheetColumnMenu(Number(head.dataset.colIndex), head);
 });
 });
 wireColumnResize(sheetGridWrap.querySelector('table'), new Set([1]));
 if(firstSearchHit){
 setActiveSheetCell(firstSearchHit.row, firstSearchHit.col, false);
 const hitCell = sheetGridWrap.querySelector(`.sheet-cell[data-r="${firstSearchHit.row}"][data-c="${firstSearchHit.col}"]`);
 if(hitCell) requestAnimationFrame(() => hitCell.scrollIntoView({block:'center', inline:'center'}));
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

function isWorkFile(item){
 return item && item.type !== 'folder' && item.type !== 'workspace';
}

/** ===== Thu gọn/mở rộng sidebar trái kiểu Smartsheet — thêm 03/07/2026 =====
 * Lưu trạng thái vào localStorage để lần sau mở lại vẫn giữ nguyên lựa chọn của Quân. */
const RAIL_COLLAPSED_STORAGE_KEY = 'qlda_railCollapsed';
function applyRailCollapsed(collapsed){
 appShell.classList.toggle('rail-collapsed', collapsed);
 localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
}
railToggleBtn.addEventListener('click', () => {
 applyRailCollapsed(!appShell.classList.contains('rail-collapsed'));
});
if(localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY) === '1') applyRailCollapsed(true);
initRailSectionNavigation();

/** ===== Back/Forward điều hướng qua lại giữa các màn hình đã xem — thêm 03/07/2026 =====
 * Giống nút back/forward trình duyệt: ghi lại từng "màn hình" (danh sách dự án / chi tiết dự án / Sheet / Report)
 * vào 1 mảng lịch sử, đi lùi/tiến chỉ là dịch chuyển con trỏ trong mảng đó, không tính là điều hướng mới. */
let navHistory = [{type:'list'}];
let navIndex = 0;
let isRestoringNavState = false;

function currentNavState(){
 if(activeSheetContext){
 const sheet = PROJECT_FOLDERS[activeSheetContext.projectIndex]?.[activeSheetContext.folderIndex];
 const type = sheet && sheet.type === 'report' ? 'report' : 'sheet';
 return {type, projectIndex: activeSheetContext.projectIndex, folderIndex: activeSheetContext.folderIndex};
 }
 if(activeProjectIndex !== null) return {type:'detail', projectIndex: activeProjectIndex};
 return {type:'list'};
}

function sameNavState(a, b){
 return a && b && a.type === b.type && a.projectIndex === b.projectIndex && a.folderIndex === b.folderIndex;
}

function pushNavState(){
 if(isRestoringNavState) return;
 const state = currentNavState();
 if(sameNavState(navHistory[navIndex], state)) return;
 navHistory = navHistory.slice(0, navIndex + 1);
 navHistory.push(state);
 navIndex = navHistory.length - 1;
 updateNavButtons();
}


function setRailActive(section){
 document.querySelectorAll('.rail-item').forEach(item => {
  item.classList.toggle('active', item.dataset.rail === section);
  if(section !== 'favorites') item.classList.remove('fav-open');
 });
}

function updateProjectListHeader(section){
 const title = document.querySelector('#screen-list .title-text');
 const searchInput = document.querySelector('#screen-list .search input');
 const configs = {
  home: {eyebrow:'Tổng quan hồ sơ, thư mục và chia sẻ', title:'Trang chủ'},
  projects: {eyebrow:'Theo dõi hồ sơ, thư mục và chia sẻ', title:'Dự án của tôi'},
  search: {eyebrow:'Tìm nhanh trong danh sách dự án', title:'Tìm dự án'},
  recents: {eyebrow:'Các dự án và hồ sơ vừa thao tác', title:'Gần đây'}
 };
 const cfg = configs[section] || configs.projects;
 if(title) title.innerHTML = `<span class="eyebrow">${cfg.eyebrow}</span>${cfg.title}`;
 if(searchInput) searchInput.placeholder = section === 'search' ? 'Nhập tên dự án cần tìm...' : 'Tìm dự án...';
}

function openRailProjectList(section = 'projects', shouldPush = true){
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
 if(typeof closeFavorites === 'function') closeFavorites();
 if(typeof closeWorkspaceItemMenu === 'function') closeWorkspaceItemMenu();
 if(typeof closeContextMenu === 'function') closeContextMenu();
 if(typeof closeLayoutMenu === 'function') closeLayoutMenu();
 const shouldShowWorkspaceTree = section === 'home' || section === 'projects';
 const previousSheetContext = activeSheetContext ? {...activeSheetContext} : null;
 const previousProjectIndex = Number.isInteger(previousSheetContext?.projectIndex) ? previousSheetContext.projectIndex : activeProjectIndex;
 workspaceBrowseFocusContext = shouldShowWorkspaceTree && Number.isInteger(previousProjectIndex)
  ? {projectIndex: previousProjectIndex, folderIndex: Number.isInteger(previousSheetContext?.folderIndex) ? previousSheetContext.folderIndex : null}
  : null;
 activeProjectIndex = shouldShowWorkspaceTree && Number.isInteger(previousProjectIndex) ? previousProjectIndex : null;
 activeSheetContext = null;
 main.classList.remove('detail-open', 'sheet-open');
 appShell.classList.remove('sheet-nav-collapsed');
 detailBody.style.display = 'flex';
 gridSheetView.style.display = 'none';
 reportView.style.display = 'none';
 document.getElementById('screen-detail').style.display = 'none';
 document.getElementById('screen-list').style.display = 'flex';
 updateProjectListHeader(section);
 setRailActive(section);
 render();
 updateActiveProjectRows();
 if(section === 'home' || section === 'projects') showWorkspaceBrowsePage('workspaces');
 else hideWorkspaceBrowsePage();
 if(section === 'search'){
  const searchInput = document.querySelector('#screen-list .search input');
  if(searchInput){
   searchInput.focus();
   searchInput.select();
  }
 }
 if(shouldPush && typeof pushNavState === 'function' && !isRestoringNavState) pushNavState();
}

function initRailSectionNavigation(){
 document.querySelectorAll('.rail-item[data-rail]').forEach(item => {
  if(item.dataset.railBound === '1') return;
  item.dataset.railBound = '1';
  item.addEventListener('click', (e) => {
   const section = item.dataset.rail;
   if(section === 'favorites') return;
   e.preventDefault();
   e.stopPropagation();
   openRailProjectList(section, true);
  });
 });
 const initialSection = document.querySelector('.rail-item.active[data-rail]')?.dataset.rail || 'projects';
 setRailActive(initialSection);
 if((initialSection === 'home' || initialSection === 'projects') && !activeSheetContext && activeProjectIndex == null){
  showWorkspaceBrowsePage('workspaces');
 }
}

function goHomeToProjectList(){
 activeProjectIndex = null;
 activeSheetContext = null;
 main.classList.remove('detail-open', 'sheet-open');
 appShell.classList.remove('sheet-nav-collapsed');
 detailBody.style.display = 'flex';
 gridSheetView.style.display = 'none';
 reportView.style.display = 'none';
 document.getElementById('screen-detail').style.display = 'none';
 document.getElementById('screen-list').style.display = 'flex';
 updateProjectListHeader('home');
 setRailActive('home');
 render();
 updateActiveProjectRows();
 showWorkspaceBrowsePage('workspaces');
}

function restoreNavState(state){
 isRestoringNavState = true;
 if(state.type === 'list') goHomeToProjectList();
 else if(state.type === 'detail') openDetail(state.projectIndex);
 else if(state.type === 'sheet') openSheet(state.projectIndex, state.folderIndex);
 else if(state.type === 'report') openReport(state.projectIndex, state.folderIndex);
 isRestoringNavState = false;
 updateNavButtons();
}

function navBack(){
 if(navIndex <= 0) return;
 navIndex -= 1;
 restoreNavState(navHistory[navIndex]);
}
function navForward(){
 if(navIndex >= navHistory.length - 1) return;
 navIndex += 1;
 restoreNavState(navHistory[navIndex]);
}
function updateNavButtons(){
 navBackBtn.disabled = navIndex <= 0;
 navForwardBtn.disabled = navIndex >= navHistory.length - 1;
}
navBackBtn.addEventListener('click', navBack);
navForwardBtn.addEventListener('click', navForward);
if(appUserNameBtn) appUserNameBtn.addEventListener('click', changeAppUserName);

function showFolderListView(){
 hideWorkspaceBrowsePage?.();
 activeSheetContext = null;
 closeAttachmentPanel();
 gridSheetView.classList.remove('google-core');
 main.classList.remove('sheet-open');
 appShell.classList.remove('sheet-nav-collapsed');
 toggleSheetChrome.setAttribute('aria-pressed', 'false');
 detailBody.style.display = 'flex';
 gridSheetView.style.display = 'none';
 reportView.style.display = 'none';
}


function resetSheetViewportPosition(){
 window.scrollTo(0, 0);
 document.documentElement.scrollLeft = 0;
 document.body.scrollLeft = 0;
 if(sheetGridWrap) sheetGridWrap.scrollLeft = 0;
 if(smartsheetToolbar) smartsheetToolbar.scrollLeft = 0;
 if(gridSheetView) gridSheetView.scrollLeft = 0;
}


let workspaceItemMenuTarget = null;

function closeWorkspaceItemMenu(){
 document.querySelector('.workspace-item-menu')?.remove();
 workspaceItemMenuTarget = null;
}

function getWorkspaceItemLabel(item){
 return item ? (item.label || item.name || 'Untitled') : 'Untitled';
}

function duplicateWorkspaceItem(projectIndex, folderIndex){
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 const copy = cloneWorkspaceItem(item);
 copy.name = `${item.name || 'Item'} - copy`;
 copy.label = `${getWorkspaceItemLabel(item)} - copy`;
 copy.updated = new Date().toLocaleDateString('vi-VN');
 PROJECT_FOLDERS[projectIndex].splice(folderIndex + 1, 0, copy);
 activeProjectIndex = projectIndex;
 render();
 renderFolderRows();
 saveCurrentProjectStateSilently();
 persistToDrive();
}

function renameWorkspaceItem(projectIndex, folderIndex){
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 const current = getWorkspaceItemLabel(item);
 const next = prompt('Rename:', current);
 if(!next || !next.trim()) return;
 item.label = next.trim();
 item.name = item.name || next.trim();
 item.updated = new Date().toLocaleDateString('vi-VN');
 render();
 renderFolderRows();
 refreshActiveWorkspaceTitle();
 saveCurrentProjectStateSilently();
 persistToDrive();
}

function getWorkspaceOpenTitle(item){
 if(!item) return '';
 if(item.type === 'report') return getWorkspaceItemLabel(item);
 return `${getWorkspaceItemLabel(item)} / ${item.sheetTitle || 'Sheet hồ sơ'}`;
}

function refreshActiveWorkspaceTitle(){
 const detailTitleEl = document.getElementById('detailTitle');
 if(activeSheetContext && activeSheetContext.projectIndex !== null && activeSheetContext.folderIndex !== null){
  const item = PROJECT_FOLDERS[activeSheetContext.projectIndex]?.[activeSheetContext.folderIndex];
  const title = getWorkspaceOpenTitle(item);
  if(title && detailTitleEl) detailTitleEl.textContent = title;
  if(item?.type === 'report'){
   if(activeReportName) activeReportName.textContent = title;
  } else if(title && activeSheetName){
   activeSheetName.textContent = title;
   setActiveSheetIcon(item);
  }
  return;
 }
 if(activeProjectIndex !== null && DATA[activeProjectIndex] && detailTitleEl){
  detailTitleEl.textContent = DATA[activeProjectIndex].name;
 }
}

function renameActiveTitle(){
 if(activeSheetContext && activeSheetContext.projectIndex !== null && activeSheetContext.folderIndex !== null){
  renameWorkspaceItem(activeSheetContext.projectIndex, activeSheetContext.folderIndex);
  return;
 }
 if(activeProjectIndex === null || !DATA[activeProjectIndex]) return;
 const project = DATA[activeProjectIndex];
 const next = prompt('Đổi tên dự án:', project.name);
 if(!next || !next.trim()) return;
 project.name = next.trim();
 project.updated = new Date().toLocaleDateString('vi-VN');
 refreshActiveWorkspaceTitle();
 render();
 saveCurrentProjectStateSilently();
 persistToDrive();
}

function deleteWorkspaceItem(projectIndex, folderIndex){
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 if(!confirm(`Delete "${getWorkspaceItemLabel(item)}"?`)) return;
 PROJECT_FOLDERS[projectIndex].splice(folderIndex, 1);
 activeSheetContext = {projectIndex:null, folderIndex:null};
 activeProjectIndex = projectIndex;
 showFolderListView();
 render();
 renderFolderRows();
 saveCurrentProjectStateSilently();
 persistToDrive();
}

function exportWorkspaceItem(projectIndex, folderIndex){
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 if(item.type === 'report'){
  alert('Report export se tach thanh module rieng. Tam thoi mo report roi dung Publish/Export sau.');
  openReport(projectIndex, folderIndex);
  return;
 }
 exportSheetToExcel(item);
}

function showWorkspaceItemProperties(projectIndex, folderIndex){
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 const type = item.type === 'report' ? 'Report' : 'Sheet';
 alert(`${type}\nName: ${getWorkspaceItemLabel(item)}\nCode: ${item.name || ''}\nUpdated: ${item.updated || ''}`);
}

function handleWorkspaceItemMenuAction(action, projectIndex, folderIndex){
 closeWorkspaceItemMenu();
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 if(action === 'open') openSheet(projectIndex, folderIndex);
 else if(action === 'open-tab') window.open(location.href, '_blank', 'noopener');
 else if(action === 'share') alert('Share se ket noi quyen Drive/Publish o buoc sau.');
 else if(action === 'rename') renameWorkspaceItem(projectIndex, folderIndex);
 else if(action === 'duplicate' || action === 'save-new') duplicateWorkspaceItem(projectIndex, folderIndex);
 else if(action === 'template') alert('Save as Template se luu thanh mau o buoc sau.');
 else if(action === 'backup'){ saveCurrentProjectStateSilently(); alert('Da yeu cau luu backup du an.'); }
 else if(action === 'delete') deleteWorkspaceItem(projectIndex, folderIndex);
 else if(action === 'export-excel') exportWorkspaceItem(projectIndex, folderIndex);
 else if(action === 'export-pdf') alert('Export PDF se them sau.');
 else if(action === 'export-gsheet') alert('Export Google Sheets se dung OAuth/Apps Script sau.');
 else if(action === 'sharing-report') alert('Sharing report CSV se them sau.');
 else if(action === 'properties') showWorkspaceItemProperties(projectIndex, folderIndex);
}

function openWorkspaceItemMenu(projectIndex, folderIndex, event){
 const item = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!item) return;
 closeWorkspaceItemMenu();
 closeContextMenu();
 closeLayoutMenu();
 const type = item.type === 'report' ? 'Report' : 'Sheet';
 const menu = document.createElement('div');
 menu.className = 'sheet-column-menu workspace-item-menu';
 workspaceItemMenuTarget = {projectIndex, folderIndex};
 const x = event?.clientX ?? 120;
 const y = event?.clientY ?? 120;
 const left = Math.min(Math.max(8, x), Math.max(8, window.innerWidth - 292));
 const top = Math.min(Math.max(8, y), Math.max(8, window.innerHeight - 560));
 menu.style.left = `${left}px`;
 menu.style.top = `${top}px`;
 menu.innerHTML = `
  <div class="menu-title">${escapeHtml(type)}: ${escapeHtml(getWorkspaceItemLabel(item))}</div>
  <button type="button" data-act="open"><span class="menu-ic">O</span>Open</button>
  <button type="button" data-act="open-tab"><span class="menu-ic">↗</span>Open in New Tab</button>
  <button type="button" data-act="share"><span class="menu-ic">S</span>Share...</button>
  <button type="button" data-act="rename"><span class="menu-ic">A</span>Rename...</button>
  <div class="menu-sep"></div>
  <button type="button" data-act="duplicate"><span class="menu-ic">D</span>Duplicate</button>
  <button type="button" data-act="save-new"><span class="menu-ic">N</span>Save as New...</button>
  <button type="button" data-act="template"><span class="menu-ic">T</span>Save as Template...</button>
  <button type="button" data-act="backup"><span class="menu-ic">B</span>Request Backup...</button>
  <div class="menu-sep"></div>
  <button type="button" data-act="delete" class="danger"><span class="menu-ic">Del</span>Delete...</button>
  <div class="menu-sep"></div>
  <button type="button" data-act="export-excel"><span class="menu-ic">X</span>Export to Microsoft Excel</button>
  <button type="button" data-act="export-pdf"><span class="menu-ic">PDF</span>Export to PDF...</button>
  <button type="button" data-act="export-gsheet"><span class="menu-ic">G</span>Export to Google Sheets...</button>
  <div class="menu-sep"></div>
  <button type="button" data-act="sharing-report"><span class="menu-ic">CSV</span>Download Workspace Sharing Report</button>
  <button type="button" data-act="properties"><span class="menu-ic">i</span>Properties...</button>
 `;
 menu.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  handleWorkspaceItemMenuAction(btn.dataset.act, projectIndex, folderIndex);
 });
 document.body.appendChild(menu);
 setTimeout(() => {
  const close = (e) => {
   if(!menu.contains(e.target)){
    closeWorkspaceItemMenu();
    document.removeEventListener('mousedown', close, true);
   }
  };
  document.addEventListener('mousedown', close, true);
 }, 0);
}

function openWorkspaceItemMenuFromRow(row, event, explicitProjectIndex = null){
 const projectIndex = explicitProjectIndex ?? Number(row.dataset.projectI ?? activeProjectIndex);
 const folderIndex = Number(row.dataset.folderI);
 if(!Number.isFinite(projectIndex) || !Number.isFinite(folderIndex)) return;
 event.preventDefault();
 event.stopPropagation();
 openWorkspaceItemMenu(projectIndex, folderIndex, event);
}

function openSheet(projectIndex, folderIndex, options){
 const sheet = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!isWorkFile(sheet)) return;
 if(sheet.type === 'report'){ openReport(projectIndex, folderIndex); return; }
 if(sheet.type === 'dashboard'){ openDashboard(projectIndex, folderIndex); return; }
 if(options && options.scrollToRow != null) expandAncestorsForRow(sheet, options.scrollToRow);
 activeProjectIndex = projectIndex;
 activeSheetContext = {projectIndex, folderIndex};
 activeAttachmentRow = null;
 gridSheetView.classList.remove('attachments-open');
 attachmentPanel.setAttribute('aria-hidden', 'true');
 gridSheetView.classList.remove('google-core');
 appShell.classList.remove('sheet-nav-collapsed');
 toggleSheetChrome.setAttribute('aria-pressed', 'false');
 document.getElementById('detailTitle').textContent = getWorkspaceOpenTitle(sheet);
 activeSheetName.textContent = getWorkspaceOpenTitle(sheet);
 setActiveSheetIcon(sheet);
 render();
 detailBody.style.display = 'none';
 reportView.style.display = 'none';
 reportGridWrap.style.display = 'none';
 hideDashboardView();
 closeAllReportPopovers();
 gridSheetView.style.display = 'flex';
 ssSearchInput.value = sheet._searchTerm || '';
 closeAllToolPopovers();
 sheet._selectedRows = new Set();
 updateBulkEditBtn(sheet);
 renderGoogleSheetHost(sheet);
 renderGridSheet(sheet, options);

 main.classList.add('detail-open', 'sheet-open');
 const currentWidth = parseFloat(getComputedStyle(main).getPropertyValue('--project-column-size'));
 if(Number.isFinite(currentWidth)) setProjectColumnWidth(currentWidth);
 document.getElementById('screen-list').style.display = 'flex';
 document.getElementById('screen-detail').style.display = 'flex';
 requestAnimationFrame(resetSheetViewportPosition);

 if(sheet.googleSheetId){
 reloadRealSheetData(sheet);
 } else if(!sheet._loadedFromServer){
 sheet._loadedFromServer = true;
 const projectName = getActiveProjectName();
 loadSheetDataFromWebApp(projectName, sheet.name).then(saved => {
 const stillSameSheet = activeSheetContext
 && activeSheetContext.projectIndex === projectIndex
 && activeSheetContext.folderIndex === folderIndex;
 if(saved && saved.cells && stillSameSheet){
 sheet.cells = saved.cells;
 sheet.attachments = saved.attachments || {};
 sheet._cellStyles = saved.cellStyles || {};
 sheet.settings = saved.settings || {};
 sheet._columnConfigs = saved.columnConfigs || {};
 sheet._columnTypes = saved.columnTypes || {};
 sheet._columnFormats = saved.columnFormats || {};
 sheet._forms = saved.forms || [];
 sheet._publish = saved.publish || null;
 sheet._workflows = saved.workflows || [];
 applySavedRowMeta(sheet, saved.rowMeta || []);
 if(options && options.scrollToRow != null) expandAncestorsForRow(sheet, options.scrollToRow);
 renderGridSheet(sheet, options);
 }
 });
 }
 pushNavState();
}

function getActiveReport(){
  return getActiveSheet();
}

/* ===== DASHBOARD v1 (13/07/2026) ===== */
function hideDashboardView(){
 const dashView = document.getElementById('dashboardView');
 if(!dashView) return;
 dashView.classList.remove('active');
 dashView.style.display = 'none';
}

function openDashboard(projectIndex, folderIndex){
  var dashItem = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
  if(!dashItem) return;
  ensureDashboardConfig(dashItem);
  activeProjectIndex = projectIndex;
  activeSheetContext = {projectIndex:projectIndex, folderIndex:folderIndex};
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

function isStatusPill(v){ var s=String(v).toLowerCase().trim(); return s==='hoàn thành'||s==='đã xong'||s==='done'||s==='đang thực hiện'||s==='in progress'||s==='chưa bắt đầu'||s==='not started'; }

function statusPillHtml(v){
  var s=String(v).toLowerCase().trim(), cls='dash-pill-default';
  if(s==='hoàn thành'||s==='đã xong'||s==='done') cls='dash-pill-tot';
  else if(s==='đang thực hiện'||s==='in progress') cls='dash-pill-dang';
  else if(s==='chưa bắt đầu'||s==='not started') cls='dash-pill-chua';
  return '<span class="dash-pill '+cls+'">'+escHtml(v)+'</span>';
}

function renderDashChartPlaceholder(card,w){
  var t = (w.config&&w.config.title&&w.config.title.text)||'Chart';
  card.innerHTML = '<div class="dash-card-header">'+escHtml(t)+'</div><div class="dash-card-body"><div class="dash-chart-placeholder">📊 Chart engine D2</div></div>';
}

function escHtml(s){ if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
/* ===== END DASHBOARD v1 ===== */

function openReport(projectIndex, folderIndex){
 const report = PROJECT_FOLDERS[projectIndex]?.[folderIndex];
 if(!report) return;
 ensureReportConfig(report);
 activeProjectIndex = projectIndex;
 activeSheetContext = {projectIndex, folderIndex};
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

/** Vẽ lại toàn bộ bảng Báo cáo: gộp dòng nguồn -> lọc/tìm -> sắp xếp -> nhóm -> chèn dòng tổng hợp. */
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

/** Gắn sự kiện sửa trực tiếp (blur/Enter/Escape) và click "Nguồn" (drill-down) sau mỗi lần vẽ lại bảng Report. */
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

/** Popover "Nguồn" — nhóm Sheet theo từng dự án (giống Smartsheet nhóm theo Workspace), mỗi nhóm có
 * checkbox "Chọn tất cả" ở đầu + danh sách Sheet thụt lề bên dưới, chọn được nhiều dự án cùng lúc. */
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

/** Sheet Column Visibility — giống Report, dùng sheet._config.hiddenCols */
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

function buildWorkspaceItem(type, name){
 const cleanName = (name || '').trim() || 'Untitled';
 const item = {
  name:cleanName,
  label:cleanName,
  fav:false,
  type,
  updated:new Date().toLocaleDateString('vi-VN')
 };
 if(type === 'report'){
  item._config = {sources:[], filters:[], sorts:[], summaries:[], groupCol:null, hiddenCols:[], searchTerm:''};
  return item;
 }
 if(type === 'folder' || type === 'workspace'){
  return item;
 }
 item.cells = createEmptySheetCells(60, cleanName);
 item.sheetTitle = 'Sheet hồ sơ';
 item.googleSheetUrl = '';
 return item;
}

function focusCreatedWorkspaceItem(projectIndex, folderIndex, type){
 activeProjectIndex = projectIndex;
 if(type === 'report'){
  openReport(projectIndex, folderIndex);
  return;
 }
 if(isWorkFile(PROJECT_FOLDERS[projectIndex]?.[folderIndex])){
  openSheet(projectIndex, folderIndex);
  return;
 }
 openDetail(projectIndex);
 requestAnimationFrame(()=>{
  const row = document.querySelector(`#folderRows tr[data-folder-i="${folderIndex}"]`);
  row?.scrollIntoView({block:'center'});
  row?.classList.add('ctx-selected');
  setTimeout(()=> row?.classList.remove('ctx-selected'), 1200);
 });
}

function createWorkspaceItem(projectIndex, type, defaultName, label){
 const name = prompt(`Name Your ${label}:`, defaultName);
 if(!name || !name.trim()) return;
 const item = buildWorkspaceItem(type, name);
 PROJECT_FOLDERS[projectIndex].push(item);
 const folderIndex = PROJECT_FOLDERS[projectIndex].length - 1;
 saveCurrentProjectStateSilently();
 persistToDrive();
 focusCreatedWorkspaceItem(projectIndex, folderIndex, type);
}

topActionButtons.forEach(btn => {
 btn.addEventListener('click', (e)=>{
 e.stopPropagation();
 closeContextMenu();
 closeFavorites();
 const rect = btn.getBoundingClientRect();
 layoutMenu.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 260)) + 'px';
 layoutMenu.style.top = Math.max(10, Math.min(rect.bottom + 8, window.innerHeight - 260)) + 'px';
 layoutMenu.classList.toggle('show');
 });
});

layoutMenu.addEventListener('click', (e)=>{
 e.stopPropagation();
 const item = e.target.closest('[data-layout-action]');
 if(!item) return;
 const action = item.dataset.layoutAction;
 const projectIndex = getActionProjectIndex();

 if(projectIndex === null){
 alert('Chọn một dự án trước khi dùng Workspace actions.');
 return;
 }

 if(action === 'create-grid'){
 closeLayoutMenu();
 openSheetNameModal(projectIndex);
 return;
 }
 if(action === 'create-from-template' || action === 'browse-templates'){
 closeLayoutMenu();
 ctxProjectIndex = projectIndex;
 handleProjectAction('create-from-template');
 return;
 }

 const createActions = {
 'create-task': {type:'task', name:'New Task List', label:'Task List'},
 'create-project': {type:'project', name:'New Project', label:'Project'},
 'create-cards': {type:'cards', name:'New Cards', label:'Cards'},
 'create-report': {type:'report', name:'New Report', label:'Report'},
 'create-dashboard': {type:'dashboard', name:'New Dashboard', label:'Dashboard'},
 'create-folder': {type:'folder', name:'New Folder', label:'Folder'},
 'create-workspace': {type:'workspace', name:'New Workspace', label:'Workspace'}
 };
 if(createActions[action]){
 const config = createActions[action];
 closeLayoutMenu();
 createWorkspaceItem(projectIndex, config.type, config.name, config.label);
 return;
 }

 const actionLabels = {};
 notifyAction((actionLabels[action] || 'Workspace action trong') + ' "' + DATA[projectIndex].name + '".');
 closeLayoutMenu();
});

topDeleteButtons.forEach(btn => {
 btn.addEventListener('click', (e)=>{
 e.stopPropagation();
 const projectIndex = getActionProjectIndex();
 if(projectIndex === null){
 alert('Chọn một dự án trước khi xóa.');
 return;
 }
 ctxProjectIndex = projectIndex;
 handleProjectAction('delete');
 });
});

quickGridButtons.forEach(btn => {
 btn.addEventListener('click', (e)=>{
 e.stopPropagation();
 const projectIndex = getActionProjectIndex();
 if(projectIndex === null){
 alert('Chọn một dự án trước khi tạo Grid.');
 return;
 }
 openSheetNameModal(projectIndex);
 });
});

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

function handleProjectAction(action){
 if(ctxProjectIndex === null || !DATA[ctxProjectIndex]) return;
 const p = DATA[ctxProjectIndex];

 if(action === 'create-grid'){
 closeContextMenu();
 openSheetNameModal(ctxProjectIndex);
 return;
 }
 if(action === 'open'){
 closeContextMenu();
 openDetail(ctxProjectIndex);
 return;
 }
 if(action === 'favorite'){
 p.fav = !p.fav;
 render();
 closeContextMenu();
 return;
 }
 if(action === 'rename'){
 const nextName = prompt('Đổi tên dự án:', p.name);
 if(nextName && nextName.trim()){
 p.name = nextName.trim();
 p.updated = new Date().toLocaleDateString('vi-VN');
 render();
 }
 closeContextMenu();
 return;
 }
 if(action === 'duplicate'){
 DATA.splice(ctxProjectIndex + 1, 0, {...p, name:p.name + ' - bản sao', fav:false, updated:new Date().toLocaleDateString('vi-VN')});
  persistToDrive();
 PROJECT_FOLDERS.splice(ctxProjectIndex + 1, 0, PROJECT_FOLDERS[ctxProjectIndex].map(cloneWorkspaceItem));
 render();
 closeContextMenu();
 return;
 }
 if(action === 'save-template'){
 closeContextMenu();
 const folders = PROJECT_FOLDERS[ctxProjectIndex];
 if(!folders) return;
 const template = {
 name: p.name,
 folders: folders.map(cloneWorkspaceItem),
 saved: new Date().toISOString()
 };
 const saved = JSON.parse(localStorage.getItem('projectTemplates') || '[]');
 const existing = saved.findIndex(t => t.name === p.name);
 if(existing >= 0){
 if(!confirm(`Mẫu "${p.name}" đã tồn tại. Ghi đè?`)) return;
 saved[existing] = template;
 } else {
 saved.push(template);
 }
 localStorage.setItem('projectTemplates', JSON.stringify(saved));
 alert(`Đã lưu "${p.name}" thành mẫu!`);
 return;
 }
 if(action === 'create-from-template'){
 closeContextMenu();
 const saved = JSON.parse(localStorage.getItem('projectTemplates') || '[]');
 if(!saved.length){
 alert('Chưa có mẫu nào. Tạo mẫu bằng cách chuột phải → "Lưu thành mẫu..."');
 return;
 }
 const names = saved.map((t, i) => `${i+1}. ${t.name}`).join('\\n');
 const choice = prompt(`Chọn mẫu:\\n${names}\\n\\nNhập số hoặc tên:`, '');
 if(!choice) return;
 let template;
 const idx = parseInt(choice);
 if(!isNaN(idx) && idx > 0 && idx <= saved.length) template = saved[idx - 1];
 else template = saved.find(t => t.name.toLowerCase() === choice.trim().toLowerCase());
 if(!template) return;
 const newName = prompt('Tên cho dự án mới:', template.name + ' (từ mẫu)');
 if(!newName || !newName.trim()) return;
 DATA.push({name:newName.trim(), sub:'Từ mẫu', shared:false, owner:'Quân', updated:new Date().toLocaleDateString('vi-VN'), fav:false});
  persistToDrive();
 PROJECT_FOLDERS.push(template.folders.map(cloneWorkspaceItem));
 render();
 return;
 }
 if(action === 'delete'){
 if(confirm('Xóa dự án này khỏi danh sách demo?')){
 const deletingActiveProject = ctxProjectIndex === activeProjectIndex;
 DATA.splice(ctxProjectIndex, 1);
  persistToDrive();
 PROJECT_FOLDERS.splice(ctxProjectIndex, 1);
 if(deletingActiveProject){
 activeProjectIndex = null;
 activeSheetContext = null;
 main.classList.remove('detail-open', 'sheet-open');
 appShell.classList.remove('sheet-nav-collapsed');
 detailBody.style.display = 'flex';
 gridSheetView.style.display = 'none';
 document.getElementById('screen-detail').style.display = 'none';
 document.getElementById('screen-list').style.display = 'flex';
 }
 render();
 }
 closeContextMenu();
 return;
 }
 if(action === 'create-folder'){
 closeContextMenu();
 createWorkspaceItem(ctxProjectIndex, 'folder', 'New Folder', 'Folder');
 return;
 }
 if(action === 'create-report'){
 closeContextMenu();
 createWorkspaceItem(ctxProjectIndex, 'report', 'New Report', 'Report');
 return;
 }
 const createActionMap = {
  'create-task': {type:'task', name:'New Task List', label:'Task List'},
  'create-project': {type:'project', name:'New Project', label:'Project'},
  'create-cards': {type:'cards', name:'New Cards', label:'Cards'},
  'create-dashboard': {type:'dashboard', name:'New Dashboard', label:'Dashboard'},
  'create-workspace': {type:'workspace', name:'New Workspace', label:'Workspace'}
 };
 if(createActionMap[action]){
  const cfg = createActionMap[action];
  closeContextMenu();
  createWorkspaceItem(ctxProjectIndex, cfg.type, cfg.name, cfg.label);
  return;
 }

 const labels = {
 share:'Mở hộp thoại chia sẻ cho',
 properties:'Xem thuộc tính của',
 'export-excel':'Xuất Excel từ',
 'export-pdf':'Xuất PDF từ',
 'export-sheets':'Xuất Google Sheets từ',
 'sharing-report':'Tải báo cáo chia sẻ của',
};
 notifyAction((labels[action] || 'Thao tác với') + ' "' + p.name + '".');
 closeContextMenu();
}

ctxMenu.addEventListener('click', (e)=>{
 e.stopPropagation();
 const item = e.target.closest('[data-action]');
 if(!item) return;
 handleProjectAction(item.dataset.action);
});

sheetNameOk.addEventListener('click', createGridSheet);
sheetNameCancel.addEventListener('click', closeSheetNameModal);
sheetNameClose.addEventListener('click', closeSheetNameModal);
sheetNameModal.addEventListener('click', (e)=>{
 if(e.target === sheetNameModal) closeSheetNameModal();
});
sheetNameInput.addEventListener('keydown', (e)=>{
 if(e.key === 'Enter') createGridSheet();
 if(e.key === 'Escape') closeSheetNameModal();
});

saveGoogleSheetUrl.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 const url = normalizeGoogleSheetUrl(googleSheetUrlInput.value);
 if(!url){
 alert('Dán link Google Sheet trước.');
 return;
 }
 sheet.googleSheetUrl = url;
 sheet.updated = new Date().toLocaleDateString('vi-VN');
 renderGoogleSheetHost(sheet);
 render();
});

googleSheetUrlInput.addEventListener('keydown', (e)=>{
 if(e.key === 'Enter') saveGoogleSheetUrl.click();
});

createGoogleSheetLink.addEventListener('click', ()=>{
 createRealGoogleSheetForActiveItem();
});

if(saveProjectBtn) saveProjectBtn.addEventListener('click', saveProjectNow);
if(sheetPrintBtn) sheetPrintBtn.addEventListener('click', () => window.print());
if(rptSaveBtn) rptSaveBtn.addEventListener('click', saveProjectNow);
if(rptPrintBtn) rptPrintBtn.addEventListener('click', () => window.print());
if(sheetUndoBtn) sheetUndoBtn.addEventListener('click', undoSheetEdit);
if(sheetRedoBtn) sheetRedoBtn.addEventListener('click', redoSheetEdit);
if(rptUndoBtn) rptUndoBtn.addEventListener('click', undoReportEdit);
if(rptRedoBtn) rptRedoBtn.addEventListener('click', redoReportEdit);
updateSheetUndoRedoButtons();
updateReportUndoRedoButtons();

document.getElementById('exportExcelBtn').addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 exportSheetToExcel(sheet);
});
/* ── Import CSV ── */
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

// Toggle merge column picker
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

function escapeHtml(str){
 const div = document.createElement('div');
 div.textContent = str;
 return div.innerHTML;
}


document.getElementById('linkGoogleSheetBtn').addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 linkExistingGoogleSheet(sheet);
});
async function requestDriveSignIn(){
 if(location.protocol === 'file:'){
  alert('Drive API OAuth cần chạy qua http://localhost hoặc web app, không nên chạy trực tiếp bằng file://. Hãy mở bản này qua localhost rồi bấm lại.');
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
  alert('Đã kết nối Drive API trực tiếp. Từ giờ file đính kèm sẽ upload thẳng lên folder dự án.');
 }catch(err){
  console.error('Drive API sign-in error:', err);
  alert('Chưa kết nối được Drive API: ' + (err.message || err));
 }
}

document.getElementById('driveApiSignInBtn').addEventListener('click', requestDriveSignIn);

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
const textColorPopover = document.getElementById('textColorPopover');
const textColorSwatches = document.getElementById('textColorSwatches');
const textColorResetBtn = document.getElementById('textColorResetBtn');
const fillColorPopover = document.getElementById('fillColorPopover');
const fillColorSwatches = document.getElementById('fillColorSwatches');
const fillColorResetBtn = document.getElementById('fillColorResetBtn');
const TEXT_COLOR_SWATCHES = ['#1A1A1A', '#D93025', '#1A73E8', '#188038', '#B9472D'];
const FILL_COLOR_SWATCHES = FORMAT_RULE_COLORS;

let openToolPopover = null;
let formatDraft = null;

function closeSheetMoreMenu(){
 if(ssMoreMenu) ssMoreMenu.hidden = true;
}

function toggleSheetMoreMenu(){
 if(!ssMoreMenu) return;
 ssMoreMenu.hidden = !ssMoreMenu.hidden;
}

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

function deleteSheetColumn(colIndex){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 const cells = ensureSheetCells(sheet);
 if(cells[0].length <= 3){
  alert('Can giu lai it nhat mot cot du lieu.');
  return;
 }
 const label = getColumnConfig(colIndex, sheet).label || cells[0][colIndex] || columnName(colIndex);
 if(!confirm(`Xoa cot "${label}"?`)) return;
 cells.forEach(row => row.splice(colIndex, 1));
 shiftColumnReferencesAfterDelete(sheet, colIndex);
 renderGridSheet(sheet);
 setActiveSheetCell(1, Math.max(2, Math.min(colIndex, cells[0].length - 1)), false);
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
  else if(act === 'delete') deleteSheetColumn(colIndex);
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
 selectSheetColumnRange(colIndex, event.shiftKey);
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

function repostActiveSheetDates(){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 const dateCols = SHEET_COLUMN_CONFIG
 .map((col, i) => ({type:getColumnConfig(i, sheet).type, index:i}))
 .filter(col => col.type === 'date')
 .map(col => col.index);
 const today = new Date();
 const todayIso = today.toISOString().split('T')[0];
 const todayDisplay = today.toLocaleDateString('vi-VN');
 if(!dateCols.length){ alert('Sheet hiện không có cột DATE.'); return; }
 if(!confirm(`Reset ${dateCols.length} cột ngày về hôm nay (${todayDisplay})?`)) return;
 if(cells.length <= 1) cells.push(Array.from({length:cells[0].length}, () => ''));
 for(let r = 1; r < cells.length; r++){
 dateCols.forEach(c => { cells[r][c] = todayIso; });
 }
 ensureSheetSettings(sheet).lastRepostDate = new Date().toLocaleString('vi-VN');
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 alert(`Đã reset ${dateCols.length} cột ngày về ${todayDisplay}.`);
}




ssSortBtn.addEventListener('click', () => toggleToolPopover('sort'));
ssFilterBtn.addEventListener('click', () => toggleToolPopover('filter'));
ssColumnsBtn.addEventListener('click', () => toggleToolPopover('columns'));
ssFormsBtn.addEventListener('click', openFormsModal);
ssPublishBtn.addEventListener('click', openPublishModal);
ssAutomationBtn.addEventListener('click', openAutomationModal);
ssWrapBtn.addEventListener('click', toggleSheetWrap);
ssRowHeightSelect.addEventListener('change', () => setSheetRowHeight(ssRowHeightSelect.value));
ssClearDataBtn.addEventListener('click', clearActiveSheetData);
function classifyCarryForwardColumn(sheet, colIndex){
 const type = String(getColumnConfig(colIndex, sheet).type || 'text').toLowerCase();
 if(['date','created_date','modified_date'].includes(type)) return 'today';
 if(['number','currency','percent','checkbox','symbols','duration','auto_number'].includes(type)) return 'clear';
 if(['created_by','modified_by'].includes(type)) return 'system';
 return 'keep';
}
function applyCarryForward(sheet, actions){
 const cells = ensureSheetCells(sheet);
 if(cells.length < 2) return {rows:0, kept:0, cleared:0, reset:0};
 sheet._undoSnapshot = {cells:JSON.parse(JSON.stringify(cells)), timestamp:Date.now(), action:'carry-forward'};
 const today = new Date().toISOString().split('T')[0];
 let kept=0, cleared=0, reset=0;
 for(let row=1; row<cells.length; row++){
  for(let col=0; col<cells[row].length; col++){
   const action = actions[col] || 'keep';
   if(action === 'clear'){ setSheetCellValue(sheet,row,col,'',{touchModified:false}); cleared++; }
   else if(action === 'today'){ setSheetCellValue(sheet,row,col,today,{touchModified:false}); reset++; }
   else kept++;
  }
  cells[row]._modifiedAt = new Date().toISOString();
  cells[row]._modifiedBy = ensureAppUserName();
 }
 renderGridSheet(sheet); scheduleSheetDataSave(sheet); saveProjectLocalBackup();
 return {rows:cells.length-1,kept,cleared,reset};
}
function openCarryForwardDialog(){
 const sheet=getActiveSheet(); if(!sheet) return;
 document.querySelector('.carry-forward-backdrop')?.remove();
 const cells=ensureSheetCells(sheet); const headers=cells[0] || [];
 const actions=headers.map((_,i)=>classifyCarryForwardColumn(sheet,i));
 const backdrop=document.createElement('div'); backdrop.className='attachment-preview-backdrop carry-forward-backdrop';
 backdrop.innerHTML=`<div class="attachment-preview-dialog" role="dialog" aria-modal="true" aria-label="Repost with Carry-Forward" style="max-width:720px;height:auto;max-height:88vh"><div class="attachment-preview-head"><strong>Repost with Carry-Forward</strong><button type="button" class="attachment-preview-close" aria-label="Đóng">×</button></div><div class="attachment-preview-body" style="padding:16px;overflow:auto"><p>Chọn hành vi cho từng cột. Dữ liệu cấu trúc được giữ, số liệu được xóa, ngày được reset về hôm nay.</p><div class="carry-forward-grid">${headers.map((h,i)=>`<label style="display:grid;grid-template-columns:1fr 180px;gap:12px;align-items:center;margin:8px 0"><span>${escapeHtml(String(h||`Cột ${i+1}`))}</span><select data-carry-col="${i}"><option value="keep" ${actions[i]==='keep'?'selected':''}>Giữ nguyên</option><option value="clear" ${actions[i]==='clear'?'selected':''}>Xóa dữ liệu</option><option value="today" ${actions[i]==='today'?'selected':''}>Reset hôm nay</option><option value="system" ${actions[i]==='system'?'selected':''}>Hệ thống quản lý</option></select></label>`).join('')}</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button type="button" class="ss-tool-btn carry-cancel">Hủy</button><button type="button" class="ss-tool-btn carry-apply">Thực hiện</button></div></div></div>`;
 document.body.appendChild(backdrop);
 const close=()=>backdrop.remove(); backdrop.querySelector('.attachment-preview-close').addEventListener('click',close); backdrop.querySelector('.carry-cancel').addEventListener('click',close);
 backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
 backdrop.querySelector('.carry-apply').addEventListener('click',()=>{ const selected={}; backdrop.querySelectorAll('[data-carry-col]').forEach(el=>selected[Number(el.dataset.carryCol)]=el.value); if(!confirm(`Tạo kỳ báo cáo mới cho ${Math.max(0,cells.length-1)} dòng?`)) return; const result=applyCarryForward(sheet,selected); close(); alert(`Đã xử lý ${result.rows} dòng: giữ ${result.kept}, xóa ${result.cleared}, reset ngày ${result.reset}.`); });
}
ssRepostDateBtn.addEventListener('click', repostActiveSheetDates);
ssCarryForwardBtn.addEventListener('click', openCarryForwardDialog);
ssDuplicateBtn.addEventListener('click', () => {
const sheet = getActiveSheet();
if(!sheet) return;
const {projectIndex, folderIndex} = activeSheetContext;
if(projectIndex === null || folderIndex === null) return;
const folders = PROJECT_FOLDERS[projectIndex];
if(!folders) return;
const orig = folders[folderIndex];
const copy = cloneWorkspaceItem(orig);
copy.name = orig.name + ' (bản sao)';
folders.splice(folderIndex + 1, 0, copy);
openSheet(projectIndex, folderIndex + 1);
});
// ===== Excel 365 Toolbar: Font / Size / Merge =====
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
// Bulk Edit: toggle button visibility
function updateBulkEditBtn(sheet){
 const count = ensureSheetSelectedRows(sheet).size;
 ssBulkEditBtn.style.display = count > 0 ? '' : 'none';
 ssBulkEditBtn.textContent = count > 0 ? `✏️ Sửa ${count} dòng` : '✏️ Sửa hàng loạt';
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
// Format Painter — click: bật/tắt; double-click: khoá
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

/** ===== Sự kiện cho thanh công cụ Dashboard ===== */
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
var dashboardGridEl=document.getElementById('dashboardGrid'); var draggedDashWidget=null;
if(dashboardGridEl){
 dashboardGridEl.addEventListener('click',e=>{var edit=e.target.closest('[data-dash-edit]'),remove=e.target.closest('[data-dash-remove]');if(edit)showWidgetConfigDialog(edit.dataset.dashEdit);if(remove){var d=getDashboardItem();if(d&&confirm('Xóa widget này?')){d._dashboardConfig.widgets=d._dashboardConfig.widgets.filter(w=>w.id!==remove.dataset.dashRemove);saveDashboardConfig(d);renderDashboard(d,activeProjectIndex,activeSheetContext?.folderIndex);}}});
 dashboardGridEl.addEventListener('dragstart',e=>{var card=e.target.closest('.dash-card[draggable="true"]');if(card){draggedDashWidget=card.dataset.widgetId;e.dataTransfer.effectAllowed='move';}});
 dashboardGridEl.addEventListener('dragover',e=>{if(draggedDashWidget)e.preventDefault();});
 dashboardGridEl.addEventListener('drop',e=>{e.preventDefault();var target=e.target.closest('.dash-card');var d=getDashboardItem();if(!target||!d||target.dataset.widgetId===draggedDashWidget)return;var ws=d._dashboardConfig.widgets,a=ws.findIndex(w=>w.id===draggedDashWidget),b=ws.findIndex(w=>w.id===target.dataset.widgetId);if(a<0||b<0)return;var moved=ws.splice(a,1)[0];ws.splice(b,0,moved);saveDashboardConfig(d);renderDashboard(d,activeProjectIndex,activeSheetContext?.folderIndex);draggedDashWidget=null;});
}
/** ===== Sự kiện cho thanh công cụ Báo cáo (Report) ===== */
backFromReport.addEventListener('click', () => {
 if(activeProjectIndex !== null) openDetail(activeProjectIndex);
});

rptSourceBtn.addEventListener('click', (e) => {
 e.preventDefault();
 e.stopPropagation();
 openReportSourceChooser();
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

if(ssMoreBtn) ssMoreBtn.addEventListener('click', (e)=>{
 e.preventDefault();
 e.stopPropagation();
 closeAllToolPopovers();
 toggleSheetMoreMenu();
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

/** To hop cac o dang duoc quet chon (keo chuot), giong vung chon trong Excel. */
function updateRangeHighlight(){
 sheetGridWrap.querySelectorAll('.sheet-data-cell.sheet-range-selected').forEach(el => el.classList.remove('sheet-range-selected'));
 sheetGridWrap.querySelectorAll('.sheet-cell.range-selected').forEach(el => el.classList.remove('range-selected'));
 sheetGridWrap.querySelectorAll('thead .sheet-col-head.range-col-selected').forEach(el => el.classList.remove('range-col-selected'));
 if(!selRangeAnchor || !selRangeEnd) return;
 const r1 = Math.min(selRangeAnchor.row, selRangeEnd.row), r2 = Math.max(selRangeAnchor.row, selRangeEnd.row);
 const c1 = Math.min(selRangeAnchor.col, selRangeEnd.col), c2 = Math.max(selRangeAnchor.col, selRangeEnd.col);
 if(sheetColumnSelection){
  for(let c = sheetColumnSelection.c1; c <= sheetColumnSelection.c2; c++){
   sheetGridWrap.querySelectorAll(`thead .sheet-col-head[data-col-index="${c}"]`).forEach(el => el.classList.add('range-col-selected'));
  }
 }
 if(r1 === r2 && c1 === c2) return; // chi 1 o thi khong can to nen, vien active-cell la du
 for(let r = r1; r <= r2; r++){
 for(let c = c1; c <= c2; c++){
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

// ===== Dropdown picker (shows options list on click) =====
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

// ===== Date picker (simple native input) =====
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

// ===== Duration picker =====
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

// ===== Checkbox toggle =====
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

// ===== Symbols picker =====
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

// ===== Multi-select picker =====
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

/** Doc 1 file thanh Data URL de co the mo/tai lai trong phien lam viec. */
function readFileAsDataUrl(file){
 return new Promise((resolve) => {
 const reader = new FileReader();
 reader.onload = () => resolve(reader.result);
 reader.onerror = () => resolve('');
 reader.readAsDataURL(file);
 });
}

const LOCAL_FILE_HELPER_URL = 'http://127.0.0.1:8780';
const ATTACHMENT_LARGE_FILE_MODE = true; // Luu thang vao Google Drive for Desktop, tranh OAuth/Apps Script cho file lon.

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

/** Them danh sach file (tu input hoac keo-tha) vao dong dinh kem dang mo, dong thoi day len Google Drive. */
function attachmentUploadConcurrency(){
 return canUseDriveDirectUpload() ? 3 : 2;
}

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
  const result = await withTimeout(uploadAttachmentSmart(projectName, archiveFolderName, rowLabel, file), 45000, 'Drive upload quá 45 giây. File đã lưu máy, có thể mở bằng máy.');
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


function hasAppsScriptUploadBackend(){
 return !!window.google?.script?.run
  && typeof google.script.run.withSuccessHandler === 'function';
}

function hasWebAppUploadBackend(){
 return !!SHEET_FACTORY_WEB_APP_URL && /^https:\/\/script\.google\.com\/macros\/s\//.test(SHEET_FACTORY_WEB_APP_URL);
}

function uploadBackendUnavailableMessage(){
 if(location.protocol === 'file:'){
  return 'Chua the upload truc tiep khi mo bang file://. Hay mo qua http://localhost va bam Drive API de nhap OAuth Client ID.';
 }
 if(!DRIVE_DIRECT_CLIENT_ID && !hasWebAppUploadBackend()){
  return 'Chua cau hinh OAuth Client ID va chua co Web App URL Apps Script.';
 }
 if(!window.google?.accounts?.oauth2){
  return 'Google Identity Services chua san sang. Hay tai lai trang hoac kiem tra ket noi mang.';
 }
 return 'Chua co kenh upload kha dung. Hay ket noi Drive API hoac Apps Script.';
}

function canUseDriveDirectUpload(){
 return !!DRIVE_DIRECT_CLIENT_ID
  && location.protocol !== 'file:'
  && !!window.google?.accounts?.oauth2;
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
  throw new Error('Drive API OAuth cần chạy qua http://localhost hoặc web app, không dùng file://.');
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
   console.warn('prepareAttachmentFolder via Apps Script failed, using Drive API folder lookup:', err);
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
   if(!hasAppsScriptUploadBackend() && !hasWebAppUploadBackend()) throw err;
   console.warn('Fallback Apps Script upload is available.');
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


// ===== FILE ATTACHMENT — Upload qua Apps Script backend (google.script.run) =====

/** Upload file lên Drive qua Apps Script (base64) */
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
    throw new Error('Web App khong tra JSON hop le. Neu gap loi CORS, hay mo app bang chinh Apps Script Web App URL.');
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

/** Xóa file trên Drive qua Apps Script */
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
 const fileLink = e.target.closest('.attach-file-name');
 if(fileLink){
  e.preventDefault();
  const sheet = getActiveSheet();
  if(!sheet || activeAttachmentRow === null) return;
  const files = ensureSheetAttachments(sheet)[activeAttachmentRow] || [];
  const file = files[Number(fileLink.dataset.fileI)];
  const opened = openAttachmentPreview(file);
  if(!opened && fileLink.href && fileLink.href !== '#'){
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

// ---------- màn chi tiết dự án ----------
const PROJECT_ARCHIVE_GROUPS = [
 {name:'01_HOP_DONG_PHAP_LY', label:'Hợp đồng - pháp lý', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'01_HOP_DONG_PHAP_LY'},
 {name:'02_VAT_LIEU_CO_CQ', label:'Vật liệu - CO CQ', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'02_VAT_LIEU_CO_CQ'},
 {name:'03_THI_CONG_NGHIEM_THU', label:'Thi công - nghiệm thu', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'03_THI_CONG_NGHIEM_THU'},
 {name:'04_THANH_TOAN_QUYET_TOAN', label:'Thanh toán - quyết toán', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'04_THANH_TOAN_QUYET_TOAN'},
 {name:'05_TONG_HOP_DOI_CHIEU', label:'Tổng hợp - đối chiếu', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Sheet hồ sơ', uploadFolder:'05_TONG_HOP_DOI_CHIEU'}
];

const PROJECT_DEFAULT_ITEMS = PROJECT_ARCHIVE_GROUPS.concat([
 {name:'REPOST_CARRY_FORWARD', label:'Repost', fav:false, type:'grid', kind:'folder-sheet', sheetTitle:'Repost', uploadFolder:'05_TONG_HOP_DOI_CHIEU'},
 {name:'DASHBOARD_TONG_HOP', label:'Dashboard', fav:false, type:'dashboard', kind:'dashboard', updated:new Date().toLocaleDateString('vi-VN')}
]);

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

const FOLDER_TEMPLATES = PROJECT_DEFAULT_ITEMS.map(item => {
 const template = {...item};
 if(template.type === 'dashboard'){
  template._dashboardConfig = createDefaultDashboardConfig(template.label);
  return template;
 }
 return {
  ...template,
  cells:createEmptySheetCells(60, template.name),
  attachments:{},
  settings:{defaultRowHeight:32, defaultWrap:true, columnWrap:{}}
 };
});

function normalizeProjectFolderSet(existingFolders){
 const existing = Array.isArray(existingFolders) ? existingFolders : [];
 return PROJECT_DEFAULT_ITEMS.map(template => {
  const isArchiveGroup = PROJECT_ARCHIVE_GROUPS.some(group => group.name === template.name);
  const old = existing.find(item => item && (item.name === template.name || (isArchiveGroup && item.uploadFolder === template.uploadFolder)));
  const item = cloneWorkspaceItem(old || template);
  item.name = template.name;
  item.label = template.label;
  item.type = template.type;
  item.kind = template.kind || (template.type === 'grid' ? 'folder-sheet' : template.type);
  item.sheetTitle = template.sheetTitle || 'Sheet hồ sơ';
  item.uploadFolder = template.uploadFolder;
  item.fav = !!item.fav;
  item.updated = item.updated || new Date().toLocaleDateString('vi-VN');
  if(item.type === 'dashboard'){
   if(!item._dashboardConfig) item._dashboardConfig = createDefaultDashboardConfig(item.label);
   return item;
  }
  if(!Array.isArray(item.cells) || !Array.isArray(item.cells[0])){
   item.cells = createEmptySheetCells(60, item.name);
  }
  ensureSheetCells(item);
  ensureSheetAttachments(item);
  ensureSheetSettings(item);
  return item;
 });
}

function normalizeAllProjectFolders(){
 while(PROJECT_FOLDERS.length < DATA.length){
  PROJECT_FOLDERS.push([]);
 }
 for(let i = 0; i < DATA.length; i++){
  PROJECT_FOLDERS[i] = normalizeProjectFolderSet(PROJECT_FOLDERS[i]);
 }
 if(PROJECT_FOLDERS.length > DATA.length){
  PROJECT_FOLDERS.length = DATA.length;
 }
}

var PROJECT_FOLDERS = DATA.map(() => FOLDER_TEMPLATES.map(cloneWorkspaceItem));
normalizeAllProjectFolders();

/** Dựng bảng cells demo với dòng mẫu riêng cho từng nhóm hồ sơ. */
function buildDemoSheetCells(sampleRows, rowCount = 60){
 const headers = SHEET_COLUMN_CONFIG.map(c => c.label);
 const rows = Array.from({length:rowCount}, () => Array.from({length:headers.length}, () => ''));
 rows[0] = headers;
 sampleRows.forEach((sample, index) => { rows[index + 1] = sample; });
 return rows;
}

var activeProjectIndex = null;

const SHARE_PEOPLE = [
 {name:'Quân', role:'Chủ sở hữu'},
 {name:'Trần Dũng', role:'Người chỉnh sửa'},
 {name:'Bùi Văn Toàn', role:'Người chỉnh sửa'},
 {name:'Lê Văn Lương', role:'Người xem'},
];

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

function renderFolderRows(){
 if(activeProjectIndex === null) return;
 const folders = PROJECT_FOLDERS[activeProjectIndex];
 const focusContext = workspaceBrowseFocusContext || activeSheetContext;
 document.getElementById('folderRows').innerHTML = folders.map((f, i) => `
 <tr class="${focusContext && focusContext.projectIndex === activeProjectIndex && focusContext.folderIndex === i ? 'active-child' : ''}" data-folder-i="${i}">
 <td class="col-check"><input type="checkbox" onclick="event.stopPropagation()"></td>
 <td class="col-star ${f.fav?'fav':''}" onclick="toggleFolderFav(event, ${i})">${f.fav ? '★' : '☆'}</td>
 <td><span class="folder-icon workspace-type-wrap">${workspaceItemIconHtml(f)}</span><span class="folder-name">${f.label || f.name}</span><div class="proj-sub" style="margin-left:34px">${f.name} · 1 sheet</div></td>
 </tr>`).join('');
 renderFavorites();
}

document.getElementById('folderRows').addEventListener('contextmenu', (e)=>{
 const row = e.target.closest('tr[data-folder-i]');
 if(activeProjectIndex === null) return;
 if(!row){
  e.preventDefault();
  e.stopPropagation();
  showWorkspaceLayoutMenuAt(e.clientX, e.clientY);
  return;
 }
 const folderIndex = Number(row.dataset.folderI);
 const item = PROJECT_FOLDERS[activeProjectIndex]?.[folderIndex];
 if(isWorkspaceFolderLike(item)){
  e.preventDefault();
  e.stopPropagation();
  showWorkspaceLayoutMenuAt(e.clientX, e.clientY);
  return;
 }
 openWorkspaceItemMenuFromRow(row, e, activeProjectIndex);
});

document.getElementById('folderRows').addEventListener('click', (e)=>{
 const row = e.target.closest('tr[data-folder-i]');
 if(!row || activeProjectIndex === null) return;
 if(e.target.closest('input') || e.target.closest('.col-star')) return;
 const folderIndex = Number(row.dataset.folderI);
 const item = PROJECT_FOLDERS[activeProjectIndex]?.[folderIndex];
 if(isWorkFile(item)) openSheet(activeProjectIndex, folderIndex);
});

const workspaceFolderTable = document.querySelector('#screen-detail .folder-table');
const workspaceBlankTarget = document.getElementById('workspaceBlankTarget');
if(workspaceFolderTable){
 const openBlankWorkspaceMenu = (e) => {
  if(activeProjectIndex === null) return;
  if(e.target.closest('tr[data-folder-i], input, button, .layout-menu, .workspace-item-menu')) return;
  e.preventDefault();
  e.stopPropagation();
  showWorkspaceLayoutMenuAt(e.clientX, e.clientY);
 };
 workspaceFolderTable.addEventListener('contextmenu', openBlankWorkspaceMenu);
 workspaceBlankTarget?.addEventListener('contextmenu', openBlankWorkspaceMenu);
}

[document.getElementById('detailTitle'), activeSheetName, activeReportName].forEach(el => {
 if(!el) return;
 el.setAttribute('title', 'Bấm để đổi tên');
 el.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  renameActiveTitle();
 });
});

function toggleFolderFav(e, i){
 e.stopPropagation();
 if(activeProjectIndex === null) return;
 PROJECT_FOLDERS[activeProjectIndex][i].fav = !PROJECT_FOLDERS[activeProjectIndex][i].fav;
 renderFolderRows();
}

function openDetail(projectIndex){
 activeProjectIndex = projectIndex;
 showFolderListView();
 const p = DATA[projectIndex];
 document.getElementById('detailTitle').textContent = p.name;
 render();
 renderFolderRows();
 document.getElementById('shareList').innerHTML = SHARE_PEOPLE.map(s => `
 <div class="share-person">
 <div class="share-avatar">${initials(s.name)}</div>
 <div>
 <div class="share-name">${s.name}</div>
 <div class="share-role">${s.role}</div>
 </div>
 </div>`).join('');

 main.classList.add('detail-open');
 const currentWidth = parseFloat(getComputedStyle(main).getPropertyValue('--project-column-size'));
 if(Number.isFinite(currentWidth)) setProjectColumnWidth(currentWidth);
 if(window.innerWidth <= 760){
 document.getElementById('screen-list').style.display = 'none';
 } else {
 document.getElementById('screen-list').style.display = 'flex';
 }
 document.getElementById('screen-detail').style.display = 'flex';
 pushNavState();
}

document.getElementById('backToList').addEventListener('click', ()=>{
 saveCurrentProjectStateSilently();
 goHomeToProjectList();
 pushNavState();
});

// ===== ATTACH PANEL v24 (Right Sidebar) =====
let currentAttachTab = 'row';
let currentAttachDropdownFile = null;
let currentAttachFileUrl = null;
let currentAttachFileId = null;

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

function renderAttachPanel() {
  renderAttachmentPanel();
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📈', pptx: '📈', jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', txt: '📃', zip: '📦', rar: '📦' };
  return icons[ext] || '📄';
}

// Upload queue
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

// Drag & drop
const dropzone = document.getElementById('attachDropzone');
const input = document.getElementById('attachFileInput');

if (dropzone && input) {
  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); if (e.dataTransfer.files.length) addAttachmentFiles(e.dataTransfer.files); });
  input.addEventListener('change', () => { if (input.files.length) addAttachmentFiles(input.files); input.value = ''; });
}

// Close dropdown on outside click
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


if(!window.__QLDA_APP_STARTED__){
  window.__QLDA_APP_STARTED__ = true;
  initAuth();
}



