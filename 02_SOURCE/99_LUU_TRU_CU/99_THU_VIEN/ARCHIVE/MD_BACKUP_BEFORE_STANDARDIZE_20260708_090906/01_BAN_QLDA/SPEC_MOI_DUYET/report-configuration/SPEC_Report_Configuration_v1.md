# SPEC: Report Configuration (Grouping, Summary, Filter Across Sheets)
**Dự án:** Web QLDA — Feature: Report Configuration  
**Phiên bản:** v1.0  
**Ngày:** 2026-07-06  
**Người viết:** Tư vấn thiết kế (Phúc) → Handoff cho Nhà thầu (Quân)  
**Trạng thái:** Đã duyệt — Sẵn sàng triển khai  

---

## 1. MỤC TIÊU
Xây dựng module **Report Configuration** cho phép người dùng cấu hình:
- **Filter** áp dụng đồng thời trên nhiều sheet nguồn (cross-sheet filtering)
- **Grouping** đa cấp (1–3 cấp) với summary row tự động
- **Summary** ở cấp group và cấp report (COUNT, SUM, AVG, MIN, MAX)
- **Report Settings Panel** tập trung quản trị source sheets, columns, filter, grouping, sort, summary

> **Tham chiếu Smartsheet:** UI/UX tham khảo Smartsheet Report Builder (Grid view, Filter panel, Grouping dialog, Summary rows)

---

## 2. PHẠM VI (SCOPE)

| Feature | Mô tả | Ưu tiên |
|---------|-------|---------|
| **Cross-Sheet Filter** | Filter áp dụng cho tất cả source sheets cùng lúc | **Bắt buộc** |
| **Multi-Level Grouping** | Group theo 1–3 cột, collapse/expand, sort groups | **Bắt buộc** |
| **Group Summary Rows** | Hàng tổng kết mỗi group (COUNT/SUM/AVG/MIN/MAX) | **Bắt buộc** |
| **Report Summary Row** | Hàng tổng kết cuối report | **Bắt buộc** |
| **Report Settings Panel** | Modal/panel quản trị toàn bộ config | **Bắt buộc** |
| **Source Sheets Manager** | Add/remove/reorder source sheets | **Bắt buộc** |
| **Column Selector** | Chọn/hiển thị/sắp xếp cột hiển thị | **Bắt buộc** |
| **Sort Configuration** | Sort nhóm & sort trong nhóm | **Nice-to-have** |
| **Export Report Config** | Xuất JSON definition để tái sử dụng | **Nice-to-have** |

---

## 3. DATA MODEL

### 3.1 ReportDefinition (Root Entity)
```typescript
interface ReportDefinition {
  id: string;                    // UUID
  name: string;                  // Tên report (vd: "TFS Log Master Report")
  description?: string;
  type: 'row' | 'summary';       // Row Report hoặc Summary Report
  sourceSheets: SourceSheetRef[]; // Danh sách sheet nguồn
  columns: ColumnConfig[];       // Cột hiển thị + thứ tự
  filter: FilterConfig;          // Filter cross-sheet
  grouping: GroupingConfig;      // Grouping đa cấp
  summary: SummaryConfig;        // Summary rows config
  sort: SortConfig[];            // Sort rules
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: string;             // User ID
}
```

### 3.2 SourceSheetRef
```typescript
interface SourceSheetRef {
  sheetId: string;               // ID sheet trong hệ thống
  sheetName: string;             // Tên hiển thị
  isActive: boolean;             // Bật/tắt sheet này trong report
  columnMapping?: ColumnMapping[]; // Map cột sheet → cột report (nếu tên khác)
}
```

### 3.3 ColumnConfig
```typescript
interface ColumnConfig {
  id: string;                    // Column ID (unique trong report)
  sourceField: string;           // Field name trong source sheet
  displayName: string;           // Tên hiển thị
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'dropdown' | 'contact' | 'currency' | 'percentage' | 'duration';
  width?: number;                // Pixel width
  visible: boolean;              // Ẩn/hiện
  order: number;                 // Thứ tự hiển thị
  frozen?: boolean;              // Freeze column
  formatOptions?: FormatOptions; // Format số/ngày
}
```

