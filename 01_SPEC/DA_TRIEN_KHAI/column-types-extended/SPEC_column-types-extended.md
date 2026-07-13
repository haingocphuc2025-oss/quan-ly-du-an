# SPEC: Bổ sung Column Types mới + Cấu hình Contact list/Checkbox/Symbols (Duration, Auto Number, System columns)

> **TRẠNG THÁI CHÍNH THỨC:** ĐÃ TRIỂN KHAI  
> Vị trí thư mục là nguồn trạng thái chính thức. Các dòng “chưa duyệt”, đường dẫn cũ và baseline cũ bên dưới chỉ là lịch sử tại thời điểm soạn spec. Baseline hiện hành: **v25**.

> **Trạng thái:** 🟡 Nháp — chờ Ban QLDA duyệt
> **Version:** v1.0
> **Ngày tạo:** 2026-07-11
> **Người viết:** Claude (AI Assistant)
> **Dự án:** DU AN WEB QUAN LY — Sprint v24 (Feature: Column Types mở rộng)
> **Tham chiếu:** 5 screenshot Column Type config của Smartsheet do Quan cung cấp (danh sách type, Contact list, Checkbox, Symbols, Auto number)

---

## 0. Tóm tắt thay đổi (Summary)

| Mục | Nội dung |
|-----|----------|
| **Vấn đề** | Column Type picker hiện tại (v23) chỉ có **9 loại**: Text/Number, Dropdown, Date, Contact, Checkbox, Symbols, Currency, Number, Percent. Thiếu các loại theo chuẩn Smartsheet: Duration, Auto Number, Created by, Created date, Modified by, Modified date, Latest Comment. Ngoài ra, 3 loại **Contact list / Checkbox / Symbols đã có nhưng thiếu màn cấu hình** (style, restrict, quản lý danh sách/bộ giá trị ngay trong column settings). |
| **Giải pháp** | Thêm 6 loại cột mới (Duration, Auto Number, 4 System columns) + bổ sung màn cấu hình cho Contact list, Checkbox, Symbols. Loại thứ 7 (Latest Comment) **hoãn lại** — phụ thuộc tính năng Comment chưa tồn tại (xem mục 1.3). |
| **Phạm vi** | Sửa file `giao-dien-desktop-don-gian_v23_quan.html` (baseline v23, 9403 dòng). Không đụng Apps Script backend, trừ phần lưu thêm field `rowMeta` (đã có cơ chế lưu sẵn qua `scheduleSheetDataSave`). |
| **Baseline** | v23 (9403 dòng) — đã có `getColumnConfig()`, `ensureSheetColumnConfigs()`, `Formatters` object, `openColumnTypePicker()`. |
| **Target** | v24 (sau khi duyệt SPEC này). |

---

## 1. Bối cảnh & Vấn đề (Context & Problem)

### 1.1 Danh sách type hiện tại (Baseline v23)

Trong `openColumnTypePicker()` (dòng ~6958), mảng `types` đang có:

```js
const types = [
  ['text','A1 Text/Number'], ['dropdown','≡ Dropdown list'], ['date','📅 Date'],
  ['contact','👤 Contact list'], ['checkbox','☑ Checkbox'], ['symbols','★ Symbols'],
  ['currency','₫ Currency'], ['number','# Number'], ['percent','% Percentage']
];
```

Lưu ý: `multi-select` đã được nhắc trong danh sách loại trừ ở `isEditableSheetCell()` (dòng 4934) nhưng **chưa** có trong picker → chưa dùng được thật, không thuộc phạm vi SPEC này.

### 1.2 So sánh với reference (Smartsheet)

| # | Loại (Smartsheet) | Đang có ở app? | Ghi chú |
|---|---|---|---|
| 1 | Text/Number | ✅ | |
| 2 | Dropdown list | ✅ | |
| 3 | Date | ✅ | |
| 4 | **Duration** | ❌ | **Thêm trong SPEC này** |
| 5 | Contact list | ✅ | |
| 6 | Checkbox | ✅ | |
| 7 | Symbols | ✅ | |
| 8 | **Auto number** | ❌ | **Thêm trong SPEC này** |
| 9 | **Created by** | ❌ | **Thêm trong SPEC này** |
| 10 | **Created date** | ❌ | **Thêm trong SPEC này** |
| 11 | Latest Comment | ❌ (xám trong ảnh gốc) | **Hoãn** — xem 1.3 |
| 12 | **Modified by** | ❌ | **Thêm trong SPEC này** |
| 13 | **Modified date** | ❌ | **Thêm trong SPEC này** |
| — | Currency/Number/Percent | ✅ | App có thêm 3 loại này ngoài chuẩn Smartsheet — giữ nguyên, hữu ích cho dự toán XD |

### 1.3 Vì sao "Latest Comment" bị hoãn

Ngay trong ảnh gốc, Smartsheet cũng để mục này ở dạng **xám/disabled** — thường vì sheet chưa bật tính năng comment. App hiện tại **chưa có hệ thống comment thật** (chỉ có nút 💬 trên toolbar, chưa gắn logic — dòng 2050). Thêm loại cột này bây giờ sẽ tạo ra 1 cột luôn rỗng, không có giá trị thực tế.

→ **Đề xuất:** để "Latest Comment" ở Phase sau, sau khi có SPEC riêng cho tính năng Comment per-row.

### 1.4b Contact list — đã có nhưng thiếu màn cấu hình (screenshot 2)

Reference screenshot 2 (Smartsheet) cho thấy khi chọn type "Contact list", có 1 màn cấu hình riêng với:
- Toggle **"Allow multiple contacts per cell"**
- Toggle **"Restrict to list values only"**
- Ô tìm kiếm **"Add contacts"** để build sẵn danh sách contact được phép chọn cho cột đó

Đối chiếu code hiện tại (`showContactPicker()`, dòng ~7268, và `getColumnConfig()`):

| Tính năng trong ảnh | Đang có ở app? | Ghi chú |
|---|---|---|
| Chọn nhiều contact/ô | ⚠️ Có phần nền (`maxContacts` trong `colConfig`) | Nhưng **không có UI** để user tự bật/tắt hay chỉnh số lượng — chỉ set cứng trong code (`SHEET_COLUMN_CONFIG`, vd cột `nguoiPhuTrach` có `maxContacts:5`). Cột contact tự tạo qua `openColumnTypePicker()` mặc định `maxContacts = 1`, không đổi được. |
| Giới hạn chỉ chọn trong danh sách có sẵn | ❌ Chưa có | `showContactPicker()` luôn cho phép "Thêm mới" (ad-hoc), không có cờ nào chặn việc này. |
| Quản lý danh sách contact riêng cho từng cột | ⚠️ Có phần nền (`knownContacts` per-column) | Nhưng cũng chỉ set cứng qua code, không có UI để user tự thêm/bớt contact cho *cột này* — hiện `showContactPicker()` dùng chung `PROJECT_CONTACTS` (danh sách toàn cục) làm mặc định. |

→ Cần bổ sung **UI cấu hình** ngay trong `openColumnTypePicker()` khi chọn type `contact`, tương tự cách hiện tại đang show `<textarea>` tuỳ chọn khi chọn `dropdown`.

### 1.4c Checkbox & Symbols — đã có nhưng thiếu màn cấu hình (screenshot 4, 5)

**Checkbox** (`toggleCheckboxCell()`, dòng ~8130): hiện chỉ lưu `''`/`'true'`, luôn hiển thị 1 kiểu icon cố định (✓), không có style khác, không có cờ nào chặn việc gõ/paste giá trị khác vào cell. Reference cho thấy Smartsheet cho chọn style (✓/🚩/⭐) + toggle "Restrict to checkbox use only".

