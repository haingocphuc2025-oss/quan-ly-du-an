# SPEC: Selection & Focus Bug Fix

Trang thai: NEW
Ngay tao: 13/07/2026
Cap nhat: 15/07/2026 - gop them Bug 4 (can trai/phai nhay o dau) va Bug 5 (khong xoa duoc nhieu cot)

## Muc tieu
- Sua cac bug ve chon cell / focus / highlight / thao tac cot trong Grid view va Report view.

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

### Bug 4 - Can trai/can phai lam nhay ve o dau tien
- Mo ta: khi dung chuc nang can trai (align left) hoac can phai (align right) tren 1 cell/vung dang chon, focus/scroll tu dong nhay ve o dau tien cua sheet (STT/C2), giong bug 1 nhung day la nguyen nhan cu the khac (khong phai checkbox).
- Yeu cau: sau khi ap dung can trai/can phai, focus phai giu nguyen tai cell/vung vua duoc can chinh, khong nhay ve o dau tien.

### Bug 5 - Khong xoa duoc nhieu cot cung luc
- Mo ta: khi chon nhieu cot lien tuc (hoac khong lien tuc) va thuc hien xoa, he thong khong xoa duoc dong thoi nhieu cot - chi xoa duoc tung cot mot hoac khong phan hoi.
- Yeu cau: chon nhieu cot (bang Ctrl+click hoac drag chon vung cot) roi chon "Xoa cot" (tu menu chuot phai hoac phim tat) -> tat ca cac cot da chon phai bi xoa cung luc trong 1 thao tac.

## Nguyen nhan nghi ngo (de dev kiem tra)
- Co the do selection layer (lop overlay hien highlight) khong tinh toan lai toa do khi DOM cell thay doi (resize cot, scroll, hoac re-render sau khi click checkbox hoac can chinh).
- Co the cac event (click checkbox, can trai/phai) dang bi bubble len va trigger lai ham "select cell A1" mac dinh sau khi xu ly xong thao tac chinh.
- Bug xoa nhieu cot: co the ham xoa cot dang chi nhan 1 index cot duy nhat thay vi mang cac index da chon, hoac vong lap xoa bi loi khi index thay doi sau moi lan xoa (off-by-one khi xoa tuan tu tu trai sang phai).

## Tieu chi chap nhan
1. Click checkbox tai bat ky vi tri nao trong Grid view -> focus/scroll khong nhay ve o dau tien.
2. Chon vung nhieu cell lien tuc trong Report view -> highlight hien lien khoi, dung vi tri.
3. Highlight cell/vung chon trong Grid view khop dung voi do rong/cao thuc te cua cot/hang, ke ca sau khi resize cot.
4. Can trai/can phai 1 cell hoac vung chon -> focus khong nhay ve o dau tien, giu nguyen vi tri dang thao tac.
5. Chon nhieu cot (>=2) va xoa -> tat ca cot da chon bi xoa dong thoi trong 1 lan thao tac, khong loi, khong sot cot.
6. Test lai tren ca 2 view: Grid view va Report view.

## Test case
- Luong chinh: click checkbox o hang 5 -> xac nhan focus/scroll khong doi vi tri (khong nhay ve hang 1).
- Luong chinh: drag chon vung 3x3 cell trong Report view -> xac nhan 9 o highlight lien khoi, khong co khoang cach.
- Luong chinh: chon 1 vung cell -> bam can trai roi can phai -> xac nhan focus khong doi vi tri sau moi lan bam.
- Luong chinh: chon 3 cot lien tuc -> xoa -> xac nhan ca 3 cot bien mat cung luc, cac cot con lai dich chuyen dung vi tri.
- Bien: resize 1 cot -> chon lai cell trong cot do -> highlight khop dung voi do rong moi.
- Bien: chon 2 cot khong lien tuc (Ctrl+click) -> xoa -> xac nhan ca 2 cot dung bi xoa, khong xoa nham cot khac.
- Bien: click checkbox lien tuc nhieu lan o nhieu hang khac nhau -> khong bi nhay lung tung giua cac lan click.

## Baseline/output du kien
- Ap dung cho Grid view va Report view trong 02_SAN_PHAM_DON_FILE, du kien gop vao baseline ke tiep sau v25.

## Phu thuoc
- Doc lap voi spec toolbar-grid-smartsheet-style, co the trien khai song song.
- Ke thua toan bo logic du lieu/cot hien co trong baseline v25.
