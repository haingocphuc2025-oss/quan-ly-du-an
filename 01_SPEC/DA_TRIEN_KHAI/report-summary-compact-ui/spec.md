# SPEC - Report summary compact UI

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Sua giao dien Report de dong tong hop/group khong bi cao bat thuong do chu bi xuong dong trong cot hep hoac table bi stretch trong khung flex. Du lieu trong Report phai bat dau sat ngay sau dong tong hop, dung row height nguoi dung chon.

## Pham vi

- Ap dung CSS cho dong summary/group cua Report.
- Noi dung dai trong dong tong hop duoc cat bang ellipsis tren mot dong.
- Vung grid Report khong stretch table theo chieu cao khung.
- Sua CORS helper local de console localhost khong bi loi khi request kem credentials.
- Khong doi du lieu, cong thuc report, filter, sort, group hoac summarize.
- Dong bo VERSIONS, STAGING, BANDIAO va Apps Script Index.

## Acceptance Criteria

- Dong `Tong cong toan bao cao` khong con tao khoang trang lon.
- Dong summary/group giu dung chieu cao row height Report.
- Cac dong du lieu hien lien tiep ben duoi summary.
- `node --check work/v25_inline.js` PASS.
- Browser local khong co console error.
