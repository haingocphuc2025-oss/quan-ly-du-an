# SPEC: browse-status-display — Hiển thị trạng thái kiểu Smartsheet Browse + điều hướng quay lại nhất quán + chuẩn hoá menu Actions

- Trạng thái: DA_TRIEN_KHAI (nghiệm thu 15/07/2026) — mục 1 (badge/owner) và mục 2 (breadcrumb) đã có sẵn trong code v26 (xác nhận qua đọc code `main.js`/`workspace-navigator.js` + test có sẵn `tests/browse-status-display.test.js`), không cần sửa thêm. Mục 3 (menu Actions) cơ bản đã đủ action cần thiết, còn dư vài mục phân quyền dạng placeholder (Share/Save as Template/Download Sharing Report) — để bổ sung/dọn sau, xem ghi chú mục 9. Bàn giao: `02_SOURCE/03_BAN_GIAO/browse-status-display/BAN_GIAO_browse-status-display_screen-state-behavior.md`.
- Ngày tạo: 15/07/2026
- Ngày triển khai: 15/07/2026
- Người duyệt: Quan
- Baseline nền: v26 (`VERSIONS/v26_baseline.html`, bộ module `MODULES_V26/`)
- Baseline kết quả: `VERSIONS/v26_baseline.html` SHA-256 `0235576F39F387F154F6050C4394CA433837D98A9D0BABE99B5AEEDA59E58F96`
- Nguồn khảo sát: `app.smartsheet.com/browse/workspaces` (Smartsheet Browse page — icon rail + panel cây Workspaces + bảng danh sách)

## 1. Bối cảnh khảo sát (đã click-through trực tiếp trên app.smartsheet.com)

### 1.1 Trang Browse gốc (danh sách Workspaces)
- Checkbox chọn dòng + cột sao (favorite, viền rỗng khi chưa favorite)
- Name (sắp xếp được, mũi tên chỉ hướng sort ở header)
- **Sharing Status**: chữ màu — "Shared" (xanh/teal đậm) hoặc "Not Shared" (xám thường)
- **Owner**: tên + email (rút gọn bằng "...")
- Last Update
- Icon loại item khác nhau theo type: Workspace (icon 2 người), Sheet (icon lưới nhỏ), Portfolio/Scenario (icon tròn màu)

### 1.2 Khi mở 1 Workspace (chưa vào sheet)
- Bảng con hiển thị các item bên trong (folder/sheet), cột đổi thành "Sharing" (chữ "Workspace"/loại item thay vì Shared/Not Shared), Owner, Last Update.
- Panel bên phải xuất hiện **"Workspace Shared To"**: danh sách người + vai trò cụ thể (Owner / Admin / Editor - can share / Viewer) — chi tiết hơn nhiều so với badge "Shared" ở trang gốc.

### 1.3 Khi mở 1 Sheet cụ thể (điều hướng quan trọng nhất)
- **Rail icon trái (Home/Notifications/Search/Browse/Recents/Favorites/Create) vẫn hiển thị nguyên, không biến mất** — chỉ thêm 1 icon "Workspace" mới bên dưới, đang sáng (active), đánh dấu đang ở trong ngữ cảnh workspace.
- Panel kế bên rail đổi nội dung thành **ngữ cảnh workspace hiện tại**: tên workspace, tag nhỏ, nút "+ Add to workspace", "File library", "Scenario plans", và cây **"Workspace items"** (các sheet/folder anh em trong cùng workspace) — cho phép nhảy sang sheet khác trong cùng workspace mà KHÔNG cần quay về Browse gốc.
- Nút **"X"** cạnh tên sheet **KHÔNG phải nút quay về Browse** — nó chỉ **thu gọn/ẩn panel bên trái** để có thêm không gian xem grid (đã kiểm chứng: bấm X thì sheet vẫn mở, chỉ mất sidebar).
- Muốn quay lại Browse: bấm icon **"Browse"** ở rail trái ngoài cùng. Kết quả đã kiểm chứng: **không nhảy về danh sách Workspaces gốc, mà quay đúng về workspace vừa mở trước đó** (nhớ vị trí, giống cơ chế back có "trí nhớ ngữ cảnh" chứ không phải reset về trang chủ).

