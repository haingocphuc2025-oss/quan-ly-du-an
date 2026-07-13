# SPEC: Forms

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🟢 Đã duyệt — Ban QLDA ký duyệt 07/07/2026

---

## 1. MỤC TIÊU

Tính năng Forms cho phép người dùng tạo form nhập liệu từ cấu trúc sheet. Form có thể được public (link chia sẻ) hoặc internal (chỉ user trong dự án). Dữ liệu submit → thêm dòng mới vào sheet.

**Tại sao cần:** Báo cáo hiện trường từ điện thoại, công nhân/khảo sát nhập liệu không cần vào sheet gốc.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Form Builder
- **Tự động sinh form** từ cấu trúc cột trong sheet
- **Field types:** Text, Number, Dropdown, Date, Checkbox, Contact, File Upload
- **Validation rules:** required, min/max, regex pattern, email
- **UI:** Modal builder trong app — kéo/thả field, xem trước

### 2.2 Form Render
- **Public form:** URL riêng (UUID), không cần đăng nhập
- **Internal form:** Yêu cầu user trong dự án
- **Prefill:** Tự động điền giá trị từ URL params `?field=value`
- **Submit:** Button → validate → gọi Apps Script → thêm row → thông báo

### 2.3 Cấu trúc dữ liệu
```json
{
  "formId": "uuid",
  "sheetId": "sheet-xyz",
  "title": "Báo cáo hiện trường",
  "fields": [
    {"column": "Tên hạng mục", "type": "TEXT", "required": true},
    {"column": "Ngày kiểm tra", "type": "DATE", "required": true},
    {"column": "Người phụ trách", "type": "CONTACT"}
  ],
  "settings": {
    "allowPublic": false,
    "submitMessage": "Cảm ơn!",
    "redirectUrl": ""
  }
}
```

---

## 3. API & BACKEND (Apps Script)

### 3.1 Form Storage
- Sheet `_FORMS` chứa config form (JSON trong ô)
- Sheet `_FORM_SUBMITS_<formId>` chứa dữ liệu submit

### 3.2 Hàm Apps Script
```javascript
function submitForm(formId, data) {
  // Validate fields theo config
  // Tìm sheet đích
  // Thêm dòng mới
  // Log submit
}

function getFormConfig(formId) {
  return JSON.parse(cache.get(formId));
}
```

---

## 4. GIAO DIỆN (Frontend)

- **Form Builder:** Modal với drag-drop field list + preview panel
- **Form Render:** Trang riêng (hoặc modal) hiển thị form
- **Submit Success:** Toast message + tuỳ chọn redirect

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|-----------|---------|
| 1 | Tạo form từ sheet có 5 cột | Form sinh đúng 5 field |
| 2 | Submit form với đủ dữ liệu | Thêm dòng mới vào sheet |
| 3 | Submit thiếu required field | Báo lỗi, không submit |
| 4 | Public form link → người lạ submit | Được (nếu bật public) |
| 5 | Prefill từ URL | Field tự điền sẵn |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `forms/spec.md`
- ✅ Sẵn sàng cho v19 code
