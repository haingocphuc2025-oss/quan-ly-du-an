# SPEC: Selection & Focus Bug Fix

Trang thai: DA_TRIEN_KHAI
Ngay tao: 13/07/2026

## Muc tieu
- Sua 3 bug ve chon cell / focus / highlight trong Grid view va Report view.

## Ngoai pham vi
- Khong doi cau truc du lieu, cot, hoac logic tinh toan trong sheet.
- Khong doi thiet ke toolbar hay checkbox (da co spec rieng: toolbar-grid-smartsheet-style).

## Cac bug can fix

### Bug 1 - Click checkbox nhay ve o dau tien
- Mo ta: khi click checkbox o cot du lieu (vi du cot "Hang muc") trong Grid view, focus/con tro tu dong nhay ve lai o dau tien cua sheet (STT / C2) thay vi giu nguyen vi tri vua thao tac.
- Yeu cau: sau khi click checkbox, focus phai giu nguyen tai cell vua click (hoac di chuyen xuong 1 hang neu dang o che do nhap lien tuc), khong nhay ve o A1/C2.

### Bug 2 - O boi den cach xa nhau khi chon vung trong Report view
- Mo ta: khi chon nhieu cell lien tuc (drag chon vung) trong Report view, cac o duoc highlight hien thi cach xa nhau, khong lien khoi mac du dang chon 1 vung lien tuc.
- Yeu cau: vung chon phai hien thi lien khoi, khop voi vi tri thuc te cua cac cell duoc chon, giong hanh vi Google Sheet/Excel.

### Bug 3 - Vung boi den lech do rong cot trong Grid/Sheet view
- Mo ta: vung highlight khi chon cell bi lech, khong khop voi do rong cot thuc te cua cell duoc chon.
- Yeu cau: vung highlight phai khop chinh xac voi kich thuoc (width/height) cua cell/hang/cot dang duoc chon, cap nhat dung khi cot bi resize.

## Nguyen nhan nghi ngo (de dev kiem tra)
- Co the do selection layer (lop overlay hien highlight) khong tinh toan lai toa do khi DOM cell thay doi (resize cot, scroll, hoac re-render sau khi click checkbox).
- Co the event click checkbox dang bi bubble len va trigger lai ham "select cell A1" mac dinh.

## Tieu chi chap nhan
1. Click checkbox tai bat ky vi tri nao trong Grid view -> focus/scroll khong nhay ve o dau tien.
2. Chon vung nhieu cell lien tuc trong Report view -> highlight hien lien khoi, dung vi tri.
3. Highlight cell/vung chon trong Grid view khop dung voi do rong/cao thuc te cua cot/hang, ke ca sau khi resize cot.
4. Test lai tren ca 2 view: Grid view va Report view.

## Test case
- Luong chinh: click checkbox o hang 5 -> xac nhan focus/scroll khong doi vi tri (khong nhay ve hang 1).
- Luong chinh: drag chon vung 3x3 cell trong Report view -> xac nhan 9 o highlight lien khoi, khong co khoang cach.
- Bien: resize 1 cot -> chon lai cell trong cot do -> highlight khop dung voi do rong moi.
- Bien: click checkbox lien tuc nhieu lan o nhieu hang khac nhau -> khong bi nhay lung tung giua cac lan click.

## Baseline/output du kien
- Ap dung cho Grid view va Report view trong 02_SAN_PHAM_DON_FILE, du kien gop vao baseline ke tiep sau v25.

## Phu thuoc
- Doc lap voi spec toolbar-grid-smartsheet-style, co the trien khai song song.
- Ke thua toan bo logic du lieu/cot hien co trong baseline v25.