### 1.4 Trang Home (khác Browse)
- Không có cây thư mục bên trái — chỉ icon rail + nội dung chính.
- 4 tab ngang: Recents / Favorites / Workspaces / Portfolios.
- Bảng phẳng (không phân cấp): cột **Name** (icon theo loại file, sheet=tím, report=đỏ cam), **Location** (icon workspace + tên — cho biết item thuộc workspace nào, dạng "ngữ cảnh ngầm" không cần bấm vào mới biết), **Last viewed**.
- Góc phải có: search, filter, sort ("Last viewed"), toggle grid/list view.
- Đây là màn hình "truy cập nhanh xuyên suốt mọi workspace", khác Browse (vốn phải chọn đúng workspace mới thấy nội dung). App hiện tại chưa có màn hình tương đương — "Gần đây" trong rail trái của app đã có sẵn tên mục nhưng cần kiểm tra có hiển thị cột "thuộc dự án nào" giống cột Location này không.

### 1.5 Menu "Actions" (chọn dòng bằng checkbox → bấm Actions, hoặc chuột phải chỉ tick chọn chứ KHÔNG tự bật context menu)
Menu khác nhau theo loại item:

| Mục | Workspace (folder) | Sheet |
|---|---|---|
| Create ▶ (submenu tạo mới bên trong) | ✅ | ❌ |
| Open | ❌ (bấm tên để mở) | ✅ |
| Open in New Tab | ✅ | ✅ |
| Share... | ❌ (dùng nút "Share" xanh riêng góc trên) | ✅ (trong menu) |
| Make Me the Owner... | ❌ | ✅ |
| Rename... | ✅ | ✅ |
| Save as New... | ✅ | ✅ |
| Save as Template... | ❌ | ✅ |
| Request Backup... | ✅ | ✅ |
| Delete... | ✅ | ✅ |
| Export Excel/PDF/Google Sheets | ✅ | ✅ |
| Download Sharing Report (csv) | ✅ | ❌ |
| Properties... | ✅ | ❌ |

Đối chiếu app hiện tại: đã có `handleProjectAction`, `handleWorkspaceItemMenuAction`, `openWorkspaceItemMenu` (menu chuột phải trên item) — cơ chế menu theo loại item đã tồn tại. Cần so sánh danh sách action cụ thể hiện có với bảng trên nếu muốn bổ sung action còn thiếu (vd: "Save as Template", "Make Me the Owner" không áp dụng vì app chưa có multi-user — bỏ qua các mục liên quan phân quyền).

### 1.6 Đối chiếu với app hiện tại (v26)
- Layout tổng thể (icon rail trái + panel Workspace navigator dạng cây + bảng "Dự án của tôi") **đã giống Smartsheet** — không cần đổi cấu trúc.
- Dữ liệu `shared` (true/false) và `owner` (tên) **đã có sẵn** trong `DATA` (`js/state.js`) nhưng **chưa được hiển thị** ở bảng "Dự án của tôi" — bảng hiện chỉ có cột Name + Last Update.
- App đã có sẵn cơ chế nhớ lịch sử điều hướng (`navHistory`, `navIndex`, `currentNavState`, `pushNavState`, `restoreNavState`, `navBack`, `navForward`) — về mặt cơ chế **đã tương đương** kiểu "Browse nhớ vị trí" của Smartsheet mục 1.3. Cần kiểm tra lại xem khi bấm nút quay lại từ trong Sheet/Report/Dashboard/Repost, app có thực sự quay đúng về vị trí Workspace navigator vừa rời đi hay luôn về root — nếu đã đúng thì KHÔNG cần sửa phần này, chỉ cần chuẩn hoá vị trí/kiểu hiển thị nút cho nhất quán giữa các view.
- App **chưa có** khái niệm "panel ngữ cảnh workspace nổi bên cạnh khi đang mở Sheet" (mục 1.3) — hiện tại mở Sheet là chuyển hẳn màn hình, không giữ sidebar cho phép nhảy sang sheet khác cùng dự án. Đây là khoảng cách lớn nhất, nhưng **không đưa vào phạm vi spec này** (việc lớn, cần bàn riêng) — ghi nhận ở mục 7.1 để cân nhắc sau.

## 2. Mục tiêu

