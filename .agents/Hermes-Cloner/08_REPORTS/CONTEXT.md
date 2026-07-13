# CONTEXT — DU AN WEB QUAN LY

> Ngày: 13/07/2026
> Mục tiêu: Thêm tính năng **dashboard-configuration** vào codebase

## 1. Dự án

| Mục | Giá trị |
|---|---|
| Tên | DU AN WEB QUAN LY |
| Stack | HTML + Vanilla JS + Apps Script (Web App) |
| File chính | `BANDIAO/giao-dien-desktop-don-gian_v23_quan.html` (420KB, 10250 dòng) |
| Baseline | `VERSIONS/v23_baseline.html` (384KB) |
| Git | Không có |
| Mode | AUTO_LOOP — READY |

## 2. Tính năng đã có trong BANDIAO

- Attachment panel (right toolbar + sidebar row/sheet/all)
- Context menu (tạo mới, rename, delete, export...)
- Report view (lọc, nhóm, tổng hợp, sort)
- Sheet grid + column types
- Filter/sort
- Undo/redo
- Drive API + Apps Script backend

## 3. Tính năng CHƯA có (cần xây mới)

- **Dashboard** — hoàn toàn chưa triển khai
- SVG chart engine — chưa có
- Widget grid 12 cột — chưa có
- Config panel chart — chưa có

## 4. Target spec

**dashboard-configuration** (`01_SPEC/NEW/dashboard-configuration/spec.md`)

| Mục | Giá trị |
|---|---|
| Thứ tự | Sau Grid + Report |
| Stack | HTML + Vanilla JS + SVG thuần |
| Theme | `#5A43D7` chính, nền `#F0F1F5` |
| Triển khai | D1 → D2 → D3 |
| Attachment | Cần gắn vào BANDIAO file hiện tại |

## 5. Ràng buộc

1. KHÔNG dùng thư viện chart ngoài (chart.js, etc.) — SVG thuần
2. KHÔNG tự động tracking tiến độ / Gantt
3. Widget chỉ đọc + vẽ số đã tính sẵn trong sheet nguồn
4. Dashboard không chứa dữ liệu — lưu bố cục JSON
5. Tích hợp vào file BANDIAO hiện tại — không tạo file mới
6. Cần đúng CONTROLLER_STATE.json workflow