**Symbols** (`showSymbolsPicker()`, dòng ~8142): `colConfig.symbols` đã là mảng cấu hình được, nhưng **không có UI chọn bộ symbol** — phải set cứng trong code, không có preset nào dựng sẵn. Reference cho thấy Smartsheet có ~9 bộ preset (RYG, Flag, Priority, Harvey ball, Progress bar, mũi tên xu hướng...) + toggle "Restrict to symbol values only".

→ Sau khi trao đổi, Quan chỉ cần bộ **RYG** (🔴🟡🟢, dùng cho trạng thái hồ sơ/tiến độ) — không cần 8 bộ còn lại của Smartsheet.

### 1.4 Vấn đề kỹ thuật cốt lõi: chưa có "định danh người dùng"

`Created by` / `Modified by` cần biết **ai** đang thao tác. Hiện tại app:
- Có Google Sign-In (`accounts.google.com/gsi/client`) nhưng **chỉ dùng cho OAuth upload Drive API trực tiếp** (dòng 6629 `requestDriveSignIn()`), không phải định danh chung toàn app.
- Không có biến `currentUser`/`userName` nào được lưu lại để dùng chung.

→ SPEC này phải bổ sung **1 cơ chế định danh nhẹ** (xem FR-00) trước khi Created by/Modified by có ý nghĩa.

---

## 2. Yêu cầu chức năng (Functional Requirements)

| ID | Yêu cầu | Mức độ | Ghi chú |
|----|---------|--------|---------|
| **FR-00** | **Cơ chế định danh người dùng nhẹ**: Khi app load lần đầu (chưa có tên lưu), hiện popup nhỏ hỏi "Tên của bạn là gì?" → lưu vào `localStorage['appUserName']`. Có nút đổi tên ở góc app (vd trong sidebar/profile). | **P0 (Must)** | Không cần login thật, chỉ cần 1 chuỗi tên hiển thị (giống cách Google Sheets hỏi tên khi share ẩn danh). Value này dùng chung cho Created by/Modified by. |
| **FR-01** | **Duration**: Loại cột nhập khoảng thời gian. Click vào cell mở popover (giống `showDatePicker`) với 2 input nhỏ: số ngày + số giờ. Giá trị cell lưu dạng **số phút nguyên** (vd `"3160"` = 2 ngày 4 giờ), hiển thị rút gọn qua `Formatters.duration()` → `"2d 4h"` (hoặc `"4h 30m"` nếu < 1 ngày). | **P0 (Must)** | Không cần field phụ trong `colConfig` — value nằm ngay trong cell như các type khác. |
| **FR-02** | **Auto Number**: Loại cột tự sinh số thứ tự, **read-only** (không cho sửa tay). Khi thêm row mới → tự động gán số kế tiếp. Cấu hình qua popup khi chọn type: `prefix` (vd "HS-"), **`suffix`** (vd "-2026"), `số bắt đầu` (Starting number), `số chữ số` (Numerical places — chọn qua dropdown 0-6 thay vì gõ tay). Popup có dòng **Preview** cập nhật trực tiếp khi Quan gõ (vd `HS-0004-2026`). | **P0 (Must)** | Giá trị lưu vào cell như text bình thường, không cần công thức động — chỉ tính 1 lần khi tạo row. |
| **FR-03** | **Created by** (system): Read-only. Khi row được tạo → lưu tên người tạo (từ `appUserName`, FR-00) vào `rowMeta[rowIndex].createdBy`. Cột hiển thị giá trị này, không cho sửa. | **P0 (Must)** | Với các row đã tồn tại trước khi có tính năng này → hiển thị "—" (không suy đoán ngược). |
| **FR-04** | **Created date** (system): Read-only. Lưu timestamp lúc tạo row vào `rowMeta[rowIndex].createdAt`. Hiển thị theo format ngày giờ VN (dd/mm/yyyy hh:mm). | **P0 (Must)** | Cùng cơ chế lưu với FR-03. |
| **FR-05** | **Modified by** (system): Read-only. Mỗi khi **bất kỳ cell nào trong row** bị sửa → cập nhật `rowMeta[rowIndex].modifiedBy = appUserName`. | **P1 (Should)** | Không tính sửa cấu trúc cột (đổi tên cột, đổi type) là "modify row". Chỉ tính sửa giá trị cell. |
| **FR-06** | **Modified date** (system): Read-only. Cùng lúc với FR-05, cập nhật `rowMeta[rowIndex].modifiedAt = Date.now()`. | **P1 (Should)** | |
| **FR-07** | **Cập nhật `openColumnTypePicker()`**: thêm 6 entry mới vào mảng `types`, đúng thứ tự như Smartsheet: Text/Number → Dropdown → Date → **Duration** → Contact → Checkbox → Symbols → Currency → Number → Percent → **Auto number** → **Created by** → **Created date** → **Modified by** → **Modified date**. | **P0 (Must)** | Với 4 loại system (Created by/date, Modified by/date) — khi chọn, ẩn luôn phần "Tuỳ chọn dropdown" vì không áp dụng. |
| **FR-08** | **Khoá edit cho cột read-only**: cập nhật `isEditableSheetCell()` — thêm `auto_number`, `created_by`, `created_date`, `modified_by`, `modified_date` vào danh sách loại trừ (giống cách `dropdown`, `checkbox` đang bị chặn). | **P0 (Must)** | Double-click vào các cell này sẽ không mở editor. |
| **FR-09** | **`Formatters` + `columnTypeIcon`**: thêm hàm format hiển thị và icon cho từng type mới (`duration`, `auto_number`, `created_by`, `created_date`, `modified_by`, `modified_date`). | **P0 (Must)** | Icon gợi ý: Duration `⏱`, Auto number `#`, Created by `👤+`, Created date `📅+`, Modified by `✎👤`, Modified date `✎📅` (Quan có thể đổi icon theo ý thích khi review). |
| **FR-10** | **Màn cấu hình Contact list trong `openColumnTypePicker()`**: khi chọn type `contact`, hiện thêm khối cấu hình (giống cách `dropdown` hiện `<textarea>` options) gồm: toggle "Cho phép nhiều contact/ô" (bật → hiện thêm ô nhập số lượng tối đa, mặc định 5 nếu bật, 1 nếu tắt), toggle "Chỉ giới hạn trong danh sách" (mặc định tắt = giữ hành vi cũ, cho thêm ad-hoc). | **P1 (Should)** | Lưu vào `colConfig.maxContacts` và `colConfig.restrictToList` (field mới). |
| **FR-11** | **Quản lý danh sách contact riêng theo cột**: trong cùng màn cấu hình FR-10, thêm ô tìm kiếm + nút "Thêm" để build `colConfig.knownContacts` riêng cho cột đó (khác `PROJECT_CONTACTS` toàn cục). Nếu để trống → fallback dùng `PROJECT_CONTACTS` như hiện tại (không phá vỡ cột cũ). | **P1 (Should)** | Tái dùng UI list + search đã có sẵn trong `showContactPicker()`, chỉ đổi ngữ cảnh từ "chọn giá trị cho cell" sang "chọn danh sách cho phép của cột". |
| **FR-12** | **Enforce "Restrict to list values only"**: khi `colConfig.restrictToList === true`, `showContactPicker()` phải **ẩn nút "Thêm mới"** (ad-hoc add) — chỉ cho chọn từ `knownContacts`/`PROJECT_CONTACTS`. | **P1 (Should)** | Đây là thay đổi hành vi trong `showContactPicker()` hiện tại — cần kiểm tra kỹ để không phá các cột contact đang dùng ở project khác (mặc định `restrictToList = false` cho cột cũ). |
| **FR-13** | **Màn cấu hình Checkbox**: khi chọn type `checkbox` trong `openColumnTypePicker()`, hiện thêm: chọn Style (3 nút icon: ✓ check / 🚩 flag / ⭐ star, mặc định check) → lưu `colConfig.checkboxStyle`; toggle "Restrict to checkbox use only" → lưu `colConfig.restrictToToggle`. `toggleCheckboxCell()` và render cell dùng `checkboxStyle` để hiển thị đúng icon thay vì cố định ✓. | **P1 (Should)** | Khi `restrictToToggle = true`, cell chỉ đổi giá trị qua click toggle — không mở contenteditable (tương tự `isEditableSheetCell()` đã chặn `checkbox` sẵn, chỉ cần đảm bảo paste cũng bị chặn). |
| **FR-14** | **Màn cấu hình Symbols — bộ RYG**: khi chọn type `symbols`, hiện picker chọn bộ giá trị — **chỉ 1 bộ dựng sẵn: RYG** (🔴 Đỏ / 🟡 Vàng / 🟢 Xanh). Chọn xong → `colConfig.symbols = ['🔴','🟡','🟢']`, `colConfig.symbolSet = 'ryg'`. Toggle "Restrict to symbol values only" → lưu `colConfig.restrictToSymbolValues` (mặc định bật, vì bộ RYG cố định không có lý do cho giá trị khác). | **P1 (Should)** | Không cần xây UI chọn-1-trong-9-bộ như Smartsheet vì chỉ dùng RYG — làm đơn giản: hiện sẵn 3 màu RYG để xác nhận, bấm Ok là xong. Giữ cấu trúc `colConfig.symbols` dạng mảng như hiện tại để tương thích ngược với cột symbols cũ (nếu có). |