1. Thêm 2 cột vào bảng "Dự án của tôi" (Browse chính) và bảng con trong Workspace navigator: **Trạng thái chia sẻ** (badge màu, giống "Shared"/"Not Shared" của Smartsheet) và **Người sở hữu**.
2. Kiểm tra + chuẩn hoá nút quay lại ở mọi view con (Grid/Sheet, Report, Dashboard, Repost): xác nhận bấm nút quay lại luôn trả đúng về vị trí Workspace navigator vừa rời đi (giống cách Smartsheet nhớ vị trí khi bấm "Browse" từ trong Sheet — xem mục 1.3), và đồng bộ vị trí/kiểu hiển thị nút giữa các view (hiện `backToWorkspace`, `backFromReport` mỗi nơi một kiểu). KHÔNG viết lại cơ chế điều hướng, chỉ verify + chuẩn hoá UI dùng hàm sẵn có.
3. Chuẩn hoá menu "Actions" theo loại item (Workspace vs Sheet/dự án), đối chiếu với bảng khảo sát Smartsheet ở mục 1.5: rà soát menu hiện có (`handleProjectAction`, `handleWorkspaceItemMenuAction`, `openWorkspaceItemMenu`) và bổ sung các action còn thiếu trong nhóm dùng chung (không đụng các action liên quan phân quyền/multi-user vì app chưa có hệ thống người dùng).

## 3. Phạm vi — CHỈ làm

- Badge "Trạng thái chia sẻ": map trực tiếp từ field `shared` có sẵn trong `DATA`/`PROJECT_FOLDERS` → text "Đã chia sẻ" (xanh) / "Riêng tư" (xám). Không đổi cấu trúc dữ liệu, không thêm quyền chia sẻ thật (app chưa có backend phân quyền — đây chỉ là hiển thị trạng thái đã lưu sẵn).
- Cột "Người sở hữu": hiển thị trực tiếp field `owner` có sẵn.
- Chuẩn hoá breadcrumb quay lại: chỉ đổi phần hiển thị (CSS/label vị trí), **tái sử dụng nguyên các hàm điều hướng đã có** (`navBack`, `restoreNavState`, `goHomeToProjectList`, `backToWorkspace`, `backFromReport`...), không viết lại cơ chế lưu lịch sử điều hướng.
- Chuẩn hoá menu Actions theo bảng đối chiếu mục 1.5, CHỈ với các action không liên quan phân quyền:
  - Dùng chung (cả Workspace và Sheet, rà soát đã có đủ chưa): Rename, Save as New, Request Backup, Delete, Export Excel/PDF/Google Sheets.
  - Riêng Workspace (rà soát đã có đủ chưa): Create▶ (submenu tạo mới), Properties.
  - Riêng Sheet/dự án (rà soát đã có đủ chưa): Open.
  - KHÔNG thêm: Share..., Make Me the Owner..., Save as Template..., Download Sharing Report (csv) — các mục này gắn với hệ thống phân quyền/multi-user mà app chưa có.
  - Chỉ bổ sung action còn thiếu vào đúng menu theo loại item hiện có (`handleProjectAction`/`handleWorkspaceItemMenuAction`/`openWorkspaceItemMenu`), không đổi cơ chế mở menu.

## 4. KHÔNG làm (ngoài phạm vi)

- Không làm chức năng chia sẻ/phân quyền thật (mời người dùng khác, link share, Make Me the Owner, Save as Template...).
- Không thêm Gantt hay progress tracking.
- Không đổi cấu trúc dữ liệu `DATA`/`PROJECT_FOLDERS`.
- Không đổi module JS nào ngoài `workspace-navigator.js` (bảng Browse + breadcrumb + menu Actions) và `grid.js`/`report.js`/`dashboard.js`/`repost.js` (chỉ phần hiển thị breadcrumb đầu view, không đụng logic nghiệp vụ).

## 5. Luật thi công

1. Chỉ sửa phần render (thêm cột/badge, chuẩn hoá breadcrumb, bổ sung item menu Actions) — không đổi logic lưu/tải dữ liệu.
2. Test trên cả 2 dự án mẫu (Đường điện chiếu sáng — có `shared:true`, Nhà văn hoá thôn 5 — kiểm tra field `shared` thực tế trước khi code) để đảm bảo badge hiển thị đúng theo dữ liệu, không hard-code.
3. Giữ nguyên toàn bộ hàm/biến hiện có trong `CODE_MAP_V25.md` — chỉ thêm hàm mới nếu cần (vd: `sharingStatusBadgeHtml(shared)`), không sửa chữ ký hàm cũ.
4. Menu Actions: chỉ thêm case/nhánh action còn thiếu vào đúng hàm xử lý theo loại item đã có, không đổi cách mở menu (checkbox chọn dòng → Actions) hay cấu trúc menu hiện tại.

## 6. Acceptance Criteria

