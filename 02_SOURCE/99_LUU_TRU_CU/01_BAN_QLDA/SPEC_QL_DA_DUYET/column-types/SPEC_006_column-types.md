# SPEC: Column Operations

**Ngày:** 09/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

Định nghĩa đầy đủ các thao tác với **cột (column)** trong Web QLDA — thêm, sửa, xóa, di chuyển, ẩn/hiện, đóng băng, copy/paste, thay đổi kiểu dữ liệu, format, và quản lý cột. Mục tiêu: người dùng có toàn quyền kiểm soát cấu trúc bảng tính như Smartsheet / Excel Online.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Tổng quan luồng thao tác

```
User action → Context menu / Header click → Confirm / Drag → Sheet Update → Re-render grid
```

- Mọi thao tác đều có **undo** (Ctrl+Z)
- Mọi thao tác đều trigger **auto-save** (xem SPEC_009_auto-save-on-exit)
- Thay đổi cột ảnh hưởng đến **Grid view, Gantt view, Card view, Form**

### 2.2 Khả năng Apps Script (DO nhà thầu code)

| Thao tác | Apps Script API |
|----------|----------------|
| Thêm cột | `Sheet.insertColumnAfter(index)` / `insertColumnBefore(index)` |
| Đổi tên cột | `Column.setName(name)` |
| Đổi type | `Column.setColumnType(type)` — cần xử lý convert dữ liệu cũ |
| Xóa cột | `Sheet.deleteColumn(index)` + confirm dialog + undo stack |
| Di chuyển | `Sheet.moveColumn(fromIndex, toIndex)` |
| Ẩn/Hiện | `Column.setHidden(true/false)` |
| Đóng băng | `Sheet.setFrozenColumnCount(count)` |
| Độ rộng | `Column.setWidth(pixels)` / auto-fit |
| Format | `Column.setFormat(formatObject)` |
| Sort/Filter | `Sheet.sort(columnIndex, ascending)` / Range filter |

### 2.3 Design Decisions

- **Primary Column** — cột A mặc định, không thể xóa, nhưng có thể chuyển primary cho cột khác
- **Undo stack** — lưu trạng thái cột trước khi thay đổi, giới hạn 50 actions
- **Type conversion** — khi đổi column type, dữ liệu cũ tự động convert (nếu được) hoặc báo lỗi hàng loạt
- **Consistency** — không cho phép 2 cột cùng tên trong 1 sheet
- **Hidden columns** — vẫn tính trong index, không mất dữ liệu
- **Drag-drop** — preview vị trí khi kéo, snap vào giữa 2 cột

---

## 3. SPEC CHI TIẾT

### 3.1 Column Context Menu

Khi click chuột phải vào **header cột**, hiển thị menu:

```
[Insert Column Left]
[Insert Column Right]
─────────────────────
[Edit Column Properties...]
[Rename]            (inline edit header)
─────────────────────
[Move Left]         Ctrl+Shift+←
[Move Right]        Ctrl+Shift+→
─────────────────────
[Freeze Column]     (freeze đến cột này)
[Unfreeze]          (bỏ freeze)
─────────────────────
[Hide Column]
[Unhide Columns...]  (mở dialog chọn cột để unhide)
─────────────────────
[Copy Entire Column]
[Paste Over Column]
[Clear Column]
[Delete Column]     (⚠️ confirm: "Xóa vĩnh viễn dữ liệu cột này?")
─────────────────────
[Sort A → Z]
[Sort Z → A]
[Clear Sort]
─────────────────────
[Column Width...]   (nhập pixel hoặc Auto-fit)
```

### 3.2 Add Column (Insert)

**UI:**
- **Insert Column Left** — thêm cột mới bên trái cột hiện tại
- **Insert Column Right** — thêm cột mới bên phải
- Nút **"+ Add Column"** ở cuối header row (phải nhất)
- Shortcut: `Ctrl+Shift+=` (thêm bên phải)

