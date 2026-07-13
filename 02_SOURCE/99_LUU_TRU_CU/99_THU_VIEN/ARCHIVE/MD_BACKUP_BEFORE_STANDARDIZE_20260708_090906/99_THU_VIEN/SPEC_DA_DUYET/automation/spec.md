# SPEC: Automation

**Ngày:** 07/07/2026  
**Người viết:** Tư vấn thiết kế (AI Research)  
**Trạng thái:** 🔴 Chưa duyệt — chờ Ban QLDA duyệt

---

## 1. MỤC TIÊU

Tạo hệ thống tự động hóa cơ bản cho dự án Web QLDA: workflow triggered bởi sự kiện sheet, xử lý notification cơ bản, và tích hợp task assignment cho construction PM.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Tính năng Smartsheet
cung cấp:
- **Workflow builder:**Template workflow với trigger: onEdit, schedule, form submit
- **Actions:**Gửi email, thông báo Slack, cập nhật sheet
- **Notification center:**Hiển thị trong UI Smartsheet
- **Integration:**Power automates, Zapier (tùy chọn)

### 2.2 Khả năng Apps Script (DO nhà thầu code)
- **Automation engine:**.apps script `onEdit`, `doGet`, `trigger.schedule`
- **Workflow runner:**Chạy tuần tự các actions dựa trên trigger
- **Notification service:**Gửi email, push notification qua Apps Script
- **Task assignment:**Gán task cho users (qua dictionary {taskId: userEmail})
- **Status tracking:**Lưu log workflow execution (sheets ẩn)
- **UI automation:**Hiển thị nút "Automation" trong sidebar

### 2.3 Design Decisions
- **Low-code approach:**Template-driven workflow builder
- **Event-driven:**Hỗ trợ các trigger phổ biến (onEdit, schedule, form submit)
- **Sequential execution:**Workflow step-by-step, rollback khi lỗi
- **User-specific:**Gán task theo user roles (pm, team, guest)
- **Logging:**Audit trail cho mỗi lần chạy workflow
- **Recovery:**Retry mechanism cho failed steps

---

## 3. SPEC CHI TIẾT

### 3.1 Automation Config mở rộng
**Từ SHEET_CONFIG thêm:**
```json
"automation": {
  "enabled": true,
  "workflowTemplates": [
    {
      "id": "email-notif",
      "name": "Gửi email tự động",
      "trigger": "onEdit",
      "condition": "cellChanged == 'status' && newValue == 'completed'",
      "actions": [
        {"type": "sendEmail", "to": "{assignee}", "subject": "Đã hoàn thành", "body": "Task {taskId} đã hoàn thành."},
        {"type": "log", "message": "Gửi email thành công cho {assignee}"}
      ]
    },
    {
      "id": "daily-report",
      "name": "Báo cáo hàng ngày",
      "trigger": "schedule",
      "schedule": "0 9 * * *",
      "actions": [
        {"type": "generateSheet", "sheetId": "s_daily_report", "title": "Daily Progress {date}"},
        {"type": "sendEmail", "to": "quan@company.com", "subject": "Daily Progress", "body": "Report đính kèm"}
      ]
    }
  ],
  "taskAssignments": {
    "taskId": "assigneeEmail"
  },
  "notificationCenter": {
    "enabled": true,
    "panelUrl": "https://app.smartsheet.com/automation-center"
  }
}
```

### 3.2 Data Model
- **Workflow definition:**`{"id": "wf_123", "name": "Email Notify", "trigger": "onEdit", "actions": [...]}`
- **Execution log:**`{"executionId": "exec_456", "workflowId": "wf_123", "timestamp": "2026-07-07T10:00:00Z", "status": "success", "message": "..."}`
- **Task assignment:**`{"taskId": "t789", "assignee": "user@company.com", "status": "pending"}`

### 3.3 UI Components
1. **Automation dashboard:**Nút trong sidebar -> mở panel
2. **Workflow builder:**Kéo-thả node trigger -> action
3. **Workflow list:**Hiển thị templates sẵn có
4. **Execution log panel:**Xem các workflow đã chạy
5. **Task assignment panel:**Gán/nhận task

### 3.4 Automation
- **Workflow creation:**Designer tạo và lưu template
- **Workflow execution:**Trigger khi meet condition
- **Notification delivery:**Gửi email hoặc push
- **Task assignment:**Gán task cho users
- **Logging:**Ghi lại execution history

### 3.5 Test Cases (bắt buộc)
1. **Workflow creation:**Tạo workflow mới, lưu template
2. **Workflow execution:**Trigger workflow, validate actions
3. **Notification delivery:**Kiểm tra email được gửi
4. **Task assignment:**Kiểm tra task assignment
5. **Execution log:**Kiểm tra log

---

## 4. BÀN GIAO CHO NHÀ THẦU

### 4.1 Phụ thuộc
- **Column Types:**Bắt buộc cho automation triggers
- **OAuth apps script:**Để truy cập sheet và gửi email
- **Email service:**Bắt buộc cho notification
- **Scheduler:**Để trigger hàng ngày
- **Storage:**Apps Script Properties cho execution log

### 4.2 Test Kit
- Test workflow creation
- Test workflow execution
- Test notification delivery
- Test task assignment
- Test execution log

### 4.3 Cam kết
- ✅ SPEC đầy đủ và khả thi
- ✅ Tuân thủ Smartsheet/Apps Script
- ✅ Bảo mật

**SPEC automation sẵn sàng cho nhà thầu theo SOP mới.**
