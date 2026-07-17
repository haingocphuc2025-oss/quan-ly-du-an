# SPEC: Toolbar Grid View - clone phong cach Smartsheet/Excel 365

Trang thai: NEW
Ngay tao: 13/07/2026

## Muc tieu
- Thiet ke lai toolbar cua Grid view (thanh menu tren + thanh cong cu chinh) theo phong cach Smartsheet, tham khao them Excel 365 cho phan icon phang.
- Sua loi nut Undo/Redo hien khong co tac dung.

## Ngoai pham vi
- Khong doi cau truc du lieu, cot, hoac logic tinh toan trong sheet.
- Khong dung toi Report view, Dashboard view (chi ap dung cho Grid view).
- Khong them Gantt chart / progress chart.

## Bo cuc yeu cau

### Hang 1 - thanh menu tren cung
`[File] [Automation] [Forms] [Connections] [Dynamic View]` (trai, text don gian khong vien/nen)
Giua: icon file (xanh) + ten sheet, in dam, 1 dong, khong tach 2 dong nhu hien tai.
Phai: nut "Share" noi bat (nen xanh la dam, chu trang, bo goc) + icon AI canh ben (nen tim nhat) + dropdown mo rong.

### Hang 2 - thanh cong cu chinh
```
[Save][Print][Undo][Redo] | [Grid▾][Filter] | [Indent][Outdent] | [Font▾][Size▾] | [B][I][U][S] | [Fill▾][TextColor▾] | [Align▾][Wrap][ClearFormat][FormatPainter] | [Table][Highlight] | [More "..."]
```

## Quy tac thiet ke
- Icon: outline 1 mau (#4a4a4a), khong dung icon nhieu mau nhu hien tai.
- Khong vien khung quanh tung nut; chi hover moi hien nen xam nhat (#f0f0f0).
- Cac nhom nut cach nhau bang duong ke doc manh (`|`), khong dung khoang trang lon.
- KHONG dung label chu duoi moi nhom nut (khac Excel ribbon) - giu don gian nhu Smartsheet.
- Chieu cao toolbar thap, nut gon (~28-32px), khong to nhu ban hien tai.
- Font + Size: 2 dropdown rieng biet, dat giua toolbar.
- Chuc nang it dung gom vao menu "..." (More) o cuoi toolbar thay vi tran het ra ngoai.

## Fix bug bat buoc
- Undo (↺) / Redo (↻): phai bind dung vao lich su thao tac thuc te cua sheet (them/xoa dong, sua noi dung cell, thay doi dinh dang). Hien tai 2 nut nay khong co tac dung - can kiem tra da co state history stack chua, neu chua phai xay dung co che luu snapshot thao tac.

## Tieu chi chap nhan
1. Toolbar hien thi dung 2 hang, dung thu tu nhom nut nhu mo ta.
2. Click Undo sau khi sua 1 cell -> cell tro ve gia tri truoc do.
3. Click Redo sau khi Undo -> cell tro lai gia tri da sua.
4. Undo/Redo hoat dong qua toi thieu 10 buoc thao tac lien tiep (them dong, xoa dong, sua cell, doi dinh dang).
5. Khong con icon nhieu mau trong toolbar - toan bo icon outline don sac.
6. Responsive: toolbar khong vo layout o do rong man hinh laptop thong thuong (~1366px).

## Test case
- Luong chinh: sua cell -> Undo -> Redo -> kiem tra gia tri dung o moi buoc.
- Loi/bien: Undo khi chua co thao tac nao (nut phai disable, khong loi); Redo khi chua Undo (disable); Undo lien tuc vuot qua lich su luu tru (dung o trang thai dau tien, khong crash).
- Bien UI: toolbar o man hinh nho (~1024px) - menu "..." phai chua duoc cac nut bi an.

## Baseline/output du kien
- Ap dung cho Grid view trong 02_SAN_PHAM_DON_FILE, du kien gop vao baseline ke tiep sau v25.

## Phu thuoc
- Khong phu thuoc spec khac dang NEW.
- Ke thua toan bo logic du lieu/cot hien co trong baseline v25.
