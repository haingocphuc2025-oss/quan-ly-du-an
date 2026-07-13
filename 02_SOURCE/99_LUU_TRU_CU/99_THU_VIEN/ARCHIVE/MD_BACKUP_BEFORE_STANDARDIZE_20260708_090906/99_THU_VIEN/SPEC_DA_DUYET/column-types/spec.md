# SPEC: Column Types

**Ngày:** 07/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

Mở rộng khả năng Column Types của Smartsheet: số, tiền tệ, ngày tháng, kiểm tra, địa chỉ, danh bạ, liên kết, biểu đồ, và tích hợp công thức – phục vụ cho đa dạng dữ liệu trong Web QLDA.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Khả năng Smartsheet
cung cấp sẵn:
- **Column types:** Text, Number, Currency, Date, Checkbox, Phone, Url, Email, Contact, Formula, Status, Roll-up (tổng hợp), Count, Rating, Attachment
- **Validation:**Custom regex, range, required
- **Formatting:**Conditional formatting theo giá trị column
- **Formula:**Hỗ trợ công thức sheet-level basic (SUM, AVERAGE, IF, VLOOKUP)
- **Automation:**Cell change triggers cho workflow
- **API:**RESTful Column API, support GET/PUT/DELETE

### 2.2 Khả năng Apps Script (DO nhà thầu code)
- **Column type definition:**Thêm column type mới qua `Sheet.addColumn(type, label)`
- **Custom formatter:**Tự định nghĩa cách hiển thị column
- **Validation logic:**Apps Script validation rules (regex, service call)
- **Formula engine:**Hỗ trợ một số hàm formula (`IF`, `SUM`, `VLOOKUP`)
- **Type conversion:**Chuyển đổi data type qua `Column.setFormattedValue()`
- **Type reference:**Column type có thể cấu hình cho sheet
data

### 2.3 Design Decisions
- **Standard types:**Duy trì các column type tiêu chuẩn
- **Custom types:**Cho phép tùy chỉnh cho project-specific
- **Type inheritance:**Column type có thể kế thừa từ sheet hoặc global
definition
- **Validation:**Client-side validation cho UX nhanh
- **Consistency:**Đảm bảo type consistency trong sheet
- **Performance:**Optimized cho large datasets

---

## 3. SPEC CHI TIẾT

### 3.1 Column Types Config mở rộng
**Từ SHEET_CONFIG thêm:**
```json
"columnTypes": {
  "enabled": true,
  "customTypes": [
    {
      "id": "contact-list",
      "name": "Danh sách liên hệ",
      "description": "Lưu đối tượng name + email",
      "category": "people",
      "uiWidget": "picker",
      "validation": {"regex": "^[^@]+@[^@]+$", "required": true}
    },
    {
      "id": "phone-number",
      "name": "Phone",
      "description": "Số điện thoại định dạng international",
      "category": "people",
      "uiWidget": "input",
      "validation": {"regex": "^\\+\\d{1,3}\\s\\d{4,}$"}
    },
    {
      "id": "budget",
      "name": "Ngân sách",
      "description": "Currency with decimal",
      "category": "financial",
      "uiWidget": "number",
      "validation": {"min": 0, "max": 999999999}
    },
    {
      "id": "project-status",
      "name": "Trạng thái dự án",
      "description": "Dropdown trạng thái task",
      "category": "workflow",
      "uiWidget": "dropdown",
      "options": ["Backlog", "In Progress", "Done", "On Hold"],
      "default": "Backlog"
    }
  ],
  "globalDefaults": {
    "textColumn": {"trim": true, "caseSensitive": false},
    "numberColumn": {"decimalPlaces": 2}
  }
}
```

### 3.2 Data Model
- **Standard type:**`{"type": "text", "value": "test"}`
- **Custom type:**`{"type": "contact-list", "value": {"name": "A", "email": "a@x.com"}}`
- **Validation error:**`{"error": "Invalid format", "message": "..."}`
- **Type metadata:**`{"metadata": {"source": "form", "validatedAt": "2026-07-07T10:00:00Z"}}`

### 3.3 UI Components
1. **Column type selector:**Dropdown thêm column type mới
2. **Custom type builder:**Form tạo custom type
3. **Validation UI:**Error hiển thị inline
4. **Type list:**Xem các column types đã cấu hình
5. **Export/import:**Xuất/import column types configuration

### 3.4 Automation
- **Column creation:**Trigger khi thêm column mới
- **Column type change:**Cập nhật khi thay đổi type
- **Validation execution:**Check validation theo type rules
- **Formula evaluation:**Đánh giá formula khi cell thay đổi

### 3.5 Test Cases (bắt buộc)
1. **Standard column type:**Tạo column kiểu text, number
2. **Custom column type:**Tạo column kiểu contact-list
3. **Validation:**Test validation quy tắc cho từng type
4. **Formula:**Test formula cho column type
5. **Type inheritance:**Kế thừa type từ sheet/global

---

## 4. BÀN GIAO CHO NHÀ THẦU

### 4.1 Phụ thuộc
- **OAuth apps script:**Để truy cập sheet
- **Column management API:**Support add/edit column
- **Validation engine:**Client + server validation
- **Formula engine:**Hỗ trợ một số hàm
- **UI framework:**Lightweight, responsive

### 4.2 Test Kit
- Test standard column type creation
- Test custom column type creation
- Test validation cho từng type
- Test formula evaluation
- Test type inheritance

### 4.3 Cam kết
- ✅ SPEC chi tiết đầy đủ
- ✅ Tuân thủ Smartsheet/Apps Script
- ✅ Khả thi code

**SPEC column types sẵn sàng cho nhà thầu theo SOP mới.**
