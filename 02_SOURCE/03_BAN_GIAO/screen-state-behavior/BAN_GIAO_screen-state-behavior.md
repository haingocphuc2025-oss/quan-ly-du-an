# BÀN GIAO - screen-state-behavior

- Ngày: 2026-07-15
- Trạng thái: ĐẠT
- Spec: 01_SPEC/DA_TRIEN_KHAI/screen-state-behavior/SPEC.md
- Artifact: 02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v26_quan.html
- SHA-256: 6A6126F7D4093759C1CC5BE2720DEF90E3265710EE2577A002D90A1CA58DBEAA

## Hoàn tất

- Xác nhận bản sửa isWorkspaceFolderLike đã ngăn folder-sheet bị nhận nhầm thành Folder.
- Xác nhận blank-area context menu và navigation-tree behavior đúng spec.
- Bổ sung 3 regression test; toàn bộ 15 test PASS.
- Không cần sửa thêm logic sản phẩm vì implementation hiện tại đã đúng.
- Ngoại lệ môi trường browser: helper backup 127.0.0.1:8780 bị CORS, không phải lỗi feature.