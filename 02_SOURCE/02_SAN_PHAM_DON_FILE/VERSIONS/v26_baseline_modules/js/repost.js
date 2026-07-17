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
