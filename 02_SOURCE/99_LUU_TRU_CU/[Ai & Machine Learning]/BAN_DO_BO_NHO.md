# 🗺️ BẢN ĐỒ BỘ NHỚ — giao-dien-desktop-don-gian_v23_quan.html

> Tạo: 10/07/2026 | Nguồn: Web QLDA (v23)
> Kích thước: 374 KB | 9,404 dòng

---

## 1. TỔNG QUAN KIẾN TRÚC

```
giao-dien-desktop-don-gian_v23_quan.html
├── CSS (L1–L2546)   ~2,546 dòng
│   ├── Biến CSS :root
│   ├── Sidebar (Rail) + Responsive mobile
│   ├── Bảng (Table) + Grid Sheet
│   ├── Toolbar + Excel 365 Toolbar
│   ├── Attachment Panel (v24)
│   ├── Context Menu, Popover, Modal
│   ├── Báo cáo (Report)
│   └── Responsive @media (max-width: 760px)
│
├── JS  (L2547–L9404) ~6,857 dòng
│   ├── Render & Navigation  (render, navBack/Forward)
│   ├── Sheet Engine         (Grid, Cells, Columns, Rows)
│   ├── File Management      (Drive API, Upload, Attachments)
│   ├── Report Engine        (Build, Group, Summarize)
│   ├── Formatting           (Bold/Italic/Fill/Format Painter)
│   ├── Filter & Sort        (Multi-level, Saved filters)
│   ├── Conditional Format   (Rules Engine)
│   ├── Data Persistence     (Save/Load Drive, Local)
│   └── Integration          (Google Sheets, Apps Script)
│
└── HTML DOM (194 IDs)
    ├── #appContainer        — Root app
    ├── #screen-list         — Project list view
    ├── #screen-detail       — Detail/sheet view
    ├── #gridSheetView       — Sheet grid container
    └── #rightToolbar        — v24 right toolbar
```

---

## 2. CSS COMPONENTS CHÍNH

| Component | Dòng | Mô tả |
|-----------|------|-------|
| `:root` | 11-23 | Biến màu (paper, ink, stamp, olive...) |
| `.rail` | 32-93 | Sidebar thu nhỏ kiểu Smartsheet |
| `.favorites-popover` | 95-123 | Popover danh sách yêu thích |
| `.main` / `#screen-list/detail` | 126-236 | Layout chính, responsive column |
| `.topbar` | 238-254 | Thanh tiêu đề + search |
| `.toolbar` | 276-280 | Thanh công cụ |
| `.table-wrap` / `table` | 283-332 | Bảng danh sách dự án |
| `.ctx-menu` | 335-363 | Menu chuột phải |
| `.grid-sheet-view` | 398-585 | View Google Sheet |
| `.grid-sheet-table` | 586-692 | Bảng grid sheet (spreadsheet) |
| `.smartsheet-toolbar` | 427-501 | Toolbar Excel 365 |
| `.attachment-panel` | 801-845, 878-1252 | Panel đính kèm (v24) |
| `.right-toolbar` | 847-875 | Toolbar phải (v24) |
| `.v19-modal` | 735-746 | Modal hệ thống |
| `.sheet-column-menu` | 1722-1760 | Menu cột |
| **Responsive** | 1296-1418 | Mobile @media 760px |
| **Viewport clamp** | 1469-1585 | Chống tràn viewport |

---

## 3. JS MODULES & FUNCTIONS CHÍNH (333 functions)

### A. Render & Navigation (22 functions)
```
render()               — Main render (project list)
renderGridSheet()      — Render grid spreadsheet
renderFolderRows()     — Render folder tree
renderFavorites()      — Render favorites popover
setRailActive()        — Sidebar active state
navBack/Forward()      — Navigation history
pushNavState()         — Push navigation state
restoreNavState()      — Restore from history
```

### B. Sheet Engine (40+ functions)
```
openSheet()            — Open a sheet
createGridSheet()      — Create new grid sheet
setActiveSheetCell()   — Set active cell
moveActiveSheetCell()  — Arrow key navigation
startEditingCell()     — Enter edit mode
commitEditingCell()    — Save cell edit
insert/deleteSheetColumn() — Column management
freezeSheetColumn()    — Freeze column
wireColumnResize()     — Column resize handler
selectSheetColumnRange() — Select entire column
```

### C. File Management & Drive (30+ functions)
```
loadFromDrive()        — Load project from Google Drive
saveToDrive()          — Save to Drive
saveProjectNow()       — Save current project
ensureDriveFolder()    — Create/ensure Drive folder
uploadAttachmentSmart() — Smart upload (Drive API or Apps Script)
uploadAttachmentViaDriveApi() — Direct Drive upload
uploadAttachmentViaWebApp()   — Apps Script upload
deleteAttachmentFile() — Delete from Drive
driveApiFetch()        — Drive REST API wrapper
```

### D. Report Engine (20+ functions)
```
openReport()           — Open report view
renderReportView()     — Render report table
buildReportRows()      — Build report data rows
groupReportRows()      — Group rows
computeSummary()       — Summary calculations
applySorts()           — Multi-column sort
```

### E. Formatting (15+ functions)
```
toggleCellStyleFlag()  — Toggle bold/italic/underline
setCellStyleEntry()    — Set color/font
startFormatPainter()   — Format Painter mode
applyFormatPainter()   — Apply copied format
renderColorSwatchPicker() — Color picker
```

