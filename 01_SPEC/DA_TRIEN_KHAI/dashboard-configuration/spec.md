# DASHBOARD_SPEC v3 — Bảng điều khiển dự án cho DU AN WEB QUAN LY

> **TRẠNG THÁI CHÍNH THỨC:** ĐÃ TRIỂN KHAI  
> Vị trí thư mục là nguồn trạng thái chính thức. Các dòng “chưa duyệt”, đường dẫn cũ và baseline cũ bên dưới chỉ là lịch sử tại thời điểm soạn spec. Baseline hiện hành: **v25**.

> Gói bàn giao cho Codex. Tham chiếu giao diện: `UI_MAU_DASHBOARD_SMARTSHEET_v1.html`.
> Nguồn khảo sát: dashboard "0. DAI AN CCCT2 Project" + panel Chart Widget (khảo sát DOM edit-mode 12/07/2026).
> Stack: HTML + Vanilla JS (chart bằng SVG thuần, KHÔNG chart.js/thư viện ngoài) + Apps Script + JSON.
> Màn hình MỚI. Làm SAU Grid + Report vì widget đọc dữ liệu từ chúng.
>
> **v3 THAY ĐỔI:** bổ sung TOÀN BỘ panel cấu hình Chart Widget (§3C) + mô hình dữ liệu "cột→series / hàng→category" của Smartsheet. Thay thế v1, v2.

---

## 1. Dashboard là gì
Bảng điều khiển gồm nhiều **widget** xếp trên **lưới 12 cột**. Mỗi widget đọc dữ liệu từ 1 nguồn (sheet/report) hoặc nội dung tĩnh. Dashboard KHÔNG chứa dữ liệu — chỉ lưu bố cục + cấu hình widget vào JSON; khi mở thì kéo dữ liệu từ nguồn.

## 2. Mô hình JSON dashboard
```json
{
  "id": "dash001",
  "name": "0. Bảng điều khiển dự án — DAI AN CCCT2",
  "grid": { "cols": 12, "gap": 14 },
  "widgets": [
    { "id":"w1", "type":"TITLE",   "span":12, "config":{ "title":"...", "sub":"...", "style":"banner" } },
    { "id":"w2", "type":"METRIC",  "span":3,  "source":"sheetX", "config":{ "label":"...", "agg":"count", "col":"...", "unit":"ngày", "tone":"info" } },
    { "id":"w3", "type":"CHART",   "span":6,  "source":"sheetX", "config":{ /* xem §3C */ } },
    { "id":"w4", "type":"REPORT",  "span":8,  "source":"reportZ", "config":{ "columns":[...], "limit":10 } },
    { "id":"w5", "type":"SHORTCUT","span":4,  "config":{ "links":[ {"icon":"📄","label":"...","target":"sheetId"} ] } }
  ]
}
```

## 3. Sáu loại widget (khảo sát DOM: metric×42, title×nhiều, chart×10, report×5, shortcut×4)
| Loại | Chức năng | Ưu tiên |
|---|---|---|
| TITLE | Tiêu đề / banner (tĩnh) | P1 |
| METRIC | 1 số KPI; agg count/sum/avg/min/max trên 1 cột nguồn | P1 |
| REPORT | Bảng nhúng từ report/sheet, giới hạn N hàng, pill trạng thái | P1 |
| SHORTCUT | Danh sách lối tắt mở sheet/report/URL | P1 |
| CHART | Biểu đồ động, cấu hình đầy đủ theo §3C | P2 |

## 3B. Cách CHART lấy dữ liệu (mô hình Smartsheet — đơn giản hơn groupBy)
Smartsheet KHÔNG tự groupBy. Nó đọc thẳng một vùng cột đã có sẵn số trong sheet nguồn:
- **Mỗi cột dữ liệu = 1 series** (đường/nhóm cột).
- **Mỗi hàng = 1 category** (điểm trên trục X).
- Toggle **Switch rows & columns** đảo vai trò cột↔hàng.

Ví dụ: sheet "03.06.02 Burndown" có sẵn cột `Còn lại kế hoạch`, `Còn lại thực tế`, mỗi hàng là 1 tuần → chart line 2 series, X = tuần. Widget CHỈ đọc + vẽ, không tính lại.
(Vẫn hỗ trợ kiểu groupBy+đếm cho sheet thô như "RFI theo trạng thái" — coi là tiền xử lý tùy chọn trước khi vẽ.)

**3 bước engine:** (1) đọc `source` qua google.script.run → hàng thô; (2) map cột→series, hàng→category (áp toggle/columnsIncluded); (3) vẽ SVG tự co giãn theo max, toạ độ tính từ dữ liệu (KHÔNG hardcode).

## 3C. PANEL CẤU HÌNH CHART WIDGET — đầy đủ (khảo sát trực tiếp)
Panel bên phải khi chỉnh sửa chart. Đủ các nhóm:

| Nhóm | Tùy chọn | JSON key |
|---|---|---|
| **Data Source** | Nguồn + nút Đổi (Edit) | `source` |
| **Columns Included** | "Tất cả cột" hoặc chọn tập cột | `columns:["all"]` hoặc `["a","b"]` |
| Toggle 1 | Dùng tên cột làm nhãn category | `useColNamesAsCategory:bool` |
| Toggle 2 | Dùng cột đầu làm nhãn series | `firstColAsSeries:bool` |
| Toggle 3 | **Đảo hàng ↔ cột** | `switchRowsCols:bool` |
| **Chart Type** | Column, Bar, Line, Donut (Phase 2 đủ 4) | `chart:"column\|bar\|line\|donut"` |
| **Horizontal Axis** | tiêu đề trục; kiểu chữ tiêu đề; kiểu chữ nhãn; hiện vạch chia (tick); hiện mọi nhãn; **Scale theo giá trị dữ liệu** | `hAxis:{title,showTicks,showAllLabels,scaleToData}` |
| **Vertical Axis** | tương tự trục ngang (tiêu đề, styling, thang giá trị) | `vAxis:{title,showTicks,scaleToData}` |
| **Series** | đặt tên + màu từng chuỗi | `series:[{col,label,color}]` |
| **Legend** | bật/tắt + vị trí | `legend:{show:bool,pos:"top\|right\|bottom"}` |
| **Title** | tiêu đề biểu đồ + styling | `title:{text,show}` |
| **Widget Behavior** | "Khi bấm vào widget" → Không làm gì / mở sheet/report/URL nguồn | `onClick:"none\|openSource\|url"` |