---

## 3. Yêu cầu phi chức năng (Non-Functional Requirements)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| **NFR-01** | **Tương thích ngược** | Sheet cũ (chưa có `rowMeta.createdBy` v.v.) load lên vẫn không lỗi — cột system hiển thị "—" thay vì crash. |
| **NFR-02** | **Không tăng số lần save** | Modified by/date chỉ cập nhật cùng lúc với save cell đang có sẵn (`scheduleCellSave`/`scheduleSheetDataSave`), không tạo thêm request riêng. |
| **NFR-03** | **Auto Number không đụng tới row cũ** | Khi bật Auto Number cho cột đã có dữ liệu, **không tự ý ghi đè** giá trị cell cũ — chỉ áp dụng cho row mới thêm sau đó. Có thể có nút "Đánh số lại toàn bộ" riêng nếu Quan cần (không bắt buộc trong SPEC này). |
| **NFR-04** | **Định danh không phá vỡ multi-máy** | `appUserName` lưu theo `localStorage` — nghĩa là 1 người dùng trên 2 máy khác nhau (theo bối cảnh Quan làm việc nhiều máy Windows) sẽ được hỏi tên riêng từng máy. Chấp nhận được vì đây chỉ là nhãn hiển thị, không phải auth thật. |

---

## 4. Thay đổi Data Model

```js
// rowMeta hiện tại (dòng 4050, trong renderGridSheet / buildSheetSavePayload):
const rowMeta = cells.map(row => ({level: row._level || 0, collapsed: !!row._collapsed}));

// rowMeta sau khi thêm SPEC này — thêm 4 field mới, giữ nguyên field cũ:
const rowMeta = cells.map(row => ({
  level: row._level || 0,
  collapsed: !!row._collapsed,
  createdBy: row._createdBy || null,
  createdAt: row._createdAt || null,
  modifiedBy: row._modifiedBy || null,
  modifiedAt: row._modifiedAt || null
}));
```

**Quan trọng:** codebase hiện tại lưu field đặc thù theo type ở dạng **phẳng ngay trên `colConfig`** (vd `maxContacts`, `knownContacts` cho type `contact` — xem `getColumnConfig()`), **không** lồng trong 1 object `options` phụ (khác với `colConfig.options` vốn đã dùng riêng cho mảng giá trị dropdown). SPEC này theo đúng convention đó:

```js
// colConfig cho type 'auto_number':
{
  type: 'auto_number',
  prefix: 'HS-',       // string, mặc định ''
  suffix: '',          // string, mặc định ''
  digits: 4,           // number 0-6, mặc định 4
  autoStart: 1,         // số bắt đầu (Starting number)
  autoNext: 1           // counter nội bộ — giá trị SẼ gán cho row tiếp theo, tăng dần mỗi lần add row
}

// colConfig cho type 'checkbox':
{
  type: 'checkbox',
  checkboxStyle: 'check',        // 'check' | 'flag' | 'star', mặc định 'check'
  restrictToToggle: false        // mặc định false = giữ hành vi cũ (không khoá)
}

// colConfig cho type 'symbols':
{
  type: 'symbols',
  symbolSet: 'ryg',
  symbols: ['🔴','🟡','🟢'],
  restrictToSymbolValues: true   // mặc định true
}

// colConfig cho type 'contact' (mở rộng field đã có sẵn maxContacts/knownContacts):
{
  type: 'contact',
  maxContacts: 1,                // đổi được qua UI mới (FR-10), mặc định 1
  restrictToList: false,         // field mới (FR-10), mặc định false
  knownContacts: []              // nếu rỗng → fallback PROJECT_CONTACTS (FR-11)
}

// colConfig cho type 'duration': không cần field phụ — giá trị cell luôn lưu dạng
// số phút (string số nguyên, vd "3160"), format hiển thị qua Formatters.duration().

// colConfig cho 4 type system: không cần field phụ, đọc trực tiếp từ rowMeta[rowIndex].
{ type: 'created_by' | 'created_date' | 'modified_by' | 'modified_date' }
```

---

## 5. Câu hỏi mở cho Quan (cần xác nhận trước khi build)

1. **Auto Number khi đổi thứ tự / xoá row**: số có bị đánh lại không, hay giữ nguyên số đã gán (kiểu mã hồ sơ cố định)? → Đề xuất: **giữ nguyên**, giống mã hồ sơ thật không đổi khi sắp xếp lại.
2. **Duration**: có cần cho phép nhập số âm (vd để bù trừ) không, hay chỉ dương? → Đề xuất: chỉ dương.
3. **Latest Comment**: xác nhận hoãn lại đúng như đề xuất ở mục 1.3, hay Quan muốn làm luôn cả comment cơ bản trong sprint này (sẽ phình phạm vi SPEC đáng kể)?
4. **Contact list "Restrict to list values only"**: khi bật, các cột contact **đang có dữ liệu ad-hoc từ trước** (không nằm trong `knownContacts`) có bị coi là lỗi/cảnh báo không, hay vẫn giữ nguyên hiển thị bình thường (chỉ chặn thêm mới)? → Đề xuất: giữ nguyên dữ liệu cũ, chỉ chặn nhập thêm.

---

## 6. Phụ lục kỹ thuật — Code hiện tại & Code đề xuất

> Mục này viết đầy đủ để **mô hình khác (Codex) build trực tiếp mà không cần đọc lại file gốc**. Tất cả code dưới đây lấy nguyên văn hoặc viết mới dựa trên `giao-dien-desktop-don-gian_v23_quan.html` (baseline v23, 9403 dòng).

### 6.1 Code hiện tại (nguyên văn từ v23 baseline)

**`ensureSheetColumnConfigs(sheet)` — dòng 3416:**
```js
function ensureSheetColumnConfigs(sheet){
 if(!sheet._columnConfigs || typeof sheet._columnConfigs !== 'object') sheet._columnConfigs = {};
 return sheet._columnConfigs;
}
```

**`columnTypeIcon(type)` — dòng 3421:**
```js
function columnTypeIcon(type){
 return {
 text:'A1',
 dropdown:'≡',
 date:'📅',
 contact:'👤',
 CONTACT_LIST:'👤',
 checkbox:'☑',
 symbols:'★',
 currency:'₫',
 number:'#',
 percent:'%'
 }[type] || 'A1';
}
```