### F. Filter & Sort (15+ functions)
```
addSortLevel()         — Add sort condition
renderSortPopover()    — Sort UI popup
addFilterLevel()       — Add filter condition
renderFilterPopover()  — Filter UI popup
saveCurrentFilter()    — Persist filter
loadSavedFilter()      — Restore filter
clearFilters()         — Clear all filters
```

### G. Conditional Format (10+ functions)
```
addFormatRule()        — Add conditional format rule
matchSingleFormatCondition() — Evaluate single rule
getCellRuleColor()     — Get color from rules
renderFormatPopover()  — Format rules UI
```

### H. Data Persistence (15+ functions)
```
buildProjectSaveSnapshot() — Capture full state
saveProjectLocalBackup()   — Backup to localStorage
loadProjectLocalBackup()   — Restore from localStorage
persistToDrive()           — Sync to Google Drive
scheduleSheetDataSave()    — Debounced auto-save
flushCurrentUiEditsBeforeSave() — Flush pending edits
```

### I. Google Identity & Auth (5 functions)
```
initAuth()             — Initialize Google Identity Services
ensureDriveDirectToken() — OAuth token for Drive API
waitForGoogleIdentity() — Wait for GIS client
requestDriveSignIn()   — Trigger sign-in
```

---

## 4. HTML DOM TREE (Key Elements)

```
#appContainer
├── #rightToolbar (v24 — fixed right)
│   ├── #tbAttach
│   ├── #tbComment
│   ├── #tbActivity
│   └── #tbInfo
│
├── .rail (Sidebar)
│   ├── #railToggleBtn
│   ├── #navBackBtn / #navForwardBtn
│   ├── #favoritesRail
│   └── .brand, .rail-item[]
│
└── .main
    ├── #screen-list (Project List)
    │   ├── .topbar (search, toolbar)
    │   └── .table-wrap > table#rows
    │
    ├── #columnResizer
    │
    └── #screen-detail (Detail/Sheet View)
        ├── .topbar (#backToList, #detailTitle)
        ├── .detail-body
        │   ├── .folder-table (folder tree)
        │   ├── #gridSheetView (spreadsheet)
        │   │   ├── .grid-sheet-toolbar
        │   │   │   ├── #backToWorkspace
        │   │   │   ├── #activeSheetName
        │   │   │   └── #exportExcelBtn, #importCsvBtn, #linkGoogleSheetBtn, #driveApiSignInBtn
        │   │   ├── .smartsheet-toolbar (Excel 365 style)
        │   │   │   ├── #saveProjectBtn
        │   │   │   ├── #ssBoldBtn, #ssItalicBtn, #ssUnderlineBtn, #ssStrikeBtn
        │   │   │   ├── #ssTextColorBtn, #ssFillColorBtn
        │   │   │   └── ...sort, filter, format, report buttons
        │   │   ├── .formula-bar
        │   │   │   ├── .active-cell-ref
        │   │   │   └── .formula-input
        │   │   ├── .sheet-work-area
        │   │   │   └── .sheet-grid-wrap > table#gridSheetTable
        │   │   └── .sheet-status
        │   ├── #shareList (share panel)
        │   └── #attachmentPanel (v24 panel)
        └── .v19-modal (modals: Forms, Publish, Automation)
```

---

## 5. DATA MODEL

```
Project (root)
├── name: string
├── folders: ProjectFolder[]
│   ├── name, icon, type ("sheet"|"report"|"folder")
│   ├── sheets: Sheet[]
│   │   ├── name, cells: SheetCell[][]
│   │   ├── columns: ColumnConfig[]
│   │   ├── attachments: SheetAttachment[]
│   │   └── formatRules: FormatRule[]
│   ├── reports: Report[]
│   │   └── config: ReportConfig (sources, groupBy, sums, filters, sorts)
│   └── children: ProjectFolder[] (nested)
└── backups stored in localStorage + Drive
```

---

## 6. EXTERNAL INTEGRATIONS

| Integration | Scope | Status |
|-------------|-------|--------|
| **Google Identity Services (GIS)** | OAuth 2.0 login | ✅ GSI client loaded |
| **Google Drive API v3** | Read/write files, folders | ✅ Direct upload |
| **Google Sheets API** | Embed/link sheets | ✅ Via iframe |
| **Apps Script Web App** | Sheet factory, CRUD | ✅ Call via fetch |
| **localStorage** | Project backups, preferences | ✅ Active |

---

## 7. VERSION HISTORY

| Version | Nội dung |
|---------|----------|
| v19 | Forms, Publish, Automation, Contact Column, Column Types |
| v21 | Icon Fix, Excel 365 Toolbar, File Attachment Drive OAuth |
| v23 | Viewport clamp, Smartsheet-style layout, v24 attachment panel |
| v23_quan | Phiên bản Quan Trinh — 9.404 dòng, UI hoàn chỉnh |

---

## 8. KEY ARCHITECTURE DECISIONS

- **Single HTML file**: Toàn bộ CSS + JS + HTML trong 1 file (~374 KB)
- **Không framework**: Vanilla JS, không React/Vue/Angular
- **localStorage cache**: auto-save mỗi 2 giây khi có thay đổi
- **Drive OAuth**: Upload file trực tiếp qua Drive API (không cần Apps Script)
- **Excel 365 Toolbar**: Font Segoe UI, giao diện giống Excel desktop
- **Responsive**: Mobile-first breakpoint 760px, sidebar xuống dưới cùng

---

*Bản đồ bộ nhớ được tạo bởi Hermes Agent — 10/07/2026*
