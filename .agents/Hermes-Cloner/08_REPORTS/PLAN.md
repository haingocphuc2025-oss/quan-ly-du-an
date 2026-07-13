# Implementation Plan — Dashboard Configuration

## Architecture

Dashboard là view mới trong app, tương tự Report view:

```
Workspace Item (type:'dashboard')
  → openSheet() dispatch 'dashboard'
    → openDashboard() 
      → dashboardView container (display:flex)
        → DashboardToolbar (Làm mới, Thêm widget, Chỉnh sửa)
        → DashboardGrid (12-cột CSS grid)
          → Widget cards: TITLE, METRIC, SHORTCUT, REPORT, CHART
```

## Components

| Component | File | Dòng dự kiến | Phụ thuộc |
|---|---|---|---|
| Dashboard view container | BANDIAO | Sau </style> | — |
| CSS dashboard theme | BANDIAO | Trong <style> | — |
| openDashboard() JS | BANDIAO | JS block | openSheet() dispatch |
| DashboardGrid | BANDIAO | JS + CSS | — |
| Widget renderers | BANDIAO | JS | sheet/report data |
| DashboardToolbar | BANDIAO | HTML + JS | — |
| CHART SVG engine | BANDIAO | JS | D2 |
| ChartConfigPanel | BANDIAO | JS + CSS | D2 |

## Data Flow

```
create-dashboard → createWorkspaceItem(type:'dashboard') → workspace item
  ↓
openSheet() → type==='dashboard' → openDashboard()
  ↓
openDashboard() → loadDashboardConfig(projectIndex, folderIndex)
  ↓
dashboard JSON → parse widgets array → render từng widget
  ↓
Mỗi widget đọc source (sheet/report) qua google.script.run → render
  ↓
Làm mới → re-query từng widget source → re-render
```

## API

| Hàm | Đầu vào | Đầu ra |
|---|---|---|
| `openDashboard(projectIndex, folderIndex)` | index | Hiển thị dashboardView |
| `renderDashboard(dashboardConfig)` | JSON config | Render all widgets |
| `renderWidget(widgetConfig)` | 1 widget config | HTML card |
| `aggregateMetric(sheet, col, agg)` | data, cột, hàm | Số KPI |
| `renderChart(widgetConfig)` | chart config | SVG |

## Testing Strategy

1. Div balance trước/sau mỗi task
2. Browser test: tạo dashboard, xem, làm mới
3. Console 0 errors

## Risks

| Risk | Mitigation |
|---|---|
| Làm hỏng div balance | Kiểm tra div balance sau mỗi lần edit |
| Ghi đè code cũ | Chỉ thêm code mới, không sửa code cũ (trừ dispatch) |
| CSS conflict | Đặt tất cả dưới .dashboard-view scope |

## Rollback

Sao lưu BANDIAO trước khi sửa. Mỗi task rollback bằng cách restore file.
