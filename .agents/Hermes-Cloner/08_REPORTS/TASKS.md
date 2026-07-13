# Tasks — Dashboard Configuration D1

> Workflow: UPDATE_EXISTING_PROJECT
> File: `BANDIAO/giao-dien-desktop-don-gian_v23_quan.html` (10250 dòng)

---

## TASK-D1-1: Theme CSS + Dashboard container HTML + openDashboard() JS

### Goal
Thêm CSS dashboard theme, container HTML dashboard-view, hàm openDashboard() + dispatch trong openSheet().

### Allowed Files
- `BANDIAO/giao-dien-desktop-don-gian_v23_quan.html`

### Forbidden Files
- Không sửa code JS có sẵn (chỉ thêm dispatch line trong openSheet + thêm hàm mới)

### Dependencies
- None

### Acceptance Criteria
- [ ] CSS variables dashboard (#5A43D7 theme) được thêm vào :root
- [ ] `.dashboard-view` container HTML tồn tại (ẩn mặc định)
- [ ] `openSheet()` có dispatch `type === 'dashboard'` → `openDashboard()`
- [ ] Dashboard view hiển thị khi mở item type dashboard
- [ ] `dashboardView.style.display='flex'` khi mở, các view khác ẩn

### Rollback Note
Restore BANDIAO từ backup.

---

## TASK-D1-2: Dashboard grid 12 cột + Widget card base

### Goal
Lưới 12 cột CSS grid + widget card nền trắng bo 10px.

### Dependencies
- TASK-D1-1

### Acceptance Criteria
- [ ] `.dashboard-grid` CSS grid 12 cột gap 14px max-width 1200px
- [ ] Widget card `.dash-card` nền trắng viền #E8E8EE bo 10px
- [ ] `span` class hỗ trợ (span-1 đến span-12)
- [ ] Widget body có slot cho nội dung động

---

## TASK-D1-3: TITLE widget renderer

### Goal
Widget loại TITLE — banner gradient #4735B3→#5A43D7 hoặc tiêu đề thường.

### Dependencies
- TASK-D1-2

### Acceptance Criteria
- [ ] `renderTitleWidget(config)` tạo banner/title HTML
- [ ] Hỗ trợ style: 'banner' (gradient) và 'default' (plain)
- [ ] Hiển thị title + subtitle

---

## TASK-D1-4: METRIC widget (động, aggregate từ nguồn)

### Goal
Widget METRIC — đọc 1 sheet nguồn, aggregate 1 cột (count/sum/avg/min/max), hiển thị KPI.

### Dependencies
- TASK-D1-2

### Acceptance Criteria
- [ ] `renderMetricWidget(config, sheetData)` render KPI
- [ ] Hỗ trợ agg: count / sum / avg / min / max
- [ ] Tone: info (tím), ok (xanh), warn (vàng), red (đỏ)
- [ ] Đọc sheet nguồn thật qua `loadSheetDataFromWebApp()`

---

## TASK-D1-5: SHORTCUT widget

### Goal
Widget SHORTCUT — danh sách link mở sheet/report/URL.

### Dependencies
- TASK-D1-2

### Acceptance Criteria
- [ ] `renderShortcutWidget(config)` render link list
- [ ] Click mở sheet (gọi openSheet), report (gọi openReport), URL (window.open)

---

## TASK-D1-6: REPORT widget (embedded table)

### Goal
Widget REPORT — bảng nhúng từ sheet/report nguồn, giới hạn N hàng, pill trạng thái.

### Dependencies
- TASK-D1-2

### Acceptance Criteria
- [ ] `renderReportWidget(config, reportData)` render table HTML
- [ ] Giới hạn config.limit hàng
- [ ] Cột có status pill (màu xanh/đỏ/cam)

---

## TASK-D1-7: Dashboard toolbar + Làm mới

### Goal
Toolbar trên cùng dashboard với nút Làm mới (refresh all widgets).

### Dependencies
- All widget tasks (D1-3 to D1-6)

### Acceptance Criteria
- [ ] Dashboard toolbar HTML có nút Làm mới
- [ ] Refresh → gọi lại source từng widget → re-render toàn bộ

---

## TASK-D1-8: Kiểm tra + hoàn thiện D1

### Goal
Div balance check, console test, regression trên Grid + Report.

### Dependencies
- All D1 tasks

### Acceptance Criteria
- [ ] Div balance = 0 (hoặc chênh lệch không đổi so với baseline)
- [ ] Grid sheet vẫn hoạt động bình thường
- [ ] Report view vẫn hoạt động bình thường
- [ ] Context menu + workspace item vẫn hoạt động
