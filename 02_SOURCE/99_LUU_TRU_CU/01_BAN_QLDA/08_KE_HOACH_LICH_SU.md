# Planning — Kế hoạch nghiên cứu & tính năng App QLDA

> **Đổi tên 04/07/2026 theo yêu cầu Quân**: file này là bản chính thức, thay cho `KE_HOACH_NGHIEN_CUU_SMARTSHEET.md`.
>
> **CẬP NHẬT 07/07/2026**: Đã đọc lại code baseline v17 để đối chiếu. Role mới: Phuc = nghiên cứu, quan đại gia = code, Claude = điều phối + duyệt (xem `DIEU_PHOI.md`). Các mục dưới đây đã được cập nhật theo code thật trong v17.
>
> **SOP MỚI 07/07/2026**: Quy trình mới — **Tư vấn thiết kế → Nhà thầu (chọn 1-5 specs) → Code → Bàn giao Quản lý nghiệm thu**. Design Consultant (AI Research) viết SPEC trực tiếp và bàn giao cho Nhà thầu (không cần chờ Ban QLDA duyệt trước). Nhà thầu chọn spec để code, xong bàn giao cho Quản lý (Ban QLDA) nghiệm thu.

Mục tiêu: xác định tính năng Smartsheet nào đáng copy vào app quản lý dự án xây dựng, theo khung skill `app-feature-research` (đánh giá ✅/⚠️/❌ theo khả năng làm bằng Apps Script). **Loại trừ tuyệt đối Gantt chart / theo dõi tiến độ** — quy tắc cứng đã chốt.

**Quy ước:** file này chỉ chứa **ý tưởng/tính năng CHƯA làm xong**. Làm xong → xoá khỏi đây, ghi chi tiết vào `NHAT_KY_LAM_VIEC.md`. Việc đang giao cho ai → xem `Quan_to_do_list.md` / `Phuc_to_do_list.md`.

## 1. Đã triển khai xong (không đề xuất lại) — chi tiết ở `NHAT_KY_LAM_VIEC.md`

- Sort / Filter / Format kiểu Smartsheet; Row hierarchy (thụt dòng)
- Reports — row report gộp nhiều Sheet/dự án, sửa trực tiếp trong Report, dòng Tổng ghim đầu, toolbar hiện số lượng (tính năng "click Nguồn nhảy Sheet gốc" đã BỎ theo yêu cầu Quân)
- Định dạng chữ B/I/U/S, màu chữ/nền, căn lề, xoá định dạng; Format Painter 🖌 (kèm lock mode)
- Column Types (Dropdown/Date/Checkbox/Number) — code xong (trong v17)
- Import Excel/CSV vào Sheet có sẵn (append/replace/merge) — **code xong v17, đã nghiệm thu** ✅
- Giao diện responsive điện thoại; sidebar gọn kiểu Smartsheet; back/forward; kéo đổi độ rộng cột
- Đính kèm file theo dòng (bấm 📎 cột A); Lưu dữ liệu lên Drive (persistence) — đã code, **chờ deploy** (`HUONG_DAN.md` mục 3)

## 2. Các mảng ưu tiên — trạng thái nghiên cứu

| # | Mảng | Vì sao ưu tiên | Trạng thái |
|---|---|---|---|
| 1 | **Forms** | Báo cáo hiện trường trên điện thoại, không sợ sửa nhầm ô | ✅ Nghiên cứu xong → mục 12, chờ deploy |
| 2 | **Automation/Notification** | Nhắc hạn thẩm định/phê duyệt — sát quy trình 7 bước | ✅ Nghiên cứu xong → mục 13, chờ deploy |
| 3 | Contact column + người phụ trách | Gán trách nhiệm từng dòng | Chưa nghiên cứu sâu |
| 4 | Comment theo dòng | Trao đổi không cần chat ngoài | Chưa nghiên cứu sâu |
| 5 | Phân quyền chia sẻ theo vai trò | Chủ đầu tư xem không sửa | Thay bằng **Publish Report** (mục 5) — rẻ hơn nhiều |
| 6 | Xem file đính kèm trên iPhone Safari | Gap đã biết, ảnh hưởng công trường | Chưa nghiên cứu sâu |
| 7 | **Import Excel/CSV vào Sheet có sẵn** | Smartsheet KHÔNG có — điểm vượt trội | ✅ Code xong v17 — đã nghiệm thu (chi tiết mục 11) |

