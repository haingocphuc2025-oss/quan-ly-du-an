# VERIFY v27 - Report source dialog actions

Date: 2026-07-15
Status: PASS

## Root cause

`openReportSourceChooser`, `renderReportView` và `setReportRowHeight` gọi `rememberRecentProject(projectIndex)` dù không có biến `projectIndex` trong scope. ReferenceError dừng luồng trước khi popover Nguồn hiển thị.

## Delivered

- Dùng `activeProjectIndex` tại ba luồng Report không nhận project index qua tham số.
- Thêm nút Hủy và OK vào footer popover Nguồn.
- Nguồn được chọn trong `reportSourceDraft`; checkbox không render Report ngay.
- Hủy hoặc đóng ngoài popover bỏ bản nháp.
- OK sao chép bản nháp vào `config.sources`, render Report và lưu local backup.
- Có focus keyboard và focus-visible cho hai action.

## Verification

- TDD reproduction: 3 test RED trước fix.
- Feature tests: 3/3 PASS.
- Full v27 regression: 38/38 PASS.
- `node --check` report.js/dashboard.js: PASS.
- Packaged inline syntax: PASS.
- Artifact contract: PASS.
- Browser isolated: trước fix tái hiện ReferenceError; sau fix trang tải 0 error/0 warning và DOM có Hủy/OK là button.
- Diff hygiene: PASS.
- Review correctness/readability/architecture/security/performance: APPROVE.

## Artifact

- SHA-256: `c1cd04d32b28d80c49b5f293566cf1c5f5d932dbbf963379b625768cf92fc463`
- Đồng bộ MODULES_V27, STAGING, BANDIAO, apps-script và v27 baseline.