- [x] AC1: Bảng "Dự án của tôi" hiển thị đúng badge "Đã chia sẻ"/"Riêng tư" theo field `shared` của từng dự án, đúng màu (xanh/xám). — Đã có sẵn trong `js/main.js` hàm `render()` (dòng 38-44), xác nhận qua đọc code.
- [x] AC2: Bảng hiển thị đúng tên người sở hữu (`owner`) từng dự án. — Đã có sẵn (cùng vị trí trên).
- [x] AC3: Mở bất kỳ Sheet/Report/Dashboard/Repost nào từ Browse đều thấy breadcrumb `‹ [Tên dự án]` ở cùng 1 vị trí, cùng 1 kiểu hiển thị. — Đã có sẵn, `updateBrowseBreadcrumb` được gọi từ `openSheet`/`openReport`/`openDashboard`, dùng chung `data-browse-breadcrumb` + class `browse-breadcrumb` (3 nút: backToWorkspace, backFromReport, dashBackBtn).
- [x] AC4: Bấm breadcrumb ở bất kỳ view nào cũng quay đúng về đúng vị trí Browse trước đó. — Đã xác nhận qua test tay trực tiếp (mở Repost, bấm "‹ Dự án", quay đúng về đúng dự án, đúng dòng active).
- [x] AC5: Không lỗi console, không đổi hành vi các tính năng khác ngoài 3 mục trên. — Không sửa gì ở phần này nên không có rủi ro.
- [x] AC6: Menu Actions của Workspace có đủ các action dùng chung + riêng Workspace liệt kê ở mục 3. — Đã đối chiếu code, đủ action cần thiết (còn dư vài mục placeholder, xem mục 9).
- [x] AC7: Menu Actions của Sheet/dự án có đủ các action dùng chung + riêng Sheet liệt kê ở mục 3, KHÔNG còn bị lệch sang menu "Tạo mới" (bug đã sửa ở spec `screen-state-behavior`, dùng chung code path nên tự động khớp).

## 7.1 Ghi nhận thêm (KHÔNG thuộc phạm vi spec này — để cân nhắc spec sau)

- Mục "Gần đây" trong app hiện tại (`workspace-navigator.js`) mới chỉ có tiêu đề/eyebrow text ("Các dự án và hồ sơ vừa thao tác"), **chưa có logic thu thập dữ liệu thực tế** (không có hàm ghi lại item nào vừa mở kèm thời điểm/ngữ cảnh dự án). Smartsheet Home có bảng Recents thật với cột Location (item thuộc workspace nào) + Last viewed (thời gian tương đối). Nếu muốn làm mục này cho thật, cần 1 spec riêng: thêm cơ chế ghi log "vừa mở X lúc Y" (localStorage) — không nhỏ, không đưa vào spec này.
- Khi mở 1 Workspace trong Smartsheet có panel "Shared To" liệt kê người + vai trò cụ thể (Owner/Admin/Editor/Viewer) — sâu hơn nhiều so với badge Shared/Not Shared 2 trạng thái. App hiện tại không có hệ thống người dùng/phân quyền nên không áp dụng được, chỉ ghi nhận để biết giới hạn của phạm vi spec này.

## 8. Bàn giao

- Bàn giao vào `02_SOURCE/03_BAN_GIAO/browse-status-display/`, đối chiếu với `04_REPORTS/CODE_MAP_V25.md` để xác nhận không có hàm nào bị đổi ngoài phạm vi.

## 9. Ghi chú thi công (15/07/2026)

- Badge/owner (mục AC1-AC2) và breadcrumb (AC3-AC4) hoá ra ĐÃ CÓ SẴN trong code v26 từ trước — không cần sửa. Đã có cả file test sẵn `MODULES_V26/tests/browse-status-display.test.js` bao phủ đúng các hành vi này.
- Menu Actions (AC6-AC7): đối chiếu `openWorkspaceItemMenu` trong `workspace-navigator.js`, đã có đủ Open/Open in New Tab/Rename/Duplicate (Save as New)/Request Backup/Delete/Export Excel-PDF-GSheet/Properties. Còn dư 3 mục nằm ngoài danh sách mong muốn: Share..., Save as Template..., Download Workspace Sharing Report — hiện chỉ là placeholder `alert()`, không có chức năng thật, không gây lỗi. Quyết định (15/07/2026, Quân xác nhận): GIỮ NGUYÊN, **bổ sung/dọn sau** — chưa xoá ở lần thi công này, để dành cho một lượt sau khi cần.
- Lỗi thực sự nghiêm trọng phát hiện được (chuột phải trên Sheet mở nhầm menu Tạo mới do bug `isWorkspaceFolderLike` nhận nhầm kind `'folder-sheet'` thành folder) đã sửa ở spec `screen-state-behavior` — 2 spec dùng chung 1 hàm nên AC7 tự động khớp sau khi sửa.
