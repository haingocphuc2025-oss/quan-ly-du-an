# SPEC: Contact Column + Người phụ trách

**Ngày:** 07/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

Thêm kiểu cột *CONTACT COLUMN* — lưu liên lạc người phụ trách (name + email), với tính năng picker, validation, và sử dụng trong Automation recipient.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Tính năng Smartsheet
cung cấp sẵn:
- **Kiểu cột:** `CONTACT_LIST` – lưu JSON object `{name: string, email: string}` trong ô
- **UI picker:** modal chọn từ Contact List cấp account, hoặc "Current User" (email của người đang đăng nhập)
- **Nhiều giá trị:** có thể bật `allowMultiple` – chip pills, tối đa theo giới hạn column
- **Automation:** Support "When a date is reached" / "When rows change" triggers – recipient select column CONTACT LIST
- **Form field:** render email input + contact picker, prefill qua `?contact=email@domain.com`
- **API:** `Column.type = "CONTACT_LIST"`, `Column.contactOptions` danh sách cho phép, `Cell.value` = object hoặc array JSON

### 2.2 Khả năng Apps Script (DO — chỉ nhà thầu code)
có thể tự làm:
- **Lưu `{name, email}` trong cell** dưới dạng JSON string
- **Picker từ known contacts** – dropdown + datalist known cho project
- **"Current User" picker** – lấy `Session.getActiveUser().getEmail()` + tên
- **Validation format** – regex email + warning "không có trong danh sách"
- **Multi-contact** – array JSON `[{name,email},...]`
- **Automation recipient** – đọc cell contact column – extract email – `MailApp.sendEmail`
- **Form field** – email input + datalist known contacts

### 2.3 Quyết định Design App
Khác biệt chính so với Smartsheet:
- **Contact Directory:** cấp project/file – lưu trong `data.json` project, không có directory cấp account
- **Multi-contact per cell:** được phép (giá trị cao cho construction multiple stakeholders)
- **Picker UI:** dropdown + chips (nhẹ, mobile-friendly)
- **Validation:** email format only + warning "Chưa có trong danh sách"

---

## 3. SPEC CHI TIẾT ---

### 3.1 Column Config mở rộng
Mở rộng **SHEET_COLUMN_CONFIG** với type: `CONTACT_LIST`
- `allowMultiple: boolean` (default false)
- `knownContacts: [{name, email}]` – nạp từ `data.json` project

### 3.2 Data model (cell value)
- **Single:** `{"name":"Nguyễn Văn A","email":"a@xyz.com"}`
- **Multiple:** `[{"name":"A","email":"a@x"},{"name":"B","email":"b@y"}]`
- **Empty:** `null` hoặc `""`

### 3.3 UI Component
1. **Cell renderer:** hiển thị tên (tooltip email); multi – chip pills
2. **Cell editor:**
   - Input email (type=email) + datalist known contacts
   - Nút "Chọn từ danh sách" – modal checkbox list known contacts
   - Nút "Tôi" – điền `Session.getActiveUser().getEmail()`
   - allowMultiple – chip input (multi-select)
3. **Column header menu:** "Quản lý danh sách liên hệ" – CRUD knownContacts

### 3.4 Automation integration
- Trigger "Alert when date reached" / "When row changes" – option "Gửi cho người trong cột [Contact Column]"
- Logic: đọc cell contact column – extract email(s) – `MailApp.sendEmail`

### 3.5 Form field
- Render: email input + datalist known contacts
- Prefill: `?contact=email@domain.com`
- Submit: lưu object contact vào cell

### 3.6 Test cases (bắt buộc)
1. **Single contact:** chọn từ danh sách, gõ tay, "Tôi", validation email sai
2. **Multi-contact:** thêm/xóa chip, tối đa 10/ô
3. **Automation:** trigger – gửi mail đúng email trong contact column
4. **Form submit:** prefill contact, submit – cell lưu object đúng
5. **Import CSV:** map cột email – contact object (tự lookup knownContacts)

---

## 4. BÀN GIAO CHO NHÀ THẦU

### 4.1 Phụ thuộc
- **Nâng cấp Column Types** – `SHEET_COLUMN_CONFIG` mở rộng type
- **Apps Script service** – backend Apps Script khả thi
- **Form builder** – stack form builder ? (tự code)

### 4.2 Test Kit đề xuất
- Test single contact picker, multi contact, automation recipient, form prefill, import CSV

### 4.3 Cam kết
- ✅ SPEC đầy đủ chi tiết
- ✅ Theo chuẩn Smartsheet/Apps Script
- ✅ Sẵn sàng cho nhà thầu code
