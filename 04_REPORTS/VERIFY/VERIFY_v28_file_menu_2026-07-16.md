# VERIFY V28 - File Menu Full Implementation

Ngay: 2026-07-16
Spec: file-menu-full-implementation
Baseline: v28_baseline_modules
Artifact SHA-256: 656430F739EC3170CA5879A33C08E2E116C76BDFFB4A2A257FBD43C0654FC035

## Ket qua

- PASS: File menu co handler that cho Create New, Import, Open, Save, Save as New, Save as Template, Rename, Refresh, Share, Send as Attachment, Email Shared Users, Export, Print, Delete, Activity Log va Properties.
- PASS: Import CSV/Excel co file picker, CSV parser co quoted cell, preview va che do Append/Replace.
- PASS: Save/Rename/Save as New/Delete noi vao PROJECT_FOLDERS va local persistence hien co.
- PASS: Export Excel/PDF/PNG va Print da co luong xu ly.
- PASS: Share, Email, Activity Log va Properties dung modal voi du lieu item hien tai.
- PASS: Menu con Export/Import, Escape/click ngoai va keyboard Arrow/Enter.
- PASS: V28 khong con chuoi Coming soon trong File menu.
- PASS: UTF-8 giao dien duoc giu nguyen; brand version hien v28.

## Test da chay

1. node --check MODULES_V28/js/file-menu.js - PASS.
2. node --test 56 test Node cua MODULES_V28 (bo qua 2 test Playwright phu thuoc browser package) - 56 PASS, 0 FAIL.
3. Chrome headless runtime smoke tren BANDIAO V28 - PASS:
   - appStarted=true
   - version=v28
   - utf8Title=true
   - sheetOpened=true
   - fileMenuOpened=true
   - fileCommandCount=16
   - propertiesDialog=true
   - createDialog=true
   - parse CSV quoted cell = 1,2
   - errors=[]
4. UI screenshot 1366x768 - PASS, modal Create New khong vo layout.
5. 5 artifact V28 co cung SHA-256: MODULES, VERSIONS, STAGING, BANDIAO, apps-script.

## Ban giao

- 02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v28_baseline.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v28_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v28_quan.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/apps-script/Index_v28.html
- 02_SOURCE/02_SAN_PHAM_DON_FILE/RUN_V28.bat

## Ghi chu

- Email Shared Users luu email draft local vi chua co backend email trong pham vi V28.
- Cac dich vu xuat cloud ngoai (OneDrive, Google Drive, Box, Microsoft Project) tao payload download local; tich hop OAuth/backend la pham vi rieng.

