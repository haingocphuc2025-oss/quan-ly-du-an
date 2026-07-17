# SPEC - Import Excel Active Grid and Merged Cells

Trang thai: DA_TRIEN_KHAI
Baseline: v31.2
Ngay: 17/07/2026

## Muc tieu

- Import Excel nhan dung Grid Sheet dang mo.
- Ho tro worksheet co merged cells.
- Giu hai cot he thong attachment va status nam ngoai toan bo luong import.

## Quy tac

1. Active Sheet duoc lay tu `activeSheetContext` va `PROJECT_FOLDERS`.
2. Gia tri merged cell duoc ke thua tu o goc tren-trai cho toan bo vung gop.
3. Cot index 0 va 1 khong xuat hien trong mapping, validation hoac ghi du lieu.
4. Mapping bi sua thu cong cung khong the ghi vao cot 0 va 1.
5. Cot ma nhu `So van ban` la text, khong bi ep number do cau hinh cu bi lech.
6. Sau import phai render lai dung Sheet va luu trang thai du an.

## Tieu chi chap nhan

- Khong con canh bao `Import chi ap dung cho Grid Sheet` khi dang mo Grid Sheet.
- File co merged cells hien gia tri day du trong preview va du lieu da import.
- Mapping chi co destination tu index 2 tro di.
- Import thu nghiem 2 dong: 2 valid, 0 error, mo report thanh cong.
- Node regression va browser console deu sach.

