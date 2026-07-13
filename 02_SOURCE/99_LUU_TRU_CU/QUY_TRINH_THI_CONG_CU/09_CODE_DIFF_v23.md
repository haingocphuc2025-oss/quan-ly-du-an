# CODE DIFF v23 - PROJECT FOLDER/SHEET STRUCTURE

Ngay cap nhat: 2026-07-08

## File thi cong

`STAGING/giao-dien-desktop-don-gian_v23_quan.html`

## Muc tieu

Chuyen giao dien quan ly ho so du an cap xa sang cau truc gon:

- `01_HOP_DONG_PHAP_LY`
- `02_VAT_LIEU_CO_CQ`
- `03_THI_CONG_NGHIEM_THU`
- `04_THANH_TOAN_QUYET_TOAN`
- `05_TONG_HOP_DOI_CHIEU`

Moi du an co 5 folder lon tren. Moi folder hien co 1 sheet ho so duy nhat de quan ly chi tiet.

## Thay doi chinh

- Thay template folder cu bang `PROJECT_ARCHIVE_GROUPS` gom 5 nhom ho so co dinh.
- Moi folder ho so co 1 `grid`/sheet noi bo; `uploadFolder` trung voi ten folder tren Drive.
- Them migration `normalizeAllProjectFolders()` de du lieu cu load tu Drive van ep ve 5 nhom ho so hien hanh.
- Doi bo cot sheet sang dang quan ly ho so:
  `Loai ho so`, `Hang muc`, `So van ban`, `Ngay van ban`, `Noi dung`, `Don vi phat hanh`, `Nguoi phu trach`, `Han xu ly`, `Gia tri`, `Tinh trang`, `Ghi chu`.
- Khi bam ghim upload file, app truyen `archiveFolderName` theo sheet dang mo, vi du `02_VAT_LIEU_CO_CQ`.
- Sua metadata file dinh kem de luu `driveId`, `driveLink`, `driveDownloadUrl` dung voi renderer hien co.
- Them fallback cho local `file://`: neu khong co `google.script.run`, app van render du lieu mau va khong crash khi test truc tiep tu file HTML.

## Ghi chu kiem tra

- Da xac nhan trong source khong con template folder cu nhu `Sheet du lieu goc`, `Quyet dinh chu truong`, `Khao sat hien trang`, `Lap BCKTKT`.
- Da sua loi thieu dau dong ham `addAttachmentFiles`, `node --check` da pass.
- Browser noi bo khong cho mo truc tiep `file://`, nen da test qua server local `http://127.0.0.1:8765`.
- Da kiem tra: mo du an dau tien hien dung 5 folder, moi folder ghi `1 sheet`; mo `02_VAT_LIEU_CO_CQ` hien sheet `Vat lieu - CO CQ / Sheet ho so`; panel ghim hien `02_VAT_LIEU_CO_CQ` khi chon o dinh kem.

## Update attachment panel

- Bam vao o ghim chi mo panel `Attachments`, khong tu bat hop thoai chon file.
- Panel co tab `Row / Sheet / All`, banner dong dang chon, khu Actions/sort va nut `Attach Files to Row X`.
- File van upload theo folder/sheet dang mo, vi du `02_VAT_LIEU_CO_CQ`.

## Update docked attachments + upload path

- Panel `Attachments` da duoc dock vao layout man hinh ben phai; grid tu chua khoang trong, panel khong nam trong vung scroll cua bang.
- Bam ghim chi mo panel; nut upload nam trong panel.
- Duong upload moi:
  `DU_AN_WEB_QUAN_LY/<Ten du an>/<Folder ho so dang mo>/<file>`
- Da bo tang trung gian cu:
  `Dinh kem/<Sheet>/<Dong>`
- Backend tao san 5 folder ho so trong folder du an:
  `01_HOP_DONG_PHAP_LY`, `02_VAT_LIEU_CO_CQ`, `03_THI_CONG_NGHIEM_THU`, `04_THANH_TOAN_QUYET_TOAN`, `05_TONG_HOP_DOI_CHIEU`.



## Update Drive API direct upload

- Da them co che upload truc tiep bang Google Drive API sau khi cau hinh OAuth Client ID.
- File nho dung multipart upload; file tu 8 MB tro len dung resumable upload.
- Duong luu van theo folder du an: `DU_AN_WEB_QUAN_LY/<Ten du an>/<Folder ho so>/<file>`.
- Neu chua cau hinh OAuth hoac dang mo bang `file://`, app fallback ve upload Apps Script/base64.
- Huong dan cau hinh chi tiet: `10_DRIVE_API_DIRECT_UPLOAD.md`.
