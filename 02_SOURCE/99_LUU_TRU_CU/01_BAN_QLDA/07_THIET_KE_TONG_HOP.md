# 📋 DESIGN MAIN — DU AN WED QUAN LY

**Phiên bản:** v3.0 (SmartSheet Integration) | **Ngày cập nhật:** 07/07/2026
**Mục đích:** Specification kỹ thuật trung tâm cho toàn bộ dự án Smartsheet Extension
**Thư mục:** `01_BAN_QLDA/DESIGN_MAIN.md` (lưu tại E: hoặc G: tùy máy)

---

## 🎯 MỤC LỤC

1. [🎯 Mục tiêu hệ thống](#-mục-tiêu-hệ-thống)
2. [🔍 Tổng quan SmartSheet Platform](#-tổng-quan-smartsheet-platform)
3. [🏗️ Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
4. [🎨 Thiết kế UI/UX & Layout](#-thiết-kế-uiux--layout)
5. [🔧 6 Core Feature Specifications](#-6-core-feature-specifications)
6. [📡 API Design (Apps Script)](#-api-design-apps-script)
7. [🔐 OAuth & Security Design](#-oauth--security-design)
8. [🛠 Tech Stack & Constraints](#-tech-stack--constraints)
9. [📊 Test Coverage Design](#-test-coverage-design)
10. [📁 Cấu trúc thư mục](#-cấu-trúc-thư-mục)
11. [⚠️ Notes & Caveats](#️-notes--caveats)
12. [🚀 Delivery Instructions](#-delivery-instructions)

---

## 1. 🎯 MỤC TIÊU HỆ THỐNG

Phát triển ứng dụng desktop **Smartsheet mở rộng** với 6 tính năng cốt lõi:

| # | Feature | Mô tả | Mức độ ưu tiên |
|---|---------|-------|---------------|
| 1️⃣ | **Forms** | Modal tạo/sửa hàng, validation đầu vào | 🔴 Cao |
| 2️⃣ | **Publish Report** | Builder báo cáo với filter, group-by, aggregate, export (PDF/Excel/HTML) | 🔴 Cao |
| 3️⃣ | **Automation MVP** | Workflow trigger → action cho tác vụ tự động (email, cập nhật ô) | 🔴 Cao |
| 4️⃣ | **Column Types** | Type selector & config modal (Text/Number/Date/Currency/Percent/Dropdown/Symbols/Checkbox) | 🟡 Trung bình |
| 5️⃣ | **Conditional Formatting** | Rules tô màu phía trước, application trên hàng/cột/cells | 🟡 Trung bình |
| 6️⃣ | **Contact Column** | Dropdown/combo widget multi-select, contacts from known list | 🟢 Thấp |

Sắp xếp theo **high-priority integration**: Forms, Automation, Report builder được O-auth-enabled.

---

## 2. 🔍 TỔNG QUAN SMARTSHEET PLATFORM

### 2.1 SmartSheet là gì?

SmartSheet là nền tảng cộng tác cloud-based, kết hợp bảng tính truyền thống với quản lý dự án hiện đại. Dự án này xây dựng **extension desktop** mở rộng khả năng của SmartSheet.

### 2.2 Kiến trúc giao diện SmartSheet

```
┌─────────────────────────────────────────────────────────────┐
│ 🧭 THANH NAVIGATION                                        │
│ ├─ 🏠 Dashboard   ├─ 🔍 Search   ├─ 📁 Projects           │
│ ├─ 📊 Sheets      ├─ 📈 Reports  ├─ ⚙️ Settings           │
│ └─ 👤 Account & Teams                                       │
├─────────────────────────────────────────────────────────────┤
│ 📅 SIDEBAR (Trái)        │ 📊 MAIN CONTENT                │
│ ├─ 📂 Projects List      │ ├─ 📋 SHEET GRID              │
│ ├─ 📊 Sheet Management   │ │  ├─ Column Headers          │
│ ├─ 📈 Reports            │ │  ├─ Row Numbers             │
│ ├─ 👥 Teams              │ │  ├─ Cell Editing            │
│ └─ ⚙️ Settings           │ │  ├─ Filter/Sort Controls   │
│                           │ │  └─ View Options           │
│                           │ ├- 🔧 RIGHT PANELS            │
│                           │ │  ├─ Details Panel          │
│                           │ │  ├─ Comments Panel         │
│                           │ │  └─ Tags/Filters          │
│                           │ └- 📈 FOOTER STATUS           │
│                           │   ├─ Record Count            │
│                           │   ├─ Connection Status       │
│                           │   └─ Notifications           │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Core Platform Features tham khảo

| Tính năng SmartSheet | Mô tả | Extension của dự án |
|---------------------|-------|-------------------|
| Sheet Grid | Bảng tính chính với cell editing | Giữ nguyên + thêm Forms |
| Cell Types | Text, Number, Date, Dropdown, Checkbox... | **Column Types** — mở rộng type selector |
| Comments | Thảo luận trên cell | **Contact Column** — widget chọn người |
| Reports | Xuất báo cáo cơ bản | **Publish Report** — builder nâng cao |
| Automation Rules | Trigger cơ bản | **Automation MVP** — workflow tự động |
| Conditional Formatting | Tô màu có sẵn | **Conditional Formatting** — rules engine |

### 2.4 Design System tham khảo (SmartSheet)

```css
:root {
  /* Primary */
  --primary: #0a66c2;        /* Xanh dương */
  --primary-dark: #004c8c;
  --primary-light: #e8f4fd;
  
  /* Status */
  --success: #00b87a;        /* Xanh lá */
  --warning: #ff9500;        /* Cam */
  --error: #e03438;          /* Đỏ */
  --info: #397ee7;           /* Xanh thông tin */
  
  /* Neutral */
  --dark: #202224;
  --medium: #5f6d7b;
  --light: #9aa4af;
  --lighter: #d8d8d8;
}
```

---

## 3. 🏗️ KIẾN TRÚC HỆ THỐNG

### 3.1 High-level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Single Page App)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Forms   │ │  Report  │ │Automation│ │  Column  │        │
│  │  Module  │ │  Builder │ │  Module  │ │  Types   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐             │
│  │Conditional│ │ Contact  │ │ Shared Utilities │             │
│  │Formatting │ │  Column  │ │ (API Client,     │             │
│  └──────────┘ └──────────┘ │  State, Auth)    │             │
│                             └──────────────────┘             │
├─────────────────────────────────────────────────────────────┤
│                    APPS SCRIPT SERVICES                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Forms    │ │ Report   │ │Automation│ │ Column   │        │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐             │
│  │   CF     │ │ Contact  │ │   Utilities      │             │
│  │ Service  │ │ Service  │ │ (Lock, Log, Auth)│             │
│  └──────────┘ └──────────┘ └──────────────────┘             │
├─────────────────────────────────────────────────────────────┤
│                    GOOGLE APIs                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Google Sheets│ │  Gmail API   │ │ Google Drive │        │
│  │     API      │ │              │ │     API      │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
User Action → Frontend Module → API Client (fetch) → 
Apps Script doPost/doGet → Service Layer → Google APIs → 
Response → Frontend Render
```

### 3.3 Authentication Flow

```
1. User mở app → kiểm tra token trong localStorage
2. Nếu không có → redirect OAuth consent screen
3. User đồng ý → nhận authorization code
4. Apps Script exchange code → access token
5. Lưu token vào Script Properties
6. Mọi request sau đều kèm Bearer token
```

---

## 4. 🎨 THIẾT KẾ UI/UX & LAYOUT

### 4.1 Tổng thể Layout Desktop

```
┌─────────────────────────────────────────────────────────────┐
│ 🧭 TOOLBAR: [Menu] [Search] [Sync] [User]                  │
├─────────────────────────────────────────────────────────────┤
│  📂      │  📊 MAIN SHEET AREA                 │ 🔧 DETAILS │
│  SIDE    │  ┌──────┬──────┬──────┬──────┐     │            │
│  BAR     │  │ Col A│ Col B│ Col C│ Col D│     │ Properties │
│  ─────── │  ├──────┼──────┼──────┼──────┤     │ - Type     │
│  Projects│  │      │      │      │      │     │ - Format   │
│  Sheets  │  ├──────┼──────┼──────┼──────┤     │ - Rules    │
│  Reports │  │      │      │      │      │     │            │
│          │  ├──────┼──────┼──────┼──────┤     │ 📝 Comments│
│          │  │      │      │      │      │     │            │
│          │  └──────┴──────┴──────┴──────┘     │            │
│          │  [📊 Sheet1] [Sheet2] [Sheet3] +  │            │
│          │  📈 Records: 150 | 🔄 Connected   │            │
├──────────┴─────────────────────────────────────┴────────────┤
│  ⚡ ACTION BAR: [+] New Row [🔍 Filter] [📊 Report] [⚙️ Auto]│
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Responsive Breakpoints

| Thiết bị | Breakpoint | Layout | Ghi chú |
|----------|-----------|--------|---------|
| Desktop | ≥ 1024px | Full 3-panel | Toolbar + Sheet + Details |
| Tablet | 768-1023px | 2-panel | Sidebar ẩn, details dạng overlay |
| Mobile | < 768px | 1-panel | Card-based, bottom sheets |

### 4.3 Design Tokens

```css
/* Typography */
--font-h1: 24px/1.2 'Inter', sans-serif;
--font-h2: 20px/1.3 'Inter', sans-serif;
--font-body: 14px/1.5 'Inter', sans-serif;
--font-caption: 12px/1.4 'Inter', monospace;

/* Spacing */
--space-xs: 4px;  --space-sm: 8px;  --space-md: 12px;
--space-lg: 16px; --space-xl: 24px; --space-xxl: 32px;

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 25px rgba(0,0,0,0.15);
```

### 4.4 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Tìm kiếm |
| `Ctrl+Home` | Về dashboard |
| `Tab` | Next cell |
| `Shift+Tab` | Previous cell |
| `Ctrl+S` | Save / Sync |
| `Ctrl+Shift+F` | Mở Forms dialog |

---

## 5. 🔧 6 CORE FEATURE SPECIFICATIONS

### 5.1 Forms — Modal tạo/sửa hàng

**Mô tả:** Modal form để tạo mới hoặc chỉnh sửa một hàng trong sheet.

```
┌─────────────────────────────────────────┐
│  ➕ Thêm hàng mới                    ✕  │
├─────────────────────────────────────────┤
│  📝 Tên             [________________]  │
│  📧 Email           [________________]  │
│  📅 Ngày sinh       [____/__/____]      │
│  💰 Lương           [______________] VND│
│  🏢 Phòng ban       [▼ Phòng Kỹ thuật]  │
│  ✅ Trạng thái      [☐ Hoạt động]       │
│                                         │
│  ┌──────────┐    ┌──────────┐           │
│  │   Hủy    │    │   Lưu    │           │
│  └──────────┘    └──────────┘           │
└─────────────────────────────────────────┘
```

**Validation:**
- Email: regex `^[^@]+@[^@]+\.[^@]+$`
- Required fields: đánh dấu đỏ nếu trống
- Số: range check (0-100000000)
- Ngày: format DD/MM/YYYY

**API:**
```
POST /script/executor
{ "service": "FormsService", "action": "saveRow",
  "sheetId": "...", "data": { columns: [...], values: [...] } }
```

### 5.2 Publish Report Builder

**Mô tả:** Builder báo cáo với filter, group-by, aggregate, export.

```
┌───────────────────────────────────────────────┐
│ 📊 Publish Report Builder                      │
├───────────────────────────────────────────────┤
│ 1. Chọn Sheet:  [▼ Doanh thu 2025]            │
│                                                │
│ 2. Filter:                                     │
│    [AND] ┌─────────────────────────────┐       │
│          │ Phòng ban = "Kỹ thuật"     │       │
│          │ Và  Ngày >= "01/01/2025"   │       │
│          └─────────────────────────────┘       │
│                                                │
│ 3. Group By: [▼ Phòng ban]                     │
│ 4. Aggregate: [SUM] [▼ Doanh thu]             │
│                                                │
│ 5. Export: [📊 Excel] [📄 PDF] [🌐 HTML]     │
│                                                │
│ ┌──────────┐    ┌──────────┐                   │
│ │  Preview │    │ Save As  │                   │
│ └──────────┘    └──────────┘                   │
└───────────────────────────────────────────────┘
```

**API:**
```
POST /script/executor
{ "service": "ReportService", "action": "generateReport",
  "sheetId": "...", "config": {
    "filters": [...], "groupBy": "...",
    "aggregate": { "type": "SUM", "column": "..." },
    "format": "excel"|"pdf"|"html"
  }
}
```

### 5.3 Automation MVP

**Mô tả:** Workflow trigger → action cho tác vụ tự động.

```
┌─────────────────────────────────────────────┐
│ 🤖 Automation Builder                       │
├─────────────────────────────────────────────┤
│ Trigger:                                    │
│ ○ Lịch trình: [📅 Hàng ngày] lúc [08:00]   │
│ ○ Ô thay đổi: [▼ Cột Status] = "Done"      │
│ ○ Hàng mới: [khi thêm hàng]                │
│                                             │
│ Action:                                     │
│ ○ Gửi email: [template B] đến [▼ Email]    │
│ ○ Cập nhật ô: [▼ Cột] = [Giá trị]          │
│ ○ Log lịch sử: [☐ Bật log]                 │
│                                             │
│ ┌──────────┐    ┌──────────┐               │
│ │  Enable  │    │   Stop   │               │
│ └──────────┘    └──────────┘               │
└─────────────────────────────────────────────┘
```

**API:**
```
POST /script/executor
{ "service": "AutomationService", "action": "createPolicy",
  "trigger": { "type": "schedule"|"cellChange"|"rowAdded",
    "config": {...} },
  "action": { "type": "email"|"updateCell"|"log",
    "config": {...} }
}
```

### 5.4 Column Types Config Modal

**Mô tả:** Type selector và config modal cho cột.

```
┌─────────────────────────────────────────────┐
│ 🎨 Cấu hình cột                             │
├─────────────────────────────────────────────┤
│ Tên cột: [Nhân viên            ]            │
│ Kiểu dữ liệu: [▼ Dropdown]                  │
│                                             │
│ ┌─── Định dạng ──────────────────────┐     │
│ │  ○ VND  ○ USD  ● Custom: ₫        │     │
│ └─────────────────────────────────────┘     │
│ ┌─── Validation ─────────────────────┐     │
│ │  [☐ Bắt buộc]                     │     │
│ │  [☐ Email]  [☐ Số dương]         │     │
│ └─────────────────────────────────────┘     │
│                                             │
│ Metadata JSON:                               │
│ {"description": "ID nhân viên",             │
│  "options": ["Option A","Option B"]}        │
│                                             │
│ ┌──────────┐    ┌──────────┐               │
│ │   Hủy    │    │   Lưu    │               │
│ └──────────┘    └──────────┘               │
└─────────────────────────────────────────────┘
```

**Các kiểu dữ liệu hỗ trợ:**
| Type | Config | Format |
|------|--------|--------|
| Text | Max length, regex | — |
| Number | Min, max, decimal | VN/US |
| Date | Format picker | DD/MM/YYYY |
| Currency | Symbol, decimal | VND/USD |
| Percent | Decimal places | % |
| Dropdown | Options list | Enum |
| Checkbox | Default state | ☐/☑ |
| Symbols | Icon picker | 😊⭐ |

### 5.5 Conditional Formatting Builder

**Mô tả:** Rules tô màu phía trước, áp dụng trên hàng/cột/cells.

```
┌─────────────────────────────────────────────┐
│ 🎨 Conditional Formatting                   │
├─────────────────────────────────────────────┤
│ Danh sách rules:                            │
│                                             │
│ #1 [Hiện] Nếu [Status] = "Done"            │
│    → nền: 🟢 #90EE90, chữ: đậm            │
│ #2 [Hiện] Nếu [Doanh thu] > 10000000       │
│    → nền: 🔴 #FFCCCB, chữ: trắng           │
│ #3 [Ẩn ] Nếu [Ngày] < HÔM NAY              │
│    → border: 🔶 cam 2px                    │
│                                             │
│ ┌──────────┐    ┌──────────┐               │
│ │ Thêm rule│    │ Lưu rules│               │
│ └──────────┘    └──────────┘               │
└─────────────────────────────────────────────┘
```

**Priority:** Rules áp dụng từ trên xuống dưới. Rule đầu tiên match → dừng.

**API:**
```
POST /script/executor
{ "service": "CFService", "action": "saveRules",
  "sheetId": "...", "rules": [
    { "scope": "row"|"column"|"cell",
      "condition": { "column": "...", "operator": "equals"|">"|"<"|"contains",
        "value": "..." },
      "format": { "background": "#90EE90", "bold": true, "color": "..." }
    }
  ]
}
```

### 5.6 Contact Column Widget

**Mô tả:** Dropdown/combo widget với multi-select, contacts từ danh sách.

```
┌─────────────────────────────────────────────┐
│ 📇 Contact Column                           │
├─────────────────────────────────────────────┤
│                                             │
│  [👤 Nguyễn Văn A ✕] [👤 Trần Thị B ✕]    │
│                                             │
│  ┌─── Chọn contact ───────────────────┐     │
│  │ 🔍 Tìm kiếm...    [🔎]            │     │
│  │ ───────────────────────────────── │     │
│  │ ☐ 👤 Nguyễn Văn A — a@email.com │     │
│  │ ☑ 👤 Trần Thị B — b@email.com   │     │
│  │ ☐ 👤 Lê Văn C — c@email.com     │     │
│  │ ───────────────────────────────── │     │
│  │ [+ Thêm contact mới]             │     │
│  └─────────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

**Nguồn contacts:** Sheet ẩn `_Contacts` (chỉ dự án)
- Columns: Name, Email, AddedAt, AddedBy
- Validation: regex email + uniqueness check
- Multi-select: chips hiển thị, ✕ để xóa

---

## 6. 📡 API DESIGN (APPS SCRIPT)

### 6.1 REST-like API Pattern

Tất cả endpoints qua `doGet`/`doPost`, parameter JSON:

**Request:**
```http
POST /script/folder/executor
Content-Type: application/json
Authorization: Bearer <OAuth-token>

{
  "service": "FormsService",
  "action": "saveRow",
  "sheetId": "123456",
  "data": {
    "columns": ["Tên", "Email", "Phòng ban"],
    "values": ["Test User", "test@example.com", "Kỹ thuật"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "rowId": "row_987",
  "error": null
}
```

### 6.2 Service Endpoints

#### FormsService
```
saveRow(sheetId, data) → { success, rowId, error }
getRow(sheetId, rowId) → { success, row, error }
deleteRow(sheetId, rowId) → { success, error }
```

#### ReportService
```
generateReport(sheetId, config) → { success, url, error }
getReportTemplates() → { success, templates, error }
saveTemplate(name, config) → { success, error }
```

#### AutomationService
```
createPolicy(sheetId, trigger, action) → { success, policyId, error }
listPolicies(sheetId) → { success, policies, error }
togglePolicy(policyId, enable) → { success, error }
```

#### ColumnService
```
getTypes() → { success, types, error }
changeColumnType(sheetId, colId, type, config) → { success, error }
getColumnConfig(sheetId, colId) → { success, config, error }
```

#### CFService
```
saveRules(sheetId, rules) → { success, error }
getRules(sheetId) → { success, rules, error }
applyRules(sheetId) → { success, affectedRows, error }
```

#### ContactService
```
findContact(query) → { success, contacts, error }
saveContact(name, email) → { success, id, error }
getKnownContacts(sheetId) → { success, contacts, error }
```

---

## 7. 🔐 OAUTH & SECURITY DESIGN

### 7.1 OAuth Flow (Apps Script)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  User    │───▶│  Frontend    │───▶│ Apps Script  │
│ Browser  │    │  (SPA)       │    │  Backend     │
└──────────┘    └──────────────┘    └──────┬───────┘
       ▲                                    │
       │                                    ▼
       │                           ┌──────────────┐
       └───────────────────────────│ Google OAuth │
               Redirect URI        │  Consent      │
                                   │  Screen       │
                                   └──────────────┘
```

**Steps:**
1. Service Account (installed trong Script Editor)
2. Scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/drive.file`
3. User Consent → browser popup
4. Token Store → `PropertiesService.getScriptProperties()`

### 7.2 Security Measures

| Biện pháp | Mô tả |
|-----------|-------|
| Token validation | Kiểm tra Bearer token mỗi request |
| Rate limiting | 60s cooldown giữa các trigger |
| Input sanitization | Chống XSS, SQL injection |
| HTTPS only | Tất cả request qua TLS |
| Audit logging | Ghi log mọi hành động quan trọng |
| LockService | Chống race condition khi write |

---

## 8. 🛠 TECH STACK & CONSTRAINTS

### 8.1 Frontend

| Công nghệ | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| HTML5 | — | Single-page app |
| CSS3 | — | Flexbox/Grid, responsive |
| JavaScript (ES6+) | — | Vanilla JS, modules |
| localStorage | — | State management |
| IndexedDB | — | Offline data cache |
| fetch API | — | HTTP client |
| node --check | — | Syntax verification |

**Constraints:**
- ✅ Single-page HTML + vanilla JS (không framework)
- ✅ Hỗ trợ offline cơ bản (localStorage)
- ✅ Responsive (mobile + desktop)
- ❌ Không phụ thuộc React/Vue/Angular

### 8.2 Backend

| Công nghệ | Ghi chú |
|-----------|---------|
| Google Apps Script | Chỉ có doPost/doGet |
| LockService | Tính toàn vẹn data |
| PropertiesService | Lưu token, config |

**Quota:**
- 1M runtime mỗi 2 phút
- 5.000 API calls mỗi ngày
- → Cần batch operations

**Constraints:**
- ❌ Không dùng Google Drive API upload tài liệu

### 8.3 Data Storage

| Loại | Công nghệ | Ghi chú |
|------|-----------|---------|
| Primary | Google Sheets | Bảng `data` |
| Metadata | Apps Script Properties | Config, token |
| Logging | Sheet `logs` | Chỉ khi cần |
| Cache | localStorage (FE) | Offline |

---

## 9. 📊 TEST COVERAGE DESIGN

### 9.1 Test Cases per Feature

#### Forms
| TC ID | Mô tả | Expected |
|-------|-------|----------|
| TC-F-01 | Tạo row hợp lệ | ✅ PASS |
| TC-F-02 | Thiếu required field | ❌ FAIL (validation) |
| TC-F-03 | Email sai format | ❌ FAIL (validation) |
| TC-F-04 | Submit form trống | ❌ FAIL |
| TC-F-05 | Sửa row existing | ✅ PASS |

#### Report Builder
| TC ID | Mô tả | Expected |
|-------|-------|----------|
| TC-R-01 | Chọn sheet + filter đơn giản | ✅ PASS |
| TC-R-02 | Aggregate SUM | ✅ PASS |
| TC-R-03 | Export Excel | ✅ PASS |
| TC-R-04 | Export PDF | ✅ PASS |
| TC-R-05 | Save/load template | ✅ PASS |
| TC-R-06 | Group by + aggregate | ✅ PASS |

#### Automation
| TC ID | Mô tả | Expected |
|-------|-------|----------|
| TC-A-01 | Tạo schedule trigger | ✅ PASS |
| TC-A-02 | Action gửi email | ✅ PASS |
| TC-A-03 | Update cell tự động | ✅ PASS |
| TC-A-04 | Log history | ✅ PASS |
| TC-A-05 | Tắt/bật policy | ✅ PASS |

#### Column Types
| TC ID | Mô tả | Expected |
|-------|-------|----------|
| TC-C-01 | Number (VN/US) | ✅ PASS |
| TC-C-02 | Date (VN format) | ✅ PASS |
| TC-C-03 | Currency (VND/USD) | ✅ PASS |
| TC-C-04 | Dropdown (enum) | ✅ PASS |
| TC-C-05 | Checkbox | ✅ PASS |
| TC-C-06 | Đổi type cột có data | ✅ PASS |

#### Conditional Formatting
| TC ID | Mô tả | Expected |
|-------|-------|----------|
| TC-CF-01 | Row rule | ✅ PASS |
| TC-CF-02 | Column rule | ✅ PASS |
| TC-CF-03 | Cell rule | ✅ PASS |
| TC-CF-04 | Multiple rules priority | ✅ PASS |
| TC-CF-05 | Saved filter | ✅ PASS |

#### Contact Column
| TC ID | Mô tả | Expected |
|-------|-------|----------|
| TC-CO-01 | Chọn single contact | ✅ PASS |
| TC-CO-02 | Multi-select chips | ✅ PASS |
| TC-CO-03 | Nút "Tôi" (current user) | ✅ PASS |
| TC-CO-04 | Validation email format | ❌ FAIL |
| TC-CO-05 | Add/edit known contact | ✅ PASS |
| TC-CO-06 | Search contact | ✅ PASS |

### 9.2 Regression Test Checklist

| Kiểm tra | Mô tả |
|----------|-------|
| 🔄 Sheet load v18 features | Grid, cell edit, filter, sort |
| 🔄 OAuth không bị break | Token vẫn hoạt động |
| 🔄 Console sạch | 0 lỗi JS |
| 🔄 Responsive layout | Desktop + mobile |
| 🔄 Sync/refresh data | Không mất data |

---

## 10. 📁 CẤU TRÚC THƯ MỤC

```
📁 DU AN WED QUAN LY/          ← Lưu tại E: hoặc G:
├── 📄 PROJECT_OPERATION_CENTER.md   ← Dashboard
├── 📄 QUY_TRINH_BAN_GIAO_SAN_PHAM.md ← SOP bàn giao
│
├── 📁 01_BAN_QLDA/                   ← Ban QLDA (Claude)
│   ├── 📄 DESIGN_MAIN.md            ← File này (spec chính)
│   ├── 📄 SO_GIAO_VIEC.md           ← Sổ giao việc
│   ├── 📄 SO_NGHIEM_THU.md          ← Sổ nghiệm thu
│   ├── 📄 CLAUDE_NHIEM_VU.md        ← Nhiệm vụ Claude
│   └── 📄 PLANNING.md               ← Kế hoạch
│
├── 📁 02_TU_VAN_THIET_KE/           ← Tư vấn Thiết kế
│   ├── 📄 BAN_GIAO.md               ← Biên bản bàn giao SPEC
│   ├── 📄 CONG_VIEC.md              ← Việc của Tư vấn
│   └── 📁 SPEC/                     ← SPEC chi tiết từng feature
│
├── 📁 03_NHA_THAU_THI_CONG/         ← Nhà thầu (Quan)
│   ├── 📄 BAN_GIAO.md               ← Biên bản bàn giao code (5 mục)
│   ├── 📄 CONG_VIEC.md              ← Danh sách việc
│   ├── 📁 FRONTEND/                 ← Code UI
│   ├── 📁 BACKEND/                  ← Code Apps Script
│   └── 📁 STAGING/                  ← File staging chờ nghiệm thu
│
├── 📁 04_GIAM_SAT_NGHIEM_THU/      ← QA
│   ├── 📄 BIEN_BAN_NGHIEM_THU.md    ← Biên bản nghiệm thu
│   └── 📄 BAO_CAO_QA.md             ← Báo cáo QA
│
├── 📁 05_THI_CONG/                  ← Thi công
│   ├── 📁 BASELINE/                 ← Bản đã nghiệm thu
│   └── 📁 UPLOAD/                   ← Script upload
│
└── 📁 05_TRIEN_KHAI/               ← Triển khai
    ├── 📄 DEPLOY_LOG.md
    └── 📄 RELEASE_NOTE.md
```

---

## 11. ⚠️ NOTES & CAVEATS

1. **OAuth setup critical** — thiếu Service Account → chỉ read-only, không code Automation được
2. **Data versioning** — số dòng được log theo mỗi commit
3. **Rate limits** — Apps Script quota: 60s cooldown mỗi trigger
4. **Multiple browser sessions** — localStorage conflict → cần thông báo
5. **Offline** — "File parameter is null" khi submit offline → cần test kết nối
6. **G: Drive sync** — Google Drive for Desktop có thể delay → chờ sync xong mới deploy

---

## 12. 🚀 DELIVERY INSTRUCTIONS

1. **Chạy script setup** (trong `05_THI_CONG/UPLOAD/` → `setup.sh`)
2. **Add Service Account** credentials (JSON) vào Apps Script → Script Properties
3. **Open Google Sheet** để lưu data (tên mẫu: `DU AN WED QLDA - Data`)
4. **Code Frontend:** branch `frontend`
5. **Code Backend:** branch `backend`
6. **Test:** `node --check` + localhost:8000 → console sạch
7. **Submit:** staging + biên bản 5 mục → `03_NHA_THAU_THI_CONG/STAGING/`
8. **Baseline:** chỉ copy sau khi QA ký ĐẠT

---

## 📌 CHECKLIST THIẾT KẾ

| Hạng mục | Trạng thái |
|----------|-----------|
| ✅ Mục tiêu hệ thống đã định nghĩa | ✅ |
| ✅ SmartSheet platform reference | ✅ |
| ✅ Kiến trúc tổng thể (High-level) | ✅ |
| ✅ UI/UX layout & design system | ✅ |
| ✅ 6 Core feature specs (Forms, Report, Automation, Column Types, CF, Contact) | ✅ |
| ✅ API design (request/response mẫu) | ✅ |
| ✅ OAuth flow & security | ✅ |
| ✅ Constraints & Tech Stack | ✅ |
| ✅ Test cases (6 features + regression) | ✅ |
| ✅ Cấu trúc thư mục | ✅ |
| ✅ Delivery instructions | ✅ |

---

> 🔑 **Design Main hoàn chỉnh** — dùng làm spec trung tâm cho toàn bộ dự án.
> 🔧 **Nhà thầu** code theo spec này, không cần hỏi thêm.
> 🧪 **QA** test theo test cases trong mục 9.
> 🚀 **Delivery** → staging + biên bản → nghiệm thu → deploy.

---

*Tài liệu này được lưu tại:*
  - *`E:\My Drive\DU AN WED QUAN LY\01_BAN_QLDA\DESIGN_MAIN.md` (ưu tiên)*
  - *`G:\My Drive\DU AN WED QUAN LY\01_BAN_QLDA\DESIGN_MAIN.md` (dự phòng)*
