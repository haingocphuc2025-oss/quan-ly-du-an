# SPEC: Publish Report

**Ngày:** 07/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

Thiết kế tính năng **Publish Report** để tạo các trang web công khai an toàn, chống sao chép, truy cập dựa trên vai trò, và có thể nhúng của dữ liệu Smartsheet – phục vụ cho báo cáo, dashboard công khai, và truy cập đặc biệt.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Tính năng Smartsheet
cung cấp:
- **Public Report URL:** `https://app.smartsheet.com/reports/{reportId}`
- **Bảo mật report:**Password, domain, role-based, view-only, embed-only
- **Chức năng:**Xem, tìm kiếm, sắp xếp, lọc, xuất PDF, nhúng vào website
- **Analytics:** Lượt view, thời gian sử dụng, nguồn truy cập
- **Cập nhật động:**Khi sheet thay đổi, report cập nhật (theo lịch hoặc on-demand)

### 2.2 Khả năng Apps Script (DO nhà thầu code)
- **Report generator:** Tái tạo cấu trúc report từ sheet metadata, cấu hình bảo mật
- **Authentication manager:**Xác thực user, session, cookie, timeout
- **Authorization layer:**Kiểm tra quyền truy cập trước khi serve data
- **Password-protected reports:**Hash password, xác thực
- **Domain white-list:**Config các domain được phép truy cập
- **Role-based access:**Admin, viewer, commenter, guest từ sheet permissions
- **Report renderer:**HTML/JSON response report data
- **Scheduler:**Cron job hoặc onEdit trigger để fetch data từ sheet

### 2.3 Design Decisions
- **Hosting report:**Domain riêng, HTTPS, Static Files
- **Auth flow:**OAuth SSO, Username/Password, hoặc Domain based
- **Session management:**Secure cookie, expiration, logout
- **Responsive design:**Desktop, tablet, mobile
- **Performance:**Caching data, lazy load rows, CDN
- **Analytics tracking:**Google Analytics, custom event

---

## 3. SPEC CHI TIẾT

### 3.1 Report Config mở rộng
**Từ SHEET_CONFIG thêm:**
```json
"publishReport": {
  "enabled": true,
  "urlSlug": "report-name-123",
  "password": "hashedPassword",
  "allowedDomains": ["company.com", "partner.com"],
  "allowedRoles": ["admin", "manager", "viewer", "commenter"],
  "updater": "onEdit",    // onEdit, schedule, manual
  "refreshIntervalMinutes": 60,
  "embedEnabled": true,
  "watermarkEnabled": true,
  "downloadEnabled": true
}
```

### 3.2 Data Model
- **Report Meta:**`{"id": "r123", "name": "Project Status", "sheetId": "s456", "config": {...}}`
- **Access Rule:**`{"userEmail": "a@domain.com", "role": "viewer", "grantedAt": "2026-07-07T10:00:00Z"}`
- **Password Hash:**`bcrypt(password, salt)` lưu trong Secret Manager

### 3.3 UI Components
1. **Login screen:**SSO, username/password, reset password
2. **Report view container:**Report grid, search, filter, pagination
3. **Access denied screen:**Thông báo rõ ràng, liên hệ admin
4. **Export controls:**Nút PDF, Excel, print
5. **Setting panel:**Thay password, cập nhật domain, gán role (chỉ admin)

### 3.4 Automation
- **Report creation:**Dashboard “Tạo report mới”
- **Auto-permission:**Khi user thêm vào sheet, tự động gán quyền report
- **Password change:**Cập nhật hash
- **Refresh schedule:**Cron job `every 6h` từ sheet

### 3.5 Test Cases (bắt buộc)
1. **Report access:**Truy cập với password, domain, role
2. **Unauthorized access:**Chặn truy cập
3. **Export functionality:**Xuất PDF/HTML
4. **Permission assignment:**Gán role, domain whitelist
5. **Report update:**Sheet thay đổi → report cập nhật

---

## 4. BÀN GIAO CHO NHÀ THẦU

### 4.1 Phụ thuộc
- **Column Types:**Bắt buộc cho report columns
- **OAuth apps script:**Để truy cập sheet
- **Authentication library:**JWT/cookie, password hash
- **Secret Manager:**Lưu password hash an toàn
- **Schedule:**Apps Script trigger `every 6h`

### 4.2 Test Kit
- Test report access cho từng permission type
- Test password-protected report
- Test domain restriction
- Test role-based access
- Test export functionality
- Test report update scheduling

### 4.3 Cam kết
- ✅ SPEC đầy đủ chi tiết
- ✅ Bảo mật và khả thi
- ✅ Tuân thủ Smartsheet/Apps Script

**File này sẵn sàng cho nhà thầu theo SOP mới.**
