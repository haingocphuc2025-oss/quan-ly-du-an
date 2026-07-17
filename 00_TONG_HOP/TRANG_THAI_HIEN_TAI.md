# TRANG THAI THI CONG

Cap nhat: 17/07/2026

| Muc | Gia tri |
|---|---|
| Baseline hien hanh | v30 |
| Staging hien hanh | v31 |
| Baseline file | `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v30_baseline.html` |
| Staging file | `02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v31_quan.html` |
| Spec NEW | 1 (sheet-active-right-toolbar-rail) |
| Trang thai | HOAN TAT v31 (Import Excel multi-sheet) |
| Tests | 32/32 PASS |
| Rollback | `VERSIONS/v28_baseline.html` |
| GitHub | https://github.com/haingocphuc2025-oss/quan-ly-du-an |
| GitHub Pages | https://haingocphuc2025-oss.github.io/quan-ly-du-an/ |

## v31 Changelog
- Import Excel multi-sheet: sheet picker, header row picker, column mapping, 4 modes (Append/Update/Upsert/Skip), validate, progress, report per sheet, undo batch
- `_rowIndex` and `_attachments` filtered from import mapping UI
- Git commit: `41dcfb0`

## v30 Baseline
- v30 duoc tao tu module VERSIONS/v30_baseline_modules/ (index.html + css/main.css + 11 js modules)
- v31 based on v31_baseline_modules/ (index.html + css/3 + js/13 modules)
