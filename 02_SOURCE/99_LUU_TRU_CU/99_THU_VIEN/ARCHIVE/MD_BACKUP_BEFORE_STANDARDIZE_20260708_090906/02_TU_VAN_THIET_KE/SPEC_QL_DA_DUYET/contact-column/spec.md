# SPEC: Contact Column + Người phụ trách

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🟢 Đã duyệt — Ban QLDA ký duyệt 07/07/2026

---

## 1. MỤC TIÊU

Tính năng Contact Column cho phép người dùng gán một người phụ trách (hoặc nhiều người) vào mỗi dòng trong sheet. Dữ liệu được lưu dưới dạng `CONTACT_LIST` (name + email), hỗ trợ picker UI, validation, automation, và form prefill.

**Tại sao cần:** Trong QLDA xây dựng, mỗi đầu việc cần gán người phụ trách rõ ràng — "ai làm việc gì".

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Cấu trúc Contact Column
- **Kiểu lưu trữ:** JSON object `{name: string, email: string}` (single) hoặc `[{name, email}]` (multi)
- **Picker UI:** dropdown/modal hiển thị danh sách contacts từ danh bạ dự án
- **Validation:** email hợp lệ, không trùng tên (trong cùng ô), tối đa N contacts

### 2.2 Column Config
```json
{
  "type": "CONTACT_LIST",
  "allowMultiple": true,
  "maxContacts": 5,
  "knownContacts": [
    {"name": "Quân Trinh", "email": "quan@example.com"},
    {"name": "Nguyễn Văn A", "email": "vana@example.com"}
  ]
}
```

### 2.3 Tính năng chính
| Tính năng | Mô tả | Yêu cầu UI |
|-----------|-------|-----------|
| **Single picker** | Chọn 1 contact từ danh sách | Dropdown có search |
| **Multi-picker** | Chọn nhiều contacts, hiển thị chips | Chips + dropdown |
| **Form field** | Tích hợp với Forms → prefill | Form field type = contact |
| **Automation recipient** | Dùng contact trong trigger email | Automation action |
| **Import CSV** | Đọc name, email từ CSV | Parse + validate |

---

## 3. API & BACKEND (Apps Script)

### 3.1 Lưu trữ
- Danh bạ dự án: sheet ẩn `_CONTACTS` với cột `name`, `email`, `phone`
- Mỗi ô Contact: lưu JSON string (dùng `SpreadsheetApp`)

### 3.2 Hàm Apps Script
```javascript
function getProjectContacts() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('_CONTACTS');
  return sheet.getDataRange().getValues().map(row => ({
    name: row[0],
    email: row[1]
  }));
}

function setContactCell(sheetId, row, col, contacts) {
  // Validate + lưu JSON
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## 4. GIAO DIỆN (Frontend)

### 4.1 Contact Picker Modal
- Ô input có search + dropdown
- Hiển thị danh sách contacts với avatar (chữ cái đầu)
- Multi-select: hiển thị chips màu, có nút xoá
- Nút "Thêm mới" → form nhập name + email

### 4.2 Hiển thị trong ô
- Single: `👤 Tên (email)` — click vào mở picker
- Multi: `👤 Tên1, +2` — hover/chip view

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|-----------|---------|
| 1 | Chọn 1 contact từ dropdown | Ô hiển thị đúng tên + email |
| 2 | Chọn nhiều contacts (multi) | Chips hiển thị, xoá được |
| 3 | Nhập email không hợp lệ | Báo lỗi validation |
| 4 | Import CSV có cột contact | Parse đúng |
| 5 | Form submit với contact field | Lưu đúng định dạng |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `contact-column/spec.md`
- ✅ Sẵn sàng cho v19 code
