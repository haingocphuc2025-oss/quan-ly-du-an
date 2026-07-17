# VERIFY - Excel 365 toolbar icons and button recovery V27

Ngay: 2026-07-16
Pham vi: Sheet toolbar va cac nut top bar trong MODULES_V27

## Ket qua

- PASS: 12/12 test hoi quy ve formatting helpers, SVG icon system, label dong, top actions, More menu, selection preservation, column selection va A1 badge.
- PASS: Chrome smoke 1366px: Bold, menu More tren toolbar, menu More tren top bar, Share, AI, Binh luan, Hoat dong, Thong tin.
- PASS: Chrome smoke khong co JavaScript error.
- PASS: Bundle V27 tai `MODULES_V27`, `STAGING` va `BANDIAO` tai tao dung tu manifest.
- PASS: JS syntax cho toan bo file trong `MODULES_V27/js`.

## Da thay doi

- Them bo SVG outline don sac theo phong cach Microsoft 365/Excel 365.
- Khoi phuc `setCellStyleEntry` va `toggleCellStyleFlag` de Bold/Italic/Underline/Strike hoat dong lai.
- Chặn listener trung cua nut More de menu khong mo roi dong ngay.
- Noi handler cho Grid, Share, AI, Comment, Activity, Info va top More.
- Giữ icon khi label dong thay doi.

## Ton dong ngoai pham vi

- Test `escapeHtml` toan cuc dang bao hai khai bao trong `main.js`, thuoc task project-save dang DOING.
- Hai test Playwright khong chay do goi `@playwright/test` trong workspace dang hong/zero-byte.

## Artifact

- `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v27_baseline.html`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v27_quan.html`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v27_quan.html`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/apps-script/Index_v27.html`