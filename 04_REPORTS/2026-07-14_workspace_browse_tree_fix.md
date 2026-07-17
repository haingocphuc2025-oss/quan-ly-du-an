# Nghiem thu sua Browse/Workspaces tree

Ngay: 2026-07-14

## Noi dung da sua
- Giu giao dien cu cua man hinh Du an/Trang chu, khong dung trang Browse rieng.
- Trong khoi Browse, muc Workspaces hien theo cay cap: du an -> sheet/report/dashboard con.
- An bang danh sach du an lap ben duoi khi dang hien cay Browse de tranh trung lap.
- Sua CSS hidden cho workspace-browse-page de thuoc tinh hidden that su an khoi.
- Sua khoi tao Browse de man hinh Du an/Trang chu mo ra la hien cay ngay.
- Sua activeProjectIndex va PROJECT_FOLDERS tranh loi TDZ khi Browse render som.
- Refresh lai cay Browse sau khi load/render du lieu xong.

## File da dong bo
- 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v25_baseline.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v25_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v25_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/apps-script/Index.html

## Kiem tra
- Tach JS tu HTML va chay node --check: PASS.
- Kiem bang browser local: PASS, Browse hien Workspaces -> du an -> cac muc con Hop dong/Vat lieu/Thi cong/Repost/Dashboard.
- Checksum 4 file dong bo: 8B2E141138DA19797FA9E739CB6D4630F3061337DFDE6E25E64C3400BD5AAAF2.

## Bo sung focus file dang mo
- Khi dang o Sheet/Report/Repost/Dashboard bam nut Du an, app luu lai context file dang mo truoc khi dong view.
- Cay Browse > Workspaces dung context nay de active dung du an va dung file con.
- Node file dang chon co nen xanh nhat va vach xanh #2563EB ben trai.
- Cay tu cuon den node dang active bang scrollIntoView({block:'nearest'}).
- Check JS: node --check PASS.
- Checksum 4 file dong bo: 08882C99C7E6C805DD9282428DE7029EFAB4A049B5FD323ED0A9209FEE79B952.

## Bo sung don dep Browse
- Xoa cac muc khong dung: Portfolios, WorkApps, Scenario Plans, Sheets khoi Browse va Workspace Navigator.
- Browse chi con Workspaces + cay du an/file.
- Check JS: node --check PASS.
- Checksum 4 file dong bo: 8703C1C500BAE1CFE8ACF8F163485E6523F7651C092248910F16BD914D57DA0D.


## Bo sung Browse 2 cot theo xac nhan
- Browse hien 2 cot: trai la cay Workspaces, phai la danh sach file/folder cua du an dang chon.
- Click project trong cay chi cap nhat danh sach ben phai; click file/folder moi mo file.
- Khong hien cac muc phu Portfolios/WorkApps/Scenario Plans/Sheets.
- Check bang browser snapshot: PASS.
- Check JS: node --check PASS.
- Checksum 4 file dong bo: 4AA136AC75449F86DD2117295D59FE2E4DFAAC5366EE42F5143D1B6B9B799A88.

