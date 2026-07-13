# 00_TONG_HOP_NOI_DUNG_DU_AN

Ngay cap nhat: 09/07/2026
Day la file doc dau tien. Moi AI/nguoi dung doc file nay truoc khi lam bat cu viec gi.

---

## Muc dich

File nay gom cac thong tin quan trong dang bi phan tan, giup AI va nguoi dung hieu dung trang thai hien tai. Nguyen tac: mot thong tin chi co mot noi quan ly. File nay chi tom tat va chi duong den file goc.

---

## Trang thai hien tai

- Du an: **DU AN WED QUAN LY**
- San pham: web quan ly ho so du an cap xa/phuong
- **Phien ban hien hanh: v23** (da nghiem thu 08/07/2026)
- **Phien ban dang phat trien: v24**
- File thi cong chinh (v23): `03_NHA_THAU_THI_CONG/VERSIONS/v23_baseline.html`
- File dau ra v24: `03_NHA_THAU_THI_CONG/STAGING/giao-dien-desktop-don-gian_v24_quan.html`
- Huong chay uu tien: **Apps Script Web App + google.script.run**
- Apps Script URL: `https://script.google.com/macros/s/AKfycbz0gNqKkLzp4xuVdW7BoaKuiIVltf9_AOrHml7vsLVxz7zxwT0r5hT1-ebMzUrpnnfW/exec`
- Huong phu: Drive API direct upload (cho file lon)

---

## Viec dang lam — v24

SPEC: `01_BAN_QLDA/SPEC_MOI_DUYET/attachment-panel-ui/spec.md`

1. Right toolbar doc ben phai (4 icon)
2. Attachment panel co dinh ben phai, de len layout
3. Upload nhieu file 1 luc, khong gioi han dung luong
4. Icon Sheet/Folder/Report xin — SVG inline chat luong cao
   - Sheet: xanh la #107C41 (mau Excel)
   - Folder: vang #FFB900 (mau Windows)
   - Report: cam #D83B01 (mau Power BI)

---

## Cau truc ho so moi du an

Moi du an co 5 nhom ho so:
1. 01_HOP_DONG_PHAP_LY
2. 02_VAT_LIEU_CO_CQ
3. 03_THI_CONG_NGHIEM_THU
4. 04_THANH_TOAN_QUYET_TOAN
5. 05_TONG_HOP_DOI_CHIEU

Nguyen tac: dang mo nhom ho so nao thi file dinh kem upload vao dung nhom do.
Duong luu file chuan: `DU_AN_WEB_QUAN_LY / Ten du an / Folder ho so / File`

---

## Cau truc folder quan ly

- `00_CHU_DAU_TU/` — yeu cau va quyet dinh
- `01_BAN_QLDA/` — dieu phoi, duyet SPEC, giao viec, nghiem thu
- `02_TU_VAN_THIET_KE/` — nghien cuu va viet SPEC
- `03_NHA_THAU_THI_CONG/` — code, staging, ban giao
- `04_GIAM_SAT_NGHIEM_THU/` — kiem tra xac nhan
- `05_TRIEN_KHAI/` — phat hanh va van hanh
- `99_THU_VIEN/` — luu tru tai lieu tham khao

---

## File goc quan ly tung loai thong tin

| Loai thong tin | File goc |
|----------------|---------|
| Trang thai hien tai | `01_BAN_QLDA/03_TRANG_THAI_HIEN_TAI.md` |
| Kien truc tong hop | `01_BAN_QLDA/07_THIET_KE_TONG_HOP.md` |
| Quy trinh ban giao | `01_QUY_TRINH_BAN_GIAO.md` |
| Quy trinh duyet SPEC | `01_BAN_QLDA/02_QUY_TRINH_DUYET_SPEC.md` |
| So giao viec | `01_BAN_QLDA/04_SO_GIAO_VIEC.md` |
| So nghiem thu | `01_BAN_QLDA/05_SO_NGHIEM_THU.md` |
| SPEC da duyet cho thi cong | `01_BAN_QLDA/SPEC_MOI_DUYET/` |
| Ban giao code | `03_NHA_THAU_THI_CONG/04_BAN_GIAO_CODE.md` |
| Nhat ky sua code | Cac file CODE_DIFF trong STAGING |

---

## Lich su version

| Version | Features | Ngay | Trang thai |
|---------|----------|------|------------|
| v18 | Template, CF, Symbols, Bulk Edit, Column Visibility | 06/07 | ✅ Lich su |
| v19 | Column Types, Forms, Publish, Automation, Row Height, Clear Data, Copy/Paste, Keyboard, Auto-Save, Contact | 06/07 | ✅ Lich su |
| v20 | Drive backend, Apps Script, Layout fix | 07/07 | ✅ Lich su |
| v21 | Icon UTF-8 fix, Excel 365 toolbar, File attachment | 08/07 | ✅ Lich su |
| v22 | Drive REST API + Google Sign-In | 08/07 | ✅ Lich su |
| **v23** | **Apps Script Web App — 1 URL, khong OAuth** | **08/07** | **✅ HIEN HANH** |
| v24 | Attachment Panel UI v2 + Icon xin | — | 🔴 Dang lam |

---

## Quy tac cho AI khi lam viec

1. **Doc file nay truoc** — hieu trang thai du an.
2. Doc `00_README.md` hoac `00_DOC_TRUOC.md` trong folder lien quan.
3. Neu code thi doc SPEC da duyet truoc khi sua.
4. **Khong tu doi SPEC** — chi Ban QLDA duyet SPEC.
5. **Khong lay nham ban cu** — v24 lay tu `VERSIONS/v23_baseline.html`, khong lay v20/v21/v22.
6. **Giu UTF-8** — khong lam vo icon (☰ ← → ★ ▦ ▤).
7. Sau khi code phai cap nhat BAN_GIAO.md va CODE_DIFF.md.
8. **Apps Script Web App la huong chinh** — khong quay lai OAuth/Drive REST API tru khi co chi dao.

---

## Viec can dong bo tiep

- [ ] Viet `00_DOC_TRUOC.md` cho tung folder chua co
- [ ] Don cac file CODE_DIFF trung lap trong STAGING
- [ ] Dong bo trang thai v23 vao 03_NHA_THAU_THI_CONG/03_CURRENT_STATUS.md
- [ ] Nghiem thu v24 sau khi nha thau nop
