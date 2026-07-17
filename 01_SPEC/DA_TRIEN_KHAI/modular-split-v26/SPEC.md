# SPEC: modular-split-v26 — Tách file đơn v25 thành modules

- Trạng thái: DA_TRIEN_KHAI
- Ngày tạo: 14/07/2026
- Ngày triển khai: 15/07/2026
- Người duyệt: Quan
- Baseline nền: `VERSIONS/v25_baseline.html` (đối chiếu SHA-256 trong `01_CODE_HIEN_TAI/CODE_CHINH.md`)
- Baseline kết quả: `VERSIONS/v26_baseline.html` + `VERSIONS/v26_baseline_modules/` (bộ MODULES_V26)
- Bàn giao: `02_SOURCE/03_BAN_GIAO/modular-split-v26/BAN_GIAO_v26.md`

## 1. Mục tiêu

Tách file `giao-dien-desktop-don-gian_v25_quan.html` (~451KB) thành bộ modules để:
- Agent sửa code chỉ cần đọc file liên quan, không đọc cả 451KB
- Diff bàn giao theo từng file, review/nghiệm thu nhanh
- Cho phép 2 spec thi công song song trên 2 file khác nhau

Sản phẩm phát hành vẫn là **1 file HTML đơn** (ghép bằng build.py).

## 2. Điều kiện tiên quyết

- `04_REPORTS/CODE_MAP_V25.md` phải tồn tại (danh sách hàm theo nhóm chức năng). — ĐÃ CÓ.
- Checksum STAGING v25 khớp `VERSIONS/v25_baseline.html`. Nếu lệch: DỪNG, báo cáo, chờ quyết định. — ĐÃ KHỚP (xem CODE_MAP_V25.md mục 0).

## 3. Cấu trúc đích (trong `02_SAN_PHAM_DON_FILE/MODULES_V26/`)
```
index.html              # khung HTML + thẻ nạp css/js theo thứ tự mục 4
css/main.css            # toàn bộ CSS
js/state.js             # biến state toàn cục + dữ liệu mẫu
js/storage.js           # localStorage + Drive JSON
js/api.js               # Apps Script / Google API / OAuth
js/grid.js              # Grid/Sheet view
js/report.js            # Report view
js/dashboard.js         # Dashboard view
js/repost.js            # Repost view
js/toolbar.js           # toolbar + undo/redo
js/workspace-navigator.js
js/main.js              # init, wiring sự kiện khởi động
build.py                # ghép theo manifest -> bản đơn file
manifest.json           # thứ tự file để build.py ghép
```

## 4. Thứ tự nạp script trong index.html
`state.js → storage.js → api.js → toolbar.js → grid.js → report.js → dashboard.js → repost.js → workspace-navigator.js → main.js`

## 5. Luật thi công (bắt buộc)
1. CHỈ CẮT-DÁN nguyên khối theo nhóm hàm. KHÔNG refactor, KHÔNG đổi tên hàm/biến, KHÔNG đổi logic, KHÔNG thêm/xóa tính năng.
2. Giữ nguyên global scope (không bọc module/IIFE, không dùng import/export) — mọi hàm gọi chéo giữa file phải chạy như cũ.
3. Không dùng framework/build tool ngoài Python chuẩn cho build.py.
4. Mỗi dòng code của v25 phải xuất hiện đúng 1 lần trong bộ modules (không mất, không nhân đôi).

## 6. build.py
- Đọc `manifest.json`, ghép css/js vào khung index.html thành `giao-dien-desktop-don-gian_v26_quan.html` (1 file, inline style/script như v25).
- Chạy bằng `python build.py`, không tham số, không phụ thuộc thư viện ngoài.
- In ra kích thước + SHA-256 của bản ghép.

## 7. Acceptance criteria

- [x] AC1: Bản ghép build chạy trên localhost KHÔNG lỗi console khi tải trang. (Xác nhận qua `RUN_V26_LOCALHOST.bat` + Claude-in-Chrome console — 0 lỗi.)
- [x] AC2: 4 view (Grid, Report, Dashboard, Repost) + toolbar + workspace navigator hoạt động y hệt v25. (Grid + workspace navigator đã xác nhận tay bởi Quân; Report/Dashboard/Repost xác nhận nhanh qua trao đổi bàn giao.)
- [x] AC3: Tổng số hàm trong bộ modules = số hàm trong CODE_MAP_V25 (không mất hàm, không trùng hàm). (Xác minh bằng đối chiếu multiset AST — 900/900 statement khớp.)
- [x] AC4: `python build.py` chạy 1 lệnh ra bản đơn file; mở trực tiếp bản ghép cũng chạy được như v25. (Đã chạy, SHA-256 `AED953D9E2838538596DBBE753136897A1BE2D59BA40C3104025B15429AFA653`.)
- [x] AC5: Không có thay đổi hành vi nào ngoài việc tách file (diff logic = 0). (Đảm bảo bằng kiểm tra multiset nội dung tự động — không ham/bien nào bị thêm/bớt/sửa.)

## 8. Bàn giao

- Đã nộp `02_SOURCE/03_BAN_GIAO/modular-split-v26/BAN_GIAO_v26.md`, gồm: bộ MODULES_V26, bản ghép v26, build.py + manifest.json, báo cáo đối chiếu hàm với CODE_MAP_V25, kết quả regression.
- Nghiệm thu đạt → nâng baseline v26 (VERSIONS lưu CẢ bộ modules VÀ bản ghép + SHA-256), cập nhật CODE_CHINH.md, README_FIRST.md, DANH_MUC_SPEC.md.
- Từ v27: mọi spec sửa trên modules, bàn giao diff theo file; bản đơn file chỉ sinh từ build.py.
