# SPEC: screen-state-behavior — Chuẩn hoá trạng thái màn hình (screen state) + hành vi chuột phải/menu theo ngữ cảnh

- Trạng thái: DA_TRIEN_KHAI (nghiệm thu 15/07/2026) — AC1, AC3, AC4 đạt; AC2 ghi nhận, không chặn nghiệm thu. Bàn giao: `02_SOURCE/03_BAN_GIAO/browse-status-display/BAN_GIAO_browse-status-display_screen-state-behavior.md`. Baseline nâng: `VERSIONS/v26_baseline.html` SHA-256 `6A6126F7D4093759C1CC5BE2720DEF90E3265710EE2577A002D90A1CA58DBEAA`.
- Ngày tạo: 15/07/2026
- Ngày triển khai: 15/07/2026
- Người duyệt: Quan
- Baseline nền: v26 (`VERSIONS/v26_baseline.html`, bộ module `MODULES_V26/`)
- Nguồn khảo sát: click-through trực tiếp trên `app.smartsheet.com` (Browse root, Workspace mở, Sheet mở, Home — cả 3 tab Recents/Workspaces/Favorites), test tay từng trường hợp chọn dòng + chuột phải + khoảng trống + cây điều hướng.
- Quan hệ với spec khác: mở rộng và làm rõ thêm phần "menu Actions" đã nêu ở `browse-status-display` mục 1.5/2.3/3 — spec này đào sâu vào **cơ chế trigger** (Actions-button vs chuột phải vs khoảng trống vs cây điều hướng), còn `browse-status-display` lo phần **nội dung** từng loại menu (badge, owner, breadcrumb). Đã thi công 2 spec này cùng lúc trên `workspace-navigator.js`.

## 0. Giải thích thuật ngữ (để dùng chung, tránh hiểu nhầm sau này)

| Thuật ngữ | Nghĩa | Ví dụ trong app |
|---|---|---|
| **View** | 1 kiểu hiển thị nội dung chính | Grid view, Report view, Dashboard view, Repost view |
| **Screen state** | Trạng thái tổng thể màn hình tại 1 thời điểm (view + panel + dữ liệu) | "Đang ở Sheet, panel Workspace items đang mở" |
| **Selected state** | Dòng đang được tick chọn (checkbox xanh) | Dòng dự án đã tick trong bảng "Dự án của tôi" |
| **Active/highlight state** | Dòng/icon đang là "hiện tại" dù chưa chắc được tick chọn (nền xanh nhạt) | Dòng workspace vừa mở lần cuối vẫn có nền xanh nhạt dù bỏ tick |
| **Context menu** | Menu hiện ra khi chuột phải | Menu chuột phải trên 1 dòng dự án |
| **Actions menu** | Menu hiện ra khi bấm nút "Actions" | Nút Actions ở góc trên bảng |
| **Create/blank-area menu** | Menu hiện ra khi chuột phải vào khoảng trống (không trúng dòng nào) | Giống hệt nội dung nút "Create ▶" |
| **Contextual side panel** | Panel phụ hiện theo ngữ cảnh, không phải trang riêng | Panel "Workspace items" hiện bên trái khi đang mở 1 Sheet |
| **Empty state** | Giao diện hiển thị khi danh sách rỗng (không phải lỗi) | Tab Favorites khi chưa favorite gì: hình minh hoạ + "Find your favorite items" |

## 1. Kết quả khảo sát chi tiết (đã test tay từng trường hợp)

### 1.1 Browse root (`/browse/workspaces` — danh sách Workspaces gốc)
- Mặc định: không dòng nào tick, nút "Actions" bị mờ (disabled).
- Tick 1 dòng bằng checkbox → nút Actions bật sáng, tên dòng đổi màu xanh dương có gạch chân (giống link).
- **Chuột phải trực tiếp lên 1 dòng (không cần tick trước)** → xảy ra ĐỒNG THỜI 2 việc: (1) tự động tick chọn dòng đó, (2) mở ngay context menu tại vị trí con trỏ.
- **Đã kiểm chứng bằng thực nghiệm trực tiếp: nội dung context menu (chuột phải) và nội dung Actions menu (bấm nút Actions) GIỐNG HỆT NHAU 100%, khi cùng 1 dòng/cùng loại item.** Menu chỉ khác nhau theo LOẠI item (xem bảng 1.4), không khác theo cách mở.
- **Chuột phải vào khoảng trống của bảng (không trúng dòng nào)** → mở ra menu "Tạo mới" gồm: Grid, Task List, Project, Cards, Browse Templates, [Import Excel/Project/Google Sheets/Trello], Report, Dashboard/Portal, Folder, Workspace — **nội dung giống hệt nút "Create ▶"** ở góc trên phải trang.

