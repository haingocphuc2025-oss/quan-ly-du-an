const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const reportSource = fs.readFileSync(path.join(root, 'js', 'report.js'), 'utf8');
const dashboardSource = fs.readFileSync(path.join(root, 'js', 'dashboard.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'css', 'main.css'), 'utf8');

test('Report actions use the active project outside parameterized openReport', () => {
  const chooser = reportSource.slice(
    reportSource.indexOf('function openReportSourceChooser()'),
    reportSource.indexOf('function toggleReportPopover(name)')
  );
  const renderer = reportSource.slice(
    reportSource.indexOf('function renderReportView()'),
    reportSource.indexOf('function activateReportAttachmentRow(')
  );
  const rowHeight = reportSource.slice(reportSource.indexOf('function setReportRowHeight('));
  assert.match(chooser, /rememberRecentProject\(activeProjectIndex\)/);
  assert.match(renderer, /rememberRecentProject\(activeProjectIndex\)/);
  assert.match(rowHeight, /rememberRecentProject\(activeProjectIndex\)/);
  assert.doesNotMatch(chooser + renderer + rowHeight, /rememberRecentProject\(projectIndex\)/);
});

test('Report source popover exposes Cancel and OK actions', () => {
  assert.match(htmlSource, /id="rptSourceCancelBtn"[^>]*>Hủy<\/button>/);
  assert.match(htmlSource, /id="rptSourceOkBtn"[^>]*>OK<\/button>/);
  assert.match(cssSource, /\.ss-pop-action\.primary/);
});

test('Report source selection stays in a draft until OK applies it', () => {
  assert.match(reportSource, /let reportSourceDraft = null/);
  assert.match(reportSource, /reportSourceDraft = config\.sources\.map/);
  assert.match(reportSource, /const draftConfig = \{sources:reportSourceDraft \|\| \[\]\}/);
  assert.doesNotMatch(
    reportSource.slice(
      reportSource.indexOf('function renderReportSourcePopover(report)'),
      reportSource.indexOf('function renderReportColumnsPopover(report)')
    ),
    /renderReportView\(\)/
  );
  assert.match(dashboardSource, /config\.sources = \(reportSourceDraft \|\| \[\]\)\.map/);
  assert.match(dashboardSource, /rptSourceCancelBtn\.addEventListener\('click'/);
  assert.match(dashboardSource, /rptSourceOkBtn\.addEventListener\('click'/);
});
