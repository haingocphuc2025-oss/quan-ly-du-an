# ⚠️ SOP TUÂN THỦ — TƯ VẤN THIẾT KẾ (AI Research)

**Phiên bản:** v1.3
**Ngày:** 07/07/2026
**Người viết:** Ban QLDA (Claude)

---

## 1. KIẾN TRÚC BẮT BUỘC

| Layer | Stack BẮT BUỘC | ❌ KHÔNG DÙNG |
|-------|---------------|--------------|
| **Frontend** | HTML + CSS + Vanilla JS (1 file duy nhất) | React, Vue, Angular, TypeScript |
| **Backend** | Google Apps Script (`doPost`, `doGet`) | REST API server, Node.js, Python Flask |
| **Database** | JSON files trên Google Drive (`data.json`) | Redis, PostgreSQL, MongoDB, MySQL |
| **Realtime** | Polling hoặc direct function call | WebSocket, SSE, Firebase |
| **State** | JS variables / DOM | localStorage, sessionStorage |
| **Build** | Không có build step | Webpack, Vite, npm build |

---

## 2. FORMAT SPEC BẮT BUỘC

### 2.1 Vị trí file

```
✅ ĐÚNG:  SPEC_NEW/<tên-feature>/spec.md
❌ SAI:   SPEC_NEW/SPEC_TenFeature_v1.md   (file loose)
```

### 2.2 Header bắt buộc

```markdown
# SPEC: [Tên feature]

**Ngày:** DD/MM/YYYY
**Người viết:** Tư vấn thiết kế (AI Research)
**Trạng thái:** 🔴 Chưa duyệt — lưu tại SPEC_NEW/, chờ Ban QLDA duyệt
```

### 2.3 Cấu trúc 6 section bắt buộc

```
1. MỤC TIÊU        — Vấn đề, lý do, user story
2. MÔ TẢ CHI TIẾT  — Tính năng, data model, user flow
3. API & BACKEND    — Apps Script functions (signature, params, return)
4. GIAO DIỆN        — HTML component, CSS, JS handler (có code mẫu)
5. TEST CASES       — Tối thiểu 5 case
6. BÀN GIAO         — Checklist sẵn sàng cho nhà thầu
```

---

## 3. QUY TRÌNH BẮT BUỘC

```
Bước 1: Viết SPEC → SPEC_NEW/<feature>/spec.md
Bước 2: Điền biên bản BAN_GIAO.md (5 mục)
Bước 3: Báo Ban QLDA duyệt → Chờ
Bước 4: Ban QLDA chuyển/xóa file — Tư vấn KHÔNG tự làm
```

---

## 4. BIÊN BẢN — 5 MỤC BẮT BUỘC

| Mục | Yêu cầu |
|-----|---------|
| **Ngày bàn giao** | DD/MM/YYYY |
| **1. SPEC Feature** | Tên + đường dẫn file |
| **2. Tóm tắt giải pháp** | 3-5 dòng: làm gì, Apps Script nào, pattern chính |
| **3. Phụ thuộc** | Feature khác, OAuth, Apps Script mới? |
| **4. Test case đề xuất** | 3-5 case chính |
| **5. Cam kết** | ✅ SPEC đầy đủ, đúng stack Apps Script + HTML single-file |

---

## 5. LỖI PHỔ BIẾN

| Lỗi | Hậu quả | Cách tránh |
|-----|---------|------------|
| File loose trong SPEC_NEW/ | Trả lại ngay | Luôn tạo subfolder |
| Tự ghi "Đã duyệt" | Trả lại | Chỉ ghi "Chưa duyệt" |
| Dùng REST API, Redis, React... | Trả lại — sai stack | Kiểm tra bảng mục 1 |
| Thiếu biên bản BAN_GIAO.md | Không nhận duyệt | Viết biên bản trước khi báo |
| Viết nhiều SPEC trùng scope | PM chỉ duyệt 1 | Hỏi PM trước khi viết |

---

## 6. CHECKLIST TRƯỚC KHI BÁO BAN QLDA

- [ ] File tại `SPEC_NEW/<feature>/spec.md`
- [ ] Header "Chưa duyệt"
- [ ] Đủ 6 section
- [ ] Test cases ≥ 5
- [ ] Stack đúng: HTML + Apps Script + Drive JSON
- [ ] Có Apps Script function signature
- [ ] Có HTML/JS code mẫu ≥ 1 snippet
- [ ] BAN_GIAO.md đủ 5 mục
- [ ] Phụ thuộc liệt kê rõ