### 1.2 Khi mở 1 Workspace (bảng con bên trong, vd "DAP608.CC2 - Client")
- Giống Browse root: tick dòng → Actions bật; chuột phải trên dòng → tự tick + mở context menu giống hệt Actions menu của loại item đó (Folder hoặc Sheet, xem 1.4).
- Panel phải xuất hiện "Workspace Shared To" — không liên quan menu, chỉ hiển thị thông tin (không phải trong phạm vi spec này, xem `browse-status-display` mục 7.1 về lý do không áp dụng).

### 1.3 Khi mở 1 Sheet cụ thể
- Rail trái giữ nguyên, thêm 1 icon "Workspace" mới bên dưới. Bấm icon này → mở **panel ngữ cảnh cây "Workspace items"** (tên workspace cha, nút "+ Add to workspace", "File library", "Scenario plans", cây các sheet/folder anh em — mục đích: nhảy sang sheet khác trong cùng workspace mà không cần quay về Browse).
- **Phát hiện quan trọng: chuột phải trên 1 dòng TRONG CÂY này KHÔNG mở menu gì cả** — chỉ có hiệu ứng hover nhẹ (đổi màu chữ). Đây khác hẳn với bảng dữ liệu chính ở 1.1/1.2. Kết luận: **menu ngữ cảnh (chuột phải) ở Smartsheet chỉ hoạt động trên BẢNG DỮ LIỆU CHÍNH (dạng bảng/table), không hoạt động trên CÂY ĐIỀU HƯỚNG (dạng tree/sidebar)** — kể cả khi cả hai đều hiển thị cùng loại item (Sheet/Folder).
- Nút "X" cạnh tên sheet chỉ thu gọn/ẩn panel bên trái (đã xác nhận lại lần 2), sheet vẫn mở nguyên.
- **Bấm icon "Browse" ở rail trái ngoài cùng → quay đúng về đúng Workspace vừa mở trước đó** (đã xác nhận lại lần 2 bằng thực nghiệm trực tiếp — không reset về danh sách Workspaces gốc). Đây là cơ chế "nhớ vị trí" (positional memory), không phải breadcrumb tĩnh.

### 1.4 Bảng menu theo loại item (đối chiếu Actions-button = Context-menu, đã xác minh giống nhau)

| Mục | Workspace gốc (root, ở Browse) | Folder/Workspace con (bên trong 1 Workspace) | Sheet |
|---|---|---|---|
| Create ▶ | ✅ | ✅ | ❌ |
| Open | ❌ (bấm tên để mở) | ❌ (bấm tên để mở) | ✅ |
| Open in New Tab | ✅ | ✅ | ✅ |
| Share... | ✅ | ❌ | ✅ |
| Remove Me from Sharing... | ✅ | ❌ | ❌ |
| Make Me the Owner... | ❌ | ❌ | ✅ |
| Rename... | ❌ | ✅ | ✅ |
| Save as New... | ✅ | ✅ | ✅ |
| Save as Template... | ❌ | ❌ | ✅ |
| Workspace Colors & Logo... | ✅ | ❌ | ❌ |
| Request Backup... | ✅ | ✅ | ✅ |
| Schedule Recurring Backup... | ✅ | ❌ | ❌ |
| Delete... | ❌ | ✅ | ✅ |
| Export Excel/PDF/Google Sheets | ✅ | ✅ | ✅ |
| Download Sharing Report (csv) | ✅ | ✅ | ❌ |
| Properties... | ✅ | ✅ | ❌ |

Ghi chú: bảng này thay thế bảng đơn giản hơn ở `browse-status-display` mục 1.5 (bảng cũ chỉ có 2 cột Workspace/Sheet, gộp chung "Workspace gốc" và "Folder con" — thực tế 2 loại này có menu khác nhau, ví dụ Workspace gốc có Share/Colors/Schedule Backup nhưng KHÔNG có Rename/Delete, còn Folder con thì ngược lại). Khi thi công, dùng bảng này (1.4) làm chuẩn.

