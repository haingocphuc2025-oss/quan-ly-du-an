# VERIFY v26 - browse-status-display

Ngày: 2026-07-15
Spec: 01_SPEC/DA_TRIEN_KHAI/browse-status-display/SPEC.md
Baseline: 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v26_baseline.html
SHA-256: 6A6126F7D4093759C1CC5BE2720DEF90E3265710EE2577A002D90A1CA58DBEAA

## Kết quả

- PASS AC1-AC2: Browse/Workspace Navigator hiển thị trạng thái chia sẻ và owner từ dữ liệu; true/false được test cho Đã chia sẻ/Riêng tư.
- PASS AC3-AC4: Grid, Repost, Report, Dashboard dùng breadcrumb tên dự án; browser xác nhận Grid/Repost/Dashboard quay đúng Browse. Report được bao phủ bằng test vì dữ liệu mẫu không có Report.
- PASS AC5 ứng dụng: không còn lỗi JavaScript/TDZ; 12/12 test PASS; toàn bộ module qua node --check.
- PASS đồng bộ: MODULES_V26, VERSIONS, STAGING, BANDIAO và apps-script/Index.html cùng SHA-256.
- PASS review: không đổi data model/backend; không phát hiện secret mới.

## Sửa lỗi baseline trong nghiệm thu

Sửa thứ tự khởi tạo APP_USER_NAME_KEY, PROJECT_FOLDERS, Grid DOM listeners, FORMAT_RULE_COLORS và chuyển initAuth xuống module cuối. Bổ sung 5 regression test.

## Ngoại lệ môi trường

Console localhost còn request backup tới 127.0.0.1:8780/project bị CORS. Đây là helper cục bộ ngoài artifact, ứng dụng đã catch/fallback; không còn exception JavaScript của feature.
