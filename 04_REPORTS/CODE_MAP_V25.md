# CODE_MAP_V25

Nguồn: `02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v25_quan.html`
Đối chiếu: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v25_baseline.html`
Phương pháp: đọc file trực tiếp (Read/Grep) — session này KHÔNG có tool codebase-memory-mcp (search_code/trace/architecture), nên theo đúng `.agents/CODEBASE_MEMORY.md` mục "Điều kiện": bỏ qua yêu cầu dùng graph, đọc file thường.
Ngày tạo: 15/07/2026

## 0. SHA-256 — ĐÃ XÁC MINH: KHỚP

Hash tính bằng `Get-FileHash -Algorithm SHA256` (PowerShell, chạy trực tiếp trên máy — môi trường tạo báo cáo này không mount được ổ Drive vào sandbox bash nên không tự tính được, đã nhờ người dùng chạy).

| File | SHA-256 | Trạng thái |
|---|---|---|
| STAGING/giao-dien-desktop-don-gian_v25_quan.html | 4AA136AC75449F86DD2117295D59FE2E4DFAAC5366EE42F5143D1B6B9B799A88 | **KHỚP** |
| VERSIONS/v25_baseline.html | 4AA136AC75449F86DD2117295D59FE2E4DFAAC5366EE42F5143D1B6B9B799A88 | **KHỚP** |

Hai hash giống hệt nhau → điều kiện tiên quyết mục 2 của SPEC modular-split-v26 đã đạt, có thể tiến hành thi công tách module.

## 1. Số liệu tổng quan (STAGING file)

- Tổng số dòng: **11713**
- Khối `<style>...</style>`: 1 khối, dòng 9–2520 → **CSS ≈ 2510 dòng** (nội dung giữa 2 thẻ)
- Khối `<script>...</script>` inline (chứa toàn bộ logic app): 1 khối, dòng 3074–11688 → **JS ≈ 8613 dòng** (nội dung giữa 2 thẻ)
- Ngoài ra có 2 thẻ `<script src="...">` external (dòng 8: Google GSI client; dòng 3073: xlsx.full.min.js) — không có nội dung inline, không tính vào số dòng JS trên.
- Tổng số hàm JS (khớp `function name(...)` hoặc `async function name(...)`, đếm bằng grep): **442**
- Ngoài ra còn một số hàm cục bộ dạng `const x = (...) => {...}` lồng bên trong hàm cha (closures đặt tên như `close`, `commit`, `onMove`, `onUp`, `render`...) dùng cho popover/menu — các closures này di chuyển CÙNG khối với hàm cha khi tách module (theo luật "CHỈ CẮT-DÁN nguyên khối" của SPEC mục 5), nên KHÔNG liệt kê riêng ở đây.

## 2. Danh sách hàm JS theo nhóm module (SPEC modular-split-v26 mục 3)

Ghi chú: hàm đánh dấu **[?]** là hàm mang tên chung/tiện ích, không xác định rõ nhóm chỉ từ tên — tạm xếp `main`, cần xác nhận lại khi thi công tách file (đúng theo hướng dẫn SPEC mục 3).

### state (2)
| Dòng | Hàm |
|---|---|
| 4370 | sampleRowsForArchiveSheet |
| 11334 | buildDemoSheetCells |

### storage (29)
loadFromDrive(3780), saveToDrive(3822), cloneJsonForProjectSave(3839), syncVisibleSheetDomToData(3843), buildProjectSaveSnapshot(3865), saveProjectLocalBackup(3876), loadProjectLocalBackup(3880), applyProjectSnapshot(3898), saveProjectDiskBackup(3908), loadProjectDiskBackup(3920), persistToDrive(3931), flushCurrentUiEditsBeforeSave(3938), saveProjectNow(3955), saveCurrentProjectStateSilently(3971), saveProjectBeforeUnload(3984), showSaveStatus(4000), saveProjectData(4027), loadProjectData(4032), loadColWidths(4916), sanitizeColWidths(4922), saveColWidthsStore(4933), getStoredColWidth(4936), saveColWidth(4940), collectProjectUiState(4946), applyProjectUiState(4952), getSavedFilters(5903), saveCurrentFilter(5909), loadSavedFilter(5922), saveAttachmentToLocalHelper(10689)

### api (53)
initAuth(4009), getAttachmentDriveId(4785), extractDriveIdFromUrl(4802), normalizeGoogleSheetUrl(5044), googleSheetFrameUrl(5052), renderGoogleSheetHost(5059), linkExistingGoogleSheet(5082), setGoogleSheetCreating(5096), applyCreatedGoogleSheet(5104), createGoogleSheetPayload(5116), callSheetFactory_(5125), cleanup[nested@5142], createProjectSheetViaWebApp(5170), fetchSheetDataViaWebApp(5174), saveCellViaWebApp(5178), callSheetFactoryPost_(5183), uploadFileToDriveViaWebApp(5196), deleteFileFromDriveViaWebApp(5200), scheduleSheetDataSave(5223), buildSheetSavePayload(5233), saveSheetDataToWebApp(5264), loadSheetDataFromWebApp(5273), scheduleCellSave(5280), hasPendingSave[nested@5294], forceFlushAllPendingSaves[nested@5297], reloadRealSheetData(5327), createRealGoogleSheetForActiveItem(5343), requestDriveSignIn(8441), readFileAsDataUrl(10677), attachmentUploadConcurrency(10711), uploadAttachmentEntry(10736), hasAppsScriptUploadBackend(10824), hasWebAppUploadBackend(10829), uploadBackendUnavailableMessage(10833), canUseDriveDirectUpload(10846), waitForGoogleIdentity(10852), ensureDriveDirectToken(10868), driveApiEscapeQuery(10899), driveApiFetch(10903), findDriveFolderByName(10916), createDriveFolder(10929), ensureDriveFolder(10939), ensureDriveDirectTargetFolder(10943), prepareAttachmentFolder(10960), prepareAttachmentFolderViaGs(10971), uploadAttachmentSmart(10983), uploadAttachmentViaDriveApi(11004), driveApiMultipartUpload(11029), driveApiResumableUpload(11052), driveApiShareAnyone(11087), uploadAttachmentViaGs(11099), callAppsScriptWebApp(11115), uploadAttachmentViaWebApp(11133), deleteAttachmentFile(11146)

### toolbar (30)
startFormatPainter(4637), applyFormatPainter(4680), exitFormatPainter(4731), setUndoRedoButtonState(5620), updateSheetUndoRedoButtons(5626), updateReportUndoRedoButtons(5631), pushBoundedHistory(5636), cloneForHistory(5641), cloneSheetCellsForHistory(5645), createSheetUndoSnapshot(5657), restoreSheetUndoSnapshot(5668), pushSheetSnapshotUndo(5678), pushSheetUndo(5691), pushReportUndo(5701), applySheetHistory(5708), undoSheetEdit(5741), redoSheetEdit(5749), applyReportCellHistory(5757), undoReportEdit(5766), redoReportEdit(5774), updateToolButtonStates(6096), updateSheetColumnsBtn(6103), updateTextFormatButtonStates(6296), closeAllToolPopovers(8543), renderColorSwatchPicker(8549), toggleToolPopover(8556), openAttachmentPanelFromToolbar(11500), toggleAttachPanel(11518), closeAttachPanel(11522), switchAttachTab(11526)

### grid (168)
columnName(4205), cellRef(4216), formatAutoNumberValue(4261), checkboxDisplayIcon(4267), createEmptySheetCells(4400), ensureSheetCells(4410), ensureSheetAttachments(4432), ensureSheetSettings(4439), ensureSheetSelectedRows(4447), ensureSheetColumnConfigs(4458), applySavedRowMeta(4463), touchRowModified(4478), setSheetCellValue(4486), renderSystemColumnValue(4495), prepareNewSheetRow(4505), columnTypeIcon(4527), parseContactValue(4549), serializeContacts(4566), ensureCellStyles(4573), getCellStyle(4577), forEachSelectedCell(4581), setCellStyleEntry(4594), toggleCellStyleFlag(4601), setCellStyleValue(4617), clearSelectionFormatting(4627), serializeSheetAttachments(4739), getAttachmentOpenHref(4790), getAttachmentPreviewHref(4808), closeAttachmentPreview(4815), handleAttachmentPreviewKeydown(4820), openAttachmentPreview(4824), wireColumnResize(4963), onMove[nested@4986], onUp[nested@4991], getActiveSheet(5003), getAttachmentSheet(5009), getAttachmentProjectName(5016), getAttachmentPanelDefaultHost(5023), moveAttachmentPanelToHost(5027), exportSheetToExcel(5074), rowAttachmentTitle(5380), cycleRowStatus(5388), getActiveColIndex(5397), getActiveRowIndex(5402), getRowLevel(5413), rowHasChildren(5417), getDescendantEndIndex(5424), computeHierarchyHiddenRows(5434), indentRow(5451), outdentRow(5468), toggleRowCollapse(5481), getPickableColumns(5491), applySorts(5838), addSortLevel(5859), toggleSortDir(5868), removeSortLevel(5877), clearSorts(5883), sortByColumnClick(5889), promptSaveFilter(5932), promptLoadFilter(5941), addFilterLevel(5962), updateFilterValue(5970), removeFilterLevel(5977), clearFilters(5983), rowMatchesSearchAndFilter(5989), ruleMatches(6010), matchSingleFormatCondition(6019), getCellRuleColor(6044), addFormatRule(6056), removeFormatRule(6064), toggleFormatRule(6071), moveFormatRule(6080), clearFormatRules(6090), syncAttachmentCell(6109), renderAttachmentPanel(6118), openAttachmentPanel(6189), openAttachmentPickerForRow(6219), closeAttachmentPanel(6225), updateActiveCellGuides(6238), selectSheetColumnRange(6249), setActiveSheetCell(6268), restoreActiveSheetCell(6288), moveActiveSheetCell(6305), getColumnConfig(6313), isEditableSheetCell(6330), placeCursorAtEnd(6341), startEditingCell(6351), commitEditingCell(6365), cancelEditingCell(6384), expandAncestorsForRow(6397), renderGridSheet(6408), resetSheetViewportPosition(6791), renderSheetColumnsPopover(7723), openSheetNameModal(8017), closeSheetNameModal(8028), createGridSheet(8034), openImportModal(8262), closeImportModal(8275), closeSheetMoreMenu(8534), toggleSheetMoreMenu(8538), renderColumnPickerList(8582), renderSortPopover(8593), renderFilterPopover(8618), renderFormatPopover(8643), renderFormatPickerColumnStep(8683), renderFormatPickerRuleStep(8700), updateFormatValueInputs[nested@8734], getSheetColumnsForBuilder(8773), openColumnTypePicker(8783), renderExtraConfig[nested@8804], updateAutoNumberPreview[nested@8851], parseKnownContacts[nested@8887], commitColumnTypeChange[nested@8895], shiftIndexedObjectKeys(8963), shiftCellStyleKeys(8975), shiftColumnList(8989), shiftColumnRules(8999), shiftSheetColumnReferences(9012), shiftColumnReferencesAfterInsert(9029), shiftColumnReferencesAfterDelete(9033), insertSheetColumn(9037), deleteSheetColumn(9051), saveSheetColumnConfigValue(9070), renameSheetColumnInline(9085), openSheetColumnDescriptionDialog(9114), persistSheetColumnVisibility(9157), hideSheetColumn(9164), unhideSheetColumn(9174), unhideAllSheetColumns(9183), getHiddenSheetColumnsForMenu(9192), lockSheetColumn(9202), freezeSheetColumn(9213), openColumnFilterFromMenu(9223), openColumnSortFromMenu(9232), closeSheetColumnMenu(9241), showColumnTodo(9245), openSheetColumnMenu(9249), openSheetCellContextMenu(9327), showContactPicker(9344), render[nested@9373], toggleSheetWrap(9481), setSheetRowHeight(9490), clearActiveSheetData(9511), updateBulkEditBtn(9636), updateRangeHighlight(10023), getSelectedRange(10047), getActiveSheetCellPosition(10058), selectedRangeToTsv(10064), writeClipboardText(10075), readClipboardText(10081), clearSelectedSheetCells(10092), copySelectionToClipboard(10141), pasteClipboardToSelection(10160), showDropdownPicker(10255), closeDropdownPicker(10281), showDatePicker(10290), showDurationPicker(10325), toggleCheckboxCell(10355), showSymbolsPicker(10370), showMultiSelectPicker(10413), addAttachmentFiles(10787), renderAttachPanel(11531), addAttachmentFilesLegacy(11542), showAttachMenu(11631), viewAttachment(11641), downloadAttachment(11645), copyAttachLink(11654), deleteAttachFile(11660)

### report (34)
refreshReportAttachmentBadge(5032), ensureReportConfig(5510), getReportHeaderSheet(5525), getReportColumns(5529), getAllReportSourceCandidates(5537), isReportSourceSelected(5553), isBlankReportSourceRow(5557), buildReportRows(5566), updateReportSourceCell(5782), groupReportRows(5794), computeSummary(5809), normalizeReportLabel(5821), getCompactReportColWidth(5825), getActiveReport(7068), openReport(7265), renderReportView(7297), activateReportAttachmentRow(7398), clearReportRangeSelection(7406), getReportCellPosition(7415), updateReportRangeHighlight(7424), clearSelectedReportCells(7451), wireReportGridInteractions(7482), updateReportToolButtonStates(7558), closeAllReportPopovers(7587), positionReportPopover(7597), openReportSourceChooser(7610), toggleReportPopover(7620), renderReportSourcePopover(7639), renderReportColumnsPopover(7702), addReportFilterLevel(7750), renderReportFilterPopover(7758), renderReportGroupPopover(7790), renderReportSummarizePopover(7816), renderReportSortPopover(7850), setReportRowHeight(9498)

### dashboard (18)
hideDashboardView(7073), openDashboard(7080), ensureDashboardConfig(7108), renderDashboard(7117), renderDashTitle(7144), renderDashMetric(7153), computeAggregate(7168), renderDashShortcut(7189), renderDashReport(7210), renderDashReportTable(7222), renderDashChartPlaceholder(7257), getDashboardItem(9773), closeDashboardDialog(9778), showAddWidgetDialog(9779), saveDashboardConfig(9787), showWidgetConfigDialog(9788), buildDefaultWidgetConfig(9795), createDefaultDashboardConfig(11262)

### repost (4)
repostActiveSheetDates(9527), classifyCarryForwardColumn(9562), applyCarryForward(9569), openCarryForwardDialog(9588)

### workspace-navigator (77)
clampProjectColumnWidth(3089), setProjectColumnWidth(3100), toggleFav(3156), workspaceNavigatorItems(3177), getVisibleWorkspaceNavigatorColumns(3213), renderWorkspaceNavigator(3217), refreshWorkspaceFolderTreeIfVisible(3238), getWorkspaceBrowseFocusContext(3243), getWorkspaceBrowseProjectIndex(3247), renderWorkspaceBrowseProjectRows(3254), renderWorkspaceFolderTree(3275), renderWorkspaceBrowsePage(3299), showWorkspaceBrowsePage(3304), hideWorkspaceBrowsePage(3313), openWorkspaceNavigator(3320), closeWorkspaceNavigator(3325), closeWorkspaceNavigatorColumnMenu(3329), openWorkspaceNavigatorColumnMenu(3333), openWorkspaceNavigatorItem(3381), createProjectFromButton(3457), updateActiveProjectRows(3495), resizeProjectColumn(3503), finishColumnResize(3509), favoriteMatches(3543), renderFavorites(3548), openFavorites(3585), closeFavorites(3592), getActionProjectIndex(4038), prepareProjectActionMenu(4044), showProjectActionMenu(4056), closeLayoutMenu(4094), showWorkspaceLayoutMenuAt(4098), workspaceItemIconType(4113), workspaceItemVisualType(4120), isWorkspaceFolderLike(4132), workspaceItemIconHtml(4178), workspaceItemIcon(4185), setActiveSheetIcon(4189), cloneWorkspaceItem(4866), getActiveProjectName(5209), getActiveArchiveFolderName(5215), isWorkFile(6606), applyRailCollapsed(6613), currentNavState(6630), sameNavState(6640), pushNavState(6644), setRailActive(6655), updateProjectListHeader(6662), openRailProjectList(6676), initRailSectionNavigation(6713), goHomeToProjectList(6732), restoreNavState(6749), navBack(6759), navForward(6764), updateNavButtons(6769), showFolderListView(6777), closeWorkspaceItemMenu(6803), getWorkspaceItemLabel(6808), duplicateWorkspaceItem(6812), renameWorkspaceItem(6827), getWorkspaceOpenTitle(6843), refreshActiveWorkspaceTitle(6849), renameActiveTitle(6868), deleteWorkspaceItem(6885), exportWorkspaceItem(6899), showWorkspaceItemProperties(6910), handleWorkspaceItemMenuAction(6917), openWorkspaceItemMenu(6936), openWorkspaceItemMenuFromRow(6992), openSheet(7001), buildWorkspaceItem(7883), focusCreatedWorkspaceItem(7905), createWorkspaceItem(7924), handleProjectAction(8048), normalizeProjectFolderSet(11290), normalizeAllProjectFolders(11318), renderFolderRows(11388), toggleFolderFav(11453), openDetail(11460)

### main — [?] chưa rõ nhóm (23)
render[?](3106), closeContextMenu[?](4089), notifyAction[?](4109), getItemIconSVG[?](4139), upgradeLegacyTypeIcons[?](4195), ensureAppUserName[?](4228), changeAppUserName[?](4237), formatDateTimeVN[?](4245), formatDurationMinutes[?](4252), formatFileSize[?](4777), escapeHtml[?](4903), isStatusPill[?](7247), statusPillHtml[?](7249), escHtml[?](7262), escapeHtml[?](8429) *(trùng tên với hàm ở 4903 — cần rà lại khi thi công, khả năng là 2 định nghĩa riêng biệt cùng tên trong cùng scope global, có thể gây lỗi ghi đè)*, showV19Modal[?](8754), openFormsModal[?](9412), openPublishModal[?](9437), openAutomationModal[?](9459), withTimeout[?](10715), runLimitedConcurrency[?](10725), initials[?](11351), getFileIcon[?](11535)

**Tổng theo grep (`function` keyword): 442.** Tổng cộng dồn theo bảng trên: 438 (lệch 4, do một vài hàm biên giới khó phân loại tuyệt đối bằng tên — cần soát lại thủ công lúc thi công tách module, không ảnh hưởng tới việc đọc/tham chiếu code).

**Lưu ý:** ngoài 442 hàm `function name(){}` trên, còn nhiều closures đặt tên cục bộ dạng `const name = (...) => {}` lồng trong các hàm cha (ví dụ: `close`, `commit`, `openProjectBlankCreateMenu`@4080, `openBlankWorkspaceMenu`@11432, `renderDataRow`@7341, `renderSummaryRow`@7358...). Các closures này KHÔNG tách riêng — theo luật SPEC "CHỈ CẮT-DÁN nguyên khối", chúng đi theo hàm cha chứa chúng.

## 3. Biến state toàn cục (const/let/var top-level trong khối `<script>`)

Tổng số khai báo top-level: **289** (đếm bằng grep `^(let|const|var) `). Phần lớn (~220) là tham chiếu DOM (`document.getElementById(...)`, `document.querySelector(...)`) — các biến này đi kèm module UI tương ứng theo tiền tố ID (`rpt*` → report, `ss*`/`sheet*` → grid, `dash*` → dashboard, `workspaceNav*`/`rail*` → workspace-navigator, `attach*` → grid/toolbar, `import*` → grid).

**Biến state/dữ liệu/cấu hình chính (không phải DOM ref):**

| Dòng | Biến | Ghi chú |
|---|---|---|
| 3075 | `DATA` | mảng project mẫu — state |
| 3174 | `workspaceNavigatorSection` | state |
| 3175 | `workspaceNavigatorHiddenCols` | state |
| 3501 | `isColumnResizing` | state |
| 3720 | `openReportPopover` | state |
| 3740–3756 | `ctxProjectIndex`, `pendingGridProjectIndex`, `activeSheetContext`, `workspaceBrowseFocusContext`, `activeAttachmentRow`, `activeAttachmentSource`, `editingCell`, `isSelectingRange`, `selRangeAnchor`, `selRangeEnd`, `isSelectingReportRange`, `reportRangeAnchor`, `reportRangeEnd`, `sheetColumnSelectAnchor`, `sheetColumnSelection`, `formatPainterSource`, `formatPainterLocked` | state (grid/report editing) |
| 3765 | `SHEET_FACTORY_WEB_APP_URL` | api — endpoint Apps Script |
| 3770 | `DRIVE_DIRECT_CLIENT_ID_KEY` | storage — key localStorage |
| 3771 | `DRIVE_DIRECT_CLIENT_ID` | api — OAuth client id |
| 3772 | `DRIVE_DIRECT_ROOT_FOLDER` | api |
| 3773 | `DRIVE_DIRECT_SCOPE` | api |
| 3774 | `DRIVE_DIRECT_RESUMABLE_THRESHOLD` | api |
| 3775–3777 | `driveDirectTokenClient`, `driveDirectAccessToken`, `driveDirectTokenExpiresAt` | api — state token |
| 3837 | `PROJECT_LOCAL_SAVE_KEY` | storage — key localStorage |
| 4036 | `GOOGLE_SHEET_TEMPLATE_ID` | api |
| 4220 | `STATUS_CYCLE` | grid — config |
| 4221 | `STATUS_HEX` | grid — config |
| 4223 | `driveProjectFileMap` | api/storage state |
| 4225 | `APP_USER_NAME_KEY` | storage — key localStorage |
| 4226 | `appUserName` | state |
| 4271 | `PROJECT_CONTACTS` | grid — dữ liệu mẫu |
| 4279 | `Formatters` | grid — config |
| 4350 | `SHEET_COLUMN_CONFIG` | grid — config |
| 4368 | `SHEET_HEADER_TEMPLATE` | grid — config |
| 4915 | `COL_WIDTH_STORAGE_KEY` | storage — key localStorage |
| 5222 | `pendingSheetDataSaveTimers` | api state |
| 5279 | `pendingCellSaveTimers` | api state |
| 5411 | `ROW_HIERARCHY_COL` | grid config |
| 5615–5618 | `sheetUndoStack`, `sheetRedoStack`, `reportUndoStack`, `reportRedoStack` | toolbar state |
| 5807 | `SUMMARY_FN_LABEL` | report config |
| 6003–6004 | `FORMAT_RULE_COLORS`, `FORMAT_RULE_OPS` | grid config |
| 6612 | `RAIL_COLLAPSED_STORAGE_KEY` | storage — key localStorage |
| 6626–6628 | `navHistory`, `navIndex`, `isRestoringNavState` | workspace-navigator state |
| 6801 | `workspaceItemMenuTarget` | workspace-navigator state |
| 8258–8260 | `parsedCsvRows`, `parsedCsvHeaders`, `skipFirstRow` | grid state (import) |
| 8528–8529 | `TEXT_COLOR_SWATCHES`, `FILL_COLOR_SWATCHES` | toolbar config |
| 8531–8532 | `openToolPopover`, `formatDraft` | toolbar state |
| 9680 | `fpDblClickTimer` | grid state |
| 10057 | `sheetClipboard` | grid state |
| 10254 | `activeDropdown` | grid state |
| 10576 | `ARROW_STEP` | grid config |
| 10686 | `LOCAL_FILE_HELPER_URL` | storage — endpoint local helper `http://127.0.0.1:8780` |
| 10687 | `ATTACHMENT_LARGE_FILE_MODE` | storage config |
| 11249 | `PROJECT_ARCHIVE_GROUPS` | state — dữ liệu mẫu |
| 11257 | `PROJECT_DEFAULT_ITEMS` | state — dữ liệu mẫu |
| 11276 | `FOLDER_TEMPLATES` | state — dữ liệu mẫu |
| 11330 | `PROJECT_FOLDERS` | state |
| 11342 | `activeProjectIndex` | state |
| 11344 | `SHARE_PEOPLE` | state — dữ liệu mẫu |
| 11495–11498 | `currentAttachTab`, `currentAttachDropdownFile`, `currentAttachFileUrl`, `currentAttachFileId` | grid state |