**Flow:**
1. User chọn Insert → dialog **Edit Column Properties** hiện ra (xem 3.3)
2. User chọn tên, type, format
3. Nếu không chọn gì → cột mặc định type **Text/Number**, tên "Column N"
4. Cột mới auto-insert vào đúng vị trí
5. Sheet re-render, focus vào cột mới

**Validation:**
- Tên cột không được trùng
- Tên cột tối đa 100 ký tự
- Nếu sheet có dữ liệu → cột mới để trống

### 3.3 Edit Column Properties

**Phải chuột → Edit Column Properties → Dialog:**

```
┌─────────────────────────────────────┐
│  Edit Column Properties             │
│                                     │
│  Column Name: [________________]    │
│                                     │
│  Column Type: [Dropdown v]          │
│  ┌─────────────────────────────┐   │
│  │ Text/Number                 │   │
│  │ Date                        │   │
│  │ Dropdown (Single)           │   │
│  │ Dropdown (Multi)            │   │
│  │ Checkbox                    │   │
│  │ Symbol (Flag/Priority/...)  │   │
│  │ Contact List                │   │
│  │ Auto-Number                 │   │
│  │ Formula                     │   │
│  │ System (Modified/Created)   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ── Type-specific config ──         │
│  [Options list if dropdown]         │
│  [Symbol set if symbol]             │
│  [Formula if formula type]          │
│  [Auto-Number prefix/digits]        │
│                                     │
│  ── Format ──                       │
│  Font: [Arial v] Size: [12 v]       │
│  Bold [ ] Italic [ ] Underline [ ]  │
│  Align: [L] [C] [R]                 │
│  Text Wrap: [Wrap v]                │
│  Background: [color picker]         │
│  Text Color: [color picker]         │
│                                     │
│  ── Validation ──                    │
│  ☑ Required                         │
│  Min: [_____]  Max: [_____]         │
│  Regex: [________________]           │
│                                     │
│  [ Cancel ]     [ Save ]            │
└─────────────────────────────────────┘
```

**Type-specific config:**

| Type | Config |
|------|--------|
| **Text/Number** | Decimal places (0-10), thousands separator |
| **Date** | Format (DD/MM/YYYY, MM/DD/YYYY...), auto-fill today |
| **Dropdown (Single)** | Options list, allow custom? default value |
| **Dropdown (Multi)** | Options list, separator, max selections |
| **Checkbox** | Label for checked/unchecked |
| **Symbol** | Symbol set: Flag (R/Y/G/B), Priority (1-4), Traffic Light, Weather, Star Rating |
| **Contact List** | Allow multiple contacts? picker from contact list |
| **Auto-Number** | Prefix, suffix, digits (zero-padded), start number |
| **Formula** | Formula editor (xem 3.9) |
| **System** | Read-only: Created By, Created Date, Modified By, Modified Date |

### 3.4 Move Column

**Drag-drop:**
1. User click+hold header cột
2. Kéo → vertical indicator line hiện giữa 2 cột (preview)
3. Thả → cột di chuyển đến vị trí mới
4. Các cột khác re-index tự động

**Menu:**
- **Move Left** — hoán đổi với cột bên trái
- **Move Right** — hoán đổi với cột bên phải

**Shortcut:** `Ctrl+Shift+←` / `Ctrl+Shift+→`

**Giới hạn:**
- Không thể move cột Primary (có thể chuyển primary trước)
- Frozen columns không thể move ra khỏi vùng frozen (trừ khi unfreeze trước)

### 3.5 Delete Column

**Flow:**
1. User chọn Delete Column từ context menu
2. Dialog confirm: **"Xóa cột [tên]? Dữ liệu trong cột này sẽ bị xóa vĩnh viễn."**
   - [Cancel] [Delete] (Delete màu đỏ)
3. Nếu cột có dữ liệu → cảnh báo số lượng ô bị ảnh hưởng
4. Xóa → các cột bên phải dồn trái, re-index

**Giới hạn:**
- ❌ Không thể xóa **Primary Column** (phải chuyển primary cho cột khác trước)
- ❌ Không thể xóa cột cuối cùng (sheet phải có ít nhất 1 cột)
- Cột hidden vẫn có thể xóa

