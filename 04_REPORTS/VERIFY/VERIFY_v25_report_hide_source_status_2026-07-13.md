# VERIFY - v25 report hide source/status columns

Ngay: 2026-07-13
Baseline: v25
SHA-256: `C831F5A6DE38E08DE69108B9B51FEE47644FF6B06639F7ABECC37AFE0B645622`

## PASS

- `node --check work/v25_inline.js`: PASS.
- VERSIONS, STAGING, BANDIAO va Apps Script `Index.html` cung checksum.
- Browser local Report QA:
  - Header sau cot dinh kem la `STT`.
  - Khong co header `Nguon`.
  - Khong co header `Trang thai`.
  - Data rows: 10.
- Browser local Sheet: van co cot trang thai dang cham mau.
- Console browser: 0 error, 0 warning.
