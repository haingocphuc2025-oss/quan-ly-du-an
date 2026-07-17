# VERIFY v26 - Workspace Navigator Context Menu

Ngay: 2026-07-15
Spec: 01_SPEC/DA_TRIEN_KHAI/workspace-context-menu/SPEC.md
Baseline: 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v26_baseline.html
SHA-256: 617F234EB4106879A69148FCBCA3723356A639382C7317589B0D63D9C1FE23E4274

## Ket qua

- PASS Workspace menu: Create submenu gom Grid, Task List, Project, Cards, Browse Templates, 4 muc Import, Report, Dashboard/Portal, Folder, Workspace.
- PASS Workspace menu: Open in New Tab, Share, Remove Me from Sharing, Save as New, Workspace Colors & Logo, Request Backup, Schedule Recurring Backup, 3 muc Export, Sharing Report (csv), Properties.
- PASS Workspace menu: khong hien Rename, Delete, Make Me the Owner.
- PASS blank-area menu: chi hien Grid, Task List, Project, Cards, Browse Templates, 4 muc Import, Report, Dashboard/Portal, Folder, Workspace; khong hien Share, Backup, Export, Properties, Rename, Delete.
- PASS Sheet/Report menu: Open, Open in New Tab, Share, Make Me the Owner, Rename, Save as New, Save as Template, Request Backup, Delete, 3 muc Export, Sharing Report (csv), Properties.
- PASS blank-area menu: chi hien Grid, Task List, Project, Cards, Browse Templates, 4 muc Import, Report, Dashboard/Portal, Folder, Workspace; khong hien Share, Backup, Export, Properties, Rename, Delete.
- PASS Sheet/Report menu: khong con Duplicate; Report chon Open se goi openReport.
- PASS contextmenu tren Browse tree va dong Workspace trong bang Navigator; file row van dung menu Sheet/Report.
- PASS 19/19 test trong MODULES_V26/tests.
- PASS node --check toan bo JS module.
- PASS node --check khoi inline cua ban ghep v26.
- PASS 6 artifact v26 cung SHA-256.

## Ghi chu pham vi

Cac muc Share, Remove Me from Sharing, Make Me the Owner, backup lich, import va export PDF/Google Sheets hien la hanh vi placeholder/notify theo kien truc frontend hien tai; spec da duoc phan tach menu dung, con backend that se la cong viec rieng.