**Undo:** Ctrl+Z khôi phục cột + dữ liệu

### 3.6 Hide / Unhide Column

**Hide:**
- Phải chuột → **Hide Column**
- Shortcut: `Ctrl+0`
- Cột ẩn → header biến mất, nhưng dữ liệu vẫn còn
- Một dấu hiệu "cột ẩn" ở header: icon **«** hoặc **►** ở mép cột kế bên

**Unhide:**
- Click icon **►** giữa 2 cột → unhide tất cả cột ẩn ở khoảng đó
- Hoặc context menu → **Unhide Columns...** → dialog checkbox list chọn cột cần unhide

**Khi in/export:**
- Mặc định: **không** in cột ẩn
- Tùy chọn: "Show hidden columns when exporting" trong sheet settings

### 3.7 Freeze / Unfreeze Column

**Freeze:**
- Phải chuột → **Freeze Column** → đóng băng từ cột A đến cột hiện tại
- Kéo **vertical gray bar** (freeze divider) giữa 2 cột
- Shortcut: không có mặc định, gợi ý `Alt+Shift+F`

**Visual:**
- Frozen zone có border đậm bên phải (2px)
- Frozen columns không scroll ngang
- Header frozen rows + frozen columns tạo góc cố định (top-left)

**Unfreeze:**
- Kéo freeze divider về mép trái
- Hoặc context menu → **Unfreeze**

**Giới hạn:**
- Tối đa 5 cột frozen (hoặc config qua sheet settings)
- Không thể freeze cột ở giữa — chỉ freeze từ trái sang

### 3.8 Column Width & Auto-fit

**UI:**
- Kéo mép phải header → thay đổi width (cursor ↔)
- Double-click mép phải header → **auto-fit** (rộng nhất theo nội dung)
- Phải chuột → **Column Width...** → nhập pixel (min 30px, max 800px)

**Default:**
- Cột mới: 120px
- Sau auto-fit: tối đa 600px, tối thiểu 50px

### 3.9 Formula Column

**Đặc điểm:**
- Column type **Formula** → ô tự động tính, người dùng không ghi đè được
- Có thể tham chiếu đến các cột khác trong cùng hàng
- Hỗ trợ auto-calculate khi dữ liệu thay đổi

**Các hàm hỗ trợ (tối thiểu):**

