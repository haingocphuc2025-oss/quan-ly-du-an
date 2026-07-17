// This module is loaded before main.js. Keep the small shared helpers and
// menu state available during the initial Browse render.
function escapeHtml(value){
 const text = String(value ?? '');
 return text.replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[char]));
}

let workspaceItemMenuTarget = null;
function getItemIconSVG(type, size = 22){
 const label = String(type || 'file').slice(0, 1).toUpperCase();
 return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;font-size:${Math.max(11, Math.round(size * .55))}px;font-weight:700;color:#0f7b4d;border:1px solid #54b98a;border-radius:2px;background:#effaf4">${label}</span>`;
}

let isRestoringNavState = false;
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
 {key:'shared', label:'Trạng thái chia sẻ'},
 {key:'owner', label:'Người sở hữu'},
 {key:'updated', label:'Last Update'}
];

let workspaceNavigatorSection = 'workspaces';

const RECENT_PROJECTS_STORAGE_KEY = 'recentProjectIndexesV27';

const RECENT_PROJECT_LIMIT = 10;

let activeRailSection = document.querySelector('.rail-item.active[data-rail]')?.dataset.rail || 'projects';

function readRecentProjectIndexes(){
 let stored = [];
 try{
  const parsed = JSON.parse(localStorage.getItem(RECENT_PROJECTS_STORAGE_KEY) || '[]');
  if(Array.isArray(parsed)) stored = parsed;
 }catch(_error){}
 const valid = [...new Set(stored.map(Number))]
  .filter(index=>Number.isInteger(index) && index >= 0 && index < DATA.length)
  .slice(0, RECENT_PROJECT_LIMIT);
 return valid.length ? valid : DATA.map((_, index)=>index).slice(0, RECENT_PROJECT_LIMIT);
}

function rememberRecentProject(projectIndex){
 const index = Number(projectIndex);
 if(!Number.isInteger(index) || index < 0 || index >= DATA.length) return;
 const next = [index, ...readRecentProjectIndexes().filter(item=>item !== index)]
  .slice(0, RECENT_PROJECT_LIMIT);
 localStorage.setItem(RECENT_PROJECTS_STORAGE_KEY, JSON.stringify(next));
}

function getRailProjectIndexes(section = activeRailSection){
 if(section === 'recents') return readRecentProjectIndexes();
 return DATA.map((_, index)=>index);
}

function getPreferredOverviewProjectIndex(section, previousProjectIndex){
 const indexes = getRailProjectIndexes(section);
 return indexes.includes(previousProjectIndex) ? previousProjectIndex : (indexes[0] ?? null);
}

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
   shared:Boolean(project.shared),
   owner:project.owner || '',
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
    shared:Boolean(project.shared),
    owner:project.owner || '',
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

