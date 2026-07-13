# CONG VIEC — NHA THAU THI CONG

**KHONG nghien cuu. KHONG doi SPEC. Chi code dung viec duoc giao.**

---

## VIEC HIEN TAI — v24

> Base: `VERSIONS/v23_baseline.html`
> Output: `STAGING/giao-dien-desktop-don-gian_v24_quan.html`

| # | Tinh nang | SPEC |
|---|-----------|------|
| 1 | **Attachment Panel UI v2** | `SPEC_MOI_DUYET/attachment-panel-ui/spec.md` |
| 2 | **Icon Sheet/Folder/Report (SVG)** | `SPEC_MOI_DUYET/attachment-panel-ui/spec_icon.md` |
| 3 | **Icon sidebar dong bo + Report row compact** | `SPEC_MOI_DUYET/attachment-panel-ui/spec_icon_row.md` |
| 4 | **Workspace Context Menu + Tao Sheet moi** | `SPEC_MOI_DUYET/workspace-context-menu/spec.md` |

### Chi tiet v24:

**#1 Attachment Panel:**
- Right toolbar doc ben phai (4 icon)
- Panel co dinh ben phai, de len layout
- Upload nhieu file 1 luc, khong gioi han

**#2 Icon SVG:**
- Sheet: xanh la #107C41 (Excel)
- Folder: vang #FFB900 (Windows)
- Report: cam #D83B01 (Power BI)
- Ham `getItemIconSVG(type, size)` dung chung

**#3 Icon sidebar + Row height:**
- Ap dung SVG icon vao sidebar theo loai item
- Report row: height 32px (giong Sheet)

**#4 Context menu + Tao moi:**
- Click ten Sheet → mo sheet
- Nut "+ Tao" → dropdown: Sheet / Thu muc / Bao cao
- Chuot phai / click "..." → context menu: Mo, Doi ten, Nhan ban, Xoa, Xuat Excel
- Apps Script: them createSheet, renameItem, duplicateSheet, deleteItem, exportSheetToExcel
- **Deploy lai Apps Script neu Code.gs thay doi**

---

## DA HOAN THANH

| Version | Features | Trang thai |
|---------|----------|------------|
| v18-v21 | Template, Forms, Column Types, Icon, Excel toolbar, Attachment | ✅ |
| v22 | Drive REST API | ✅ |
| v23 | Apps Script Web App — 1 URL | ✅ DAT 08/07/2026 |

---

## QUY TRINH

1. Lay `VERSIONS/v23_baseline.html`
2. Doc ca 4 SPEC trong `SPEC_MOI_DUYET/`
3. Code — giu UTF-8, khong lam vo icon
4. Cap nhat Code.gs → Deploy lai neu can
5. Test: upload file, context menu, tao sheet moi
6. Nop HTML + BAN_GIAO.md (5 muc) + CODE_DIFF.md (4 muc)
