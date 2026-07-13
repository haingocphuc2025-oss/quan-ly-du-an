# SPEC: Automation

**Ngày:** 07/07/2026
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🟢 Đã duyệt — Ban QLDA ký duyệt 07/07/2026

---

## 1. MỤC TIÊU

Hệ thống tự động hoá cho phép người dùng định nghĩa workflow: khi sự kiện X xảy ra (trigger) → thực hiện hành động Y (action). Ví dụ: khi có dòng mới → gửi email thông báo cho người phụ trách.

**Tại sao cần:** Nhắc hạn thẩm định, phê duyệt tự động — sát quy trình 7 bước trong QLDA xây dựng.

---

## 2. MÔ TẢ CHI TIẾT

### 2.1 Workflow Engine

**Triggers:**
| Trigger | Mô tả |
|---------|-------|
| **onNewRow** | Khi thêm dòng mới |
| **onCellEdit** | Khi sửa ô (column cụ thể hoặc bất kỳ) |
| **onSchedule** | Theo lịch (daily, weekly, custom cron) |
| **onFormSubmit** | Khi có form submit |

**Actions:**
| Action | Mô tả |
|--------|-------|
| **sendEmail** | Gửi email (To: contact column / fixed / form field) |
| **updateCell** | Cập nhật giá trị ô (set value, clear, formula) |
| **createTask** | Tạo task mới trong sheet |
| **webhook** | Gọi URL ngoài (POST JSON) |
| **notify** | Thông báo trong app (notification center) |

### 2.2 Cấu trúc workflow
```json
{
  "workflowId": "wf-uuid",
  "name": "Báo hiệu phê duyệt",
  "active": true,
  "trigger": {
    "type": "onNewRow",
    "conditions": [
      {"column": "Trạng thái", "operator": "EQUALS", "value": "Chờ duyệt"}
    ]
  },
  "actions": [
    {
      "type": "sendEmail",
      "config": {
        "to": "FIELD:Người phụ trách",
        "subject": "Cần phê duyệt: {{row.Tên hạng mục}}",
        "body": "Hạng mục {{row.Tên hạng mục}} đang chờ duyệt."
      }
    },
    {
      "type": "notify",
      "config": {
        "message": "Hạng mục mới cần phê duyệt"
      }
    }
  ]
}
```

---

## 3. API & BACKEND (Apps Script)

### 3.1 Storage
- Sheet `_WORKFLOWS` — danh sách workflow config
- Sheet `_WORKFLOW_LOGS` — log thực thi
- Time-based trigger: `ScriptApp.newTrigger()`

### 3.2 Hàm Apps Script
```javascript
function executeWorkflows(eventType, context) {
  // Lấy tất cả workflows active
  // Check trigger + conditions
  // Execute actions
  // Log kết quả
}

function scheduleWorkflow(workflowId, cronString) {
  // Tạo trigger định kỳ
}
```

---

## 4. GIAO DIỆN (Frontend)

- **Workflow Builder:** Modal "If → Then" với dropdown chọn trigger/action
- **Workflow List:** Table hiển thị workflows đang chạy, toggle on/off
- **Log Viewer:** Lịch sử thực thi (success/fail, timestamp)
- **Notification Center:** Badge + dropdown các thông báo

---

## 5. TEST CASES

| # | Test case | Kỳ vọng |
|---|-----------|---------|
| 1 | Tạo workflow onNewRow → send email | Thêm dòng mới → email được gửi |
| 2 | Condition không thoả | Không gửi email |
| 3 | Workflow schedule chạy đúng giờ | Trigger đúng thời điểm |
| 4 | Toggle workflow OFF | Không thực thi nữa |
| 5 | View log → thấy trạng thái | Success/fail rõ ràng |

---

## 6. BÀN GIAO CHO NHÀ THẦU

- ✅ SPEC chi tiết + đầy đủ
- ✅ File tham chiếu: `automation/spec.md`
- ✅ Sẵn sàng cho v19 code
