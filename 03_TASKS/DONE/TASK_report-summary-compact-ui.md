# TASK - Report summary compact UI

Ngay: 2026-07-13
Trang thai: DONE
Spec: `01_SPEC/DA_TRIEN_KHAI/report-summary-compact-ui/spec.md`

## Viec da lam

- Khoa text summary/group cua Report thanh mot dong co ellipsis.
- Doi `reportGridWrap` tu flex sang block khi mo Report de table khong bi stretch chieu cao.
- Dat table Report `height:auto`.
- Sua CORS trong `BANDIAO/local_file_helper.py` cho origin localhost hop le khi request kem credentials.
- Dong bo cac ban v25.
- Kiem tra syntax, checksum va browser local.

## Ket qua

- PASS `node --check work/v25_inline.js`.
- PASS checksum: VERSIONS, STAGING, BANDIAO va Apps Script cung SHA-256 `9164CD5DA86C61EA022A2EDB201DD63D2F09B2C48255253967F4FF12B199E36B`.
- PASS browser: summary row 33px khi Report row height = 32px.
- PASS browser: data row dau tien 33px.
- PASS browser: khoang cach sau summary = 0.
- PASS console: 0 error, 0 warning.
