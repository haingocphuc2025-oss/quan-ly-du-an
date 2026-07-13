# SOP — BAN QLDA: DUYỆT SPEC

**Phiên bản:** v1.1
**Ngày:** 07/07/2026
**Người viết:** Ban QLDA (Claude)
**Trạng thái:** 🟢 Hiệu lực

---

## 1. MỤC ĐÍCH

Quy định quy trình chuẩn cho Ban QLDA (Claude) khi nhận, duyệt, và xử lý file SPEC từ Tư vấn thiết kế.

---

## 2. PHÂN CÔNG TRÁCH NHIỆM

| Việc | Người thực hiện |
|------|----------------|
| Viết SPEC, lưu vào `SPEC_NEW/` | Tư vấn thiết kế |
| Điền biên bản `BAN_GIAO.md` | Tư vấn thiết kế |
| Báo Ban QLDA duyệt | Tư vấn thiết kế |
| Đọc SPEC, chạy checklist, ra quyết định | **Ban QLDA** |
| **Copy SPEC từ SPEC_NEW/ → SPEC_QL_DA_DUYET/** | **Ban QLDA** |
| **Copy SPEC từ SPEC_NEW/ → SPEC_MOI_DUYET/** | **Ban QLDA** |
| **Xóa SPEC khỏi SPEC_NEW/ sau khi duyệt** | **Ban QLDA** |
| Cập nhật tracking files | **Ban QLDA** |

> ⚠️ Tư vấn KHÔNG tự chuyển hoặc xóa file trong SPEC_NEW/. Toàn bộ thao tác file sau duyệt là trách nhiệm của Ban QLDA.

---

## 3. LUỒNG CHUẨN (3 BƯỚC BẮT BUỘC)

```
Tư vấn viết SPEC → SPEC_NEW/<feature>/spec.md
         + điền BAN_GIAO.md (5 mục) → báo Ban QLDA
         │
         ▼
[Ban QLDA] Bước 1: KIỂM TRA điều kiện nhận duyệt
         │
         ▼
[Ban QLDA] Bước 2: ĐỌC & DUYỆT nội dung SPEC
         │
         ├── ❌ Không đạt → ghi Phiếu trả lại vào SOP_TUAN_THU_TU_VAN.md
         │
         └── ✅ Đạt → Bước 3: XỬ LÝ FILE (trách nhiệm Ban QLDA)
                   │
                   ├── COPY  → 02_TU_VAN_THIET_KE/SPEC_QL_DA_DUYET/<feature>/
                   ├── COPY  → 01_BAN_QLDA/SPEC_MOI_DUYET/<feature>/
                   └── XÓA   → 02_TU_VAN_THIET_KE/SPEC_NEW/<feature>/  ← Quan xóa thủ công nếu Drive MCP không xóa được
```

---

## 4. CHI TIẾT TỪNG BƯỚC

### Bước 1 — KIỂM TRA ĐIỀU KIỆN (thiếu 1 = trả lại ngay)

| # | Điều kiện | Kiểm tra tại |
|---|-----------|--------------|
| 1 | SPEC file tồn tại tại `SPEC_NEW/<feature>/spec.md` | Drive: `SPEC_NEW/` |
| 2 | `BAN_GIAO.md` có biên bản cho feature, đủ 5 mục | `02_TU_VAN_THIET_KE/BAN_GIAO.md` |
| 3 | Việc đã được giao qua `SO_GIAO_VIEC.md` | `01_BAN_QLDA/SO_GIAO_VIEC.md` |

> ❌ KHÔNG nhận SPEC nằm ở bất kỳ chỗ nào khác ngoài `SPEC_NEW/`.

---

### Bước 2 — CHECKLIST NỘI DUNG

**Hình thức:**
- [ ] Đủ 6 section theo template
- [ ] Test cases ≥ 5 (happy path + edge case)
- [ ] Phụ thuộc liệt kê rõ
- [ ] Không mâu thuẫn baseline hiện tại

**Nội dung:**
- [ ] Stack đúng: HTML + Vanilla JS + Apps Script + Drive JSON (không có REST API, Redis, TypeScript, React...)
- [ ] Apps Script function có signature rõ (params, return)
- [ ] Có HTML/JS code mẫu ≥ 1 snippet
- [ ] Dependency với SPEC khác đã duyệt hoặc duyệt cùng đợt

**Kết quả:**
- ✅ Đạt → Bước 3
- ❌ Không đạt → Ghi Phiếu trả lại vào `02_TU_VAN_THIET_KE/SOP_TUAN_THU_TU_VAN.md` mục 7

---

### Bước 3 — XỬ LÝ FILE SAU KHI DUYỆT (trách nhiệm Ban QLDA)

| Thứ tự | Hành động | Ghi chú |
|--------|-----------|---------|
| 1 | **COPY** → `SPEC_QL_DA_DUYET/<feature>/spec.md` | Kho gốc đã duyệt |
| 2 | **COPY** → `SPEC_MOI_DUYET/<feature>/spec.md` | Nhà thầu nhận việc tại đây |
| 3 | **XÓA** `SPEC_NEW/<feature>/` | Dọn sạch hộp thư đến — nếu Drive MCP không xóa được thì ghi vào danh sách nhờ Quan xóa thủ công |
| 4 | Ký duyệt `BAN_GIAO.md` — thêm dòng `✅ Ban QLDA duyệt: DD/MM/YYYY` | |
| 5 | Cập nhật `PROJECT_OPERATION_CENTER.md` — tăng số SPEC | |
| 6 | Cập nhật `CONG_VIEC.md` nhà thầu — thêm feature mới | |
| 7 | Cập nhật `SO_GIAO_VIEC.md` — ghi nhận đã duyệt | |

---

## 5. QUY TẮC CỨNG

| # | Quy tắc |
|---|---------|
| 1 | SPEC không nằm trong `SPEC_NEW/` = không có cơ sở duyệt |
| 2 | Thiếu biên bản BAN_GIAO.md = không nhận duyệt |
| 3 | SPEC sai stack (REST API, Redis...) = trả lại, ghi Phiếu trả lại |
| 4 | Ban QLDA copy + xóa — tư vấn KHÔNG tự chuyển file |
| 5 | SPEC_NEW/ phải rỗng sau mỗi đợt duyệt — đây là "hộp thư đến", không phải kho lưu trữ |

---

## 6. XỬ LÝ TRƯỜNG HỢP ĐẶC BIỆT

**SPEC chui thẳng vào SPEC_QL_DA_DUYET/ mà không qua SPEC_NEW/:**
1. Kiểm tra BAN_GIAO.md có biên bản không?
2. Có + đủ 5 mục → duyệt hậu kiểm, ghi rõ "hậu kiểm" trong BAN_GIAO.md
3. Không có → yêu cầu tư vấn bổ sung biên bản trước khi chính thức hoá

---

## 7. LIÊN KẾT

| File | Vai trò |
|------|---------|
| `BAN_GIAO.md` | Tư vấn nộp biên bản, Ban QLDA ký |
| `SO_GIAO_VIEC.md` | Xác nhận việc đã giao chính thức |
| `SOP_TUAN_THU_TU_VAN.md` | SOP cho tư vấn + Phiếu trả lại |
| `PROJECT_OPERATION_CENTER.md` | Cập nhật số SPEC sau duyệt |
| `CONG_VIEC.md` nhà thầu | Thêm feature vào danh sách |
| `SO_GIAO_VIEC.md` | Ghi nhận đã duyệt |