## 3. Phương pháp nghiên cứu (skill `app-feature-research`)

web_search docs chính thức → web_fetch đọc sâu → forum tìm giới hạn thật → đánh giá ✅/⚠️/❌ → bảng `Tính năng | Smartsheet làm thế nào | Apps Script | Ghi chú` → đề xuất 1-3 tính năng đáng làm nhất. Bổ sung: sổ tay NotebookLM "So tay Smartsheet" (51 nguồn) hỏi trực tiếp; Playwright MCP xem UI thật/test local; Claude in Chrome cho tài khoản Smartsheet thật của Quân.

## 4. Checklist còn mở — Sheet (CẬP NHẬT 07/07/2026 — đã đối chiếu code thật)

| Tính năng | Smartsheet làm thế nào | Apps Script | Code v17? | Ghi chú triển khai |
|---|---|---|---|---|
| Định dạng số/ngày/tiền tệ (phẩy nghìn, %, VNĐ) | Nút định dạng số trên toolbar | ✅ | ❌ Chưa code | Format hiển thị, không đổi giá trị gốc |
| Highlight Changes (ô mới sửa tự nổi màu) | Bật chế độ theo thời gian | ✅ | ❌ Chưa code | Lưu `lastEditedAt` mỗi ô |
| Copy-paste nhiều ô từ Excel | Dán khối ô, tách theo tab/dòng | ✅ | ❌ Chưa code | Bắt event `paste`, tách `\t`/`\n` |
| Data validation cột | Cảnh báo khi nhập sai | ✅ | ❌ Chưa code | Đi kèm cột Dropdown/Số |
| Tìm kiếm trong Sheet (Ctrl+F) | Ô tìm luôn có trên toolbar | ✅ | ✅ **Có** — `ssSearchInput` | Đã có, lọc theo text |
| Freeze cột/dòng khi cuộn | Cột/dòng đầu cố định | ✅ | ✅ **Có** — `position:sticky` trên thead | CSS sẵn |
| Undo/Redo | Ctrl+Z | ⚠️ | ❌ Chưa code | Tự xây stack lịch sử — công sức vừa |
| Xuất Excel/PDF/In | Nút Export | ⚠️ | ✅ **Có** Excel — `exportSheetToExcel` | Apps Script dựng Google Sheet tạm rồi xuất |
| Khoá cột/dòng theo người dùng | Owner khoá, chỉ định ai sửa | ⚠️ | ❌ Chưa code | Không có OAuth người xem — chỉ khoá bật/tắt chung |
| Cell History | Xem ai sửa gì khi nào | ❌ | ❌ Không làm | Quá tốn công so với lợi ích |

Lưu ý: cỡ chữ / font / wrap text CHƯA có trong bản định dạng chữ đã làm — việc mở, làm tiếp trên style per-cell sẵn có.

### Bổ sung 04/07/2026 — tính năng Quân chấm điểm (Value/Effort/Quarter) + CẬP NHẬT 07/07/2026 theo code thật

| Tính năng | Value | Effort | Quarter | Code? |
|---|---|---|---|---|---|
| Favorite / Recent Projects | ⭐⭐⭐⭐⭐ | ⭐ | Q1 | ✅ **Có code (v17)** — favorites popover + search + toggle |
| Template Project | ⭐⭐⭐⭐⭐ | ⭐⭐ | Q1 | ❌ Chưa code |
| Duplicate Sheet | ⭐⭐⭐⭐⭐ | ⭐⭐ | Q1 | ❌ Chưa code |
| Column Visibility (ẩn/hiện cột) | ⭐⭐⭐⭐☆ | ⭐ | Q2 | ⚠️ Có trong Report (`hiddenCols`), **chưa có cho Grid Sheet** |
| Bulk Edit (sửa hàng loạt nhiều dòng cùng lúc) | — | — | — | ❌ Chưa code |

**CẬP NHẬT 07/07/2026**: Favorites/Recent đã có code thật (UI + logic) trong v17. Import CSV đã hoàn thành. Các tính năng còn lại (Template, Duplicate, Column Visibility cho Sheet, Bulk Edit) chưa ai bắt đầu do đợi deploy OAuth và phân công mới.

## 5. Checklist còn mở — Reports