### 3.4 FilterConfig (Cross-Sheet)
```typescript
interface FilterConfig {
  logic: 'AND' | 'OR';           // Logic kết hợp các condition
  conditions: FilterCondition[];
  includeParentRows: boolean;    // Bao gồm hàng cha (parent rows)
}

interface FilterCondition {
  id: string;
  field: string;                 // Column ID từ ColumnConfig
  operator: FilterOperator;
  value: FilterValue | FilterValue[]; // Single value hoặc range
  caseSensitive?: boolean;
}

type FilterOperator = 
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'is_blank' | 'is_not_blank'
  | 'greater_than' | 'greater_equal'
  | 'less_than' | 'less_equal'
  | 'between' | 'not_between'
  | 'in' | 'not_in'
  | 'is_today' | 'is_yesterday' | 'is_this_week' | 'is_this_month' | 'is_last_n_days';

type FilterValue = string | number | boolean | Date;
```

### 3.5 GroupingConfig
```typescript
interface GroupingConfig {
  levels: GroupLevel[];          // Tối đa 3 cấp
  showSummaryRow: boolean;       // Bật summary row cho mỗi group
  collapseByDefault: boolean;    // Collapse tất cả group khi load
  groupSort: GroupSortRule[];    // Sắp xếp các group
}

interface GroupLevel {
  level: 1 | 2 | 3;              // Cấp độ
  field: string;                 // Column ID
  sort: 'asc' | 'desc' | 'custom'; // Sắp xếp giá trị group
  customOrder?: string[];        // Nếu sort='custom'
}

interface GroupSortRule {
  field: string;                 // Column ID hoặc 'summary:<function>'
  direction: 'asc' | 'desc';
}
```

### 3.6 SummaryConfig
```typescript
interface SummaryConfig {
  groupSummaries: GroupSummary[]; // Summary mỗi group level
  reportSummary: ReportSummary;   // Summary cuối report
}

interface GroupSummary {
  level: 1 | 2 | 3;
  fields: FieldSummary[];
}

interface ReportSummary {
  fields: FieldSummary[];
}

interface FieldSummary {
  field: string;                 // Column ID
  functions: SummaryFunction[];  // Nhiều function cho 1 field
  label?: string;                // Label tùy chỉnh (vd: "Tổng cộng")
}

type SummaryFunction = 
  | 'count' | 'count_distinct'
  | 'sum' | 'average' | 'min' | 'max'
  | 'stddev' | 'variance'
  | 'earliest' | 'latest';       // Cho date
```

### 3.7 SortConfig
```typescript
interface SortConfig {
  field: string;                 // Column ID hoặc 'group:<level>'
  direction: 'asc' | 'desc';
  priority: number;              // 1 = primary sort
}
```

---

## 4. UI/UX SPECIFICATION

### 4.1 Report Builder Layout (Single Page / Modal)

