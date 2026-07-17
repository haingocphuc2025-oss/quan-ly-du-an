# TASK - Report bo qua dong rong nghiep vu

Ngay: 2026-07-13
Trang thai: DONE
Spec: `01_SPEC/DA_TRIEN_KHAI/report-skip-empty-source-rows/spec.md`

## Viec da lam

- Them `isBlankReportSourceRow` de bo qua cot he thong khi xac dinh dong rong.
- Cap nhat `buildReportRows` de loai dong rong nghiep vu truoc khi render Report.
- Dong bo VERSIONS, STAGING, BANDIAO va Apps Script Index.
- Kiem tra syntax va browser local.

## Ket qua

- PASS `node --check work/v25_inline.js`.
- PASS browser: dong chi co icon/trang thai bi loai khoi Report.
- PASS browser: dong co du lieu nghiep vu van hien thi.
- PASS console: 0 error, 0 warning.
- Checksum UI: `E723433CA7B58B717685D0CDDFFEC847327A98FB1E4760B635FDB3B65BC0BC05`.
