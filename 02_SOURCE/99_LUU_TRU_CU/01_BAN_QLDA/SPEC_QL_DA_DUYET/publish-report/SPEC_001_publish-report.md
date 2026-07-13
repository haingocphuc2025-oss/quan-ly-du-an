# SPEC: Publish Report

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🟢 Đã duyệt — Ban QLDA ký duyệt 07/07/2026

---

## 1. MỤC TIÊU

Tính năng Publish Report cho phép chủ sở hữu sheet tạo một link xem công khai (read-only) của report/sheet. Link này có thể gửi cho bất kỳ ai — không cần tài khoản — dữ liệu luôn được cập nhật real-time.

**Tại sao cần:** Thay thế phân quyền chia sẻ phức tạp — chủ đầu tư chỉ cần link xem, không sửa được dữ liệu.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Publish Settings
| Tính năng | Mô tả |
|-----------|-------|
| **UUID link** | Mỗi report được publish với ID duy nhất (chống IDOR) |
| **Security** | Tuỳ chọn: public, password, domain-restrict |
| **Mode** | Read-only tuyệt đối — không có nút sửa/xoá |
| **Auto-refresh** | Dữ liệu luôn tươi (load từ sheet gốc mỗi lần truy cập) |
| **Revoke** | Chủ sở hữu có thể tắt publish bất kỳ lúc nào |

### 2.2 Cấu trúc dữ liệu
```json
{
  "publishId": "uuid-v4",
  "reportId": "report-xyz",
  "sheetId": "sheet-abc",
  "publishedBy": "user@example.com",
  "createdAt": "2026-07-07T10:00:00Z",
  "settings": {
    "password": null,
    "allowedDomains": [],
    "showToolbar": false,
    "showRowNumbers": true
  },
  "active": true
}
```

---

## 3. API & BACKEND (Apps Script)

### 3.1 Storage
- Sheet `_PUBLISHED_REPORTS` chứa danh sách publish
- Cache dùng `LockService` chống race condition

### 3.2 Hàm Apps Script
```javascript
function publishReport(reportId, settings) {
  // Tạo UUID + lưu config
}

function getPublishedData(publishId) {
  // Validate active + password
  // Query sheet gốc
  // Trả về dữ liệu read-only
}

function revokePublish(publishId) {
  // Set active = false
}
```

---

## 4. GIAO DIỆN (Frontend)

- **Publish modal:** Nút "Publish" trên toolbar → modal cấu hình
- **Published link:** Hiển thị URL + copy button + QR code
- **Published view:** Trang riêng, chỉ hiển thị bảng, không có edit controls
- **Revoke:** Nút "Unpublish" trong Settings

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|-----------|---------|
| 1 | Publish report → copy link → mở ở tab ẩn danh | Xem được dữ liệu |
| 2 | Sửa dữ liệu trong sheet gốc → refresh published view | Dữ liệu đã cập nhật |
| 3 | Tắt publish → mở lại link cũ | Báo lỗi "Report not available" |
| 4 | Bật password → nhập sai → từ chối | Không xem được |
| 5 | Published view → thử sửa số liệu | Không có nút sửa |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `publish-report/spec.md`
- ✅ Sẵn sàng cho v19 code