| Tính năng | Smartsheet làm thế nào | Apps Script | Ghi chú triển khai |
|---|---|---|---|
| **Sheet Summary Report** | Gộp summary field cấp-sheet của nhiều Sheet thành báo cáo portfolio. **Cơ chế (NotebookLM 04/07)**: summary field = panel phải của sheet, kiểu field như cột (Text/Number, Contact, Date, Dropdown, Checkbox, Symbols), có công thức; report: **mỗi sheet nguồn = 1 dòng**, cột = field chọn trong Columns to Display; **gộp theo "tên field + kiểu giống hệt"** (lệch kiểu → tách 2 cột); sửa 2 chiều nếu không chứa công thức; nguồn theo Workspace (sheet mới tự vào) hoặc Folder (tĩnh) | ⚠️ | App làm gọn: `sheet._summaryFields` + panel nhỏ bên phải; màn hình report mỗi Sheet 1 dòng. Bộ cột cố định → quy tắc "tên+kiểu giống hệt" tự thoả. Không vi phạm no-Gantt |
| Gửi Report qua email theo lịch | Scheduled send | ✅ | Trigger định kỳ + `MailApp` — gộp với Automation (mục 13) |
| **Publish Report** (link chỉ xem, không cần đăng nhập) | URL công khai, dữ liệu luôn tươi, tắt được bất kỳ lúc nào | ⚠️ | **SPEC ĐÃ VIẾT XONG: `specs/publish-report/spec.md`** (UUID chống IDOR, `?mode=readonly`, LockService, 7 tiêu chí nghiệm thu). Chờ deploy |
| Nhóm tối đa 3 cấp | "Up to three groups per report" | ✅ | App đang 1 cấp — nâng nếu Quân cần (hỏi trước) |
| Summarize THEO TỪNG NHÓM | SUM/COUNT/MIN/MAX/AVG hiện trên header nhóm | ✅ | Tái dùng code dòng Tổng sẵn có |

