# RELEASE V31.2

Ngay phat hanh: 17/07/2026

## Sua loi

- Import nhan dung Grid Sheet dang mo qua `activeSheetContext`.
- Ho tro merged cells bang cach ke thua gia tri o goc tren-trai.
- Cot attachment/status (index 0/1) nam ngoai mapping, validation va execute.
- Cot `So van ban` chap nhan ma text ke ca khi cau hinh cu danh dau number.
- Render va luu lai dung Sheet sau import.
- Launcher dung cache key `v31.2`.

## Kiem thu

- Node regression: 59/59 PASS.
- Browser merged workbook: 2 valid, 0 error, import report hien dung.
- Mapping destination: 2, 3, 4, 5, 6, 7; khong co 0/1.
- Console error: 0.
- Tat ca artifact dong nhat tung byte.

## Artifact

- Baseline: `02_SOURCE/02_SAN_PHAM_DON_FILE/VERSIONS/v31_baseline.html`
- Ban giao: `02_SOURCE/02_SAN_PHAM_DON_FILE/BANDIAO/giao-dien-desktop-don-gian_v31_quan.html`
- File chay: `02_SOURCE/02_SAN_PHAM_DON_FILE/RUN_V31.bat`
- SHA-256: `40641245F2AB8B2174F3F258BC97CBEC1A67509219DD72F59C53159CB5E3DE3C`
- Rollback: tag `v31.1`.

