# SPEC: Workspace Navigator + Report Row Number

Trang thai: DA_TRIEN_KHAI
Ngay tao: 13/07/2026

## Muc tieu
- Them nut "Ve danh sach du an" hien khi dang o trong Sheet/Report/file bat ky, bam vao mo panel danh sach workspace (tham khao Smartsheet Browse/Workspaces).
- Them cot so thu tu dong (row number) o dau bang trong Report view, giong Grid view dang co.

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

## Tieu chi chap nhan
1. Nut "Ve danh sach du an" xuat hien va hoat dong dung tren ca Sheet, Report, va file thu cap.
2. Panel danh sach hien dung cay thu muc + bang Name/Last Update, bam chon dua vao dung du an.
3. Dong panel khong lam mat du lieu/trang thai dang xem.
4. Report view co cot so thu tu dong o dau bang, cap nhat dung theo thu tu hien tai (sau filter/sort).

## Test case
- Luong chinh: dang o trong 1 Sheet -> bam nut "Ve danh sach du an" -> chon 1 du an khac trong bang -> vao dung Sheet cua du an do.
- Luong chinh: mo Report view -> xac nhan cot so thu tu hien dung 1,2,3... khop voi so dong hien co.
- Bien: dang nhap du lieu dang do (chua luu) -> bam nut dieu huong -> huy (khong chon du an nao) -> quay lai dung trang thai truoc do, khong mat du lieu.
- Bien: filter/sort Report view -> cot so thu tu cap nhat dung theo thu tu moi.

## Baseline/output du kien
- Ap dung cho toan bo cac view (Sheet, Report, file thu cap) va rieng Report view cho phan cot so thu tu.
- Du kien gop vao baseline ke tiep sau v25.

## Phu thuoc
- Doc lap voi toolbar-grid-smartsheet-style va selection-focus-bug-fix, co the trien khai song song.
- Ke thua toan bo logic du lieu/cot hien co trong baseline v25.
