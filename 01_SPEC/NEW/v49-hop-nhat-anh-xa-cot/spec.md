---
version: 49.0
date: 2026-08-07
author: Claude (khảo sát v48)
baseline: v48 (SHA dae8b75, nhánh feat/v47-v48-ui-dashboard)
status: 🟡 Chờ duyệt
---

# v49: Hợp nhất ánh xạ cột + dọn nợ kỹ thuật sau di trú Drive API

## 0. Tóm tắt thay đổi

| Mã | Tính năng | Mức | Loại |
|----|-----------|-----|------|
| FR-01 | Gộp 3 bản ánh xạ cột-theo-nhãn thành 1 nguồn duy nhất | 🔴 P0 | Refactor |
| FR-02 | Khai `type` cho cột trong V46_TEMPLATES | 🔴 P0 | Dữ liệu |
| FR-03 | Xử lý dứt điểm `loadSheetDataFromWebApp` (stub trả null) | 🔴 P0 | Nợ kỹ thuật |
| FR-04 | Kiểm & nối 7 nút chưa có handler | 🟠 P1 | Sửa lỗi |
| FR-05 | Xoá 25 hàm chết hoặc đánh dấu deprecated | 🟠 P1 | Dọn dẹp |
| FR-06 | Chọn nhiều dòng + thao tác hàng loạt ở bảng duyệt | 🟠 P1 | Tính năng |
| FR-07 | Đưa v43–v46 + RUN_*.html vào git | 🟡 P2 | Quy trình |
| FR-08 | Truy lỗi `bad config line 1 in blob` của git | 🟡 P2 | Môi trường |

## 1. Bối cảnh & Vấn đề

v47 và v48 đã sửa xong phần giao diện và nối Dashboard vào dữ liệu thật. Khảo sát toàn diện v48 (629 hàm, 3 màn hình chính, 0 lỗi runtime) cho thấy phần còn lại **không phải lỗi giao diện, mà là nợ kỹ thuật để lại từ đợt di trú sang Drive API ở V45**.

Ba vấn đề gốc:

**a) Hai schema cột song song, chưa ai hoà giải.** App có `SHEET_COLUMN_CONFIG` 14 cột (có khai `type`: date/currency/dropdown…) và `V46_TEMPLATES` 5 cột (chỉ khai `label` + `width`, **không khai `type`**). Mọi tính năng dựa vào `type` đều mù trên sheet thật.

**b) Hệ quả: cùng một logic ánh xạ đã phải viết lại 3 lần.** Mỗi lần một tính năng cần hiểu cột của sheet, lại phải dò theo nhãn:

| Nơi | Hàm | Phiên bản |
|---|---|---|
| Report | `getReportSourceColMap` + `REPORT_SOURCE_COL_ALIASES` | v47 |
| Dashboard | `findDashStatusCol` + `DASH_STATUS_LABELS` | v48 |
| Carry Forward | `CARRY_LABEL_TODAY` / `CARRY_LABEL_CLEAR` | v48 |

Ba bảng nhãn rời rạc, không đồng bộ. Thêm cột mới phải sửa 3 chỗ, quên 1 chỗ là lỗi âm thầm.

**c) Hàm rỗng sót lại sau di trú.** `loadSheetDataFromWebApp()` luôn trả `Promise.resolve(null)`. Đây là lý do widget Dashboard **chưa bao giờ** hiển thị được dữ liệu cho tới v48. Hàm vẫn còn, vẫn được widget cấu hình kiểu `source` gọi tới.

## 2. Yêu cầu chức năng

### FR-01 — 🔴 P0: Gộp ánh xạ cột-theo-nhãn

**Hiện trạng:** 3 bảng nhãn độc lập (xem bảng ở mục 1b).

**Yêu cầu:** tạo một nguồn duy nhất:

```js
// Vai trò ngữ nghĩa của cột, suy ra từ nhãn khi sheet không khai type.
const COLUMN_ROLE_ALIASES = {
  stt:        ['stt'],
  noiDung:    ['nội dung hồ sơ','nội dung chuyển tiếp','hồ sơ thi công và nghiệm thu',
               'hồ sơ vật liệu / đợt / hồ sơ'],
  soVanBan:   ['số hiệu','số văn bản'],
  ngayVanBan: ['ngày','ngày tháng','ngày, tháng, năm','ngày văn bản'],
  tinhTrang:  ['trạng thái'],
  ghiChu:     ['ghi chú','ghi chú / trạng thái']
};

function getColumnRole(headerLabel)        // nhãn  -> vai trò
function getSheetRoleMap(sheet)            // sheet -> {vai trò: chỉ số cột}
```

Sau đó viết lại 3 nơi trên để gọi hàm chung. **Giữ nguyên hành vi hiện tại** — đây là refactor, không đổi kết quả.

**Chấp nhận:**
- Report vẫn ra 43 dòng với 2 sheet nguồn, cột "Nội dung" có dữ liệu
- Dashboard vẫn ra 15% / 51 / 3 trên dữ liệu mẫu
- Carry Forward vẫn mặc định: Ngày → reset, Trạng thái → xoá
- Thêm 1 nhãn mới chỉ phải sửa **1 chỗ**

**Lưu ý ngữ nghĩa:** nhãn `"ghi chú"` mang **2 nghĩa khác nhau** — trong `phap-ly` nó chứa giá trị trạng thái (Đã có/Chờ bổ sung), trong `vat-lieu` nó là ghi chú thật (đã có cột "Trạng thái" riêng). Hàm chung phải cho phép **ưu tiên theo ngữ cảnh**, không map cứng 1-1.

### FR-02 — 🔴 P0: Khai `type` cho cột trong V46_TEMPLATES

**Hiện trạng:** `applyLegacyTemplateMigration` chỉ gán `_columnConfigs` chứa `width`.

**Yêu cầu:** bổ sung `type` cho từng template, để các tính năng dựa vào `type` (Carry Forward, định dạng ô, sắp xếp) chạy đúng mà không cần đoán theo nhãn:

| Template | Cột | type |
|---|---|---|
| phap-ly | NGÀY, THÁNG, NĂM | `date` |
| cong-viec | Ngày tháng | `date` |
| vat-lieu | Ngày | `date` |
| vat-lieu | Trạng thái | `dropdown` |
| repost | Ngày tháng | `date` |

**Chấp nhận:** `classifyCarryForwardColumn` trả đúng kết quả **qua nhánh `type`**, không cần rơi xuống nhánh nhãn. FR-01 khi đó chỉ còn là lưới an toàn cho sheet do người dùng tự tạo.

### FR-03 — 🔴 P0: Xử lý `loadSheetDataFromWebApp`

**Dòng ~5290:**
```js
function loadSheetDataFromWebApp(project, sheetName){
 if(!project || !sheetName) return Promise.resolve(null);
 return Promise.resolve(null); // data loaded via loadFromDrive()
}
```

**Yêu cầu:** chọn 1 trong 2, không để nguyên trạng:
- **(a)** Nối vào dữ liệu cục bộ: đọc `PROJECT_FOLDERS` như `collectDashStatusStats` đang làm
- **(b)** Xoá hàm + xoá mọi nhánh `w.source` trong `renderDashMetric` / `renderDashReport`, chỉ giữ đường `config.stat`

**Khuyến nghị (a)** — widget cấu hình theo `source` vẫn là đường hợp lệ cho người dùng tự thêm widget.

**Chấp nhận:** không còn hàm nào trả `Promise.resolve(null)` vô điều kiện; widget cấu hình `source` hiển thị được số liệu hoặc báo lỗi rõ ràng, **không im lặng hiện `--`**.