### 1.5 Trang Home (`/home` — khác Browse)
- 4 tab: Recents, Favorites, Workspaces, Portfolios. **Không có checkbox chọn dòng, không có nút Actions** ở bất kỳ tab nào.
- **Tab Recents**: hover 1 dòng hiện icon 3-chấm (kebab) ở cuối dòng; chuột phải HOẶC bấm kebab → cùng 1 menu tối giản: "Open in a new tab", "Remove from recents" (2 mục).
- **Tab Workspaces (trong Home)**: chuột phải/kebab → menu còn tối giản hơn: chỉ "Open in a new tab" (1 mục, không có remove).
- **Tab Favorites**: nếu chưa có mục nào → hiện **empty state** (hình minh hoạ + tiêu đề "Find your favorite items" + mô tả "Add your favorite workspaces, collections, folders and other items.") thay vì bảng trống.
- Kết luận: Home dùng model UI khác hẳn Browse — không phải "chọn nhiều + Actions" mà là "mỗi dòng có menu riêng tối giản qua kebab/chuột phải", vì Home không phải nơi quản lý (không xoá/đổi tên/export được), chỉ để truy cập nhanh.

## 2. Nguyên tắc thiết kế rút ra (áp dụng khi chuẩn hoá app hiện tại)

1. **1 nguồn dữ liệu menu cho mỗi loại item** — nút Actions và menu chuột phải phải luôn hiển thị cùng nội dung khi cùng thao tác trên cùng 1 item. Không định nghĩa 2 danh sách action riêng cho 2 cách trigger.
2. **Chuột phải trên dòng dữ liệu** (bảng chính) → tự động chọn dòng đó (nếu chưa chọn) + mở menu item ngay lập tức.
3. **Chuột phải trên khoảng trống của bảng** → mở menu "Tạo mới", nội dung đồng bộ với nút Create/+ hiện có.
4. **Chuột phải trên cây điều hướng (sidebar/tree, không phải bảng chính)** → KHÔNG mở menu (để tránh 2 nơi có 2 hành vi mâu thuẫn nhau, và vì tree chỉ dùng để điều hướng nhanh chứ không phải nơi quản lý item).
5. **Menu phân biệt theo loại item cụ thể** (3 loại tối thiểu: Workspace gốc / Folder con / Sheet — xem bảng 1.4), không gộp chung "Workspace" và "Folder" làm một.
6. **Trang kiểu "Gần đây"/Home không dùng model checkbox + Actions** — dùng model kebab-menu tối giản theo từng dòng (chỉ Mở + Xoá khỏi danh sách), vì đây là trang truy cập nhanh, không phải trang quản lý.

## 3. Đối chiếu với app hiện tại (v26) — ĐÃ TEST TRỰC TIẾP TRÊN APP THẬT (localhost, bản ghép v26)

Đã mở app thật, vào dự án "Đường điện chiếu sáng — Xã Liên Sơn" → mở view Repost → quay lại bảng file (Workspace-opened) → test chuột phải. Kết quả:

- **[ĐÃ ĐÚNG] Positional memory khi quay lại**: đang ở Repost, bấm nút "‹ Dự án" (breadcrumb) → quay đúng về đúng bảng file của dự án "Đường điện chiếu sáng", dòng "Repost" vẫn còn nền xanh nhạt (active/last-opened state) — khớp 100% với hành vi "Browse nhớ vị trí" của Smartsheet (mục 1.3). Không cần sửa phần này.
- **[ĐÃ CÓ SẴN, có thể tận dụng] Panel "CHIA SẺ VỚI"**: khi mở 1 dự án (Workspace-opened), panel phải đã hiển thị danh sách người + vai trò (Chủ sở hữu/Người chỉnh sửa/Người xem) — tương đương "Workspace Shared To" của Smartsheet (mục 1.2). Cần xác nhận khi thi công `browse-status-display`: dữ liệu này là thật (đọc từ `DATA`) hay dữ liệu mẫu tĩnh — nếu là thật, phần "Trạng thái chia sẻ/Owner" ở bảng chính nên lấy cùng nguồn dữ liệu với panel này để nhất quán.
- **[LỖI ĐÃ SỬA] Chuột phải trên dòng dữ liệu chỉ đúng với item loại Dashboard, SAI với mọi item loại Sheet**: test chuột phải lần lượt trên toàn bộ 6 dòng của bảng file dự án "Đường điện chiếu sáng" (Hợp đồng - pháp lý, Vật liệu - CO CQ, Thi công - nghiệm thu, Thanh toán - quyết toán, Tổng hợp - đối chiếu, Repost, Dashboard):
  - **5 dòng loại Sheet** (Hợp đồng, Vật liệu, Thi công, Thanh toán, Repost — tất cả đã test, đều tái hiện lỗi trước khi sửa) → chuột phải mở NHẦM **menu "Tạo mới"** (Grid/Task List/Project/Cards/Report/Dashboard-Portal/Folder/Workspace/Từ mẫu) — đúng ra phải mở menu item (Rename/Duplicate/Save as New/Delete/Export...).
  - **1 dòng loại Dashboard** ("Dashboard", DASHBOARD_TONG_HOP) → chuột phải mở ĐÚNG menu item, tái hiện ổn định qua 2 lần test: tiêu đề "Sheet: Dashboard", nội dung Open/Open in New Tab/Share/Rename/Duplicate/Save as New/Save as Template/Request Backup/Delete/Export Excel/PDF/Google Sheets/Download Workspace Sharing Report/Properties (kèm phím tắt gợi ý O/S/A/D/N/T/B/Del/X/PDF/G/CSV/i).
  - Nguyên nhân: hàm `isWorkspaceFolderLike()` trong `workspace-navigator.js` dùng `.includes('folder')` để nhận diện folder/workspace, nhưng item Sheet có `kind:'folder-sheet'` (chứa sẵn chuỗi "folder") nên bị nhận nhầm. Dashboard có `kind:'dashboard'` nên không dính lỗi.
  - **Đã sửa**: đổi so khớp lỏng (`.includes`) sang so khớp chính xác (`===`). Đã test trực tiếp trên app thật (localhost, cả 3 nơi lưu: `MODULES_V26`, bản ghép, `VERSIONS` baseline) xác nhận chuột phải trên Sheet nay mở đúng menu.
- Cột trái (grid Repost) khi chuột phải trên 1 ô dữ liệu: mở menu theo CỘT (Insert Column Left/Right, Delete/Rename/Freeze/Hide Column, Show Gantt, Edit Project Settings...) — đây là hành vi đã có sẵn từ spec `column-header-context-menu` (v25), không phải phạm vi spec này, chỉ ghi nhận để tránh nhầm lẫn với phần "chuột phải trên dòng dự án ở Browse" đang xét ở trên (2 tầng khác nhau: chuột phải trong BẢNG DANH SÁCH FILE vs chuột phải trong LƯỚI DỮ LIỆU của 1 file).
- Chuột phải trên khoảng trống bảng file và trên cây điều hướng: đối chiếu code xác nhận app đã làm đúng theo nguyên tắc mục 2 mà không cần sửa gì thêm (xem AC3 mục 8).
- Mục "Gần đây" hiện chỉ có tiêu đề, chưa có danh sách thật (đã ghi ở `browse-status-display` mục 7.1) — spec này KHÔNG yêu cầu làm phần đó, chỉ ghi nhận nguyên tắc 2.6 để áp dụng SAU NÀY khi có spec riêng làm "Gần đây" thật.

## 4. Mục tiêu

1. Đảm bảo Actions-button-menu và chuột-phải-menu trong app luôn xuất phát từ 1 hàm sinh nội dung duy nhất theo loại item (không tồn tại 2 danh sách action lệch nhau cho cùng 1 loại item).
2. Chuột phải trên dòng dữ liệu trong bảng "Dự án của tôi"/bảng con Workspace: tự động chọn dòng + mở đúng menu theo loại item (dự án/thư mục), khớp bảng 1.4 (bỏ các mục liên quan phân quyền không áp dụng — theo `browse-status-display` mục 3).
3. Xác nhận/chuẩn hoá hành vi chuột phải trên khoảng trống bảng: hoặc mở menu Tạo mới đồng bộ nút Create hiện có, hoặc chủ động không làm (ghi rõ lý do) — quyết định khi thi công dựa trên mức độ cần thiết thực tế của app.
4. Xác nhận hành vi chuột phải trên cây điều hướng (Workspace Navigator sidebar) hiện tại — quyết định giữ nguyên hoặc bỏ theo nguyên tắc 2.4.

## 5. Phạm vi — CHỈ làm