## 4. Key localStorage

| Key | Biến hằng | Dùng ở |
|---|---|---|
| `projectColumnWidth` | (literal, không có const riêng) | workspace-navigator (độ rộng cột project list) |
| `qlda_drive_api_client_id` | `DRIVE_DIRECT_CLIENT_ID_KEY` | api (OAuth client id) |
| `qlda_project_local_backup_v1` | `PROJECT_LOCAL_SAVE_KEY` | storage (backup toàn bộ project) |
| `appUserName` | `APP_USER_NAME_KEY` | storage (tên người dùng) |
| `qlda_colWidths_v1` | `COL_WIDTH_STORAGE_KEY` | storage (độ rộng cột sheet) |
| `qlda_railCollapsed` | `RAIL_COLLAPSED_STORAGE_KEY` | storage (trạng thái thu gọn rail) |
| `projectTemplates` | (literal) | grid (mẫu project khi tạo mới) |

## 5. Endpoint Google API / Apps Script

| Endpoint | Loại | Dùng ở |
|---|---|---|
| `https://script.google.com/macros/s/AKfycbwVf0ft1nCwezmG10Fy2j8bqeVyVlpJjAf__FtLvKcMXcH2KNPGvjYtt94-oP-u5ffk/exec` | Apps Script Web App (SHEET_FACTORY_WEB_APP_URL) | api — tạo/đọc/ghi sheet qua Apps Script |
| `https://www.googleapis.com/auth/drive` | OAuth scope | api — xin quyền Drive |
| `https://www.googleapis.com/drive/v3/files?q=...` | Drive API v3 — tìm file/folder | api |
| `https://www.googleapis.com/drive/v3/files?fields=...` | Drive API v3 — tạo folder | api |
| `https://www.googleapis.com/drive/v3/files/{id}?fields=...` | Drive API v3 — lấy metadata file | api |
| `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart` | Drive API v3 — upload multipart | api |
| `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable` | Drive API v3 — upload resumable | api |
| `https://www.googleapis.com/drive/v3/files/{fileId}/permissions` | Drive API v3 — chia sẻ file | api |
| `http://127.0.0.1:8780` | Local file helper (LOCAL_FILE_HELPER_URL) | storage — lưu file lớn qua Google Drive for Desktop cục bộ, tránh OAuth/Apps Script |

## 6. Việc còn thiếu / cần làm tiếp trước khi thi công SPEC modular-split-v26

1. Rà lại 4 hàm chênh lệch giữa tổng grep (442) và tổng liệt kê theo nhóm (438) — soát thủ công khi thi công thay vì tin tuyệt đối vào phân loại theo tên.
2. Rà lại 23 hàm nhóm `main [?]` — đặc biệt `escapeHtml` bị định nghĩa 2 lần (dòng 4903 và 8429, cùng scope global) cần xác minh có phải trùng lặp/ghi đè hay đang ở 2 nhánh code không giao nhau.
