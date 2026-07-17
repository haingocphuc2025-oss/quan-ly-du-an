# SPEC - Import Excel Auto Schema

Trang thai: DA_TRIEN_KHAI
Baseline: v31.3
Ngay: 17/07/2026

## Muc tieu

Import Excel khong bat nguoi dung chon mapping tung cot. Dòng tieu de Excel duoc chuyen thanh text va chep nguyen van vao Sheet.

## Quy tac

1. Bo qua hoan toan man mapping thu cong trong luong chinh.
2. Cot Excel thu nhat map vao cot Sheet index 2; cac cot sau map tuan tu.
3. Cot he thong index 0/1 giu nguyen va nam ngoai import.
4. Header duoc luu bang `String(value)` va chep nguyen noi dung, ke ca khoang trang.
5. Cac cot nhan du lieu import duoc dat type `text`.
6. Neu Excel co nhieu cot hon Sheet, tat ca row duoc mo rong tu dong.
7. Header chi duoc ap dung khi nguoi dung bam Execute Import.
8. Merged cells tiep tuc ke thua gia tri o goc tren-trai.

## Tieu chi chap nhan

- Sau khi chon header, di thang den Validation Summary.
- Khong xuat hien `import-mapping-dialog`.
- Header Excel va header Sheet giong nhau tung chuoi.
- File 8 cot mo rong Sheet tu 8 thanh 10 cot (gom 2 cot he thong).
- Hai cot he thong khong thay doi.
- Import 2 dong PASS, report hien dung, console 0 error.

