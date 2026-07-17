# VERIFY - v25 report summary compact UI

Ngay: 2026-07-13
Baseline: v25
SHA-256: `9164CD5DA86C61EA022A2EDB201DD63D2F09B2C48255253967F4FF12B199E36B`

## PASS

- `node --check work/v25_inline.js`: PASS.
- VERSIONS, STAGING, BANDIAO va Apps Script `Index.html` cung checksum.
- Browser local voi report QA 10 dong, row height 32px:
  - `reportGridWrap`: `block`.
  - Summary row: 33px.
  - Data row dau tien: 33px.
  - Khoang cach sau summary: 0.
  - Data rows: 10.
- Console browser sau khi sua CORS helper: 0 error, 0 warning.
