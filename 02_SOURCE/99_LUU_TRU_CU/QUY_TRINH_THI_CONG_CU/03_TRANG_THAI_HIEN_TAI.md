# CURRENT STATUS - NHA THAU THI CONG

Ngay cap nhat: 08/07/2026

---

## Ban code hien hanh

- Ban moi nhat da nghiem thu: **v23**
- File baseline: `VERSIONS/v23_baseline.html` (278KB)
- File dau vao bat buoc cho v24: `VERSIONS/v23_baseline.html`
- Ban dau ra tiep theo: `STAGING/giao-dien-desktop-don-gian_v24_quan.html`

---

## Huong ky thuat hien hanh

- v23 dung **Apps Script Web App + google.script.run**
- 1 URL cho ca nhom, khong can OAuth Client ID
- Apps Script URL: `https://script.google.com/macros/s/AKfycbz0gNqKkLzp4xuVdW7BoaKuiIVltf9_AOrHml7vsLVxz7zxwT0r5hT1-ebMzUrpnnfW/exec`
- Khong quay lai Drive REST API / OAuth neu khong co chi dao moi

---

## Viec dang duoc giao — v24

SPEC: `SPEC_MOI_DUYET/attachment-panel-ui/spec.md`

3 viec chinh:
1. Right toolbar doc ben phai (4 icon: 📎 💬 📋 ℹ️)
2. Attachment panel co dinh ben phai, de len layout, slide in/out
3. Upload nhieu file 1 luc, khong gioi han dung luong

---

## Ban giao bat buoc

- File HTML staging moi (v24)
- BAN_GIAO.md (5 muc)
- CODE_DIFF.md (4 muc)
- Checklist test local: upload 3+ file, xem/xoa, panel toggle