```
┌─────────────────────────────────────────────────────────────────┐
│ Report Builder: [Report Name]                    [Save] [Cancel] │
├─────────────────┬───────────────────────────────────────────────┤
│ NAVIGATION      │ MAIN CONTENT                                  │
│ ┌─────────────┐ │ ┌─────────────────────────────────────────┐  │
│ │ Source      │ │ TOOLBAR                                     │
│ │ Sheets      │ │ [Filter] [Group] [Sort] [Columns] [Settings]│
│ ├─────────────┤ ├─────────────────────────────────────────────┤
│ │ Columns     │ │ GRID PREVIEW (Live data từ source sheets)   │
│ ├─────────────┤ │ ┌─────────────────────────────────────────┐  │
│ │ Filter      │ │ │ ▼ Nhà thầu: ABC Corp (15 rows)          │  │
│ ├─────────────┤ │ │ │   ▼ Loại HS: TFS (8 rows)             │  │
│ │ Grouping    │ │ │   │   Row 1  Row 2  ...                 │  │
│ ├─────────────┤ │ │   │   ─── SUMMARY: COUNT=8, MIN=...     │  │
│ │ Summary     │ │ │   ▼ Loại HS: MAR (7 rows)               │  │
│ ├─────────────┤ │ │       ─── SUMMARY: COUNT=7...           │  │
│ │ Sort        │ │ │ ─── GROUP SUMMARY: COUNT=15...          │  │
│ └─────────────┘ │ │ ▼ Nhà thầu: XYZ Ltd (22 rows)           │  │
                  │ │      ...                                 │  │
                  │ │ ─── REPORT SUMMARY: COUNT=37...         │  │
                  │ └─────────────────────────────────────────┘  │
└─────────────────┴───────────────────────────────────────────────┘
```

### 4.2 Source Sheets Tab
- **List** các sheet nguồn với checkbox Active
- **Add Sheet** button → mở modal chọn sheet từ workspace
- **Column Mapping** (optional): Auto-map theo tên, cho phép override
- **Drag-drop** reorder sheets (ưu tiên dữ liệu)

### 4.3 Columns Tab
- **Table** danh sách cột: Visible, Display Name, Source Field, Type, Width, Order
- **Drag-drop** reorder columns
- **Toggle Visible** (checkbox)
- **Add Calculated Column** (future: formula column)

### 4.4 Filter Tab (Cross-Sheet)
```
┌────────────────────────────────────────────────────┐
│ Filter Logic: [AND ▼]  Include Parent Rows: [☑]   │
├────────────────────────────────────────────────────┤
│ + Add Condition                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Field: [Status ▼]  Operator: [≠ ▼]  Value:    │ │
│ │              [All Done            ]  [Remove]  │ │
│ └────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────┐ │
│ │ Field: [Date Submit Client ▼]  Op: [≥ ▼]      │ │
│ │ Value: [2026-01-01        ]  [Remove]         │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ [Apply Preview]  [Clear All]  [Save Filter]       │
└────────────────────────────────────────────────────┘
```
- **Live preview** grid cập nhật real-time khi thêm/sửa condition
- **Date presets**: "Last 7 days", "This month", "Last month", "Year to date"
- **Save as named filter** (reuse across reports)

### 4.5 Grouping Tab
```
┌────────────────────────────────────────────────────┐
│ Group Levels (Max 3)          [Collapse All] [☑]  │
├────────────────────────────────────────────────────┤
│ Level 1: Field [Nhà thầu ▼]  Sort [A-Z ▼]         │
│ Level 2: Field [Loại HS ▼]   Sort [A-Z ▼]         │
│ Level 3: Field [Status ▼]    Sort [Custom ▼]      │
│         Custom Order: [All Done, In Review, New]  │
├────────────────────────────────────────────────────┤
│ Show Summary Row per Group: [☑]                   │
│ Show Report Summary Row: [☑]                      │
└────────────────────────────────────────────────────┘
```
- **Auto-suggest** fields phù hợp grouping (text, dropdown, contact, date)
- **Validation**: Không group theo cột number/currency (trừ khi binned)

### 4.6 Summary Tab
```
┌────────────────────────────────────────────────────┐
│ GROUP SUMMARY (per level)                          │
├────────────────────────────────────────────────────┤
│ Level 1 (Nhà thầu):                                │
│   + Add Field: [Request ID ▼]  Function: [COUNT ▼]│
│   + Add Field: [Date Submit ▼]  Function: [MIN ▼] │
│                                                    │
│ Level 2 (Loại HS):                                 │
│   + Add Field: [Request ID ▼]  Function: [COUNT ▼]│
│                                                    │
│ REPORT SUMMARY (footer)                            │
├────────────────────────────────────────────────────┤
│   + Add Field: [Request ID ▼]  Function: [COUNT ▼]│
│   Label: [Tổng cộng]                               │
└────────────────────────────────────────────────────┘
```
- **Chỉ hiển thị functions hợp lệ theo dataType**:
  - Text/Dropdown/Contact/Boolean: COUNT, COUNT_DISTINCT
  - Number/Currency/Percentage: SUM, AVG, MIN, MAX, STDDEV, VARIANCE
  - Date: MIN (earliest), MAX (latest), COUNT