**`Formatters` object — dòng 3278 (rút gọn, giữ nguyên `number`/`currency`/`percent`/`date`/`contact`/`defaultConfig`):**
```js
const Formatters = {
 number(value, config = {}){ /* ...giữ nguyên... */ },
 currency(value, config = {}){ /* ...giữ nguyên... */ },
 percent(value, config = {}){ /* ...giữ nguyên... */ },
 date(value, config = {}){ /* ...giữ nguyên... */ },
 contact(value){ /* ...giữ nguyên... */ },
 defaultConfig(type){
 if(type === 'number') return {decimals:2, thousandsSeparator:'.', decimalSeparator:','};
 if(type === 'currency') return {currency:'VND', decimals:0, symbolPosition:'suffix'};
 if(type === 'percent') return {decimals:1, showPercentSign:true};
 if(type === 'date') return {format:'dd/mm/yyyy'};
 return {};
 }
};
```

**`getColumnConfig(col, sheet)` — dòng 4909:**
```js
function getColumnConfig(col, sheet = getActiveSheet()){
 const base = SHEET_COLUMN_CONFIG[col] || {type:'text', label:columnName(col), width:116};
 const runtime = sheet?._columnConfigs?.[col] || {};
 const legacyType = sheet?._columnTypes?.[col];
 const cells = sheet ? ensureSheetCells(sheet) : null;
 const label = runtime.label || cells?.[0]?.[col] || base.label || columnName(col);
 const type = runtime.type || legacyType || base.type || 'text';
 return {
 ...base,
 ...runtime,
 label,
 type,
 format: runtime.format || sheet?._columnFormats?.[col] || base.format || Formatters.defaultConfig(type),
 options: runtime.options || base.options || [],
 knownContacts: runtime.knownContacts || base.knownContacts || PROJECT_CONTACTS
 };
}
```

**`isEditableSheetCell(row, col)` — dòng 4926:**
```js
function isEditableSheetCell(row, col){
 if(row <= 0 || col <= 1) return false;
 const activeSheet = getActiveSheet();
 if(activeSheet?._lockedCols?.[col]) return false;
 const colType = getColumnConfig(col).type;
 return !['dropdown','date','status','attachment','contact','CONTACT_LIST','checkbox','symbols','multi-select'].includes(colType);
}
```

**`scheduleCellSave(sheet, row, col, value)` — dòng 4084:**
```js
function scheduleCellSave(sheet, row, col, value){
 scheduleSheetDataSave(sheet);
 if(!sheet.googleSheetId) return;
 const key = sheet.googleSheetId + ':' + row + ':' + col;
 if(pendingCellSaveTimers[key]) window.clearTimeout(pendingCellSaveTimers[key]);
 pendingCellSaveTimers[key] = window.setTimeout(()=>{
 delete pendingCellSaveTimers[key];
 saveCellViaWebApp(sheet.googleSheetId, row, col, value)
 .catch(err => { sheetStatus.textContent = 'Lưu lỗi: ' + err.message; });
 }, 600);
}
```

**`ssAddRowBtn` click handler — dòng 7819:**
```js
ssAddRowBtn.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 cells.push(Array.from({length:cells[0].length}, () => ''));
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
});
```

**`toggleCheckboxCell(row, col)` — dòng 8130:**
```js
function toggleCheckboxCell(row, col){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 const current = cells[row][col];
 const next = current ? '' : 'true';
 cells[row][col] = next;
 renderGridSheet(sheet);
 scheduleCellSave(sheet, row, col, next);
}
```

**Click dispatcher trên grid — dòng ~8280 (trong `sheetGridWrap.addEventListener('click', ...)`), đoạn liên quan đến type:**
```js
const sheetForType = getActiveSheet();
const colConfig = getColumnConfig(col, sheetForType);
const runtimeType = colConfig.type;
if(runtimeType === 'dropdown' && row > 0){ e.stopPropagation(); showDropdownPicker(cell, row, col, colConfig.options || []); return; }
if((runtimeType === 'contact' || runtimeType === 'CONTACT_LIST') && row > 0){ e.stopPropagation(); showContactPicker(cell, row, col); return; }
if(runtimeType === 'date' && row > 0){ e.stopPropagation(); showDatePicker(cell, row, col); return; }
if(runtimeType === 'checkbox' && row > 0){ e.stopPropagation(); toggleCheckboxCell(row, col); return; }
if(runtimeType === 'symbols' && row > 0){ e.stopPropagation(); showSymbolsPicker(cell, row, col, colConfig.symbols || []); return; }
if(runtimeType === 'multi-select' && row > 0){ e.stopPropagation(); showMultiSelectPicker(cell, row, col, colConfig.options || []); return; }
```

**`openColumnTypePicker(colIndex, anchorEl)` — dòng 6958 (toàn bộ, để đối chiếu khi viết bản thay thế ở 6.2):**
```js
function openColumnTypePicker(colIndex, anchorEl){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 document.querySelector('.column-type-popover')?.remove();
 const cells = ensureSheetCells(sheet);
 const currentConfig = getColumnConfig(colIndex, sheet);
 const currentType = currentConfig.type || 'text';
 const pop = document.createElement('div');
 pop.className = 'column-type-popover';
 const rect = anchorEl.getBoundingClientRect();
 pop.style.left = `${Math.min(rect.left, window.innerWidth - 270)}px`;
 pop.style.top = `${Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 460))}px`;
 const types = [
 ['text','A1 Text/Number'], ['dropdown','≡ Dropdown list'], ['date','📅 Date'],
 ['contact','👤 Contact list'], ['checkbox','☑ Checkbox'], ['symbols','★ Symbols'],
 ['currency','₫ Currency'], ['number','# Number'], ['percent','% Percentage']
 ];
 pop.innerHTML = `
 <input id="v19ColNameInput" value="${escapeHtml(currentConfig.label || cells[0][colIndex] || '')}" placeholder="Tên cột">
 <div class="column-type-current" id="v19SelectedTypeLabel">Đang chọn: ${escapeHtml(types.find(([type]) => type === currentType)?.[1] || currentType)}</div>
 <div class="column-type-list">${types.map(([type, label]) => `<button class="column-type-item ${type === currentType ? 'selected' : ''}" type="button" data-type="${type}">${label}</button>`).join('')}</div>
 <textarea id="v19ColumnOptionsInput" rows="3" placeholder="Tuỳ chọn dropdown, mỗi dòng một giá trị" style="${currentType === 'dropdown' ? '' : 'display:none'}">${escapeHtml((currentConfig.options || []).join('\n'))}</textarea>
 <div class="v19-muted">Chọn type rồi bấm OK để áp dụng vào thuộc tính cột.</div>
 <div class="v19-modal-actions" style="padding:8px 0 0;border-top:1px solid var(--line)">
 <button class="v19-btn" type="button" data-act="cancel">Hủy</button>
 <button class="v19-btn primary" type="button" data-act="ok">Ok</button>
 </div>`;
 document.body.appendChild(pop);
 let selectedType = currentType;
 function commitColumnTypeChange(closeAfter = true){
 const name = pop.querySelector('#v19ColNameInput').value.trim() || currentConfig.label || columnName(colIndex);
 const optionsText = pop.querySelector('#v19ColumnOptionsInput')?.value || '';
 const options = selectedType === 'dropdown'
 ? optionsText.split(/\r?\n/).map(v => v.trim()).filter(Boolean)
 : currentConfig.options || [];
 cells[0][colIndex] = name;
 const configs = ensureSheetColumnConfigs(sheet);
 configs[colIndex] = {
 ...currentConfig,
 label:name,
 type:selectedType,
 options:selectedType === 'dropdown' && options.length ? options : selectedType === 'dropdown' ? ['Tuỳ chọn 1','Tuỳ chọn 2','Tuỳ chọn 3'] : options,
 format:['number','currency','percent','date'].includes(selectedType)
 ? (currentConfig.format || Formatters.defaultConfig(selectedType))
 : currentConfig.format
 };
 sheet._columnTypes = sheet._columnTypes || {};
 sheet._columnTypes[colIndex] = selectedType;
 if(['number','currency','percent','date'].includes(selectedType)){
 sheet._columnFormats = sheet._columnFormats || {};
 sheet._columnFormats[colIndex] = configs[colIndex].format;
 }
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
 if(closeAfter) pop.remove();
 }
 pop.querySelectorAll('.column-type-item').forEach(btn => {
 btn.addEventListener('click', (e) => {
 e.preventDefault(); e.stopPropagation();
 pop.querySelectorAll('.column-type-item').forEach(x => x.classList.remove('selected'));
 btn.classList.add('selected');
 selectedType = btn.dataset.type;
 const selectedLabel = types.find(([type]) => type === selectedType)?.[1] || selectedType;
 const labelEl = pop.querySelector('#v19SelectedTypeLabel');
 if(labelEl) labelEl.textContent = `Đang chọn: ${selectedLabel}`;
 const optionsEl = pop.querySelector('#v19ColumnOptionsInput');
 if(optionsEl) optionsEl.style.display = selectedType === 'dropdown' ? '' : 'none';
 });
 });
 pop.querySelector('[data-act="cancel"]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); pop.remove(); });
 pop.querySelector('[data-act="ok"]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); commitColumnTypeChange(true); });
 setTimeout(() => {
 const close = e => { if(!pop.contains(e.target) && e.target !== anchorEl){ pop.remove(); document.removeEventListener('mousedown', close, true); } };
 document.addEventListener('mousedown', close, true);
 }, 0);
}
```

