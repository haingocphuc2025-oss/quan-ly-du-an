# SPEC: File Menu Full Implementation V28

Phien ban: v28
Trang thai: DA_TRIEN_KHAI
Ngay tao: 2026-07-16
Baseline: v28_baseline_modules (PASS 2026-07-16)

## Muc tieu

Lam cho toan bo menu File trong Sheet va Report hoat dong that, theo menu Smartsheet/Excel style trong anh tham chieu.

## Pham vi

- Create New: tao Grid/Sheet moi trong project hien tai.
- Import: CSV va Excel, co chon file, preview va tuy chon Append/Replace.
- Open: mo file hien tai theo context.
- Save: flush thay doi hien tai va luu project.
- Save as New: tao ban sao item.
- Save as Template: luu ban mau trong local template list.
- Rename: doi ten file va luu project.
- Refresh: tai lai giao dien tu du lieu hien tai.
- Share: modal copy link va thong tin quyen hien tai.
- Send as Attachment: tao download file export kem thong tin item.
- Email Shared Users: modal nhap nguoi nhan, luu draft hanh dong neu khong co backend email.
- Export: Excel, PDF/print, PNG view.
- Print: mo print dialog.
- Delete: xac nhan va xoa item khoi project hien tai.
- View Activity Log: hien thi log thao tac local.
- Properties: hien thi ten, loai, ngay cap nhat, so dong/cot, uoc tinh dung luong.

## Ngoai pham vi

- Khong thay doi data model cot/hang.
- Khong gui email that neu chua co backend.
- Khong xoa project neu menu dang o file; Delete chi xoa file dang mo.
- Khong thay doi co che xung dot luu project.

## Tieu chi chap nhan

1. Moi muc trong menu co handler, khong con thong bao "Coming soon".
2. Export Excel tao file XLSX hop le khi SheetJS san sang; neu thieu thu vien hien thi loi huong dan.
3. Import CSV/Excel co file picker va preview truoc khi Append/Replace.
4. Save, Rename, Save as New va Delete cap nhat du lieu local va mo lai dung item.
5. Share, Email, Activity, Properties hien modal co du lieu item hien tai.
6. Print mo print dialog; Export PNG tao file anh tu view hien tai.
7. Menu va submenu khong bi cat khoi man hinh 1366px, dong bang Escape/click ngoai.
8. Khong lam mat selection, undo/redo, resize cot hoac attachment.

## Test case

- Mo File, bam tung muc va xac nhan khong co ReferenceError.
- Sua cell, bam Save, refresh, xac nhan gia tri van con.
- Save as New, Rename, Delete item va xac nhan danh sach project cap nhat.
- Import CSV mau 2 cot, preview, Append va Replace.
- Export Excel va kiem tra file co workbook; Print mo dialog; PNG co download.
- Mo Share/Email/Activity/Properties va xac nhan dung item dang mo.
- Escape/click ngoai dong menu; keyboard Arrow/Enter van hoat dong.