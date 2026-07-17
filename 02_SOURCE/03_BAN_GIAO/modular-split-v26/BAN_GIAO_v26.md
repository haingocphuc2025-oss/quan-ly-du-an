# BAN GIAO v26 — modular-split-v26

## Thong tin

| Muc | Noi dung |
|---|---|
| Ngay ban giao | 2026-07-15 |
| Spec | 01_SPEC/NEW/modular-split-v26/SPEC.md |
| Baseline | v26 (de xuat — CHUA nang baseline, cho nghiem thu) |
| Output | 02_SOURCE/02_SAN_PHAM_DON_FILE/MODULES_V26/ (index.html, css/main.css, js/*.js x10, build.py, manifest.json, giao-dien-desktop-don-gian_v26_quan.html) |
| Nguoi thuc hien | Claude (Cowork), theo yeu cau Quan |

## Pham vi da lam

- Tach file don `STAGING/giao-dien-desktop-don-gian_v25_quan.html` (11713 dong, 442 ham, SHA-256 da xac minh khop `VERSIONS/v25_baseline.html` — xem `04_REPORTS/CODE_MAP_V25.md`) thanh bo module theo dung cau truc SPEC muc 3: `css/main.css` + 10 file `js/*.js` (state, storage, api, toolbar, grid, report, dashboard, repost, workspace-navigator, main).
- Dung acorn (JS parser that, chay qua Node.js) de lay CHINH XAC ranh gioi tung statement top-level trong khoi `<script>` — khong dung cat tay hay doan bang regex (2 lan thu dau bang bo do tu viet tay bi loi, da bo va chuyen sang acorn).
- Phan loai tung statement (ham/bien) vao dung module theo bang ten ham/bien da lap trong `CODE_MAP_V25.md`.
- Tu dong doi chieu: gom lai TOAN BO statement da phan phoi vao cac file module, so voi tap statement goc (lay tu chinh AST) — dam bao khong mat, khong nhan doi, khong sua noi dung truoc khi ghi file.
- `build.py` ghep 10 file js + css + index.html thanh 1 file HTML don `giao-dien-desktop-don-gian_v26_quan.html`, dung thu tu nap file dung SPEC muc 4 (state→storage→api→toolbar→grid→report→dashboard→repost→workspace-navigator→main).

## File va ham thay doi

| File/ham | Thay doi | Ly do |
|---|---|---|
| `MODULES_V26/css/main.css` | Moi (cat nguyen tu khoi `<style>` cua v25) | Tach CSS rieng theo SPEC |
| `MODULES_V26/js/state.js` | Moi — 11 statement | Bien state toan cuc + du lieu mau |
| `MODULES_V26/js/storage.js` | Moi — 37 statement | localStorage + backup local/disk |
| `MODULES_V26/js/api.js` | Moi — 82 statement | Apps Script / Google Drive API / OAuth |
| `MODULES_V26/js/toolbar.js` | Moi — 46 statement | Toolbar, undo/redo, format painter |
| `MODULES_V26/js/grid.js` | Moi — 349 statement | Grid/Sheet view (nhom lon nhat, ~163 ham) |
| `MODULES_V26/js/report.js` | Moi — 89 statement | Report view |
| `MODULES_V26/js/dashboard.js` | Moi — 64 statement | Dashboard view |
| `MODULES_V26/js/repost.js` | Moi — 16 statement | Repost / carry-forward |
| `MODULES_V26/js/workspace-navigator.js` | Moi — 179 statement | Workspace navigator, rail, nav history |
| `MODULES_V26/js/main.js` | Moi — 27 statement | Init, utility chung, wiring khoi dong |
| `MODULES_V26/index.html` | Moi | Khung HTML nap css/js theo module |
| `MODULES_V26/build.py` + `manifest.json` | Moi | Ghep bo module thanh 1 file HTML don |
| Code logic ben trong tung ham | KHONG doi | Chi cat-dan nguyen khoi, khong refactor/doi ten/doi logic (dung luat SPEC muc 5) |

## Ket qua kiem tra

| Test case | Ket qua | Bang chung/ghi chu |
|---|---|---|
| Doi chieu tong statement (AST that, acorn) | PASS | 900/900 statement khop 100% ban goc (khong mat/nhan doi/sua) — log "TU KIEM TRA: KHOP" |
| Phan loai ham theo CODE_MAP_V25 | PASS | 431 ham top-level phan loai theo ten, khong con canh bao "chua xac dinh" sau khi vá 7 truong hop |
| Cu phap JS sau khi ghep (build.py) | PASS | `node -e acorn.parse(...)` tren toan bo js noi cua ban ghep — khong loi, 352288 ky tu |
| So khoi `<script>` trong ban ghep | PASS | Dung 1 khoi (dung yeu cau "1 file HTML don" cua SPEC) |
| Tai trang qua localhost (`RUN_V26_LOCALHOST.bat`) | PASS | Trang tai day du, dung du lieu mau, dung cau truc thu muc workspace |
| Console trinh duyet khi tai trang | PASS | 0 loi/canh bao (kiem tra qua Claude-in-Chrome, doc console sau khi reload) |
| View Grid (phuc tap nhat, ~163 ham) | PASS | Nguoi dung tu click mo — toolbar, formula bar, du lieu hien thi dung |
| View Dashboard, Report, Repost | CHUA KIEM TRA RIENG | Nguoi dung chua xac nhan tung view nay bang tay — de nghi kiem tra truoc khi nghiem thu chinh thuc |

## Hoi quy

- [x] Build/kiem tra cu phap dat.
- [x] Console trinh duyet khong co loi.
- [x] Tinh nang cu lien quan van hoat dong (da xac nhan: workspace navigator, Grid; CHUA xac nhan rieng: Dashboard/Report/Repost).
- [x] Khong sua ngoai pham vi spec (dam bao boi kiem tra multiset noi dung tu dong — khong ham/bien nao bi them/bot/sua).

## Ton tai va van hanh

- Loi con lai: Khong phat hien loi console. Dashboard/Report/Repost chua duoc nguoi dung tu kiem tra truc tiep bang tay (chi Workspace navigator va Grid da duoc xac nhan).
- Can deploy backend: Khong — chi tach file frontend, khong doi endpoint Apps Script/Drive API.
- Buoc deploy/migration: Chua nang baseline v26. Theo AGENT RULES muc 10, chi DONE sau khi nguoi nghiem thu xac nhan dat, luc do moi nang baseline (luu ca bo module va ban ghep + SHA-256 vao `VERSIONS/`), cap nhat `CODE_CHINH.md`, `README_FIRST.md`, `DANH_MUC_SPEC.md`.

## Ket luan

- Nha thau de nghi: CHO NGHIEM THU (de nghi kiem tra nhanh Dashboard/Report/Repost truoc khi xac nhan DAT).
- Nguoi nghiem thu: CHUA KIEM TRA.