**`showContactPicker(cell, row, col)` — dòng 7269 (phần liên quan `maxContacts`/`knownContacts`, rút gọn):**
```js
function showContactPicker(cell, row, col){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const colConfig = getColumnConfig(col, sheet);
 const maxContacts = colConfig.maxContacts || 1;
 let selected = parseContactValue(ensureSheetCells(sheet)[row][col]);
 // ...render popover, search box, list contacts từ (colConfig.knownContacts || PROJECT_CONTACTS)...
 // nút "Thêm mới" hiện LUÔN cho phép thêm contact ad-hoc, chưa có cờ nào chặn.
}
```

---

### 6.2 Code đề xuất (Target — viết mới / thay thế)

#### 6.2.1 FR-00 — Định danh người dùng nhẹ (thêm mới, đặt gần đầu file, sau khai báo các biến global khác)

```js
const APP_USER_NAME_KEY = 'appUserName';

function getAppUserName(){
  return localStorage.getItem(APP_USER_NAME_KEY) || '';
}

function ensureAppUserName(){
  let name = getAppUserName();
  if(!name){
    name = (window.prompt('Tên của bạn là gì? (dùng để ghi nhận người tạo/sửa hồ sơ)', '') || '').trim();
    if(name) localStorage.setItem(APP_USER_NAME_KEY, name);
  }
  return name || 'Chưa đặt tên';
}

function promptChangeAppUserName(){
  const current = getAppUserName();
  const name = (window.prompt('Đổi tên hiển thị của bạn:', current) || '').trim();
  if(name) localStorage.setItem(APP_USER_NAME_KEY, name);
  return name || current;
}

// Gọi 1 lần khi app khởi động (đặt cạnh các init khác ở cuối file, vd gần chỗ gọi renderSidebar()):
// ensureAppUserName();
```
> Gợi ý UI: thêm 1 nút nhỏ (vd trong sidebar, cạnh `.brand`) gọi `promptChangeAppUserName()` để đổi tên bất kỳ lúc nào — không bắt buộc trong SPEC này, có thể làm đơn giản bằng `prompt()` trước, nâng cấp UI sau.

#### 6.2.2 FR-03/04/05/06 — Stamp created/modified vào rowMeta

```js
// Helper mới — gọi khi row được TẠO (chỉ ssAddRowBtn, không áp dụng cho paste-extend):
function stampRowCreated(sheet, rowIndex){
  const cells = ensureSheetCells(sheet);
  const row = cells[rowIndex];
  if(!row) return;
  row._createdBy = getAppUserName() || 'Chưa đặt tên';
  row._createdAt = Date.now();
}

// Helper mới — gọi mỗi khi 1 cell trong row bị sửa giá trị:
function stampRowModified(sheet, rowIndex){
  const cells = ensureSheetCells(sheet);
  const row = cells[rowIndex];
  if(!row) return;
  row._modifiedBy = getAppUserName() || 'Chưa đặt tên';
  row._modifiedAt = Date.now();
}
```

**Sửa `ssAddRowBtn` handler (thay thế nguyên khối ở 6.1):**
```js
ssAddRowBtn.addEventListener('click', ()=>{
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 cells.push(Array.from({length:cells[0].length}, () => ''));
 const newRowIndex = cells.length - 1;
 stampRowCreated(sheet, newRowIndex);          // ← MỚI (FR-03/04)
 fillAutoNumberCells(sheet, newRowIndex);       // ← MỚI (FR-02, xem 6.2.3)
 renderGridSheet(sheet);
 scheduleSheetDataSave(sheet);
});
```

**Sửa `scheduleCellSave` (thêm dòng đầu hàm, KHÔNG đổi phần debounce/save hiện có):**
```js
function scheduleCellSave(sheet, row, col, value){
 if(row > 0) stampRowModified(sheet, row);      // ← MỚI (FR-05/06) — đặt trước dòng scheduleSheetDataSave hiện có
 scheduleSheetDataSave(sheet);
 if(!sheet.googleSheetId) return;
 const key = sheet.googleSheetId + ':' + row + ':' + col;
 if(pendingCellSaveTimers[key]) window.clearTimeout(pendingCellSaveTimers[key]);
 pendingCellSaveTimers[key] = window.setTimeout(()=>{
 delete pendingCellSaveTimers[key];
 saveCellViaWebApp(sheet.googleSheetId, row, col, value)
 .catch(err => { sheetStatus.textContent = 'Lưu lỗi: ' + err.message; });
 }, 600);
}
```

**Cập nhật `rowMeta` build (chỗ tạo payload lưu sheet, dòng ~4050):**
```js
const rowMeta = cells.map(row => ({
  level: row._level || 0,
  collapsed: !!row._collapsed,
  createdBy: row._createdBy || null,
  createdAt: row._createdAt || null,
  modifiedBy: row._modifiedBy || null,
  modifiedAt: row._modifiedAt || null
}));
```
> Và ở chiều ngược lại — chỗ **load** sheet từ Drive (hàm `loadSheetDataFromWebApp` hoặc tương đương gán lại `row._level`/`row._collapsed` từ `rowMeta` đã lưu) — thêm gán lại `row._createdBy = meta.createdBy; row._createdAt = meta.createdAt; row._modifiedBy = meta.modifiedBy; row._modifiedAt = meta.modifiedAt;` theo đúng vị trí đang gán `_level`/`_collapsed`.

#### 6.2.3 FR-02 — Auto Number: tính giá trị khi tạo row

```js
function formatAutoNumberValue(n, colConfig){
  const digits = Number(colConfig.digits ?? 4);
  const padded = digits > 0 ? String(n).padStart(digits, '0') : String(n);
  return `${colConfig.prefix || ''}${padded}${colConfig.suffix || ''}`;
}

// Quét toàn bộ cột trong sheet, tìm cột nào type === 'auto_number', gán giá trị cho rowIndex mới:
function fillAutoNumberCells(sheet, rowIndex){
  const cells = ensureSheetCells(sheet);
  const row = cells[rowIndex];
  if(!row) return;
  for(let col = 2; col < cells[0].length; col++){
    const colConfig = getColumnConfig(col, sheet);
    if(colConfig.type !== 'auto_number') continue;
    const configs = ensureSheetColumnConfigs(sheet);
    const cfg = configs[col] || (configs[col] = {...colConfig});
    const next = cfg.autoNext ?? cfg.autoStart ?? 1;
    row[col] = formatAutoNumberValue(next, cfg);
    cfg.autoNext = next + 1;   // tăng counter cho row kế tiếp — KHÔNG đụng row cũ (NFR-03)
  }
}
```

