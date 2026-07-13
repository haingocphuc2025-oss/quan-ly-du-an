# SPEC: Forms

**Ngày:** 07/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

Thiết kế Forms cho phép người dùng điền thông tin một cách trực quan, validation, gửi vào sheet hiện tại, và prefill thông tin từ dòng hiện tại hoặc query param.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Khả năng Smartsheet
- **Form URL tự động** – `https://app.smartsheet.com/s/[sheetId]/forms`
- **Các field types:** Text, Number, Email, Date, Dropdown, Checkbox, File upload (mỗi field lưu vào cột)
- **Validation:** bắt buộc, length, regex (email, phone)
- **Success page** – link đến sheet với link ra
- **Email notifications** – mỗi khi form được nộp, gửi email tới người submit hoặc specific email list
- **Webhook** – tùy chọn payload gửi đến endpoint

### 2.2 Khả năng Apps Script (DO nhà thầu code)
- **Form HTML** – generator từ sheet metadata (column types, required)
- **Client-side validation** – real-time, điền lỗi rõ ràng
- **Submit handler** – Apps Script `doPost` – parse form, thêm row vào sheet, gửi email notification
- **Prefill** – `?field=value` query param
- **File upload** – basic handling cho upload lên Google Drive, lưu fileId vào sheet
- **Cross-sheet form** – form từ sheet A, lưu vào sheet B (tùy project choice)
- **Custom button** – "Open Form" button trong UI (native UI HTML + dialog)

### 2.3 Design Decisions
- **Single-page form** – modal, không cần chuyển trang
- **Responsive** – di động, điều chỉnh layout theo kích thước màn hình
- **Theme** – chủ đề project (primary color, font) từ `THEME.json`
- **Accessibility** – ARIA labels, focus management, keyboard navigation
- **Internationalization** – text/content service dễ dịch (JSON)

---

## 3. SPEC CHI TIẾT

### 3.1 Form Config mở rộng
**Từ SHEET_CONFIG thêm fields:**
```json
"forms": {
  "enabled": true,
  "formUrlTemplate": "https://app.smartsheet.com/s/{sheetId}/forms",
  "submitAction": "appendRow",  // appendRow, updateRowByKey, cloneRow
  "autoEmail": true,
  "autoEmailRecipients": ["manager@domain.com"],
  "fileUpload": true,
  "prefill": true,
  "validation": {"required": true, "minLength": 1, "maxLength": 500}
}
```

### 3.2 Data Model
- **Form Fields:** `[{id: "col1", type: "text", label: "Họ", required: true, placeholder: "VD: Nguyễn", validation: {...}}]`
- **Form State:** lưu trong session storage (client-side) cho prefill
- **Submission Payload:** `{fieldId: value, ...}`
- **File Upload:** `{fileId: "123", name: "file.pdf", type: "application/pdf"}`

### 3.3 UI Components
1. **Form container:** modal, backdrop, ESC close
2. **Field renderer:**
   - Text/Number/Email input
   - Date picker (native input type="date")
   - Dropdown + search (từ list known values)
   - Checkbox (Toggle)
   - File upload (HTML input type="file")
3. **Validation UI:** error tooltip ngay dưới field
4. **Submit button:** loading state, success/error message
5. **Prefill loader:** hiển thị spinner trong lúc tải data từ query param

### 3.4 Automation
- **Form submission trigger:** bất cứ lúc nào form được submit, kích hoạt `OnFormSubmit()` trong Apps Script
- **Actions:**
  - Thêm row mới (hoặc cập nhật)
  - Gửi email notification (`MailApp.sendEmail`)
  - Gọi webhook (tùy chọn)
  - Ghi log submission

### 3.5 Test Cases (bắt buộc)
1. **Form access** – truy cập form từ sheet, render UI
2. **Field validation** – bắt buộc, length, email format
3. **Submit thành công** – row thêm đúng, email notification
4. **Prefill** – query param → field prefill
5. **File upload** – upload file -> lưu fileId, hiển thị name

---

## 4. BÀN GIAO CHO NHÀ THẦU

### 4.1 Phụ thuộc
- **Column Types** – bắt buộc – form fields map theo Column.type
- **OAuth apps script** – pre-installed, chạy như service
- **Form UI framework** – lightweight, không phụ thuộc bên ngoài
- **File upload** – sử dụng Google Drive API, giải quyết permission

### 4.2 Test Kit
- Test form rendering cho mỗi column type
- Test validation cho từng type field
- Test form submission cho read/write sheet
- Test prefill functionality
- Test file upload handling

### 4.3 Cam kết
- ✅ SPEC đầy đủ chi tiết, code-friendly
- ✅ Theo chuẩn Smartsheet/Apps Script
- ✅ Khả thi như mô tả
- ✅ sẵn sàng cho nhà thầu code
