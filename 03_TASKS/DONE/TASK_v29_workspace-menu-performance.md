# TASK V29 — Workspace menu viewport-safe và tối ưu khởi động

- Nguồn yêu cầu: SPEC V29 revision 1
- Trạng thái: DONE
- Owner: Codex
- Attempt: 1
- Max attempts: 5

## Mục tiêu

Tạo V29 từ baseline V28: menu/submenu luôn nằm trong viewport và loại bỏ polling khởi tạo File menu, có đo hiệu năng trước/sau.

## File được phép sửa

- `01_SPEC/NEW/workspace-menu-viewport-performance-v29/`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V29/`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/*v29*`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/*v29*`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/*v29*`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/apps-script/Index_v29.html`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/RUN_V29.bat`
- `02_SOURCE/TRANG_THAI.md`, `01_SPEC/DANH_MUC_SPEC.md`, `04_REPORTS/`, `02_SOURCE/03_BAN_GIAO/`

## File cấm sửa

- Baseline/artifact V28 và cũ hơn.
- `_PROJECT_DATA`, `_LOCAL_ATTACHMENTS`, backend và dữ liệu người dùng.

## Input

- `VERSIONS/v28_baseline_modules/`
- Yêu cầu menu viewport-safe và mục tiêu hiệu năng trong SPEC V29.

## Acceptance criteria

- Đạt toàn bộ AC trong SPEC V29.
- Không hồi quy chức năng menu V28.
- Có HTML đơn build từ module và bằng chứng SHA/test/browser.

## Test bắt buộc

- Unit RED/GREEN cho thuật toán position/flip/scroll.
- `node --check` toàn bộ module JS.
- Toàn bộ Node regression tests.
- Browser 1366×768, zoom/scaling tương đương 100/125/150%, console sạch.
- So sánh performance baseline V28 với V29.

## Output cần nộp

- Module V29, HTML staging/BANDIAO/baseline, report VERIFY/REGRESSION/RELEASE và biên bản bàn giao.

## Lịch sử

- 2026-07-16: Tạo task, khóa baseline V28, bắt đầu RED.
- 2026-07-16: GREEN; browser/integrity/performance PASS; nâng baseline V29 và bàn giao.