#### 6.2.4 FR-01 — Duration: Formatters + popover nhập ngày/giờ

```js
// Thêm vào Formatters object (6.1):
duration(value){
  const minutes = Number(value);
  if(!value || Number.isNaN(minutes)) return '';
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if(days > 0) return `${days}d${hours ? ' ' + hours + 'h' : ''}`;
  if(hours > 0) return `${hours}h${mins ? ' ' + mins + 'm' : ''}`;
  return `${mins}m`;
}
```

```js
// Popover nhập Duration — viết theo mẫu showDatePicker() đã có, gắn vào click dispatcher (6.2.7):
function showDurationPicker(cell, row, col){
  const sheet = getActiveSheet();
  if(!sheet) return;
  document.querySelector('.duration-popover')?.remove();
  const rect = cell.getBoundingClientRect();
  const currentMinutes = Number(ensureSheetCells(sheet)[row][col]) || 0;
  const curDays = Math.floor(currentMinutes / 1440);
  const curHours = Math.floor((currentMinutes % 1440) / 60);
  const pop = document.createElement('div');
  pop.className = 'duration-popover ss-popover';
  pop.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.bottom + 4}px; z-index:300; padding:10px; width:200px;`;
  pop.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <label style="flex:1;font-size:12px;">Ngày<input id="durDaysInput" type="number" min="0" value="${curDays}" style="width:100%;"></label>
      <label style="flex:1;font-size:12px;">Giờ<input id="durHoursInput" type="number" min="0" max="23" value="${curHours}" style="width:100%;"></label>
    </div>
    <button class="v19-btn primary" type="button" data-act="save" style="width:100%;">Lưu</button>`;
  document.body.appendChild(pop);
  pop.querySelector('[data-act="save"]').addEventListener('click', () => {
    const days = Number(pop.querySelector('#durDaysInput').value) || 0;
    const hours = Number(pop.querySelector('#durHoursInput').value) || 0;
    const totalMinutes = Math.max(0, days) * 1440 + Math.max(0, Math.min(23, hours)) * 60; // chỉ dương — xem câu hỏi mở #2
    ensureSheetCells(sheet)[row][col] = String(totalMinutes);
    renderGridSheet(sheet);
    scheduleCellSave(sheet, row, col, String(totalMinutes));
    pop.remove();
  });
  setTimeout(() => {
    const close = e => { if(!pop.contains(e.target) && e.target !== cell){ pop.remove(); document.removeEventListener('mousedown', close, true); } };
    document.addEventListener('mousedown', close, true);
  }, 0);
}
```

#### 6.2.5 FR-09 — Formatters + icon cho các type còn lại

```js
// Thêm vào Formatters object:
created_by(value, config, rowMeta){ return rowMeta?.createdBy || '—'; },
created_date(value, config, rowMeta){ return rowMeta?.createdAt ? Formatters.date(new Date(rowMeta.createdAt).toISOString(), {format:'dd/mm/yyyy hh:mm'}) : '—'; },
modified_by(value, config, rowMeta){ return rowMeta?.modifiedBy || '—'; },
modified_date(value, config, rowMeta){ return rowMeta?.modifiedAt ? Formatters.date(new Date(rowMeta.modifiedAt).toISOString(), {format:'dd/mm/yyyy hh:mm'}) : '—'; },
auto_number(value){ return value || ''; }
```
> Lưu ý: `Formatters.date()` hiện tại không hỗ trợ token `hh:mm` — cần thêm nhánh xử lý giờ:phút trong `Formatters.date()`, hoặc viết thẳng logic format ngày giờ riêng trong `created_date`/`modified_date` thay vì gọi lại `Formatters.date`. Khuyến nghị: viết hàm nhỏ riêng `formatDateTimeVN(timestamp)` để tránh sửa `Formatters.date()` (giảm rủi ro ảnh hưởng các cột `date` khác).

```js
// Cập nhật columnTypeIcon (6.1) — thêm các key mới:
function columnTypeIcon(type){
 return {
 text:'A1', dropdown:'≡', date:'📅', duration:'⏱',
 contact:'👤', CONTACT_LIST:'👤', checkbox:'☑', symbols:'★',
 currency:'₫', number:'#', percent:'%',
 auto_number:'#', created_by:'👤+', created_date:'📅+',
 modified_by:'✎👤', modified_date:'✎📅'
 }[type] || 'A1';
}
```

```js
// Cập nhật isEditableSheetCell (6.1) — thêm các type read-only mới vào danh sách loại trừ:
function isEditableSheetCell(row, col){
 if(row <= 0 || col <= 1) return false;
 const activeSheet = getActiveSheet();
 if(activeSheet?._lockedCols?.[col]) return false;
 const colType = getColumnConfig(col).type;
 return ![
   'dropdown','date','status','attachment','contact','CONTACT_LIST','checkbox','symbols','multi-select',
   'duration','auto_number','created_by','created_date','modified_by','modified_date'  // ← MỚI
 ].includes(colType);
}
```

#### 6.2.6 FR-13 — Checkbox: style + restrict

```js
// Thêm vào Formatters object — icon theo style, dùng khi render cell (thay vì hardcode ☑):
checkboxIcon(colConfig){
  const style = colConfig.checkboxStyle || 'check';
  return {check:'✓', flag:'🚩', star:'⭐'}[style] || '✓';
}
```

```js
// Sửa toggleCheckboxCell (6.1) — thêm chặn khi restrictToToggle (thật ra hành vi toggle vẫn cho phép,
// restrictToToggle chỉ chặn EDIT TRỰC TIẾP qua gõ/paste, không ảnh hưởng hàm này):
function toggleCheckboxCell(row, col){
 const sheet = getActiveSheet();
 if(!sheet) return;
 const cells = ensureSheetCells(sheet);
 const current = cells[row][col];
 const next = current ? '' : 'true';
 cells[row][col] = next;
 renderGridSheet(sheet);
 scheduleCellSave(sheet, row, col, next);
}
// Không cần đổi logic hàm này — chỉ cần render cell dùng Formatters.checkboxIcon(colConfig)
// thay vì icon cố định khi hiển thị giá trị 'true', ở đoạn render cellsHtml trong renderGridSheet().
```

#### 6.2.7 Cập nhật click dispatcher — thêm nhánh `duration`

```js
// Thêm vào đoạn if/else trong sheetGridWrap click handler (6.1), sau nhánh 'symbols':
if(runtimeType === 'duration' && row > 0){
  e.stopPropagation();
  showDurationPicker(cell, row, col);
  return;
}
```

#### 6.2.8 FR-07/10/11/12/13/14 — `openColumnTypePicker()` bản đầy đủ thay thế

