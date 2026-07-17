const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '../02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v30_quan.html');
let source = fs.readFileSync(target, 'utf8');
const eol = source.includes('\r\n') ? '\r\n' : '\n';

function replaceCount(label, beforeLines, afterLines, expectedCount) {
  const before = beforeLines.join(eol);
  const after = afterLines.join(eol);
  const matches = source.split(before).length - 1;
  if (matches !== expectedCount) throw new Error(`${label}: expected ${expectedCount} matches, got ${matches}`);
  source = source.split(before).join(after);
}

replaceCount('sheet and report active refresh', [
  ' activeSheetContext = {projectIndex, folderIndex};',
  ' updateBrowseBreadcrumb(projectIndex);'
], [
  ' activeSheetContext = {projectIndex, folderIndex};',
  ' refreshWorkspaceFolderTreeIfVisible();',
  ' updateBrowseBreadcrumb(projectIndex);'
], 2);

replaceCount('dashboard active refresh', [
  '  activeSheetContext = {projectIndex:projectIndex, folderIndex:folderIndex};',
  '  updateBrowseBreadcrumb(projectIndex);'
], [
  '  activeSheetContext = {projectIndex:projectIndex, folderIndex:folderIndex};',
  '  refreshWorkspaceFolderTreeIfVisible();',
  '  updateBrowseBreadcrumb(projectIndex);'
], 1);

fs.writeFileSync(target, source, 'utf8');
