# TASK - Report hide source and status columns

Ngay: 2026-07-13
Trang thai: DONE
Spec: `01_SPEC/DA_TRIEN_KHAI/report-hide-source-status-columns/spec.md`

## Viec da lam

- Cap nhat render Report de bo cot nguon va trang thai.
- Dieu chinh colgroup, header, summary/group colspan va resize skip.
- Giu cot dinh kem trong Report.
- Khong doi render Sheet; cot trang thai tren Sheet van con.
- Dong bo cac ban v25.
- Kiem tra syntax va browser local.

## Ket qua

- PASS `node --check work/v25_inline.js`.
- PASS checksum: VERSIONS, STAGING, BANDIAO va Apps Script cung SHA-256 `C831F5A6DE38E08DE69108B9B51FEE47644FF6B06639F7ABECC37AFE0B645622`.
- PASS browser: Report headers la `attachment`, `STT`, `Loai ho so`, ...
- PASS browser: Report khong co header `Nguon`.
- PASS browser: Report khong co header `Trang thai`.
- PASS browser: Sheet van co cot trang thai dang cham mau.
- PASS console: 0 error, 0 warning.
