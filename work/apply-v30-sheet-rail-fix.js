const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '../02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v30_quan.html');
let source = fs.readFileSync(target, 'utf8');
const eol = source.includes('\r\n') ? '\r\n' : '\n';

function replaceExactlyOnce(label, beforeLines, afterLines) {
  const before = beforeLines.join(eol);
  const after = afterLines.join(eol);
  const first = source.indexOf(before);
  if (first < 0 || first !== source.lastIndexOf(before)) throw new Error(`${label}: expected exactly one match`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
}

replaceExactlyOnce('remove topbar override', [
  '.topbar .right-toolbar {', '  position: static;', '  width: auto;', '  height: auto;',
  '  flex: 0 0 auto;', '  flex-direction: row;', '  padding: 4px;',
  '  border: 1px solid var(--line);', '  border-radius: 8px;', '  z-index: auto;', '}', '', ''
], []);

replaceExactlyOnce('mount rail at app root', [
  '<button class="workspace-nav-trigger" id="workspaceNavTrigger" type="button" title="Về danh sách dự án">‹ Dự án</button>', '',
  '<!-- Legacy ATTACH PANEL v24 removed: toolbar paperclip now opens the single #attachmentPanel drawer. -->'
], [
  '<button class="workspace-nav-trigger" id="workspaceNavTrigger" type="button" title="Về danh sách dự án">‹ Dự án</button>', '',
  '<div class="right-toolbar" id="rightToolbar" aria-label="Công cụ sheet">',
  ' <button class="right-toolbar-btn" id="tbAttach" type="button" title="Đính kèm" aria-label="Đính kèm" onclick="openAttachmentPanelFromToolbar()">📎</button>',
  ' <button class="right-toolbar-btn" id="tbComment" type="button" title="Bình luận" aria-label="Bình luận">💬</button>',
  ' <button class="right-toolbar-btn" id="tbActivity" type="button" title="Lịch sử" aria-label="Lịch sử">📋</button>',
  ' <button class="right-toolbar-btn" id="tbInfo" type="button" title="Thông tin" aria-label="Thông tin">ℹ️</button>',
  '</div>', '',
  '<!-- Legacy ATTACH PANEL v24 removed: toolbar paperclip now opens the single #attachmentPanel drawer. -->'
]);

replaceExactlyOnce('remove rail from project topbar', [
  ' <div class="right-toolbar" id="rightToolbar" aria-label="Công cụ dự án">',
  '  <button class="right-toolbar-btn" id="tbAttach" title="Đính kèm" onclick="openAttachmentPanelFromToolbar()">📎</button>',
  '  <button class="right-toolbar-btn" id="tbComment" title="Bình luận">💬</button>',
  '  <button class="right-toolbar-btn" id="tbActivity" title="Lịch sử">📋</button>',
  '  <button class="right-toolbar-btn" id="tbInfo" title="Thông tin">ℹ️</button>', ' </div>'
], []);

replaceExactlyOnce('prefer open sheet context', [
  'function getWorkspaceBrowseFocusContext(){',
  ' return workspaceBrowseFocusContext || activeSheetContext || null;', '}'
], [
  'function getWorkspaceBrowseFocusContext(){',
  ' return activeSheetContext || workspaceBrowseFocusContext || null;', '}'
]);

fs.writeFileSync(target, source, 'utf8');