### FR-04 — 🟠 P1: Kiểm & nối 7 nút chưa có handler

Quét tĩnh không tìm thấy `addEventListener`, `onclick`, hay uỷ quyền sự kiện cho:

| Nút | Nhãn | Ghi chú |
|---|---|---|
| `ssShareBtn` | Share | Hiện trên toolbar sheet |
| `ssAiBtn` | AI | Hiện trên toolbar sheet |
| `ssGridViewBtn` | Grid | Hiện trên toolbar sheet |
| `ssTopMoreBtn` | (chevron) | |
| `exportExcelBtn` | Export Excel | Có hàm `exportSheetToExcel` sẵn |
| `createProjectBtn` | ＋ Tạo dự án mới | |
| `railCreateProjectBtn` | ＋ | Nút FAB góc trái dưới |

**Yêu cầu:** kiểm từng nút ở đúng trạng thái màn hình mà nó hiển thị (phần lớn đang `display:none` ở trạng thái mặc định nên click thử không kết luận được). Nút nào thực sự chưa nối thì nối, nút nào bỏ thì xoá khỏi DOM.

**Chấp nhận:** mọi nút **nhìn thấy được** đều có phản hồi. Không còn nút bấm không ra gì.

### FR-05 — 🟠 P1: Dọn 25 hàm chết

Định nghĩa nhưng **không nơi nào gọi** (đã đối chiếu cả `onclick=` trong HTML):

**Nhóm hậu-Drive-API (nghi là đường cũ đã bị thay):**
`uploadAttachmentViaGs`, `uploadAttachmentViaWebApp`, `prepareAttachmentFolderViaGs`, `googleSheetFrameUrl`

**Nhóm đính kèm (panel vẫn chạy tốt — đây là biến thể không dùng):**
`toggleAttachPanel`, `closeAttachPanel`, `switchAttachTab`, `showAttachMenu`, `openAttachmentPickerForRow`, `getAttachmentRowFolderName`, `reconcileConfirmedAttachmentDuplicates`, `readFileAsDataUrl`

**Nhóm tính năng chưa nối:**
`copyRowAttributes`, `pasteRowAttributes`, `cycleRowStatus`, `openWorkspaceNavigator`

**Nhóm trí thông minh import (chưa dùng — có thể có giá trị):**
`detectHeaderRow`, `detectSTTColumn`, `estimateColumnWidths`

**Nhóm khác:**
`sampleRowsForArchiveSheet`, `buildDemoSheetCells`, `checkboxDisplayIcon`, `copyRowAttributes`, `getActiveColIndex`, `getCurrentProjectIndex`, `getFileIcon`

**Yêu cầu:** với mỗi hàm, quyết định **xoá** hoặc **nối vào UI**. Không để lửng lơ.

**Đáng chú ý:** `detectHeaderRow` / `detectSTTColumn` / `estimateColumnWidths` là logic tự nhận diện khi import Excel — nếu nối vào luồng import hiện tại sẽ giảm thao tác tay cho người dùng. Đề nghị **nối, không xoá**.

`sampleRowsForArchiveSheet` chứa dữ liệu mẫu Repost (RP-01, RP-02) nhưng ở **định dạng 14 cột**, lệch với lưới 5 cột → xoá, vì v48 đã có template `repost` thay thế.

### FR-06 — 🟠 P1: Chọn nhiều dòng ở bảng duyệt

**Hiện trạng:** bảng duyệt (`.workspace-browse-table`) đã có sắp xếp (v48) và hover thao tác (v48), nhưng chưa chọn nhiều được. Bảng chi tiết dự án (`#folderRows`) **có sẵn ô checkbox** nhưng chưa nối logic.

**Yêu cầu:**
- Checkbox chọn từng dòng + checkbox chọn tất cả ở header
- Thanh thao tác hiện khi có ≥1 dòng được chọn: Xoá / Nhân bản / Đổi thư mục
- Hiện số lượng đang chọn

