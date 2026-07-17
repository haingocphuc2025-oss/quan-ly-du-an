# SPEC - Report bo qua dong rong nghiep vu

Ngay: 2026-07-13
Trang thai: DA_TRIEN_KHAI

## Muc tieu

Sua man Report de khong hien thi cac dong trong ve du lieu nghiep vu, ke ca khi dong do co cot he thong nhu icon dinh kem hoac trang thai. Du lieu that trong Report phai nam lien nhau, khong bi day xuong xa boi cac dong rong.

## Pham vi

- Ap dung cho luong gom dong trong `buildReportRows`.
- Cot he thong dau dong khong duoc lam dong rong bi tinh la co du lieu.
- Dong co du lieu o cac cot nghiep vu van phai hien thi binh thuong.
- Dong bo VERSIONS, STAGING, BANDIAO va Apps Script Index.

## Ngoai pham vi

- Khong doi cau truc cot Report.
- Khong thay doi du lieu sheet nguon.
- Khong doi logic loc, sap xep, nhom hoac tong hop.

## Acceptance Criteria

- Report khong con cac dong cach xa do dong rong nguon.
- Cac dong co noi dung nghiep vu van hien thi.
- `node --check work/v25_inline.js` PASS.
- Browser local khong co console error.
