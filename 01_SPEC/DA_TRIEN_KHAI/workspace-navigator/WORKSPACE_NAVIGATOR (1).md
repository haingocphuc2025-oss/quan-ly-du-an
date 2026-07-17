# SPEC: Workspace Navigator + Report Row Number

Trang thai: NEW
Ngay tao: 13/07/2026
Cap nhat: 15/07/2026 - gop them Phan C: right-click Actions menu

## Muc tieu
- Them nut "Ve danh sach du an" hien khi dang o trong Sheet/Report/file bat ky, bam vao mo panel danh sach workspace (tham khao Smartsheet Browse/Workspaces).
- Them cot so thu tu dong (row number) o dau bang trong Report view, giong Grid view dang co.
- Them nut unhide cho cot da bi an trong bang ben phai panel.
- Them chuc nang chuot phai (right-click) hien menu ngu canh giong het nut "Actions".

## Ngoai pham vi
- Khong thay the cach chon du an hien tai cua he thong (chi la lop dieu huong bo sung).
- Khong lam tinh nang chia se nhieu nguoi dung (khong can cot Owner/Sharing Status).
- Khong doi toolbar hay checkbox (da co spec rieng: toolbar-grid-smartsheet-style).

## Phan A - Workspace Navigator

### Vi tri va cach kich hoat
- Them nut "◀ Du an" (hoac icon tuong tu) co dinh o goc tren trai, hien thi o moi man hinh: Sheet, Report, Dashboard, hoac bat ky file thu cap nao.
- Bam vao nut nay -> mo panel danh sach du an (dang overlay hoac slide-in tu ben trai), khong roi khoi trang hien tai neu nguoi dung huy.

### Bo cuc panel
- Cay thu muc ben trai: Portfolios, WorkApps, Scenario Plans, Sheets, Workspaces (co the expand/collapse tung du an) - tham khao cau truc Smartsheet Browse.
- Bang danh sach ben phai: chi 2 cot **Name** va **Last Update** (bo Owner va Sharing Status vi app dung cho 1 nguoi dung, khong co chia se nhieu nguoi).
- Bam chon 1 dong trong bang -> dong panel va dieu huong vao Sheet/Report cua du an do.

### Hanh vi
- Panel phai hoat dong dong nhat tren moi view (Sheet, Report, Dashboard, file dinh kem).
- Dong panel (click ra ngoai hoac nut dong) -> giu nguyen trang thai man hinh dang xem truoc do, khong mat du lieu dang nhap.

## Phan B - Report view: them cot so thu tu dong

### Mo ta
- Grid view hien da co cot so thu tu (1, 2, 3...) o dau bang, ben trai cot dau tien cua du lieu.
- Report view hien khong co cot nay.

### Yeu cau
- Them cot so thu tu dong vao Report view, vi tri dau tien (ben trai tat ca cac cot du lieu), dong bo voi cach hien thi cua Grid view.
- So thu tu tu dong cap nhat theo thu tu dong hien tai trong Report (sau khi filter/sort), khong phai so co dinh theo Grid view goc.

## Phan C1 - Nut unhide cot da an

### Mo ta
- Bang ben phai panel da co chuc nang an (hide) cot nhung chua co nut de hien lai (unhide) cot da an.

### Yeu cau
- Them nut/menu "Hien cot da an" (hoac danh sach checkbox cac cot dang bi an) de nguoi dung bat lai cot da an bat ky luc nao.

## Phan C2 - Chuot phai hien menu Actions

### Mo ta
- Hien tai chi co the mo menu thao tac (Rename, Delete, Move, Duplicate, Share...) qua nut "Actions" o goc tren.
- Yeu cau: chuot phai (right-click) vao 1 dong file/du an phai hien menu ngu canh voi CUNG NOI DUNG va hanh vi nhu khi bam nut "Actions" cho dong do.

### Pham vi ap dung
- Ap dung cho CA HAI vi tri:
  1. Sidebar cay thu muc ben trai (cac dong file/workspace trong cay).
  2. Bang danh sach chinh ben phai (cac dong file trong bang Name/Last Update).

### Hanh vi
- Right-click vao 1 dong -> hien menu ngu canh tai vi tri chuot, noi dung menu giong het menu "Actions" (cac lua chon: Rename, Delete, Move, Duplicate, Share, hoac cac muc tuong ung da co san trong Actions).
- Click ra ngoai menu hoac nhan Esc -> dong menu, khong thuc hien hanh dong nao.
- Right-click vao dong khac trong khi menu dang mo -> dong menu cu, mo menu moi cho dong vua duoc chon.

## Tieu chi chap nhan
1. Nut "Ve danh sach du an" xuat hien va hoat dong dung tren ca Sheet, Report, va file thu cap.
2. Panel danh sach hien dung cay thu muc + bang Name/Last Update, bam chon dua vao dung du an.
3. Dong panel khong lam mat du lieu/trang thai dang xem.
4. Report view co cot so thu tu dong o dau bang, cap nhat dung theo thu tu hien tai (sau filter/sort).
5. Cot da an co the duoc hien lai qua nut/menu unhide.
6. Right-click vao dong file/du an (ca sidebar va bang chinh) hien dung menu Actions, cac lua chon hoat dong dung nhu khi bam nut Actions.

## Test case
- Luong chinh: dang o trong 1 Sheet -> bam nut "Ve danh sach du an" -> chon 1 du an khac trong bang -> vao dung Sheet cua du an do.
- Luong chinh: mo Report view -> xac nhan cot so thu tu hien dung 1,2,3... khop voi so dong hien co.
- Luong chinh: an 1 cot -> mo lai qua nut unhide -> xac nhan cot hien lai dung du lieu.
- Luong chinh: right-click vao 1 dong trong sidebar -> xac nhan menu hien dung, chon "Rename" -> hoat dong dung nhu bam Actions > Rename.
- Luong chinh: right-click vao 1 dong trong bang chinh ben phai -> xac nhan menu hien dung tai vi tri chuot, cac lua chon giong Actions.
- Bien: dang nhap du lieu dang do (chua luu) -> bam nut dieu huong -> huy (khong chon du an nao) -> quay lai dung trang thai truoc do, khong mat du lieu.
- Bien: filter/sort Report view -> cot so thu tu cap nhat dung theo thu tu moi.
- Bien: right-click lien tuc vao nhieu dong khac nhau -> menu dong/mo dung, khong bi ket menu cu.

## Baseline/output du kien
- Ap dung cho toan bo cac view (Sheet, Report, file thu cap) va rieng Report view cho phan cot so thu tu.
- Du kien gop vao baseline ke tiep sau v25.

## Phu thuoc
- Doc lap voi toolbar-grid-smartsheet-style va selection-focus-bug-fix, co the trien khai song song.
- Ke thua toan bo logic du lieu/cot hien co trong baseline v25.
