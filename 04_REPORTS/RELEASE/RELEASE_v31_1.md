# RELEASE V31.1

Ngay phat hanh: 17/07/2026

## Sua loi

- Sua man hinh bi toi sau khi import Excel do modal bi dat ngoai overlay.
- Modal import duoc gan vao overlay va can giua dung tren viewport.
- Bo sung fallback fixed khi modal duoc tao khong co overlay.
- Lam ben vung test Workspace Navigator voi CRLF va dung hanh vi menu Create o khoang trang.

## Kiem thu

- Node regression: 59/59 PASS.
- Bundle JavaScript parse: PASS.
- Tat ca artifact phat hanh dong nhat tung byte: PASS.
- Browser 1366 x 768: modal nam tron viewport, parent la `.import-overlay`.
- Console error: 0.

## Artifact

- Baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline.html`
- Ban giao: `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v31_quan.html`
- File chay: `02_SOURCE/02_SAN_PHAM_DON_FILE/RUN_V31.bat`
- SHA-256: `EA1C8320BA97E50B65D39F303657C63EFC46B246230A60DA251EDB5F3B1D5993`
- Rollback: tag `v31`.