**Chấp nhận:** chọn 3 sheet → xoá 1 lần được cả 3, có xác nhận, có undo hoặc snapshot.

### FR-07 — 🟡 P2: Đưa các bản còn lại vào git

Chưa track: `giao-dien-desktop-don-gian_v43/v44/v45/v46.html`, `RUN_V44.html`, `RUN_V45.html`.

**Lưu ý:** repo đang có **134 file ở trạng thái xoá (D)** và **10 file sửa (M)** không rõ nguồn gốc, có từ trước phiên khảo sát. Cần rà trước khi commit gộp, tránh đưa nhầm.

### FR-08 — 🟡 P2: Lỗi cấu hình git

`git status` luôn in: `error: bad config line 1 in blob 87cba6b2b4f8f8570099fdca122b97d3f965f1d6`.

Không cản trở commit, nhưng nên truy: khả năng là `.gitconfig` hoặc `.gitmodules` hỏng được commit vào lịch sử.

## 3. Yêu cầu phi chức năng

- **Không hồi quy.** Sau mỗi FR phải chạy lại bộ kiểm chứng: Report 43 dòng / Dashboard 15%-51-3 / lưới 140 ô / 0 lỗi console.
- **Kiểm trên origin sạch.** App lưu state vào `localStorage['qlda_project_local_backup_v1']` theo origin. Muốn thấy dữ liệu seed gốc phải chạy server ở **cổng khác**, nếu không state cũ sẽ đè lên và gây chẩn đoán sai.
- **Giữ đường chỉnh tay.** Mọi thứ tự động hoá (ánh xạ nhãn, mặc định Carry Forward) phải cho người dùng ghi đè.
- **Không thêm thư viện ngoài.** App là file đơn, biểu đồ Dashboard đã tự vẽ bằng SVG.

## 4. Kiến trúc & Thiết kế

### File tác động

`02_SOURCE/03_BAN_GIAO/giao-dien-desktop-don-gian_v49.html` (tạo từ v48).

### Thứ tự thực hiện

```
FR-02 (khai type)  ──┐
                     ├──> FR-01 (gộp ánh xạ)  ──> FR-03 (dọn stub)
FR-05 (rà hàm chết) ─┘
                     └──> FR-04 (nối nút)     ──> FR-06 (chọn nhiều)
```

FR-02 làm trước FR-01: khi cột đã khai `type`, phạm vi FR-01 thu hẹp lại (chỉ còn lo sheet người dùng tự tạo), tránh gộp xong lại phải sửa.

### Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Gộp ánh xạ làm lệch kết quả Report/Dashboard | Ghi lại số liệu chuẩn **trước** khi refactor, đối chiếu sau |
| Khai `type` sai làm Carry Forward xoá nhầm dữ liệu | `applyCarryForward` đã có snapshot undo; test trên origin sạch trước |
| Xoá nhầm hàm còn dùng qua chuỗi động | Grep cả `onclick=`, `[id]` và tên hàm dạng chuỗi trước khi xoá |
| Nối nút chưa rõ ý đồ thiết kế | Nút nào không rõ mục đích thì hỏi, đừng tự nghĩ hành vi |

## 5. Ngoài phạm vi

- **Xem dạng thẻ (card view)** — với hồ sơ dạng danh sách, bảng phù hợp hơn.
- **Ấm hoá các bảng màu còn lại** — palette Google Drive, màu vùng chọn lưới, swatch tô ô của người dùng đều **khác màu vì khác vai trò**, không phải lỗi nhất quán. Đổi sẽ hỏng dữ liệu người dùng hoặc làm mất khả năng phân biệt ô-đang-chọn với ô-đã-tô.
- **Thu hẹp cột gutter lưới (162px)** — đã đo: chứa số dòng 62px + 5 nút ×18px ≈ 161px, vừa khít. Thu hẹp sẽ cắt mất nút.
