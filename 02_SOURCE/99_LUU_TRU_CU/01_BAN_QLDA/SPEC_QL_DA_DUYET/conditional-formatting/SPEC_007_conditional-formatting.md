# SPEC: Conditional Formatting

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🟢 Đã duyệt — Ban QLDA ký duyệt 07/07/2026

---

## 1. MỤC TIÊU

Tính năng Conditional Formatting cho phép người dùng định nghĩa luật tô màu ô/dòng dựa trên giá trị. Khi giá trị thoả điều kiện, ô (hoặc cả dòng) tự động đổi màu nền, màu chữ, icon.

**Tại sao cần:** Trong QLDA xây dựng, cần nhìn nhanh — "hạng mục quá hạn = đỏ", "đã duyệt = xanh", "chờ duyệt = vàng".

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Rule Engine

**Điều kiện:**
| Loại | Ví dụ |
|------|-------|
| **Giá trị ô** | `equals`, `not equals`, `greater than`, `less than`, `between` |
| **Text** | `contains`, `starts with`, `ends with`, `is empty` |
| **Date** | `today`, `past 7 days`, `overdue` |
| **Formula** | Custom formula (JS expression) |
| **Multi-condition** | AND/OR kết hợp nhiều điều kiện |

**Định dạng:**
| Style | Tuỳ chọn |
|-------|----------|
| **Nền ô** | Màu solid (picker) |
| **Chữ** | Màu chữ, bold, italic |
| **Icon** | ⚠️ ✅ 🚫 ⭐ (predefined set) |
| **Áp dụng** | Chỉ ô đó, cả dòng, cả cột |

### 2.2 Cấu trúc rule
```json
{
  "ruleId": "cf-001",
  "name": "Quá hạn - đỏ",
  "active": true,
  "priority": 1,
  "scope": "ROW",
  "conditions": {
    "operator": "AND",
    "rules": [
      {"column": "Hạn chót", "type": "date", "operator": "before", "value": "TODAY"},
      {"column": "Trạng thái", "type": "text", "operator": "not_equals", "value": "Đã duyệt"}
    ]
  },
  "style": {
    "backgroundColor": "#FF0000",
    "textColor": "#FFFFFF",
    "bold": true,
    "icon": "🚫"
  }
}
```

---

## 3. API & BACKEND (Apps Script)

### 3.1 Storage
- Sheet `_CONDITIONAL_RULES` — danh sách rules
- Format chỉ hiển thị (front-end) — không lưu vào dữ liệu gốc

### 3.2 Hàm Apps Script
```javascript
function getConditionalRules(sheetId) {
  return JSON.parse(cache.get(`cf_rules_${sheetId}`));
}

function evaluateRules(rules, rowData) {
  // Duyệt rules theo priority
  // Check conditions
  // Trả về style map
}
```

---

## 4. GIAO DIỆN (Frontend)

- **Rule Builder:** Modal với dropdown chọn cột, điều kiện, giá trị, style picker
- **Rule List:** Table hiển thị rules + priority drag-drop + toggle
- **Live Preview:** Ô trong sheet tự động đổi màu khi rule được áp dụng
- **Saved Filter:** Lưu bộ lọc (filter view) — kết hợp với conditional formatting

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|-----------|---------|
| 1 | Tạo rule: Trạng thái = "Quá hạn" → nền đỏ | Ô chuyển đỏ |
| 2 | Tạo rule date: Hạn chót < Hôm nay → đỏ | Ngày quá hạn tự đỏ |
| 3 | Multi-condition AND | Chỉ đỏ khi cả 2 đều đúng |
| 4 | Priority: rule 1 + rule 2 cùng match | Rule priority cao hơn thắng |
| 5 | Tắt rule → màu trở lại bình thường | Format gốc được khôi phục |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `conditional-formatting/spec.md`
- ✅ Sẵn sàng cho v19 code
