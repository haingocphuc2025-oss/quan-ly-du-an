# SPEC: Conditional Formatting

**Ngày:** 07/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

Triển khai tính năng Conditional Formatting (CF) trong Smartsheet: rule-based styling tự động cho cells dựa trên giá trị, công thức, hoặc trigger – phục vụ cho dashboard, tracking tiến độ, và alerts trong Web QLDA.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Tính năng Smartsheet
cung cấp:
- **Conditional formatting rules:**Rules based trên: giá trị cụ thể, range, formula, hoặc custom script
- **Formatting styles:**Màu nền, màu chữ, bold, italic, borders, icon sets
- **Rule types:**Text, numerical, date, color scales, icon sets, data bars
- **Applicability:**Từng cell, entire row, entire column, hoặc entire sheet
- **Update:**Real-time khi data thay đổi
- **Shared rules:**Áp dụng cho nhiều sheets qua template

### 2.2 Khả năng Apps Script (DO nhà thầu code)
- **Custom conditional formatting:**Rules phức tạp với Apps Script `onEdit` trigger
- **Dynamic rules:**Tạo/xóa rules qua Apps Script
- **Advanced formatting:**Borders, shadows, gradients, custom styles
- **Rule management:**Create, edit, delete rules qua UI
- **Conditional logic:**Support formula trong rule condition
- **Notification:**Trigger notification khi rule match

### 2.3 Design Decisions
- **Low-code CF:**Dựa trên UI wizard cho common cases
- **High-code CF:**Apps Script cho rules phức tạp
- **Hybrid approach:**UI cho simple rules, code cho nâng cao
- **Responsive:**CF hoạt động trên desktop, tablet, mobile
- **Performance:**Optimized cho large sheets
- **Accessibility:**CF không ảnh hưởng readability

---

## 3. SPEC CHI TIẾT

### 3.1 Conditional Formatting Config mở rộng
**Từ SHEET_CONFIG thêm:**
```json
"conditionalFormatting": {
  "enabled": true,
  "ruleTypes": {
    "textContains": {
      "label": "Chứa văn bản",
      "support": ["exact", "contains", "startsWith", "endsWith"]
    },
    "numberRange": {
      "label": "Khoảng số",
      "support": ["equals", "notEquals", "greaterThan", "lessThan", "between"]
    },
    "dateRange": {
      "label": "Khoảng ngày",
      "support": ["equals", "before", "after", "between"]
    },
    "formula": {
      "label": "Công thức",
      "support": ["AND", "OR", "NOT", "IF", "VLOOKUP"]
    },
    "customScript": {
      "label": "Apps Script",
      "support": ["onEdit", "doGet", "trigger.schedule"]
    }
  },
  "styles": {
    "backgroundColor": true,
    "textColor": true,
    "bold": true,
    "italic": true,
    "border": true,
    "iconSet": true,
    "dataBar": true
  },
  "sharing": {
    "template": true,
    "global": true,
    "project": true
  }
}
```

### 3.2 Data Model
- **Rule definition:**`{"id": "rule_123", "name": "Highlight Overdue", "type": "dateRange", "condition": {"operator": "before", "value": "2026-07-07"}, "style": {"backgroundColor": "#FFCCCC"}}`
- **Rule application:**`{"sheetId": "s456", "range": "A1:D10", "rule": {...}}`
- **Rule evaluation:**`{"cell": "A1", "currentValue": "2026-06-01", "ruleMatch": true, "appliedStyle": "..."}`
- **Execution log:**`{"ruleId": "rule_123", "executionTime": "2026-07-07T10:00:00Z", "targetCells": ["A1", "B1"], "result": "applied"}`

### 3.3 UI Components
1. **Rule builder:**UI wizard cho rule types
2. **Rule list:**Hiển thị các rules đã cấu hình
3. **Style picker:**Chọn colors, fonts, icons
4. **Preview pane:**Xem preview rule effects
5. **Rule testing:**Test rule trên sample data

### 3.4 Conditional Logic
- **Automatic evaluation:**Đánh giá rule mỗi khi cell thay đổi
- **Manual refresh:**Cập nhật rule khi cần
- **Formula support:**Hỗ trợ formula trong rule condition
- **Script integration:**Apps Script trigger rule evaluation
- **Performance optimization:**Debounce evaluation

### 3.5 Test Cases (bắt buộc)
1. **Rule creation:**Tạo rule cho từng type (text, number, date, formula)
2. **Rule application:**Kiểm tra rule áp dụng cho cells
3. **Dynamic update:**Kiểm tra rule cập nhật khi cell thay đổi
4. **Multiple rules:**Kiểm tra nhiều rules cùng áp dụng
5. **Rule removal:**Xóa rule, kiểm tra cells trở về default

---

## 4. BÀN GIAO CHO NHÀ THẦU

### 4.1 Phụ thuộc
- **OAuth apps script:**Để truy cập sheet
- **Conditional formatting API:**Support add/delete rules
- **Formula engine:**Hỗ trợ formula trong rule condition
- **UI framework:**Lightweight, responsive
- **Storage:**Apps Script Properties cho rule config

### 4.2 Test Kit
- Test rule creation cho từng type
- Test rule application
- Test rule update
- Test multiple rules
- Test rule removal

### 4.3 Cam kết
- ✅ SPEC chi tiết đầy đủ
- ✅ Tuân thủ Smartsheet/Apps Script
- ✅ Khả thi code
- ✅ Ready cho nhà thầu

**SPEC conditional formatting sẵn sàng cho nhà thầu theo SOP mới.**