function sharingStatusBadgeHtml(shared){
 return shared
  ? '<span class="browse-sharing-badge shared"><span class="dot"></span>Đã chia sẻ</span>'
  : '<span class="browse-sharing-badge private"><span class="dot"></span>Riêng tư</span>';
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
   if(col.key === 'shared') return `<td>${sharingStatusBadgeHtml(item.shared)}</td>`;
   if(col.key === 'owner') return `<td>${escapeHtml(item.owner)}</td>`;
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
   <td>${sharingStatusBadgeHtml(project.shared)}</td>
   <td>${escapeHtml(project.owner || '')}</td>
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

workspaceNavTrigger?.addEventListener('click', () => openRailProjectList('projects', true));

workspaceNavigatorClose?.addEventListener('click', closeWorkspaceNavigator);

workspaceNavigator?.addEventListener('mousedown', (e) => {
 if(e.target === workspaceNavigator) closeWorkspaceNavigator();
});

workspaceNavTree?.addEventListener('click', (e) => {
 const btn = e.target.closest('button[data-nav-section]');
 if(btn) renderWorkspaceNavigator(btn.dataset.navSection);
});

workspaceNavigatorRows?.addEventListener('contextmenu', (e) => {
 const row = e.target.closest('tr[data-project-i]');
 if(!row) return;
 e.preventDefault(); e.stopPropagation();
 const projectIndex = Number(row.dataset.projectI);
 const folderRaw = row.dataset.folderI;
 if(folderRaw === '') showWorkspaceLayoutMenuAt(e.clientX, e.clientY, projectIndex);
 else openWorkspaceItemMenuFromRow(row, e, projectIndex);
});

workspaceNavigatorRows?.addEventListener('click', (e) => {
 const row = e.target.closest('tr[data-project-i]');
 if(row) openWorkspaceNavigatorItem(row);
});

workspaceBrowseRows?.addEventListener('click', (e) => {
 const row = e.target.closest('tr[data-project-i]');
 if(row) openWorkspaceNavigatorItem(row);
});

workspaceBrowseTree?.addEventListener('contextmenu', (e) => {
 const projectBtn = e.target.closest('button[data-browse-project-i]');
 if(!projectBtn) return;
 e.preventDefault(); e.stopPropagation();
 const projectIndex = Number(projectBtn.dataset.browseProjectI);
 activeProjectIndex = projectIndex;
 workspaceBrowseFocusContext = {projectIndex, folderIndex:null};
 showWorkspaceLayoutMenuAt(e.clientX, e.clientY, projectIndex);
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

const ctxMenu = document.getElementById('ctxMenu');

const ctxTitle = document.getElementById('ctxTitle');

const ctxFavoriteText = document.getElementById('ctxFavoriteText');

const tableWrap = document.querySelector('.table-wrap');

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

var workspaceBrowseFocusContext = null;

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
 if(ctxFavoriteText) ctxFavoriteText.textContent = p.fav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích';
 rows.querySelectorAll('tr').forEach(row => {
 row.classList.toggle('ctx-selected', Number(row.dataset.i) === ctxProjectIndex);
 });
 return true;
}

function showProjectActionMenu(projectIndex, x, y){
 if(!prepareProjectActionMenu(projectIndex)) return;
 closeFavorites();
 ctxMenu.classList.add('show');
 positionWorkspaceRootMenu('workspace-project-menu', ctxMenu, x, y);
 bindWorkspaceSubmenuPositioning(ctxMenu);
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
  showWorkspaceCreateMenuAt(e.clientX, e.clientY);
 };
 projectBlankTarget.addEventListener('contextmenu', openProjectBlankCreateMenu);
}

function closeLayoutMenu(){
 layoutMenu.classList.remove('show');
 MenuPositioning.unregister('workspace-create-menu');
}

function positionWorkspaceRootMenu(id, menu, x, y){
 const reposition = () => MenuPositioning.positionRootElement(menu, x, y, {margin:8});
 reposition();
 MenuPositioning.register(id, reposition);
 MenuPositioning.enableKeyboardNavigation(menu, 'button:not(:disabled)');
}

function bindWorkspaceSubmenuPositioning(root){
 root.querySelectorAll('.ctx-submenu-wrap').forEach(wrap => {
  if(wrap.dataset.viewportPositionBound === '1') return;
  wrap.dataset.viewportPositionBound = '1';
  const submenu = wrap.querySelector('.ctx-submenu');
  const anchor = wrap.querySelector(':scope > .ctx-item') || wrap;
  if(!submenu) return;
  const reposition = () => MenuPositioning.positionSubmenuElement(submenu, anchor, {margin:8, gap:8});
  const open = () => {
   reposition();
   MenuPositioning.register('workspace-context-submenu', reposition);
  };
  const close = (event) => {
   if(event?.type === 'focusout' && wrap.contains(event.relatedTarget)) return;
   MenuPositioning.unregister('workspace-context-submenu');
  };
  wrap.addEventListener('mouseenter', open);
  wrap.addEventListener('mouseleave', close);
  wrap.addEventListener('focusin', open);
  wrap.addEventListener('focusout', close);
  wrap.addEventListener('keydown', event => {
   if(event.key !== 'ArrowRight') return;
   event.preventDefault();
   open();
   submenu.querySelector('button:not(:disabled)')?.focus();
  });
 });
}

function showWorkspaceCreateMenuAt(x, y, projectIndex = getActionProjectIndex()){
 closeWorkspaceItemMenu?.();
 closeContextMenu?.();
 closeFavorites?.();
 const selectedProjectIndex = Number.isInteger(projectIndex) ? projectIndex : getActionProjectIndex();
 if(selectedProjectIndex === null || !DATA[selectedProjectIndex]) return;
 activeProjectIndex = selectedProjectIndex;
 layoutMenu.classList.add('show');
 positionWorkspaceRootMenu('workspace-create-menu', layoutMenu, x, y);
}

function showWorkspaceLayoutMenuAt(x, y, projectIndex = getActionProjectIndex()){
 closeWorkspaceItemMenu?.();
 closeLayoutMenu?.();
 showProjectActionMenu(projectIndex, x, y);
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
 // Dùng so khớp CHÍNH XÁC (không dùng .includes) để tránh nhận nhầm kind 'folder-sheet'
 // (item Sheet thường) thành folder thật — bug đã phát hiện ở spec screen-state-behavior:
 // 'folder-sheet'.includes('folder') === true khiến mọi item Sheet bị mở nhầm menu "Tạo mới"
 // khi chuột phải thay vì đúng ra phải mở menu item (Rename/Delete/Export...).
 return rawKind === 'folder' || rawKind === 'workspace' || rawType === 'folder' || rawType === 'workspace';
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

function getActiveProjectName(){
 return activeSheetContext && DATA[activeSheetContext.projectIndex]
 ? DATA[activeSheetContext.projectIndex].name
 : '';
}

function getActiveArchiveFolderName(sheet){
 return sheet?.uploadFolder || sheet?.name || '';
}

function isWorkFile(item){
 return item && item.type !== 'folder' && item.type !== 'workspace';
}

function applyRailCollapsed(collapsed){
 appShell.classList.toggle('rail-collapsed', collapsed);
 localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
}

railToggleBtn.addEventListener('click', () => {
 applyRailCollapsed(!appShell.classList.contains('rail-collapsed'));
});

if(localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY) === '1') applyRailCollapsed(true);

FOLDER_TEMPLATES = PROJECT_DEFAULT_ITEMS.map(item => {
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

PROJECT_FOLDERS = DATA.map(() => FOLDER_TEMPLATES.map(cloneWorkspaceItem));

normalizeAllProjectFolders();

initRailSectionNavigation();

let navHistory = [{type:'list'}];

let navIndex = 0;

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
 activeRailSection = section;
 const shouldShowWorkspaceTree = section === 'projects';
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
 if(section === 'projects') showWorkspaceBrowsePage('workspaces');
 else hideWorkspaceBrowsePage();
 if(section === 'home' || section === 'recents'){
  const overviewProjectIndex = getPreferredOverviewProjectIndex(section, previousProjectIndex);
  if(Number.isInteger(overviewProjectIndex)){
   openDetail(overviewProjectIndex, {pushHistory:false, remember:false});
   updateProjectListHeader(section);
   setRailActive(section);
  }
 }
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
 openRailProjectList('home', false);
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

function updateBrowseBreadcrumb(projectIndex){
 const projectName = DATA?.[projectIndex]?.name || 'Browse';
 document.querySelectorAll('[data-browse-breadcrumb]').forEach(button => {
  button.textContent = `‹ ${projectName}`;
  button.title = `Quay lại Browse — ${projectName}`;
 });
}

function returnToBrowseFromChild(event){
 event.preventDefault();
 event.stopImmediatePropagation();
 if(typeof saveCurrentProjectStateSilently === 'function') saveCurrentProjectStateSilently();
 const previousState = navHistory[navIndex - 1];
 if(previousState?.type === 'list') navBack();
 else openRailProjectList('projects', true);
}

function initBrowseBreadcrumbs(){
 document.querySelectorAll('[data-browse-breadcrumb]').forEach(button => {
  if(button.dataset.browseBreadcrumbBound === '1') return;
  button.dataset.browseBreadcrumbBound = '1';
  button.addEventListener('click', returnToBrowseFromChild, true);
 });
}

navBackBtn.addEventListener('click', navBack);

navForwardBtn.addEventListener('click', navForward);

initBrowseBreadcrumbs();

if(appUserNameBtn) appUserNameBtn.addEventListener('click', () => {
 if(typeof changeAppUserName === 'function') changeAppUserName();
});

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

function closeWorkspaceItemMenu(){
 document.querySelector('.workspace-item-menu')?.remove();
 MenuPositioning.unregister('workspace-item-menu');
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
 if(action === 'open'){ if(item.type === 'report') openReport(projectIndex, folderIndex); else openSheet(projectIndex, folderIndex); }
 else if(action === 'open-tab') window.open(location.href, '_blank', 'noopener');
 else if(action === 'share') alert('Share se ket noi quyen Drive/Publish o buoc sau.');
 else if(action === 'owner') alert('Make Me the Owner se ket noi quyen Drive o buoc sau.');
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
 menu.innerHTML = `
  <div class="menu-title">${escapeHtml(type)}: ${escapeHtml(getWorkspaceItemLabel(item))}</div>
  <button type="button" data-act="open"><span class="menu-ic">O</span>Open</button>
  <button type="button" data-act="open-tab"><span class="menu-ic">↗</span>Open in New Tab</button>
  <button type="button" data-act="share"><span class="menu-ic">S</span>Share...</button>
  <button type="button" data-act="owner"><span class="menu-ic">O</span>Make Me the Owner...</button>
  <button type="button" data-act="rename"><span class="menu-ic">A</span>Rename...</button>
  <div class="menu-sep"></div>
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
  <button type="button" data-act="sharing-report"><span class="menu-ic">CSV</span>Download Workspace Sharing Report (csv)</button>
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
 positionWorkspaceRootMenu('workspace-item-menu', menu, x, y);
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
 rememberRecentProject(projectIndex);
 if(sheet.type === 'report'){ openReport(projectIndex, folderIndex); return; }
 if(sheet.type === 'dashboard'){ openDashboard(projectIndex, folderIndex); return; }
 if(options && options.scrollToRow != null) expandAncestorsForRow(sheet, options.scrollToRow);
 activeProjectIndex = projectIndex;
 activeSheetContext = {projectIndex, folderIndex};
 updateBrowseBreadcrumb(projectIndex);
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
 if(action === 'open-tab'){ window.open(location.href, '_blank', 'noopener'); closeContextMenu(); return; }
 if(action === 'save-new'){ action = 'duplicate'; }
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
  const names = saved.map((t, i) => `${i+1}. ${t.name}`).join('\n');
  const choice = prompt(`Chọn mẫu:\n${names}\n\nNhập số hoặc tên:`, '');
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
  'open-tab':'Mở trong tab mới',
  'remove-sharing':'Gỡ quyền chia sẻ của tôi khỏi',
  'save-new':'Lưu thành bản mới từ',
  'workspace-colors':'Mở tùy chỉnh màu/logo của',
  backup:'Đã yêu cầu backup cho',
  'schedule-backup':'Đã lập lịch backup cho',
  'export-excel':'Xuất Excel từ',
  'export-pdf':'Xuất PDF từ',
  'export-sheets':'Xuất Google Sheets từ',
  'sharing-report':'Tải báo cáo chia sẻ của',
  properties:'Xem thuộc tính của',
  'browse-templates':'Mở Browse Templates cho',
  'import-excel':'Import Excel vào',
  'import-project':'Import Project vào',
  'import-gsheets':'Import Google Sheets vào',
  'import-trello':'Import Trello vào',
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

function renderFolderRows(){
 if(activeProjectIndex === null) return;
 const folders = PROJECT_FOLDERS[activeProjectIndex];
 document.getElementById('folderRows').innerHTML = folders.map((f, i) => `
 <tr class="${activeSheetContext && activeSheetContext.projectIndex === activeProjectIndex && activeSheetContext.folderIndex === i ? 'active-child' : ''}" data-folder-i="${i}">
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
  showWorkspaceCreateMenuAt(e.clientX, e.clientY);
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
  showWorkspaceCreateMenuAt(e.clientX, e.clientY);
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

function openDetail(projectIndex, options = {}){
 activeProjectIndex = projectIndex;
 if(options.remember !== false) rememberRecentProject(projectIndex);
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
 if(options.pushHistory !== false) pushNavState();
}

document.getElementById('backToList').addEventListener('click', ()=>{
 saveCurrentProjectStateSilently();
 goHomeToProjectList();
 pushNavState();
});
