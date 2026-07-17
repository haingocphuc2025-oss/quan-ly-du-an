# TASK: Import Excel nhiều Sheet → v31

## Spec
📄 `01_SPEC/NEW/import-excel-multi-sheet/spec.md`

## Baseline
- v30: `02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v30_quan.html`
- Modules: `MODULES_V29/` (v30 dựa trên v29)

## Acceptance Criteria (từ SPEC)
- AC1: Đọc workbook nhiều sheet → hiển thị danh sách sheet
- AC2: Chọn 1 / nhiều / tất cả sheet
- AC3: Chọn dòng header (row 1, 2, 3...)
- AC4: Mapping cột Excel → cột Sheet (auto-match + dropdown)
- AC5: **Ẩn `_rowIndex` và `_attachments`** khỏi mapping UI
- AC6: 4 chế độ: Append / Update / Upsert / Skip Duplicate
- AC7: Validate: required, date format, type, skip empty, duplicate key
- AC8: Progress bar khi import
- AC9: Report modal per sheet: total, success, updated, skipped, errors
- AC10: Undo batch (snapshot trước import)
- AC11: Regression test PASS (BANDIAO/tests/*.test.js)

## Files to modify
- `STAGING/giao-dien-desktop-don-gian_v30_quan.html` → sẽ thành `v31_quan.html`
- Cập nhật `MODULES_V29/` nếu tách module mới

## Test
- Chạy `BANDIAO/tests/*.test.js` (Playwright + Node)
- Manual test: import file Excel 3 sheets → verify mapping, mode, report

## Workflow
1. Codex implement vào STAGING/v31
2. Run tests
3. Nếu PASS: copy → VERSIONS/v31_baseline.html + MODULES_V31/
4. Update TRANG_THAI_HIEN_TAI.md, DANH_MUC_SPEC.md
5. Git commit + tag v31
