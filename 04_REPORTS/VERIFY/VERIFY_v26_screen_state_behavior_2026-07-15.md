# VERIFY v26 - screen-state-behavior

Ngày: 2026-07-15
Spec: 01_SPEC/DA_TRIEN_KHAI/screen-state-behavior/SPEC.md
Baseline: 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v26_baseline.html
SHA-256: 6A6126F7D4093759C1CC5BE2720DEF90E3265710EE2577A002D90A1CA58DBEAA

## Kết quả

- PASS AC1: folder-sheet được phân loại là Sheet, không rơi vào menu Tạo mới; Folder/Workspace vẫn dùng menu tạo.
- AC2 giữ nguyên quyết định spec: checkbox ở folderRows chưa có state bulk-select thực, active highlight được dùng thay thế và không chặn nghiệm thu.
- PASS AC3: khoảng trống đi vào showWorkspaceLayoutMenuAt; cây Workspace Navigator không đăng ký contextmenu cho row.
- PASS AC4 ứng dụng: không có exception JavaScript của feature. Browser chỉ ghi CORS helper backup localhost cổng 8780 đã biết.
- Regression: 3 test mới cho classifier, route menu row/blank và navigation tree.
- Full suite: 15/15 PASS.
- Build: PASS; module source và artifact đã đồng bộ baseline/staging/bàn giao/Apps Script.

## Code review

Không có finding bắt buộc. Test được giới hạn vào đúng handler folderRows để tránh false positive; không thêm dependency, không đổi data model, backend hoặc điều hướng.