- **Custom label** cho summary row

### 4.7 Grid Preview (Live Data)
- **Virtual scrolling** (handle 10k+ rows)
- **Group rows** clickable expand/collapse
- **Summary rows** highlighted (bg color, bold font)
- **Column resize**, **reorder** (drag header)
- **Row click** → open detail modal (link về source sheet)

---

## 5. API SPECIFICATION

### 5.1 Report CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Tạo report mới |
| GET | `/api/reports/:id` | Lấy definition + data preview |
| PUT | `/api/reports/:id` | Cập nhật definition |
| DELETE | `/api/reports/:id` | Xóa report |
| GET | `/api/reports` | List reports (paginated, filterable) |
| POST | `/api/reports/:id/duplicate` | Clone report |

### 5.2 Report Data Execution
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/:id/execute` | Chạy report, trả về grouped data |
| GET | `/api/reports/:id/data` | Lấy data đã cache (pagination) |
| POST | `/api/reports/:id/refresh` | Invalidate cache, re-fetch |

**Request Body (Execute):**
```json
{
  "page": 1,
  "pageSize": 100,
  "expandGroups": [1, 2],  // Group levels to expand
  "includeSummary": true
}
```

**Response:**
```json
{
  "groups": [
    {
      "level": 1,
      "key": "ABC Corp",
      "displayValue": "ABC Corp",
      "rowCount": 15,
      "summary": { "Request ID": { "count": 15 }, "Date Submit": { "min": "2026-01-15" } },
      "children": [
        {
          "level": 2,
          "key": "TFS",
          "displayValue": "TFS",
          "rowCount": 8,
          "summary": { "Request ID": { "count": 8 } },
          "rows": [ { ...row data... }, ... ]
        }
      ]
    }
  ],
  "reportSummary": { "Request ID": { "count": 37 } },
  "totalRows": 37,
  "totalGroups": 12,
  "executionTimeMs": 245
}
```

### 5.3 Source Sheets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sheets` | List all available sheets |
| GET | `/api/sheets/:id/columns` | Lấy schema cột của sheet |
| POST | `/api/sheets/:id/sample` | Lấy sample data (100 rows) |

### 5.4 Export/Import
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/:id/export` | Xuất ReportDefinition JSON |
| POST | `/api/reports/import` | Import từ JSON |

---

## 6. BUSINESS LOGIC & VALIDATION

### 6.1 Cross-Sheet Filter Logic
1. **Schema Union**: Gộp schema của tất cả active source sheets
2. **Column Resolution**: Map filter field → column trong từng sheet (via columnMapping hoặc tên)
3. **Per-Sheet Execution**: Chạy filter trên từng sheet riêng biệt
4. **Union Results**: Gộp kết quả (UNION ALL) trước khi grouping

### 6.2 Grouping Algorithm
```python
def group_rows(rows: List[Row], levels: List[GroupLevel]) -> GroupTree:
    if not levels:
        return LeafGroup(rows=rows)
    
    level = levels[0]
    groups = defaultdict(list)
    for row in rows:
        key = get_group_key(row, level.field)
        groups[key].append(row)
    
    return GroupNode(
        level=level.level,
        children={
            key: group_rows(rows, levels[1:]) 
            for key, rows in sorted(groups.items(), key=level.sort_key)
        }
    )
