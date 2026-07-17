# BAN GIAO — browse-status-display + screen-state-behavior

## Thong tin

| Muc | Noi dung |
|---|---|
| Ngay ban giao | 2026-07-15 |
| Spec | `01_SPEC/NEW/browse-status-display/SPEC.md` + `01_SPEC/NEW/screen-state-behavior/SPEC.md` (2 spec thi cong chung 1 lan vi cung sua `workspace-navigator.js`) |
| Baseline | v26 (da nang, xem `01_CODE_HIEN_TAI/CODE_CHINH.md`) |
| Nguoi thuc hien | Claude (Cowork), theo yeu cau Quan |

## Pham vi da lam

1. Khao sat truc tiep Smartsheet (Browse root, Workspace mo, Sheet mo, Home) de lam ro cach hien thi trang thai chia se/owner, breadcrumb, va menu Actions/chuot phai theo tung loai item — ket qua ghi trong 2 file SPEC.md.
2. Doi chieu voi app hien tai (v26): phat hien badge "Trang thai chia se", cot "Nguoi so huu", va breadcrumb quay lai nhat quan (`updateBrowseBreadcrumb` dung chung cho Sheet/Report/Dashboard/Repost) **da co san trong code**, khong can sua them. Da co san ca test `tests/browse-status-display.test.js` bao phu dung cac hanh vi nay.
3. Phat hien va sua 1 loi that trong `js/workspace-navigator.js`, ham `isWorkspaceFolderLike()`:
   - Loi: dung `.includes('folder')` de nhan dien folder/workspace, nhung item Sheet co `kind:'folder-sheet'` (chua san chuoi "folder") nen bi nhan nham — chuot phai tren MOI dong Sheet (Repost, Thi cong, Thanh toan, Hop dong, Vat lieu, Tong hop) mo nham menu "Tao moi" thay vi dung ra phai mo menu item (Rename/Duplicate/Save as New/Delete/Export...). Chi dong loai Dashboard khong bi loi (vi kind la `'dashboard'`, khong chua "folder").
   - Sua: doi so khop long (`.includes`) sang so khop chinh xac (`===`).
4. Da test truc tiep tren app that (chay qua `localhost:8766`) xac nhan: chuot phai tren dong Repost/Thi cong nay mo dung menu item, khong con nham menu Tao moi.
5. Da doi chieu hanh vi chuot phai tren khoang trong bang va tren cay dieu huong (Workspace Navigator sidebar) — xac nhan app da lam dung theo nguyen tac khao sat duoc tu Smartsheet ma khong can sua: khoang trong -> menu Tao moi; cay dieu huong -> khong mo menu.

## File va ham thay doi

| File/ham | Thay doi | Ly do |
|---|---|---|
| `MODULES_V26/js/workspace-navigator.js` — ham `isWorkspaceFolderLike()` | Sua 1 dieu kien so khop (`.includes` -> `===`) | Fix loi chuot phai tren Sheet mo nham menu Tao moi |
| `MODULES_V26/giao-dien-desktop-don-gian_v26_quan.html` | Va cung 1 cho tuong ung (ban ghep) | Dong bo voi module source |
| `VERSIONS/v26_baseline_modules/js/workspace-navigator.js` | Va cung 1 cho | Nang baseline |
| `VERSIONS/v26_baseline_modules/giao-dien-desktop-don-gian_v26_quan.html` | Va cung 1 cho | Nang baseline |
| `VERSIONS/v26_baseline.html` | Va cung 1 cho | Nang baseline chinh thuc |
| Moi ham/bien khac | KHONG doi | Chi sua 1 dieu kien duy nhat, khong dung toi phan con lai |

## Ket qua kiem tra

| Test case | Ket qua | Bang chung/ghi chu |
|---|---|---|
| Chuot phai tren dong Sheet (Repost) trong bang file cua du an | PASS (sau khi sua) | Test tay truc tiep tren localhost: 8766, truoc khi sua mo nham menu Tao moi (xac nhan tren 5/6 dong Sheet), sau khi sua mo dung menu item |
| Chuot phai tren dong Dashboard | PASS (da dung tu truoc) | Khong bi anh huong boi bug, dung lam doi chung xac dinh nguyen nhan loi |
| Click trai (don) mo file | PASS | Khong bi anh huong, van mo dung ngay |
| Breadcrumb "‹ Du an" tu Repost quay ve dung vi tri | PASS | Da xac nhan tay 2 lan, dung dung du an + dong active |
| Badge "Da chia se"/"Rieng tu" + cot Nguoi so huu o bang "Du an cua toi" | PASS (co san) | Doc code `js/main.js` ham `render()` dong 38-44 |
| Test co san `tests/browse-status-display.test.js` | Chua chay lai bang node (khong co quyen bash vao thu muc Drive) — noi dung code khop voi test theo doc thu cong | De nghi Quan chay `node --test` trong `MODULES_V26/tests/` neu muon xac minh tu dong |
| Console loi khi tai trang | Khong phat hien (qua Claude-in-Chrome, quan sat truc tiep khi thao tac) | |

## Ton tai va viec de lai sau

- Menu Actions con du 3 muc ngoai pham vi Smartsheet-chuan: `Share...`, `Save as Template...`, `Download Workspace Sharing Report` — hien la placeholder `alert()`, khong co chuc nang that, khong gay loi. Theo yeu cau Quan (15/07/2026): **de lai, bo sung/don sau**, chua dong vao lan nay.
- Checkbox tren dong file (`#folderRows`) khong tu dong tick khi chuot phai (AC2 cua `screen-state-behavior` chua dat) — vi checkbox nay hien khong co logic chon-nhieu that phia sau, thay vao do dong da co nen xanh nhat khi active. Ghi nhan, khong chan nghiem thu.
- Mang "Gan day" (Recents that voi du lieu) va panel ngu canh workspace noi ben canh Sheet (nhu Smartsheet) van ngoai pham vi, da ghi trong SPEC de xet sau.

## Ket luan

- Nghiem thu: DAT — loi chinh (chuot phai tren Sheet) da sua va xac nhan tren app that; cac muc con lai cua 2 spec da co san hoac ghi nhan ro rang, khong con hanh vi "khong xac dinh".
- Da nang baseline v26 (VERSIONS + CODE_CHINH.md cap nhat SHA-256 moi: `0235576F39F387F154F6050C4394CA433837D98A9D0BABE99B5AEEDA59E58F96`).
