# VERIFY - v25 report skip empty rows

Ngay: 2026-07-13
Baseline: v25
SHA-256: `E723433CA7B58B717685D0CDDFFEC847327A98FB1E4760B635FDB3B65BC0BC05`

## PASS

- `node --check work/v25_inline.js`: PASS.
- VERSIONS, STAGING, BANDIAO va Apps Script `Index.html` cung checksum.
- Browser local: dong chi co cot dinh kem tra ve `true`.
- Browser local: dong chi co cot dinh kem + trang thai tra ve `true`.
- Browser local: dong co STT/du lieu nghiep vu tra ve `false`.
- Browser local: `buildReportRows` voi nguon test co 3 dong rong + 1 dong du lieu chi tra ve 1 dong du lieu.
- Console browser: 0 error, 0 warning.