| Nhóm | Hàm |
|------|-----|
| Số học | `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `ROUND` |
| Logic | `IF`, `AND`, `OR`, `NOT`, `IFERROR` |
| Text | `CONCATENATE`, `LEFT`, `RIGHT`, `LEN`, `UPPER`, `LOWER`, `TRIM` |
| Ngày | `TODAY`, `NOW`, `YEAR`, `MONTH`, `DAY`, `DAYS` |
| Tra cứu | `VLOOKUP`, `INDEX`, `MATCH` |

**Syntax:** `={column_name}` để tham chiếu cột khác trong cùng hàng
VD: `=IF({Status}="Done", "✅", "⏳")`

**Re-evaluation:**
- Khi bất kỳ cell nào trong cùng hàng thay đổi
- Hoặc khi formula column được config lại

### 3.10 System Column (Read-only)

**Các loại:**
| System Column | Mô tả |
|---------------|-------|
| **Created By** | Tên người tạo row |
| **Created Date** | Ngày tạo row |
| **Modified By** | Tên người sửa gần nhất |
| **Modified Date** | Ngày sửa gần nhất |

**Đặc điểm:**
- Tự động điền, không thể edit trực tiếp
- Hiển thị icon lock 🔒 bên cạnh tên cột
- Có thể sort/filter bình thường

### 3.11 Auto-Number Column

**Config:**
```
Prefix: [_____]     VD: "DA-"
Digits: [3]         số chữ số (zero-padded)
Start: [1]          số bắt đầu
Suffix: [_____]     VD: "-2026"
Preview: DA-001-2026
```

- Mỗi row mới → auto-increment
- Không thể chỉnh sửa thủ công
- Khi xóa row → số đó không được dùng lại (trừ khi cấu hình)

### 3.12 Dropdown Column (Single & Multi)

**Single Select:**
- Render: `<select>` / custom dropdown với search
- Chọn 1 giá trị từ danh sách
- Có thể cấu hình **"Cho phép nhập giá trị mới"** (allow custom)

**Multi Select:**
- Render: tag chips `[Tag1 ✕] [Tag2 ✕]` + dropdown
- Chọn nhiều giá trị, hiển thị dạng chips
- Separator khi export: dấu phẩy

**Options management:**
- Add/Remove từ Edit Column Properties
- Import từ range? (tùy chọn nâng cao)
- Sort options alphabetically

### 3.13 Symbol Column

**Symbol sets:**

| Set | Values |
|-----|--------|
| **Flag** | 🟢 Đạt / 🟡 Cảnh báo / 🔴 Chậm / ⚪ Chưa bắt đầu |
| **Priority** | 🔥 Khẩn / ⚡ Cao / 🔵 TB / ⚪ Thấp |
| **Traffic Light** | 🟢 / 🟡 / 🔴 |
| **Star Rating** | ⭐ - ⭐⭐⭐⭐⭐ (click để chọn) |
| **Weather** | ☀️ / ⛅ / 🌧 / ⛈ |
| **Progress** | ◯ / ◐ / ● (0% / 50% / 100%) |

**UI:** Click vào symbol → cycle qua các giá trị hoặc popup picker

### 3.14 Checkbox Column

- Render: `<input type="checkbox">`
- Click toggle ☑ / ☐
- Có thể cấu hình label cho checked/unchecked
- Trong formula: `true` / `false`

### 3.15 Contact List Column

- Picker từ danh sách contact (users trong hệ thống)
- Hiển thị avatar + name
- Multi-contact: hiển thị avatar stack `[👤+👤+2]`
- Lưu: `{userId, name, email, avatarUrl}`

### 3.16 Sort & Filter by Column

**Sort:**
- Click header → sort A→Z (lần 1), Z→A (lần 2), clear sort (lần 3)
- Arrow indicator ▲/▼ bên cạnh tên cột
- Multi-column sort: `Shift+click` cột thứ 2

**Filter:**
- Icon **漏斗** (funnel) xuất hiện bên cạnh tên cột khi hover
- Click → dropdown filter panel:
  - Sort ascending / descending
  - Text filter: Contains, Equals, Starts with, Ends with, Is empty, Is not empty
  - Number filter: =, ≠, >, <, ≥, ≤, Between
  - Date filter: Today, This week, This month, Custom range
  - Dropdown filter: checkbox list values, "Select All" / "Clear All"
  - Checkbox filter: Checked / Unchecked / All
- Multiple filters AND với nhau
- Filter icon đổi màu khi filter active

### 3.17 Copy / Paste Column

**Copy Entire Column:**
1. Phải chuột → **Copy Entire Column**
2. Copy vào clipboard dưới dạng TSV (tab-separated)
3. Hoặc paste vào Excel / Google Sheets

**Paste Over Column:**
1. Copy từ bên ngoài (Excel, Google Sheets, text)
2. Phải chuột → **Paste Over Column**
3. Paste tự động parse rows, ghi đè dữ liệu cột hiện tại
4. Nếu số rows paste > số rows sheet → hỏi "Add more rows?"
5. Nếu lỗi → báo "Dòng X- Y: lỗi format, bỏ qua"

**Clear Column:**
- Xóa toàn bộ dữ liệu trong cột (giữ nguyên cột và format)
- Confirm: "Xóa dữ liệu cột [tên]?" (không thể undo nếu không có auto-save)

### 3.18 Primary Column

**Đặc điểm:**
- Mỗi sheet **bắt buộc** có đúng 1 Primary Column
- Mặc định: cột A (Text/Number)
- Dùng để đặt **tên row** (hiển thị đậm nhất)
- Trong Card view/Gantt view → hiển thị làm tiêu đề card/task
- Biểu tượng: **🔑** bên cạnh tên cột

**Chuyển Primary:**
1. Phải chuột cột khác → **Set as Primary Column**
2. Confirm: "Chuyển primary từ cột [A] sang [B]?"
3. Hệ thống tự động đổi, dữ liệu giữ nguyên

### 3.19 Undo / Redo

- **Ctrl+Z**: undo thao tác cột cuối cùng
- **Ctrl+Y** / **Ctrl+Shift+Z**: redo
- Undo stack tối đa **50 actions**
- Các thao tác undo được: insert, delete, move, rename, resize, hide, freeze, change type
- Không undo được: sort, filter (chỉ clear sort/filter)
- Visual indicator: toast "Undo: Insert Column" / "Redo: Delete Column"

### 3.20 Data Model

```javascript
// Column object
{
  id: "col_abc123",            // unique ID
  index: 0,                    // zero-based position
  name: "Tên công việc",
  type: "text",                // text|number|date|dropdown|checkbox|symbol|contact|auto-number|formula|system
  primary: true,               // is primary column?
  hidden: false,
  frozen: false,
  width: 200,                  // pixels

  // Type-specific
  typeConfig: {
    // dropdown
    options: ["Option A", "Option B"],
    allowCustom: false,

    // auto-number
    prefix: "DA-",
    suffix: "",
    digits: 3,
    startNumber: 1,

    // formula
    formula: 'IF({Status}="Done","✅","⏳")',

    // symbol
    symbolSet: "flag",

    // checkbox
    checkedLabel: "Yes",
    uncheckedLabel: "No",

    // contact
    multiContact: false,

    // system
    systemType: "createdDate"
  },

  // Format
  format: {
    fontFamily: "Arial",
    fontSize: 12,
    bold: false,
    italic: false,
    underline: false,
    textAlign: "left",
    textWrap: true,
    backgroundColor: "#FFFFFF",
    textColor: "#000000"
  },

  // Validation
  validation: {
    required: true,
    min: 0,
    max: 100,
    regex: "^[A-Z]"
  }
}
```

### 3.21 SHEET_CONFIG mở rộng

```json
{
  "columns": {
    "defaultWidth": 120,
    "maxFrozenColumns": 5,
    "allowCustomDropdownOptions": true,
    "maxColumnCount": 200,
    "undoStackSize": 50,
    "formulaFunctions": ["SUM","AVG","MIN","MAX","IF","CONCATENATE","VLOOKUP","TODAY"],
    "systemColumnsEnabled": true,
    "autoNumberConfig": {
      "defaultPrefix": "ROW-",
      "defaultDigits": 4
    }
  }
}
```

### 3.22 Test Cases (bắt buộc)

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| 1 | **Add Column** | Click "+ Add Column" → nhập tên → Save | Cột mới xuất hiện bên phải, tên đúng |
| 2 | **Insert Left/Right** | Phải chuột cột B → Insert Left | Cột mới ở giữa A và B |
| 3 | **Edit Properties** | Phải chuột → Edit → đổi tên, type, format | Cập nhật đúng |
| 4 | **Change Type (safety)** | Đổi cột từ Text→Dropdown (có dữ liệu cũ) | Dữ liệu cũ giữ nguyên, cảnh báo nếu không convert được |
| 5 | **Move by drag** | Kéo header cột C sang giữa A và B | Cột C ở vị trí mới |
| 6 | **Delete + Undo** | Xóa cột → Ctrl+Z | Cột + dữ liệu khôi phục |
| 7 | **Hide/Unhide** | Hide cột B → Unhide B | Cột B trở lại, dữ liệu còn |
| 8 | **Freeze** | Freeze đến cột B → scroll ngang | Cột A+B cố định, C trở đi scroll |
| 9 | **Auto-fit width** | Double-click header border | Width auto-fit nội dung dài nhất |
| 10 | **Sort** | Click header → sort A→Z → click lại Z→A | Dữ liệu sort đúng |
| 11 | **Filter** | Click filter icon → chọn giá trị | Chỉ hiện rows matching |
| 12 | **Dropdown options** | Tạo cột dropdown → add options | Dropdown hiển thị options, chọn được |
| 13 | **Multi-select dropdown** | Tạo cột multi-dropdown → chọn 3 values | Hiển thị 3 chips, lưu đúng |
| 14 | **Formula** | Tạo cột formula =SUM({A},{B}) | Tự động tính, không edit được |
| 15 | **Auto-Number** | Tạo cột auto-number prefix "DA-" digits 3 | Row mới: DA-001, DA-002... |
| 16 | **System column** | Thêm cột Modified Date | Tự động ghi ngày khi sửa row |
| 17 | **Symbol picker** | Click symbol column → chọn 🔴 | Cell hiển thị 🔴 |
| 18 | **Checkbox toggle** | Click checkbox | Toggle ☑ / ☐ |
| 19 | **Contact list** | Click contact column → chọn user | Hiển thị avatar + name |
| 20 | **Copy column** | Copy Entire Column → paste ra ngoài | Dữ liệu copy đúng TSV |
| 21 | **Paste column** | Copy từ Excel → Paste Over Column | Ghi đè dữ liệu cột đúng |
| 22 | **Primary transfer** | Set cột B as Primary | B thành 🔑, A mất icon key |
| 23 | **Multi-column sort** | Shift+click cột thứ 2 | Sort ưu tiên cột 1, sau cột 2 |
| 24 | **Undo after delete** | Xóa cột → Ctrl+Z | Khôi phục hoàn chỉnh |
| 25 | **Max column limit** | Thêm cột đến khi đạt giới hạn 200 | Block thêm, thông báo |
| 26 | **RTL/LTR test** | Insert nhiều lần + move | Index không bị lỗi |
| 27 | **Hidden + export** | Ẩn cột B → Export | File export không có cột B |
| 28 | **Frozen + hidden** | Freeze cột A, ẩn cột B | Frozen vẫn hoạt động, B ẩn |
| 29 | **Filter + formula** | Filter cột A, cột B là formula | Formula tính đúng trên rows filter |
| 30 | **Regex validation** | Set regex cho cột → nhập sai format | Báo lỗi inline, không cho save |

---

## 4. BÀN GIAO CHO NHÀ THẦU

### 4.1 Phụ thuộc
- **Column management API** — `Sheet.insertColumn`, `deleteColumn`, `moveColumn`, `setFrozenColumnCount`
- **Undo manager** — stack-based, snapshot trạng thái column list trước mỗi mutation
- **Formula engine** — parser + evaluator cho basic functions (xem 3.9)
- **UI framework** — context menu, drag-drop, dialog, color picker
- **Clipboard API** — copy/paste dữ liệu column (TSV format)
- **Sheet renderer** — grid, frozen zone, hidden indicator, resizer

### 4.2 Files cần tạo / sửa
| File | Mục đích |
|------|----------|
| `src/column/ColumnManager.js` | CRUD column, move, hide, freeze |
| `src/column/ColumnTypes.js` | Type definitions + type config UI |
| `src/column/ColumnContextMenu.js` | Context menu xịn |
| `src/column/ColumnPropertiesDialog.js` | Edit properties dialog |
| `src/column/FormulaParser.js` | Formula engine |
| `src/column/ColumnSortFilter.js` | Sort/filter logic |
| `src/column/UndoStack.js` | Undo/redo manager |
| `src/ui/ColumnHeader.js` | Header render + interactions |
| `src/ui/ColumnResizer.js` | Drag resize + auto-fit |
| `src/ui/DropdownCell.js` | Dropdown cell render (single+multi) |
| `src/ui/SymbolPicker.js` | Symbol picker component |
| `src/ui/ContactPicker.js` | Contact picker component |

### 4.3 Test Kit
- Unit test cho mỗi column operation
- Integration test: add + edit + delete + move + undo
- Edge cases: column index lỗi, dữ liệu không convert được, frozen + hidden
- Performance test: 200 columns, 5000 rows

### 4.4 Cam kết
- ✅ SPEC đầy đủ 30 test cases, mọi thao tác cột
- ✅ Format chuẩn, phân tách UI + logic + data model
- ✅ Khả thi với Apps Script + HTML/CSS/JS
- ✅ Sẵn sàng cho nhà thầu code
