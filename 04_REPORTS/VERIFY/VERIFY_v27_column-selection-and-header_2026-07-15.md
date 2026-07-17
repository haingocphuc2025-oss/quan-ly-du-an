# VERIFY v27 - Multi-column delete and clean column headers

Ngay: 15/07/2026
Pham vi: Grid/Sheet view trong `02_SAN_PHAM_DON_FILE`

## Da lam

- Bo tien to `A1` khoi badge cua cot text; cac icon kieu cot khac (dropdown, date, contact...) giu nguyen.
- `Shift` chon mot dai cot lien tiep.
- `Ctrl`/`Cmd` chon va bo chon nhieu cot roi nhau.
- Highlight chi phu dung cac cot dang chon, ke ca khi chon roi nhau.
- Chuot phai tren mot cot dang nam trong selection -> `Delete Column` xu ly toan bo selection.
- Hien mot hop xac nhan chung, liet ke so luong va ten tat ca cot se xoa.
- Xoa cot theo thu tu tu phai sang trai de khong sai index va van cap nhat tham chieu cot.
- Giữ lai it nhat mot cot du lieu.
- Selection va highlight sau cac thao tac render/format cua v26 duoc ke thua.

## Kiem tra

- Node test: **24/24 PASS**.
- Syntax tat ca module JavaScript: **PASS**.
- Syntax JavaScript inline trong `v27_baseline.html`: **PASS**.
- Cac artifact v27 da dong bo cung SHA-256:

`B39F9756EE2227A6D6560F7577E10143DAFE662210718F976196FD39CE8C77A9`

## Artifact

- `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v27_baseline.html`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V27/`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/STAGING/giao-dien-desktop-don-gian_v27_quan.html`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v27_quan.html`
- `02_SOURCE/02_SAN_PHAM_DON_FILE/apps-script/Index_v27.html`