JSON chart đầy đủ:
```json
{
  "chart":"line",
  "columns":["all"],
  "useColNamesAsCategory":false,
  "firstColAsSeries":true,
  "switchRowsCols":false,
  "series":[
    {"col":"conlai_kehoach","label":"Còn lại kế hoạch","color":"#5a43d7"},
    {"col":"conlai_thucte","label":"Còn lại thực tế","color":"#2e9e4b"}
  ],
  "hAxis":{"title":"Tuần","showTicks":true,"showAllLabels":true},
  "vAxis":{"title":"Số cọc","scaleToData":true},
  "legend":{"show":true,"pos":"bottom"},
  "title":{"text":"Burndown thi công cừ","show":true},
  "onClick":"openSource"
}
```

## 4. Lưới & bố cục
12 cột, gap 14px, max-width ~1200px căn giữa. Chế độ Xem chỉ hiển thị; chế độ Chỉnh sửa (✏️) kéo-thả + panel cấu hình widget — Phase D3. Card nền trắng bo 10px viền `--card-line`.

## 5. Toolbar dashboard (khảo sát DOM)
| Nút | Chức năng | Ưu tiên |
|---|---|---|
| Làm mới | Nạp lại dữ liệu + chạy lại mọi widget | P1 |
| Lọc | Lọc toàn dashboard | P3 |
| Tô thay đổi | Highlight dữ liệu vừa đổi | P3 |
| Thêm widget | Picker chọn loại widget | P2 |
| Chỉnh sửa | Bật/tắt chế độ sửa + panel cấu hình | P2 |

## 6. Token giao diện (từ file mẫu)
| Thành phần | Giá trị |
|---|---|
| Nền dashboard | `--page-bg` #F0F1F5 |
| Banner | gradient `#4735B3 → #5A43D7` |
| METRIC tone | info=tím / ok=#2E9E4B / warn=#E0A80A / red=#D64545 |
| Chart palette | #5A43D7, #2E9E4B, #E0A80A, #D64545, #2B8FB3 |
| Card | nền trắng, viền #E8E8EE, bo 10px |

## 7. Thứ tự triển khai
| Bước | Nội dung |
|---|---|
| D1 | Lưới 12 cột + TITLE, METRIC (động), SHORTCUT, REPORT + Làm mới |
| D2 | CHART engine §3B (column/bar/line/donut) + panel cấu hình §3C (Data Source, Columns, 3 toggle, Chart Type, trục, Series, Legend, Title, Behavior) + Thêm widget picker |
| D3 | Chế độ Chỉnh sửa: kéo-thả, đổi span, lưu bố cục JSON + Lọc/Tô thay đổi |

## 8. Checklist nghiệm thu (Codex tự điền XONG / CHƯA + lý do)
| # | Hạng mục | Tiêu chí đạt |
|---|---|---|
| 1 | Lưới 12 cột | Widget xếp theo span, tự xuống hàng |
| 2 | TITLE / banner | Render tĩnh đúng token |
| 3 | METRIC động | agg trên cột nguồn ra số thật, đổi theo dữ liệu |
| 4 | SHORTCUT | Link mở đúng sheet/report/URL |
| 5 | REPORT nhúng | Bảng đọc từ nguồn, giới hạn N hàng, pill |
| 6 | Chart — lấy dữ liệu | Đọc source qua google.script.run |
| 7 | Chart — cột→series / hàng→category | Map đúng; toggle Switch rows&cols hoạt động |
| 8 | Columns Included | Chọn all / tập cột, chart đổi theo |
| 9 | 3 toggle nhãn | useColNames / firstColAsSeries / switchRowsCols đúng |
| 10 | Chart Type | Column, Bar, Line, Donut vẽ đúng bằng SVG |
| 11 | Horizontal Axis | tiêu đề, tick, hiện nhãn, scale theo dữ liệu |
| 12 | Vertical Axis | tiêu đề, thang giá trị, scale |
| 13 | Series | tên + màu từng chuỗi áp đúng |
| 14 | Legend | bật/tắt + vị trí |
| 15 | Title | tiêu đề chart + bật/tắt |
| 16 | Widget Behavior | onClick: none / mở nguồn / URL |
| 17 | Làm mới | Bấm → mọi widget chạy lại, số cập nhật |
| 18 | Không hardcode | Không còn số/toạ độ cố định trong code chart |

## 9. Lưu ý phạm vi
Chart chỉ ĐẾM/PHÂN LOẠI/vẽ chuỗi số có sẵn trong sheet nguồn (RFI theo trạng thái, FTC vs CTC, burndown kế hoạch/thực tế). Số do sheet nguồn cung cấp, widget KHÔNG tự tính % tiến độ, KHÔNG Gantt. Ranh giới cứng của dự án.

## 10. Giao nộp
`CODE_DIFF.md` (chỉ phần đổi) + bảng checklist §8 đã điền. Vướng → mục "CÂU HỎI" cuối file.