```js
function openColumnTypePicker(colIndex, anchorEl){
 const sheet = getActiveSheet();
 if(!sheet || colIndex <= 1) return;
 document.querySelector('.column-type-popover')?.remove();
 const cells = ensureSheetCells(sheet);
 const currentConfig = getColumnConfig(colIndex, sheet);
 const currentType = currentConfig.type || 'text';
 const pop = document.createElement('div');
 pop.className = 'column-type-popover';
 const rect = anchorEl.getBoundingClientRect();
 pop.style.left = `${Math.min(rect.left, window.innerWidth - 270)}px`;
 pop.style.top = `${Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 520))}px`;

 // Thứ tự đúng theo Smartsheet (mục 1.2):
 const types = [
   ['text','A1 Text/Number'], ['dropdown','≡ Dropdown list'], ['date','📅 Date'],
   ['duration','⏱ Duration'], ['contact','👤 Contact list'], ['checkbox','☑ Checkbox'],
   ['symbols','★ Symbols'], ['currency','₫ Currency'], ['number','# Number'], ['percent','% Percentage'],
   ['auto_number','# Auto number'], ['created_by','👤+ Created by'], ['created_date','📅+ Created date'],
   ['modified_by','✎👤 Modified by'], ['modified_date','✎📅 Modified date']
 ];

 // Hàm render khối cấu hình phụ theo type đang chọn — thay cho <textarea> cố định trước đây
 function renderExtraConfig(type, cfg){
   if(type === 'dropdown'){
     return `<textarea id="v19ColumnOptionsInput" rows="3" placeholder="Tuỳ chọn dropdown, mỗi dòng một giá trị">${escapeHtml((cfg.options || []).join('\n'))}</textarea>`;
   }
   if(type === 'contact'){
     return `
       <label class="ss-pop-toggle-row"><input type="checkbox" id="ctAllowMultiple" ${(cfg.maxContacts || 1) > 1 ? 'checked' : ''}> Cho phép nhiều contact/ô</label>
       <input id="ctMaxContacts" type="number" min="1" max="20" value="${cfg.maxContacts || 1}" placeholder="Số lượng tối đa" style="${(cfg.maxContacts || 1) > 1 ? '' : 'display:none'}">
       <label class="ss-pop-toggle-row"><input type="checkbox" id="ctRestrictList" ${cfg.restrictToList ? 'checked' : ''}> Chỉ giới hạn trong danh sách</label>
       <input id="ctAddContactSearch" placeholder="Tìm/thêm contact cho riêng cột này...">
       <div id="ctKnownList" class="v19-muted" style="max-height:80px;overflow:auto;">${(cfg.knownContacts || []).map(c => escapeHtml(c.name || c.email)).join(', ') || '(dùng danh bạ chung dự án)'}</div>`;
   }
   if(type === 'checkbox'){
     const style = cfg.checkboxStyle || 'check';
     return `
       <div class="v19-muted">Style</div>
       <div class="column-type-list" style="grid-template-columns:repeat(3,1fr);">
         <button class="column-type-item ${style==='check'?'selected':''}" type="button" data-checkbox-style="check">✓</button>
         <button class="column-type-item ${style==='flag'?'selected':''}" type="button" data-checkbox-style="flag">🚩</button>
         <button class="column-type-item ${style==='star'?'selected':''}" type="button" data-checkbox-style="star">⭐</button>
       </div>
       <label class="ss-pop-toggle-row"><input type="checkbox" id="cbRestrict" ${cfg.restrictToToggle ? 'checked' : ''}> Restrict to checkbox use only</label>`;
   }
   if(type === 'symbols'){
     return `
       <div class="v19-muted">Bộ symbol: RYG (Đỏ / Vàng / Xanh)</div>
       <div style="font-size:22px;padding:6px 0;">🔴 🟡 🟢</div>
       <label class="ss-pop-toggle-row"><input type="checkbox" id="symRestrict" ${cfg.restrictToSymbolValues !== false ? 'checked' : ''}> Restrict to symbol values only</label>`;
   }
   if(type === 'auto_number'){
     return `
       <div class="v19-modal-grid" style="grid-template-columns:1fr 1fr;">
         <input id="anPrefix" placeholder="Prefix" value="${escapeHtml(cfg.prefix || '')}">
         <input id="anSuffix" placeholder="Suffix" value="${escapeHtml(cfg.suffix || '')}">
       </div>
       <div class="v19-modal-grid" style="grid-template-columns:1fr 1fr;">
         <select id="anDigits">${[0,1,2,3,4,5,6].map(d => `<option value="${d}" ${((cfg.digits ?? 4) === d) ? 'selected' : ''}>${d}</option>`).join('')}</select>
         <input id="anStart" type="number" min="1" placeholder="Số bắt đầu" value="${cfg.autoStart ?? 1}">
       </div>
       <div class="v19-muted">Preview: <b id="anPreview"></b></div>`;
   }
   if(['created_by','created_date','modified_by','modified_date'].includes(type)){
     return `<div class="v19-muted">Cột hệ thống — tự động điền, không thể sửa tay.</div>`;
   }
   if(type === 'duration'){
     return `<div class="v19-muted">Nhập giá trị bằng cách bấm trực tiếp vào từng ô (chọn số ngày + số giờ).</div>`;
   }
   return '';
 }

 function updateAutoNumberPreview(container){
   const prefix = container.querySelector('#anPrefix')?.value || '';
   const suffix = container.querySelector('#anSuffix')?.value || '';
   const digits = Number(container.querySelector('#anDigits')?.value ?? 4);
   const start = Number(container.querySelector('#anStart')?.value || 1);
   const preview = container.querySelector('#anPreview');
   if(preview) preview.textContent = formatAutoNumberValue(start, {prefix, suffix, digits});
 }

 pop.innerHTML = `
 <input id="v19ColNameInput" value="${escapeHtml(currentConfig.label || cells[0][colIndex] || '')}" placeholder="Tên cột">
 <div class="column-type-current" id="v19SelectedTypeLabel">Đang chọn: ${escapeHtml(types.find(([type]) => type === currentType)?.[1] || currentType)}</div>
 <div class="column-type-list">${types.map(([type, label]) => `<button class="column-type-item ${type === currentType ? 'selected' : ''}" type="button" data-type="${type}">${label}</button>`).join('')}</div>
 <div id="v19ExtraConfig">${renderExtraConfig(currentType, currentConfig)}</div>
 <div class="v19-modal-actions" style="padding:8px 0 0;border-top:1px solid var(--line)">
 <button class="v19-btn" type="button" data-act="cancel">Hủy</button>
 <button class="v19-btn primary" type="button" data-act="ok">Ok</button>
 </div>`;
 document.body.appendChild(pop);
 let selectedType = currentType;
 const extraEl = pop.querySelector('#v19ExtraConfig');
 if(selectedType === 'auto_number') updateAutoNumberPreview(extraEl);
 extraEl.addEventListener('input', () => { if(selectedType === 'auto_number') updateAutoNumberPreview(extraEl); });

 function commitColumnTypeChange(closeAfter = true){
   const name = pop.querySelector('#v19ColNameInput').value.trim() || currentConfig.label || columnName(colIndex);
   cells[0][colIndex] = name;
   const configs = ensureSheetColumnConfigs(sheet);
   let next = { ...currentConfig, label:name, type:selectedType };

   if(selectedType === 'dropdown'){
     const optionsText = extraEl.querySelector('#v19ColumnOptionsInput')?.value || '';
     const options = optionsText.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
     next.options = options.length ? options : ['Tuỳ chọn 1','Tuỳ chọn 2','Tuỳ chọn 3'];
   } else if(selectedType === 'contact'){
     const allowMultiple = extraEl.querySelector('#ctAllowMultiple')?.checked;
     next.maxContacts = allowMultiple ? (Number(extraEl.querySelector('#ctMaxContacts')?.value) || 5) : 1;
     next.restrictToList = !!extraEl.querySelector('#ctRestrictList')?.checked;
     // knownContacts riêng cột: giữ nguyên nếu đã có, quản lý thêm/bớt qua showContactPicker context riêng (xem ghi chú FR-11)
   } else if(selectedType === 'checkbox'){
     next.checkboxStyle = extraEl.querySelector('.column-type-item.selected[data-checkbox-style]')?.dataset.checkboxStyle || 'check';
     next.restrictToToggle = !!extraEl.querySelector('#cbRestrict')?.checked;
   } else if(selectedType === 'symbols'){
     next.symbolSet = 'ryg';
     next.symbols = ['🔴','🟡','🟢'];
     next.restrictToSymbolValues = !!extraEl.querySelector('#symRestrict')?.checked;
   } else if(selectedType === 'auto_number'){
     next.prefix = extraEl.querySelector('#anPrefix')?.value || '';
     next.suffix = extraEl.querySelector('#anSuffix')?.value || '';
     next.digits = Number(extraEl.querySelector('#anDigits')?.value ?? 4);
     next.autoStart = Number(extraEl.querySelector('#anStart')?.value) || 1;
     if(next.autoNext === undefined) next.autoNext = next.autoStart;
   }

   next.format = ['number','currency','percent','date'].includes(selectedType)
     ? (currentConfig.format || Formatters.defaultConfig(selectedType))
     : currentConfig.format;

   configs[colIndex] = next;
   sheet._columnTypes = sheet._columnTypes || {};
   sheet._columnTypes[colIndex] = selectedType;
   if(['number','currency','percent','date'].includes(selectedType)){
     sheet._columnFormats = sheet._columnFormats || {};
     sheet._columnFormats[colIndex] = next.format;
   }
   renderGridSheet(sheet);
   scheduleSheetDataSave(sheet);
   if(closeAfter) pop.remove();
 }

 pop.querySelectorAll('.column-type-item[data-type]').forEach(btn => {
   btn.addEventListener('click', (e) => {
     e.preventDefault(); e.stopPropagation();
     pop.querySelectorAll('.column-type-item[data-type]').forEach(x => x.classList.remove('selected'));
     btn.classList.add('selected');
     selectedType = btn.dataset.type;
     const selectedLabel = types.find(([type]) => type === selectedType)?.[1] || selectedType;
     pop.querySelector('#v19SelectedTypeLabel').textContent = `Đang chọn: ${selectedLabel}`;
     extraEl.innerHTML = renderExtraConfig(selectedType, selectedType === currentType ? currentConfig : {});
     if(selectedType === 'auto_number') updateAutoNumberPreview(extraEl);
   });
 });
 // Style buttons (checkbox) dùng event delegation vì được render lại động:
 extraEl.addEventListener('click', (e) => {
   const styleBtn = e.target.closest('[data-checkbox-style]');
   if(styleBtn){
     e.preventDefault(); e.stopPropagation();
     extraEl.querySelectorAll('[data-checkbox-style]').forEach(b => b.classList.remove('selected'));
     styleBtn.classList.add('selected');
   }
 });
 pop.querySelector('[data-act="cancel"]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); pop.remove(); });
 pop.querySelector('[data-act="ok"]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); commitColumnTypeChange(true); });
 setTimeout(() => {
   const close = e => { if(!pop.contains(e.target) && e.target !== anchorEl){ pop.remove(); document.removeEventListener('mousedown', close, true); } };
   document.addEventListener('mousedown', close, true);
 }, 0);
}
```