```

### 6.3 Summary Computation
- **Lazy evaluation**: Chỉ compute khi group được expand hoặc request summary
- **Incremental**: Cache summary per group, invalidate khi data thay đổi
- **Type safety**: Validate function compatible với dataType trước khi compute

### 6.4 Validation Rules
| Rule | Error Message |
|------|---------------|
| Max 3 grouping levels | "Tối đa 3 cấp grouping" |
| Group field must exist in columns | "Cột grouping phải hiển thị trong report" |
| Summary function compatible with dataType | "Function SUM không áp dụng cho cột Text" |
| At least 1 source sheet active | "Phải có ít nhất 1 sheet nguồn active" |
| Filter field exists in at least 1 sheet | "Trường filter không tồn tại trong sheet nguồn" |
| Unique column display names | "Tên hiển thị cột không được trùng" |

---

## 7. PERFORMANCE REQUIREMENTS

| Metric | Target |
|--------|--------|
| Report execute (10k rows, 3 levels) | < 500ms |
| Grid render (virtual scroll 100 rows) | < 100ms |
| Filter change preview update | < 300ms |
| Group expand/collapse | < 50ms |
| Max source sheets per report | 20 |
| Max rows per report (after filter) | 50,000 |
| Cache TTL | 5 phút (configurable) |

### Optimization Strategies
- **Server-side grouping & aggregation** (SQL GROUP BY / Mongo aggregation)
- **Column pruning**: Chỉ fetch columns cần thiết
- **Predicate pushdown**: Push filter vào source sheet query
- **Materialized view** cho report thường dùng
- **WebSocket** cho real-time preview updates

---

## 8. SECURITY & PERMISSIONS

| Permission | Description |
|------------|-------------|
| `report.create` | Tạo report mới |
| `report.read` | Xem report (cần read permission trên TẤT CẢ source sheets) |
| `report.update` | Sửa report definition |
| `report.delete` | Xóa report |
| `report.execute` | Chạy report, xem data |
| `report.export` | Xuất config JSON |
| `report.share` | Chia sẻ report cho user khác |

**Row-level security**: Report tự động áp dụng RLS từ source sheets (user chỉ thấy row họ có quyền trên sheet gốc)

---

## 9. TEST CASES (ACCEPTANCE CRITERIA)

### TC-01: Cross-Sheet Filter
- **Given**: Report có 3 source sheets, filter `Status ≠ "All Done"`
- **When**: Execute report
- **Then**: Kết quả chỉ chứa rows status ≠ "All Done" từ **cả 3 sheets**

### TC-02: Multi-Level Grouping
- **Given**: Group Level 1: `Nhà thầu`, Level 2: `Loại HS`
- **When**: Expand group "ABC Corp"
- **Then**: Hiển thị sub-groups "TFS", "MAR", "PQR" với đúng row count

### TC-03: Group Summary Row
- **Given**: Group summary config: `Request ID: COUNT`, `Date Submit: MIN`
- **When**: View group "ABC Corp > TFS"
- **Then**: Summary row hiển thị `COUNT=8`, `MIN=2026-01-15`

### TC-04: Report Summary Row
- **Given**: Report summary: `Request ID: COUNT` label="Tổng cộng"
- **When**: Scroll đến cuối report
- **Then**: Hàng cuối hiển thị "Tổng cộng | 37 | - | - | ..."

### TC-05: Column Mapping Across Sheets
- **Given**: Sheet A có cột "Status", Sheet B có cột "Trạng thái"
- **When**: Map cả 2 → report column "Status"
- **Then**: Filter/Group/Summary trên "Status" hoạt động trên cả 2 sheets

### TC-06: Date Filter Presets
- **When**: Chọn "Last 7 days" trên Date Submit
- **Then**: Filter value = `>= today-7d AND <= today`

### TC-07: Collapse/Expand Persistence
- **When**: User collapse group, refresh page
- **Then**: Group vẫn ở trạng thái collapsed

### TC-08: Large Dataset Performance
- **Given**: 50k rows across 10 sheets, 3-level grouping
- **When**: Execute report
- **Then**: Response < 500ms, grid render < 100ms

---

## 10. HANDOFF CHECKLIST (CHO NHÀ THẦU)

- [ ] **Backend**: API endpoints (CRUD, Execute, Export/Import)
- [ ] **Backend**: Cross-sheet query engine (union, filter pushdown, grouping, aggregation)
- [ ] **Backend**: Cache layer (Redis) cho report data
- [ ] **Frontend**: Report Builder UI (Tabs: Source Sheets, Columns, Filter, Grouping, Summary, Sort)
- [ ] **Frontend**: Grid Preview với virtual scroll, group expand/collapse, summary rows
- [ ] **Frontend**: Filter Builder (condition builder, date presets, live preview)
- [ ] **Frontend**: Grouping Config (max 3 levels, custom sort, summary toggle)
- [ ] **Frontend**: Summary Config (function picker per dataType, custom labels)
- [ ] **Integration**: Permission check trên source sheets
- [ ] **Testing**: Unit tests cho grouping/summary logic
- [ ] **Testing**: E2E tests cho TC-01 đến TC-08
- [ ] **Docs**: API spec (OpenAPI), User guide

---

## 11. FILE STRUCTURE (ĐỀ XUẤT)

```
src/
├── features/report/
│   ├── api/
│   │   ├── reportApi.ts          # CRUD, execute, export/import
│   │   ├── sheetApi.ts           # Source sheets, columns
│   │   └── types.ts              # TypeScript interfaces (Section 3)
│   ├── components/
│   │   ├── ReportBuilder.tsx     # Main container
│   │   ├── tabs/
│   │   │   ├── SourceSheetsTab.tsx
│   │   │   ├── ColumnsTab.tsx
│   │   │   ├── FilterTab.tsx
│   │   │   ├── GroupingTab.tsx
│   │   │   ├── SummaryTab.tsx
│   │   │   └── SortTab.tsx
│   │   ├── grid/
│   │   │   ├── ReportGrid.tsx    # Virtual scroll grid
│   │   │   ├── GroupRow.tsx      # Expandable group header
│   │   │   ├── SummaryRow.tsx    # Group/Report summary
│   │   │   └── DataRow.tsx
│   │   ├── FilterBuilder.tsx     # Condition builder UI
│   │   └── GroupingConfig.tsx    # Level config UI
│   ├── hooks/
│   │   ├── useReportDefinition.ts
│   │   ├── useReportData.ts
│   │   └── useFilterBuilder.ts
│   ├── utils/
│   │   ├── groupingEngine.ts     # Client-side grouping (fallback/preview)
│   │   ├── summaryEngine.ts      # Summary computation
│   │   ├── filterEngine.ts       # Filter evaluation
│   │   └── columnMapping.ts      # Cross-sheet column resolution
│   └── types/
│       └── report.types.ts       # Shared types
```

---

## 12. THAM CHIẾU SMARTSHEET (ĐÃ RESEARCH)

| Tính năng Smartsheet | Mapping trong SPEC |
|---------------------|-------------------|
| Report Builder → Source Sheets | Section 4.2, API `/api/sheets` |
| Report Builder → Columns | Section 4.3, ColumnConfig |
| Filter Panel (toolbar) | Section 4.4, FilterConfig |
| Group Rows (right-click / menu) | Section 4.5, GroupingConfig |
| Summary Rows (auto) | Section 4.6, SummaryConfig |
| Grid View với Group/Summary | Section 4.7, ReportGrid |
| Report Settings (File menu) | Section 5.1, ReportDefinition |
| Cross-sheet report (multiple sources) | Section 6.1, Business Logic |

---

**KẾT THÚC SPEC**  
**Handoff:** Tư vấn thiết kế → Nhà thầu thi công  
**Lưu ý:** Mọi thay đổi scope phải qua tư vấn thiết kế duyệt trước khi implement.