# VERIFY — SPEC NEW trên baseline v23

Ngày: 2026-07-13
Baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v23_baseline.html`
SHA-256: `03DCDB93...`

## Kiểm tra chung

- Ba bản VERSIONS/BANDIAO/STAGING cùng kích thước 437.788 byte và cùng SHA-256.
- JavaScript trích từ HTML: `node --check` PASS.
- Người dùng xác nhận sản phẩm đã nghiệm thu.
- Chrome DevTools MCP không khả dụng trong phiên; không tạo được bằng chứng browser mới.

## Kết quả

| Spec | Kết quả | Bằng chứng tĩnh |
|---|---|---|
| attachment-panel-ui | PASS | Có panel, upload nhiều file, preview/delete và toolbar handler |
| workspace-context-menu | PASS | Có menu item, create/open/rename/duplicate/delete/export |
| column-types mở rộng | PASS | Có duration, auto number, system columns, contact/checkbox/symbol config |
| report-view | PASS | Có source/columns/filter/group/summary/sort/write-back và lưu config |
| dashboard-configuration | CHƯA ĐẠT | Có render/chart nhưng thiếu widget picker, chart config panel và drag/edit D3 |
| repost-carry-forward | CHƯA ĐẠT | Không tìm thấy hàm/luồng carry-forward |

## Kết luận

Bốn spec PASS được chuyển sang `DA_TRIEN_KHAI`. Dashboard và repost-carry-forward giữ ở `NEW` để tiếp tục thi công. Không nâng version vì vẫn còn spec chưa đạt và không có regression browser độc lập.