**Phát hiện forum**: Publish Report giải quyết luôn nhu cầu "phân quyền chia sẻ" (mục 2 #5) — người xem không cần được share Sheet gốc.

**Nghiên cứu dở (03/07)**: flow TẠO Report trên Smartsheet thật — còn thiếu: màn hình chọn Summary Field, toolbar Sheet Summary Report, flow Row Report sau bước Location.

## 6-7. Kiểm chứng thật + đề xuất làm trước

- Đã kiểm chứng trên tài khoản Smartsheet thật của Quân (workspace DAP608.CC2-HGV): menu Automation 3 lựa chọn (template/từ đầu/quản lý) — đúng như research.
- Đề xuất thứ tự làm: xem **hàng đợi Q1–Q7** trong `Quan_to_do_list.md` / `Phuc_to_do_list.md` (đã thay bảng giao việc cũ).

## 8. Quy tắc cứng xuyên suốt

- **TUYỆT ĐỐI KHÔNG Gantt chart / progress tracking.**
- Chỉ Apps Script thuần (`DriveApp`, `SpreadsheetApp`, `HtmlService`) — không thư viện ngoài, không hosting riêng, không DB ngoài Drive/Sheets.
- Mọi Sheet dùng chung 1 bộ cột cố định.

## 9. Ý tưởng: app tự bắn email báo hoàn tất (Apps Script)

Hàm mẫu `baoCaoHoanTat(tenTacVu, linkFile, ghiChu)` dùng `MailApp.sendEmail` — đã có bản standalone `apps-script/baoCaoCaNhan.gs` (việc riêng Quân). Khi triển khai chính thức thì gộp vào mảng Automation (mục 13).

## 10. Công cụ & khung đánh giá bổ sung

- Công cụ theo tình huống: Firecrawl (quét tổng quan, nếu có) / `web_fetch` (đọc sâu 1 URL) / Playwright MCP (xem UI + test local) / Claude in Chrome (tài khoản Smartsheet thật của Quân — Browserbase không dùng cho việc này vì không có cookie đăng nhập).
- Trang nên đọc: `smartsheet.com/platform/features`, `help.smartsheet.com` (learning track: Automation, Forms, Reports, Dashboards, Board View, Create Sheet), `smartsheet.com/pricing`, `/platform/features/ai`.
- Nhóm tính năng để tra khi cần (không phải danh sách sẽ làm): Core Sheet, Workflow, Reporting & Dashboard, Collaboration & Permission, AI Features. (Đã loại Gantt/Timeline/Baseline khỏi danh sách tra cứu.)
- Khung chấm điểm 1-3: Giá trị người dùng / Độ khó kỹ thuật / Khác biệt sản phẩm / Phụ thuộc hệ thống.
- Mẫu bảng backlog chi tiết: `Module | Tính năng | Mô tả | Nguồn | Giá trị | Độ khó | Ưu tiên | Ghi chú UI`.

## 11. Import Excel/CSV (CODE XONG v17, ĐÃ NGHIỆM THU ✅)

| Tính năng | Smartsheet làm thế nào | Apps Script | Ghi chú triển khai |
|---|---|---|---|
| Import tạo Sheet mới | +Create → Import, chỉ tab đầu, 50MB/20.000 dòng/400 cột, mất formula/validation/merge | ✅ | .csv parse tay; .xlsx dùng Advanced Drive Service (`Drive.Files.create {convert:true}`) → Google Sheet tạm → `getValues()` → xoá tạm |
| **Import vào Sheet có sẵn** (append/replace/merge theo cột khoá) | **KHÔNG CÓ** (doc chính thức: "Each import creates a new sheet") — gap thật, app vượt Smartsheet | ✅ | 3 chế độ: Nối cuối / Thay toàn bộ / Gộp theo cột khoá |
| Map cột nguồn ↔ đích | Bắt buộc chọn Primary column | ✅ | Bộ cột cố định → khớp gần đúng tên + cho chọn tay |
| Chuẩn hoá ngày/số khi import | Lệch định dạng ngày dễ lỗi | ⚠️ | Chuẩn về ISO trước khi lưu |

Quy mô thật ~500 dòng/lần → không cần batch. Case test bắt buộc: BOM UTF-8, delimiter `;`, dấu phẩy trong ngoặc kép, CRLF, dòng trống cuối, khoá trùng.

## 12. Checklist còn mở — Forms (nghiên cứu xong 04/07/2026)

Form gắn 1 sheet, ai có link điền được không cần login, submit thành dòng mới — hợp mô hình Web App "Execute as: Me".

| Tính năng | Smartsheet làm thế nào | Apps Script | Ghi chú triển khai |
|---|---|---|---|
| Form công khai → thêm dòng vào Sheet | Share link, không cần login | ✅ | `doGet ?mode=form&formId=UUID` render trang gọn; submit append vào `data.json`. Chung hạ tầng map UUID với Publish Report |
| Field đúng kiểu cột | Sinh từ loại cột, validate | ✅ | Tái dùng `SHEET_COLUMN_CONFIG` |
| Required + validation | Đánh dấu required | ✅ | HTML5 + check server |
| Prefill qua query param, ẩn field | `?field=value` | ✅ | Đọc `e.parameter` |
| Đính kèm file khi submit | CHỈ 1 field upload/form, 10 file & 30MB/file (forum kêu nhiều) | ⚠️ | Base64 qua `google.script.run` vào `Dinh kem/`; app cho nhiều field được (vượt Smartsheet); >50MB không khả thi |
| Conditional logic ẩn/hiện câu hỏi | Có trong builder | ⚠️ | Giai đoạn 2 |
| Gửi bản sao cho người điền | "Send me a copy" | ✅ | `MailApp` (quota 100/ngày — đủ) |
| Nhiều form / 1 Sheet | Có | ✅ | Map `formId → {project, sheet, field config}` |

**⚠️ Bắt buộc**: `LockService.getScriptLock()` bọc đọc-append-ghi `data.json` — chống 2 người submit cùng lúc ghi đè mất dòng. **Phụ thuộc**: deploy (việc #3 của Quân).

## 13. Checklist còn mở — Automation / Notification (nghiên cứu xong 04/07/2026)

Workflow = Trigger (dòng thêm/đổi, đến ngày, định kỳ) → Condition (lọc) → Action. Forum kêu nhiều nhất: notification không gửi do lọc "thay đổi của chính mình" + bắt buộc cột Contact — app tự làm né được cả 2.

| Tính năng | Smartsheet | Apps Script | Ghi chú |
|---|---|---|---|
| Nhắc hạn theo ngày (X ngày trước hạn) | "When a date is reached", lặp ngày/tuần/tháng | ✅ | ClockTrigger mỗi sáng quét `data.json`, gộp 1 email — **MVP đáng làm nhất** |
| Alert khi trạng thái đổi (sang Đỏ) | "When rows change" | ⚠️ | Hook trong `luuDuLieuSheet` so cũ/mới — phát hiện lúc lưu, đủ dùng |
| Báo cáo định kỳ qua email | Scheduled send | ✅ | Gộp chung 1 lần với nhắc hạn |
| Update/Approval request | Email link sửa đúng 1 dòng | ⚠️ | = Forms + prefill `rowId` — làm SAU Forms |
| UI builder kéo-thả | Màn hình block | ❌ | Thay bằng vài rule cố định bật/tắt trong màn Cài đặt nhỏ |
| Khoá/move/copy dòng tự động | Action blocks | ❌ | Chưa có nhu cầu — bỏ |

**Chi tiết từ NotebookLM (dùng khi viết spec Q5)**: người nhận = email cố định HOẶC theo Contact column từng dòng; nội dung email dùng placeholder `{{Tên cột}}` (string replace); chế độ gom ngày = bảng lưới ≤100 dòng/email — xác nhận đúng MVP email gộp; Update Request người nhận không cần tài khoản, chỉ thấy 1 dòng; guard chống vòng lặp: chỉ báo khi giá trị ĐỔI sang đỏ. Giới hạn gốc: 150 workflow/sheet, 100 block, 30 action, 20 điều kiện/block, condition path trái→phải.

**Quota**: MailApp 100 mail/ngày, trigger 90 phút/ngày — dư. **Phụ thuộc**: deploy; trigger cài trên tài khoản haingocphuc2025@gmail.com (mail gửi TỪ đó).

## 14. Checklist còn mở — Conditional Formatting + Saved Filter (nghiên cứu xong 04/07/2026 — ứng viên Q1)

Rule = điều kiện → định dạng → phạm vi (ô / cả dòng); xếp thứ tự trên→dưới; bật/tắt/clone; không đổi giá trị ô.

| Tính năng | Smartsheet | Apps Script | Ghi chú |
|---|---|---|---|
| Rule tô màu ô/cả dòng theo điều kiện | Danh sách rule có thứ tự | ✅ | Tái dùng logic Filter + `_cellStyles`; mảng `sheet._condFormatRules`; tính style lúc render |
| Rule theo loại cột (date "quá hạn"/"trong X ngày") | Criteria theo column type | ✅ | Khớp `SHEET_COLUMN_CONFIG` — làm SAU khi việc #1 nghiệm thu |
| Thứ tự ưu tiên + bật/tắt rule | Kéo thứ tự, toggle | ✅ | Mảng có thứ tự + cờ `enabled` |
| Lưu rule lâu dài | Theo sheet | ✅ | Nhét vào payload `savesheet` |
| **Saved/Named Filter** | Lưu bộ lọc thành tên, chọn lại 1 phát | ✅ | Thêm nút "Lưu bộ lọc..." + dropdown — rất rẻ, làm kèm |

**Chi tiết từ NotebookLM — AI code làm Q1 PHẢI theo**: toán tử theo loại cột (checkbox: is/is not checked; date: past/today/next X days/between; dropdown: is any of/is not any of; text-number: equal/greater/less/between/blank); nhiều rule: thuộc tính không xung đột thì GỘP, xung đột thì rule trên thắng; **quyết định thiết kế app (Claude chốt): style điều kiện là LỚP PHỦ lúc render, KHÔNG ghi vào `_cellStyles`** (khác Smartsheet — giữ style tay của người dùng); giới hạn: chỉ so dữ liệu cùng dòng, không đổi chiều cao/viền, giới hạn mềm ~20 rule/sheet.

**Giá trị**: nhìn bảng thấy ngay hồ sơ quá hạn (đỏ)/sắp hạn (vàng) — không vi phạm cấm Gantt.

## 15. Formulas / Cell linking — KHUYẾN NGHỊ LÀM RẤT GỌN

| Tính năng | Apps Script | Lý do |
|---|---|---|
| Công thức gõ tay trong ô (=SUM...) | ❌ | Cần parser + dependency graph — quá tốn công, dễ lỗi |
| Dòng tổng SUM/COUNT/MIN/MAX/AVG cho cột số | ✅ | Đem cơ chế dòng Tổng của Report về Sheet — đủ dùng, không cần parser |
| Cross-sheet reference / Cell linking | ❌ | Chính Smartsheet còn gãy link khi dòng di chuyển; Report đã lo nhu cầu gộp |

## 16. Checklist còn mở — tính năng mới tìm từ NotebookLM "So tay Smartsheet" (04/07/2026)

Hỏi trực tiếp sổ tay: "liệt kê TẤT CẢ tính năng/module chính của Smartsheet, không chỉ Reports/Automation/Forms". Đối chiếu với các mục đã có ở trên, lọc ra tính năng CHƯA có trong Planning:

| Tính năng | Smartsheet làm thế nào | Apps Script | Ghi chú |
|---|---|---|---|
| **Symbols Column** (cột biểu tượng) | Đèn giao thông/cờ/sao đánh dấu trạng thái trực quan | ✅ | Mở rộng nhẹ từ Column Types (việc #1 quan đại gia) — thêm 1 kiểu cột render icon thay vì text |
| **Multi-select Dropdown** | 1 ô chọn được nhiều giá trị cùng lúc | ✅ | Mở rộng Column Types — đổi popover chọn 1 giá trị thành checkbox-list |
| **Move/Copy Row giữa các Sheet** | Chuyển/sao chép hàng sang Sheet khác để lưu lịch sử hoặc chuyển giai đoạn dự án | ✅ | Tái dùng kiến trúc cross-sheet đã có ở Report (chọn dự án/Sheet đích) |
| **Card View** (kiểu Kanban) | Nhóm thẻ theo cột trạng thái/người phụ trách, kéo-thả đổi trạng thái | ✅ | View mới bên cạnh Grid — không phải Gantt/tiến độ nên không vi phạm quy tắc cấm; công sức vừa (cần thêm chế độ hiển thị + kéo-thả) |
| **Calendar View** | Hiển thị tác vụ lên lưới lịch dựa theo 1 cột ngày | ✅ | View mới, dùng cột ngày có sẵn — không phải Gantt (không có thanh tiến độ/phụ thuộc) |
| Hierarchy Formulas: `PARENT()`/`CHILDREN()`/`ANCESTORS()` | Tính tự động dựa trên cây phân cấp (khác công thức gõ tay tự do) | ⚠️ | Nhẹ hơn parser công thức đầy đủ (mục 15) — có thể làm dạng "cột tính sẵn" (vd tự đếm số dòng con) thay vì ngôn ngữ công thức chung |
| Lock Row/Column | Ngăn người không phải Admin sửa hàng/cột/ô chứa công thức | ⚠️ | Đã có trong mục 4 ("Khoá cột/dòng theo người dùng") — xác nhận lại: không có OAuth theo người xem nên chỉ khoá bật/tắt chung được |
| Cell Linking xuyên Sheet | Kết nối trực tiếp 1 ô ở Sheet này với 1 ô ở Sheet khác | ❌ | Đã đánh giá ở mục 15 — Report đã lo nhu cầu gộp, tự làm cell linking dễ gãy khi hàng di chuyển (chính Smartsheet cũng bị) |
| **Proofing** (duyệt file thiết kế/PDF/video) | Tải lên, đánh dấu, thảo luận, phê duyệt file ngay trong ngữ cảnh 1 hàng | ⚠️ | Mức cơ bản (nút Duyệt/Từ chối + bình luận trên file đính kèm có sẵn) khả thi; mức đầy đủ (đánh dấu/markup trực tiếp lên PDF/video) quá tốn công, không làm |
| Resource Management | Theo dõi phân bổ nhân sự, khối lượng công việc, ngân sách | ❌ | Cần hạ tầng đa người dùng (ai đang làm gì) mà app không có — bỏ |
| Dashboard Widget kiểu Timeline | Widget hiển thị mốc thời gian trên Dashboard tổng | ❌ | Né vì gần giống Gantt/theo dõi tiến độ — vi phạm quy tắc cấm mục 8 |

**Đề xuất xếp hàng đợi**: Symbols Column + Multi-select Dropdown gộp vào việc #1 (Column Types) của quan đại gia — cùng phạm vi, làm 1 lần cho gọn. Move/Copy Row + Card View + Calendar View xếp vào hàng đợi Phuc (sau các việc UI #3-7 đã giao) vì cùng nhóm "tính năng tổ chức/hiển thị Sheet".

Sources: sổ tay NotebookLM "So tay Smartsheet - Cau truc & Huong dan su dung" (51 nguồn), hỏi trực tiếp 04/07/2026.

## Sources chính (04/07/2026)

- [Conditional formatting](https://help.smartsheet.com/articles/516359-conditional-formatting) / [Manage rules](https://help.smartsheet.com/articles/2482629-manage-conditional-formatting-rules)
- [Cross-sheet references](https://help.smartsheet.com/articles/2482644-create-cross-sheet-references) · [Build a row report](https://help.smartsheet.com/articles/2482078-build-a-row-report-with-report-builder) / [Grouping](https://help.smartsheet.com/articles/2482082-configure-grouping-to-organize-results-in-report-builder)
- [FAQ Forms](https://help.smartsheet.com/articles/2482754-FAQ-Smartsheet-Forms) · [Trigger](https://help.smartsheet.com/articles/2479236-trigger-blocks-when-your-workflow-is-executed) / [Action](https://help.smartsheet.com/articles/2479246-action-blocks-specify-what-kind-of-automation-is-triggered) / [Condition blocks](https://help.smartsheet.com/articles/2479251-condition-blocks-filter-what-your-automated-workflows-send)
- Forum: [1 field upload/form](https://community.smartsheet.com/discussion/87266/any-plans-to-allow-more-than-one-upload-field-on-a-form) · [10 file/30MB](https://community.smartsheet.com/discussion/25971/attachment-in-an-online-form) · [notification không gửi](https://community.smartsheet.com/discussion/78749/notification-automation-not-working)
- [Web Apps | Apps Script](https://developers.google.com/apps-script/guides/web) (bảo mật Publish) · [Format your data](https://help.smartsheet.com/articles/518246-formatting-options)
- Sổ tay NotebookLM "So tay Smartsheet - Cau truc & Huong dan su dung" (51 nguồn Learning Center)

## === NHẬT KÝ PHIÊN 07/07/2026 ===

### Việc đã làm trong phiên
1. **Đổi hướng phân công** — Quân xác nhận quy trình mới: Phuc (nghiên cứu) → Claude (duyệt) → giao việc → quan đại gia (code) → Claude (nghiệm thu)
2. **Patch HUONG_DAN.md** — viết lại mục "Phân công vai trò" theo quy trình mới
3. **Viết lại DIEU_PHOI.md** — cờ 🟢, hàng đợi Phuc (nghiên cứu) + hàng đợi quan đại gia (code), danh tính mới, vấn đề cũ đã giải quyết
4. **Viết lại Phuc_to_do_list.md** — vai trò nghiên cứu (KHÔNG code), quy trình 3 mục
5. **Viết lại Quan_to_do_list.md** — vai trò code writer, quy trình 5 mục
6. **Vẽ lưu đồ quy trình** — file HTML tại C:\Users\trinh\Downloads\luu-do-quy-trinh-moi.html
7. **Đọc code baseline v17** (5.205 dòng) để cập nhật Planning.md với tình trạng code thật
8. **Cập nhật Planning.md** — thêm cột Code v17?, cập nhật trạng thái các tính năng theo code thật

### Tình trạng cuối phiên
| Mục | Trạng thái |
|---|---|
| **Cờ làm việc** | 🟢 Không có ai đang làm |
| **Phuc** | 🟢 Sẵn sàng — chờ giao việc nghiên cứu đầu tiên |
| **Quan đại gia** | 🟢 Chờ — chỉ code sau khi Claude duyệt info từ Phuc |
| **Claude** | 🟢 Sẵn sàng — chờ Phuc nộp info để duyệt |
| **HUONG_DAN.md** | ✅ Đã patch phân công mới |
| **DIEU_PHOI.md** | ✅ Đã viết lại theo quy trình mới |
| **Phuc_to_do_list.md** | ✅ Viết lại cho vai trò nghiên cứu |
| **Quan_to_do_list.md** | ✅ Viết lại cho vai trò code writer |
| **Planning.md** | ✅ Đã cập nhật với dữ liệu code thật |

### Hàng đợi chờ giao (trong DIEU_PHOI.md)
**Phuc nghiên cứu (theo thứ tự):** Symbols Column → Multi-select Dropdown → Conditional Formatting → Forms → Automation

**Quan đại gia code (chỉ sau khi Claude duyệt):** Column Types hoàn thiện → Conditional Formatting + Saved Filter → Forms → Publish Report → Automation MVP
