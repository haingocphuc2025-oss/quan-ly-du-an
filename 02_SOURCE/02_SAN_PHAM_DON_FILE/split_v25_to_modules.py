#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
split_v25_to_modules.py
Tach STAGING/giao-dien-desktop-don-gian_v25_quan.html thanh MODULES_V26/
theo 01_SPEC/NEW/modular-split-v26/SPEC.md va 04_REPORTS/CODE_MAP_V25.md.

CACH CHAY:
  cd vao thu muc chua file nay (02_SOURCE/02_SAN_PHAM_DON_FILE/), roi:
    python split_v25_to_modules.py

OUTPUT: MODULES_V26/{index.html, css/main.css, js/*.js, build.py, manifest.json}
        + in ra bao cao: so ham/statement moi module, canh bao neu co block khong
        xac dinh duoc module ro rang (se roi vao main.js, danh dau [?] trong log).

TU KIEM TRA (quan trong): script se doc lai toan bo cac file module vua ghi,
noi lai theo dung manifest.json, roi so sanh voi noi dung script goc (JS block)
bang cach gom TAP HOP cac statement top-level (khong quan tam thu tu) — neu
KHONG khop (thieu/du/sai noi dung) script se dung lai va in ra cho biet cho nao
sai, KHONG ghi file loi.
"""
import re, os, sys, json, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "STAGING", "giao-dien-desktop-don-gian_v25_quan.html")
OUT = os.path.join(ROOT, "MODULES_V26")

MODULE_ORDER = ["state", "storage", "api", "toolbar", "grid", "report",
                "dashboard", "repost", "workspace-navigator", "main"]

# ============================================================
# 1) Ban do ten ham -> module (tu CODE_MAP_V25.md, chi can ham
#    top-level; ham long ben trong ham khac se tu di theo ham cha).
# ============================================================
FUNC_MODULE = {}
def add(module, names):
    for n in names:
        FUNC_MODULE[n] = module

add("state", ["sampleRowsForArchiveSheet", "buildDemoSheetCells"])

add("storage", ["loadFromDrive","saveToDrive","cloneJsonForProjectSave","syncVisibleSheetDomToData",
"buildProjectSaveSnapshot","saveProjectLocalBackup","loadProjectLocalBackup","applyProjectSnapshot",
"saveProjectDiskBackup","loadProjectDiskBackup","persistToDrive","flushCurrentUiEditsBeforeSave",
"saveProjectNow","saveCurrentProjectStateSilently","saveProjectBeforeUnload","showSaveStatus",
"saveProjectData","loadProjectData","loadColWidths","sanitizeColWidths","saveColWidthsStore",
"getStoredColWidth","saveColWidth","collectProjectUiState","applyProjectUiState","getSavedFilters",
"saveCurrentFilter","loadSavedFilter","saveAttachmentToLocalHelper"])

add("api", ["initAuth","getAttachmentDriveId","extractDriveIdFromUrl","normalizeGoogleSheetUrl",
"googleSheetFrameUrl","renderGoogleSheetHost","linkExistingGoogleSheet","setGoogleSheetCreating",
"applyCreatedGoogleSheet","createGoogleSheetPayload","callSheetFactory_","createProjectSheetViaWebApp",
"fetchSheetDataViaWebApp","saveCellViaWebApp","callSheetFactoryPost_","uploadFileToDriveViaWebApp",
"deleteFileFromDriveViaWebApp","scheduleSheetDataSave","buildSheetSavePayload","saveSheetDataToWebApp",
"loadSheetDataFromWebApp","scheduleCellSave","reloadRealSheetData","createRealGoogleSheetForActiveItem",
"requestDriveSignIn","readFileAsDataUrl","attachmentUploadConcurrency","uploadAttachmentEntry",
"hasAppsScriptUploadBackend","hasWebAppUploadBackend","uploadBackendUnavailableMessage",
"canUseDriveDirectUpload","waitForGoogleIdentity","ensureDriveDirectToken","driveApiEscapeQuery",
"driveApiFetch","findDriveFolderByName","createDriveFolder","ensureDriveFolder",
"ensureDriveDirectTargetFolder","prepareAttachmentFolder","prepareAttachmentFolderViaGs",
"uploadAttachmentSmart","uploadAttachmentViaDriveApi","driveApiMultipartUpload",
"driveApiResumableUpload","driveApiShareAnyone","uploadAttachmentViaGs","callAppsScriptWebApp",
"uploadAttachmentViaWebApp","deleteAttachmentFile"])

add("toolbar", ["startFormatPainter","applyFormatPainter","exitFormatPainter","setUndoRedoButtonState",
"updateSheetUndoRedoButtons","updateReportUndoRedoButtons","pushBoundedHistory","cloneForHistory",
"cloneSheetCellsForHistory","createSheetUndoSnapshot","restoreSheetUndoSnapshot","pushSheetSnapshotUndo",
"pushSheetUndo","pushReportUndo","applySheetHistory","undoSheetEdit","redoSheetEdit",
"applyReportCellHistory","undoReportEdit","redoReportEdit","updateToolButtonStates",
"updateSheetColumnsBtn","updateTextFormatButtonStates","closeAllToolPopovers","renderColorSwatchPicker",
"toggleToolPopover","openAttachmentPanelFromToolbar","toggleAttachPanel","closeAttachPanel","switchAttachTab"])

add("grid", ["columnName","cellRef","formatAutoNumberValue","checkboxDisplayIcon","createEmptySheetCells",
"ensureSheetCells","ensureSheetAttachments","ensureSheetSettings","ensureSheetSelectedRows",
"ensureSheetColumnConfigs","applySavedRowMeta","touchRowModified","setSheetCellValue",
"renderSystemColumnValue","prepareNewSheetRow","columnTypeIcon","parseContactValue","serializeContacts",
"ensureCellStyles","getCellStyle","forEachSelectedCell","setCellStyleEntry","toggleCellStyleFlag",
"setCellStyleValue","clearSelectionFormatting","serializeSheetAttachments","getAttachmentOpenHref",
"getAttachmentPreviewHref","closeAttachmentPreview","handleAttachmentPreviewKeydown",
"openAttachmentPreview","wireColumnResize","getActiveSheet","getAttachmentSheet",
"getAttachmentProjectName","getAttachmentPanelDefaultHost","moveAttachmentPanelToHost",
"exportSheetToExcel","rowAttachmentTitle","cycleRowStatus","getActiveColIndex","getActiveRowIndex",
"getRowLevel","rowHasChildren","getDescendantEndIndex","computeHierarchyHiddenRows","indentRow",
"outdentRow","toggleRowCollapse","getPickableColumns","applySorts","addSortLevel","toggleSortDir",
"removeSortLevel","clearSorts","sortByColumnClick","promptSaveFilter","promptLoadFilter",
"addFilterLevel","updateFilterValue","removeFilterLevel","clearFilters","rowMatchesSearchAndFilter",
"ruleMatches","matchSingleFormatCondition","getCellRuleColor","addFormatRule","removeFormatRule",
"toggleFormatRule","moveFormatRule","clearFormatRules","syncAttachmentCell","renderAttachmentPanel",
"openAttachmentPanel","openAttachmentPickerForRow","closeAttachmentPanel","updateActiveCellGuides",
"selectSheetColumnRange","setActiveSheetCell","restoreActiveSheetCell","moveActiveSheetCell",
"getColumnConfig","isEditableSheetCell","placeCursorAtEnd","startEditingCell","commitEditingCell",
"cancelEditingCell","expandAncestorsForRow","renderGridSheet","resetSheetViewportPosition",
"renderSheetColumnsPopover","openSheetNameModal","closeSheetNameModal","createGridSheet",
"openImportModal","closeImportModal","closeSheetMoreMenu","toggleSheetMoreMenu",
"renderColumnPickerList","renderSortPopover","renderFilterPopover","renderFormatPopover",
"renderFormatPickerColumnStep","renderFormatPickerRuleStep","getSheetColumnsForBuilder",
"openColumnTypePicker","shiftIndexedObjectKeys","shiftCellStyleKeys","shiftColumnList",
"shiftColumnRules","shiftSheetColumnReferences","shiftColumnReferencesAfterInsert",
"shiftColumnReferencesAfterDelete","insertSheetColumn","deleteSheetColumn",
"saveSheetColumnConfigValue","renameSheetColumnInline","openSheetColumnDescriptionDialog",
"persistSheetColumnVisibility","hideSheetColumn","unhideSheetColumn","unhideAllSheetColumns",
"getHiddenSheetColumnsForMenu","lockSheetColumn","freezeSheetColumn","openColumnFilterFromMenu",
"openColumnSortFromMenu","closeSheetColumnMenu","showColumnTodo","openSheetColumnMenu",
"openSheetCellContextMenu","showContactPicker","toggleSheetWrap","setSheetRowHeight",
"clearActiveSheetData","updateBulkEditBtn","updateRangeHighlight","getSelectedRange",
"getActiveSheetCellPosition","selectedRangeToTsv","writeClipboardText","readClipboardText",
"clearSelectedSheetCells","copySelectionToClipboard","pasteClipboardToSelection",
"showDropdownPicker","closeDropdownPicker","showDatePicker","showDurationPicker",
"toggleCheckboxCell","showSymbolsPicker","showMultiSelectPicker","addAttachmentFiles",
"renderAttachPanel","addAttachmentFilesLegacy","showAttachMenu","viewAttachment",
"downloadAttachment","copyAttachLink","deleteAttachFile"])

add("report", ["refreshReportAttachmentBadge","ensureReportConfig","getReportHeaderSheet",
"getReportColumns","getAllReportSourceCandidates","isReportSourceSelected","isBlankReportSourceRow",
"buildReportRows","updateReportSourceCell","groupReportRows","computeSummary","normalizeReportLabel",
"getCompactReportColWidth","getActiveReport","openReport","renderReportView",
"activateReportAttachmentRow","clearReportRangeSelection","getReportCellPosition",
"updateReportRangeHighlight","clearSelectedReportCells","wireReportGridInteractions",
"updateReportToolButtonStates","closeAllReportPopovers","positionReportPopover",
"openReportSourceChooser","toggleReportPopover","renderReportSourcePopover",
"renderReportColumnsPopover","addReportFilterLevel","renderReportFilterPopover",
"renderReportGroupPopover","renderReportSummarizePopover","renderReportSortPopover","setReportRowHeight"])

add("dashboard", ["hideDashboardView","openDashboard","ensureDashboardConfig","renderDashboard",
"renderDashTitle","renderDashMetric","computeAggregate","renderDashShortcut","renderDashReport",
"renderDashReportTable","renderDashChartPlaceholder","getDashboardItem","closeDashboardDialog",
"showAddWidgetDialog","saveDashboardConfig","showWidgetConfigDialog","buildDefaultWidgetConfig",
"createDefaultDashboardConfig"])

add("repost", ["repostActiveSheetDates","classifyCarryForwardColumn","applyCarryForward","openCarryForwardDialog"])

add("workspace-navigator", ["clampProjectColumnWidth","setProjectColumnWidth","toggleFav",
"workspaceNavigatorItems","getVisibleWorkspaceNavigatorColumns","renderWorkspaceNavigator",
"refreshWorkspaceFolderTreeIfVisible","getWorkspaceBrowseFocusContext","getWorkspaceBrowseProjectIndex",
"renderWorkspaceBrowseProjectRows","renderWorkspaceFolderTree","renderWorkspaceBrowsePage",
"showWorkspaceBrowsePage","hideWorkspaceBrowsePage","openWorkspaceNavigator","closeWorkspaceNavigator",
"closeWorkspaceNavigatorColumnMenu","openWorkspaceNavigatorColumnMenu","openWorkspaceNavigatorItem",
"createProjectFromButton","updateActiveProjectRows","resizeProjectColumn","finishColumnResize",
"favoriteMatches","renderFavorites","openFavorites","closeFavorites","getActionProjectIndex",
"prepareProjectActionMenu","showProjectActionMenu","closeLayoutMenu","showWorkspaceLayoutMenuAt",
"workspaceItemIconType","workspaceItemVisualType","isWorkspaceFolderLike","workspaceItemIconHtml",
"workspaceItemIcon","setActiveSheetIcon","cloneWorkspaceItem","getActiveProjectName",
"getActiveArchiveFolderName","isWorkFile","applyRailCollapsed","currentNavState","sameNavState",
"pushNavState","setRailActive","updateProjectListHeader","openRailProjectList",
"initRailSectionNavigation","goHomeToProjectList","restoreNavState","navBack","navForward",
"updateNavButtons","showFolderListView","closeWorkspaceItemMenu","getWorkspaceItemLabel",
"duplicateWorkspaceItem","renameWorkspaceItem","getWorkspaceOpenTitle","refreshActiveWorkspaceTitle",
"renameActiveTitle","deleteWorkspaceItem","exportWorkspaceItem","showWorkspaceItemProperties",
"handleWorkspaceItemMenuAction","openWorkspaceItemMenu","openWorkspaceItemMenuFromRow","openSheet",
"buildWorkspaceItem","focusCreatedWorkspaceItem","createWorkspaceItem","handleProjectAction",
"normalizeProjectFolderSet","normalizeAllProjectFolders","renderFolderRows","toggleFolderFav","openDetail"])

add("main", ["render","closeContextMenu","notifyAction","getItemIconSVG","upgradeLegacyTypeIcons",
"ensureAppUserName","changeAppUserName","formatDateTimeVN","formatDurationMinutes","formatFileSize",
"escapeHtml","isStatusPill","statusPillHtml","escHtml","showV19Modal","openFormsModal",
"openPublishModal","openAutomationModal","withTimeout","runLimitedConcurrency","initials","getFileIcon"])

# ============================================================
# 2) Bien state -> module (tu CODE_MAP_V25.md muc 3)
# ============================================================
VAR_MODULE = {
 "DATA":"state","workspaceNavigatorSection":"workspace-navigator","workspaceNavigatorHiddenCols":"workspace-navigator",
 "isColumnResizing":"workspace-navigator","openReportPopover":"report",
 "ctxProjectIndex":"grid","pendingGridProjectIndex":"grid","activeSheetContext":"grid",
 "workspaceBrowseFocusContext":"workspace-navigator","activeAttachmentRow":"grid","activeAttachmentSource":"grid",
 "editingCell":"grid","isSelectingRange":"grid","selRangeAnchor":"grid","selRangeEnd":"grid",
 "isSelectingReportRange":"report","reportRangeAnchor":"report","reportRangeEnd":"report",
 "sheetColumnSelectAnchor":"grid","sheetColumnSelection":"grid","formatPainterSource":"toolbar",
 "formatPainterLocked":"toolbar","SHEET_FACTORY_WEB_APP_URL":"api","DRIVE_DIRECT_CLIENT_ID_KEY":"storage",
 "DRIVE_DIRECT_CLIENT_ID":"api","DRIVE_DIRECT_ROOT_FOLDER":"api","DRIVE_DIRECT_SCOPE":"api",
 "DRIVE_DIRECT_RESUMABLE_THRESHOLD":"api","driveDirectTokenClient":"api","driveDirectAccessToken":"api",
 "driveDirectTokenExpiresAt":"api","PROJECT_LOCAL_SAVE_KEY":"storage","GOOGLE_SHEET_TEMPLATE_ID":"api",
 "STATUS_CYCLE":"grid","STATUS_HEX":"grid","driveProjectFileMap":"api","APP_USER_NAME_KEY":"storage",
 "appUserName":"state","PROJECT_CONTACTS":"grid","Formatters":"grid","SHEET_COLUMN_CONFIG":"grid",
 "SHEET_HEADER_TEMPLATE":"grid","COL_WIDTH_STORAGE_KEY":"storage","pendingSheetDataSaveTimers":"api",
 "pendingCellSaveTimers":"api","ROW_HIERARCHY_COL":"grid","sheetUndoStack":"toolbar","sheetRedoStack":"toolbar",
 "reportUndoStack":"toolbar","reportRedoStack":"toolbar","SUMMARY_FN_LABEL":"report",
 "FORMAT_RULE_COLORS":"grid","FORMAT_RULE_OPS":"grid","RAIL_COLLAPSED_STORAGE_KEY":"storage",
 "navHistory":"workspace-navigator","navIndex":"workspace-navigator","isRestoringNavState":"workspace-navigator",
 "workspaceItemMenuTarget":"workspace-navigator","parsedCsvRows":"grid","parsedCsvHeaders":"grid",
 "skipFirstRow":"grid","TEXT_COLOR_SWATCHES":"toolbar","FILL_COLOR_SWATCHES":"toolbar",
 "openToolPopover":"toolbar","formatDraft":"toolbar","fpDblClickTimer":"grid","sheetClipboard":"grid",
 "activeDropdown":"grid","ARROW_STEP":"grid","LOCAL_FILE_HELPER_URL":"storage","ATTACHMENT_LARGE_FILE_MODE":"storage",
 "PROJECT_ARCHIVE_GROUPS":"state","PROJECT_DEFAULT_ITEMS":"state","FOLDER_TEMPLATES":"state",
 "PROJECT_FOLDERS":"state","activeProjectIndex":"state","SHARE_PEOPLE":"state",
 "currentAttachTab":"grid","currentAttachDropdownFile":"grid","currentAttachFileUrl":"grid","currentAttachFileId":"grid",
 "rows":"workspace-navigator","main":"workspace-navigator","columnResizer":"workspace-navigator",
 "savedProjectColumnWidth":"workspace-navigator",
}

PREFIX_RULES = [
 (re.compile(r'^rpt'), "report"),
 (re.compile(r'^dash', re.I), "dashboard"),
 (re.compile(r'^(workspaceNav|rail|nav)', re.I), "workspace-navigator"),
 (re.compile(r'^import'), "grid"),
 (re.compile(r'^attach', re.I), "grid"),
 (re.compile(r'^ss[A-Z]'), "grid"),
 (re.compile(r'^(sort|filter|format)(Popover|Chips|AddBtn|Picker|ClearBtn|SaveBtn|LoadBtn|EmptyLabel)', re.I), "grid"),
 (re.compile(r'^(sheet|grid)', re.I), "grid"),
 (re.compile(r'^(text|fill)Color', re.I), "toolbar"),
 (re.compile(r'^(favorite|ctx|table|topAction|topDelete|quickGrid|layoutMenu|appShell|railToggle|navBack|navForward|appUserName|detail)', re.I), "workspace-navigator"),
]

def classify_name(name):
    if name in VAR_MODULE:
        return VAR_MODULE[name]
    for pat, mod in PREFIX_RULES:
        if pat.search(name):
            return mod
    return None

IDENT_RE = re.compile(r'^(function\s+|async\s+function\s+)?([A-Za-z_$][\w$]*)')
DECL_RE = re.compile(r'^(?:let|const|var)\s+([A-Za-z_$][\w$]*)')
FUNC_RE = re.compile(r'^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(')

def find_top_level_statements(src):
    """Tra ve list (start, end) cho tung statement top-level (cot 0) trong src."""
    n = len(src)
    i = 0
    out = []
    stmt_start = None
    depth = 0
    while i < n:
        c = src[i]
        if src.startswith('//', i):
            j = src.find('\n', i)
            i = j if j != -1 else n
            continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2)
            i = (j + 2) if j != -1 else n
            continue
        if c in ('"', "'", '`'):
            quote = c
            j = i + 1
            while j < n:
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == quote:
                    j += 1
                    break
                j += 1
            i = j
            continue
        if depth == 0 and stmt_start is None and not c.isspace():
            stmt_start = i
        if c in '({[':
            depth += 1
        elif c in ')}]':
            depth -= 1
            if depth == 0 and stmt_start is not None:
                j = i + 1
                if j < n and src[j] == ';':
                    j += 1
                out.append((stmt_start, j))
                stmt_start = None
                i = j
                continue
        elif c == ';' and depth == 0 and stmt_start is not None:
            out.append((stmt_start, i + 1))
            stmt_start = None
        i += 1
    if stmt_start is not None:
        out.append((stmt_start, n))
    return out

def classify_statement(text, prev_module):
    m = FUNC_RE.match(text)
    if m:
        name = m.group(1)
        mod = FUNC_MODULE.get(name)
        return mod or "main", ("function", name, mod is not None)
    m = DECL_RE.match(text)
    if m:
        name = m.group(1)
        mod = classify_name(name)
        return mod or (prev_module or "main"), ("var", name, mod is not None)
    # cac statement khac (if/event-listener/IIFE...): giu nguyen theo module cua
    # statement lien ke truoc do (thuong la init code cho dung khu vuc do)
    return (prev_module or "main"), ("other", text[:40].replace("\n", " "), False)

def main():
    if not os.path.isfile(SRC):
        print("KHONG TIM THAY FILE NGUON:", SRC)
        sys.exit(1)
    with open(SRC, "r", encoding="utf-8") as f:
        html = f.read()

    style_start = html.index("<style>") + len("<style>")
    style_end = html.index("</style>", style_start)
    css = html[style_start:style_end]

    # script inline chinh: tag "<script>" (khong co thuoc tinh) SAU khoi style
    script_open = "\n<script>\n"
    js_tag_idx = html.index("<script>", style_end)
    js_start = js_tag_idx + len("<script>")
    js_end = html.rindex("</script>")
    js = html[js_start:js_end]

    stmt_json_path = os.path.join(ROOT, "statements.json")
    if not os.path.isfile(stmt_json_path):
        print("KHONG TIM THAY statements.json.")
        print("Chay truoc: npm install acorn && node find_statements.js")
        sys.exit(1)
    with open(stmt_json_path, "r", encoding="utf-8") as f:
        stmt_data = json.load(f)
    if stmt_data["jsStart"] != js_start or stmt_data["jsEnd"] != js_end:
        print("CANH BAO: bien JS block trong statements.json khac voi Python doc duoc — chay lai node find_statements.js.")
        sys.exit(1)
    stmts = [tuple(x) for x in stmt_data["statements"]]
    print(f"Tong so top-level statement (tu AST that, acorn): {len(stmts)}")

    buckets = {m: [] for m in MODULE_ORDER}
    unresolved = []
    prev_module = "state"
    func_count = 0
    for (s, e) in stmts:
        text = js[s:e]
        mod, info = classify_statement(text, prev_module)
        buckets[mod].append(text)
        prev_module = mod
        if info[0] == "function":
            func_count += 1
        if not info[2] and info[0] != "other":
            unresolved.append((info[0], info[1], mod))

    print(f"Tong so function statement: {func_count} (grep truoc do bao 442 ke ca ham long)")
    if unresolved:
        print(f"\nCANH BAO: {len(unresolved)} ten khong co trong danh sach xac dinh san, "
              f"da xep theo prefix-rule/fallback — RA SOAT LAI:")
        for kind, name, mod in unresolved[:60]:
            print(f"  [{kind}] {name} -> {mod}")

    os.makedirs(os.path.join(OUT, "css"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "js"), exist_ok=True)

    with open(os.path.join(OUT, "css", "main.css"), "w", encoding="utf-8") as f:
        f.write(css.strip("\n") + "\n")

    for mod in MODULE_ORDER:
        content = "\n\n".join(s.strip("\n") for s in buckets[mod])
        with open(os.path.join(OUT, "js", f"{mod}.js"), "w", encoding="utf-8") as f:
            f.write(content + "\n")
        print(f"  js/{mod}.js: {len(buckets[mod])} statement")

    # index.html: lay nguyen head/body cua ban goc, thay khoi <style> va <script> chinh
    # bang the nap file ngoai, giu nguyen 2 script src ben ngoai (gsi client, xlsx).
    head_before_style = html[:html.index("<style>")]
    between_style_and_script = html[style_end + len("</style>"):js_tag_idx]
    tail_after_js = html[js_end + len("</script>"):]

    css_link = '<link rel="stylesheet" href="css/main.css">\n'
    js_links = "\n".join(f'<script src="js/{m}.js"></script>' for m in MODULE_ORDER)

    index_html = (head_before_style + css_link
                  + between_style_and_script.replace("<script>", "", 1) if False else
                  head_before_style + css_link + between_style_and_script)
    # chen script tags truoc tail (thay cho script inline cu)
    index_html = index_html + "\n" + js_links + "\n" + tail_after_js

    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)

    manifest = {
        "css": ["css/main.css"],
        "js": [f"js/{m}.js" for m in MODULE_ORDER],
        "index": "index.html",
        "output": "giao-dien-desktop-don-gian_v26_quan.html",
    }
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    build_py = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build.py — ghep MODULES_V26 thanh 1 file HTML don (v26). Chay: python build.py"""
import json, os, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))

def main():
    with open(os.path.join(ROOT, "manifest.json"), "r", encoding="utf-8") as f:
        manifest = json.load(f)
    with open(os.path.join(ROOT, manifest["index"]), "r", encoding="utf-8") as f:
        index_html = f.read()
    css_parts = []
    for p in manifest["css"]:
        with open(os.path.join(ROOT, p), "r", encoding="utf-8") as f:
            css_parts.append(f.read())
    css = "\\n".join(css_parts)
    js_parts = []
    for p in manifest["js"]:
        with open(os.path.join(ROOT, p), "r", encoding="utf-8") as f:
            js_parts.append(f.read())
    js = "\\n\\n".join(js_parts)

    out = index_html.replace('<link rel="stylesheet" href="css/main.css">',
                              "<style>\\n" + css + "\\n</style>")
    for p in manifest["js"]:
        out = out.replace(f'<script src="{p}"></script>', "")
    # chen toan bo js truoc </body>
    out = out.replace("</body>", "<script>\\n" + js + "\\n</script>\\n</body>")

    out_path = os.path.join(ROOT, manifest["output"])
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    size = os.path.getsize(out_path)
    sha = hashlib.sha256(out.encode("utf-8")).hexdigest()
    print(f"Da ghep: {manifest[\\'output\\']}  ({size} bytes)  SHA-256: {sha}")

if __name__ == "__main__":
    main()
'''
    with open(os.path.join(OUT, "build.py"), "w", encoding="utf-8") as f:
        f.write(build_py)

    # ===== TU KIEM TRA: dung ngay du lieu trong bo nho (khong doc lai/parse lai file) =====
    print("\n--- TU KIEM TRA ---")
    orig_texts = sorted(js[s:e].strip() for (s, e) in stmts)
    all_bucket_texts = sorted(t.strip() for mod in MODULE_ORDER for t in buckets[mod])
    total_bucket_count = sum(len(buckets[m]) for m in MODULE_ORDER)
    if total_bucket_count != len(stmts):
        print(f"CANH BAO LECH SO LUONG: {len(stmts)} statement goc nhung {total_bucket_count} statement da xep vao bucket.")
    if orig_texts == all_bucket_texts:
        print(f"KHOP: toan bo {len(stmts)} statement (AST that tu acorn) da duoc phan phoi vao MODULES_V26 "
              f"GIONG HET ban goc — khong mat, khong nhan doi, khong sua noi dung.")
    else:
        missing = [x for x in orig_texts if x not in all_bucket_texts]
        extra = [x for x in all_bucket_texts if x not in orig_texts]
        print(f"CANH BAO LECH NOI DUNG: thieu {len(missing)}, du {len(extra)} so voi ban goc.")
        print("KHONG nen dung MODULES_V26 nay cho ban giao truoc khi sua loi tren.")
        if missing:
            print("  Vi du thieu:", missing[0][:80])
        if extra:
            print("  Vi du du:", extra[0][:80])

    print("\nXong. Kiem tra thu muc:", OUT)
    print("Buoc tiep theo: cd MODULES_V26 && python build.py, roi mo file .html ket qua tren")
    print("localhost hoac trinh duyet de kiem tra console/khong loi (AC1), roi doi chieu 4 view (AC2).")

if __name__ == "__main__":
    main()