---

## 7. PHIẾU TRẢ LẠI

### Mẫu

```markdown
#### ❌ TRẢ LẠI: [Tên feature]
| Mục | Nội dung |
|-----|----------|
| **Ngày trả** | DD/MM/YYYY |
| **Lý do** | ... |
| **Yêu cầu sửa** | ... |
```

---

### ❌ TRẢ LẠI: Report Configuration (07/07/2026) — v1.3 CẬP NHẬT YÊU CẦU

| Mục | Nội dung |
|-----|----------|
| **Ngày trả** | 07/07/2026 |
| **File hiện tại** | `SPEC_NEW/report-configuration/SPEC_Report_Configuration_v1.md` |
| **Lỗi 1** | Sai tên file — phải là `spec.md` |
| **Lỗi 2** | Thiếu biên bản BAN_GIAO.md |
| **Lỗi 3** | Kiến trúc sai: REST API, Redis, WebSocket, TypeScript, React — không thuộc stack |
| **Tính năng giữ lại** | ✅ Grouping, Summary, Cross-sheet filter, Column Selector |
| **Yêu cầu kỹ thuật** | Rewrite toàn bộ phần Backend → Apps Script; Frontend → HTML + Vanilla JS |

**Yêu cầu bổ sung — Column Selector (từ PM 07/07/2026):**

> Tham chiếu: Smartsheet Report — nút **"3 Columns"** trên toolbar report

| Chi tiết | Mô tả |
|----------|-------|
| **Nút trigger** | Nút trên toolbar report hiển thị số cột đang bật: `"N Columns"` (ví dụ: "3 Columns") |
| **Dropdown** | Click nút → dropdown checklist tất cả cột có thể hiển thị |
| **Checkbox** | Tick = hiện, bỏ tick = ẩn — áp dụng real-time |
| **Search box** | Có ô tìm kiếm nhanh tên cột trong dropdown |
| **Trạng thái mặc định** | Tất cả cột hiện (tick hết), user tự bỏ bớt |
| **Lưu trạng thái** | Lưu column visibility vào `report.settings.visibleColumns[]` |
| **Code mẫu HTML** | `<button id="rptColumnsBtn">N Columns</button>` — N tự cập nhật theo số cột đang bật |

```javascript
// Cập nhật số trên nút
function updateColumnsBtn() {
  const visible = reportConfig.columns.filter(c => c.visible).length;
  document.getElementById('rptColumnsBtn').textContent = visible + ' Columns';
}

// Toggle cột
function toggleReportColumn(colId, visible) {
  const col = reportConfig.columns.find(c => c.id === colId);
  if (col) {
    col.visible = visible;
    updateColumnsBtn();
    renderReportGrid();
  }
}
```

---

### ❌ TRẢ LẠI: Clear Sheet All Data (07/07/2026)

| Mục | Nội dung |
|-----|----------|
| **Ngày trả** | 07/07/2026 |
| **File** | `SPEC_NEW/clear-sheet-all-data/spec.md` |
| **Lý do** | Quá phức tạp — PM chỉ cần 2 nút đơn giản (Clear Data + Repost Date) |
| **Yêu cầu** | Đóng SPEC này, dùng `clear-data-repost-date` thay thế |

---

### ❌ TRẢ LẠI: Delete Key + Repost Date (07/07/2026)

| Mục | Nội dung |
|-----|----------|
| **Ngày trả** | 07/07/2026 |
| **File** | `SPEC_NEW/delete-key-repost-date/spec.md` |
| **Lỗi 1** | Thiếu biên bản BAN_GIAO.md |
| **Lỗi 2** | Scope trùng 90% với `clear-data-repost-date` |
| **Yêu cầu** | Đóng SPEC này, dùng `clear-data-repost-date` thay thế |

---

### ⏳ CHỜ BIÊN BẢN: Clear Data & Repost Date (07/07/2026)

| Mục | Nội dung |
|-----|----------|
| **Trạng thái** | ⏳ Chờ biên bản — nội dung SPEC ĐẠT |
| **File** | `SPEC_NEW/clear-data-repost-date/spec.md` |
| **Việc cần làm** | Bổ sung biên bản vào `BAN_GIAO.md` (5 mục) → báo Ban QLDA → duyệt ngay |
