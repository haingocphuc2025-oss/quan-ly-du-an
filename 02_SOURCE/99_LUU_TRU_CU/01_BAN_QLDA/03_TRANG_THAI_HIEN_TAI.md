# 03_TRANG_THAI_HIEN_TAI — BAN QLDA

Ngay cap nhat: 08/07/2026

---

## Ket luan dieu hanh

- Phien ban hien hanh: **v23** (da nghiem thu 08/07/2026)
- File baseline chinh: `03_NHA_THAU_THI_CONG/VERSIONS/v23_baseline.html`
- Phien ban dang phat trien: **v24**
- File dau ra v24: `03_NHA_THAU_THI_CONG/STAGING/giao-dien-desktop-don-gian_v24_quan.html`

---

## Huong ky thuat da chot

- Frontend: HTML + CSS + Vanilla JS — 1 file duy nhat
- Backend: **Apps Script Web App + google.script.run** (huong chinh)
- Fallback: Drive API direct upload (cho file lon, huong nang cao)
- Apps Script URL hien tai: `https://script.google.com/macros/s/AKfycbz0gNqKkLzp4xuVdW7BoaKuiIVltf9_AOrHml7vsLVxz7zxwT0r5hT1-ebMzUrpnnfW/exec`
- Khong dung OAuth Client ID / Cloud Console tru khi co chi dao moi

---

## Viec dang giao cho Nha thau — v24

SPEC: `SPEC_MOI_DUYET/attachment-panel-ui/spec.md`

1. Right toolbar doc ben phai (4 icon: Sheet, Folder, Report dung SVG chat luong cao)
2. Attachment panel co dinh ben phai, de len layout, slide in/out
3. Upload nhieu file 1 luc, khong gioi han dung luong
4. Icon Sheet (xanh la #107C41), Folder (vang #FFB900), Report (cam #D83B01) — SVG inline

---

## Lich su version tom tat

| Version | Features | Trang thai |
|---------|----------|------------|
| v18-v19 | Template, Forms, Column Types, Contact, Publish... | Lich su |
| v20 | Drive backend, Layout fix | Lich su |
| v21 | Icon UTF-8, Excel toolbar, File attachment | Lich su |
| v22 | Drive REST API + Sign-In | Lich su |
| **v23** | **Apps Script Web App — 1 URL, khong OAuth** | **HIEN HANH** |
| v24 | Attachment Panel UI v2 + Icon xin | Dang phat trien |