- Rà soát và hợp nhất nguồn sinh menu Actions/chuột-phải trong `workspace-navigator.js` thành 1 hàm dùng chung theo loại item (nếu hiện đang tách rời).
- Đảm bảo chuột phải trên dòng dữ liệu tự động chọn dòng trước khi mở menu (nếu hiện chưa vậy).
- Ghi nhận quyết định về chuột-phải-khoảng-trống và chuột-phải-trên-cây-điều-hướng vào tài liệu (mục 3), áp dụng đúng 1 trong 2 hướng đã nêu — không bắt buộc phải thêm tính năng mới nếu team quyết định giữ nguyên hành vi hiện tại là đủ tốt.
- KHÔNG đổi cấu trúc dữ liệu, KHÔNG đổi cơ chế mở panel/điều hướng đã có.

## 6. KHÔNG làm (ngoài phạm vi)

- Không làm empty-state minh hoạ cho các danh sách trống (có thể là spec riêng sau nếu cần).
- Không làm trang "Gần đây" có dữ liệu thật (ghi nhận, chưa làm — xem mục 3).
- Không thêm phân quyền/multi-user thật.
- Không đổi menu Actions nội dung (đã thuộc phạm vi `browse-status-display`) — spec này chỉ lo phần TRIGGER/cơ chế, không lo nội dung từng mục action.

## 7. Luật thi công

1. Đọc kỹ `handleProjectAction`, `handleWorkspaceItemMenuAction`, `openWorkspaceItemMenu` hiện có trước khi sửa — không viết lại từ đầu.
2. Nếu 2 trigger (Actions-button, chuột phải) đang gọi 2 hàm khác nhau nhưng nội dung đã trùng khớp 100%, KHÔNG bắt buộc phải hợp nhất code (rủi ro thấp) — chỉ hợp nhất nếu phát hiện đang LỆCH nội dung thật sự.
3. Giữ nguyên toàn bộ hàm/biến khác trong `CODE_MAP_V25.md`.

## 8. Acceptance Criteria

- [x] AC1: Chuột phải trên dòng item LOẠI SHEET (Hợp đồng, Vật liệu, Thi công, Thanh toán, Tổng hợp, Repost...) trong bảng file Workspace-opened mở đúng menu item (Rename/Duplicate/Save as New/Delete/Export...) — giống với hành vi hiện đã ĐÚNG của dòng loại Dashboard — KHÔNG còn mở nhầm menu "Tạo mới" như hiện trạng đã xác nhận qua test trực tiếp trên dự án "Đường điện chiếu sáng — Xã Liên Sơn" (5/6 dòng bị lỗi trước khi sửa, chỉ dòng Dashboard đúng). **ĐÃ SỬA và xác nhận lại trên localhost — đạt.**
- [ ] AC2: Chuột phải tự động chọn (tick) dòng đó nếu chưa được chọn trước khi mở menu. — CHƯA LÀM: checkbox trên `#folderRows` hiện thuần hiển thị (không có state/logic bulk-select thật phía sau), nên "tick checkbox" không có tác dụng thật nếu thêm vào — quyết định để dòng có nền xanh nhạt (đã có sẵn cho dòng đang active) làm dấu hiệu trực quan thay thế, không ép thêm logic checkbox chưa dùng tới. Ghi nhận, không chặn bàn giao.
- [x] AC3: Hành vi chuột phải trên khoảng trống bảng và trên cây điều hướng đã được xác nhận rõ ràng — đối chiếu code cho thấy app ĐÃ làm đúng theo nguyên tắc mục 2 mà không cần sửa: chuột phải khoảng trống trong `#folderRows`/`.folder-table` đã mở đúng menu Tạo mới (`showWorkspaceLayoutMenuAt`); `workspaceNavigatorRows`/`workspaceBrowseRows` (cây điều hướng) không có handler `contextmenu` nào — đúng chuẩn "không mở menu" như khảo sát Smartsheet.
- [x] AC4: Không lỗi console, không đổi hành vi các tính năng khác ngoài phạm vi. — Chỉ sửa 1 điều kiện so khớp trong `isWorkspaceFolderLike` (đổi `.includes()` thành so khớp chính xác `===`), không đụng logic nào khác; đã test trực tiếp trên app (localhost) xác nhận đúng.

## 9. Bàn giao

- Đã nộp `02_SOURCE/03_BAN_GIAO/browse-status-display/BAN_GIAO_browse-status-display_screen-state-behavior.md` (gộp chung với `browse-status-display` vì cùng sửa `workspace-navigator.js`, ghi rõ AC của từng spec).
- Nghiệm thu đạt 15/07/2026 → đã nâng baseline v26 (`VERSIONS/v26_baseline.html`, `VERSIONS/v26_baseline_modules/`), cập nhật `CODE_CHINH.md`, `DANH_MUC_SPEC.md`.
