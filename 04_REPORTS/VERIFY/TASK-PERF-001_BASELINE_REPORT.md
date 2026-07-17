# TASK-PERF-001 — Baseline Report

- Ngày verify: 2026-07-17
- File: `02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v30_quan.html`
- Kết quả: PASS

## Instrumentation đã thêm

| Metric | Điểm đo / dữ liệu |
|---|---|
| UI Ready cold/hot | `qlda-app-start` đến `qlda-ui-ready`, phân loại bằng trạng thái session |
| Project Open | Bắt đầu `openDetail`, kết thúc sau hai animation frame |
| Sheet Open | Bắt đầu `openSheet`, kết thúc sau hai animation frame |
| First Cell Edit | Từ lúc mở sheet đến input hợp lệ đầu tiên |
| DOM Node Count | `document.getElementsByTagName('*').length` trong snapshot |
| Save Duration | Toàn bộ `saveProjectNow`, kết thúc ở `finally` |
| Scroll Performance | Duration, frame count, average frame time và dropped-frame estimate sau scroll |
| Render count | Đếm `render` và `renderGridSheet` |
| Serialize count | Đếm các serialization trên đường lưu project |
| Listener count | Đếm đăng ký qua `EventTarget.addEventListener` |

API kiểm tra thủ công: `window.__QLDA_PERF__.snapshot()`.

## Kết quả runtime

Chạy Edge headless profile cô lập trực tiếp trên file staging:

- UI Ready cold quan sát: 33.5 ms ở lượt 1; 118.1 ms ở lượt xác nhận cuối (dao động môi trường headless/cold profile).
- DOM Node Count: 1,288.
- Startup render count: 2.
- Startup serialize count: 0.
- Listener count tại UI-ready: 261.
- `data-qlda-ui-ready="1"` xuất hiện trong DOM sau load.
- Có log `[QLDA PERF]` rõ ràng cho UI Ready, DOM Node Count, counts và baseline snapshot.
- Không thấy `Uncaught`, `SyntaxError`, `ReferenceError` hoặc `TypeError` từ ứng dụng.
- Edge có warning Tracking Prevention cho CDN XLSX; đây là hành vi môi trường/file URL có sẵn, không do instrumentation.

Hot load được hỗ trợ khi reload trong cùng tab/session; headless CLI tạo navigation mới nên không dùng làm số baseline hot.

## Đánh giá ảnh hưởng UI-ready

Instrumentation startup không thêm I/O, network, dependency, DOM mutation giao diện hay async blocking. Công việc trước UI-ready chỉ gồm khởi tạo state, một mark, wrapper đếm listener và các phép tăng số nguyên. Hai lượt cold đều hoàn tất UI-ready, không có lỗi ứng dụng; metric tương tác chỉ chạy khi người dùng thực hiện hành động tương ứng.

## Acceptance

- [x] Dùng Performance Mark/Measure API.
- [x] Có đủ metric yêu cầu và console log rõ ràng.
- [x] Không thay đổi framework hoặc logic nghiệp vụ.
- [x] Không thêm đường chặn UI-ready; trang đạt ready trong runtime test.
- [x] Không phát sinh console error từ ứng dụng.
