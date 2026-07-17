# SPEC V29 — Menu trong viewport và tối ưu khởi động

- Revision: 1
- Ngày: 2026-07-16
- Baseline khóa: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v28_baseline.html`
- Module baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v28_baseline_modules/`
- Mục tiêu đầu ra: V29, mã nguồn module và một HTML build để chạy/bàn giao.

## 1. Mục tiêu

1. Mọi menu chuột phải trong Workspace Navigator và menu File/Create luôn truy cập được trong viewport, kể cả khi mở gần cạnh dưới/phải.
2. Giảm thời gian chờ cảm nhận khi mở ứng dụng mà không gộp ngược mã nguồn và không thay đổi chức năng V28.

## 2. Giả định đã khóa

- Áp dụng margin an toàn 8 px cho bốn cạnh viewport.
- Ưu tiên dịch menu lên/trái; chỉ bật cuộn nội bộ khi chiều cao tự nhiên lớn hơn vùng khả dụng.
- Windows scaling 100%, 125%, 150% được mô phỏng bằng viewport/CSS pixel và browser zoom; không dùng tọa độ màn hình vật lý.
- Giữ toàn bộ hành vi menu, dữ liệu và lệnh V28; không thêm dependency runtime.
- Tối ưu hiệu năng chỉ dựa trên số đo trước/sau. Không trì hoãn phần lõi làm người dùng không thể thao tác.

## 3. Phạm vi

### 3.1 Menu viewport-safe

- Menu của khoảng trắng, Workspace, Sheet/Report/file, Create, File và submenu.
- Mặc định neo tại vị trí chuột hoặc nút được bấm.
- Tự flip/dịch khi thiếu chỗ dưới hoặc phải.
- `max-height` theo viewport và `overflow-y:auto` khi cần.
- Phím mũi tên làm mục focus được `scrollIntoView({block:'nearest'})`.
- Tính lại vị trí khi `resize`, zoom/thay đổi độ phân giải; không làm trang chính cuộn/nhảy.
- Click ngoài và Escape tiếp tục đóng menu.

### 3.2 Hiệu năng khởi động

- Đo `DOMContentLoaded`, thời điểm UI lõi sẵn sàng, số timer polling và lỗi console trên baseline.
- Loại bỏ polling `setInterval` của File menu khi DOM đã có sẵn; khởi tạo bằng DOM readiness rõ ràng và idempotent.
- Google Identity tiếp tục tải `async defer`; tác vụ Drive/helper/Report/Dashboard/Attachment không được chặn UI lõi.
- Thêm mốc đo bằng Performance API, không gửi dữ liệu ra ngoài.

## 4. Ngoài phạm vi

- Thay đổi backend, OAuth, định dạng dữ liệu dự án hoặc chức năng từng mục menu.
- Đổi thiết kế tổng thể, framework hoặc thêm thư viện CDN/runtime.
- Tối ưu vi mô không có bằng chứng đo đạc.

## 5. Cấu trúc và lệnh

- Source staging: `02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V29/`
- Test: `02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V29/tests/`
- Build: `python build.py`
- Unit/regression: `node --test tests/*.test.js`
- Syntax: `node --check js/*.js`
- Browser: Playwright ở 1366×768 và các cấu hình zoom/scaling tương đương.

## 6. Chiến lược kiểm thử

1. RED: test helper định vị thất bại trên V28 khi menu mở sát đáy/phải.
2. GREEN: helper thuần tính tọa độ, chiều cao và hướng submenu; test unit bao phủ 8 px, flip, overflow.
3. Browser: mở menu thật ở cạnh viewport, kiểm tra `getBoundingClientRect()` của menu/submenu.
4. Keyboard: Arrow Up/Down/Right giữ item focus nhìn thấy; Escape/click ngoài đóng.
5. Performance: đo cùng môi trường trước/sau; báo riêng cold/warm load, không khẳng định mục tiêu nếu máy đo không đại diện.
6. Regression: toàn bộ test V28 và smoke các lệnh menu hiện có.

## 7. Acceptance criteria

- Tất cả mục đến `Workspace` truy cập được; không phần menu nào ngoài màn hình ở 1366×768.
- Đúng ở scaling mô phỏng 100%, 125%, 150%; submenu tự mở trái khi thiếu chỗ phải.
- Menu cách viewport tối thiểu 8 px; menu quá cao cuộn bên trong, trang chính không cuộn/nhảy.
- Arrow navigation giữ mục focus nhìn thấy; Escape/click ngoài đóng.
- Resize/zoom gọi định vị lại menu đang mở.
- Không thay đổi chức năng từng mục V28 và không có lỗi console mới.
- File menu không còn polling 100 ms/10 giây; UI lõi được đánh dấu sẵn sàng bằng luồng khởi tạo idempotent.
- Có số đo trước/sau và không hồi quy thời gian UI-ready; mục tiêu tham chiếu UI hiện dưới 1 giây, Sheet thao tác khoảng 1–1,5 giây trên desktop.
- Module build thành một HTML; staging/BANDIAO/baseline V29 có SHA-256 khớp nhau sau khi PASS.

## 8. Ranh giới

- Luôn: test trước khi sửa, build từ module, giữ UTF-8, lưu bằng chứng.
- Cần quyền mới: cài dependency, thay backend/OAuth, thao tác phá hủy dữ liệu.
- Không bao giờ: sửa trực tiếp dữ liệu người dùng, bỏ test lỗi, ghi đè baseline V28.
