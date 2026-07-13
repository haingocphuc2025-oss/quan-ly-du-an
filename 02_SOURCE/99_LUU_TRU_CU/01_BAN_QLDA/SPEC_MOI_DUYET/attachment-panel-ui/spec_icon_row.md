# SPEC PHU: Icon Sidebar + Row Height Report

**Ngay:** 09/07/2026
**Gan voi SPEC chinh:** attachment-panel-ui/spec.md + spec_icon.md
**Base:** v23_baseline.html
**Output:** v24_quan.html

---

## 1. VAN DE HIEN TAI

### 1.1 Icon sidebar chua phan biet
- Sheet, Folder, Report dang dung cung 1 icon xam giong nhau
- Can ap dung SVG icon theo tung loai (da co code trong spec_icon.md)

### 1.2 Report row cao qua
- Cac dong trong Report view cach nhau qua xa (khoang 60-80px/dong)
- Sheet view compact hon nhieu
- Can chuan hoa chieu cao dong Report giong Sheet

---

## 2. FIX ICON SIDEBAR

### 2.1 Xac dinh loai item

```javascript
// Hien tai code dang dung gi de xac dinh type?
// Tim bien/thuoc tinh xac dinh Sheet / Folder / Report
// Thuong la: item.type === 'sheet' | 'folder' | 'report'
// Hoac: item.mimeType, item.objectType...

// Sau khi xac dinh duoc, replace ham render sidebar:
function getSidebarIcon(item) {
  const type = item.type || item.objectType || 'sheet';
  if (type.toLowerCase().includes('folder')) return getItemIconSVG('folder', 20);
  if (type.toLowerCase().includes('report')) return getItemIconSVG('report', 20);
  return getItemIconSVG('sheet', 20); // mac dinh la sheet
}
```

### 2.2 CSS can them

```css
/* Dam bao icon SVG khong bi stretch */
.sidebar-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sidebar-item-icon svg {
  display: block;
  width: 20px;
  height: 20px;
}

/* Active item — nen xanh nhat */
.sidebar-item.active .sidebar-item-icon svg rect:first-child {
  opacity: 1;
}
```

### 2.3 Ket qua mong doi

```
Sidebar hien tai:          Sidebar sau fix:
┌──────────────────┐       ┌──────────────────┐
│ □ Hop dong phap ly│       │ [sheet-SVG] Hop dong phap ly │
│ □ Vat lieu CO CQ  │  →    │ [sheet-SVG] Vat lieu CO CQ   │
│ □ Thi cong NT     │       │ [sheet-SVG] Thi cong NT      │
│ □ New Folder      │       │ [folder-SVG] New Folder      │
│ □ New Report      │       │ [report-SVG] New Report      │
└──────────────────┘       └──────────────────┘
```

---

## 3. FIX ROW HEIGHT REPORT

### 3.1 Van de
Report view dang co row height ~60-80px — qua cao, can compact xuong giong Sheet (~32-36px).

### 3.2 CSS fix

```css
/* Report grid — compact nhu Sheet */
.report-grid-table tbody tr {
  height: 32px !important;
  max-height: 36px !important;
}

.report-grid-table tbody td {
  padding: 4px 8px !important;
  vertical-align: middle !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* Xoa neu co min-height qua cao */
.report-row, .rpt-row {
  min-height: unset !important;
  height: 32px !important;
}
```

### 3.3 Ket qua mong doi

```
Report hien tai:            Report sau fix:
┌──────────────────────┐    ┌──────────────────────┐
│                      │    │ Row 1 compact         │
│ Row 1 (cao 70px)     │    ├──────────────────────┤
│                      │    │ Row 2 compact         │
├──────────────────────┤ →  ├──────────────────────┤
│                      │    │ Row 3 compact         │
│ Row 2 (cao 70px)     │    ├──────────────────────┤
│                      │    │ Row 4 compact         │
└──────────────────────┘    └──────────────────────┘
  2 rows hien thi             6-8 rows hien thi cung luc
```

### 3.4 Dong bo voi Sheet row height

Kiem tra bien `rowHeight` trong code (thuong 32px mac dinh):
```javascript
// Dam bao Report dung cung gia tri nhu Sheet
const REPORT_ROW_HEIGHT = 32; // giong Sheet
const REPORT_CELL_PADDING = '4px 8px'; // giong Sheet
```

---

## 4. TEST CASES

| # | Test | Ky vong |
|---|------|---------|
| 1 | Sidebar: dong Sheet | Icon xanh la #107C41 |
| 2 | Sidebar: dong Folder | Icon vang #FFB900 |
| 3 | Sidebar: dong Report | Icon cam #D83B01 |
| 4 | Sidebar: dong "New Sheet" | Icon xanh la (mac dinh sheet) |
| 5 | Report view: mo bao cao | Dong cao ~32px, compact nhu Sheet |
| 6 | Report view: 10 dong du lieu | Tat ca hien trong man hinh, khong phai scroll nhieu |
| 7 | So sanh Sheet vs Report row height | Chieu cao dong tuong duong nhau |
| 8 | Icon sidebar zoom 125% | Van ro net, khong bi pixel |

---

## 5. BAN GIAO

- ✅ Tim dung bien xac dinh type (sheet/folder/report) — ghi vao CODE_DIFF
- ✅ Ap dung `getItemIconSVG()` vao sidebar render
- ✅ CSS compact Report row: height 32px, padding 4px 8px
- ✅ Khong anh huong den Sheet row height hien tai
- ✅ Test ca 3 icon o sidebar truoc khi nop