> **Ghi chú cho Codex:** `.ss-pop-toggle-row` là class CSS mới, chưa có trong stylesheet — cần thêm style tối thiểu (`display:flex; align-items:center; gap:8px; margin:6px 0;`) vào `<style>` chung của file, đặt gần `.column-type-popover` hiện có.

#### 6.2.9 FR-11/FR-12 — Contact list: knownContacts riêng cột + enforce restrict

```js
// Sửa showContactPicker (6.1) — 2 chỗ thay đổi so với bản gốc, đánh dấu MỚI:
function showContactPicker(cell, row, col){
 const sheet = getActiveSheet();
 if(!sheet) return;
 document.querySelector('.contact-popover')?.remove();
 const rect = cell.getBoundingClientRect();
 const colConfig = getColumnConfig(col, sheet);
 const maxContacts = colConfig.maxContacts || 1;
 const restrictToList = !!colConfig.restrictToList;   // ← MỚI (FR-12)
 let selected = parseContactValue(ensureSheetCells(sheet)[row][col]);
 const pop = document.createElement('div');
 pop.className = 'contact-popover';
 pop.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
 pop.style.top = `${rect.bottom + 4}px`;
 pop.style.width = '280px';
 pop.style.padding = '10px';
 pop.innerHTML = `
 <input id="contactSearchInput" placeholder="Tìm tên hoặc email...">
 <div class="contact-list"></div>
 <div class="v19-muted">Có thể chọn tối đa ${maxContacts} người.</div>
 ${restrictToList ? '' : `
 <div class="v19-modal-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">
   <input id="newContactName" placeholder="Tên mới">
   <input id="newContactEmail" placeholder="email@domain.com">
 </div>`}
 <div class="v19-modal-actions" style="padding:8px 0 0;border-top:1px solid var(--line)">
 ${restrictToList ? '' : '<button class="v19-btn" type="button" data-act="add">Thêm mới</button>'}
 <button class="v19-btn primary" type="button" data-act="save">Lưu</button>
 </div>`;
 // ...phần render() list, event listener search/add/save GIỮ NGUYÊN như bản gốc (6.1),
 // chỉ khác: nút/handler [data-act="add"] chỉ tồn tại trong DOM khi !restrictToList, nên
 // đoạn code query `pop.querySelector('[data-act="add"]')` cần bọc trong `if(!restrictToList){ ... }`.
}
```

> **FR-11 (quản lý `knownContacts` riêng theo cột):** đơn giản hoá — thay vì xây thêm 1 UI riêng trong `openColumnTypePicker()`, tái dùng chính `showContactPicker()`: khi đang ở màn cấu hình cột (FR-10) và user gõ vào `#ctAddContactSearch` rồi Enter, push contact vào `configs[colIndex].knownContacts` (tạo mới nếu chưa có), hiển thị lại `#ctKnownList`. Không cần UI hoàn toàn mới — chỉ thêm 1 event listener nhỏ trong `renderExtraConfig('contact', ...)` ở 6.2.8.

---

### 6.3 Checklist kiểm tra trước khi nộp CODE_DIFF

- [ ] `node --check` pass trên file `.html` (chỉ cú pháp `<script>`, tách tạm ra `.js` để check rồi bỏ).
- [ ] Tạo cột `auto_number`, bấm "Thêm dòng" nhiều lần → số tăng đúng theo prefix/suffix/digits đã cấu hình.
- [ ] Xoá 1 row có auto_number ở giữa → các row còn lại **không bị đánh số lại** (NFR-03).
- [ ] Tạo cột `created_by`/`created_date` → thêm row mới → hiển thị đúng tên (từ `ensureAppUserName()`) + thời gian; các row cũ (tạo trước SPEC này) hiển thị "—", không lỗi.
- [ ] Sửa 1 cell bất kỳ trong 1 row → cột `modified_by`/`modified_date` (nếu có) cập nhật đúng ngay lập tức.
- [ ] Double-click vào cell `auto_number`/`created_by`/`created_date`/`modified_by`/`modified_date` → **không** mở editor (test `isEditableSheetCell` đã chặn đúng).
- [ ] Tạo cột `duration`, click vào cell → popover ngày/giờ hiện đúng, lưu xong hiển thị dạng rút gọn (`2d 4h`).
- [ ] Tạo cột `checkbox`, đổi style sang 🚩/⭐ → cell hiển thị đúng icon khi tick.
- [ ] Tạo cột `symbols` → chỉ thấy đúng 1 lựa chọn RYG, không có 8 bộ khác.
- [ ] Cột `contact` cũ (đã có từ trước SPEC) vẫn hoạt động y hệt — bật `restrictToList` chỉ ảnh hưởng cột vừa cấu hình, không ảnh hưởng cột khác.
- [ ] Test trên sheet **cũ** (chưa từng có `rowMeta.createdBy` v.v., load từ Drive) — không throw lỗi console.

---

*File thi công dự kiến:* `STAGING/giao-dien-desktop-don-gian_v24_quan.html` (copy từ v23 baseline, 9403 dòng).
