# TASK-V32 — Import Excel giữ cấu trúc Sheet

- Nguồn yêu cầu: `01_SPEC/DA_TRIEN_KHAI/import-excel-preserve-sheet-template-v32/SPEC.md`
- Trạng thái: DONE
- Owner: Codex
- Attempt: 1
- Max attempts: 5

## Mục tiêu

Import dữ liệu Excel vào Sheet hiện tại mà mặc định không thay đổi cấu trúc, định dạng hoặc dòng tiêu đề của Sheet đích.

## Kết quả

- Triển khai nguồn V32 tại `VERSIONS/MODULES_V32`.
- Mapping theo header/alias, không positional fallback.
- Checkbox sao chép tiêu đề mặc định tắt và chỉ đổi nhãn.
- Báo cáo cột bỏ qua; bảo vệ `_rowIndex` và `_attachments`.
- Sửa Undo snapshot để khôi phục dữ liệu và metadata cột.
- Build/sync đủ năm artifact cùng launcher.

## Acceptance criteria

- 12/12 AC PASS.
- Regression 71/71 PASS.
- Browser desktop/mobile/full-flow PASS.
- Artifact integrity PASS.

## Output

- `04_REPORTS/RELEASE/RELEASE_v32.md`
- `04_REPORTS/RELEASE/V32_VERIFY_REPORT.md`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v32_quan.html`

## Lịch sử

- 2026-07-19: Khóa spec và bắt đầu TDD.
- 2026-07-20: Regression/browser/artifact PASS; phát hành V32.
