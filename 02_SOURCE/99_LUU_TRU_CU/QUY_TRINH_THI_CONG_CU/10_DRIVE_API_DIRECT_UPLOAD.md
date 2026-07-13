# Drive API direct upload - v23

## Muc tieu

Upload file dinh kem truc tiep tu trinh duyet len Google Drive API, khong di vong qua Apps Script base64.

Duong luu file:

`DU_AN_WEB_QUAN_LY/<Ten du an>/<Folder ho so>/<file>`

Trong moi du an van dung 5 folder ho so:

- `01_HOP_DONG_PHAP_LY`
- `02_VAT_LIEU_CO_CQ`
- `03_THI_CONG_NGHIEM_THU`
- `04_THANH_TOAN_QUYET_TOAN`
- `05_TONG_HOP_DOI_CHIEU`

## Co che moi

1. Nguoi dung bam nut `Drive API`.
2. App lay OAuth access token bang Google Identity Services.
3. App tim/tao folder `DU_AN_WEB_QUAN_LY`, folder du an, folder ho so.
4. File nho upload bang Drive API multipart.
5. File tu 8 MB tro len upload bang Drive API resumable.
6. App set quyen file `Anyone with link - viewer`.
7. App luu metadata file ve dong dang chon.

Neu chua cau hinh OAuth Client ID, app tu fallback ve cach cu Apps Script/base64.

## Cau hinh can lam tren Google Cloud

1. Tao hoac chon Google Cloud project.
2. Enable `Google Drive API`.
3. Tao OAuth Consent Screen.
4. Tao OAuth Client ID loai `Web application`.
5. Them Authorized JavaScript origins:
   - `http://localhost:8765`
   - `http://127.0.0.1:8765`
   - domain/web app that neu deploy that.
6. Copy Client ID.
7. Mo app qua localhost, bam `Drive API`, dan Client ID.

Khong nen mo bang `file://` khi dung OAuth web vi Google Identity Services can origin hop le.

## File da sua

- `STAGING/giao-dien-desktop-don-gian_v23_quan.html`
- `apps-script/Code.gs`
- `BACKEND/Code.gs`

## Ghi chu ky thuat

- Frontend dung endpoint Drive API:
  - `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`
  - `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable`
- Metadata file co `parents: [folderId]`.
- Header goi API co `Authorization: Bearer <access_token>`.
- Backend them `prepareAttachmentFolder(projectName, sheetName)` de tra `folderId` nhanh khi app dang chay trong Apps Script.
